import dotenv from 'dotenv';
import readline from 'readline';
import { GoogleGenAI } from '@google/genai';
import { analyzeRepo } from './skills/repoAnalyzer';
import { analyzeAuthorRepos } from './skills/authorProfiler';
import { matchAuthorToPosition } from './skills/positionMatcher';
import { startTelegramBot, formatRepoAnalysisMarkdown, formatAuthorProfileMarkdown, formatPositionMatchMarkdown } from './telegramBot';

dotenv.config();

// Initialize Gemini Client if API key is provided
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
let aiClient: GoogleGenAI | undefined = undefined;

if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
  console.log('✨ Gemini AI Reasoning Engine initialized successfully.');
} else {
  console.log('ℹ️ GEMINI_API_KEY not set. Operating in rule-based CLI fallback mode.');
}

// Start Telegram Bot if token exists
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
if (telegramToken) {
  startTelegramBot(telegramToken, aiClient);
}

// Print Banner
console.log(`
============================================================
🤖 CANDIDATE EVALUATOR AGENT (Interactive Chat Runner)
============================================================
Skills Equipped:
  1. analyze_repo <repo_name>           -> Stats, Prod Readiness, Stale/Active, Purpose
  2. analyze_author <username_or_repo> -> Author Strengths & Weaknesses
  3. match_candidate <repo> | <JD>      -> Candidate vs Position Match Assessment
============================================================
Commands:
  • analyze_repo <owner/repo>
  • analyze_author <username>
  • match_candidate <owner/repo> | <job_description_text>
  • exit / quit
============================================================
`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Agent Chat > '
});

rl.prompt();

rl.on('line', async (line) => {
  const input = line.trim();
  if (!input) {
    rl.prompt();
    return;
  }

  if (input === 'exit' || input === 'quit') {
    console.log('👋 Goodbye!');
    process.exit(0);
  }

  try {
    if (input.startsWith('analyze_repo') || input.startsWith('/repo')) {
      const repoName = input.replace(/^(analyze_repo|\/repo)/, '').trim() || 'phgrey/grafin';
      console.log(`\n⏳ Skill 1 running for "${repoName}"...`);
      const result = await analyzeRepo(repoName, aiClient);
      console.log('\n' + formatRepoAnalysisMarkdown(result));
    } else if (input.startsWith('analyze_author') || input.startsWith('/author')) {
      const author = input.replace(/^(analyze_author|\/author)/, '').trim() || 'alexchen-ai';
      console.log(`\n⏳ Skill 2 running for "${author}"...`);
      const profile = await analyzeAuthorRepos(author, aiClient);
      console.log('\n' + formatAuthorProfileMarkdown(profile));
    } else if (input.startsWith('match_candidate') || input.startsWith('/match')) {
      const payload = input.replace(/^(match_candidate|\/match)/, '').trim();
      const parts = payload.split('|');
      const target = parts[0]?.trim() || 'phgrey/grafin';
      const jdText = parts[1]?.trim() || 'Senior AI Systems Engineer with Python, LangGraph, pytest, and GitHub Actions CI/CD skills.';

      console.log(`\n⏳ Skill 3 running for "${target}"...`);
      const match = await matchAuthorToPosition(target, jdText, undefined, aiClient);
      console.log('\n' + formatPositionMatchMarkdown(match));
    } else {
      // Conversational query dispatch
      console.log(`\n💬 Received natural language query: "${input}"`);
      if (input.includes('/')) {
        console.log('Dispatching to Skill 1 (analyze_repo)...');
        const res = await analyzeRepo(input, aiClient);
        console.log('\n' + formatRepoAnalysisMarkdown(res));
      } else {
        console.log('Dispatching to Skill 2 (analyze_author)...');
        const prof = await analyzeAuthorRepos(input, aiClient);
        console.log('\n' + formatAuthorProfileMarkdown(prof));
      }
    }
  } catch (err: any) {
    console.error(`❌ Error executing agent turn: ${err.message || String(err)}`);
  }

  console.log('\n------------------------------------------------------------');
  rl.prompt();
});
