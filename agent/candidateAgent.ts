import readline from 'readline';
import { GoogleGenAI } from '@google/genai';
import { processAgentMessage } from '../src/services/agentEngine';
import { startTelegramBot } from './telegramBot';
import { appConfig } from '../src/config/AppConfig';

// Initialize Gemini Client if API key is provided
const apiKey = appConfig.getAiConfig().apiKey;
let aiClient: GoogleGenAI | undefined = undefined;

if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
  console.log('✨ Gemini AI Reasoning Engine initialized successfully.');
} else {
  console.log('ℹ️ GEMINI_API_KEY not set. Operating in rule-based CLI fallback mode.');
}

// Start Telegram Bot if token exists
const telegramToken = appConfig.get<string>('telegram.botToken', process.env.TELEGRAM_BOT_TOKEN || '');
if (telegramToken) {
  startTelegramBot(telegramToken, aiClient);
}

// Print Banner
console.log(`
============================================================
🤖 CANDIDATE EVALUATOR AGENT (Interactive Chat Runner)
============================================================
Skills Equipped:
  1. Describe Me                     -> Candidate Archetype, Skills & Strengths
  2. Describe Repo <owner/repo>     -> Repo Stats, Prod Readiness Score & CI/CD
  3. Match Position <URL / Job spec> -> Suitability Match & Rationale
  4. Compare CV vs Position         -> Cross-Entity Skills & Condition Matrix
============================================================
Commands / Dialogue Examples:
  • "describe me"
  • "describe repo phgrey/grafin"
  • "match me against position: https://example.com/job/ai-architect"
  • "compare cv vs position: Senior AI Engineer, Remote"
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
    const res = await processAgentMessage({
      message: input,
      authorUsername: 'alex_chen',
      aiClient
    });
    console.log('\n' + res.reply);
  } catch (err: any) {
    console.error(`❌ Error executing agent turn: ${err.message || String(err)}`);
  }

  console.log('\n------------------------------------------------------------');
  rl.prompt();
});
