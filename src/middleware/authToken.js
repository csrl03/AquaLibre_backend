const crypto = require('crypto');
const pool = require('../models/db');

/**
 * Middleware: authToken
 *
 * Verifies the X-Client-Token header against the stored token hash for the
 * cliente_id provided in the query string. If the token is valid, attaches
 * req.verifiedClientId = cliente_id so controllers can trust it.
 *
 * Required headers:
 *   X-Client-Token: <token>
 *
 * Required query param:
 *   cliente_id: <cliente_id>
 *
 * Responses:
 *   401 — missing token or cliente_id
 *   403 — token does not match cliente_id
 */
async function authToken(req, res, next) {
  try {
    const token = req.headers['x-client-token'];
    const clienteId = req.query.cliente_id;

    if (!token || !clienteId) {
      return res.status(401).json({ error: 'Authentication required: provide X-Client-Token header and cliente_id query param' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await pool.query(
      'SELECT cliente_id FROM cliente_auth WHERE cliente_id = $1 AND token_hash = $2',
      [clienteId, tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.verifiedClientId = clienteId;
    next();
  } catch (err) {
    console.error('authToken:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { authToken };