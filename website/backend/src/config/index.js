// CONFIG - every setting of the website backend, read ONCE from the environment (.env).
// Other files never read process.env themselves:  const config = require('../config');

const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';
const isTest = env === 'test';

function list(value, fallback) {
  return (value || fallback)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const config = {
  env,
  isProduction,
  isTest,
  port: Number(process.env.PORT) || 5050,

  // The shared KidBuddy API (fyp/backend). No trailing slash.
  upstream: {
    url: (process.env.KIDBUDDY_API_URL || 'http://127.0.0.1:4000').replace(/\/+$/, ''),
    timeoutMs: Number(process.env.UPSTREAM_TIMEOUT_MS) || 15000,
  },

  allowedOrigins: list(process.env.ALLOWED_ORIGINS, 'http://localhost:5173,http://127.0.0.1:5173'),

  cookies: {
    session: process.env.SESSION_COOKIE_NAME || 'kb_session',
    reset: 'kb_reset', // the short "you may now choose a new password" token
    csrf: 'kb_csrf', // readable by the page, sent back in the X-CSRF-Token header
    sessionDays: Number(process.env.SESSION_DAYS) || 7,
    resetMinutes: 15, // the same lifetime the API gives the reset token
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProduction,
  },

  frontendDist: path.resolve(__dirname, '..', '..', process.env.FRONTEND_DIST || '../frontend/dist'),
  trustProxy: Number(process.env.TRUST_PROXY) || 0,

  // Requests per IP per 15 minutes.
  rateLimits: {
    auth: isTest ? 1000 : 30, // log in, sign up, codes, password reset
    api: isTest ? 10000 : 600, // everything else under /api
  },
};

module.exports = config;
