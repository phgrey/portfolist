import React, { useState } from 'react';
import { Author, PlatformType } from '../types';
import { 
  Layers, 
  Terminal, 
  Users, 
  Key, 
  Share2, 
  Sparkles, 
  Lock, 
  UserCheck, 
  LogOut, 
  CheckCircle2, 
  Grid2X2,
  PlusCircle,
  ShieldAlert,
  Github,
  Globe,
  Plus
} from 'lucide-react';

interface HeaderProps {
  currentUser: Author | null;
  activeTab: 'feed' | 'teams' | 'referrals' | 'cli' | 'matrix';
  setActiveTab: (tab: 'feed' | 'teams' | 'referrals' | 'cli' | 'matrix') => void;
  allAuthors: Author[];
  onSwitchUser: (username: string) => void;
  onOpenSignIn: () => void;
  activeReferralCode: string | null;
  onLogout: () => void;
  onConnectProvider?: (provider: PlatformType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  allAuthors,
  onSwitchUser,
  onOpenSignIn,
  activeReferralCode,
  onLogout,
  onConnectProvider
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Connection Provider Badges Definition
  const providerList: { id: PlatformType; name: string; icon: React.ReactNode }[] = [
    {
      id: 'github',
      name: 'GitHub',
      icon: <Github className="w-3.5 h-3.5" />
    },
    {
      id: 'google',
      name: 'Google Docs',
      icon: <Globe className="w-3.5 h-3.5 text-red-400" />
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <span className="font-bold text-[10px] text-blue-400 font-sans">in</span>
    }
  ];

  const isConnected = (pId: PlatformType): boolean => {
    if (!currentUser || !currentUser.integrations) return false;
    return currentUser.integrations.some(i => i.provider === pId);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800 text-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
          <div className="h-6 w-6 bg-blue-500 rounded-sm flex items-center justify-center text-white font-mono text-xs font-bold">
            C
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tighter text-lg text-white font-mono">
                COLLECTIVE.SYS
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700 font-semibold">
                GATED_SYS
              </span>
            </div>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 opacity-80" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'teams'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 opacity-80" />
            Team Groups
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'referrals'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5 opacity-80" />
            Referrals
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'cli'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 opacity-80" />
            CLI Config
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Grid2X2 className="w-3.5 h-3.5 opacity-80" />
            Integration Hub
          </button>
        </nav>

        {/* Right Action & User Profile Section */}
        <div className="flex items-center gap-3">
          
          {/* Active Referral Invite Tag */}
          {activeReferralCode && (
            <div 
              onClick={onOpenSignIn}
              className="cursor-pointer hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono hover:bg-amber-500/20 transition-all"
              title="Active Referral Invite Detected"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>CODE: {activeReferralCode}</span>
            </div>
          )}

          {/* Connection Provider Square Logos (Connected in Color, Not Connected/Logged-Out in Grayscale) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            {providerList.map(prov => {
              const connected = isConnected(prov.id);
              return (
                <button
                  key={prov.id}
                  onClick={() => {
                    if (onConnectProvider) {
                      onConnectProvider(prov.id);
                    }
                  }}
                  title={connected ? `${prov.name} (Connected)` : `Connect with ${prov.name}`}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    connected
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'bg-slate-950/60 border border-slate-800/80 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:bg-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  {prov.icon}
                </button>
              );
            })}
          </div>

          {/* User Profile Dropdown Menu if Logged In */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-slate-600 transition-all text-left cursor-pointer"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500/40"
                />
                <div className="hidden lg:block">
                  <div className="text-xs font-medium text-white flex items-center gap-1 font-mono">
                    @{currentUser.username}
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">SYS_CONNECTED</div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl p-2 z-50 text-slate-200">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-white">{currentUser.displayName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">@{currentUser.username} • {currentUser.role}</p>
                  </div>

                  <div className="text-[10px] uppercase font-mono text-slate-400 px-3 py-1 font-bold tracking-widest">
                    Switch Test Account
                  </div>
                  {allAuthors.map(a => (
                    <button
                      key={a.id}
                      onClick={() => {
                        onSwitchUser(a.username);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                        a.username === currentUser.username
                          ? 'bg-blue-600/20 text-blue-300 font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-mono">@{a.username}</span>
                      {a.username === currentUser.username && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  ))}

                  <div className="border-t border-slate-800 mt-2 pt-1">
                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Disconnect Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Mobile Tab Navigation Strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800 bg-[#0F172A] py-2 px-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'feed' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Feed</span>
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'teams' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          <Users className="w-4 h-4" />
          <span>Teams</span>
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'referrals' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          <Key className="w-4 h-4" />
          <span>Invites</span>
        </button>
        <button
          onClick={() => setActiveTab('cli')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'cli' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          <Terminal className="w-4 h-4" />
          <span>CLI</span>
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'matrix' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          <Grid2X2 className="w-4 h-4" />
          <span>Matrix</span>
        </button>
      </div>
    </header>
  );
};
