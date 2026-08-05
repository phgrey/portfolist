import { GoogleGenAI } from '@google/genai';
import { analyzeRepo, RepoAnalysisResult } from './repoAnalyzer';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { getCachedAnalysis, saveCachedAnalysis, generateCacheKey } from '../../src/services/agentMemory';

const execFileAsync = promisify(execFile);

export interface AuthorProfileResult {
  authorUsername: string;
  evaluatedReposCount: number;
  overallRating: string; // e.g. "Senior Software Architect / AI Engineer"
  primaryLanguages: string[];
  strengths: string[];
  weaknesses: string[];
  repoAnalyses: RepoAnalysisResult[];
  synthesis: string;
}

/**
 * Skill 2B: Analyze a custom project set of GitHub repositories with 2-tier memory caching
 */
export async function analyzeProjectSet(
  repoList: string[],
  aiClient?: GoogleGenAI,
  forceRefresh: boolean = false
): Promise<AuthorProfileResult> {
  const cacheKey = generateCacheKey(repoList);

  if (!forceRefresh) {
    const cached = await getCachedAnalysis(cacheKey);
    if (cached?.result) {
      console.log(`⚡ [authorProfiler] Returning cached skill analysis for ${repoList.length} repos (Key: ${cacheKey})`);
      return cached.result as AuthorProfileResult;
    }
  }

  console.log(`🔍 [authorProfiler] Cache miss/refresh. Running full skill analysis for ${repoList.length} repos...`);
  const result = await analyzeAuthorRepos(repoList, aiClient);

  // Persist result to 2-tier memory (L1 RAM + L2 Firestore)
  await saveCachedAnalysis(cacheKey, repoList, result);

  return result;
}

/**
 * Skill 2: Analyze an author by a set of GitHub repositories
 */
export async function analyzeAuthorRepos(
  authorOrRepoList: string | string[],
  aiClient?: GoogleGenAI
): Promise<AuthorProfileResult> {
  let reposToAnalyze: string[] = [];
  let authorUsername = 'author';

  if (Array.isArray(authorOrRepoList)) {
    reposToAnalyze = authorOrRepoList;
    if (reposToAnalyze.length > 0 && reposToAnalyze[0].includes('/')) {
      authorUsername = reposToAnalyze[0].split('/')[0];
    }
  } else if (authorOrRepoList.includes('/')) {
    reposToAnalyze = [authorOrRepoList];
    authorUsername = authorOrRepoList.split('/')[0];
  } else {
    authorUsername = authorOrRepoList;
    // Fetch public repos of the user via gh CLI
    try {
      const { stdout } = await execFileAsync('gh', [
        'repo', 'list', authorUsername, '--limit', '5', '--json', 'nameWithOwner'
      ]);
      const list = JSON.parse(stdout);
      if (Array.isArray(list)) {
        reposToAnalyze = list.map((item: any) => item.nameWithOwner);
      }
    } catch {
      reposToAnalyze = [`${authorUsername}/grafin`, `${authorUsername}/agentic-workflow`];
    }
  }

  console.log(`\n👤 [Skill 2: analyze_author_repos] Profiling author "${authorUsername}" across ${reposToAnalyze.length} repository(ies)...`);

  const repoAnalyses: RepoAnalysisResult[] = [];
  for (const repoName of reposToAnalyze) {
    const analysis = await analyzeRepo(repoName, aiClient);
    repoAnalyses.push(analysis);
  }

  // Aggregate languages
  const languageCounts: Record<string, number> = {};
  let totalTests = 0;
  let totalCiCd = 0;

  repoAnalyses.forEach(r => {
    Object.keys(r.stats.languages).forEach(lang => {
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    });
    if (r.productionReadiness.hasTests) totalTests++;
    if (r.productionReadiness.hasCiCd) totalCiCd++;
  });

  const primaryLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([lang]) => lang);

  // Determine strengths & weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (primaryLanguages.includes('Python')) strengths.push('Proficient in Python core ecosystem & scripting');
  if (primaryLanguages.includes('TypeScript') || primaryLanguages.includes('JavaScript')) {
    strengths.push('Full-stack web proficiency (TypeScript/Node.js)');
  }
  if (totalCiCd > 0) {
    strengths.push(`Good CI/CD practices (${totalCiCd}/${repoAnalyses.length} repos have automated workflows)`);
  } else {
    weaknesses.push('Average/Weak CI/CD setup: missing automated GitHub workflows');
  }

  if (totalTests > 0) {
    strengths.push(`Testing habits present (${totalTests}/${repoAnalyses.length} repos contain test suites)`);
  } else {
    weaknesses.push('Weak testing habits: test suites missing or sparse across repositories');
  }

  let synthesis = `Author ${authorUsername} demonstrates strength in ${primaryLanguages.join(', ') || 'software engineering'}.`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this developer profile based on their GitHub repositories:
Author: ${authorUsername}
Evaluated Repos: ${JSON.stringify(repoAnalyses.map(r => ({
          name: r.repoName,
          purpose: r.purpose,
          primaryLanguage: r.stats.primaryLanguage,
          prodScore: r.productionReadiness.score,
          hasTests: r.productionReadiness.hasTests,
          hasCiCd: r.productionReadiness.hasCiCd
        })))}

Synthesize a comprehensive software engineer profile covering:
1. Overall Technical Strengths (languages, architectural patterns, domain expertise)
2. Engineering Weaknesses (e.g. testing coverage, CI/CD tuning, maintenance consistency)
3. Developer Archetype rating (e.g. Senior Systems Engineer, Fast Prototyper, AI Developer)`
      });
      if (response.text) {
        synthesis = response.text.trim();
      }
    } catch {
      // Fallback silently
    }
  }

  return {
    authorUsername,
    evaluatedReposCount: repoAnalyses.length,
    overallRating: primaryLanguages.length > 1 ? 'Senior Multi-Disciplinary Software Engineer' : 'Specialized Developer',
    primaryLanguages,
    strengths,
    weaknesses,
    repoAnalyses,
    synthesis
  };
}

