import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, User, FileCode, Target, MessageSquare, ExternalLink, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Author } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  intent?: string;
}

interface AgentChatDrawerProps {
  currentUser: Author | null;
  currentRepo?: string;
}

export function AgentChatDrawer({ currentUser, currentRepo }: AgentChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `👋 Hi **${currentUser?.displayName || currentUser?.username || 'Candidate'}**! I am your AI Candidate Assistant.\n\nAsk me anything or select a quick action below:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!currentUser) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsgId = `usr_${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          authorUsername: currentUser.username,
          currentRepo
        })
      });

      const data = await response.json();
      const assistantMsg: Message = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || data.error || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `❌ Error connecting to agent server: ${err.message || String(err)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 group"
          title="Open AI Candidate Assistant Chat"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full" />
          </div>
          <span className="font-medium text-sm">AI Agent Chat</span>
        </button>
      )}

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 sm:w-[420px] h-[580px] bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                  Candidate Evaluator AI
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-xs text-slate-400">Connected as @{currentUser.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Chat via Telegram Channel"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => handleSendMessage('Describe me')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-950 hover:border-indigo-500/50 border border-slate-700/60 text-slate-300 hover:text-indigo-300 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              Describe Me
            </button>
            <button
              onClick={() => handleSendMessage('Describe repo phgrey/grafin')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-950 hover:border-indigo-500/50 border border-slate-700/60 text-slate-300 hover:text-indigo-300 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              Describe Repo
            </button>
            <button
              onClick={() => handleSendMessage('Match me against position: https://example.com/job/ai-engineer')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-950 hover:border-indigo-500/50 border border-slate-700/60 text-slate-300 hover:text-indigo-300 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Match Position Link
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-900/50 text-sm">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.sender === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 p-2 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                Analyzing candidate skills & evaluation engine...
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask bot: describe me, describe repo, or paste job URL..."
                className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 text-sm focus:outline-none placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-colors shadow-md flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
