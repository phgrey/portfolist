import dotenv from 'dotenv';
dotenv.config();

import { getFirestoreDb } from '../services/firestoreSync';
import { initialSchemaMigration001 } from './migrations/001_initial_schema';
import { addIntegrationsIndexesMigration002 } from './migrations/002_add_integrations_indexes';

export interface MigrationFile {
  id: string;
  name: string;
  up: (db: any) => Promise<void>;
  down?: (db: any) => Promise<void>;
}

export const MIGRATIONS_REGISTRY: MigrationFile[] = [
  initialSchemaMigration001,
  addIntegrationsIndexesMigration002
];

/**
 * Migration Engine for Cloud Firestore & MongoFirestore Collections
 */
export async function runDatabaseMigrations(options: { rollback?: boolean; statusOnly?: boolean } = {}) {
  const { rollback, statusOnly } = options;
  console.log('🔄 [DB Migration Engine] Starting database schema migration check...\n');

  const firestore = getFirestoreDb();
  if (!firestore) {
    console.log('ℹ️ [DB Migration Engine] Firestore offline mode. Schema migrations deferred.');
    return;
  }

  const migrationsColl = firestore.collection('schema_migrations');

  // 1. Fetch executed migrations from schema_migrations collection
  const executedIds = new Set<string>();
  try {
    const executedSnap = await migrationsColl.get();
    executedSnap.forEach(doc => executedIds.add(doc.id));
  } catch (err: any) {
    console.warn(`ℹ️ [DB Migration Engine] Firestore database instance not created on GCP yet: ${err.message || String(err)}`);
    console.log('ℹ️ [DB Migration Engine] Operating in 2-tier memory mode. Deferred online migrations.');
    return;
  }

  console.log(`📋 [DB Migration Engine] Applied migrations (${executedIds.size}):`, Array.from(executedIds).join(', ') || 'None');

  if (statusOnly) {
    console.log('\n--- Migration Status Summary ---');
    MIGRATIONS_REGISTRY.forEach(m => {
      const isApplied = executedIds.has(m.id);
      console.log(`• [${isApplied ? 'APPLIED' : 'PENDING'}] ${m.id}: ${m.name}`);
    });
    return;
  }

  if (rollback) {
    console.log('⏪ [DB Migration Engine] Rollback mode initiated...');
    const lastExecuted = MIGRATIONS_REGISTRY.slice().reverse().find(m => executedIds.has(m.id));
    if (lastExecuted && lastExecuted.down) {
      console.log(`⏳ Rolling back migration: ${lastExecuted.id} (${lastExecuted.name})...`);
      await lastExecuted.down(firestore);
      await migrationsColl.doc(lastExecuted.id).delete();
      console.log(`✅ Rolled back migration ${lastExecuted.id}`);
    } else {
      console.log('ℹ️ No applied migrations available for rollback.');
    }
    return;
  }

  // 2. Sequentially apply pending migrations
  let appliedCount = 0;
  for (const migration of MIGRATIONS_REGISTRY) {
    if (!executedIds.has(migration.id)) {
      console.log(`⏳ [DB Migration Engine] Applying migration ${migration.id}: ${migration.name}...`);
      await migration.up(firestore);
      await migrationsColl.doc(migration.id).set({
        id: migration.id,
        name: migration.name,
        appliedAt: new Date().toISOString()
      });
      console.log(`✅ [DB Migration Engine] Successfully applied ${migration.id}`);
      appliedCount++;
    }
  }

  if (appliedCount === 0) {
    console.log('🎉 [DB Migration Engine] All database migrations are up to date!');
  } else {
    console.log(`🎉 [DB Migration Engine] Successfully applied ${appliedCount} new migration(s)!`);
  }
}

// CLI runner check
if (process.argv[1]?.includes('migrate.ts')) {
  const isStatus = process.argv.includes('--status');
  const isRollback = process.argv.includes('--rollback');
  runDatabaseMigrations({ statusOnly: isStatus, rollback: isRollback }).catch(err => {
    console.error('❌ Migration Engine Error:', err);
    process.exit(1);
  });
}
