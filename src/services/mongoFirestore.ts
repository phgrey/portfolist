import { Firestore, DocumentData } from 'firebase-admin/firestore';
import { getFirestoreDb, queueDocumentWrite, flushPendingWritesToFirestore } from './firestoreSync';

export interface MongoQueryOptions {
  limit?: number;
  skip?: number;
  sort?: Record<string, 'asc' | 'desc' | 1 | -1>;
}

export interface MongoUpdateOperator<T = any> {
  $set?: Partial<T>;
  $inc?: Record<string, number>;
  $push?: Record<string, any>;
}

/**
 * MongoDB-Compatible Collection Wrapper for Cloud Firestore
 */
export class MongoFirestoreCollection<T extends { _id?: string; id?: string }> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  private getFirestore(): Firestore | null {
    return getFirestoreDb();
  }

  /**
   * Helper to normalize document fields (_id <-> id)
   */
  private normalizeDoc(docId: string, data: DocumentData): T {
    return {
      _id: docId,
      id: docId,
      ...data
    } as unknown as T;
  }

  /**
   * Find a single document by MongoDB filter (e.g. { _id: "usr_alex" } or { username: "alex_chen" })
   */
  async findOne(filter: Record<string, any>): Promise<T | null> {
    const firestore = this.getFirestore();
    const docId = filter._id || filter.id;

    // Fast path: Query by Document ID directly
    if (docId && typeof docId === 'string') {
      if (firestore) {
        try {
          const docSnap = await firestore.collection(this.collectionName).doc(docId).get();
          if (docSnap.exists) {
            return this.normalizeDoc(docSnap.id, docSnap.data()!);
          }
        } catch (e: any) {
          console.warn(`⚠️ [MongoFirestore] findOne doc error: ${e.message || String(e)}`);
        }
      }
      return null;
    }

    // Secondary path: Query by document fields
    const results = await this.find(filter, { limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Find multiple documents matching filter & options
   */
  async find(filter: Record<string, any> = {}, options: MongoQueryOptions = {}): Promise<T[]> {
    const firestore = this.getFirestore();
    if (!firestore) return [];

    try {
      let query: any = firestore.collection(this.collectionName);

      // Apply equality filters
      Object.entries(filter).forEach(([key, val]) => {
        if (key !== '_id' && key !== 'id' && val !== undefined) {
          query = query.where(key, '==', val);
        }
      });

      // Apply sorting
      if (options.sort) {
        Object.entries(options.sort).forEach(([sortField, dir]) => {
          const direction = (dir === -1 || dir === 'desc') ? 'desc' : 'asc';
          query = query.orderBy(sortField, direction);
        });
      }

      // Apply limit
      if (options.limit && options.limit > 0) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      const docs: T[] = [];
      snapshot.forEach((doc: any) => {
        docs.push(this.normalizeDoc(doc.id, doc.data()));
      });

      return docs;
    } catch (err: any) {
      console.warn(`⚠️ [MongoFirestore] find error in collection ${this.collectionName}: ${err.message || String(err)}`);
      return [];
    }
  }

  /**
   * Insert a single document into MongoDB collection
   */
  async insertOne(doc: T): Promise<{ insertedId: string; acknowledged: boolean }> {
    const docId = doc._id || doc.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const payload = { ...doc, _id: docId, id: docId };

    // Queue for write-behind batching
    queueDocumentWrite(this.collectionName, docId, payload);

    return { insertedId: docId, acknowledged: true };
  }

  /**
   * Insert multiple documents
   */
  async insertMany(docs: T[]): Promise<{ insertedCount: number; insertedIds: Record<number, string> }> {
    const insertedIds: Record<number, string> = {};
    for (let i = 0; i < docs.length; i++) {
      const res = await this.insertOne(docs[i]);
      insertedIds[i] = res.insertedId;
    }
    return { insertedCount: docs.length, insertedIds };
  }

  /**
   * Update a document matching filter using MongoDB update operators ($set, $inc)
   */
  async updateOne(filter: Record<string, any>, update: MongoUpdateOperator<T> | Partial<T>): Promise<{ modifiedCount: number }> {
    const existing = await this.findOne(filter);
    if (!existing) return { modifiedCount: 0 };

    const docId = existing._id || existing.id!;
    let updatedPayload: Record<string, any> = { ...existing };

    if ('$set' in update && update.$set) {
      updatedPayload = { ...updatedPayload, ...update.$set };
    } else {
      updatedPayload = { ...updatedPayload, ...update };
    }

    queueDocumentWrite(this.collectionName, docId, updatedPayload);
    return { modifiedCount: 1 };
  }

  /**
   * Delete a document matching filter
   */
  async deleteOne(filter: Record<string, any>): Promise<{ deletedCount: number }> {
    const existing = await this.findOne(filter);
    if (!existing) return { deletedCount: 0 };

    const docId = existing._id || existing.id!;
    const firestore = this.getFirestore();

    if (firestore) {
      try {
        await firestore.collection(this.collectionName).doc(docId).delete();
        return { deletedCount: 1 };
      } catch (err: any) {
        console.error(`❌ [MongoFirestore] Delete error: ${err.message || String(err)}`);
      }
    }
    return { deletedCount: 0 };
  }

  /**
   * Count documents matching filter
   */
  async countDocuments(filter: Record<string, any> = {}): Promise<number> {
    const docs = await this.find(filter);
    return docs.length;
  }
}

/**
 * MongoFirestore DB Client
 */
export class MongoFirestoreDb {
  collection<T extends { _id?: string; id?: string }>(collectionName: string): MongoFirestoreCollection<T> {
    return new MongoFirestoreCollection<T>(collectionName);
  }

  async flush(): Promise<number> {
    return await flushPendingWritesToFirestore();
  }
}

export const mongoDb = new MongoFirestoreDb();
