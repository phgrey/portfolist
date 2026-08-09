import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Author, PortfolioItem, ReferralToken } from '../types';
import { PortfolioCard } from './PortfolioCard';
import {
  Avatar,
  Typography,
  Button,
  Chip,
  ChipLabel
} from '@material-tailwind/react';

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
  ExternalLink,
  CheckCircle2,
  User,
  FolderGit2,
  ShieldCheck,
  Plus,
  Trash2,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';

interface AuthorProfileProps {
  author: Author;
  items: PortfolioItem[];
  currentUser: Author | null;
  onUpdateBio?: (newBio: string) => void;
  onUpdateAuthor?: (updatedAuthor: Author) => void;
  onRefreshFeed?: () => void;
  onOpenNotebook?: (item: PortfolioItem) => void;
  onOpenGDoc?: (item: PortfolioItem) => void;
  onWalkItem?: (item: PortfolioItem) => void;
}

export const AuthorProfile: React.FC<AuthorProfileProps> = ({
  author,
  items,
  currentUser,
  onUpdateBio,
  onUpdateAuthor,
  onRefreshFeed,
  onOpenNotebook,
  onOpenGDoc,
  onWalkItem
}) => {
  const isSelf = currentUser?.username === author.username;
  
  // GitHub is the FIRST, DEFAULT-OPEN tab
  const [activeTab, setActiveTab] = useState<'github' | 'bio' | 'referrals'>('github');

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(author.bioMarkdown);

  // GitHub Syncing state
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [githubSyncSuccess, setGithubSyncSuccess] = useState<string | null>(null);

  // Portfolio URL Add / Remove Bar State
  const [portfolioUrlInput, setPortfolioUrlInput] = useState('');
  const [isAddingPortfolioItem, setIsAddingPortfolioItem] = useState(false);
  const [isRemovingPortfolioItem, setIsRemovingPortfolioItem] = useState(false);
  const [portfolioFeedback, setPortfolioFeedback] = useState<{ message: string; isError: boolean } | null>(null);

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

  const resolvePlatformFromUrl = (urlStr: string): string => {
    const lower = (urlStr || '').trim().toLowerCase();
    if (lower.includes('github.com')) return 'github';
    if (lower.includes('colab.research.google.com') || lower.includes('.ipynb')) return 'gemini';
    if (lower.includes('docs.google.com')) return 'gdoc';
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('reddit.com')) return 'reddit';
    if (lower.includes('flickr.com')) return 'flickr';
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
    return 'url'; // Fallback to generic URL item if no types matched
  };

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

  const handleSyncGithubProfile = async () => {
    setIsSyncingGithub(true);
    setGithubSyncSuccess(null);
    try {
      const res = await fetch(`/api/authors/${author.username}/sync-github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success && data.author) {
        setGithubSyncSuccess(`Successfully synced GitHub profile for @${data.author.username}!`);
        if (onUpdateAuthor) {
          onUpdateAuthor(data.author);
        }
      }
      setIsSyncingGithub(false);
    } catch (err) {
      console.error('Error syncing GitHub profile:', err);
      setIsSyncingGithub(false);
    }
  };

  const handleAddPortfolioItem = async () => {
    if (!portfolioUrlInput.trim()) return;
    setIsAddingPortfolioItem(true);
    setPortfolioFeedback(null);
    try {
      const resolvedPlatform = resolvePlatformFromUrl(portfolioUrlInput);
      const res = await fetch('/api/portfolio/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorUsername: author.username,
          url: portfolioUrlInput.trim(),
          platform: resolvedPlatform
        })
      });
      const data = await res.json();
      if (data.success && data.item) {
        setPortfolioFeedback({ message: `Successfully added portfolio item "${data.item.title}" (${resolvedPlatform.toUpperCase()})`, isError: false });
        setPortfolioUrlInput('');
        if (onRefreshFeed) onRefreshFeed();
      } else {
        setPortfolioFeedback({ message: data.error || 'Failed to add portfolio item.', isError: true });
      }
    } catch (err: any) {
      setPortfolioFeedback({ message: err.message || String(err), isError: true });
    } finally {
      setIsAddingPortfolioItem(false);
    }
  };

  const handleRemovePortfolioItem = async () => {
    if (!portfolioUrlInput.trim()) return;
    setIsRemovingPortfolioItem(true);
    setPortfolioFeedback(null);
    try {
      const res = await fetch('/api/portfolio/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorUsername: author.username,
          url: portfolioUrlInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setPortfolioFeedback({ message: data.message || `Successfully removed item!`, isError: false });
        setPortfolioUrlInput('');
        if (onRefreshFeed) onRefreshFeed();
      } else {
        setPortfolioFeedback({ message: data.error || 'Failed to remove portfolio item. Verify the URL matches.', isError: true });
      }
    } catch (err: any) {
      setPortfolioFeedback({ message: err.message || String(err), isError: true });
    } finally {
      setIsRemovingPortfolioItem(false);
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

  const githubAppInstallUrl = `https://github.com/apps/${import.meta.env.GITHUB_APP_CLIENT_NAME || 'posrtfolist'}/installations/new`;
  const ghIntegration = author.integrations?.find(i => i.provider === 'github');

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

      {/* Top Profile Header Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-start sm:items-center gap-5">
            <Avatar
              src={author.avatarUrl}
              alt={author.displayName}
              size="lg"
              className="w-16 h-16 sm:w-20 sm:h-20 ring-2 ring-blue-500/30 border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <Typography type="h4" className="font-bold text-slate-900 leading-tight">
                  {author.displayName}
                </Typography>
                <Chip color="info" variant="ghost" className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold">
                  <ChipLabel>{author.role}</ChipLabel>
                </Chip>
              </div>
              <Typography type="small" className="text-xs font-mono text-slate-500 mt-1">
                @{author.username}
              </Typography>
              
              {author.referredBy && (
                <Typography type="small" className="text-xs text-slate-600 font-mono mt-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>Invited by @{author.referredBy}</span>
                </Typography>
              )}
            </div>
          </div>

          {/* Quick GitHub Sync Actions for Header */}
          {isSelf && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                color="primary"
                onClick={handleSyncGithubProfile}
                disabled={isSyncingGithub}
                className="flex items-center gap-2 capitalize font-bold shadow-sm text-xs"
              >
                {isSyncingGithub ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Github className="w-3.5 h-3.5" />}
                <span>Sync GitHub Profile</span>
              </Button>

              <a
                href={`${githubAppInstallUrl}?author=${author.username}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-300" />
                <span>GitHub App</span>
              </a>
            </div>
          )}

        </div>
      </div>

      {/* Material Design Tabs Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-md overflow-x-auto">
        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'github'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderGit2 className="w-4 h-4 text-purple-300" />
          <span>1. GITHUB & INTEGRATION</span>
        </button>

        <button
          onClick={() => setActiveTab('bio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'bio'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4 text-blue-300" />
          <span>2. BIOGRAPHY & CONTACTS</span>
        </button>

        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
            activeTab === 'referrals'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Key className="w-4 h-4 text-amber-300" />
          <span>3. REFERRALS & INVITES</span>
        </button>
      </div>

      {/* TAB CONTENT 1 (DEFAULT-OPEN): GITHUB & INTEGRATION */}
      {activeTab === 'github' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
            
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white shrink-0">
                  <Github className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <Typography type="h5" className="font-bold text-slate-900 leading-snug">
                    GitHub Account & Integration Profile
                  </Typography>
                  <Typography type="small" className="text-xs text-slate-500 font-mono">
                    Synchronize your GitHub username, email, display name, and avatar to user profile & metadata.
                  </Typography>
                </div>
              </div>

              {/* Sync GitHub Profile Button */}
              {isSelf && (
                <Button
                  size="sm"
                  color="primary"
                  onClick={handleSyncGithubProfile}
                  disabled={isSyncingGithub}
                  className="flex items-center gap-2 capitalize font-bold shadow-sm"
                >
                  {isSyncingGithub ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>Sync Profile Info</span>
                </Button>
              )}
            </div>

            {/* Sync Feedback Alert */}
            {githubSyncSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{githubSyncSuccess}</span>
              </div>
            )}

            {/* GitHub Connection Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs">
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">GitHub Login</span>
                <span className="font-bold text-slate-900">@{ghIntegration?.providerUserId || author.username}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs">
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Primary Email</span>
                <span className="font-bold text-slate-900">{ghIntegration?.metadata?.email || author.contactMethods?.find(c => c.platform === 'email')?.value || 'N/A'}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs">
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">OAuth Connection</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Active / Synchronized
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 2: BIOGRAPHY & CONTACTS */}
      {activeTab === 'bio' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Typography type="small" className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                AUTHOR BIOGRAPHY & SCOPE
              </Typography>
              {isSelf && (
                <Button
                  size="sm"
                  variant="ghost"
                  color="secondary"
                  onClick={() => setIsEditingBio(!isEditingBio)}
                  className="flex items-center gap-1.5 text-xs capitalize font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingBio ? 'Cancel Editing' : 'Edit Bio Markdown'}</span>
                </Button>
              )}
            </div>

            {isEditingBio ? (
              <div className="space-y-3">
                <textarea
                  value={bioText}
                  onChange={e => setBioText(e.target.value)}
                  rows={8}
                  className="w-full p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
                />
                <Button
                  size="sm"
                  color="primary"
                  onClick={handleSaveBio}
                  className="flex items-center gap-2 capitalize font-bold shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Bio</span>
                </Button>
              </div>
            ) : (
              <div className="prose max-w-none bg-slate-50 p-6 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {author.bioMarkdown}
                </ReactMarkdown>
              </div>
            )}

            {/* Public Contact Methods Grid */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <Typography type="small" className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-3 block">
                DIRECT CONTACT METHODS
              </Typography>
              <div className="flex flex-wrap items-center gap-2">
                {author.contactMethods.map((cm, idx) => (
                  <div
                    key={idx}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center gap-2 font-mono"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span><strong>{cm.platform}:</strong> {cm.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Integrated Platforms Matrix */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <Typography type="small" className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-3 block">
                CONNECTED INTEGRATIONS
              </Typography>
              <div className="flex flex-wrap items-center gap-2">
                {author.integrations.map((ing, iIdx) => (
                  <div
                    key={iIdx}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{ing.provider} (<span className="text-blue-300">{ing.providerUserId}</span>)</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 3: REFERRALS & INVITES */}
      {activeTab === 'referrals' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <Typography type="h5" className="font-bold text-slate-900 leading-snug">
                  Author Referral & Gated Invite Manager
                </Typography>
                <Typography type="small" className="text-xs text-slate-500 font-mono">
                  Generate cryptographic referral tokens to invite trusted developers to the collective.
                </Typography>
              </div>
            </div>

            {isSelf ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-slate-500 font-mono shrink-0">Usage Quota:</span>
                    <select
                      value={maxUses}
                      onChange={e => setMaxUses(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value={1}>1 Invite Use</option>
                      <option value={3}>3 Invite Uses</option>
                      <option value={5}>5 Invite Uses</option>
                      <option value={10}>10 Invite Uses</option>
                    </select>
                  </div>

                  <Button
                    size="sm"
                    color="primary"
                    onClick={handleGenerateReferral}
                    disabled={isGeneratingRef}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 capitalize font-bold shadow-sm"
                  >
                    {isGeneratingRef ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-blue-300" />}
                    <span>Generate Invite URL</span>
                  </Button>
                </div>

                {generatedInvite && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-400 font-bold">Invite Token: {generatedInvite.token.code}</span>
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded">Quota: {generatedInvite.token.maxUses} Uses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}${generatedInvite.inviteUrl}`}
                        className="flex-1 px-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none font-mono"
                      />
                      <Button
                        size="sm"
                        color="primary"
                        onClick={() => handleCopyInviteLink(generatedInvite.inviteUrl)}
                        className="flex items-center gap-1.5 capitalize font-semibold shadow-sm shrink-0"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs font-mono">
                ℹ️ Log in as @{author.username} to generate referral invite tokens for new authors.
              </div>
            )}

            {author.referredBy && (
              <div className="mt-6 pt-6 border-t border-slate-200 flex items-center gap-2 text-xs font-mono text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified author account invited by <strong>@{author.referredBy}</strong>.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PORTFOLIO ITEMS ARE UNDER THE TABSWITCHER */}
      <div className="pt-6 border-t border-slate-200 space-y-6">
        
        {/* ADD & REMOVE PORTFOLIO ITEM BY URL INPUT BAR */}
        {isSelf && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <LinkIcon className="w-4 h-4 text-blue-600" />
              <Typography type="small" className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                PORTFOLIO URL MANAGER (ADD / REMOVE ITEM)
              </Typography>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="url"
                value={portfolioUrlInput}
                onChange={e => setPortfolioUrlInput(e.target.value)}
                placeholder="Enter portfolio URL (e.g. https://github.com/org/repo or https://example.com/doc)..."
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  color="primary"
                  onClick={handleAddPortfolioItem}
                  disabled={isAddingPortfolioItem || !portfolioUrlInput.trim()}
                  className="flex items-center gap-1.5 capitalize font-bold shadow-sm"
                >
                  {isAddingPortfolioItem ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  color="error"
                  onClick={handleRemovePortfolioItem}
                  disabled={isRemovingPortfolioItem || !portfolioUrlInput.trim()}
                  className="flex items-center gap-1.5 capitalize font-bold shadow-sm bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                >
                  {isRemovingPortfolioItem ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Remove</span>
                </Button>
              </div>
            </div>

            {portfolioFeedback && (
              <div className={`mt-3 p-3 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 animate-in fade-in ${
                portfolioFeedback.isError
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {portfolioFeedback.isError ? <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                <span>{portfolioFeedback.message}</span>
              </div>
            )}
          </div>
        )}

        {/* PORTFOLIO ITEMS FEED HEADER & GRID */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Typography type="small" className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <span>AUTHOR PORTFOLIO ITEMS ({items.length})</span>
            </Typography>
          </div>

          {items.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs shadow-sm">
              No portfolio items imported for @{author.username} yet. Use the URL input bar above to add portfolio items!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map(item => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  onOpenNotebook={onOpenNotebook}
                  onOpenGDoc={onOpenGDoc}
                  onWalkItem={onWalkItem}
                />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
