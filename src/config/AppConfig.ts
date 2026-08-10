import path from 'path';
import fs from 'fs';

export interface ServerConfig {
  port: number;
  env: string;
  appUrl: string;
}

export interface DbConfig {
  url: string;
  name: string;
}

export interface AiConfig {
  apiKey: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

export interface GithubConfig {
  appClientName: string;
  appClientId: string;
  authClientId: string;
  clientSecret: string;
}

export interface TelegramConfig {
  botToken: string;
}

export interface TailscaleConfig {
  authKey: string;
}

export interface ApplicationConfigSchema {
  server: ServerConfig;
  db: DbConfig;
  ai: AiConfig;
  firebase: FirebaseConfig;
  github: GithubConfig;
  telegram: TelegramConfig;
  tailscale: TailscaleConfig;
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
   * Loads config.js from root directory, falling back to config.example.js
   */
  private loadConfiguration(): void {
    const rootDir = process.cwd();
    const env = process.env.NODE_ENV;
    const envConfigPath = env ? path.join(rootDir, `config.${env}.js`) : null;
    const configJsPath = path.join(rootDir, 'config.js');
    const configExampleJsPath = path.join(rootDir, 'config.example.js');

    if (envConfigPath && fs.existsSync(envConfigPath)) {
      try {
        delete require.cache[require.resolve(envConfigPath)];
        this.rawConfig = require(envConfigPath);
        return;
      } catch (err: any) {
        console.warn(`⚠️ [AppConfig] Error loading ${path.basename(envConfigPath)}: ${err.message}. Falling back...`);
      }
    }

    if (fs.existsSync(configJsPath)) {
      try {
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

    this.rawConfig = {
      server: {
        port: 3000,
        env: 'development',
        appUrl: 'http://localhost:3000/'
      },
      db: {
        url: 'mongodb://localhost:27017/portfolist',
        name: 'portfolist'
      },
      ai: {
        apiKey: ''
      },
      firebase: {
        apiKey: '',
        authDomain: 'portfolist-a3725.firebaseapp.com',
        projectId: 'portfolist-a3725',
        storageBucket: 'portfolist-a3725.firebasestorage.app',
        messagingSenderId: '',
        appId: '',
        measurementId: ''
      },
      github: {
        appClientName: 'portfolist',
        appClientId: '',
        authClientId: '',
        clientSecret: ''
      },
      telegram: {
        botToken: ''
      },
      tailscale: {
        authKey: ''
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
      env: this.get<string>('server.env', 'development'),
      appUrl: this.get<string>('server.appUrl', 'http://localhost:3000/')
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

  public getFirebaseConfig(): FirebaseConfig {
    return {
      apiKey: this.get<string>('firebase.apiKey', ''),
      authDomain: this.get<string>('firebase.authDomain', 'portfolist-a3725.firebaseapp.com'),
      projectId: this.get<string>('firebase.projectId', 'portfolist-a3725'),
      storageBucket: this.get<string>('firebase.storageBucket', 'portfolist-a3725.firebasestorage.app'),
      messagingSenderId: this.get<string>('firebase.messagingSenderId', ''),
      appId: this.get<string>('firebase.appId', ''),
      measurementId: this.get<string>('firebase.measurementId', '')
    };
  }

  public getGithubConfig(): GithubConfig {
    return {
      appClientName: this.get<string>('github.appClientName', 'portfolist'),
      appClientId: this.get<string>('github.appClientId', ''),
      authClientId: this.get<string>('github.authClientId', ''),
      clientSecret: this.get<string>('github.clientSecret', '')
    };
  }

  public getTelegramConfig(): TelegramConfig {
    return {
      botToken: this.get<string>('telegram.botToken', '')
    };
  }

  public getTailscaleConfig(): TailscaleConfig {
    return {
      authKey: this.get<string>('tailscale.authKey', '')
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
