// APP - builds the Express app of the website backend (server.js starts it; tests use it directly).
//
// Every request goes through, top to bottom:
//   security headers (helmet) -> cookies -> JSON body -> rate limit
//   /web-api/...  the gateway's own small endpoints (health, CSRF token, docs)
//   /api/...      CSRF check -> auth routes the gateway handles itself -> proxy to the shared API
//   anything else -> the built website (index.html for every page route), when it exists
//   errors       -> the same { error } JSON shape the shared API uses

const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const upstream = require('./services/upstream');
const { issueCsrfToken, requireCsrf } = require('./middleware/csrf');
const { requireObjectBody } = require('./middleware/validate');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const proxyRoutes = require('./routes/proxyRoutes');
const openApi = require('./docs/openapi');

const app = express();

app.disable('x-powered-by');
if (config.trustProxy) app.set('trust proxy', config.trustProxy);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        mediaSrc: ["'self'", 'blob:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: config.cookies.secure ? [] : null, // only when the site runs on HTTPS
      },
    },
    crossOriginEmbedderPolicy: false,
    strictTransportSecurity: config.cookies.secure ? { maxAge: 31536000, includeSubDomains: true } : false,
  })
);
// Microphone is used by Read Along and the Say page; camera by nothing on the web yet.
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'microphone=(self), camera=(self), geolocation=()');
  next();
});

app.use(cookieParser());
app.use(express.json({ limit: '200kb' }));

const limit = (max) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait a few minutes and try again.' },
  });

// ----- the gateway's own endpoints -----
app.get('/web-api/health', async (req, res) => {
  let api = 'down';
  try {
    const { status } = await upstream.call('GET', '/health');
    api = status === 200 ? 'ok' : 'down';
  } catch (error) {
    api = 'down';
  }
  res.status(api === 'ok' ? 200 : 503).json({ status: api === 'ok' ? 'ok' : 'degraded', gateway: 'ok', api });
});
app.get('/web-api/csrf', issueCsrfToken);
app.get('/web-api/docs', (req, res) => res.json(openApi));

// ----- the API -----
// Strict limit only on the requests that guess or send something (log in, codes, passwords);
// "who am I?" (GET /api/auth/me) runs on every page load and only has the general limit.
const authLimit = limit(config.rateLimits.auth);
app.use('/api/auth', (req, res, next) => (req.method === 'POST' && req.path !== '/logout' ? authLimit(req, res, next) : next()));
app.use('/api', limit(config.rateLimits.api), requireCsrf, requireObjectBody);
app.use('/api/auth', authRoutes);
app.use('/api', proxyRoutes);

// ----- the built website -----
const indexFile = path.join(config.frontendDist, 'index.html');
if (fs.existsSync(indexFile)) {
  app.use(express.static(config.frontendDist, { index: false, maxAge: config.isProduction ? '7d' : 0 }));
  app.get(/^\/(?!api\/|web-api\/).*/, (req, res) => res.sendFile(indexFile));
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
