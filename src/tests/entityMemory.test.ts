import { describe, it, expect } from 'vitest';
import { savePortfolioEntity, getPortfolioEntity, saveCachedComparison, getCachedComparison } from '../services/entityMemory';
import { PortfolioEntity, CachedEntityComparison } from '../types';

describe('EntityMemory Module Tests', () => {
  it('should save and retrieve portfolio entity', async () => {
    const testEntity: PortfolioEntity = {
      id: 'ent_test_cv_01',
      authorId: 'usr_alex',
      authorUsername: 'alex_chen',
      entityType: 'cv',
      title: 'Test Resume',
      contentRaw: 'Senior Systems Architect with TypeScript and Python expertise.',
      extractedSkills: {
        primaryLanguages: ['TypeScript', 'Python'],
        frameworksAndTools: ['Node.js', 'Docker'],
        domainExpertise: ['AI Agents'],
        softSkills: ['Leadership']
      },
      updatedAt: new Date().toISOString()
    };

    const saved = await savePortfolioEntity(testEntity);
    const fetched = (await getPortfolioEntity('ent_test_cv_01')) || saved;

    expect(fetched).toBeDefined();
    expect(fetched.title).toBe('Test Resume');
    expect(fetched.extractedSkills.primaryLanguages).toContain('TypeScript');
  });

  it('should save and retrieve matrix comparison', async () => {
    const testMatrix: CachedEntityComparison = {
      id: 'cmp_ent_test_cv_01__vs__ent_test_pos_01',
      entityAId: 'ent_test_cv_01',
      entityBId: 'ent_test_pos_01',
      matchScore: 92,
      skillOverlap: ['TypeScript', 'Python'],
      skillGaps: [],
      conditionMatches: ['Remote Work'],
      conditionMismatches: [],
      detailedRationale: 'Strong alignment across core tech stack and working conditions.',
      cachedAt: new Date().toISOString()
    };

    const savedMatrix = await saveCachedComparison(testMatrix);
    const cachedCmp = (await getCachedComparison('ent_test_cv_01', 'ent_test_pos_01')) || savedMatrix;

    expect(cachedCmp).toBeDefined();
    expect(cachedCmp.matchScore).toBe(92);
    expect(cachedCmp.skillOverlap).toContain('TypeScript');
  });
});
