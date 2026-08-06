import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { MikroORM } from '@mikro-orm/core';
import { initMikroOrm, setOrmInstance } from '../services/mikroDb';
import { DatabaseSeeder } from '../seeders/DatabaseSeeder';
import { authorSchema } from '../entities/AuthorEntity';
import { portfolioItemSchema } from '../entities/PortfolioItemEntity';
import { teamSchema } from '../entities/TeamEntity';
import { referralTokenSchema } from '../entities/ReferralTokenEntity';
import { portfolioMemorySchema } from '../entities/PortfolioMemoryEntity';
import { comparisonMatrixSchema } from '../entities/ComparisonMatrixEntity';
import { authorProjectSetSchema } from '../entities/AuthorProjectSetEntity';
import { cachedAnalysisSchema } from '../entities/CachedAnalysisEntity';

import {
  findAuthorByUsernameOrEmail,
  upsertAuthorFromGithubOAuth,
  savePortfolioEntity,
  getPortfolioEntity,
  saveCachedComparison,
  getCachedComparison
} from '../services/entityMemory';

import {
  saveProjectSet,
  getProjectSets,
  getProjectSetByName,
  saveCachedAnalysis,
  getCachedAnalysis,
  generateCacheKey
} from '../services/agentMemory';

describe('EntityMemory & AgentMemory Integration Tests (SQLite In-Memory DB)', () => {
  let orm: MikroORM;

  beforeAll(async () => {
    setOrmInstance(null);
    orm = await initMikroOrm({
      driver: SqliteDriver,
      dbName: ':memory:',
      entities: [
        authorSchema,
        portfolioItemSchema,
        teamSchema,
        referralTokenSchema,
        portfolioMemorySchema,
        comparisonMatrixSchema,
        authorProjectSetSchema,
        cachedAnalysisSchema
      ],
      debug: false
    });

    await (orm.schema as any).create();
    const em = orm.em.fork();
    const seeder = new DatabaseSeeder();
    await seeder.run(em);
  });

  afterAll(async () => {
    if (orm) {
      await orm.close();
    }
  });

  describe('Author & Entity Lookup Functions', () => {
    it('should find seeded author by username', async () => {
      const alex = await findAuthorByUsernameOrEmail('alex_chen');
      expect(alex).toBeDefined();
      expect(alex?.username).toBe('alex_chen');
      expect(alex?.displayName).toBe('Alex Chen');
    });

    it('should resolve author by email', async () => {
      const alexByEmail = await findAuthorByUsernameOrEmail(undefined, 'alex.chen@workspace.dev');
      expect(alexByEmail).toBeDefined();
      expect(alexByEmail?.username).toBe('alex_chen');
    });

    it('should upsert author from GitHub OAuth payload', async () => {
      const newGithubUser = {
        login: 'sarah_web3',
        name: 'Sarah Web3 Dev',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        email: 'sarah_web3@collectivefolio.dev'
      };

      const { author, isNewUser } = await upsertAuthorFromGithubOAuth(newGithubUser, 'token_sarah_123');
      expect(author).toBeDefined();
      expect(author.username).toBe('sarah_web3');
      expect(isNewUser).toBe(true);
    });
  });

  describe('Portfolio Memory Entities', () => {
    it('should save and retrieve portfolio entity', async () => {
      const testEntity = {
        id: 'ent_integration_cv_01',
        authorId: 'usr_alex_chen',
        authorUsername: 'alex_chen',
        entityType: 'cv' as const,
        title: 'Senior AI Engineer Resume',
        contentRaw: 'Expert in Python, TypeScript, MikroORM, and Gemini 2.5 AI Agent Systems.',
        extractedSkills: {
          primaryLanguages: ['TypeScript', 'Python'],
          frameworksAndTools: ['MikroORM', 'Express', 'Vite'],
          domainExpertise: ['AI Agents', 'SQL/NoSQL'],
          softSkills: ['System Design']
        },
        updatedAt: new Date().toISOString()
      };

      await savePortfolioEntity(testEntity);
      const fetched = await getPortfolioEntity('ent_integration_cv_01');
      expect(fetched).toBeDefined();
      expect(fetched?.title).toBe('Senior AI Engineer Resume');
      expect(fetched?.extractedSkills.primaryLanguages).toContain('TypeScript');
    });

    it('should save and retrieve comparison matrix', async () => {
      const testMatrix = {
        id: 'cmp_ent_integration_cv_01__vs__ent_pos_senior_ai',
        entityAId: 'ent_integration_cv_01',
        entityBId: 'ent_pos_senior_ai',
        matchScore: 95,
        skillOverlap: ['TypeScript', 'Python', 'MikroORM'],
        skillGaps: [],
        conditionMatches: ['Remote', 'Full-Time'],
        conditionMismatches: [],
        detailedRationale: 'Perfect match for Senior AI Engineer position.',
        cachedAt: new Date().toISOString()
      };

      await saveCachedComparison(testMatrix);
      const fetchedMatrix = await getCachedComparison('ent_integration_cv_01', 'ent_pos_senior_ai');
      expect(fetchedMatrix).toBeDefined();
      expect(fetchedMatrix?.matchScore).toBe(95);
    });
  });

  describe('Agent Project Sets & Analysis Cache', () => {
    it('should save, retrieve all, and retrieve by name for author project sets', async () => {
      await saveProjectSet('usr_alex_chen', 'alex_chen', 'AI Core Services', ['phgrey/portfolist', 'phgrey/grafin'], true);
      const sets = await getProjectSets('alex_chen');
      expect(sets.length).toBeGreaterThan(0);

      const foundSet = await getProjectSetByName('alex_chen', 'AI Core Services');
      expect(foundSet).toBeDefined();
      expect(foundSet?.repoList).toEqual(['phgrey/portfolist', 'phgrey/grafin']);
    });

    it('should save and retrieve cached skill analysis', async () => {
      const cacheKey = generateCacheKey(['phgrey/portfolist', 'phgrey/grafin']);
      await saveCachedAnalysis(cacheKey, ['phgrey/portfolist', 'phgrey/grafin'], {
        overallScore: 98,
        techStack: ['TypeScript', 'Python', 'MikroORM'],
        insights: 'High velocity repository setup.'
      });

      const cachedAnalysis = await getCachedAnalysis(cacheKey);
      expect(cachedAnalysis).toBeDefined();
      expect(cachedAnalysis?.result.overallScore).toBe(98);
    });
  });
});
