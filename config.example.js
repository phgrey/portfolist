/**
 * Application Configuration Template
 * Copy this file to `config.js` (gitignored) for local development or set APP_CONFIG_JS in GitHub Secrets for CI/CD.
 */
module.exports = {
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
  tailscale: {
    authKey: ''
  }
};
