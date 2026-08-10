/**
 * Application Configuration Template
 * Copy this file to `config.js` (gitignored) for local development or set APP_CONFIG_JS in GitHub Secrets for CI/CD.
 */
module.exports = {
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
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_key_change_me'
  },
  github: {
    appClientId: process.env.GITHUB_APP_CLIENT_ID || process.env.GITHUB_AUTH_CLIENT_ID || ''
  }
};
