import React, { useState } from 'react';
import { Author, PlatformType } from '../types';
import { 
  Navbar as MTNavbar,
  Collapse as MTCollapse,
  Typography as MTTypography,
  Button as MTButton,
  IconButton as MTIconButton,
  Menu as MTMenu,
  MenuTrigger as MTMenuTrigger,
  MenuContent as MTMenuContent,
  MenuItem as MTMenuItem,
  Avatar as MTAvatar,
  Chip as MTChip,
  ChipLabel as MTChipLabel,
  ChipIcon as MTChipIcon
} from '@material-tailwind/react';
import { 
  Terminal, 
  Users, 
  Key, 
  Sparkles, 
  UserCheck, 
  LogOut, 
  CheckCircle2, 
  Grid2X2,
  Github,
  Globe,
  Menu as MenuIcon,
  X
} from 'lucide-react';

const Navbar = MTNavbar as any;
const Collapse = MTCollapse as any;
const Typography = MTTypography as any;
const Button = MTButton as any;
const IconButton = MTIconButton as any;
const Menu = MTMenu as any;
const MenuTrigger = MTMenuTrigger as any;
const MenuContent = MTMenuContent as any;
const MenuItem = MTMenuItem as any;
const Avatar = MTAvatar as any;
const Chip = MTChip as any;
const ChipLabel = MTChipLabel as any;
const ChipIcon = MTChipIcon as any;

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
  const [openNav, setOpenNav] = useState(false);

  // Connection Provider Badges Definition
  const providerList: { id: PlatformType; name: string; icon: React.ReactNode }[] = [
    {
      id: 'github',
      name: 'GitHub',
      icon: <Github className="w-4 h-4" />
    },
    {
      id: 'google',
      name: 'Google Docs',
      icon: <Globe className="w-4 h-4 text-red-400" />
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <span className="font-bold text-xs text-blue-400 font-sans">in</span>
    }
  ];

  const isConnected = (pId: PlatformType): boolean => {
    if (!currentUser || !currentUser.integrations) return false;
    return currentUser.integrations.some(i => i.provider === pId);
  };

  const navList = (
    <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-1">
      <Typography as="li" variant="small" className="p-1 font-normal">
        <Button
          size="sm"
          variant={activeTab === 'feed' ? 'solid' : 'ghost'}
          color={activeTab === 'feed' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('feed')}
          className="flex items-center gap-2 px-3 py-1.5 capitalize text-xs shadow-none font-medium"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Dashboard
        </Button>
      </Typography>

      <Typography as="li" variant="small" className="p-1 font-normal">
        <Button
          size="sm"
          variant={activeTab === 'teams' ? 'solid' : 'ghost'}
          color={activeTab === 'teams' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('teams')}
          className="flex items-center gap-2 px-3 py-1.5 capitalize text-xs shadow-none font-medium"
        >
          <Users className="w-3.5 h-3.5" />
          Team Groups
        </Button>
      </Typography>

      <Typography as="li" variant="small" className="p-1 font-normal">
        <Button
          size="sm"
          variant={activeTab === 'referrals' ? 'solid' : 'ghost'}
          color={activeTab === 'referrals' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('referrals')}
          className="flex items-center gap-2 px-3 py-1.5 capitalize text-xs shadow-none font-medium"
        >
          <Key className="w-3.5 h-3.5" />
          Referrals
        </Button>
      </Typography>

      <Typography as="li" variant="small" className="p-1 font-normal">
        <Button
          size="sm"
          variant={activeTab === 'cli' ? 'solid' : 'ghost'}
          color={activeTab === 'cli' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('cli')}
          className="flex items-center gap-2 px-3 py-1.5 capitalize text-xs shadow-none font-medium"
        >
          <Terminal className="w-3.5 h-3.5" />
          CLI Config
        </Button>
      </Typography>

      <Typography as="li" variant="small" className="p-1 font-normal">
        <Button
          size="sm"
          variant={activeTab === 'matrix' ? 'solid' : 'ghost'}
          color={activeTab === 'matrix' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('matrix')}
          className="flex items-center gap-2 px-3 py-1.5 capitalize text-xs shadow-none font-medium"
        >
          <Grid2X2 className="w-3.5 h-3.5" />
          Integration Hub
        </Button>
      </Typography>
    </ul>
  );

  return (
    <Navbar className="sticky top-0 z-40 max-w-full rounded-none border-b border-slate-800 bg-[#0F172A] px-4 py-2 lg:px-8 text-slate-100 shadow-md">
      <div className="flex items-center justify-between text-slate-100">
        
        {/* Brand Logo with Material Tailwind v3 Typography & Avatar */}
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
              variant="h6"
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
              <MenuTrigger asChild>
                <Button
                  variant="outline"
                  color="secondary"
                  className="flex items-center gap-2.5 p-1.5 border-slate-700 hover:border-slate-600 bg-slate-900 text-left capitalize shadow-none"
                >
                  <Avatar
                    src={currentUser.avatarUrl}
                    alt={currentUser.displayName}
                    size="xs"
                    className="ring-1 ring-blue-500/40"
                  />
                  <div className="hidden lg:block font-normal normal-case">
                    <Typography
                      variant="small"
                      className="text-xs font-medium text-white flex items-center gap-1 font-mono"
                    >
                      @{currentUser.username}
                      <UserCheck className="w-3 h-3 text-emerald-400" />
                    </Typography>
                    <Typography
                      variant="small"
                      className="text-[10px] text-emerald-400 font-mono"
                    >
                      SYS_CONNECTED
                    </Typography>
                  </div>
                </Button>
              </MenuTrigger>
              <MenuContent className="bg-slate-900 border border-slate-700 text-slate-200 p-2 shadow-2xl z-50 min-w-[240px] rounded-xl">
                <div className="px-3 py-2 border-b border-slate-800 mb-1 outline-none">
                  <Typography
                    variant="small"
                    className="font-semibold text-white text-xs"
                  >
                    {currentUser.displayName}
                  </Typography>
                  <Typography
                    variant="small"
                    className="text-[11px] text-slate-400 font-mono"
                  >
                    @{currentUser.username} • {currentUser.role}
                  </Typography>
                </div>

                <Typography
                  variant="small"
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
