const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const pool = require('../models/db');

/**
 * POST /api/auth/register
 *
 * Registers a new anonymous client. Returns a cliente_id and a token.
 * The token must be sent in the X-Client-Token header for all
 * /api/reportes operations (GET, DELETE).
 *
 * Body (optional):
 *   cliente_id — if provided, registers that cliente_id (for migration of
 *   existing local IDs). If omitted, server generates a UUID.
 *
 * Response:
 *   201 { cliente_id, token }
 *   409 if cliente_id already registered
 */
async function register(req, res) {
  try {
    const requestedClientId = req.body && req.body.cliente_id;
    const clienteId = requestedClientId || uuidv4();
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Check if already registered
    const existing = await pool.query(
      'SELECT cliente_id FROM cliente_auth WHERE cliente_id = $1',
      [clienteId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'cliente_id already registered' });
    }

    await pool.query(
      'INSERT INTO cliente_auth (cliente_id, token_hash) VALUES ($1, $2)',
      [clienteId, tokenHash]
    );

    res.status(201).json({ cliente_id: clienteId, token });
  } catch (err) {
    console.error('auth register:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { register };