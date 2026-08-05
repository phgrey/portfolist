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
  ArrowUpRight,
  DownloadCloud,
  ExternalLink
} from 'lucide-react';
import { Author, PlatformType } from '../types';
import { linkAdditionalProvider } from '../services/authProviders';

interface IntegrationsMatrixProps {
  currentUser: Author | null;
  onSyncPlatform: (platform: string) => void;
}

export const IntegrationsMatrix: React.FC<IntegrationsMatrixProps> = ({ currentUser, onSyncPlatform }) => {
  const [syncedMap, setSyncedMap] = useState<Record<string, boolean>>({});
  const [isLinking, setIsLinking] = useState<string | null>(null);

  const handleSync = async (platformKey: string) => {
    setSyncedMap(prev => ({ ...prev, [platformKey]: true }));
    onSyncPlatform(platformKey);
  };

  const handleLinkOAuth = async (platformKey: PlatformType) => {
    setIsLinking(platformKey);
    try {
      await linkAdditionalProvider(platformKey);
      setSyncedMap(prev => ({ ...prev, [platformKey]: true }));
      onSyncPlatform(platformKey);
    } catch (err: any) {
      console.warn(`⚠️ Linking notice: ${err.message || String(err)}`);
    } finally {
      setIsLinking(null);
    }
  };

  const isConnected = (key: string) => {
    if (!currentUser?.integrations) return false;
    return currentUser.integrations.some(i => i.provider.toLowerCase() === key.toLowerCase());
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
      key: 'github' as PlatformType
    },
    {
      platform: 'Google / Gemini Docs',
      icon: <Globe className="w-4 h-4 text-red-400" />,
      signIn: true,
      contactLink: false,
      shareIntent: false,
      portfolioImport: 'Google Docs (documents.readonly), Gemini Notebooks',
      cliSync: true,
      key: 'google' as PlatformType
    },
    {
      platform: 'YouTube',
      icon: <Youtube className="w-4 h-4 text-rose-400" />,
      signIn: true,
      contactLink: true,
      shareIntent: false,
      portfolioImport: 'Videos, Playlists, Channels',
      cliSync: true,
      key: 'youtube' as PlatformType
    },
    {
      platform: 'Reddit',
      icon: <MessageSquare className="w-4 h-4 text-orange-400" />,
      signIn: true,
      contactLink: true,
      shareIntent: false,
      portfolioImport: 'Posts, Subreddit threads',
      cliSync: true,
      key: 'reddit' as PlatformType
    },
    {
      platform: 'Flickr',
      icon: <ImageIcon className="w-4 h-4 text-pink-400" />,
      signIn: true,
      contactLink: true,
      shareIntent: false,
      portfolioImport: 'Photo Sets, Galleries',
      cliSync: true,
      key: 'flickr' as PlatformType
    },
    {
      platform: 'LinkedIn / X (Twitter)',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      signIn: true,
      contactLink: true,
      shareIntent: true,
      portfolioImport: 'OIDC Identity & Professional Posts',
      cliSync: true,
      key: 'twitter' as PlatformType
    },
    {
      platform: 'MetaMask (Web3)',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      signIn: true,
      contactLink: false,
      shareIntent: false,
      portfolioImport: 'NFTs / Wallet Proof (SIWE)',
      cliSync: true,
      key: 'metamask' as PlatformType
    },
    {
      platform: 'Apple / Microsoft',
      icon: <Lock className="w-4 h-4 text-blue-400" />,
      signIn: true,
      contactLink: false,
      shareIntent: false,
      portfolioImport: 'OAuth Authentication Provider',
      cliSync: false,
      key: 'apple' as PlatformType
    },
    {
      platform: 'Discord',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
      signIn: true,
      contactLink: true,
      shareIntent: false,
      portfolioImport: 'Social Identity & Pinned Handle',
      cliSync: false,
      key: 'discord' as PlatformType
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Matrix Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Integrations Hub & Multi-Provider Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage connected OAuth providers (GitHub, Google Docs, LinkedIn) and manually trigger repository ingestion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 1-CLICK GITHUB APP INSTALLATION BUTTON */}
          <a
            href={import.meta.env?.VITE_GITHUB_APP_INSTALL_URL || 'https://github.com/apps/portfolist-candidate-agent/installations/new'}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition-all hover:scale-105 border border-slate-700"
          >
            <Github className="w-4 h-4 text-white" />
            <span>Install GitHub App</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* MANUAL INGESTION BUTTON (On-Demand Trigger as requested) */}
          <button
            onClick={() => handleSync('github')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition-all hover:scale-105"
          >
            <DownloadCloud className="w-4 h-4" />
            Ingest / Sync Repositories
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 font-bold">
            <span>@{currentUser?.username || 'Guest'}</span>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-700">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4 font-bold">Platform</th>
                <th className="py-3.5 px-3 text-center font-bold">OAuth Identity</th>
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
                const connected = isConnected(row.key);

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      {row.icon}
                      <span>{row.platform}</span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {connected ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-200 font-bold">
                          <Check className="w-3 h-3" /> Connected
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
                      {row.signIn && (
                        <button
                          onClick={() => handleLinkOAuth(row.key)}
                          disabled={isLinking === row.key}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer shadow-sm ${
                            connected || isSynced
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {isLinking === row.key ? (
                            'Connecting...'
                          ) : connected || isSynced ? (
                            'Connected'
                          ) : (
                            'Connect OAuth'
                          )}
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
