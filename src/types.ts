export type PlatformType = 
  | 'github'
  | 'google'
  | 'youtube'
  | 'reddit'
  | 'flickr'
  | 'twitter'
  | 'metamask'
  | 'apple'
  | 'microsoft'
  | 'discord';

export interface IntegrationRecord {
  provider: PlatformType;
  providerUserId: string;
  metadata?: {
    username?: string;
    orgs?: string[];
    channelId?: string;
    walletAddress?: string;
    subreddits?: string[];
    [key: string]: any;
  };
}

export interface ContactMethod {
  platform: 'discord' | 'whatsapp' | 'telegram' | 'email' | 'x';
  value: string;
  isPublic: boolean;
}

export interface Author {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bioMarkdown: string;
  role: string;
  createdAt: string;
  integrations: IntegrationRecord[];
  contactMethods: ContactMethod[];
  referredBy?: string;
}

export interface ReferralToken {
  id: string;
  code: string;
  referrerId: string;
  referrerUsername: string;
  maxUses: number;
  usesCount: number;
  expiresAt: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  descriptionMarkdown: string;
  avatarUrl?: string;
  members: {
    authorId: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    role: 'owner' | 'member';
  }[];
  createdAt: string;
}

export interface NotebookCell {
  cell_type: 'markdown' | 'code';
  source: string[];
  execution_count?: number | null;
  outputs?: {
    output_type: string;
    text?: string[];
    data?: Record<string, any>;
  }[];
}

export interface PortfolioItemPayload {
  // Notebook
  cells?: NotebookCell[];
  language?: string;
  
  // GitHub
  stars?: number;
  forks?: number;
  topics?: string[];
  
  // YouTube
  videoId?: string;
  duration?: string;
  views?: number;
  
  // Reddit
  subreddit?: string;
  upvotes?: number;
  commentsCount?: number;
  
  // Flickr
  photoCount?: number;
  images?: string[];
  
  // Web3 / MetaMask
  contractAddress?: string;
  chain?: string;
  nftImageUrl?: string;
  
  // Google Doc
  documentId?: string;
  wordCount?: number;
  
  // Raw content / body text
  bodyMarkdown?: string;
}

export interface PortfolioItem {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string;
  sourcePlatform: PlatformType | 'gemini' | 'gdoc';
  externalId: string;
  title: string;
  description: string;
  url: string;
  contentPayload: PortfolioItemPayload;
  isFeatured: boolean;
  syncedAt: string;
  tags: string[];
}

export interface AuthState {
  user: Author | null;
  activeReferralCode?: string;
  referralDetails?: {
    referrerUsername: string;
    isValid: boolean;
    remainingUses: number;
  } | null;
}

export interface AuthorProjectSet {
  id: string;
  authorId: string;
  authorUsername: string;
  setName: string;
  repoList: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CachedAnalysis {
  id: string;
  cacheKey: string;
  repoList: string[];
  result: any;
  cachedAt: string;
}

