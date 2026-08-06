import { MigrationFile } from '../migrate';

export const addIntegrationsIndexesMigration002: MigrationFile = {
  id: '002_add_integrations_indexes',
  name: 'Configure multi-provider integrations metadata index structure',
  up: async (db: any) => {
    console.log('  -> Setting up multi-provider integration metadata indexes...');
    await db.collection('system_metadata').doc('integrations_config').set({
      supportedProviders: ['github', 'google', 'linkedin', 'youtube', 'reddit', 'flickr', 'twitter', 'metamask', 'apple', 'microsoft', 'discord'],
      updatedAt: new Date().toISOString()
    }, { merge: true });
  },
  down: async (db: any) => {
    console.log('  -> Rolling back 002_add_integrations_indexes...');
    await db.collection('system_metadata').doc('integrations_config').delete();
  }
};
