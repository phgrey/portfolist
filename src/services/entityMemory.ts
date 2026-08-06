import { PortfolioEntity, CachedEntityComparison } from '../types';
import { getForkedEm } from './mikroDb';
import { portfolioMemorySchema } from '../entities/PortfolioMemoryEntity';
import { comparisonMatrixSchema } from '../entities/ComparisonMatrixEntity';

/**
 * Generate deterministic, commutative comparison key
 */
export function generateComparisonKey(entityAId: string, entityBId: string): string {
  const sorted = [entityAId.trim(), entityBId.trim()].sort();
  return `cmp_${sorted[0]}__vs__${sorted[1]}`;
}

/**
 * Save or update a Portfolio Entity directly in MikroORM DB
 */
export async function savePortfolioEntity(entity: PortfolioEntity): Promise<PortfolioEntity> {
  const entityId = entity.id;
  const now = new Date().toISOString();
  const updatedEntity: PortfolioEntity = {
    ...entity,
    updatedAt: now
  };

  try {
    const em = getForkedEm();
    const existing = await em.findOne(portfolioMemorySchema, { _id: entityId });
    if (existing) {
      em.assign(existing, updatedEntity as any);
    } else {
      const ent = em.create(portfolioMemorySchema, { ...updatedEntity, _id: entityId } as any);
      em.persist(ent);
    }
    await em.flush();
  } catch (err) {
    console.warn(`ℹ️ [EntityMemory] MikroORM persist notice for ${entityId}:`, err);
  }

  console.log(`💾 [EntityMemory MikroORM] Saved entity "${entity.title}" (${entity.entityType}) for @${entity.authorUsername}`);
  return updatedEntity;
}

/**
 * Retrieve a Portfolio Entity directly from MikroORM DB
 */
export async function getPortfolioEntity(entityId: string): Promise<PortfolioEntity | null> {
  try {
    const em = getForkedEm();
    const hit = await em.findOne(portfolioMemorySchema, { _id: entityId });
    if (hit) {
      return hit as any;
    }
  } catch (err) {}

  return null;
}

/**
 * Retrieve all Portfolio Entities for an author directly from MikroORM DB
 */
export async function getPortfolioEntitiesByAuthor(authorIdOrUsername: string): Promise<PortfolioEntity[]> {
  try {
    const em = getForkedEm();
    const byId = await em.find(portfolioMemorySchema, { authorId: authorIdOrUsername });
    if (byId.length > 0) return byId as any[];
    const byUser = await em.find(portfolioMemorySchema, { authorUsername: authorIdOrUsername });
    return byUser as any[];
  } catch (err) {
    return [];
  }
}

/**
 * Retrieve cached entity comparison matrix directly from MikroORM DB
 */
export async function getCachedComparison(keyOrIdA: string, idB?: string): Promise<CachedEntityComparison | null> {
  const comparisonKey = idB ? generateComparisonKey(keyOrIdA, idB) : keyOrIdA;

  try {
    const em = getForkedEm();
    const hit = await em.findOne(comparisonMatrixSchema, { _id: comparisonKey });
    if (hit) {
      return hit as any;
    }
  } catch (err) {}

  return null;
}

/**
 * Save cross-entity comparison matrix directly to MikroORM DB
 */
export async function saveCachedComparison(doc: CachedEntityComparison): Promise<CachedEntityComparison> {
  const comparisonKey = doc.id;

  try {
    const em = getForkedEm();
    const existing = await em.findOne(comparisonMatrixSchema, { _id: comparisonKey });
    if (existing) {
      em.assign(existing, doc as any);
    } else {
      const ent = em.create(comparisonMatrixSchema, { ...doc, _id: comparisonKey } as any);
      em.persist(ent);
    }
    await em.flush();
  } catch (err) {
    console.warn(`ℹ️ [EntityMemory] MikroORM persist notice for matrix ${comparisonKey}:`, err);
  }

  console.log(`💾 [EntityMemory MikroORM] Saved comparison matrix between ${doc.entityAId} vs ${doc.entityBId} (Score: ${doc.matchScore}/100)`);
  return doc;
}
