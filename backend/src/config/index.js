// CONFIG - every setting of the backend, read ONCE from the .env file.
//
// Other files never read process.env themselves. They do:
//   const config = require('../config');
//   config.db.name   // 'kidbuddy'

require('dotenv').config({ quiet: true });

const isTest = process.env.NODE_ENV === 'test';

// Stops the server with a clear message when an important setting is missing.
function requireSetting(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing setting ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

const mainDatabase = process.env.DB_NAME || 'kidbuddy';
const testDatabase = process.env.TEST_DB_NAME || 'kidbuddy_test';

// SAFETY: the tests delete and rebuild their database, so they must NEVER point at the real one.
if (isTest && (testDatabase === mainDatabase || !/^[a-z0-9_]+_test$/.test(testDatabase))) {
  throw new Error(`TEST_DB_NAME must end with "_test" and be different from DB_NAME (got "${testDatabase}").`);
}

const config = {
  isTest,
  port: Number(process.env.PORT) || 4000,

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: isTest ? testDatabase : mainDatabase,
  },

  jwt: {
    secret: isTest ? process.env.JWT_SECRET || 'test-only-secret-key-that-is-long-enough' : requireSetting('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    resetExpiresIn: '15m', // the short "you may now choose a new password" token
  },

  email: {
    // 'test' keeps emails in memory so the tests can read the codes.
    mode: isTest ? 'test' : process.env.EMAIL_MODE || 'console',
    from: process.env.EMAIL_FROM || 'KidBuddy <no-reply@kidbuddy.local>',
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },

  // bcrypt "cost": higher = slower = harder to crack. Tests use a low value so they run fast.
  bcryptRounds: isTest ? 4 : 10,

  codes: {
    lifetimeMinutes: 10, // a 6-digit code works for 10 minutes
    maxAttempts: 5, // wrong tries before the code stops working
    resendWaitSeconds: 60, // a new code can be asked for once a minute
  },

  pin: {
    maxAttempts: 5, // wrong PINs in a row before a lock
    lockMinutes: 5,
  },
};

if (!isTest && config.jwt.secret.length < 32) {
  throw new Error('JWT_SECRET is too short. Use at least 32 random characters.');
}
if (config.email.mode === 'smtp' && !config.email.smtp.host) {
  throw new Error('EMAIL_MODE is "smtp" but SMTP_HOST is empty.');
}

module.exports = config;
