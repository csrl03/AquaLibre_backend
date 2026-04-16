const pool = require('../models/db');

/**
 * GET /api/capas/:nombre
 * nombre: municipio | drenajes_dobles | drenajes_sencillos | veredas
 */
async function obtenerCapa(req, res) {
  try {
    const { nombre } = req.params;
    const ALLOWED = ['municipio', 'drenajes_dobles', 'drenajes_sencillos', 'veredas'];
    if (!ALLOWED.includes(nombre)) {
      return res.status(400).json({ error: `Capa "${nombre}" not available. Use: ${ALLOWED.join(', ')}` });
    }

    const result = await pool.query(
      'SELECT geojson, metadata FROM capas_geo WHERE nombre_capa = $1',
      [nombre]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Capa not found in database' });
    }

    // geojson column is already JSONB — send directly
    res.json(result.rows[0].geojson);
  } catch (err) {
    console.error('obtener capa:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { obtenerCapa };
