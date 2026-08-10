import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppConfig, appConfig } from '../config/AppConfig';

describe('AppConfig Module Tests', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

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
      github: { appClientId: 'gh_client_id_99', clientSecret: 'gh_secret_99' },
      telegram: { botToken: 'telegram_token_123' }
    });

    expect(customConfig.getDbConfig()).toEqual({ url: 'sqlite://:memory:', name: 'test_db' });
    expect(customConfig.getAiConfig()).toEqual({ apiKey: 'key_abc' });
    expect(customConfig.getAuthConfig()).toEqual({ keys: ['key1', 'key2'], secret: 'secret123' });
    expect(customConfig.getGithubConfig()).toEqual({ appClientId: 'gh_client_id_99', clientSecret: 'gh_secret_99' });
    expect(customConfig.getTelegramConfig()).toEqual({ botToken: 'telegram_token_123' });
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

  it('should handle malformed JSON in AUTH_KEYS gracefully', () => {
    process.env.AUTH_KEYS = 'invalid-json{{{';
    const config = new AppConfig();
    const authConfig = config.getAuthConfig();
    expect(authConfig.keys).toEqual([]);
  });

  it('should load telegram configuration', () => {
    const customConfig = new AppConfig({
      telegram: { botToken: 'test_telegram_token' }
    });
    const telegramConfig = customConfig.getTelegramConfig();
    expect(telegramConfig.botToken).toBe('test_telegram_token');
  });
});
