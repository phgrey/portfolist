import { AuthorProjectSet, CachedAnalysis } from '../types';
import { getForkedEm } from './mikroDb';
import { authorProjectSetSchema } from '../entities/AuthorProjectSetEntity';
import { cachedAnalysisSchema } from '../entities/CachedAnalysisEntity';

/**
 * Generate deterministic cache key for a set of repositories
 */
export function generateCacheKey(repoList: string[]): string {
  const sorted = [...repoList].map(r => r.trim().toLowerCase()).sort();
  return `analysis_${sorted.join('__')}`;
}

/**
 * Save or update an Author Project Set directly in MikroORM DB
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

  const projectSet: AuthorProjectSet = {
    id: setId,
    authorId,
    authorUsername,
    setName,
    repoList: Array.from(new Set(repoList)),
    isPublic,
    createdAt: now,
    updatedAt: now
  };

  try {
    const em = getForkedEm();
    const existing = await em.findOne(authorProjectSetSchema, { _id: setId });
    if (existing) {
      em.assign(existing, projectSet as any);
    } else {
      const ent = em.create(authorProjectSetSchema, { ...projectSet, _id: setId } as any);
      em.persist(ent);
    }
    await em.flush();
  } catch (err) {
    console.warn(`ℹ️ [AgentMemory] MikroORM persist notice for project set ${setName}:`, err);
  }

  console.log(`💾 [AgentMemory MikroORM] Saved project set "${setName}" for author "${authorUsername}" (${repoList.length} repos, isPublic=${isPublic}).`);
  return projectSet;
}

/**
 * Retrieve Project Sets for an author directly from MikroORM DB
 */
export async function getProjectSets(authorIdOrUsername: string): Promise<AuthorProjectSet[]> {
  try {
    const em = getForkedEm();
    const byId = await em.find(authorProjectSetSchema, { authorId: authorIdOrUsername });
    if (byId.length > 0) return byId as any[];
    const byUser = await em.find(authorProjectSetSchema, { authorUsername: authorIdOrUsername });
    return byUser as any[];
  } catch (err) {
    return [];
  }
}

/**
 * Retrieve Project Set by author and set name directly from MikroORM DB
 */
export async function getProjectSetByName(
  authorIdOrUsername: string,
  setName: string
): Promise<AuthorProjectSet | null> {
  try {
    const em = getForkedEm();
    const sets = await getProjectSets(authorIdOrUsername);
    const found = sets.find(s => s.setName.toLowerCase() === setName.toLowerCase());
    if (found) return found;

    const hit = await em.findOne(authorProjectSetSchema, {
      $or: [
        { authorUsername: authorIdOrUsername, setName },
        { authorId: authorIdOrUsername, setName }
      ]
    });
    if (hit) return hit as any;
  } catch (err) {}

  return null;
}

/**
 * Retrieve cached skill analysis directly from MikroORM DB
 */
export async function getCachedAnalysis(cacheKey: string): Promise<CachedAnalysis | null> {
  const startTime = Date.now();

  try {
    const em = getForkedEm();
    const hit = await em.findOne(cachedAnalysisSchema, {
      $or: [{ _id: cacheKey }, { cacheKey }]
    });

    if (hit) {
      console.log(`⚡ [AgentMemory MikroORM HIT] (${Date.now() - startTime}ms) for key: ${cacheKey}`);
      return hit as any;
    }
  } catch (err) {}

  console.log(`🔍 [AgentMemory MikroORM MISS] (${Date.now() - startTime}ms) for key: ${cacheKey}`);
  return null;
}

/**
 * Save analysis result into MikroORM DB
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

  try {
    const em = getForkedEm();
    const existing = await em.findOne(cachedAnalysisSchema, { _id: cacheKey });
    if (existing) {
      em.assign(existing, doc as any);
    } else {
      const ent = em.create(cachedAnalysisSchema, { ...doc, _id: cacheKey } as any);
      em.persist(ent);
    }
    await em.flush();
  } catch (err) {
    console.warn(`ℹ️ [AgentMemory] MikroORM persist notice for analysis ${cacheKey}:`, err);
  }

  console.log(`💾 [AgentMemory MikroORM] Saved skill analysis for ${repoList.length} repos (Key: ${cacheKey}).`);
  return doc;
}
