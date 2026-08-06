import { MigrationFile } from '../migrate';

export const initialSchemaMigration001: MigrationFile = {
  id: '001_initial_schema',
  name: 'Initialize core Firestore collections (authors, portfolio_entities, cached_analyses, cached_comparisons, author_project_sets)',
  up: async (db: any) => {
    console.log('  -> Creating initial collection schemas and seed indexes...');
    
    // Seed system metadata document
    await db.collection('system_metadata').doc('schema_info').set({
      version: 1,
      initializedAt: new Date().toISOString(),
      activeCollections: ['authors', 'portfolio_entities', 'cached_analyses', 'cached_comparisons', 'author_project_sets']
    }, { merge: true });
  },
  down: async (db: any) => {
    console.log('  -> Rolling back 001_initial_schema...');
    await db.collection('system_metadata').doc('schema_info').delete();
  }
};
