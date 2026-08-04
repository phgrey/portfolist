import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Key, 
  ShieldAlert, 
  Github, 
  X as CloseIcon, 
  CheckCircle2, 
  AlertTriangle,
  Globe,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Author } from '../types';

interface ReferralGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  onLoginSuccess: (author: Author) => void;
}

export const ReferralGateModal: React.FC<ReferralGateModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [referralCode, setReferralCode] = useState(initialCode);
  const [provider, setProvider] = useState<'github' | 'google' | 'metamask' | 'x' | 'discord'>('github');
  
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    referrerUsername?: string;
    referrerDisplayName?: string;
    remainingUses?: number;
    error?: string;
  } | null>(null);

  const [gateError, setGateError] = useState<string | null>(null);

  // Validate referral code whenever referralCode changes
  useEffect(() => {
    if (initialCode && !referralCode) {
      setReferralCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    if (!referralCode || referralCode.trim().length < 4) {
      setValidationResult(null);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/referrals/validate?code=${encodeURIComponent(referralCode.trim())}`)
        .then(res => res.json())
        .then(data => {
          if (data.isValid) {
            setValidationResult(data);
            setGateError(null);
          } else {
            setValidationResult({ isValid: false, error: data.error || 'Invalid invite token' });
          }
        })
        .catch(() => {
          setValidationResult({ isValid: false, error: 'Could not validate referral code' });
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [referralCode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);

    if (!username.trim()) {
      setGateError('Please enter a username or handle.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          displayName: displayName.trim() || username.trim(),
          referralCode: referralCode.trim() || undefined,
          provider
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setGateError(data.message || data.error || 'Authentication failed. Referral token required for new registrations.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLoginSuccess(data.author);
      onClose();
    } catch (err) {
      setIsLoading(false);
      setGateError('Network error verifying authentication credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden text-slate-800">
        
        {/* Top Header Decorator */}
        <div className="h-1.5 bg-blue-600" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Gated Network Sign In
              </h3>
              <p className="text-xs text-slate-500">
                Invite-only referral system & OAuth / Web3 matrix
              </p>
            </div>
          </div>

          {/* Referral Notice */}
          {validationResult && validationResult.isValid ? (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-900">Valid Referral Invite Token!</span>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Invited by <strong className="text-emerald-900 font-mono">@{validationResult.referrerUsername}</strong> ({validationResult.remainingUses} uses remaining).
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900">Invite-Only Policy Notice</span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Existing members can sign in directly. Unregistered accounts require an active referral invite code to join.
                </p>
              </div>
            </div>
          )}

          {gateError && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-900">Authentication Blocked</span>
                <p className="text-[11px] text-rose-700 mt-0.5">{gateError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Identity Provider Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
                Select Identity Provider
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setProvider('github')}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    provider === 'github'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Github className={`w-4 h-4 mb-1 ${provider === 'github' ? 'text-white' : 'text-slate-800'}`} />
                  GitHub
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('google')}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    provider === 'google'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Globe className={`w-4 h-4 mb-1 ${provider === 'google' ? 'text-white' : 'text-rose-600'}`} />
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('metamask')}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    provider === 'metamask'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 mb-1 ${provider === 'metamask' ? 'text-white' : 'text-amber-600'}`} />
                  Web3
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('discord')}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    provider === 'discord'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Layers className={`w-4 h-4 mb-1 ${provider === 'discord' ? 'text-white' : 'text-purple-600'}`} />
                  Discord
                </button>
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Author Username / Handle
              </label>
              <input
                type="text"
                placeholder="e.g. alex_chen or sarah_dev"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Tip: Type <code className="text-blue-600 font-bold">alex_chen</code> or <code className="text-blue-600 font-bold">sarah_dev</code> to test pre-seeded authors.
              </p>
            </div>

            {/* Display Name Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Display Name (Optional for new users)
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Chen"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            {/* Referral Token Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1 font-mono">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  Referral Invite Token
                </label>
                <span className="text-[10px] text-slate-500">
                  {referralCode ? 'Token Provided' : 'Required for new accounts'}
                </span>
              </div>
              <input
                type="text"
                placeholder="INVITE_ALEX_2026"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-blue-700 placeholder-slate-400 text-xs font-mono tracking-wider uppercase focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <span>Verifying Authorization...</span>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-Seeded Invite Tokens shortcut */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1.5 font-bold">
              Demo Active Invite Codes (Click to auto-fill):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setReferralCode('INVITE_ALEX_2026')}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-blue-700 font-mono text-[10px] border border-slate-200 transition-colors cursor-pointer font-bold"
              >
                INVITE_ALEX_2026
              </button>
              <button
                type="button"
                onClick={() => setReferralCode('INVITE_SARAH_ALPHA')}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-blue-700 font-mono text-[10px] border border-slate-200 transition-colors cursor-pointer font-bold"
              >
                INVITE_SARAH_ALPHA
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
