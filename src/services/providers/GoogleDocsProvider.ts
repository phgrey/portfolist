import { IDataProvider, RawRepoData, RawUserData } from './BaseProvider';
import { PlatformType } from '../../types';

export class GoogleDocsProvider implements IDataProvider {
  providerId: PlatformType = 'google';
  name = 'Google Docs Provider (Specs & Architecture Documents)';

  async fetchRawUserData(username: string): Promise<RawUserData> {
    console.log(`📡 [GoogleDocsProvider] Fetching Google Workspace document index for @${username}...`);

    return {
      username,
      displayName: username,
      bio: 'Google Drive Document Repository',
      rawExperienceText: 'Google Docs Document Ingestion Scope (documents.readonly)',
      metadata: {
        documentTypes: ['CV / Resume Doc', 'Position Architecture Spec', 'Research Paper']
      }
    };
  }

  async fetchRawRepositoryData(repoName: string): Promise<RawRepoData> {
    throw new Error('GoogleDocsProvider reads Google Docs documents, not software repositories.');
  }
}

export const googleDocsProvider = new GoogleDocsProvider();
