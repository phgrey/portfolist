import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Author, ReferralToken, Team, PortfolioItem, PlatformType } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initial Seed Data Store
const db = {
  authors: [
    {
      id: 'usr_alex_chen',
      username: 'alex_chen',
      displayName: 'Alex Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bioMarkdown: `# Alex Chen — Lead AI Systems & Data Researcher

Building agentic intelligence pipelines, Gemini Notebook automation, and multi-tenant developer toolings.

### Core Focus
- **Agentic AI**: Gemini 2.5 Flash & Pro SDK integrations, tool calling, multi-modal pipelines.
- **Data Engineering**: Distributed ingestion, GraphQL endpoints, CLI automation.
- **Open Source**: Maintainer of \`gemini-agentic-workflow\` and contributor to collective developer tooling.

> "True craftsmanship in software is about simple, composable tools that empower collective teams."`,
      role: 'Staff AI Engineer',
      createdAt: '2026-01-15T10:00:00Z',
      integrations: [
        { provider: 'github', providerUserId: 'alexchen-ai', metadata: { username: 'alexchen-ai', orgs: ['quantum-guild', 'google-devs'] } },
        { provider: 'google', providerUserId: 'alex.chen@workspace.dev', metadata: { username: 'alex.chen' } },
        { provider: 'youtube', providerUserId: 'UC_alex_chen_dev', metadata: { username: 'AlexChenTech', channelId: 'UC_alex_chen_dev' } },
        { provider: 'reddit', providerUserId: 'u/alex_chen_ai', metadata: { username: 'alex_chen_ai' } },
        { provider: 'discord', providerUserId: 'alex_chen#1337', metadata: { username: 'alex_chen#1337' } }
      ],
      contactMethods: [
        { platform: 'discord', value: 'alex_chen#1337', isPublic: true },
        { platform: 'x', value: '@alexchen_ai', isPublic: true },
        { platform: 'telegram', value: 't.me/alexchen_dev', isPublic: true },
        { platform: 'email', value: 'alex@collectivefolio.dev', isPublic: true }
      ]
    },
    {
      id: 'usr_sarah_dev',
      username: 'sarah_dev',
      displayName: 'Sarah Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      bioMarkdown: `# Sarah Jenkins — Fullstack & Web3 Architect

Specializing in high-throughput Express/Vite fullstack setups, smart contract verification, and decentralized data sync.

- **Stack**: React 19, TypeScript, Tailwind v4, Express, Viem/Wagmi, PostgreSQL.
- **Passions**: Zero-knowledge proof proofs, Web3 identity matrix, invite-only referral cryptography.`,
      role: 'Lead Systems Architect',
      createdAt: '2026-02-01T14:30:00Z',
      integrations: [
        { provider: 'github', providerUserId: 'sarahj-dev', metadata: { username: 'sarahj-dev' } },
        { provider: 'metamask', providerUserId: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', metadata: { walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' } },
        { provider: 'twitter', providerUserId: 'sarahj_web3', metadata: { username: 'sarahj_web3' } }
      ],
      contactMethods: [
        { platform: 'whatsapp', value: '+1 (555) 019-2834', isPublic: true },
        { platform: 'discord', value: 'sarah_j#2026', isPublic: true }
      ]
    },
    {
      id: 'usr_marco_design',
      username: 'marco_design',
      displayName: 'Marco Rossi',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bioMarkdown: `# Marco Rossi — Lead Design Engineer & UX Architect

Crafting precision human-computer interfaces, design token architectures, and Flickr visual set showcases.

- Design Systems
- Typography Ratios & Micro-interactions
- Visual Asset Curation`,
      role: 'Principal UX Designer',
      createdAt: '2026-02-10T09:15:00Z',
      integrations: [
        { provider: 'flickr', providerUserId: 'marcorossi_photos', metadata: { username: 'marcorossi_photos' } },
        { provider: 'github', providerUserId: 'marcorossi-ui', metadata: { username: 'marcorossi-ui' } }
      ],
      contactMethods: [
        { platform: 'email', value: 'marco@collectivefolio.dev', isPublic: true },
        { platform: 'x', value: '@marcorossi_ui', isPublic: true }
      ]
    }
  ] as Author[],

  referralTokens: [
    {
      id: 'ref_001',
      code: 'INVITE_ALEX_2026',
      referrerId: 'usr_alex_chen',
      referrerUsername: 'alex_chen',
      maxUses: 5,
      usesCount: 2,
      expiresAt: '2026-12-31T23:59:59Z',
      createdAt: '2026-02-01T00:00:00Z'
    },
    {
      id: 'ref_002',
      code: 'INVITE_SARAH_ALPHA',
      referrerId: 'usr_sarah_dev',
      referrerUsername: 'sarah_dev',
      maxUses: 10,
      usesCount: 1,
      expiresAt: '2026-12-31T23:59:59Z',
      createdAt: '2026-02-05T00:00:00Z'
    }
  ] as ReferralToken[],

  teams: [
    {
      id: 'team_quantum',
      name: 'Quantum AI Intelligence Guild',
      slug: 'quantum-ai-guild',
      descriptionMarkdown: `# Quantum AI Intelligence Guild

A collective of AI researchers, data engineers, and fullstack architects building agentic tools with Gemini and distributed systems.

### Collective Mission
1. Deliver open-source Gemini notebook benchmarks and agentic execution tools.
2. Maintain shared portfolio feeds for peer review and referral-gated membership.
3. Integrate Google Workspace, GitHub Orgs, and CLI ingestion pipelines.`,
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      members: [
        { authorId: 'usr_alex_chen', username: 'alex_chen', displayName: 'Alex Chen', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', role: 'owner' },
        { authorId: 'usr_sarah_dev', username: 'sarah_dev', displayName: 'Sarah Jenkins', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', role: 'member' }
      ],
      createdAt: '2026-02-01T12:00:00Z'
    },
    {
      id: 'team_web3_design',
      name: 'Creative Systems & Web3 Collective',
      slug: 'creative-web3-collective',
      descriptionMarkdown: `# Creative Systems & Web3 Collective

Merging luxury visual design systems with Web3 cryptographic verification and Flickr asset pipelines.`,
      avatarUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80',
      members: [
        { authorId: 'usr_sarah_dev', username: 'sarah_dev', displayName: 'Sarah Jenkins', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', role: 'owner' },
        { authorId: 'usr_marco_design', username: 'marco_design', displayName: 'Marco Rossi', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', role: 'member' }
      ],
      createdAt: '2026-02-08T16:00:00Z'
    }
  ] as Team[],

  portfolioItems: [
    {
      id: 'item_gemini_nb_01',
      authorId: 'usr_alex_chen',
      authorUsername: 'alex_chen',
      authorDisplayName: 'Alex Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      sourcePlatform: 'gemini',
      externalId: 'nb_gemini_vision_2026',
      title: 'Multi-Modal Gemini Vision & Embeddings Pipeline',
      description: 'Interactive Jupyter Notebook benchmarking Gemini 2.5 Flash multimodal embeddings and agentic tool-use routines.',
      url: 'https://colab.research.google.com/drive/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      isFeatured: true,
      syncedAt: '2026-08-01T10:00:00Z',
      tags: ['Gemini AI', 'Notebook', 'Python', 'Embeddings', 'Agentic'],
      contentPayload: {
        language: 'python',
        bodyMarkdown: 'Calculated 1,000 vector embeddings per second using @google/genai SDK in Gemini Notebook environment.',
        cells: [
          {
            cell_type: 'markdown',
            source: [
              '# Gemini 2.5 Multimodal Embeddings & Tool Calling Benchmark\n',
              'This notebook demonstrates initializing the `@google/genai` Python client, parsing multi-modal images and text documents, and executing function calling loops.'
            ]
          },
          {
            cell_type: 'code',
            execution_count: 1,
            source: [
              'import google.genai as genai\n',
              'from google.genai import types\n',
              'import os\n\n',
              'client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))\n',
              'response = client.models.generate_content(\n',
              '    model="gemini-2.5-flash",\n',
              '    contents="Analyze the architecture of a multi-tenant referral portfolio system."\n',
              ')\n',
              'print(f"Gemini Analysis Summary:\\n{response.text}")'
            ],
            outputs: [
              {
                output_type: 'stream',
                text: [
                  'Gemini Analysis Summary:\n',
                  'The architecture requires a referral verification middleware, PostgreSQL schema with JSONB payload storage, an Express endpoint for CLI ingestion, and interactive notebook rendering components.'
                ]
              }
            ]
          },
          {
            cell_type: 'code',
            execution_count: 2,
            source: [
              '# Benchmark embedding calculation speed\n',
              'import time\n',
              't0 = time.time()\n',
              'embedding = client.models.embed_content(\n',
              '    model="text-embedding-004",\n',
              '    contents=["Referral-only user registration with cryptographic invite tokens"]\n',
              ')\n',
              'print(f"Embedding dimension: {len(embedding.embeddings[0].values)}, latency: {round((time.time() - t0)*1000, 2)}ms")'
            ],
            outputs: [
              {
                output_type: 'stream',
                text: [
                  'Embedding dimension: 768, latency: 42.15ms'
                ]
              }
            ]
          }
        ]
      }
    },
    {
      id: 'item_github_01',
      authorId: 'usr_alex_chen',
      authorUsername: 'alex_chen',
      authorDisplayName: 'Alex Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      sourcePlatform: 'github',
      externalId: 'repo_gemini_agentic_workflow',
      title: 'gemini-agentic-workflow',
      description: 'Autonomous agentic workflow engine built with Node.js, Express, and Google GenAI SDK for structured multi-step tasks.',
      url: 'https://github.com/alexchen-ai/gemini-agentic-workflow',
      isFeatured: true,
      syncedAt: '2026-08-02T11:20:00Z',
      tags: ['GitHub', 'TypeScript', 'Express', 'Gemini API', 'Open Source'],
      contentPayload: {
        stars: 428,
        forks: 64,
        topics: ['gemini-api', 'typescript', 'agentic-ai', 'express', 'automation'],
        bodyMarkdown: 'Full-stack framework for orchestration of Gemini models with streaming responses, tool calling, and background task scheduling.'
      }
    },
    {
      id: 'item_gdoc_01',
      authorId: 'usr_alex_chen',
      authorUsername: 'alex_chen',
      authorDisplayName: 'Alex Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      sourcePlatform: 'gdoc',
      externalId: 'doc_arch_proposal_2026',
      title: 'System Design: Referral-Gated Ingestion Framework',
      description: 'Google Drive Document outlining the zero-trust referral check, OAuth token refresh lifecycle, and CLI ingestion matrix.',
      url: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      isFeatured: false,
      syncedAt: '2026-08-03T08:15:00Z',
      tags: ['Google Docs', 'Architecture', 'System Design', 'Security'],
      contentPayload: {
        documentId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        wordCount: 1420,
        bodyMarkdown: `# Architectural Proposal: Referral-Gated Collective System

## 1. Executive Summary
This document defines the zero-trust referral architecture for the Collective Portfolio System. Access to user creation requires a cryptographically validated referral token.

## 2. Security Boundaries
- **Public Visitors**: Unauthenticated visitors can view public author pages, team showcases, and social share intents.
- **Hidden Signup**: No public \`/signup\` CTA exists. Registration is strictly gated by \`referral_token\`.
- **CLI Sync Engine**: The \`portfolio-cli\` tool validates author API tokens to trigger background updates for GitHub, YouTube, Reddit, and Gemini Notebooks.`
      }
    },
    {
      id: 'item_youtube_01',
      authorId: 'usr_alex_chen',
      authorUsername: 'alex_chen',
      authorDisplayName: 'Alex Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      sourcePlatform: 'youtube',
      externalId: 'yt_vid_gemini_25_guide',
      title: 'Building Agentic Workflows with Gemini 2.5 & Express',
      description: 'Comprehensive video breakdown of structuring Gemini API integrations in full-stack Node.js server architectures.',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isFeatured: true,
      syncedAt: '2026-07-28T16:00:00Z',
      tags: ['YouTube', 'Video Guide', 'Gemini 2.5', 'Tutorial'],
      contentPayload: {
        videoId: 'dQw4w9WgXcQ',
        duration: '18:42',
        views: 12450
      }
    },
    {
      id: 'item_reddit_01',
      authorId: 'usr_alex_chen',
      authorUsername: 'alex_chen',
      authorDisplayName: 'Alex Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      sourcePlatform: 'reddit',
      externalId: 'reddit_post_collective_arch',
      title: 'Architecture of an Invite-Only Collective Portfolio System on r/webdev',
      description: 'Reddit post discussing database schemas, multi-tenant team grouping, and Jupyter Notebook parsing algorithms.',
      url: 'https://reddit.com/r/webdev/comments/collective_portfolio_arch',
      isFeatured: false,
      syncedAt: '2026-07-30T19:22:00Z',
      tags: ['Reddit', 'r/webdev', 'Showcase', 'System Design'],
      contentPayload: {
        subreddit: 'r/webdev',
        upvotes: 382,
        commentsCount: 94
      }
    },
    {
      id: 'item_metamask_01',
      authorId: 'usr_sarah_dev',
      authorUsername: 'sarah_dev',
      authorDisplayName: 'Sarah Jenkins',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      sourcePlatform: 'metamask',
      externalId: 'nft_badge_proof_0x1337',
      title: 'Verified Senior Contributor Badge — Base Mainnet ERC-721',
      description: 'Cryptographic proof of authorship verified on Base Mainnet via SIWE / MetaMask wallet signature.',
      url: 'https://basescan.org/token/0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      isFeatured: true,
      syncedAt: '2026-08-01T09:10:00Z',
      tags: ['MetaMask', 'Web3', 'ERC-721', 'Base Chain', 'Proof of Work'],
      contentPayload: {
        contractAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        chain: 'Base Mainnet',
        nftImageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80'
      }
    },
    {
      id: 'item_flickr_01',
      authorId: 'usr_marco_design',
      authorUsername: 'marco_design',
      authorDisplayName: 'Marco Rossi',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      sourcePlatform: 'flickr',
      externalId: 'flickr_set_design_tokens',
      title: 'Design System Tokens & High-Res Micro-Interactions Album',
      description: 'Curated Flickr Photo Album featuring high-resolution UI component state breakdowns and layout grids.',
      url: 'https://flickr.com/photos/marcorossi_photos/sets/7215772026',
      isFeatured: true,
      syncedAt: '2026-08-02T15:40:00Z',
      tags: ['Flickr', 'Design Tokens', 'Photography', 'UI UX'],
      contentPayload: {
        photoCount: 18,
        images: [
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80'
        ]
      }
    }
  ] as PortfolioItem[]
};

// --- API ENDPOINTS ---

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Referral Validation
app.get('/api/referrals/validate', (req, res) => {
  const code = (req.query.code as string)?.trim();
  if (!code) {
    return res.status(400).json({ error: 'Referral code is required' });
  }

  const token = db.referralTokens.find(t => t.code.toUpperCase() === code.toUpperCase());
  if (!token) {
    return res.status(440).json({ isValid: false, error: 'Invalid referral token code.' });
  }

  if (token.usesCount >= token.maxUses) {
    return res.json({ isValid: false, error: 'Referral token has reached its maximum usage limit.' });
  }

  const referrer = db.authors.find(a => a.id === token.referrerId);

  res.json({
    isValid: true,
    code: token.code,
    referrerUsername: token.referrerUsername,
    referrerDisplayName: referrer?.displayName || token.referrerUsername,
    remainingUses: token.maxUses - token.usesCount,
    expiresAt: token.expiresAt
  });
});

// Generate Referral Token (Requires logged in author)
app.post('/api/referrals/create', (req, res) => {
  const { authorId, maxUses = 5 } = req.body;
  const author = db.authors.find(a => a.id === authorId || a.username === authorId);

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

  db.referralTokens.push(newToken);
  res.json({ success: true, token: newToken, inviteUrl: `/join?ref=${newCode}` });
});

// Auth Sign In check / Gated Referral Registration
app.post('/api/auth/login', (req, res) => {
  const { username, referralCode, provider = 'github' } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Check if existing author
  const existingAuthor = db.authors.find(a => a.username.toLowerCase() === username.toLowerCase());
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

  const refToken = db.referralTokens.find(t => t.code.toUpperCase() === referralCode.toUpperCase());
  if (!refToken || refToken.usesCount >= refToken.maxUses) {
    return res.status(403).json({
      error: 'Invalid or Expired Invite',
      message: 'The referral token provided is invalid or has reached its usage cap.'
    });
  }

  // Increment usage count
  refToken.usesCount += 1;

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

  db.authors.push(newAuthor);

  res.json({
    status: 'authenticated',
    isNew: true,
    author: newAuthor,
    usedReferralCode: refToken.code
  });
});

// Authors list & single author
app.get('/api/authors', (req, res) => {
  res.json(db.authors);
});

app.get('/api/authors/:username', (req, res) => {
  const author = db.authors.find(a => a.username.toLowerCase() === req.params.username.toLowerCase());
  if (!author) {
    return res.status(404).json({ error: 'Author not found' });
  }

  const items = db.portfolioItems.filter(i => i.authorUsername.toLowerCase() === author.username.toLowerCase());
  const referralsCreated = db.referralTokens.filter(t => t.referrerId === author.id);

  res.json({ author, items, referralsCreated });
});

app.put('/api/authors/:username', (req, res) => {
  const author = db.authors.find(a => a.username.toLowerCase() === req.params.username.toLowerCase());
  if (!author) {
    return res.status(404).json({ error: 'Author not found' });
  }

  if (req.body.bioMarkdown !== undefined) author.bioMarkdown = req.body.bioMarkdown;
  if (req.body.displayName !== undefined) author.displayName = req.body.displayName;
  if (req.body.contactMethods !== undefined) author.contactMethods = req.body.contactMethods;

  res.json({ success: true, author });
});

// Teams
app.get('/api/teams', (req, res) => {
  res.json(db.teams);
});

app.get('/api/teams/:slug', (req, res) => {
  const team = db.teams.find(t => t.slug.toLowerCase() === req.params.slug.toLowerCase());
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  const memberUsernames = team.members.map(m => m.username.toLowerCase());
  const teamItems = db.portfolioItems.filter(i => memberUsernames.includes(i.authorUsername.toLowerCase()));

  res.json({ team, items: teamItems });
});

app.post('/api/teams', (req, res) => {
  const { name, descriptionMarkdown, ownerUsername } = req.body;
  if (!name || !ownerUsername) {
    return res.status(400).json({ error: 'Team name and owner are required' });
  }

  const owner = db.authors.find(a => a.username === ownerUsername);
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

  db.teams.push(newTeam);
  res.json({ success: true, team: newTeam });
});

app.post('/api/teams/:slug/join', (req, res) => {
  const { username } = req.body;
  const team = db.teams.find(t => t.slug.toLowerCase() === req.params.slug.toLowerCase());
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const author = db.authors.find(a => a.username.toLowerCase() === username?.toLowerCase());
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

  res.json({ success: true, team });
});

// Portfolio items feed
app.get('/api/portfolio', (req, res) => {
  const { platform, tag, author, search, featured } = req.query;

  let items = [...db.portfolioItems];

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
});

// Sync / Ingest content for an author
app.post('/api/portfolio/sync', (req, res) => {
  const { authorUsername, platform, url, title, description, tags, notebookContent, documentText } = req.body;

  const author = db.authors.find(a => a.username.toLowerCase() === authorUsername?.toLowerCase());
  if (!author) {
    return res.status(404).json({ error: 'Author not found' });
  }

  let newItem: PortfolioItem;

  if (platform === 'gemini') {
    // Parse notebook or construct cells
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
  } else {
    // General GitHub, YouTube, Reddit, Flickr, Web3
    newItem = {
      id: `item_${Date.now()}`,
      authorId: author.id,
      authorUsername: author.username,
      authorDisplayName: author.displayName,
      authorAvatar: author.avatarUrl,
      sourcePlatform: (platform as PlatformType) || 'github',
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

  db.portfolioItems.unshift(newItem);
  res.json({ success: true, item: newItem });
});

// CLI Execution Endpoint for `portfolio-cli` command processor
app.post('/api/cli/execute', (req, res) => {
  const { command, activeAuthorUsername } = req.body;
  if (!command) return res.status(400).json({ error: 'Command string is required' });

  const parts = command.trim().split(/\s+/);
  const main = parts[0]?.toLowerCase();
  const sub = parts[1]?.toLowerCase();

  const author = db.authors.find(a => a.username.toLowerCase() === activeAuthorUsername?.toLowerCase()) || db.authors[0];

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
    db.referralTokens.push(newToken);

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
      db.portfolioItems.unshift(newItem);

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
      db.portfolioItems.unshift(newItem);

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
    return res.json({
      output: db.teams.map(t => `• \x1b[1m${t.name}\x1b[0m (slug: \x1b[36m${t.slug}\x1b[0m) - ${t.members.length} Members`).join('\n')
    });
  }

  return res.json({
    output: `\x1b[33mCommand executed:\x1b[0m ${command}\n\x1b[90mRun "portfolio-cli help" for usage syntax.\x1b[0m`
  });
});

async function startServer() {
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
