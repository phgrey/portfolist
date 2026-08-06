import { MongoFirestoreCollection } from './mongoFirestore';
import { PortfolioEntity, CachedEntityComparison } from '../types';

const entitiesCol = new MongoFirestoreCollection<PortfolioEntity>('portfolio_entities');
const comparisonsCol = new MongoFirestoreCollection<CachedEntityComparison>('cached_comparisons');

// ⚡ L1 Process RAM Caches (<1ms instant hits)
const l1EntitiesMap = new Map<string, PortfolioEntity>();
const l1ComparisonsMap = new Map<string, CachedEntityComparison>();

/**
 * Generate deterministic, commutative comparison key
 */
export function generateComparisonKey(entityAId: string, entityBId: string): string {
  const sorted = [entityAId.trim(), entityBId.trim()].sort();
  return `cmp_${sorted[0]}__vs__${sorted[1]}`;
}

/**
 * Save or update a Portfolio Entity (CV, Position, Repo, Research)
 */
export async function savePortfolioEntity(entity: PortfolioEntity): Promise<PortfolioEntity> {
  const entityId = entity.id;
  const now = new Date().toISOString();
  const updatedEntity: PortfolioEntity = {
    ...entity,
    updatedAt: now
  };

  // 1. Save to L1 RAM Cache
  l1EntitiesMap.set(entityId, updatedEntity);

  // 2. Queue / Write to L2 Cloud Firestore Store
  const existing = await entitiesCol.findOne({ _id: entityId });
  if (existing) {
    await entitiesCol.updateOne({ _id: entityId }, { $set: updatedEntity });
  } else {
    await entitiesCol.insertOne(updatedEntity);
  }

  console.log(`💾 [EntityMemory L1+L2] Saved entity "${entity.title}" (${entity.entityType}) for @${entity.authorUsername}`);
  return updatedEntity;
}

/**
 * Retrieve a Portfolio Entity by ID (L1 RAM -> L2 Firestore)
 */
export async function getPortfolioEntity(entityId: string): Promise<PortfolioEntity | null> {
  const startTime = Date.now();

  // 1. Check L1 RAM Cache (<1ms)
  if (l1EntitiesMap.has(entityId)) {
    console.log(`⚡ [EntityMemory L1 HIT] (${Date.now() - startTime}ms) for entity: ${entityId}`);
    return l1EntitiesMap.get(entityId)!;
  }

  // 2. Check L2 Firestore Store (<10ms)
  const l2Hit = await entitiesCol.findOne({ _id: entityId });
  if (l2Hit) {
    console.log(`🔥 [EntityMemory L2 HIT] (${Date.now() - startTime}ms) for entity: ${entityId}`);
    l1EntitiesMap.set(entityId, l2Hit);
    return l2Hit;
  }

  return null;
}

/**
 * Retrieve all Portfolio Entities for an author
 */
export async function getPortfolioEntitiesByAuthor(authorIdOrUsername: string): Promise<PortfolioEntity[]> {
  const byId = await entitiesCol.find({ authorId: authorIdOrUsername });
  if (byId.length > 0) return byId;
  return await entitiesCol.find({ authorUsername: authorIdOrUsername });
}

/**
 * Retrieve cached entity comparison matrix (L1 RAM -> L2 Firestore)
 */
export async function getCachedComparison(keyOrIdA: string, idB?: string): Promise<CachedEntityComparison | null> {
  const startTime = Date.now();
  const comparisonKey = idB ? generateComparisonKey(keyOrIdA, idB) : keyOrIdA;

  // 1. Check L1 RAM Cache (<1ms)
  if (l1ComparisonsMap.has(comparisonKey)) {
    console.log(`⚡ [EntityMemory L1 Matrix HIT] (${Date.now() - startTime}ms) for key: ${comparisonKey}`);
    return l1ComparisonsMap.get(comparisonKey)!;
  }

  // 2. Check L2 Firestore Store (<10ms)
  const l2Hit = await comparisonsCol.findOne({ _id: comparisonKey }) || await comparisonsCol.findOne({ id: comparisonKey });
  if (l2Hit) {
    console.log(`🔥 [EntityMemory L2 Matrix HIT] (${Date.now() - startTime}ms) for key: ${comparisonKey}`);
    l1ComparisonsMap.set(comparisonKey, l2Hit);
    return l2Hit;
  }

  return null;
}

/**
 * Save cross-entity comparison matrix to L1 RAM & L2 Firestore
 */
export async function saveCachedComparison(doc: CachedEntityComparison): Promise<CachedEntityComparison> {
  const comparisonKey = doc.id;

  // 1. Save to L1 RAM Cache
  l1ComparisonsMap.set(comparisonKey, doc);

  // 2. Queue / Write to L2 Firestore Store
  const existing = await comparisonsCol.findOne({ _id: comparisonKey });
  if (existing) {
    await comparisonsCol.updateOne({ _id: comparisonKey }, { $set: doc });
  } else {
    await comparisonsCol.insertOne(doc);
  }

  console.log(`💾 [EntityMemory L1+L2] Cached comparison matrix between ${doc.entityAId} vs ${doc.entityBId} (Score: ${doc.matchScore}/100)`);
  return doc;
}
