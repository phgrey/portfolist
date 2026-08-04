import React, { useState, useEffect } from 'react';
import { Author, Team } from '../types';
import { 
  Puzzle, 
  Terminal, 
  Code2, 
  Send, 
  Check, 
  Copy, 
  RefreshCw, 
  FileText, 
  Edit3, 
  UserCheck, 
  Users, 
  ExternalLink, 
  Sparkles, 
  Play, 
  ShieldCheck, 
  BookOpen, 
  Layers,
  Download
} from 'lucide-react';

interface ChromeExtensionApiDocProps {
  currentUser: Author | null;
  allAuthors: Author[];
  allTeams: Team[];
  onRefreshData?: () => void;
}

export const ChromeExtensionApiDoc: React.FC<ChromeExtensionApiDocProps> = ({
  currentUser,
  allAuthors,
  allTeams,
  onRefreshData
}) => {
  const activeAuthorUsername = currentUser?.username || 'alex_chen';

  // Active Tab inside API Spec Hub
  const [activeTab, setActiveTab] = useState<'playground' | 'spec' | 'extension_code'>('playground');

  // Selected Endpoint for Testing
  const [selectedEndpoint, setSelectedEndpoint] = useState<'status' | 'publish' | 'profile' | 'team'>('publish');

  // Form State for Testing / Playground
  const [clipTitle, setClipTitle] = useState('Gemini 2.5 Multi-Modal Prompting Guide');
  const [clipUrl, setClipUrl] = useState('https://ai.google.dev/gemini-api/docs/multimodal');
  const [clipPlatform, setClipPlatform] = useState('gemini');
  const [clipDesc, setClipDesc] = useState('Captured research notebook via Author Chrome Extension v1.4');
  const [clipTags, setClipTags] = useState('Gemini, ExtensionCapture, MultiModal');

  const [profileDisplayName, setProfileDisplayName] = useState(currentUser?.displayName || 'Alex Chen');
  const [profileRole, setProfileRole] = useState(currentUser?.role || 'Staff AI Engineer');
  const [profileBio, setProfileBio] = useState(currentUser?.bioMarkdown || '# Lead AI Researcher & Extension Author');

  const [selectedTeamSlug, setSelectedTeamSlug] = useState(allTeams[0]?.slug || 'quantum-ai-guild');
  const [teamName, setTeamName] = useState(allTeams[0]?.name || 'Quantum AI Guild');
  const [teamDesc, setTeamDesc] = useState(allTeams[0]?.descriptionMarkdown || '# Quantum AI Guild Mission...');

  // Execution State & Response Output
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [lastRequestPayload, setLastRequestPayload] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sync team inputs when selected team changes
  useEffect(() => {
    const t = allTeams.find(item => item.slug === selectedTeamSlug);
    if (t) {
      setTeamName(t.name);
      setTeamDesc(t.descriptionMarkdown);
    }
  }, [selectedTeamSlug, allTeams]);

  // Execute Real REST API Call
  const handleExecuteApiCall = async () => {
    setIsLoading(true);
    setApiResponse(null);
    setResponseStatus(null);

    try {
      let url = '/api/extension/status';
      let method = 'GET';
      let body: any = null;

      if (selectedEndpoint === 'status') {
        url = `/api/extension/status?authorUsername=${activeAuthorUsername}`;
        method = 'GET';
      } else if (selectedEndpoint === 'publish') {
        url = '/api/extension/portfolio';
        method = 'POST';
        body = {
          authorUsername: activeAuthorUsername,
          title: clipTitle,
          description: clipDesc,
          url: clipUrl,
          sourcePlatform: clipPlatform,
          tags: clipTags.split(',').map(t => t.trim()).filter(Boolean),
          isFeatured: true,
          contentPayload: {
            capturedAt: new Date().toISOString(),
            capturedByExtension: 'Author Portfolio Chrome Extension v1.4'
          }
        };
      } else if (selectedEndpoint === 'profile') {
        url = '/api/extension/profile';
        method = 'PUT';
        body = {
          authorUsername: activeAuthorUsername,
          displayName: profileDisplayName,
          role: profileRole,
          bioMarkdown: profileBio
        };
      } else if (selectedEndpoint === 'team') {
        url = '/api/extension/team';
        method = 'PUT';
        body = {
          authorUsername: activeAuthorUsername,
          teamSlug: selectedTeamSlug,
          name: teamName,
          descriptionMarkdown: teamDesc
        };
      }

      setLastRequestPayload(`${method} ${url}\nHeaders: X-Author-Username: ${activeAuthorUsername}\n${body ? JSON.stringify(body, null, 2) : ''}`);

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Author-Username': activeAuthorUsername
        }
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url, options);
      setResponseStatus(res.status);
      const data = await res.json();
      setApiResponse(data);

      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err: any) {
      setResponseStatus(500);
      setApiResponse({ error: err.message || 'Failed to connect to Extension REST API' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Extension Code Samples
  const manifestJsonSnippet = `{
  "manifest_version": 3,
  "name": "Author Portfolio & Team Extension",
  "version": "1.4.0",
  "description": "Send captured web items, notebooks, and repos to your portfolio feed and manage author/team pages.",
  "permissions": ["activeTab", "scripting", "storage", "contextMenus"],
  "host_permissions": ["http://*/*", "https://*/*"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  }
}`;

  const backgroundJsSnippet = `// Chrome Extension Background Service Worker (background.js)
const PORTFOLIO_API_URL = "https://your-portfolio-app.run.app/api/extension";
const AUTHOR_USERNAME = "alex_chen"; // Configurable in extension popup

// Create Context Menu Item for One-Click Clipping
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "send-to-portfolio",
    title: "⚡ Send Selection / URL to Portfolio Feed",
    contexts: ["page", "selection", "link"]
  });
});

// Handle Context Menu Click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "send-to-portfolio") {
    const payload = {
      authorUsername: AUTHOR_USERNAME,
      title: tab.title || "Clipped Web Item",
      description: info.selectionText || "Clipped from browser via extension context menu.",
      url: info.linkUrl || info.pageUrl || tab.url,
      sourcePlatform: detectPlatform(tab.url),
      tags: ["ChromeExtension", "WebClip"],
      isFeatured: true
    };

    try {
      const res = await fetch(\`\${PORTFOLIO_API_URL}/portfolio\`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Author-Username": AUTHOR_USERNAME
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      console.log("✔ Portfolio Extension Clip Success:", result);
    } catch (err) {
      console.error("✖ Extension Clip Failed:", err);
    }
  }
});

function detectPlatform(url) {
  if (url.includes("github.com")) return "github";
  if (url.includes("colab") || url.includes("ipynb")) return "gemini";
  if (url.includes("docs.google.com")) return "gdoc";
  if (url.includes("youtube.com")) return "youtube";
  if (url.includes("reddit.com")) return "reddit";
  return "custom";
}`;

  const popupJsSnippet = `// Extension Popup Logic (popup.js)
document.getElementById('saveProfileBtn').addEventListener('click', async () => {
  const displayName = document.getElementById('displayName').value;
  const role = document.getElementById('role').value;
  const bio = document.getElementById('bio').value;

  const response = await fetch('http://localhost:3000/api/extension/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Author-Username': 'alex_chen'
    },
    body: JSON.stringify({ displayName, role, bioMarkdown: bio })
  });
  const data = await response.json();
  alert(data.message || 'Profile updated!');
});`;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-mono font-bold">
              <Puzzle className="w-3.5 h-3.5 text-blue-400" />
              <span>CHROME EXTENSION REST API (v1.4.0)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Author Chrome Extension REST API
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Connect your custom browser extension or bookmarklet to instantly capture web pages, code snippets, notebooks, or edit author bios and team showcase pages directly from the browser context.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 font-mono text-xs">
            <div className="px-4 py-3 bg-slate-800/90 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Site Session Auth</span>
              <span className="text-emerald-400 font-bold">Logged in as @{activeAuthorUsername}</span>
            </div>
            <div className="px-4 py-3 bg-slate-800/90 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Base Route</span>
              <span className="text-blue-300 font-bold">/api/extension/*</span>
            </div>
          </div>
        </div>

        {/* Authentication Notice Callout */}
        <div className="mt-6 p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-bold text-blue-300 uppercase tracking-wide font-mono block">
              No Separate Auth Endpoint Required
            </span>
            <p className="text-slate-300 leading-relaxed font-sans">
              There is no separate login or token endpoint for the Chrome Extension. Authors simply log in on our site. Extension requests inherit the active author session directly (<code className="font-mono text-blue-300 bg-slate-900 px-1.5 py-0.5 rounded">X-Author-Username: {activeAuthorUsername}</code> or site session cookies).
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('playground')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'playground'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Play className="w-4 h-4 text-emerald-500" />
          <span>Interactive API Playground</span>
        </button>

        <button
          onClick={() => setActiveTab('spec')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'spec'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span>REST API Endpoint Spec</span>
        </button>

        <button
          onClick={() => setActiveTab('extension_code')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'extension_code'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4 text-purple-500" />
          <span>Chrome Extension Starter Code</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE API PLAYGROUND */}
      {activeTab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Endpoint Selection & Form Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Select Extension API Action
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose an endpoint to test live execution against the server.
                </p>
              </div>

              {/* Endpoint Selector Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedEndpoint('publish')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center gap-2 ${
                    selectedEndpoint === 'publish'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Send className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <div>POST /portfolio</div>
                    <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400">Send item to feed</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedEndpoint('profile')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center gap-2 ${
                    selectedEndpoint === 'profile'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <div>PUT /profile</div>
                    <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400">Edit own profile</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedEndpoint('team')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center gap-2 ${
                    selectedEndpoint === 'team'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div>PUT /team</div>
                    <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400">Edit team page</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedEndpoint('status')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center gap-2 ${
                    selectedEndpoint === 'status'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <div>GET /status</div>
                    <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400">Auth & stats check</div>
                  </div>
                </button>
              </div>

              {/* Form Input Fields Based on Selected Endpoint */}
              {selectedEndpoint === 'publish' && (
                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Clipped Title *
                    </label>
                    <input
                      type="text"
                      value={clipTitle}
                      onChange={e => setClipTitle(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Target URL *
                    </label>
                    <input
                      type="url"
                      value={clipUrl}
                      onChange={e => setClipUrl(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                        Source Platform
                      </label>
                      <select
                        value={clipPlatform}
                        onChange={e => setClipPlatform(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      >
                        <option value="gemini">Gemini Notebook</option>
                        <option value="github">GitHub Repo</option>
                        <option value="gdoc">Google Doc</option>
                        <option value="youtube">YouTube Video</option>
                        <option value="reddit">Reddit Thread</option>
                        <option value="flickr">Flickr Photo Set</option>
                        <option value="metamask">Web3 Wallet Asset</option>
                        <option value="custom">Custom Web Clip</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                        Tags (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={clipTags}
                        onChange={e => setClipTags(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Description / Excerpt
                    </label>
                    <textarea
                      rows={2}
                      value={clipDesc}
                      onChange={e => setClipDesc(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {selectedEndpoint === 'profile' && (
                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profileDisplayName}
                        onChange={e => setProfileDisplayName(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                        Role Title
                      </label>
                      <input
                        type="text"
                        value={profileRole}
                        onChange={e => setProfileRole(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Bio Markdown
                    </label>
                    <textarea
                      rows={4}
                      value={profileBio}
                      onChange={e => setProfileBio(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {selectedEndpoint === 'team' && (
                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Target Team Group
                    </label>
                    <select
                      value={selectedTeamSlug}
                      onChange={e => setSelectedTeamSlug(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                    >
                      {allTeams.map(t => (
                        <option key={t.id} value={t.slug}>
                          {t.name} (slug: {t.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Updated Team Name
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={e => setTeamName(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Team Description Markdown
                    </label>
                    <textarea
                      rows={4}
                      value={teamDesc}
                      onChange={e => setTeamDesc(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleExecuteApiCall}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                <span>{isLoading ? 'Transmitting Request...' : 'Send Live REST Request'}</span>
              </button>

            </div>
          </div>

          {/* Right Column: Console Log / Live Response Output */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4 font-mono text-xs overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-slate-400">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold uppercase tracking-wider text-[11px]">HTTP Response Inspector</span>
                </div>

                {responseStatus && (
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    HTTP STATUS {responseStatus}
                  </span>
                )}
              </div>

              {/* Request Payload Summary */}
              {lastRequestPayload && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Transmitted Payload:</div>
                  <pre className="whitespace-pre-wrap font-mono text-[10px] text-blue-300">{lastRequestPayload}</pre>
                </div>
              )}

              {/* Response Body JSON */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Server JSON Response:</div>
                <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800/80 min-h-[220px] max-h-[380px] overflow-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40 text-slate-500 gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Transmitting HTTP Request to REST API...</span>
                    </div>
                  ) : apiResponse ? (
                    <pre className="text-emerald-300 text-[11px] font-mono whitespace-pre-wrap">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-slate-600 text-[11px] italic">
                      Click "Send Live REST Request" to test endpoint response.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ENDPOINT DOCUMENTATION SPECIFICATION */}
      {activeTab === 'spec' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-8">
            
            <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                Full REST API Reference
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Comprehensive documentation for integrating Chrome Extensions, Firefox Add-ons, or custom CLI scripts.
              </p>
            </div>

            {/* Spec Cards */}
            <div className="space-y-6">
              
              {/* Endpoint 1 */}
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-blue-600 text-white text-xs font-mono font-bold">POST</span>
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">/api/extension/portfolio</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Capture & Publish Portfolio Item</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sends a captured article, GitHub repository, Gemini notebook link, or web clip into the author's feed.
                </p>

                <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs relative">
                  <button
                    onClick={() => copyToClipboard(`curl -X POST "http://localhost:3000/api/extension/portfolio" \\\n  -H "Content-Type: application/json" \\\n  -H "X-Author-Username: alex_chen" \\\n  -d '{"title": "Gemini 2.5 Multi-Modal Guide", "url": "https://ai.google.dev", "sourcePlatform": "gemini", "tags": ["Gemini", "AI"]}'`, 'curl1')}
                    className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {copiedCode === 'curl1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="whitespace-pre-wrap">
{`curl -X POST "http://localhost:3000/api/extension/portfolio" \\
  -H "Content-Type: application/json" \\
  -H "X-Author-Username: alex_chen" \\
  -d '{
    "title": "Gemini 2.5 Multi-Modal Guide",
    "description": "Clipped via Chrome Extension",
    "url": "https://ai.google.dev/gemini-api",
    "sourcePlatform": "gemini",
    "tags": ["Gemini", "ExtensionClip"],
    "isFeatured": true
  }'`}
                  </pre>
                </div>
              </div>

              {/* Endpoint 2 */}
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-purple-600 text-white text-xs font-mono font-bold">PUT</span>
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">/api/extension/profile</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Edit Author Profile & Bio</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Updates display name, role, avatar URL, or bio markdown for the authenticated author.
                </p>

                <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs relative">
                  <button
                    onClick={() => copyToClipboard(`curl -X PUT "http://localhost:3000/api/extension/profile" \\\n  -H "Content-Type: application/json" \\\n  -H "X-Author-Username: alex_chen" \\\n  -d '{"displayName": "Alex Chen", "role": "Principal AI Architect", "bioMarkdown": "# Updated Bio..."}'`, 'curl2')}
                    className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {copiedCode === 'curl2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="whitespace-pre-wrap">
{`curl -X PUT "http://localhost:3000/api/extension/profile" \\
  -H "Content-Type: application/json" \\
  -H "X-Author-Username: alex_chen" \\
  -d '{
    "displayName": "Alex Chen",
    "role": "Principal AI Architect",
    "bioMarkdown": "# Updated Bio via Chrome Extension..."
  }'`}
                  </pre>
                </div>
              </div>

              {/* Endpoint 3 */}
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-mono font-bold">PUT</span>
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">/api/extension/team</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Edit Team Page Details</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Updates team page title, markdown description, or avatar for any team the author belongs to or owns.
                </p>

                <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs relative">
                  <button
                    onClick={() => copyToClipboard(`curl -X PUT "http://localhost:3000/api/extension/team" \\\n  -H "Content-Type: application/json" \\\n  -H "X-Author-Username: alex_chen" \\\n  -d '{"teamSlug": "quantum-ai-guild", "name": "Quantum AI Guild", "descriptionMarkdown": "# Guild Mission..."}'`, 'curl3')}
                    className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {copiedCode === 'curl3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="whitespace-pre-wrap">
{`curl -X PUT "http://localhost:3000/api/extension/team" \\
  -H "Content-Type: application/json" \\
  -H "X-Author-Username: alex_chen" \\
  -d '{
    "teamSlug": "quantum-ai-guild",
    "name": "Quantum AI Guild",
    "descriptionMarkdown": "# Guild Mission updated via Extension..."
  }'`}
                  </pre>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 3: CHROME EXTENSION CODE TEMPLATES */}
      {activeTab === 'extension_code' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            
            <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                Ready-to-Deploy Chrome Extension Codebase
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Copy these starter files into a local folder and load them directly as an Unpacked Chrome Extension via <code className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">chrome://extensions</code>.
              </p>
            </div>

            <div className="space-y-8">
              
              {/* File 1: manifest.json */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">manifest.json (Manifest V3)</span>
                  <button
                    onClick={() => copyToClipboard(manifestJsonSnippet, 'm1')}
                    className="flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                  >
                    {copiedCode === 'm1' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'm1' ? 'Copied' : 'Copy Snippet'}</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-auto max-h-[220px]">
                  <pre>{manifestJsonSnippet}</pre>
                </div>
              </div>

              {/* File 2: background.js */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">background.js (Service Worker & Context Menu)</span>
                  <button
                    onClick={() => copyToClipboard(backgroundJsSnippet, 'm2')}
                    className="flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                  >
                    {copiedCode === 'm2' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'm2' ? 'Copied' : 'Copy Snippet'}</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-auto max-h-[300px]">
                  <pre>{backgroundJsSnippet}</pre>
                </div>
              </div>

              {/* File 3: popup.js */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">popup.js (Popup Form Handler)</span>
                  <button
                    onClick={() => copyToClipboard(popupJsSnippet, 'm3')}
                    className="flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                  >
                    {copiedCode === 'm3' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'm3' ? 'Copied' : 'Copy Snippet'}</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-auto max-h-[200px]">
                  <pre>{popupJsSnippet}</pre>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
