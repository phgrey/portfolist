import { describe, it, expect } from 'vitest';
import { AppConfig, appConfig } from '../config/AppConfig';

describe('AppConfig Module Tests', () => {
  it('should load singleton instance and retrieve default/env values', () => {
    expect(appConfig).toBeDefined();
    const serverConf = appConfig.getServerConfig();
    expect(serverConf.port).toBeDefined();
    expect(typeof serverConf.port).toBe('number');
  });

  it('should retrieve nested configuration values by dot notation', () => {
    const customConfig = new AppConfig({
      db: {
        url: 'mongodb://test-cluster:27017/custom_db',
        name: 'custom_db'
      },
      ai: {
        apiKey: 'test_gemini_key_12345'
      }
    });

    expect(customConfig.get('db.url')).toBe('mongodb://test-cluster:27017/custom_db');
    expect(customConfig.get('db.name')).toBe('custom_db');
    expect(customConfig.get('ai.apiKey')).toBe('test_gemini_key_12345');
    expect(customConfig.get('non.existent.path', 'fallback')).toBe('fallback');
  });

  it('should support typed group getters', () => {
    const customConfig = new AppConfig({
      db: { url: 'sqlite://:memory:', name: 'test_db' },
      ai: { apiKey: 'key_abc' },
      auth: { keys: ['key1', 'key2'], secret: 'secret123' },
      github: { appClientId: 'gh_client_id_99' }
    });

    expect(customConfig.getDbConfig()).toEqual({ url: 'sqlite://:memory:', name: 'test_db' });
    expect(customConfig.getAiConfig()).toEqual({ apiKey: 'key_abc' });
    expect(customConfig.getAuthConfig()).toEqual({ keys: ['key1', 'key2'], secret: 'secret123' });
    expect(customConfig.getGithubConfig()).toEqual({ appClientId: 'gh_client_id_99' });
  });

  it('should support group field renaming', () => {
    const customConfig = new AppConfig({
      db: {
        url: 'mongodb://localhost:27017/mydb',
        name: 'mydb'
      }
    });

    const renamed = customConfig.getGroup<{ connectionString: string; databaseName: string }>('db', {
      url: 'connectionString',
      name: 'databaseName'
    });

    expect(renamed).toEqual({
      connectionString: 'mongodb://localhost:27017/mydb',
      databaseName: 'mydb'
    });
  });
});
