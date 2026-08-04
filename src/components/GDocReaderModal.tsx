import React from 'react';
import { X as CloseIcon, ExternalLink, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PortfolioItem } from '../types';

interface GDocReaderModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export const GDocReaderModal: React.FC<GDocReaderModalProps> = ({ item, onClose }) => {
  if (!item || item.sourcePlatform !== 'gdoc') return null;

  const markdownBody = item.contentPayload.bodyMarkdown || `# ${item.title}\n\n${item.description}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold">
                  Parsed Google Doc
                </span>
              </div>
              <p className="text-xs text-slate-500">Word Count: {item.contentPayload.wordCount || 350} words • Author: @{item.authorUsername}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors shadow-sm"
            >
              <span>Open Original Doc</span>
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

        {/* Content Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
          <div className="prose max-w-none bg-white p-6 rounded-lg border border-slate-200 text-xs text-slate-800 shadow-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdownBody}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span className="font-mono text-[11px]">Synced via Google Drive API Scope (Read-Only)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
          >
            Close Reader
          </button>
        </div>

      </div>
    </div>
  );
};
