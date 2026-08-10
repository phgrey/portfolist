import path from 'path';
import fs from 'fs';

export interface ServerConfig {
  port: number;
  env: string;
}

export interface DbConfig {
  url: string;
  name: string;
}

export interface AiConfig {
  apiKey: string;
}

export interface AuthConfig {
  keys: string[];
  secret: string;
}

export interface GithubConfig {
  appClientId: string;
}

export interface ApplicationConfigSchema {
  server: ServerConfig;
  db: DbConfig;
  ai: AiConfig;
  auth: AuthConfig;
  github: GithubConfig;
  [key: string]: any;
}

/**
 * Singleton Configuration Manager
 * Reads nested configuration from `config.js` (or fallback config) with helper methods
 * for reading nested keys, group views, and field renaming.
 */
export class AppConfig {
  private static instance: AppConfig;
  private rawConfig: Record<string, any> = {};

  constructor(customConfig?: Record<string, any>) {
    if (customConfig) {
      this.rawConfig = customConfig;
    } else {
      this.loadConfiguration();
    }
  }

  public static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  /**
   * Loads config.js from root directory, falling back to config.example.js or process.env
   */
  private loadConfiguration(): void {
    const rootDir = process.cwd();
    const configJsPath = path.join(rootDir, 'config.js');
    const configExampleJsPath = path.join(rootDir, 'config.example.js');

    if (fs.existsSync(configJsPath)) {
      try {
        // Clear require cache to allow dynamic reload in tests/dev if needed
        delete require.cache[require.resolve(configJsPath)];
        this.rawConfig = require(configJsPath);
        return;
      } catch (err: any) {
        console.warn(`⚠️ [AppConfig] Error loading config.js: ${err.message}. Falling back...`);
      }
    }

    if (fs.existsSync(configExampleJsPath)) {
      try {
        delete require.cache[require.resolve(configExampleJsPath)];
        this.rawConfig = require(configExampleJsPath);
        return;
      } catch (err: any) {
        console.warn(`⚠️ [AppConfig] Error loading config.example.js: ${err.message}.`);
      }
    }

    // Default fallback from environment variables
    this.rawConfig = {
      server: {
        port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
        env: process.env.NODE_ENV || 'development'
      },
      db: {
        url: process.env.DB_URL || process.env.DATABASE_URL || 'mongodb://localhost:27017/portfolist',
        name: process.env.DB_NAME || 'portfolist'
      },
      ai: {
        apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
      },
      auth: {
        keys: process.env.AUTH_KEYS ? JSON.parse(process.env.AUTH_KEYS) : [],
        secret: process.env.JWT_SECRET || 'dev_jwt_secret_key'
      },
      github: {
        appClientId: process.env.GITHUB_APP_CLIENT_ID || process.env.GITHUB_AUTH_CLIENT_ID || ''
      }
    };
  }

  /**
   * Retrieve a configuration value by dot-notation path (e.g. 'db.url', 'ai.apiKey').
   */
  public get<T = any>(dotPath: string, defaultValue?: T): T {
    const keys = dotPath.split('.');
    let current: any = this.rawConfig;

    for (const key of keys) {
      if (current === undefined || current === null || typeof current !== 'object') {
        return defaultValue as T;
      }
      current = current[key];
    }

    if (current === undefined || current === null) {
      // Fallback to process.env uppercase version e.g. 'ai.apiKey' -> 'GEMINI_API_KEY'
      const envKey = dotPath.toUpperCase().replace(/\./g, '_');
      if (process.env[envKey] !== undefined) {
        return process.env[envKey] as unknown as T;
      }
      return defaultValue as T;
    }

    return current as T;
  }

  /**
   * Returns a configuration group with optional field renaming.
   */
  public getGroup<R = Record<string, any>>(groupName: string, renameMap?: Record<string, string>): R {
    const rawGroup = this.get<Record<string, any>>(groupName, {});
    if (!renameMap) {
      return { ...rawGroup } as R;
    }

    const renamed: Record<string, any> = {};
    for (const [key, val] of Object.entries(rawGroup)) {
      const targetKey = renameMap[key] || key;
      renamed[targetKey] = val;
    }
    return renamed as R;
  }

  // Typed Group Getters
  public getServerConfig(): ServerConfig {
    return {
      port: this.get<number>('server.port', 3000),
      env: this.get<string>('server.env', 'development')
    };
  }

  public getDbConfig(): DbConfig {
    return {
      url: this.get<string>('db.url', 'mongodb://localhost:27017/portfolist'),
      name: this.get<string>('db.name', 'portfolist')
    };
  }

  public getAiConfig(): AiConfig {
    return {
      apiKey: this.get<string>('ai.apiKey', '')
    };
  }

  public getAuthConfig(): AuthConfig {
    return {
      keys: this.get<string[]>('auth.keys', []),
      secret: this.get<string>('auth.secret', 'dev_jwt_secret_key')
    };
  }

  public getGithubConfig(): GithubConfig {
    return {
      appClientId: this.get<string>('github.appClientId', '')
    };
  }

  /**
   * Returns the entire parsed configuration object.
   */
  public getAll(): Record<string, any> {
    return { ...this.rawConfig };
  }
}

export const appConfig = AppConfig.getInstance();
