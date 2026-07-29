require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const compression = require('compression');
const helmet      = require('helmet');

const fuentesRouter   = require('./routes/fuentes');
const estacionesRouter = require('./routes/estaciones');
const reportesRouter  = require('./routes/reportes');
const capasRouter     = require('./routes/capas');
const contenidoRouter = require('./routes/contenido');
const authRouter      = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Trust proxy (Railway/load balancer) ──────────────────────────────────────
// Required for express-rate-limit to read X-Forwarded-For correctly.
app.set('trust proxy', 1);

// ── Security headers (helmet) ───────────────────────────────────────────────
// DEF-012: Adds X-Content-Type-Options, X-Frame-Options, HSTS, etc.
// Hides X-Powered-By header automatically.
app.use(helmet());

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  methods: ['GET', 'POST', 'DELETE'],
}));

// ── Compression (gzip) ──────────────────────────────────────────────────────
app.use(compression());

// ── Body parsing ─────────────────────────────────────────────────────────────
// 10 MB limit — reportes con fotos base64 pueden exceder 100 KB.
app.use(express.json({ limit: '10mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRouter);
app.use('/api/fuentes',   fuentesRouter);
app.use('/api/estaciones', estacionesRouter);
app.use('/api/reportes',  reportesRouter);
app.use('/api/capas',     capasRouter);
app.use('/api/contenido', contenidoRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', project: 'AquaLibre' }));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler ─────────────────────────────────────────────────────────────
// DEF-002: Handle malformed JSON (SyntaxError from express.json) as 400, not 500.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON: malformed request body' });
  }
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`AquaLibre API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
