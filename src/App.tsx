import React, { useState, useEffect } from 'react';
import { Author, PortfolioItem, Team } from './types';
import { Header } from './components/Header';
import { NotebookReaderModal } from './components/NotebookReaderModal';
import { GDocReaderModal } from './components/GDocReaderModal';
import { PortfolioCard } from './components/PortfolioCard';
import { CliConsole } from './components/CliConsole';
import { AuthorProfile } from './components/AuthorProfile';
import { TeamShowcase } from './components/TeamShowcase';
import { IntegrationsMatrix } from './components/IntegrationsMatrix';
import { AgentChatDrawer } from './components/AgentChatDrawer';
import { SignupPage } from './components/SignupPage';
import { ConnectionAdded } from './components/ConnectionAdded';
import { 
  Sparkles, 
  Search, 
  RefreshCw, 
  Terminal, 
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Author | null>(null);
  const [allAuthors, setAllAuthors] = useState<Author[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  
  const [activeTab, setActiveTab] = useState<'feed' | 'teams' | 'referrals' | 'cli' | 'matrix' | 'author_view' | 'signup' | 'connection-added'>('feed');
  const [selectedAuthorUsername, setSelectedAuthorUsername] = useState<string | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<{ provider: any; username: string; isNewUser: boolean } | null>(null);

  // Filters
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isSignInOpen, setIsSignInOpen] = useState<boolean>(false);
  const [selectedNotebook, setSelectedNotebook] = useState<PortfolioItem | null>(null);
  const [selectedGDoc, setSelectedGDoc] = useState<PortfolioItem | null>(null);

  // AI Agent Chat Drawer & Walk Repo State
  const [isAgentDrawerOpen, setIsAgentDrawerOpen] = useState(false);
  const [agentWalkPrompt, setAgentWalkPrompt] = useState<string | null>(null);

  // Referral Invite Code from URL
  const [activeReferralCode, setActiveReferralCode] = useState<string | null>(null);

  // Check URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;

    if (urlParams.get('github_app') === 'installed') {
      localStorage.setItem('portfolist:github_app_installed', 'true');
    }

    const isMeRoute = pathname === '/me' || pathname === '/me/' || urlParams.get('author') === 'me';
    const authorParam = urlParams.get('author');

    const viewParam = urlParams.get('view') || (pathname.includes('/signup') ? 'signup' : pathname.includes('/connection-added') ? 'connection-added' : isMeRoute ? 'me' : null);
    const loginStatus = urlParams.get('login');
    const loggedUser = urlParams.get('user');
    const providerParam = urlParams.get('provider') || 'github';
    const isNewUser = urlParams.get('is_new') === 'true';
    const refCode = urlParams.get('ref') || urlParams.get('invite');

    if (isMeRoute || viewParam === 'me') {
      const savedUser = localStorage.getItem('portfolist:user_session') || 'alex_chen';
      setSelectedAuthorUsername(savedUser);
      setActiveTab('author_view');
    } else if (authorParam) {
      setSelectedAuthorUsername(authorParam);
      setActiveTab('author_view');
    } else if (viewParam === 'signup' || pathname === '/signup') {
      setActiveTab('signup');
    } else if (viewParam === 'connection-added' || pathname === '/connection-added') {
      setActiveTab('connection-added');
      if (loggedUser) {
        setConnectionDetails({ provider: providerParam as any, username: loggedUser, isNewUser });
        fetch(`/api/authors/${loggedUser}`)
          .then(res => res.json())
          .then(data => {
            const author = data.author || data;
            if (author && author.username) {
              setCurrentUser(author);
              localStorage.setItem('portfolist:user_session', author.username);
            }
          })
          .catch(err => console.error('Error fetching logged in user:', err));
      }
    } else if (refCode) {
      setActiveReferralCode(refCode.toUpperCase());
    } else if (loginStatus === 'success' && loggedUser) {
      fetch(`/api/authors/${loggedUser}`)
        .then(res => res.json())
        .then(data => {
          const author = data.author || data;
          if (author && author.username) {
            setCurrentUser(author);
            localStorage.setItem('portfolist:user_session', author.username);
          }
        })
        .catch(err => console.error('Error fetching logged in user:', err));

      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [authorsRes, itemsRes, teamsRes] = await Promise.all([
        fetch('/api/authors'),
        fetch('/api/portfolio'),
        fetch('/api/teams')
      ]);

      const authorsData: Author[] = await authorsRes.json() || [];
      const itemsData: PortfolioItem[] = await itemsRes.json() || [];
      const teamsData: Team[] = await teamsRes.json() || [];

      setAllAuthors(authorsData);
      setPortfolioItems(itemsData);
      setTeams(teamsData);

      // Check saved localStorage session
      const savedUser = localStorage.getItem('portfolist:user_session');
      if (savedUser) {
        const found = authorsData.find(a => a.username.toLowerCase() === savedUser.toLowerCase());
        if (found) {
          setCurrentUser(found);
        }
      }
    } catch (err) {
      console.error('Error fetching system data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Switch User
  const handleSwitchUser = (username: string) => {
    const target = allAuthors.find(a => a.username.toLowerCase() === username.toLowerCase());
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('portfolist:user_session', target.username);
    }
  };

  // Open single author profile
  const handleOpenAuthorProfile = (username: string) => {
    setSelectedAuthorUsername(username);
    setActiveTab('author_view');
  };

  // Walk Repo Action
  const handleWalkItem = (item: PortfolioItem) => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAppInstalled = 
      localStorage.getItem('portfolist:github_app_installed') === 'true' ||
      urlParams.get('github_app') === 'installed' ||
      Boolean(currentUser?.integrations?.some(i => i.provider === 'github'));

    if (!isAppInstalled) {
      const githubAppInstallUrl = `https://github.com/apps/${import.meta.env.GITHUB_APP_CLIENT_NAME || 'posrtfolist'}/installations/new?author=${currentUser?.username || selectedAuthorUsername || 'alex_chen'}`;
      window.location.href = githubAppInstallUrl;
      return;
    }

    setAgentWalkPrompt(`Walk this repo please: ${item.title} (${item.url})`);
    setIsAgentDrawerOpen(true);
  };

  // Filter items
  const filteredItems = portfolioItems.filter(item => {
    if (platformFilter !== 'all' && item.sourcePlatform !== platformFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.authorDisplayName.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const selectedAuthorObj = allAuthors.find(a => a.username === selectedAuthorUsername) || currentUser;

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans selection:bg-blue-500 selection:text-white pb-16">
      
      {/* Header Bar */}
      <Header
        currentUser={currentUser}
        activeTab={['author_view', 'signup', 'connection-added'].includes(activeTab) ? 'feed' : activeTab as any}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedAuthorUsername(null);
        }}
        allAuthors={allAuthors}
        onSwitchUser={handleSwitchUser}
        onOpenSignIn={() => {
          window.location.href = '/api/auth/github/login';
        }}
        activeReferralCode={activeReferralCode}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('portfolist:user_session');
        }}
        onConnectProvider={(prov) => {
          window.location.href = '/api/auth/github/login';
        }}
        onOpenAuthorProfile={handleOpenAuthorProfile}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* VIEW: Standalone OAuth Signup Page */}
        {activeTab === 'signup' && (
          <SignupPage
            onSelectProvider={(prov) => {
              window.location.href = '/api/auth/github/login';
            }}
          />
        )}

        {/* VIEW: Connection Added Confirmation Page */}
        {activeTab === 'connection-added' && (
          <ConnectionAdded
            currentUser={currentUser}
            provider={connectionDetails?.provider || 'github'}
            username={connectionDetails?.username || currentUser?.username || 'alex_chen'}
            isNewUser={connectionDetails?.isNewUser || false}
            onReturnHome={() => {
              setActiveTab('feed');
              window.history.replaceState({}, document.title, '/');
            }}
            onOpenAgentChat={() => {
              setActiveTab('feed');
              window.history.replaceState({}, document.title, '/');
            }}
          />
        )}
        {activeTab === 'feed' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Minimalist Integration Banner */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="max-w-3xl space-y-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-mono font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>REFERRAL-GATED COLLECTIVE SYSTEM</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Unified Portfolio & Integration Hub
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Ingesting Gemini Notebooks (.ipynb), Google Docs, GitHub Repos, YouTube Guides, Reddit Threads, Flickr Sets, and Web3 Wallet Proofs into a multi-tenant collective showcase.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono">
                    <div className="text-xl font-bold text-slate-800">{portfolioItems.length}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Synced Items</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono">
                    <div className="text-xl font-bold text-blue-600">{allAuthors.length}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Active Authors</div>
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between gap-4 flex-wrap">
                
                {/* Search Input */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search repos, notebook titles, or tags (#Gemini, #Python)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-sans"
                  />
                </div>

                {/* Platform Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
                  {[
                    { id: 'all', label: 'All Feeds' },
                    { id: 'gemini', label: 'Gemini AI' },
                    { id: 'github', label: 'GitHub' },
                    { id: 'gdoc', label: 'Google Docs' },
                    { id: 'youtube', label: 'YouTube' },
                    { id: 'reddit', label: 'Reddit' },
                    { id: 'flickr', label: 'Flickr' },
                    { id: 'metamask', label: 'Web3 Proof' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPlatformFilter(p.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        platformFilter === p.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-semibold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

              </div>
            </div>

            {/* Portfolio Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="uppercase text-[10px] font-bold tracking-widest text-slate-400">
                  COLLECTIVE FEED ({filteredItems.length} ITEMS)
                </span>
                <button
                  onClick={fetchData}
                  className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Force Sync All</span>
                </button>
              </div>

              {filteredItems.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs shadow-sm">
                  No portfolio items matched your filter criteria. Try clearing search keywords.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => (
                    <PortfolioCard
                      key={item.id}
                      item={item}
                      onOpenNotebook={item => setSelectedNotebook(item)}
                      onOpenGDoc={item => setSelectedGDoc(item)}
                      onOpenAuthor={handleOpenAuthorProfile}
                      onWalkItem={handleWalkItem}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: Teams Showcase */}
        {activeTab === 'teams' && (
          <TeamShowcase
            teams={teams}
            portfolioItems={portfolioItems}
            currentUser={currentUser}
            onRefreshTeams={fetchData}
            onOpenNotebook={item => setSelectedNotebook(item)}
            onOpenGDoc={item => setSelectedGDoc(item)}
            onOpenAuthor={handleOpenAuthorProfile}
          />
        )}

        {/* VIEW 3: Invite Network & Referrals */}
        {activeTab === 'referrals' && currentUser && (
          <AuthorProfile
            author={currentUser}
            items={portfolioItems.filter(i => i.authorUsername === currentUser.username)}
            currentUser={currentUser}
            onUpdateBio={() => fetchData()}
            onUpdateAuthor={(updated) => {
              setCurrentUser(updated);
              fetchData();
            }}
            onRefreshFeed={fetchData}
            onOpenNotebook={item => setSelectedNotebook(item)}
            onOpenGDoc={item => setSelectedGDoc(item)}
            onWalkItem={handleWalkItem}
          />
        )}

        {/* VIEW 4: CLI Admin Terminal */}
        {activeTab === 'cli' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-600" />
                Command Line Interface (portfolio-cli)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Execute automation sync pipelines, generate referral links, and ingest Gemini Notebooks directly from terminal commands.
              </p>
            </div>

            <CliConsole currentUser={currentUser} onRefreshFeed={fetchData} />
          </div>
        )}

        {/* VIEW 5: Integrations Matrix */}
        {activeTab === 'matrix' && (
          <IntegrationsMatrix
            currentUser={currentUser}
            onSyncPlatform={(plat) => {
              fetch('/api/portfolio/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  authorUsername: currentUser?.username || 'alex_chen',
                  platform: plat,
                  title: `Synced ${plat} Content`,
                  description: `Ingested ${plat} item via Integrations Matrix.`
                })
              }).then(() => fetchData());
            }}
          />
        )}

        {/* VIEW 6: Single Author Profile View */}
        {activeTab === 'author_view' && selectedAuthorObj && (
          <AuthorProfile
            author={selectedAuthorObj}
            items={portfolioItems.filter(i => i.authorUsername === selectedAuthorObj.username)}
            currentUser={currentUser}
            onUpdateBio={() => fetchData()}
            onUpdateAuthor={(updated) => {
              setCurrentUser(updated);
              fetchData();
            }}
            onRefreshFeed={fetchData}
            onOpenNotebook={item => setSelectedNotebook(item)}
            onOpenGDoc={item => setSelectedGDoc(item)}
            onWalkItem={handleWalkItem}
          />
        )}

      </main>

      {/* MODALS */}

      <NotebookReaderModal
        item={selectedNotebook}
        onClose={() => setSelectedNotebook(null)}
      />

      <GDocReaderModal
        item={selectedGDoc}
        onClose={() => setSelectedGDoc(null)}
      />

      {/* AI Candidate Assistant Chat Drawer for Authorized Users */}
      <AgentChatDrawer
        currentUser={currentUser}
        isOpen={isAgentDrawerOpen}
        onClose={() => setIsAgentDrawerOpen(false)}
        walkPrompt={agentWalkPrompt}
      />

    </div>
  );
}
