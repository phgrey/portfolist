import React from 'react';
import { 
  Github, 
  Globe, 
  Sparkles, 
  Lock, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  Check
} from 'lucide-react';
import { PlatformType } from '../types';

interface SignupPageProps {
  onSelectProvider: (providerId: PlatformType) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSelectProvider }) => {
  const providerCards = [
    {
      id: 'github' as PlatformType,
      name: 'GitHub',
      description: 'Public & private repositories, code profile, commits & CI/CD workflows',
      isPrimary: true,
      badge: 'Recommended for Developers',
      icon: <Github className="w-8 h-8 text-slate-900" />,
      actionUrl: '/api/auth/github/login'
    },
    {
      id: 'google' as PlatformType,
      name: 'Google & Google Docs',
      description: 'Google Docs specifications, architecture documents & Google Workspace',
      isPrimary: false,
      badge: 'Includes Docs Scope',
      icon: <Globe className="w-8 h-8 text-red-500" />
    },
    {
      id: 'linkedin' as PlatformType,
      name: 'LinkedIn',
      description: 'Professional career history, endorsements, skills & work experience',
      isPrimary: false,
      badge: 'OIDC Identity Ready',
      icon: (
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
          in
        </div>
      )
    },
    {
      id: 'metamask' as PlatformType,
      name: 'MetaMask / Web3',
      description: 'Sign-In with Ethereum (SIWE) and wallet identity verification',
      isPrimary: false,
      badge: 'Web3 Proof',
      icon: <Sparkles className="w-8 h-8 text-amber-500" />
    },
    {
      id: 'apple' as PlatformType,
      name: 'Microsoft & Apple ID',
      description: 'Enterprise SSO & single sign-on authentication provider',
      isPrimary: false,
      badge: 'Enterprise SSO',
      icon: <Lock className="w-8 h-8 text-blue-500" />
    },
    {
      id: 'discord' as PlatformType,
      name: 'Discord Guild',
      description: 'Social developer handles and community credentials',
      isPrimary: false,
      badge: 'Community Identity',
      icon: <Layers className="w-8 h-8 text-purple-500" />
    }
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 shadow-md">
          <Sparkles className="w-7 h-7 text-indigo-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Create Your Author Profile
        </h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Select an OAuth identity provider to connect your developer profile and initialize your personal Candidate AI Agent memory.
        </p>
      </div>

      {/* Provider Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providerCards.map(card => (
          <div
            key={card.id}
            onClick={() => {
              if (card.actionUrl) {
                window.location.href = card.actionUrl;
              } else {
                onSelectProvider(card.id);
              }
            }}
            className={`relative p-6 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:scale-[1.02] shadow-sm hover:shadow-xl ${
              card.isPrimary
                ? 'bg-gradient-to-b from-slate-900 to-indigo-950 border-indigo-500/40 text-white hover:border-indigo-400'
                : 'bg-white hover:bg-slate-50/90 border-slate-200 text-slate-900 hover:border-slate-300'
            }`}
          >
            <div>
              {/* Badge & Icon Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-2xl border ${card.isPrimary ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-100'}`}>
                  {card.icon}
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                  card.isPrimary 
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {card.badge}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className={`text-lg font-bold ${card.isPrimary ? 'text-white' : 'text-slate-900'}`}>
                {card.name}
              </h3>
              <p className={`text-xs mt-1.5 leading-relaxed ${card.isPrimary ? 'text-slate-300' : 'text-slate-500'}`}>
                {card.description}
              </p>
            </div>

            {/* Action Trigger Link */}
            <div className="mt-6 pt-4 border-t border-slate-100/10 flex items-center justify-between font-bold text-xs">
              <span className={card.isPrimary ? 'text-blue-300' : 'text-blue-600'}>
                Connect {card.name}
              </span>
              <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${card.isPrimary ? 'text-blue-300' : 'text-blue-600'}`} />
            </div>

          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Registration is 100% OAuth-based. No referral code required.</span>
      </div>

    </div>
  );
};
