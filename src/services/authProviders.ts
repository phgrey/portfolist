/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  linkWithPopup,
  unlink,
  signOut,
  GithubAuthProvider,
  GoogleAuthProvider,
  AuthProvider,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { PlatformType, Author } from '../types';

// Client Firebase Config (from env or fallback demo project)
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForPortfolistOAuth2026",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "portfolist-a3725.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "portfolist-a3725",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "portfolist-a3725.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:1029384756:web:abcd1234efgh"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const clientAuth = getAuth(app);

export interface AuthProviderConfig {
  id: PlatformType;
  name: string;
  isPrimary?: boolean;
  createProvider: () => AuthProvider;
  scopes: string[];
}

/**
 * Extensible OAuth Provider Registry
 * Easily add new providers (GitHub, Google, LinkedIn, Apple, Microsoft)
 */
export const OAUTH_PROVIDER_REGISTRY: Record<string, AuthProviderConfig> = {
  github: {
    id: 'github',
    name: 'GitHub',
    isPrimary: true,
    scopes: ['read:user', 'repo'],
    createProvider: () => {
      const provider = new GithubAuthProvider();
      provider.addScope('read:user');
      provider.addScope('repo');
      return provider;
    }
  },
  google: {
    id: 'google',
    name: 'Google & Google Docs',
    isPrimary: false,
    scopes: ['email', 'profile', 'https://www.googleapis.com/auth/documents.readonly'],
    createProvider: () => {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.addScope('https://www.googleapis.com/auth/documents.readonly');
      return provider;
    }
  },
  linkedin: {
    id: 'twitter', // mapped or custom provider
    name: 'LinkedIn (Extensible OIDC)',
    isPrimary: false,
    scopes: ['openid', 'profile', 'email'],
    createProvider: () => new GoogleAuthProvider() // Fallback placeholder for LinkedIn OIDC
  }
};

/**
 * Perform OAuth Login via popup for specified provider
 */
export async function loginWithOAuthProvider(providerId: PlatformType = 'github'): Promise<{ firebaseUser: FirebaseUser; idToken: string; author: Author }> {
  const config = OAUTH_PROVIDER_REGISTRY[providerId] || OAUTH_PROVIDER_REGISTRY.github;
  const provider = config.createProvider();

  console.log(`🔑 [OAuth Client] Initiating login with provider: ${config.name}...`);
  const userCredential = await signInWithPopup(clientAuth, provider);
  const firebaseUser = userCredential.user;
  const idToken = await firebaseUser.getIdToken();

  // Extract OAuth Access Token from Firebase Credential Result
  const credential = GithubAuthProvider.credentialFromResult(userCredential) || GoogleAuthProvider.credentialFromResult(userCredential);
  const accessToken = credential?.accessToken;

  // Extract GitHub username or display info if present
  let username = firebaseUser.email?.split('@')[0] || `user_${firebaseUser.uid.slice(0, 6)}`;
  // Check github additional user info
  const reloadData: any = userCredential;
  if (reloadData?._tokenResponse?.screenName) {
    username = reloadData._tokenResponse.screenName;
  }

  console.log(`✅ [OAuth Client] Successfully authenticated as @${username} (Access Token obtained: ${accessToken ? 'YES' : 'NO'}). Syncing with server...`);

  // Verify ID Token & OAuth Access Token with Express Server
  const response = await fetch('/api/auth/verify-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken,
      accessToken,
      provider: providerId,
      username,
      displayName: firebaseUser.displayName || username,
      avatarUrl: firebaseUser.photoURL,
      email: firebaseUser.email
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to verify OAuth token with server.');
  }

  const data = await response.json();
  return {
    firebaseUser,
    idToken,
    author: data.author
  };
}

/**
 * Link an additional provider (e.g. Link Google Docs while signed in via GitHub)
 */
export async function linkAdditionalProvider(providerId: PlatformType): Promise<Author> {
  if (!clientAuth.currentUser) {
    throw new Error('Must be signed in to link an additional provider.');
  }

  const config = OAUTH_PROVIDER_REGISTRY[providerId];
  if (!config) throw new Error(`Provider "${providerId}" not found in registry.`);

  const provider = config.createProvider();
  console.log(`🔗 [OAuth Client] Linking additional provider: ${config.name}...`);

  const userCredential = await linkWithPopup(clientAuth.currentUser, provider);
  const idToken = await userCredential.user.getIdToken();
  const credential = GithubAuthProvider.credentialFromResult(userCredential) || GoogleAuthProvider.credentialFromResult(userCredential);
  const accessToken = credential?.accessToken;

  const response = await fetch('/api/auth/verify-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken,
      accessToken,
      provider: providerId,
      username: clientAuth.currentUser.email?.split('@')[0] || 'linked_user',
      displayName: clientAuth.currentUser.displayName,
      avatarUrl: clientAuth.currentUser.photoURL,
      email: clientAuth.currentUser.email
    })
  });

  const data = await response.json();
  return data.author;
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(clientAuth);
}

/**
 * Subscribe to Auth State changes
 */
export function subscribeAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(clientAuth, callback);
}
