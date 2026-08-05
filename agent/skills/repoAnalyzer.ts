import { execFile } from 'child_process';
import { promisify } from 'util';
import { GoogleGenAI } from '@google/genai';

const execFileAsync = promisify(execFile);

export interface RepoAnalysisResult {
  repoName: string;
  purpose: string;
  stats: {
    stars: number;
    forks: number;
    openIssues: number;
    primaryLanguage: string;
    languages: Record<string, number>;
    lastPushedAt: string;
  };
  activityStatus: 'actively_developed' | 'moderately_active' | 'stale' | 'archived';
  productionReadiness: {
    score: number; // 0 to 100
    hasCiCd: boolean;
    hasTests: boolean;
    hasDocumentation: boolean;
    findings: string[];
  };
  summary: string;
}

/**
 * Executes a gh CLI command safely using child_process.execFile.
 */
async function runGhCommand(args: string[]): Promise<any> {
  try {
    const { stdout } = await execFileAsync('gh', args);
    try {
      return JSON.parse(stdout);
    } catch {
      return stdout.trim();
    }
  } catch (err: any) {
    return { error: err.message || String(err) };
  }
}

/**
 * Skill 1: Analyze a single GitHub Repository
 */
export async function analyzeRepo(repoName: string, aiClient?: GoogleGenAI): Promise<RepoAnalysisResult> {
  console.log(`\n🔍 [Skill 1: analyze_repo] Inspecting GitHub repository: ${repoName}...`);

  // 1. Fetch metadata via gh CLI
  const meta = await runGhCommand([
    'repo', 'view', repoName,
    '--json', 'name,owner,stargazerCount,forkCount,description,primaryLanguage,languages,isArchived,pushedAt'
  ]);

  // Handle fallback if gh CLI returns error or repo not found
  if (meta.error || !meta.name) {
    console.warn(`⚠️ Warning: gh CLI query for ${repoName} encountered error/missing data: ${meta.error || 'Repo not accessible via gh CLI'}`);
  }

  // 2. Fetch workflows (CI/CD)
  const workflows = await runGhCommand(['workflow', 'list', '-R', repoName]);

  // 3. Search for test files/directories
  const testFiles = await runGhCommand([
    'api', `repos/${repoName}/contents`,
    '--jq', '[.[] | select(.name | test("test|spec|pytest|jest"; "i")) | .name]'
  ]);

  // 4. Determine activity status based on last pushed timestamp
  const lastPushDate = meta.pushedAt ? new Date(meta.pushedAt) : new Date();
  const daysSincePush = Math.floor((Date.now() - lastPushDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let activityStatus: RepoAnalysisResult['activityStatus'] = 'actively_developed';
  if (meta.isArchived) {
    activityStatus = 'archived';
  } else if (daysSincePush > 180) {
    activityStatus = 'stale';
  } else if (daysSincePush > 60) {
    activityStatus = 'moderately_active';
  }

  const hasCiCd = Array.isArray(workflows) ? workflows.length > 0 : false;
  const hasTests = Array.isArray(testFiles) ? testFiles.length > 0 : false;
  const hasDocumentation = Boolean(meta.description);

  // Compute production readiness score
  let prodScore = 50; // base score
  if (hasCiCd) prodScore += 20;
  if (hasTests) prodScore += 20;
  if (hasDocumentation) prodScore += 10;
  if (activityStatus === 'stale') prodScore -= 25;
  if (activityStatus === 'archived') prodScore -= 40;
  prodScore = Math.max(0, Math.min(100, prodScore));

  const languagesMap: Record<string, number> = {};
  if (Array.isArray(meta.languages)) {
    meta.languages.forEach((l: any) => {
      languagesMap[l.node?.name || l.name || 'Unknown'] = l.size || 1;
    });
  } else if (meta.primaryLanguage?.name) {
    languagesMap[meta.primaryLanguage.name] = 100;
  }

  // Generate AI Summary using Gemini if client is provided
  let purpose = meta.description || 'Repository purpose inferred from code structure.';
  let summary = `Repository ${repoName} is currently ${activityStatus.replace('_', ' ')} with a production readiness score of ${prodScore}/100.`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this GitHub repository metadata and summarize its core purpose, production readiness, and activity status:
Repo: ${repoName}
Description: ${meta.description || 'N/A'}
Primary Language: ${meta.primaryLanguage?.name || 'N/A'}
Languages: ${JSON.stringify(languagesMap)}
Last Pushed: ${meta.pushedAt || 'N/A'} (Days ago: ${daysSincePush})
Has Workflows/CI-CD: ${hasCiCd}
Has Test Directories: ${hasTests}
Production Score: ${prodScore}/100

Provide a concise 2-3 sentence summary covering:
1. What the repository is for.
2. Production readiness & maintainability.
3. Activity level status.`
      });
      if (response.text) {
        summary = response.text.trim();
      }
    } catch (e) {
      // Fallback silently if AI key missing or call fails
    }
  }

  return {
    repoName: meta.name || repoName,
    purpose,
    stats: {
      stars: meta.stargazerCount || 0,
      forks: meta.forkCount || 0,
      openIssues: meta.issueCount || 0,
      primaryLanguage: meta.primaryLanguage?.name || 'TypeScript/Python',
      languages: languagesMap,
      lastPushedAt: meta.pushedAt || new Date().toISOString(),
    },
    activityStatus,
    productionReadiness: {
      score: prodScore,
      hasCiCd,
      hasTests,
      hasDocumentation,
      findings: [
        hasCiCd ? '✅ CI/CD workflows detected' : '❌ No CI/CD workflow configurations found',
        hasTests ? '✅ Test files/directories present' : '⚠️ Test coverage appears minimal or missing',
        hasDocumentation ? '✅ Project description provided' : '⚠️ Missing clear project description',
        `📅 Last pushed ${daysSincePush} days ago (${activityStatus})`
      ]
    },
    summary
  };
}
