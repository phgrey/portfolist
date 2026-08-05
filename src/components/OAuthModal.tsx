import React, { useState } from 'react';
import { X, Github, Sparkles, ShieldCheck, Lock, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { loginWithOAuthProvider } from '../services/authProviders';
import { Author, PlatformType } from '../types';

interface OAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (author: Author) => void;
}

export function OAuthModal({ isOpen, onClose, onLoginSuccess }: OAuthModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOAuthLogin = async (providerId: PlatformType) => {
    setIsLoading(providerId);
    setErrorMessage(null);

    try {
      const { author } = await loginWithOAuthProvider(providerId);
      onLoginSuccess(author);
      onClose();
    } catch (err: any) {
      console.warn(`⚠️ OAuth login warning: ${err.message || String(err)}`);
      setErrorMessage(err.message || 'OAuth authentication failed. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg">
            <Sparkles className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to Portfolist</h2>
          <p className="text-sm text-slate-400 mt-1">
            Choose your OAuth identity provider to access candidate evaluation & AI agent memory.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3.5">
          
          {/* PRIMARY RECOMMENDED BUTTON: GitHub OAuth */}
          <button
            onClick={() => handleOAuthLogin('github')}
            disabled={isLoading !== null}
            className="w-full relative group p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-2xl shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-between border border-indigo-400/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-950/40 flex items-center justify-center text-white">
                <Github className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm flex items-center gap-2">
                  Sign in with GitHub
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                    Recommended
                  </span>
                </div>
                <div className="text-xs text-blue-100/80">Code profile, repository skills & AI Memory</div>
              </div>
            </div>
            {isLoading === 'github' && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
          </button>

          {/* SECONDARY BUTTON: Google OAuth */}
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading !== null}
            className="w-full p-3.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium rounded-2xl shadow-sm hover:border-slate-600 hover:scale-[1.01] transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 font-bold text-sm">
                G
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm text-white">Sign in with Google</div>
                <div className="text-xs text-slate-400">Includes Google Docs & Drive read scopes</div>
              </div>
            </div>
            {isLoading === 'google' && (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            )}
          </button>

          {/* EXTENSIBLE PROVIDER PLACEHOLDER: LinkedIn */}
          <button
            onClick={() => handleOAuthLogin('linkedin')}
            disabled={isLoading !== null}
            className="w-full p-3 bg-slate-900/60 hover:bg-slate-800/50 border border-slate-800 text-slate-400 font-medium rounded-2xl text-xs flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold text-xs">
                in
              </div>
              <span>Sign in with LinkedIn (Extensible OIDC)</span>
            </div>
            <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">OIDC Ready</span>
          </button>

        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>OAuth 2.0 Identity Platform. Registration is exclusive via OAuth.</span>
        </div>

      </div>
    </div>
  );
}
