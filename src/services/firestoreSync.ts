import dotenv from 'dotenv';
dotenv.config();

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore, WriteBatch } from 'firebase-admin/firestore';

interface PendingWrite {
  collection: string;
  docId: string;
  data: any;
  timestamp: number;
}

let dbInstance: Firestore | null = null;
const pendingWriteQueue: Map<string, PendingWrite> = new Map();
let isSyncActive = false;

/**
 * Access db_url from environment variables
 */
export function getDbUrl(): string | undefined {
  return process.env?.DB_URL;
}

/**
 * Safe Firestore initialization helper
 */
export function getFirestoreDb(): Firestore | null {
  if (dbInstance) return dbInstance;

  try {
    if (getApps().length === 0) {
      const dbUrl = getDbUrl();
      const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

      if (dbUrl) {
        console.log(`⚡ [Firestore Sync] Initializing with db_url (${dbUrl.substring(0, 25)}...)...`);
      }

      if (serviceAccountPath) {
        initializeApp({
          credential: cert(serviceAccountPath),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      } else {
        // Initialize default application credentials or fallback project
        initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'portfolist-a3725'
        });
      }
    }
    dbInstance = getFirestore();
    console.log('🔥 [Firestore Sync] Connected to Cloud Firestore successfully.');
    return dbInstance;
  } catch (err: any) {
    console.warn(`⚠️ [Firestore Sync] Offline / Fallback mode active: ${err.message || String(err)}`);
    return null;
  }
}

/**
 * 1. Startup Cache Warmup & Seed Population
 */
export async function warmupCacheFromFirestore(dbCache: any): Promise<void> {
  const firestore = getFirestoreDb();
  if (!firestore) {
    console.log('ℹ️ [Firestore Sync] Skipping cache warmup (operating in pure in-memory mode).');
    return;
  }

  try {
    console.log('⏳ [Firestore Sync] Warming up in-memory cache from Cloud Firestore...');

    // Warmup Authors
    const authorsSnap = await firestore.collection('authors').get();
    if (!authorsSnap.empty) {
      const authorsList: any[] = [];
      authorsSnap.forEach(doc => authorsList.push(doc.data()));
      dbCache.authors = authorsList;
      console.log(`✅ Loaded ${authorsList.length} authors from Firestore.`);
    } else {
      console.log('🌱 [Firestore Sync] Populating initial seed authors to Firestore...');
      dbCache.authors.forEach((author: any) => {
        queueDocumentWrite('authors', author.id, author);
      });
    }

    // Warmup Referral Tokens
    const tokensSnap = await firestore.collection('referralTokens').get();
    if (!tokensSnap.empty) {
      const tokensList: any[] = [];
      tokensSnap.forEach(doc => tokensList.push(doc.data()));
      dbCache.referralTokens = tokensList;
      console.log(`✅ Loaded ${tokensList.length} referral tokens from Firestore.`);
    } else {
      dbCache.referralTokens.forEach((token: any) => {
        queueDocumentWrite('referralTokens', token.id, token);
      });
    }

    // Warmup Teams
    const teamsSnap = await firestore.collection('teams').get();
    if (!teamsSnap.empty) {
      const teamsList: any[] = [];
      teamsSnap.forEach(doc => teamsList.push(doc.data()));
      dbCache.teams = teamsList;
      console.log(`✅ Loaded ${teamsList.length} teams from Firestore.`);
    } else {
      dbCache.teams.forEach((team: any) => {
        queueDocumentWrite('teams', team.id, team);
      });
    }

    // Warmup Portfolio Items
    const itemsSnap = await firestore.collection('portfolioItems').get();
    if (!itemsSnap.empty) {
      const itemsList: any[] = [];
      itemsSnap.forEach(doc => itemsList.push(doc.data()));
      dbCache.portfolioItems = itemsList;
      console.log(`✅ Loaded ${itemsList.length} portfolio items from Firestore.`);
    } else {
      dbCache.portfolioItems.forEach((item: any) => {
        queueDocumentWrite('portfolioItems', item.id, item);
      });
    }

    // Immediate flush for seed writes if any were queued
    await flushPendingWritesToFirestore();
  } catch (err: any) {
    console.warn(`⚠️ [Firestore Sync] Warmup notice: ${err.message || String(err)}`);
  }
}

/**
 * 2. Record modified document in dirty queue for write-behind batching
 */
export function queueDocumentWrite(collection: string, docId: string, data: any): void {
  const key = `${collection}:${docId}`;
  pendingWriteQueue.set(key, {
    collection,
    docId,
    data: {
      ...data,
      updatedAt: new Date().toISOString()
    },
    timestamp: Date.now()
  });
}

/**
 * 3. Flush pending writes to Firestore using db.batch()
 */
export async function flushPendingWritesToFirestore(): Promise<number> {
  if (pendingWriteQueue.size === 0) return 0;
  const firestore = getFirestoreDb();
  if (!firestore) return 0;

  const entriesToFlush = Array.from(pendingWriteQueue.entries());
  pendingWriteQueue.clear();

  console.log(`⏳ [Firestore Sync] Flushing ${entriesToFlush.length} batched write(s) to Cloud Firestore...`);

  // Process in batches of 450 (Firestore limit is 500 ops per batch)
  const chunkSize = 450;
  let totalCommitted = 0;

  for (let i = 0; i < entriesToFlush.length; i += chunkSize) {
    const chunk = entriesToFlush.slice(i, i + chunkSize);
    const batch: WriteBatch = firestore.batch();

    chunk.forEach(([_, item]) => {
      const docRef = firestore.collection(item.collection).doc(item.docId);
      batch.set(docRef, item.data, { merge: true });
    });

    try {
      await batch.commit();
      totalCommitted += chunk.length;
    } catch (err: any) {
      if (String(err).includes('5 NOT_FOUND') || String(err).includes('NOT_FOUND')) {
        console.warn(`ℹ️ [Firestore Sync] Cloud Firestore database instance not created yet on GCP. Operating in 2-tier L1 RAM cache mode.`);
      } else {
        console.error(`❌ [Firestore Sync] Failed to commit batch: ${err.message || String(err)}`);
      }
      // Re-queue failed items
      chunk.forEach(([key, item]) => pendingWriteQueue.set(key, item));
    }
  }

  if (totalCommitted > 0) {
    console.log(`✅ [Firestore Sync] Successfully committed ${totalCommitted} write(s) to Cloud Firestore.`);
  }

  return totalCommitted;
}

/**
 * 4. Start periodic background sync worker
 */
export function startPeriodicSync(intervalMs: number = 10000): void {
  if (isSyncActive) return;
  isSyncActive = true;

  console.log(`⏰ [Firestore Sync] Background sync worker started (flushing every ${intervalMs / 1000}s).`);

  setInterval(async () => {
    try {
      await flushPendingWritesToFirestore();
    } catch (err: any) {
      console.warn(`⚠️ [Firestore Sync] Background flush warning: ${err.message || String(err)}`);
    }
  }, intervalMs);
}
