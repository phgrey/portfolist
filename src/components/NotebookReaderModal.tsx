import React, { useState } from 'react';
import { 
  X as CloseIcon, 
  Play, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink,
  FileCode
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PortfolioItem, NotebookCell } from '../types';

interface NotebookReaderModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export const NotebookReaderModal: React.FC<NotebookReaderModalProps> = ({ item, onClose }) => {
  const [copiedCellIndex, setCopiedCellIndex] = useState<number | null>(null);
  const [executedCells, setExecutedCells] = useState<Record<number, boolean>>({});

  if (!item || item.sourcePlatform !== 'gemini') return null;

  const cells: NotebookCell[] = item.contentPayload.cells || [
    {
      cell_type: 'markdown',
      source: [`# ${item.title}\n`, item.description]
    },
    {
      cell_type: 'code',
      execution_count: 1,
      source: [
        'import google.genai as genai\n',
        'client = genai.Client()\n',
        'response = client.models.generate_content(\n',
        '    model="gemini-2.5-flash",\n',
        '    contents="Execution test in notebook viewer"\n',
        ')\n',
        'print(response.text)'
      ],
      outputs: [
        { output_type: 'stream', text: ['Execution test in notebook viewer completed successfully.'] }
      ]
    }
  ];

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCellIndex(index);
    setTimeout(() => setCopiedCellIndex(null), 2000);
  };

  const handleSimulateRun = (index: number) => {
    setExecutedCells(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col overflow-hidden text-slate-800">
        
        {/* Top Notebook Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-sm">
              <FileCode className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {item.title}
                </h3>
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono font-bold">
                  Gemini .ipynb Notebook
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>Author: @{item.authorUsername}</span>
                <span>•</span>
                <span>Synced: {new Date(item.syncedAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors shadow-sm"
            >
              <span>Open Google Colab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notebook Render Canvas Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          
          {cells.map((cell, idx) => {
            const sourceText = Array.isArray(cell.source) ? cell.source.join('') : cell.source;

            if (cell.cell_type === 'markdown') {
              return (
                <div key={idx} className="prose max-w-none bg-white p-4 rounded-lg border border-slate-200 text-slate-800 text-xs shadow-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {sourceText}
                  </ReactMarkdown>
                </div>
              );
            }

            // Code Cell Render
            const isRun = executedCells[idx];

            return (
              <div key={idx} className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
                
                {/* Cell Header Bar */}
                <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-mono text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">In [{cell.execution_count ?? idx + 1}]:</span>
                    <span className="text-slate-500 text-[11px]">Python 3 (Gemini 2.5 Kernel)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSimulateRun(idx)}
                      className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current text-white" />
                      <span>{isRun ? 'Re-run Cell' : 'Run Cell'}</span>
                    </button>
                    <button
                      onClick={() => handleCopyCode(sourceText, idx)}
                      className="p-1 rounded text-slate-500 hover:text-slate-800 transition-colors"
                      title="Copy code"
                    >
                      {copiedCellIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Code Source Block */}
                <div className="p-4 bg-slate-900 font-mono text-xs text-slate-100 overflow-x-auto whitespace-pre leading-relaxed">
                  {sourceText}
                </div>

                {/* Cell Output Block */}
                {((cell.outputs && cell.outputs.length > 0) || isRun) && (
                  <div className="border-t border-slate-200 bg-slate-50 p-3.5 font-mono text-xs text-slate-800 flex items-start gap-2">
                    <span className="text-slate-500 text-[11px] select-none shrink-0 font-bold">Out [{cell.execution_count ?? idx + 1}]:</span>
                    <div className="flex-1 whitespace-pre-wrap text-slate-800">
                      {isRun ? (
                        <div className="text-emerald-700 font-bold flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                          <span>[Cell Executed] Response generated via @google/genai Python SDK kernel.</span>
                        </div>
                      ) : (
                        cell.outputs?.map((out, oIdx) => (
                          <div key={oIdx} className="text-slate-700 font-mono">
                            {out.text ? out.text.join('') : JSON.stringify(out.data || {})}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })}

        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span className="font-mono text-[11px]">Integrations Engine: Gemini Drive API & Colab Importer</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
