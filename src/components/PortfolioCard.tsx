import React, { useState } from 'react';
import { 
  Github, 
  Youtube, 
  FileCode, 
  FileText, 
  MessageSquare, 
  Image as ImageIcon, 
  Sparkles, 
  ExternalLink, 
  Star, 
  GitFork, 
  Share2, 
  Check, 
  ThumbsUp, 
  Eye, 
  ShieldCheck,
  Bookmark
} from 'lucide-react';
import { PortfolioItem } from '../types';

interface PortfolioCardProps {
  item: PortfolioItem;
  onOpenNotebook?: (item: PortfolioItem) => void;
  onOpenGDoc?: (item: PortfolioItem) => void;
  onOpenAuthor?: (username: string) => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  item,
  onOpenNotebook,
  onOpenGDoc,
  onOpenAuthor
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const getPlatformBadge = () => {
    // Black & White connection logos and badges for all platforms
    switch (item.sourcePlatform) {
      case 'gemini':
        return {
          icon: <FileCode className="w-3.5 h-3.5" />,
          label: 'Gemini Notebook',
        };
      case 'github':
        return {
          icon: <Github className="w-3.5 h-3.5" />,
          label: 'GitHub Repo',
        };
      case 'gdoc':
        return {
          icon: <FileText className="w-3.5 h-3.5" />,
          label: 'Google Doc',
        };
      case 'youtube':
        return {
          icon: <Youtube className="w-3.5 h-3.5" />,
          label: 'YouTube Video',
        };
      case 'reddit':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5" />,
          label: 'Reddit Thread',
        };
      case 'flickr':
        return {
          icon: <ImageIcon className="w-3.5 h-3.5" />,
          label: 'Flickr Album',
        };
      case 'metamask':
        return {
          icon: <Sparkles className="w-3.5 h-3.5" />,
          label: 'MetaMask Proof',
        };
      default:
        return {
          icon: <Bookmark className="w-3.5 h-3.5" />,
          label: item.sourcePlatform.toUpperCase(),
        };
    }
  };

  const badge = getPlatformBadge();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#item=${item.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between">
      <div>
        
        {/* Author Header Row */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => onOpenAuthor && onOpenAuthor(item.authorUsername)}
            className="flex items-center gap-2.5 text-left group/author cursor-pointer"
          >
            <img
              src={item.authorAvatar}
              alt={item.authorDisplayName}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 group-hover/author:ring-blue-500 transition-all"
            />
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover/author:text-blue-600 dark:group-hover/author:text-blue-400 transition-colors block leading-none">
                {item.authorDisplayName}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">@{item.authorUsername}</span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {/* Black / White Connection Badge */}
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-2xs">
              {badge.icon}
              {badge.label}
            </span>

            <button
              onClick={handleShare}
              className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
              title="Copy share intent URL"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Verified Author / Source Owner Flag */}
        {item.isAuthorOwner && (
          <div className="mb-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Verified Source Owner</span>
          </div>
        )}

        {/* Title */}
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug mb-2">
          {item.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
          {item.description}
        </p>

        {/* Content Type Specific Highlights */}
        
        {/* Gemini Notebook Specific Preview */}
        {item.sourcePlatform === 'gemini' && (
          <div className="mb-4 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
            <div className="flex items-center justify-between text-xs text-purple-900 dark:text-purple-300 font-mono mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Gemini 2.5 Code Cells Included
              </span>
              <span className="text-[10px] bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.5 rounded text-purple-800 dark:text-purple-200 font-bold">
                {item.contentPayload.cells?.length || 2} Cells
              </span>
            </div>
            <button
              onClick={() => onOpenNotebook && onOpenNotebook(item)}
              className="w-full py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Launch Interactive Notebook Viewer</span>
            </button>
          </div>
        )}

        {/* Google Doc Specific Preview */}
        {item.sourcePlatform === 'gdoc' && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center justify-between text-xs text-blue-900 dark:text-blue-300 font-mono mb-2">
              <span className="font-medium">Google Drive Doc Import</span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded text-blue-800 dark:text-blue-200 font-bold">
                {item.contentPayload.wordCount || 300} Words
              </span>
            </div>
            <button
              onClick={() => onOpenGDoc && onOpenGDoc(item)}
              className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Read Formatted Doc</span>
            </button>
          </div>
        )}

        {/* GitHub Stats */}
        {item.sourcePlatform === 'github' && (
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono mb-4">
            {item.contentPayload.stars !== undefined && (
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {item.contentPayload.stars} stars
              </span>
            )}
            {item.contentPayload.forks !== undefined && (
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <GitFork className="w-3.5 h-3.5" />
                {item.contentPayload.forks} forks
              </span>
            )}
          </div>
        )}

        {/* YouTube Stats */}
        {item.sourcePlatform === 'youtube' && (
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono mb-4">
            {item.contentPayload.duration && (
              <span className="bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 font-bold px-2 py-0.5 rounded">
                ⏱ {item.contentPayload.duration}
              </span>
            )}
            {item.contentPayload.views && (
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <Eye className="w-3.5 h-3.5" />
                {item.contentPayload.views.toLocaleString()} views
              </span>
            )}
          </div>
        )}

        {/* Flickr Photo Album Preview */}
        {item.sourcePlatform === 'flickr' && item.contentPayload.images && (
          <div className="grid grid-cols-3 gap-1.5 mb-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
            {item.contentPayload.images.slice(0, 3).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Flickr showcase"
                className="w-full h-16 object-cover hover:scale-105 transition-transform duration-300"
              />
            ))}
          </div>
        )}

        {/* MetaMask Web3 Proof Badge */}
        {item.sourcePlatform === 'metamask' && (
          <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-mono">
            <span className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Verified Base Mainnet
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">SIWE Signature</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.tags.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono border border-slate-200 dark:border-slate-700"
            >
              #{tag}
            </span>
          ))}
        </div>

      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          Synced: {new Date(item.syncedAt).toLocaleDateString()}
        </span>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          <span>View Source</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
};
