import { PlatformType } from '../../types';

export interface RawRepoData {
  repoName: string;
  isPrivate: boolean;
  primaryLanguage: string;
  description: string;
  stargazerCount: number;
  forkCount: number;
  pushedAt: string;
  readmeContent?: string;
  workflowFiles?: string[];
  rawFiles?: Record<string, string>;
}

export interface RawUserData {
  username: string;
  displayName: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  repos?: RawRepoData[];
  rawExperienceText?: string;
  metadata?: Record<string, any>;
}

/**
 * Abstract Base Provider Interface for Layer 1 Data Connectors
 */
export interface IDataProvider {
  providerId: PlatformType;
  name: string;
  
  /**
   * Fetch raw user profile & associated data from provider
   */
  fetchRawUserData(username: string): Promise<RawUserData>;

  /**
   * Fetch raw repository data (code files, metadata) from provider
   */
  fetchRawRepositoryData(repoName: string): Promise<RawRepoData>;
}
