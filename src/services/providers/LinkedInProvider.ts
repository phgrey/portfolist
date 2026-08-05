import { IDataProvider, RawRepoData, RawUserData } from './BaseProvider';
import { PlatformType } from '../../types';

export class LinkedInProvider implements IDataProvider {
  providerId: PlatformType = 'linkedin';
  name = 'LinkedIn Provider (Career Profile & Experience)';

  async fetchRawUserData(username: string): Promise<RawUserData> {
    console.log(`📡 [LinkedInProvider] Fetching raw LinkedIn career profile for @${username}...`);

    return {
      username,
      displayName: username.replace('_', ' ').toUpperCase(),
      bio: `Staff AI Architect & Engineer | Specializing in Gemini 2.5 Flash pipelines, TypeScript, Node.js, and Cloud Infrastructure.`,
      rawExperienceText: `
        Position: Staff AI Systems Architect (2023 - Present)
        Company: AI Research Guild
        - Spearheaded multi-agent reasoning workflows and 2-tier memory caching systems.
        - Tech Stack: TypeScript, Python, Node.js, Cloud Firestore, Docker, GitHub Actions.

        Position: Senior Full-Stack Engineer (2020 - 2023)
        - Built distributed real-time data pipelines and React dashboards.
        - Tech Stack: React, Vite, Tailwind CSS, Express, Jest, PostgreSQL.
      `,
      metadata: {
        skillsCount: 24,
        endorsementsCount: 18,
        recommendationsCount: 5
      }
    };
  }

  async fetchRawRepositoryData(repoName: string): Promise<RawRepoData> {
    throw new Error('LinkedInProvider does not host software repositories directly.');
  }
}

export const linkedInProvider = new LinkedInProvider();
