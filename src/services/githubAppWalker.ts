import { GoogleGenAI } from '@google/genai';
import { analyzeAuthorRepos, analyzeProjectSet, AuthorProfileResult } from '../../agent/skills/authorProfiler';
import { analyzeRepo } from '../../agent/skills/repoAnalyzer';
import { saveCachedAnalysis, saveProjectSet, generateCacheKey } from './agentMemory';
import { savePortfolioEntity } from './entityMemory';
import { PortfolioEntity } from '../types';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface AgentWalkerOptions {
  authorUsername: string;
  installationId?: string;
  aiClient?: GoogleGenAI;
}

export interface WalkerResult {
  authorUsername: string;
  installationId?: string;
  walkedReposCount: number;
  reposList: string[];
  authorProfile: AuthorProfileResult;
}

/**
 * Autonomous Background Agent Repo Walker
 * Walks over an author's GitHub App repositories, analyzes code & CI/CD, and populates 2-tier memory
 */
export async function walkAndIndexRepositories(options: AgentWalkerOptions): Promise<WalkerResult> {
  const { authorUsername, installationId, aiClient } = options;

  console.log(`\n🤖 [Agent Walker] Starting autonomous background traversal for author "@${authorUsername}" (Installation ID: ${installationId || 'N/A'})...`);

  // 1. Fetch public/granted repositories for author via gh CLI or API
  let reposList: string[] = [];
  try {
    const { stdout } = await execFileAsync('gh', [
      'repo', 'list', authorUsername, '--limit', '10', '--json', 'nameWithOwner'
    ]);
    const list = JSON.parse(stdout);
    if (Array.isArray(list) && list.length > 0) {
      reposList = list.map((item: any) => item.nameWithOwner);
    }
  } catch (e: any) {
    console.warn(`⚠️ [Agent Walker] gh CLI repo query fallback for @${authorUsername}: ${e.message || String(e)}`);
  }

  if (reposList.length === 0) {
    reposList = [`${authorUsername}/grafin`, `${authorUsername}/agentic-workflow`];
  }

  console.log(`🔍 [Agent Walker] Found ${reposList.length} repository(ies) to walk: ${reposList.join(', ')}`);

  // 2. Sequentially walk each repository
  for (const repoName of reposList) {
    console.log(`⏳ [Agent Walker] Inspecting & indexing repository: ${repoName}...`);
    const repoAnalysis = await analyzeRepo(repoName, aiClient);

    // Save repository into PortfolioEntity store
    const repoEntity: PortfolioEntity = {
      id: `ent_repo_${repoName.replace('/', '_')}`,
      authorId: `usr_${authorUsername}`,
      authorUsername,
      entityType: 'repo',
      title: repoName,
      sourceUrl: `https://github.com/${repoName}`,
      contentRaw: `${repoAnalysis.purpose}\n\nPrimary Language: ${repoAnalysis.stats.primaryLanguage}\nProduction Readiness Score: ${repoAnalysis.productionReadiness.score}/100\nFindings: ${repoAnalysis.productionReadiness.findings.join('; ')}`,
      extractedSkills: {
        primaryLanguages: [repoAnalysis.stats.primaryLanguage],
        frameworksAndTools: repoAnalysis.productionReadiness.hasCiCd ? ['GitHub Actions / CI-CD'] : [],
        domainExpertise: [repoAnalysis.purpose],
        softSkills: ['Code Maintainability']
      },
      conditions: {
        experienceLevel: repoAnalysis.activityStatus === 'actively_developed' ? 'Active Maintenance' : 'Archived / Stale'
      },
      updatedAt: new Date().toISOString()
    };

    await savePortfolioEntity(repoEntity);
  }

  // 3. Perform aggregate author profile synthesis & save custom project set
  console.log(`👤 [Agent Walker] Synthesizing overall author profile for @${authorUsername}...`);
  const authorProfile = await analyzeAuthorRepos(reposList, aiClient);

  // Save project set & analysis to 2-tier memory
  await saveProjectSet(`usr_${authorUsername}`, authorUsername, 'github-app-repos', reposList, false);
  const cacheKey = generateCacheKey(reposList);
  await saveCachedAnalysis(cacheKey, reposList, authorProfile);

  console.log(`✅ [Agent Walker] Completed autonomous background traversal for @${authorUsername}! Indexed ${reposList.length} repos into 2-tier memory.\n`);

  return {
    authorUsername,
    installationId,
    walkedReposCount: reposList.length,
    reposList,
    authorProfile
  };
}
