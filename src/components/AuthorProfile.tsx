import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Author, PortfolioItem, ReferralToken } from '../types';
import { PortfolioCard } from './PortfolioCard';
import { 
  Key, 
  Copy, 
  Check, 
  Edit3, 
  Save, 
  MessageCircle, 
  Sparkles, 
  RefreshCw,
  Github,
  Bot,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface AuthorProfileProps {
  author: Author;
  items: PortfolioItem[];
  currentUser: Author | null;
  onUpdateBio?: (newBio: string) => void;
  onOpenNotebook?: (item: PortfolioItem) => void;
  onOpenGDoc?: (item: PortfolioItem) => void;
}

export const AuthorProfile: React.FC<AuthorProfileProps> = ({
  author,
  items,
  currentUser,
  onUpdateBio,
  onOpenNotebook,
  onOpenGDoc
}) => {
  const isSelf = currentUser?.username === author.username;
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(author.bioMarkdown);

  // GitHub App Banner Notice
  const [appInstalledNotice, setAppInstalledNotice] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('github_app') === 'installed') {
      setAppInstalledNotice(true);
    }
  }, []);

  // Referral Token Generator State
  const [maxUses, setMaxUses] = useState(5);
  const [generatedInvite, setGeneratedInvite] = useState<{ token: ReferralToken; inviteUrl: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingRef, setIsGeneratingRef] = useState(false);

  const handleSaveBio = async () => {
    if (onUpdateBio) {
      onUpdateBio(bioText);
    }

    try {
      await fetch(`/api/authors/${author.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bioMarkdown: bioText })
      });
      setIsEditingBio(false);
    } catch (err) {
      console.error('Error saving bio:', err);
    }
  };

  const handleGenerateReferral = async () => {
    setIsGeneratingRef(true);
    try {
      const res = await fetch('/api/referrals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: author.id, maxUses })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedInvite(data);
      }
      setIsGeneratingRef(false);
    } catch (err) {
      setIsGeneratingRef(false);
    }
  };

  const handleCopyInviteLink = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const githubAppInstallUrl = import.meta.env?.VITE_GITHUB_APP_INSTALL_URL || `https://github.com/apps/portfolist-candidate-agent/installations/new`;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* GitHub App Installation Success Notice Banner */}
      {appInstalledNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              🎉 <strong>GitHub App Successfully Installed!</strong> AI Candidate Agent is autonomously walking and indexing your repositories in the background. Open the <strong>AI Agent Chat Drawer</strong> to ask queries!
            </span>
          </div>
          <button
            onClick={() => setAppInstalledNotice(false)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-start sm:items-center gap-5">
            <img
              src={author.avatarUrl}
              alt={author.displayName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-blue-500/30 border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">{author.displayName}</h2>
                <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold">
                  {author.role}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-1">@{author.username}</p>
              
              {author.referredBy && (
                <p className="text-xs text-slate-600 font-mono mt-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>Invited by @{author.referredBy}</span>
                </p>
              )}
            </div>
          </div>

          {/* 1-CLICK GITHUB APP INSTALLATION BUTTON & Contact Methods */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {isSelf && (
              <a
                href={`${githubAppInstallUrl}?author=${author.username}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white font-bold text-xs rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 border border-indigo-500/30"
              >
                <Github className="w-4 h-4 text-white" />
                <span>Install GitHub App on Repositories</span>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-300" />
              </a>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {author.contactMethods.map((cm, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-mono">{cm.platform}: {cm.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bio Section with Markdown WYSIWYG Editor */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              AUTHOR BIOGRAPHY & SCOPE
            </h3>
            {isSelf && (
              <button
                onClick={() => setIsEditingBio(!isEditingBio)}
                className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingBio ? 'Cancel Editing' : 'Edit Bio Markdown'}</span>
              </button>
            )}
          </div>

          {isEditingBio ? (
            <div className="space-y-3">
              <textarea
                value={bioText}
                onChange={e => setBioText(e.target.value)}
                rows={6}
                className="w-full p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
              />
              <button
                onClick={handleSaveBio}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Bio</span>
              </button>
            </div>
          ) : (
            <div className="prose max-w-none bg-slate-50 p-5 rounded-lg border border-slate-200 text-xs text-slate-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {author.bioMarkdown}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Integrated Platforms Badges Row */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-mono text-[11px] font-bold uppercase tracking-wider shrink-0">CONNECTED INTEGRATIONS:</span>
          {author.integrations.map((ing, iIdx) => (
            <span
              key={iIdx}
              className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] shrink-0"
            >
              {ing.provider} ({ing.providerUserId})
            </span>
          ))}
        </div>

      </div>

      {/* Referral Link Generator Panel (Visible to self) */}
      {isSelf && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Author Referral Manager
              </h3>
              <p className="text-xs text-slate-500">
                Generate invite tokens for trusted collaborators.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-mono shrink-0">Usage Quota:</span>
              <select
                value={maxUses}
                onChange={e => setMaxUses(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-blue-500"
              >
                <option value={1}>1 Invite Use</option>
                <option value={3}>3 Invite Uses</option>
                <option value={5}>5 Invite Uses</option>
                <option value={10}>10 Invite Uses</option>
              </select>
            </div>

            <button
              onClick={handleGenerateReferral}
              disabled={isGeneratingRef}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isGeneratingRef ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-blue-400" />}
              <span>Generate Invite URL</span>
            </button>
          </div>

          {generatedInvite && (
            <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 font-bold">Invite Token: {generatedInvite.token.code}</span>
                <span className="text-[10px] text-slate-500 font-bold">Quota: {generatedInvite.token.maxUses} Uses</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}${generatedInvite.inviteUrl}`}
                  className="flex-1 px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none font-mono"
                />
                <button
                  onClick={() => handleCopyInviteLink(generatedInvite.inviteUrl)}
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy URL'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Author's Feed Section */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>AUTHOR PORTFOLIO ITEMS ({items.length})</span>
        </h3>

        {items.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs shadow-sm">
            No portfolio items imported for @{author.username} yet. Use CLI or Integrations Matrix to trigger sync.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map(item => (
              <PortfolioCard
                key={item.id}
                item={item}
                onOpenNotebook={onOpenNotebook}
                onOpenGDoc={onOpenGDoc}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
