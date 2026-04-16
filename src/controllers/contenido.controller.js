const pool = require('../models/db');

/**
 * GET /api/contenido
 * Query params: categoria, tipo
 */
async function listar(req, res) {
  try {
    const { categoria, tipo } = req.query;
    const conditions = ['activo = TRUE'];
    const values = [];
    let i = 1;

    if (categoria) { conditions.push(`categoria ILIKE $${i++}`); values.push(`%${categoria}%`); }
    if (tipo)      { conditions.push(`tipo = $${i++}`);           values.push(tipo);             }

    const result = await pool.query(
      `SELECT id, titulo, tipo, categoria, resumen, imagen_portada
       FROM contenido_educativo
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error('listar contenido:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/contenido/:id
 */
async function detalle(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM contenido_educativo WHERE id = $1 AND activo = TRUE',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contenido not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('detalle contenido:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listar, detalle };
