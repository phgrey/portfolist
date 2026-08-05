import { MongoFirestoreCollection } from './mongoFirestore';
import { AuthorProjectSet, CachedAnalysis } from '../types';

// Collections in Cloud Firestore Enterprise
const projectSetsCol = new MongoFirestoreCollection<AuthorProjectSet>('author_project_sets');
const cachedAnalysesCol = new MongoFirestoreCollection<CachedAnalysis>('cached_analyses');

// ⚡ L1 Process RAM Caches for <1ms instant hits
const l1ProjectSetsMap = new Map<string, AuthorProjectSet[]>(); // key: authorId or authorUsername
const l1AnalysisMap = new Map<string, CachedAnalysis>(); // key: cacheKey

/**
 * Generate deterministic cache key for a set of repositories
 */
export function generateCacheKey(repoList: string[]): string {
  const sorted = [...repoList].map(r => r.trim().toLowerCase()).sort();
  return `analysis_${sorted.join('__')}`;
}

/**
 * Save or update an Author Project Set
 * Defaults to isPublic = false (private)
 */
export async function saveProjectSet(
  authorId: string,
  authorUsername: string,
  setName: string,
  repoList: string[],
  isPublic: boolean = false
): Promise<AuthorProjectSet> {
  const setId = `set_${authorId}_${setName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;
  const now = new Date().toISOString();

  const existing = await projectSetsCol.findOne({ _id: setId });

  const projectSet: AuthorProjectSet = {
    id: setId,
    authorId,
    authorUsername,
    setName,
    repoList: Array.from(new Set(repoList)),
    isPublic,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  if (existing) {
    await projectSetsCol.updateOne({ _id: setId }, { $set: projectSet });
  } else {
    await projectSetsCol.insertOne(projectSet);
  }

  // Invalidate & Update L1 RAM Cache
  const currentSets = l1ProjectSetsMap.get(authorId) || [];
  const updatedSets = currentSets.filter(s => s.id !== setId);
  updatedSets.push(projectSet);
  l1ProjectSetsMap.set(authorId, updatedSets);
  l1ProjectSetsMap.set(authorUsername, updatedSets);

  console.log(`💾 [AgentMemory L1+L2] Saved project set "${setName}" for author "${authorUsername}" (${repoList.length} repos, isPublic=${isPublic}).`);
  return projectSet;
}

/**
 * Retrieve Project Sets for an author (checks L1 RAM first, then L2 Firestore)
 */
export async function getProjectSets(authorIdOrUsername: string): Promise<AuthorProjectSet[]> {
  // 1. Check L1 In-Memory RAM Cache
  if (l1ProjectSetsMap.has(authorIdOrUsername)) {
    return l1ProjectSetsMap.get(authorIdOrUsername)!;
  }

  // 2. Check L2 Firestore Store
  const byId = await projectSetsCol.find({ authorId: authorIdOrUsername });
  const byUsername = byId.length > 0 ? byId : await projectSetsCol.find({ authorUsername: authorIdOrUsername });

  // Warm L1 Cache
  l1ProjectSetsMap.set(authorIdOrUsername, byUsername);
  return byUsername;
}

/**
 * Retrieve Project Set by author and set name
 */
export async function getProjectSetByName(
  authorIdOrUsername: string,
  setName: string
): Promise<AuthorProjectSet | null> {
  const sets = await getProjectSets(authorIdOrUsername);
  const found = sets.find(s => s.setName.toLowerCase() === setName.toLowerCase());
  if (found) return found;

  const direct = await projectSetsCol.findOne({
    authorUsername: authorIdOrUsername,
    setName
  }) || await projectSetsCol.findOne({
    authorId: authorIdOrUsername,
    setName
  });

  return direct;
}

/**
 * Retrieve cached skill analysis (Checks L1 RAM first, then L2 Firestore)
 */
export async function getCachedAnalysis(cacheKey: string): Promise<CachedAnalysis | null> {
  const startTime = Date.now();

  // 1. Check L1 RAM Cache (<1ms)
  if (l1AnalysisMap.has(cacheKey)) {
    const hit = l1AnalysisMap.get(cacheKey)!;
    console.log(`⚡ [AgentMemory L1 RAM Cache HIT] (${Date.now() - startTime}ms) for key: ${cacheKey}`);
    return hit;
  }

  // 2. Check L2 Cloud Firestore (<10ms)
  const l2Hit = await cachedAnalysesCol.findOne({ _id: cacheKey }) || await cachedAnalysesCol.findOne({ cacheKey });
  if (l2Hit) {
    console.log(`🔥 [AgentMemory L2 Firestore Cache HIT] (${Date.now() - startTime}ms) for key: ${cacheKey}`);
    // Populate L1 RAM Cache
    l1AnalysisMap.set(cacheKey, l2Hit);
    return l2Hit;
  }

  console.log(`🔍 [AgentMemory L1+L2 Cache MISS] (${Date.now() - startTime}ms) for key: ${cacheKey}`);
  return null;
}

/**
 * Save analysis result into L1 RAM Cache & L2 Cloud Firestore
 */
export async function saveCachedAnalysis(
  cacheKey: string,
  repoList: string[],
  result: any
): Promise<CachedAnalysis> {
  const now = new Date().toISOString();
  const doc: CachedAnalysis = {
    id: cacheKey,
    cacheKey,
    repoList,
    result,
    cachedAt: now
  };

  // 1. Save to L1 RAM Cache immediately
  l1AnalysisMap.set(cacheKey, doc);

  // 2. Write-behind queue to L2 Cloud Firestore
  await cachedAnalysesCol.updateOne({ _id: cacheKey }, { $set: doc });
  const existing = await cachedAnalysesCol.findOne({ _id: cacheKey });
  if (!existing) {
    await cachedAnalysesCol.insertOne(doc);
  }

  console.log(`💾 [AgentMemory L1+L2] Cached skill analysis for ${repoList.length} repos (Key: ${cacheKey}).`);
  return doc;
}
