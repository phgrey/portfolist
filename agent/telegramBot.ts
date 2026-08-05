import { GoogleGenAI } from '@google/genai';
import { processAgentMessage } from '../src/services/agentEngine';

/**
 * Telegram Bot Gateway connected directly to Unified Candidate Agent Engine
 * Activated if TELEGRAM_BOT_TOKEN environment variable is set.
 */
export async function startTelegramBot(token: string, aiClient?: GoogleGenAI) {
  console.log(`\n🤖 Telegram Bot Channel active! Connected to Candidate Agent Engine...`);
  
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
          const telegramUser = msg.from?.username || 'alex_chen';

          console.log(`📩 [Telegram Channel] Msg from [${chatId} / @${telegramUser}]: "${text}"`);

          if (text.startsWith('/start') || text.startsWith('/help')) {
            await sendTelegramMessage(token, chatId, 
              `👋 *Candidate Evaluator Agent Bot*\n\n` +
              `Connected to Candidate Portfolio Engine (@${telegramUser}).\n\n` +
              `*Available Commands / Dialogue*:\n` +
              `1️⃣ \`/author\` or \`describe me\` – Profile candidate skills & archetype\n` +
              `2️⃣ \`/repo <owner/repo>\` – Evaluate repository stats & readiness\n` +
              `3️⃣ \`/match <Job spec or URL>\` – Match candidate against position link/spec`
            );
          } else {
            await sendTelegramMessage(token, chatId, `⏳ *Agent evaluating request...*`);
            const agentResponse = await processAgentMessage({
              message: text,
              authorUsername: telegramUser,
              aiClient
            });
            await sendTelegramMessage(token, chatId, agentResponse.reply);
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
