import React, { useState, useEffect } from 'react';
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Avatar,
  Chip,
  ChipLabel,
  ChipIcon,
  Collapse
} from '@material-tailwind/react';

import { Author, PlatformType } from '../types';
import {
  Sparkles,
  Users,
  Key,
  Terminal,
  Grid2X2,
  Github,
  Globe,
  Youtube,
  MessageSquare,
  ShieldCheck,
  User,
  CheckCircle2,
  LogOut,
  Menu as MenuIcon,
  X
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'feed' | 'teams' | 'referrals' | 'cli' | 'matrix';
  setActiveTab: (tab: 'feed' | 'teams' | 'referrals' | 'cli' | 'matrix') => void;
  currentUser: Author | null;
  allAuthors: Author[];
  activeReferralCode?: string;
  onOpenSignIn: () => void;
  onLogout: () => void;
  onSwitchUser: (username: string) => void;
  onConnectProvider?: (provider: PlatformType) => void;
  onOpenAuthorProfile?: (username: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  allAuthors,
  activeReferralCode,
  onOpenSignIn,
  onLogout,
  onSwitchUser,
  onConnectProvider,
  onOpenAuthorProfile
}) => {
  const [openNav, setOpenNav] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960) {
        setOpenNav(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const providerList: { id: PlatformType; name: string; icon: React.ReactNode }[] = [
    { id: 'github', name: 'GitHub', icon: <Github className="w-3.5 h-3.5" /> },
    { id: 'google', name: 'Google Drive', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'youtube', name: 'YouTube', icon: <Youtube className="w-3.5 h-3.5" /> },
    { id: 'reddit', name: 'Reddit', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'metamask', name: 'Web3 Proof', icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> }
  ];

  const isConnected = (pId: PlatformType): boolean => {
    if (!currentUser || !currentUser.integrations) return false;
    return currentUser.integrations.some(i => i.provider === pId);
  };

  const navList = (
    <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-1">
      <Typography as="li" type="small" className="p-1 font-normal">
        <Button
          size="sm"
          variant={activeTab === 'feed' ? 'solid' : 'ghost'}
          color={activeTab === 'feed' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('feed')}
          className="flex items-center gap-2 px-3 py-1.5 capitalize text-xs shadow-none font-medium text-white"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Dashboard
        </Button>
      </Typography>

      <Typography as="li" type="small" className="p-1 font-normal">
        <Button
          size="sm"
          variant={activeTab === 'teams' ? 'solid' : 'ghost'}
          color={activeTab === 'teams' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('teams')}
          className="flex items-center gap-2 px-3 py-1.5 capitalize text-xs shadow-none font-medium text-white"
        >
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          Team Groups
        </Button>
      </Typography>

      <Typography as="li" type="small" className="p-1 font-normal">
        <Button
          size="sm"
          variant={activeTab === 'referrals' ? 'solid' : 'ghost'}
          color={activeTab === 'referrals' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('referrals')}
          className="flex items-center gap-2 px-3 py-1.5 capitalize text-xs shadow-none font-medium text-white"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          Referrals
        </Button>
      </Typography>

      <Typography as="li" type="small" className="p-1 font-normal">
        <Button
          size="sm"
          variant={activeTab === 'cli' ? 'solid' : 'ghost'}
          color={activeTab === 'cli' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('cli')}
          className="flex items-center gap-2 px-3 py-1.5 capitalize text-xs shadow-none font-medium text-white"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          CLI Config
        </Button>
      </Typography>

      <Typography as="li" type="small" className="p-1 font-normal">
        <Button
          size="sm"
          variant={activeTab === 'matrix' ? 'solid' : 'ghost'}
          color={activeTab === 'matrix' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('matrix')}
          className="flex items-center gap-2 px-3 py-1.5 capitalize text-xs shadow-none font-medium text-white"
        >
          <Grid2X2 className="w-3.5 h-3.5 text-purple-400" />
          Integration Hub
        </Button>
      </Typography>
    </ul>
  );

  return (
    <Navbar className="sticky top-0 z-40 max-w-full rounded-none px-4 py-2 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 text-white shadow-xl">
      <div className="flex items-center justify-between container mx-auto">
        
        {/* Brand & System Status */}
        <div
          className="flex items-center gap-3 cursor-pointer mr-4"
          onClick={() => setActiveTab('feed')}
        >
          <Avatar
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80"
            alt="Collective Logo"
            size="xs"
            className="bg-blue-600 ring-2 ring-blue-500/50"
          />
          <div className="flex items-center gap-2">
            <Typography
              type="h6"
              className="font-bold tracking-tighter text-white font-mono text-base sm:text-lg"
            >
              COLLECTIVE.SYS
            </Typography>
            <Chip color="secondary" variant="outline" className="text-[10px] font-mono px-1.5 py-0.5 border-slate-700 text-blue-400 font-semibold bg-slate-900">
              <ChipLabel>GATED_SYS</ChipLabel>
            </Chip>
          </div>
        </div>

        {/* Primary Desktop Nav */}
        <div className="hidden lg:block">{navList}</div>

        {/* Right Action & User Profile Section */}
        <div className="flex items-center gap-3">
          
          {/* Active Referral Invite Tag */}
          {activeReferralCode && (
            <div onClick={onOpenSignIn} className="cursor-pointer hidden sm:block">
              <Chip color="warning" variant="solid" className="font-mono text-xs hover:opacity-90 transition-all flex items-center gap-1">
                <ChipIcon><Key className="w-3.5 h-3.5 text-amber-400" /></ChipIcon>
                <ChipLabel>{`CODE: ${activeReferralCode}`}</ChipLabel>
              </Chip>
            </div>
          )}

          {/* Connection Provider Icons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            {providerList.map(prov => {
              const connected = isConnected(prov.id);
              return (
                <IconButton
                  key={prov.id}
                  size="sm"
                  variant={connected ? 'solid' : 'outline'}
                  color={connected ? 'primary' : 'secondary'}
                  onClick={() => onConnectProvider && onConnectProvider(prov.id)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    connected
                      ? 'border-0'
                      : 'border-slate-800 grayscale opacity-50 hover:grayscale-0 hover:opacity-100'
                  }`}
                  title={connected ? `${prov.name} (Connected)` : `Connect with ${prov.name}`}
                >
                  {prov.icon}
                </IconButton>
              );
            })}
          </div>

          {/* User Profile Menu from @material-tailwind/react v3 */}
          {currentUser && (
            <Menu placement="bottom-end">
              <MenuTrigger className="flex items-center gap-2.5 p-1.5 border border-slate-700 hover:border-slate-600 bg-slate-900 text-left capitalize shadow-none text-white rounded-lg transition-colors cursor-pointer outline-none">
                <Avatar
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  size="xs"
                  className="ring-1 ring-blue-500/40"
                />
                <div className="hidden lg:block font-normal normal-case">
                  <Typography
                    type="small"
                    className="font-semibold text-white leading-none text-xs"
                  >
                    {currentUser.displayName}
                  </Typography>
                  <Typography
                    type="small"
                    className="text-[10px] text-slate-400 font-mono leading-tight flex items-center gap-1 mt-0.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    SYS_CONNECTED
                  </Typography>
                </div>
              </MenuTrigger>
              <MenuContent className="bg-slate-900 border border-slate-700 text-slate-200 p-2 shadow-2xl z-50 min-w-[240px] rounded-xl">
                <div className="px-3 py-2 border-b border-slate-800 mb-1 outline-none">
                  <Typography
                    type="small"
                    className="font-semibold text-white text-xs"
                  >
                    {currentUser.displayName}
                  </Typography>
                  <Typography
                    type="small"
                    className="text-[11px] text-slate-400 font-mono"
                  >
                    @{currentUser.username} • {currentUser.role}
                  </Typography>
                </div>

                <MenuItem
                  onClick={() => {
                    window.history.pushState({}, '', '/me');
                    if (onOpenAuthorProfile) {
                      onOpenAuthorProfile(currentUser.username);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-blue-300 hover:bg-slate-800 rounded cursor-pointer font-medium mb-1"
                >
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  View My Profile (/me)
                </MenuItem>

                <Typography
                  type="small"
                  className="text-[10px] uppercase font-mono text-slate-400 px-3 py-1 font-bold tracking-widest"
                >
                  Switch Test Account
                </Typography>
                {allAuthors.map(a => (
                  <MenuItem
                    key={a.id}
                    onClick={() => onSwitchUser(a.username)}
                    className={`flex items-center justify-between px-3 py-1.5 text-xs font-mono rounded cursor-pointer ${
                      a.username === currentUser.username
                        ? 'bg-blue-600/20 text-blue-300 font-medium'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>@{a.username}</span>
                    {a.username === currentUser.username && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                  </MenuItem>
                ))}

                <hr className="my-1 border-slate-800" />
                <MenuItem
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect Account
                </MenuItem>
              </MenuContent>
            </Menu>
          )}

          {/* Mobile Drawer Menu Button */}
          <IconButton
            variant="ghost"
            color="secondary"
            className="ml-auto h-8 w-8 text-white hover:bg-slate-800 lg:hidden"
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </IconButton>

        </div>
      </div>

      {/* Mobile Nav Collapse */}
      <Collapse open={openNav}>
        <div className="container mx-auto pb-2 pt-2">
          {navList}
        </div>
      </Collapse>
    </Navbar>
  );
};
