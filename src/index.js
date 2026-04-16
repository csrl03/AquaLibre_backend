require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const compression = require('compression');

const fuentesRouter   = require('./routes/fuentes');
const reportesRouter  = require('./routes/reportes');
const capasRouter     = require('./routes/capas');
const contenidoRouter = require('./routes/contenido');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  methods: ['GET', 'POST'],
}));

// ── Compression (gzip) ──────────────────────────────────────────────────────
app.use(compression());

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/fuentes',   fuentesRouter);
app.use('/api/reportes',  reportesRouter);
app.use('/api/capas',     capasRouter);
app.use('/api/contenido', contenidoRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', project: 'AquaLibre' }));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler ─────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`AquaLibre API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
