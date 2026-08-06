import React from 'react';
import { CheckCircle2, Sparkles, ArrowRight, Github, Globe, ShieldCheck, Home, MessageSquare } from 'lucide-react';
import { Author, PlatformType } from '../types';

interface ConnectionAddedProps {
  currentUser: Author | null;
  provider: PlatformType;
  username: string;
  isNewUser?: boolean;
  onReturnHome: () => void;
  onOpenAgentChat: () => void;
}

export const ConnectionAdded: React.FC<ConnectionAddedProps> = ({
  currentUser,
  provider,
  username,
  isNewUser = false,
  onReturnHome,
  onOpenAgentChat
}) => {
  const getProviderIcon = (p: PlatformType) => {
    switch (p) {
      case 'github':
        return <Github className="w-8 h-8 text-slate-900" />;
      case 'google':
        return <Globe className="w-8 h-8 text-red-500" />;
      case 'linkedin':
        return <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">in</div>;
      default:
        return <Sparkles className="w-8 h-8 text-indigo-500" />;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
        
        {/* Top Decorative Graphic */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isNewUser ? 'Welcome to Portfolist!' : 'Connection Successfully Added!'}
        </h2>

        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          {isNewUser
            ? `Your author profile @${username} has been created and verified via ${provider.toUpperCase()} OAuth.`
            : `Provider integration ${provider.toUpperCase()} has been linked to your author profile @${username}.`}
        </p>

        {/* Connected Provider Card */}
        <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              {getProviderIcon(provider)}
            </div>
            <div className="text-left">
              <div className="font-bold text-sm text-slate-900 capitalize">{provider} OAuth</div>
              <div className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Connected
              </div>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider">
            Active
          </span>
        </div>

        {/* Informational Agent Note */}
        <div className="mb-6 p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-xs text-left flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">AI Agent Memory Sync</span>
            <div className="text-[11px] text-indigo-700/90 mt-0.5">
              The Candidate Agent has indexed your connection into 2-tier memory for candidate evaluations & matrix comparisons.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onOpenAgentChat}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Launch AI Agent Assistant Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onReturnHome}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Portfolio</span>
          </button>
        </div>

      </div>
    </div>
  );
};
