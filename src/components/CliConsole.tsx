import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, CornerDownLeft, Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import { Author } from '../types';

interface CliConsoleProps {
  currentUser: Author | null;
  onRefreshFeed?: () => void;
}

export const CliConsole: React.FC<CliConsoleProps> = ({ currentUser, onRefreshFeed }) => {
  const [history, setHistory] = useState<Array<{ command: string; output: string }>>([
    {
      command: 'portfolio-cli help',
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
    }
  ]);

  const [inputVal, setInputVal] = useState('portfolio-cli ');
  const [isExecuting, setIsExecuting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleExecute = async (cmdToRun?: string) => {
    const cmd = (cmdToRun || inputVal).trim();
    if (!cmd) return;

    setIsExecuting(true);

    try {
      const res = await fetch('/api/cli/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          activeAuthorUsername: currentUser?.username || 'alex_chen'
        })
      });

      const data = await res.json();
      setHistory(prev => [...prev, { command: cmd, output: data.output }]);
      setInputVal('portfolio-cli ');
      setIsExecuting(false);

      if (onRefreshFeed && (cmd.includes('import') || cmd.includes('sync'))) {
        onRefreshFeed();
      }
    } catch (err) {
      setHistory(prev => [...prev, { command: cmd, output: '\x1b[31mError executing CLI command.\x1b[0m' }]);
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  // ANSI Color formatter for CLI terminal text
  const formatAnsi = (text: string) => {
    // Replace standard ANSI escape sequences with simple HTML styling
    const clean = text
      .replace(/\x1b\[31m/g, '<span class="text-rose-400 font-semibold">')
      .replace(/\x1b\[32m/g, '<span class="text-emerald-400 font-semibold">')
      .replace(/\x1b\[33m/g, '<span class="text-amber-300 font-semibold">')
      .replace(/\x1b\[36m/g, '<span class="text-cyan-300 font-semibold">')
      .replace(/\x1b\[90m/g, '<span class="text-zinc-500">')
      .replace(/\x1b\[1m/g, '<span class="font-bold text-zinc-100">')
      .replace(/\x1b\[1;32m/g, '<span class="font-bold text-emerald-300">')
      .replace(/\x1b\[0m/g, '</span>');

    return <span dangerouslySetInnerHTML={{ __html: clean }} />;
  };

  return (
    <div className="bg-slate-900 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col font-mono text-xs">
      
      {/* CLI Header */}
      <div className="px-5 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          </div>
          <span className="text-slate-200 font-bold flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-emerald-400" />
            portfolio-cli v2.5.0 — Admin Ingestion Shell
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">
            Author: <strong className="text-emerald-400">@{currentUser?.username || 'alex_chen'}</strong>
          </span>
          <button
            onClick={() => setHistory([])}
            className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] transition-colors cursor-pointer"
          >
            Clear Screen
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="p-5 h-[420px] overflow-y-auto space-y-4 bg-slate-950 text-slate-300 font-mono">
        
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="text-slate-500">portfolio-cli@host:~$</span>
              <span className="text-slate-100">{item.command}</span>
            </div>
            <div className="pl-4 text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
              {formatAnsi(item.output)}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Command Input Row */}
      <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center gap-3">
        <span className="text-emerald-400 font-bold pl-2 select-none">$</span>
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="portfolio-cli import gemini --title='Analysis Notebook'"
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none font-mono text-xs"
        />
        <button
          onClick={() => handleExecute()}
          disabled={isExecuting}
          className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
        >
          {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CornerDownLeft className="w-3.5 h-3.5" />}
          <span>Execute</span>
        </button>
      </div>

      {/* Quick Command Suggestions Row */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[10px]">
        <span className="text-slate-400 shrink-0 font-bold uppercase tracking-wider">Macros:</span>
        <button
          onClick={() => handleExecute('portfolio-cli invite generate --uses=5')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 cursor-pointer"
        >
          Generate Invite Token
        </button>
        <button
          onClick={() => handleExecute('portfolio-cli import gemini --title="Quantum Gemini Analysis"')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 cursor-pointer"
        >
          Ingest Gemini Notebook
        </button>
        <button
          onClick={() => handleExecute('portfolio-cli sync --all')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 cursor-pointer"
        >
          Sync All Ingestions
        </button>
      </div>

    </div>
  );
};
