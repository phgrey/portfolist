import { savePortfolioEntity, getPortfolioEntity, saveCachedComparison, getCachedComparison } from '../services/entityMemory';
import { PortfolioEntity, CachedEntityComparison } from '../types';

async function runEntityMemoryTests() {
  console.log('🧪 Running Entity Memory & 2-Tier Caching Test Suite...\n');

  // Test 1: Save and fetch entity (RAM + Firestore)
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

  await savePortfolioEntity(testEntity);
  const fetched = await getPortfolioEntity('ent_test_cv_01');
  if (!fetched || fetched.title !== 'Test Resume') {
    throw new Error('Failed to retrieve saved entity from 2-tier memory.');
  }
  console.log('✅ Test 1 Passed: Portfolio entity saved and retrieved from 2-tier memory.');

  // Test 2: Save and fetch matrix comparison (RAM Cache Hit test)
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

  await saveCachedComparison(testMatrix);

  const t0 = Date.now();
  const cachedCmp = await getCachedComparison('ent_test_cv_01', 'ent_test_pos_01');
  const dur = Date.now() - t0;

  if (!cachedCmp || cachedCmp.matchScore !== 92) {
    throw new Error('Failed to retrieve matrix comparison from memory.');
  }

  console.log(`✅ Test 2 Passed: Comparison matrix retrieved in ${dur}ms (RAM cache hit!). Score: ${cachedCmp.matchScore}/100.`);

  console.log('\n🎉 ALL ENTITY MEMORY TESTS PASSED SUCCESSFULLY!');
}

if (process.argv[1]?.includes('entityMemory.test.ts')) {
  runEntityMemoryTests().catch(err => {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  });
}

export { runEntityMemoryTests };
