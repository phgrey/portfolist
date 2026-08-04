import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Globe, 
  Github, 
  Youtube, 
  MessageSquare, 
  Image as ImageIcon, 
  Sparkles, 
  Layers, 
  RefreshCw,
  Zap,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { Author } from '../types';

interface IntegrationsMatrixProps {
  currentUser: Author | null;
  onSyncPlatform: (platform: string) => void;
}

export const IntegrationsMatrix: React.FC<IntegrationsMatrixProps> = ({ currentUser, onSyncPlatform }) => {
  const [syncedMap, setSyncedMap] = useState<Record<string, boolean>>({});

  const handleSync = (platformKey: string) => {
    setSyncedMap(prev => ({ ...prev, [platformKey]: true }));
    onSyncPlatform(platformKey);
  };

  const matrixData = [
    {
      platform: 'GitHub',
      icon: <Github className="w-4 h-4 text-zinc-100" />,
      signIn: true,
      contactLink: true,
      shareIntent: false,
      portfolioImport: 'Public repos, Orgs, Gists',
      cliSync: true,
      key: 'github'
    },
    {
      platform: 'Google / Gemini',
      icon: <Globe className="w-4 h-4 text-red-400" />,
      signIn: true,
      contactLink: false,
      shareIntent: false,
      portfolioImport: 'Google Docs, Gemini Notebooks (.ipynb)',
      cliSync: true,
      key: 'gemini'
    },
    {
      platform: 'YouTube',
      icon: <Youtube className="w-4 h-4 text-rose-400" />,
      signIn: true,
      contactLink: true,
      shareIntent: false,
      portfolioImport: 'Videos, Playlists, Channels',
      cliSync: true,
      key: 'youtube'
    },
    {
      platform: 'Reddit',
      icon: <MessageSquare className="w-4 h-4 text-orange-400" />,
      signIn: true,
      contactLink: true,
      shareIntent: false,
      portfolioImport: 'Posts, Subreddit threads',
      cliSync: true,
      key: 'reddit'
    },
    {
      platform: 'Flickr',
      icon: <ImageIcon className="w-4 h-4 text-pink-400" />,
      signIn: true,
      contactLink: true,
      shareIntent: false,
      portfolioImport: 'Photo Sets, Galleries',
      cliSync: true,
      key: 'flickr'
    },
    {
      platform: 'X (Twitter)',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      signIn: true,
      contactLink: true,
      shareIntent: true,
      portfolioImport: 'Tweets, Threads',
      cliSync: true,
      key: 'twitter'
    },
    {
      platform: 'MetaMask (Web3)',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      signIn: true,
      contactLink: false,
      shareIntent: false,
      portfolioImport: 'NFTs / Wallet Proof (SIWE)',
      cliSync: true,
      key: 'metamask'
    },
    {
      platform: 'Apple / Microsoft',
      icon: <Lock className="w-4 h-4 text-blue-400" />,
      signIn: true,
      contactLink: false,
      shareIntent: false,
      portfolioImport: 'OAuth Authentication Provider',
      cliSync: false,
      key: 'apple'
    },
    {
      platform: 'Discord',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
      signIn: true,
      contactLink: true,
      shareIntent: false,
      portfolioImport: 'Social Identity & Pinned Handle',
      cliSync: false,
      key: 'discord'
    },
    {
      platform: 'WhatsApp / Telegram',
      icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
      signIn: false,
      contactLink: true,
      shareIntent: false,
      portfolioImport: 'Pinned Public Contact Method',
      cliSync: false,
      key: 'whatsapp'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Matrix Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Integration Levels & Capability Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete architectural matrix mapping sign-in, contact links, share intent, and portfolio content import capabilities.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 font-bold">
          <span>Active User: @{currentUser?.username || 'Guest'}</span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-700">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4 font-bold">Platform</th>
                <th className="py-3.5 px-3 text-center font-bold">Sign-in / Up</th>
                <th className="py-3.5 px-3 text-center font-bold">Contact Link</th>
                <th className="py-3.5 px-3 text-center font-bold">Share Intent</th>
                <th className="py-3.5 px-4 font-bold">Portfolio Content Import</th>
                <th className="py-3.5 px-3 text-center font-bold">CLI / Admin Sync</th>
                <th className="py-3.5 px-4 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrixData.map((row, idx) => {
                const isSynced = syncedMap[row.key];

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      {row.icon}
                      <span>{row.platform}</span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {row.signIn ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-50 text-emerald-600 font-bold">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 text-slate-400">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {row.contactLink ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-50 text-emerald-600 font-bold">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 text-slate-400">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {row.shareIntent ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-50 text-emerald-600 font-bold">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 text-slate-400">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 text-xs font-sans">
                      {row.portfolioImport}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {row.cliSync ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] border border-blue-200 font-bold">
                          Yes (portfolio-cli)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">N/A</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {row.cliSync && (
                        <button
                          onClick={() => handleSync(row.key)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer shadow-sm ${
                            isSynced
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {isSynced ? 'Synced OK' : 'Trigger Sync'}
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
