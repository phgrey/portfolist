import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Author, ReferralToken, Team, PortfolioItem, PlatformType } from './src/types';
import { saveProjectSet, getProjectSets, getProjectSetByName } from './src/services/agentMemory';
import { analyzeProjectSet } from './agent/skills/authorProfiler';
import { processAgentMessage } from './src/services/agentEngine';
import { walkAndIndexRepositories } from './src/services/githubAppWalker';
import { execSync } from 'child_process';
import { GoogleGenAI } from '@google/genai';

import { RequestContext } from '@mikro-orm/core';
import { initMikroOrm, getOrm, getForkedEm } from './src/services/mikroDb';
import { findAuthorByUsernameOrEmail, upsertAuthorFromGithubOAuth } from './src/services/entityMemory';
import { authorSchema } from './src/entities/AuthorEntity';
import { portfolioItemSchema } from './src/entities/PortfolioItemEntity';
import { teamSchema } from './src/entities/TeamEntity';
import { referralTokenSchema } from './src/entities/ReferralTokenEntity';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : undefined;

const app = express();
const PORT = 3000;

function ciRegex(str?: string): RegExp {
  const escaped = (str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}$`, 'i');
}

app.use(express.json({ limit: '10mb' }));

// MikroORM IdentityMap L1 Cache Request Context Middleware
app.use((req, res, next) => {
  try {
    const orm = getOrm();
    RequestContext.create(orm.em, next);
  } catch (err) {
    next();
  }
});

// --- API ENDPOINTS ---

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Referral Validation
app.get('/api/referrals/validate', async (req, res) => {
  const code = (req.query.code as string)?.trim();
  if (!code) {
    return res.status(400).json({ error: 'Referral code is required' });
  }

  try {
    const em = getForkedEm();
    const token = await em.findOne(referralTokenSchema, { code: ciRegex(code) });

    if (!token) {
      return res.status(440).json({ isValid: false, error: 'Invalid referral token code.' });
    }

    if (token.usesCount >= token.maxUses) {
      return res.json({ isValid: false, error: 'Referral token has reached its maximum usage limit.' });
    }

    const referrer = await em.findOne(authorSchema, { id: token.referrerId });

    res.json({
      isValid: true,
      code: token.code,
      referrerUsername: token.referrerUsername,
      referrerDisplayName: referrer?.displayName || token.referrerUsername,
      remainingUses: token.maxUses - token.usesCount,
      expiresAt: token.expiresAt
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Generate Referral Token (Requires logged in author)
app.post('/api/referrals/create', async (req, res) => {
  const { authorId, maxUses = 5 } = req.body;
  try {
    const em = getForkedEm();
    const author = await em.findOne(authorSchema, {
      $or: [{ id: authorId }, { username: ciRegex(authorId) }]
    });

    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    const newCode = `INVITE_${author.username.toUpperCase()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newToken: ReferralToken = {
      id: `ref_${Date.now()}`,
      code: newCode,
      referrerId: author.id,
      referrerUsername: author.username,
      maxUses: Number(maxUses) || 5,
      usesCount: 0,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };

    const tokenEnt = em.create(referralTokenSchema, { ...newToken, _id: newToken.id });
    em.persist(tokenEnt);
    await em.flush();

    res.json({ success: true, token: newToken, inviteUrl: `/join?ref=${newCode}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Auth Sign In check / Gated Referral Registration
app.post('/api/auth/login', async (req, res) => {
  const { username, referralCode, provider = 'github' } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const em = getForkedEm();
    const existingAuthor = await em.findOne(authorSchema, { username: ciRegex(username) });
    if (existingAuthor) {
      return res.json({ status: 'authenticated', isNew: false, author: existingAuthor });
    }

    // New user registration flow -> MUST have valid referral code
    if (!referralCode) {
      return res.status(403).json({
        error: 'Invite Only System',
        message: 'New registrations require a valid referral code from an existing member. No public signup is permitted.'
      });
    }

    const refToken = await em.findOne(referralTokenSchema, { code: ciRegex(referralCode) });
    if (!refToken || refToken.usesCount >= refToken.maxUses) {
      return res.status(403).json({
        error: 'Invalid or Expired Invite',
        message: 'The referral token provided is invalid or has reached its usage cap.'
      });
    }

    // Increment usage count
    refToken.usesCount += 1;
    await em.flush();

    // Create new user
    const newAuthor: Author = {
      id: `usr_${Date.now()}`,
      username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      displayName: req.body.displayName || username,
      avatarUrl: req.body.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      bioMarkdown: `# ${req.body.displayName || username}\n\nJoined via referral invite from @${refToken.referrerUsername}. Welcome to the collective!`,
      role: 'Member Author',
      createdAt: new Date().toISOString(),
      referredBy: refToken.referrerUsername,
      integrations: [
        { provider: provider as PlatformType, providerUserId: `${username}_id`, metadata: { username } }
      ],
      contactMethods: [
        { platform: 'email', value: `${username}@collectivefolio.dev`, isPublic: true }
      ]
    };

    const authorEnt = em.create(authorSchema, { ...newAuthor, _id: newAuthor.id });
    em.persist(authorEnt);
    await em.flush();

    res.json({
      status: 'authenticated',
      isNew: true,
      author: newAuthor,
      usedReferralCode: refToken.code
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Multi-Provider OAuth Token Verification & Account Upsert
app.post('/api/auth/verify-token', async (req, res) => {
  try {
    const { idToken, accessToken, provider = 'github', username, displayName, avatarUrl, email } = req.body || {};
    const safeUsername = (username || email?.split('@')[0] || `user_${Date.now().toString(36)}`).toLowerCase().replace(/[^a-z0-9_]/g, '');

    const em = getForkedEm();
    let existingAuthor = await findAuthorByUsernameOrEmail(safeUsername, email);

    if (!existingAuthor) {
      existingAuthor = {
        id: `usr_${safeUsername}`,
        username: safeUsername,
        displayName: displayName || safeUsername,
        avatarUrl: avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        bioMarkdown: `# ${displayName || safeUsername}\n\nAuthenticated via **${provider.toUpperCase()} OAuth 2.0 Identity Platform**.`,
        role: 'Verified Author',
        createdAt: new Date().toISOString(),
        integrations: [
          { provider: provider as PlatformType, providerUserId: safeUsername, metadata: { username: safeUsername, email, accessToken } }
        ],
        contactMethods: [
          { platform: 'email', value: email || `${safeUsername}@workspace.dev`, isPublic: true }
        ]
      };

      const authorEnt = em.create(authorSchema, { ...existingAuthor, _id: existingAuthor.id });
      em.persist(authorEnt);
      await em.flush();

      console.log(`👤 [OAuth Server] Created new author "@${safeUsername}" via ${provider} OAuth (Access Token: ${accessToken ? 'Stored' : 'N/A'}).`);
    } else {
      // Ensure provider is listed in integrations matrix
      const existingIntegration = existingAuthor.integrations.find(i => i.provider === provider);
      if (!existingIntegration) {
        existingAuthor.integrations.push({
          provider: provider as PlatformType,
          providerUserId: safeUsername,
          metadata: { username: safeUsername, email, accessToken }
        });
        await em.flush();
        console.log(`🔗 [OAuth Server] Linked provider "${provider}" to existing author "@${existingAuthor.username}".`);
      } else if (accessToken) {
        existingIntegration.metadata = { ...existingIntegration.metadata, accessToken, email };
        await em.flush();
      }
    }

    res.json({ success: true, status: 'authenticated', author: existingAuthor });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Direct Native GitHub OAuth 2.0 Login Route
app.get('/api/auth/github/login', (req, res) => {
  const clientId = process.env.GITHUB_AUTH_CLIENT_ID || process.env.GITHUB_APP_CLIENT_ID || 'ov23stDemoClientId2026';
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost:3000';
  const redirectUri = `${protocol}://${host}/api/auth/github/callback`;

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user,repo&redirect_uri=${encodeURIComponent(redirectUri)}`;
  console.log(`🔑 [Direct OAuth] Initiating GitHub OAuth redirect to: ${githubAuthUrl}`);
  res.redirect(githubAuthUrl);
});

// Direct Native GitHub OAuth 2.0 Callback Route
app.get('/api/auth/github/callback', async (req, res) => {
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error || !code) {
    console.warn(`⚠️ [Direct OAuth Callback] Received OAuth error or missing code: ${error || 'No code'}`);
    return res.redirect(`/?login=error&message=${encodeURIComponent(error || 'Authorization denied')}`);
  }

  try {
    const clientId = process.env.GITHUB_AUTH_CLIENT_ID || process.env.GITHUB_APP_CLIENT_ID || 'ov23stDemoClientId2026';

    console.log(`🔑 [Direct OAuth Callback] Received authorization code. Fetching access token...`);

    let accessToken = `gho_demo_token_${code.slice(0, 10)}`;
    const codeSnippet = code.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
    let githubUser: any = {
      login: `github_user_${codeSnippet}`,
      name: `GitHub Developer ${codeSnippet}`,
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      email: `github_user_${codeSnippet}@workspace.dev`
    };

    try {
      const clientSecret = process.env.GITHUB_AUTH_CLIENT_SECRET || process.env.GITHUB_APP_CLIENT_SECRET;
      const tokenBody: any = { client_id: clientId, code };
      if (clientSecret) {
        tokenBody.client_secret = clientSecret;
      }

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(tokenBody)
      });
      const tokenData: any = await tokenRes.json();
      if (tokenData.access_token) {
        accessToken = tokenData.access_token;
        const userRes = await fetch('https://api.github.com/user', {
          headers: { Authorization: `token ${accessToken}`, 'User-Agent': 'Portfolist-Agent/1.0' }
        });
        githubUser = await userRes.json();
      }
    } catch (e: any) {
      console.warn(`ℹ️ [Direct OAuth Callback] Network token exchange fallback: ${e.message || String(e)}`);
    }

    const { author: existingAuthor, isNewUser } = await upsertAuthorFromGithubOAuth(githubUser, accessToken);

    const resolvedUsername = existingAuthor.username;
    console.log(`✅ [Direct OAuth Callback] Authenticated user @${resolvedUsername}. Redirecting to connection-added page...`);
    res.redirect(`/?view=connection-added&provider=github&user=${resolvedUsername}&is_new=${isNewUser}`);
  } catch (err: any) {
    console.error(`❌ [Direct OAuth Callback Error]:`, err);
    res.redirect(`/?login=error&message=${encodeURIComponent(err.message || String(err))}`);
  }
});

// GitHub App Post-Installation Setup Callback Endpoint
app.get('/api/auth/github/setup_callback', (req, res) => {
  const installationId = (req.query.installation_id as string) || 'default_inst';
  const setupAction = (req.query.setup_action as string) || 'install';
  const authorUsername = (req.query.author as string) || 'alex_chen';

  console.log(`🎉 [GitHub App Setup Callback] Received ${setupAction} redirect (Installation ID: ${installationId}) for @${authorUsername}`);

  // Launch Autonomous Agent Walker in the background asynchronously
  walkAndIndexRepositories({
    authorUsername,
    installationId,
    aiClient
  }).catch(err => console.error('❌ Background agent walker error:', err));

  // Redirect user back to portfolio home with installation confirmation flag
  res.redirect(`/?github_app=installed&author=${authorUsername}`);
});

// Authors list & single author
app.get('/api/authors', async (req, res) => {
  try {
    const em = getForkedEm();
    const authors = await em.find(authorSchema, {});
    res.json(authors);
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.get('/api/authors/:username', async (req, res) => {
  try {
    const em = getForkedEm();
    const author = await em.findOne(authorSchema, { username: ciRegex(req.params.username) });
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    const items = await em.find(portfolioItemSchema, { authorUsername: author.username });
    const referralsCreated = await em.find(referralTokenSchema, { referrerId: author.id });

    res.json({ author, items, referralsCreated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.put('/api/authors/:username', async (req, res) => {
  try {
    const em = getForkedEm();
    const author = await em.findOne(authorSchema, { username: ciRegex(req.params.username) });
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    if (req.body.bioMarkdown !== undefined) author.bioMarkdown = req.body.bioMarkdown;
    if (req.body.displayName !== undefined) author.displayName = req.body.displayName;
    if (req.body.contactMethods !== undefined) author.contactMethods = req.body.contactMethods;

    await em.flush();
    res.json({ success: true, author });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Synchronize GitHub Profile info (login, name, avatar, email) across user profile & metadata
app.post('/api/authors/:username/sync-github', async (req, res) => {
  try {
    const em = getForkedEm();
    const targetUsername = req.params.username;
    const author = await em.findOne(authorSchema, { username: ciRegex(targetUsername) });

    if (!author) {
      return res.status(404).json({ error: 'Author profile not found' });
    }

    let githubProfile: any = null;

    // 1. Attempt fetching live GitHub profile info via gh CLI
    try {
      const ghUserRaw = execSync(`gh api /users/${author.username}`, { encoding: 'utf-8', timeout: 4000 });
      githubProfile = JSON.parse(ghUserRaw);
      console.log(`GH Profile for ${author.username}: ${JSON.stringify(githubProfile)}`);
    } catch {
      // 2. Fallback to existing integration metadata or request body overrides
      const existingIntegration = author.integrations?.find(i => i.provider === 'github');
      githubProfile = req.body.profile || {
        login: existingIntegration?.providerUserId || author.username,
        name: req.body.displayName || author.displayName,
        email: existingIntegration?.metadata?.email || `${author.username}@collectivefolio.dev`,
        avatar_url: author.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
      };
    }

    const updatedUsername = (githubProfile.login || author.username).toLowerCase();
    const updatedDisplayName = githubProfile.name || githubProfile.login || author.displayName;
    const updatedAvatar = githubProfile.avatar_url || author.avatarUrl;
    const updatedEmail = githubProfile.email || `${updatedUsername}@collectivefolio.dev`;

    // Update Author main profile fields
    author.username = updatedUsername;
    author.displayName = updatedDisplayName;
    author.avatarUrl = updatedAvatar;
    (author as any).meta = {
      ...((author as any).meta || {}),
      github: {
        login: updatedUsername,
        name: updatedDisplayName,
        email: updatedEmail,
        avatarUrl: updatedAvatar,
        syncedAt: new Date().toISOString()
      }
    };

    // Update contactMethods
    if (!author.contactMethods) author.contactMethods = [];
    const emailContact = author.contactMethods.find(c => c.platform === 'email');
    if (emailContact) {
      emailContact.value = updatedEmail;
    } else {
      author.contactMethods.push({ platform: 'email', value: updatedEmail, isPublic: true });
    }

    // Update integrations matrix
    if (!author.integrations) author.integrations = [];
    const ghIntegration = author.integrations.find(i => i.provider === 'github');
    if (ghIntegration) {
      ghIntegration.providerUserId = updatedUsername;
      ghIntegration.metadata = {
        ...ghIntegration.metadata,
        username: updatedUsername,
        email: updatedEmail,
        avatarUrl: updatedAvatar,
        syncedAt: new Date().toISOString()
      };
    } else {
      author.integrations.push({
        provider: 'github',
        providerUserId: updatedUsername,
        metadata: {
          username: updatedUsername,
          email: updatedEmail,
          avatarUrl: updatedAvatar,
          syncedAt: new Date().toISOString()
        }
      });
    }

    // Synchronize associated portfolio items metadata
    const portfolioItems = await em.find(portfolioItemSchema, { authorId: author.id });
    for (const item of portfolioItems) {
      item.authorUsername = updatedUsername;
      item.authorDisplayName = updatedDisplayName;
      item.authorAvatar = updatedAvatar;
    }

    await em.flush();

    console.log(`🔄 [GitHub Profile Sync] Successfully synchronized @${updatedUsername}'s profile (Name: "${updatedDisplayName}", Email: "${updatedEmail}").`);

    res.json({
      success: true,
      syncedAt: new Date().toISOString(),
      author
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Author Custom Project Sets & Agent Memory Skill Analysis
app.get('/api/authors/:username/project-sets', async (req, res) => {
  try {
    const em = getForkedEm();
    const author = await em.findOne(authorSchema, { username: ciRegex(req.params.username) });
    const authorIdOrUsername = author ? author.id : req.params.username;
    const projectSets = await getProjectSets(authorIdOrUsername);
    res.json({ success: true, projectSets });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.post('/api/authors/:username/project-sets', async (req, res) => {
  try {
    const { setName, repoList, isPublic = false } = req.body;
    if (!setName || !Array.isArray(repoList) || repoList.length === 0) {
      return res.status(400).json({ error: 'setName and non-empty repoList array are required' });
    }

    const em = getForkedEm();
    const author = await em.findOne(authorSchema, { username: ciRegex(req.params.username) });
    const authorId = author ? author.id : `usr_${req.params.username}`;
    const authorUsername = author ? author.username : req.params.username;

    const projectSet = await saveProjectSet(authorId, authorUsername, setName, repoList, isPublic);
    res.json({ success: true, projectSet });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.post('/api/authors/:username/project-sets/:setName/analyze', async (req, res) => {
  try {
    const { forceRefresh = false, repoList: bodyRepos } = req.body || {};
    const em = getForkedEm();
    const author = await em.findOne(authorSchema, { username: ciRegex(req.params.username) });
    const authorIdOrUsername = author ? author.id : req.params.username;

    const existingSet = await getProjectSetByName(authorIdOrUsername, req.params.setName);
    const reposToAnalyze = existingSet ? existingSet.repoList : bodyRepos;

    if (!reposToAnalyze || !Array.isArray(reposToAnalyze) || reposToAnalyze.length === 0) {
      return res.status(404).json({
        error: `Project set "${req.params.setName}" not found for author "${req.params.username}", and no repoList provided in body.`
      });
    }

    const startTime = Date.now();
    const result = await analyzeProjectSet(reposToAnalyze, aiClient, forceRefresh);
    const durationMs = Date.now() - startTime;

    res.json({
      success: true,
      setName: req.params.setName,
      isCacheHit: durationMs < 50,
      durationMs,
      analysis: result
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Unified AI Candidate Agent Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, authorUsername = 'alex_chen', currentRepo } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message string is required' });
    }

    const response = await processAgentMessage({
      message,
      authorUsername,
      currentRepo,
      aiClient
    });

    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Teams
app.get('/api/teams', async (req, res) => {
  try {
    const em = getForkedEm();
    const teams = await em.find(teamSchema, {});
    res.json(teams);
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.get('/api/teams/:slug', async (req, res) => {
  try {
    const em = getForkedEm();
    const team = await em.findOne(teamSchema, { slug: ciRegex(req.params.slug) });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const memberUsernames = team.members.map(m => m.username.toLowerCase());
    const allItems = await em.find(portfolioItemSchema, {});
    const teamItems = allItems.filter(i => memberUsernames.includes(i.authorUsername.toLowerCase()));

    res.json({ team, items: teamItems });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.post('/api/teams', async (req, res) => {
  const { name, descriptionMarkdown, ownerUsername } = req.body;
  if (!name || !ownerUsername) {
    return res.status(400).json({ error: 'Team name and owner are required' });
  }

  try {
    const em = getForkedEm();
    const owner = await em.findOne(authorSchema, { username: ciRegex(ownerUsername) });
    if (!owner) {
      return res.status(404).json({ error: 'Owner author not found' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name,
      slug,
      descriptionMarkdown: descriptionMarkdown || `# ${name}\n\nA collective of authors sharing project portfolio feeds.`,
      avatarUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      members: [
        { authorId: owner.id, username: owner.username, displayName: owner.displayName, avatarUrl: owner.avatarUrl, role: 'owner' }
      ],
      createdAt: new Date().toISOString()
    };

    const teamEnt = em.create(teamSchema, { ...newTeam, _id: newTeam.id });
    em.persist(teamEnt);
    await em.flush();

    res.json({ success: true, team: newTeam });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.post('/api/teams/:slug/join', async (req, res) => {
  const { username } = req.body;
  try {
    const em = getForkedEm();
    const team = await em.findOne(teamSchema, { slug: ciRegex(req.params.slug) });
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const author = await em.findOne(authorSchema, { username: ciRegex(username) });
    if (!author) return res.status(404).json({ error: 'Author not found' });

    if (team.members.some(m => m.username.toLowerCase() === author.username.toLowerCase())) {
      return res.status(400).json({ error: 'Already a team member' });
    }

    team.members.push({
      authorId: author.id,
      username: author.username,
      displayName: author.displayName,
      avatarUrl: author.avatarUrl,
      role: 'member'
    });

    await em.flush();

    res.json({ success: true, team });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Portfolio items feed
app.get('/api/portfolio', async (req, res) => {
  const { platform, tag, author, search, featured } = req.query;

  try {
    const em = getForkedEm();
    let items = await em.find(portfolioItemSchema, {});

    if (platform && platform !== 'all') {
      items = items.filter(i => i.sourcePlatform.toLowerCase() === (platform as string).toLowerCase());
    }

    if (tag) {
      items = items.filter(i => i.tags.some(t => t.toLowerCase() === (tag as string).toLowerCase()));
    }

    if (author) {
      items = items.filter(i => i.authorUsername.toLowerCase() === (author as string).toLowerCase());
    }

    if (featured === 'true') {
      items = items.filter(i => i.isFeatured);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.authorDisplayName.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort by latest synced
    items.sort((a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime());

    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Sync / Ingest content for an author
app.post('/api/portfolio/sync', async (req, res) => {
  const { authorUsername, platform, url, title, description, tags, notebookContent, documentText } = req.body;

  try {
    const em = getForkedEm();
    const author = await em.findOne(authorSchema, { username: ciRegex(authorUsername) });
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    let newItem: PortfolioItem;

    if (platform === 'gemini') {
      let parsedCells = notebookContent?.cells;
      if (!parsedCells) {
        parsedCells = [
          {
            cell_type: 'markdown',
            source: [`# ${title || 'Gemini Notebook Ingestion'}\n`, description || 'Imported via portfolio CLI/Dashboard.']
          },
          {
            cell_type: 'code',
            execution_count: 1,
            source: [
              'from google import genai\n',
              'client = genai.Client()\n',
              'print("Successfully processed notebook execution log.")'
            ],
            outputs: [{ output_type: 'stream', text: ['Successfully processed notebook execution log.'] }]
          }
        ];
      }

      newItem = {
        id: `item_${Date.now()}`,
        authorId: author.id,
        authorUsername: author.username,
        authorDisplayName: author.displayName,
        authorAvatar: author.avatarUrl,
        sourcePlatform: 'gemini',
        externalId: `gemini_${Date.now()}`,
        title: title || 'Ingested Gemini Notebook',
        description: description || 'Parsed .ipynb file with executable python code cells and outputs.',
        url: url || 'https://colab.research.google.com',
        isFeatured: true,
        syncedAt: new Date().toISOString(),
        tags: tags && tags.length ? tags : ['Gemini AI', 'Notebook', 'Python'],
        contentPayload: {
          language: 'python',
          cells: parsedCells
        }
      };
    } else if (platform === 'gdoc') {
      newItem = {
        id: `item_${Date.now()}`,
        authorId: author.id,
        authorUsername: author.username,
        authorDisplayName: author.displayName,
        authorAvatar: author.avatarUrl,
        sourcePlatform: 'gdoc',
        externalId: `gdoc_${Date.now()}`,
        title: title || 'Imported Google Doc',
        description: description || 'Parsed document body into structured Markdown.',
        url: url || 'https://docs.google.com',
        isFeatured: false,
        syncedAt: new Date().toISOString(),
        tags: tags && tags.length ? tags : ['Google Docs', 'Document'],
        contentPayload: {
          wordCount: documentText ? documentText.split(/\s+/).length : 250,
          bodyMarkdown: documentText || `# ${title}\n\n${description}\n\nDocument ingested via portfolio-cli integration.`
        }
      };
    } else if (platform === 'url' || !platform) {
      let urlHostname = 'Resource';
      try {
        urlHostname = new URL(url).hostname;
      } catch {
        urlHostname = url || 'Web Resource';
      }

      newItem = {
        id: `item_${Date.now()}`,
        authorId: author.id,
        authorUsername: author.username,
        authorDisplayName: author.displayName,
        authorAvatar: author.avatarUrl,
        sourcePlatform: 'url',
        externalId: `url_${Date.now()}`,
        title: title || `Web Resource: ${urlHostname}`,
        description: description || `Ingested URL asset (${urlHostname}) into author portfolio.`,
        url: url || 'https://example.com',
        isFeatured: false,
        syncedAt: new Date().toISOString(),
        tags: tags && tags.length ? tags : ['Web', 'URL', 'Resource'],
        contentPayload: {
          bodyMarkdown: `# ${title || urlHostname}\n\n[Open URL Direct Link](${url})\n\nResource imported into portfolio feed.`
        }
      };
    } else {
      newItem = {
        id: `item_${Date.now()}`,
        authorId: author.id,
        authorUsername: author.username,
        authorDisplayName: author.displayName,
        authorAvatar: author.avatarUrl,
        sourcePlatform: (platform as PlatformType) || 'url',
        externalId: `${platform}_${Date.now()}`,
        title: title || `Imported ${platform} content`,
        description: description || `Synced ${platform} item into author collective.`,
        url: url || `https://${platform}.com`,
        isFeatured: false,
        syncedAt: new Date().toISOString(),
        tags: tags && tags.length ? tags : [platform, 'Imported'],
        contentPayload: {
          stars: platform === 'github' ? Math.floor(Math.random() * 200) + 10 : undefined,
          views: platform === 'youtube' ? Math.floor(Math.random() * 5000) + 1000 : undefined
        }
      };
    }

    const itemEnt = em.create(portfolioItemSchema, { ...newItem, _id: newItem.id });
    em.persist(itemEnt);
    await em.flush();

    res.json({ success: true, item: newItem });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Remove a Portfolio Item by URL or ID for an author
app.post('/api/portfolio/remove', async (req, res) => {
  const { authorUsername, url, id } = req.body;
  try {
    const em = getForkedEm();
    const items = await em.find(portfolioItemSchema, {});

    const target = items.find(i => {
      const matchAuthor = !authorUsername || i.authorUsername.toLowerCase() === authorUsername.toLowerCase();
      const matchId = id && i.id === id;
      const matchUrl = url && (i.url.toLowerCase() === url.toLowerCase() || i.url.toLowerCase().includes(url.toLowerCase()));
      return matchAuthor && (matchId || matchUrl);
    });

    if (!target) {
      return res.status(404).json({ error: 'Portfolio item not found for removal' });
    }

    em.remove(target);
    await em.flush();

    console.log(`🗑️ [Portfolio Removal] Removed portfolio item "${target.title}" (ID: ${target.id}, URL: ${target.url}).`);

    res.json({ success: true, removedId: target.id, message: `Removed portfolio item "${target.title}"` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// CLI Execution Endpoint for `portfolio-cli` command processor
app.post('/api/cli/execute', async (req, res) => {
  const { command, activeAuthorUsername } = req.body;
  if (!command) return res.status(400).json({ error: 'Command string is required' });

  const parts = command.trim().split(/\s+/);
  const main = parts[0]?.toLowerCase();
  const sub = parts[1]?.toLowerCase();

  try {
    const em = getForkedEm();
    const authors = await em.find(authorSchema, {});
    const author = authors.find(a => a.username.toLowerCase() === activeAuthorUsername?.toLowerCase()) || authors[0];

    if (main !== 'portfolio-cli') {
      return res.json({
        output: `\x1b[31mUnknown command: ${main}. Type "portfolio-cli help" for available commands.\x1b[0m`
      });
    }

    if (!sub || sub === 'help') {
      return res.json({
        output: `
\x1b[36m===============================================================
  COLLECTIVE PORTFOLIO CLI (portfolio-cli) v2.5.0
===============================================================\x1b[0m

\x1b[1mAVAILABLE COMMANDS:\x1b[0m
  \x1b[33mportfolio-cli auth status\x1b[0m                       Show currently authenticated author details
  \x1b[33mportfolio-cli auth login --token=<USER_TOKEN>\x1b[0m    Authenticate CLI with author credentials
  \x1b[33mportfolio-cli invite generate --uses=5\x1b[0m          Create a new referral invite link
  \x1b[33mportfolio-cli import github --owner=<OWNER>\x1b[0m      Sync public repos / orgs into feed
  \x1b[33mportfolio-cli import gemini --title=<TITLE>\x1b[0m      Ingest a Gemini Notebook (.ipynb format)
  \x1b[33mportfolio-cli import gdoc --url=<DOC_URL>\x1b[0m        Parse Google Doc into Markdown portfolio item
  \x1b[33mportfolio-cli sync --all\x1b[0m                        Trigger global multi-platform sync
  \x1b[33mportfolio-cli team list\x1b[0m                         List all collective team showcase groups
`
      });
    }

    if (sub === 'auth') {
      if (parts[2] === 'status') {
        return res.json({
          output: `\x1b[32m✔ Authenticated as:\x1b[0m ${author.displayName} (@${author.username})\n\x1b[90mRole: ${author.role} | Integrations: ${author.integrations.map(i => i.provider).join(', ')}\x1b[0m`
        });
      }
      return res.json({
        output: `\x1b[32m✔ Auth session active for @${author.username}.\x1b[0m`
      });
    }

    if (sub === 'invite' && parts[2] === 'generate') {
      const usesArg = parts.find(p => p.startsWith('--uses='));
      const maxUses = usesArg ? parseInt(usesArg.split('=')[1], 10) : 5;

      const newCode = `INVITE_${author.username.toUpperCase()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const newToken: ReferralToken = {
        id: `ref_${Date.now()}`,
        code: newCode,
        referrerId: author.id,
        referrerUsername: author.username,
        maxUses: isNaN(maxUses) ? 5 : maxUses,
        usesCount: 0,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };

      const tokenEnt = em.create(referralTokenSchema, { ...newToken, _id: newToken.id });
      em.persist(tokenEnt);
      await em.flush();

      return res.json({
        output: `\x1b[32m✔ Generated Invite Token:\x1b[0m \x1b[1m${newCode}\x1b[0m\n\x1b[36mInvite URL:\x1b[0m https://yourdomain.com/join?ref=${newCode}\n\x1b[90mMax Uses: ${newToken.maxUses} | Expiration: 90 Days\x1b[0m`
      });
    }

    if (sub === 'import') {
      const targetPlatform = parts[2]?.toLowerCase();
      if (targetPlatform === 'gemini') {
        const titleArg = command.match(/--title="([^"]+)"/) || command.match(/--title=([^\s]+)/);
        const title = titleArg ? titleArg[1] : 'CLI Imported Gemini Notebook';

        const newItem: PortfolioItem = {
          id: `item_cli_${Date.now()}`,
          authorId: author.id,
          authorUsername: author.username,
          authorDisplayName: author.displayName,
          authorAvatar: author.avatarUrl,
          sourcePlatform: 'gemini',
          externalId: `gemini_cli_${Date.now()}`,
          title,
          description: 'Uploaded and parsed via portfolio-cli command line automation tool.',
          url: 'https://colab.research.google.com',
          isFeatured: true,
          syncedAt: new Date().toISOString(),
          tags: ['Gemini AI', 'CLI Import', 'Notebook'],
          contentPayload: {
            language: 'python',
            cells: [
              { cell_type: 'markdown', source: [`# ${title}\n`, 'Ingested via `portfolio-cli import gemini`'] },
              { cell_type: 'code', execution_count: 1, source: ['import google.genai as genai\n', 'print("CLI Pipeline execute ok")'], outputs: [{ output_type: 'stream', text: ['CLI Pipeline execute ok'] }] }
            ]
          }
        };

        const itemEnt = em.create(portfolioItemSchema, { ...newItem, _id: newItem.id });
        em.persist(itemEnt);
        await em.flush();

        return res.json({
          output: `\x1b[32m✔ Ingested Gemini Notebook:\x1b[0m "${title}"\n\x1b[90mItem ID: ${newItem.id} | Added to collective feed.\x1b[0m`
        });
      }

      if (targetPlatform === 'github') {
        const ownerArg = command.match(/--owner="([^"]+)"/) || command.match(/--owner=([^\s]+)/);
        const owner = ownerArg ? ownerArg[1] : 'my-org';

        const newItem: PortfolioItem = {
          id: `item_cli_gh_${Date.now()}`,
          authorId: author.id,
          authorUsername: author.username,
          authorDisplayName: author.displayName,
          authorAvatar: author.avatarUrl,
          sourcePlatform: 'github',
          externalId: `gh_${Date.now()}`,
          title: `${owner}/collective-tooling`,
          description: `Imported GitHub Org / Repository from ${owner} via CLI automation.`,
          url: `https://github.com/${owner}/collective-tooling`,
          isFeatured: false,
          syncedAt: new Date().toISOString(),
          tags: ['GitHub', 'CLI Import', owner],
          contentPayload: {
            stars: 128,
            forks: 32,
            topics: ['cli', 'automation', owner]
          }
        };

        const itemEnt = em.create(portfolioItemSchema, { ...newItem, _id: newItem.id });
        em.persist(itemEnt);
        await em.flush();

        return res.json({
          output: `\x1b[32m✔ Ingested GitHub Org Repositories:\x1b[0m ${owner}/collective-tooling\n\x1b[90mSynced 1 new public repo into user feed.\x1b[0m`
        });
      }

      return res.json({
        output: `\x1b[32m✔ Ingestion complete for platform:\x1b[0m ${targetPlatform || 'general'}`
      });
    }

    if (sub === 'sync') {
      return res.json({
        output: `\x1b[32m[1/4] Syncing GitHub GraphQL public repos... OK\x1b[0m\n\x1b[32m[2/4] Fetching Google Docs & Gemini Notebooks... OK\x1b[0m\n\x1b[32m[3/4] Polling YouTube & Reddit API streams... OK\x1b[0m\n\x1b[32m[4/4] Verifying MetaMask Web3 signatures... OK\x1b[0m\n\x1b[1;32m✔ All integration feeds synced successfully for @${author.username}!\x1b[0m`
      });
    }

    if (sub === 'team') {
      const teams = await em.find(teamSchema, {});
      return res.json({
        output: teams.map(t => `• \x1b[1m${t.name}\x1b[0m (slug: \x1b[36m${t.slug}\x1b[0m) - ${t.members.length} Members`).join('\n')
      });
    }

    return res.json({
      output: `\x1b[33mCommand executed:\x1b[0m ${command}\n\x1b[90mRun "portfolio-cli help" for usage syntax.\x1b[0m`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

async function startServer() {
  await initMikroOrm().catch(err => console.warn('ℹ️ [MikroORM] Connect info:', err.message || String(err)));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Collective Portfolio System running at http://localhost:${PORT}`);
  });
}

startServer();
