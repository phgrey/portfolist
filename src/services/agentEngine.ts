import { GoogleGenAI } from '@google/genai';
import { analyzeRepo } from '../../agent/skills/repoAnalyzer';
import { analyzeProjectSet, analyzeAuthorRepos } from '../../agent/skills/authorProfiler';
import { matchAuthorToPosition } from '../../agent/skills/positionMatcher';
import { getProjectSets } from './agentMemory';
import { resolvePositionDocument } from './positionFetcher';

export interface ProcessMessageOptions {
  message: string;
  authorUsername: string;
  currentRepo?: string;
  aiClient?: GoogleGenAI;
}

export interface AgentResponse {
  reply: string;
  intent: 'describe_me' | 'describe_repo' | 'match_position' | 'general';
  data?: any;
}

/**
 * Unified AI Candidate Evaluator Agent Engine
 * Core processing logic shared across Web Chat Drawer and Telegram Channel
 */
export async function processAgentMessage(options: ProcessMessageOptions): Promise<AgentResponse> {
  const { message, authorUsername, currentRepo, aiClient } = options;
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  console.log(`🤖 [AgentEngine] Processing message for author "${authorUsername}": "${trimmed.slice(0, 60)}..."`);

  // Intent 1: Match against Position Document or Web URL
  if (
    lower.includes('match') ||
    lower.includes('position') ||
    lower.includes('job') ||
    lower.includes('role') ||
    /^https?:\/\/[^\s]+$/i.test(trimmed) ||
    lower.startsWith('/match')
  ) {
    let positionInput = trimmed
      .replace(/^\/match/i, '')
      .replace(/^match me against/i, '')
      .replace(/^describe me against/i, '')
      .replace(/^compare me to/i, '')
      .trim();

    if (!positionInput) {
      positionInput = 'Senior Software Engineer / AI Architect role requiring TypeScript, Python, CI/CD, and system design.';
    }

    const resolvedDoc = await resolvePositionDocument(positionInput);

    // Fetch author's project sets or fallback to username
    const projectSets = await getProjectSets(authorUsername);
    let targetRepos: string | string[] = authorUsername;
    if (projectSets.length > 0 && projectSets[0].repoList.length > 0) {
      targetRepos = projectSets[0].repoList;
    }

    const matchResult = await matchAuthorToPosition(targetRepos, resolvedDoc, undefined, aiClient);

    const verdictEmoji = matchResult.isSuitable ? '✅ SUITABLE' : '❌ NOT SUITABLE';
    const reply = `🎯 **Candidate Suitability Result**\n\n` +
      `• **Verdict**: ${verdictEmoji} (**${matchResult.matchScore}/100** Fit Score)\n` +
      `• **Candidate**: \`${authorUsername}\`\n\n` +
      `**Key Strengths**:\n${matchResult.keyMatchingStrengths.map(s => `• ${s}`).join('\n')}\n\n` +
      `**Identified Gaps**:\n${matchResult.identifiedGaps.map(g => `• ${g}`).join('\n')}\n\n` +
      `**Detailed Rationale**:\n${matchResult.detailedRationale}`;

    return {
      reply,
      intent: 'match_position',
      data: matchResult
    };
  }

  // Intent 2: Describe Repo
  if (
    lower.includes('repo') ||
    lower.includes('repository') ||
    lower.startsWith('/repo') ||
    (currentRepo && lower.includes('describe this'))
  ) {
    let repoName = currentRepo || 'phgrey/grafin';
    
    // Check if user explicitly mentioned owner/repo in message
    const repoMatch = trimmed.match(/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)/);
    if (repoMatch) {
      repoName = repoMatch[1];
    } else {
      const cleanMsg = trimmed.replace(/^\/repo/i, '').replace(/describe repo/i, '').replace(/repository/i, '').trim();
      if (cleanMsg && cleanMsg.includes('/')) {
        repoName = cleanMsg;
      }
    }

    const repoAnalysis = await analyzeRepo(repoName, aiClient);

    const reply = `📊 **Repository Evaluation: ${repoAnalysis.repoName}**\n\n` +
      `• **Purpose**: ${repoAnalysis.purpose}\n` +
      `• **Primary Language**: ${repoAnalysis.stats.primaryLanguage}\n` +
      `• **Stars**: ${repoAnalysis.stats.stars} | **Forks**: ${repoAnalysis.stats.forks}\n` +
      `• **Activity Status**: \`${repoAnalysis.activityStatus}\`\n` +
      `• **Production Readiness Score**: **${repoAnalysis.productionReadiness.score}/100**\n\n` +
      `**Findings**:\n${repoAnalysis.productionReadiness.findings.join('\n')}\n\n` +
      `**AI Summary**:\n${repoAnalysis.summary}`;

    return {
      reply,
      intent: 'describe_repo',
      data: repoAnalysis
    };
  }

  // Intent 3: Describe Author / Describe Me
  if (
    lower.includes('describe me') ||
    lower.includes('who am i') ||
    lower.includes('my profile') ||
    lower.includes('my skills') ||
    lower.includes('author') ||
    lower.startsWith('/author') ||
    lower === 'describe'
  ) {
    const projectSets = await getProjectSets(authorUsername);
    let profile: any;

    if (projectSets.length > 0 && projectSets[0].repoList.length > 0) {
      profile = await analyzeProjectSet(projectSets[0].repoList, aiClient);
    } else {
      profile = await analyzeAuthorRepos(authorUsername, aiClient);
    }

    const reply = `👤 **Developer Profile: ${profile.authorUsername}**\n\n` +
      `• **Archetype**: ${profile.overallRating}\n` +
      `• **Evaluated Repositories**: ${profile.evaluatedReposCount}\n` +
      `• **Primary Languages**: ${profile.primaryLanguages.join(', ')}\n\n` +
      `**Key Strengths**:\n${profile.strengths.map((s: string) => `✅ ${s}`).join('\n')}\n\n` +
      `**Weaknesses / Opportunities**:\n${profile.weaknesses.map((w: string) => `⚠️ ${w}`).join('\n')}\n\n` +
      `**Synthesis**:\n${profile.synthesis}`;

    return {
      reply,
      intent: 'describe_me',
      data: profile
    };
  }

  // Intent 4: General AI Conversational Fallback
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an AI Candidate Assistant inside a developer portfolio app. Answer the user's inquiry concisely and helpfully in markdown.
Author Context: ${authorUsername}
Current Repo Focus: ${currentRepo || 'N/A'}
User Question: "${trimmed}"`
      });

      if (response.text) {
        return {
          reply: response.text.trim(),
          intent: 'general'
        };
      }
    } catch {
      // Fallback
    }
  }

  return {
    reply: `👋 **AI Candidate Assistant**\n\nI can assist you with:\n` +
      `1️⃣ **"Describe me"** – Summarize your candidate profile, archetype, & strengths.\n` +
      `2️⃣ **"Describe repository [owner/repo]"** – Get production readiness score & CI/CD findings.\n` +
      `3️⃣ **"Match me against [Job URL / Position text]"** – Evaluate suitability against a position document.`,
    intent: 'general'
  };
}
