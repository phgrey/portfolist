import { GoogleGenAI } from '@google/genai';
import { analyzeRepo } from './skills/repoAnalyzer';
import { analyzeAuthorRepos } from './skills/authorProfiler';
import { matchAuthorToPosition } from './skills/positionMatcher';

/**
 * Basic Telegram Bot long-polling interface for Candidate Evaluator Agent.
 * Activated if TELEGRAM_BOT_TOKEN environment variable is set.
 */
export async function startTelegramBot(token: string, aiClient?: GoogleGenAI) {
  console.log(`\n🤖 Telegram Bot Service active! Listening for incoming candidate evaluation requests...`);
  
  let offset = 0;

  const pollTelegram = async () => {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=10`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          const msg = update.message;
          if (!msg || !msg.text) continue;

          const chatId = msg.chat.id;
          const text = msg.text.trim();

          console.log(`📩 Telegram msg received from [${chatId}]: "${text}"`);

          if (text.startsWith('/start') || text.startsWith('/help')) {
            await sendTelegramMessage(token, chatId, 
              `👋 *Candidate Evaluator Agent Bot*\n\n` +
              `Available Commands:\n` +
              `1️⃣ \`/repo <owner/repo>\` - Analyze single repo (stats, production readiness, status, purpose)\n` +
              `2️⃣ \`/author <username>\` - Profile author across public repos (strengths & weaknesses)\n` +
              `3️⃣ \`/match <username/repo> | <Job Description>\` - Compare author against position requirements`
            );
          } else if (text.startsWith('/repo')) {
            const repoName = text.replace('/repo', '').trim() || 'phgrey/grafin';
            await sendTelegramMessage(token, chatId, `⏳ Analyzing repository \`${repoName}\`...`);
            const result = await analyzeRepo(repoName, aiClient);
            await sendTelegramMessage(token, chatId, formatRepoAnalysisMarkdown(result));
          } else if (text.startsWith('/author')) {
            const author = text.replace('/author', '').trim() || 'alexchen-ai';
            await sendTelegramMessage(token, chatId, `⏳ Profiling author \`${author}\`...`);
            const profile = await analyzeAuthorRepos(author, aiClient);
            await sendTelegramMessage(token, chatId, formatAuthorProfileMarkdown(profile));
          } else if (text.startsWith('/match')) {
            const payload = text.replace('/match', '').trim();
            const parts = payload.split('|');
            const target = parts[0]?.trim() || 'phgrey/grafin';
            const positionDoc = parts[1]?.trim() || 'Senior AI Engineer skilled in Python, LangGraph, testing, and CI/CD.';

            await sendTelegramMessage(token, chatId, `⏳ Matching \`${target}\` against position specification...`);
            const match = await matchAuthorToPosition(target, positionDoc, undefined, aiClient);
            await sendTelegramMessage(token, chatId, formatPositionMatchMarkdown(match));
          }
        }
      }
    } catch (e: any) {
      console.warn(`⚠️ Telegram polling notice: ${e.message || String(e)}`);
    }

    setTimeout(pollTelegram, 3000);
  };

  pollTelegram();
}

async function sendTelegramMessage(token: string, chatId: number | string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });
  } catch (err: any) {
    console.error(`Failed to send Telegram message: ${err.message || String(err)}`);
  }
}

export function formatRepoAnalysisMarkdown(r: any): string {
  return `📊 *Repo Analysis: ${r.repoName}*\n\n` +
    `• *Purpose*: ${r.purpose}\n` +
    `• *Primary Language*: ${r.stats.primaryLanguage}\n` +
    `• *Stars*: ${r.stats.stars} | *Forks*: ${r.stats.forks}\n` +
    `• *Status*: \`${r.activityStatus}\`\n` +
    `• *Production Readiness Score*: *${r.productionReadiness.score}/100*\n\n` +
    `*Findings*:\n${r.productionReadiness.findings.join('\n')}\n\n` +
    `*AI Summary*:\n${r.summary}`;
}

export function formatAuthorProfileMarkdown(p: any): string {
  return `👤 *Author Profile: ${p.authorUsername}*\n\n` +
    `• *Archetype*: ${p.overallRating}\n` +
    `• *Primary Languages*: ${p.primaryLanguages.join(', ')}\n\n` +
    `*Strengths*:\n${p.strengths.map((s: string) => '✅ ' + s).join('\n')}\n\n` +
    `*Weaknesses*:\n${p.weaknesses.map((w: string) => '⚠️ ' + w).join('\n')}\n\n` +
    `*Synthesis*:\n${p.synthesis}`;
}

export function formatPositionMatchMarkdown(m: any): string {
  const verdictEmoji = m.isSuitable ? '✅ SUITABLE' : '❌ NOT SUITABLE';
  return `🎯 *Candidate Suitability Result*\n\n` +
    `*Verdict*: ${verdictEmoji} (${m.matchScore}/100 Fit Score)\n` +
    `*Candidate*: \`${m.authorUsername}\`\n\n` +
    `*Key Strengths*:\n${m.keyMatchingStrengths.map((s: string) => '• ' + s).join('\n')}\n\n` +
    `*Identified Gaps*:\n${m.identifiedGaps.map((g: string) => '• ' + g).join('\n')}\n\n` +
    `*Detailed Rationale*:\n${m.detailedRationale}`;
}
