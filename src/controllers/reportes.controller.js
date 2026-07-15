const pool = require('../models/db');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/reportes
 * Body: { fuente_id, nombre_usuario, actividades, campos_extra? }
 */
async function crear(req, res) {
  try {
    const { fuente_id, nombre_usuario, actividades, cantidad_agua, unidad_agua, campos_extra } = req.body;
    const actividadesNormalizadas = [...new Set(
      actividades.map((actividad) => actividad.trim()).filter(Boolean)
    )];

    if (actividadesNormalizadas.length === 0) {
      return res.status(400).json({ error: 'At least one activity is required' });
    }

    const actividad = actividadesNormalizadas.join(', ');

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO reportes_uso (id, fuente_id, nombre_usuario, actividad, actividades, cantidad_agua, unidad_agua, campos_extra)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, fuente_id, nombre_usuario, actividad, actividades, cantidad_agua, unidad_agua, created_at`,
      [
        id,
        fuente_id,
        nombre_usuario ? nombre_usuario.trim().slice(0, 255) : null,
        actividad,
        JSON.stringify(actividadesNormalizadas),
        cantidad_agua ?? null,
        unidad_agua || 'L/s',
        campos_extra ? JSON.stringify(campos_extra) : null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('crear reporte:', err.message);
    if (err.code === '23503') {
      return res.status(400).json({ error: 'fuente_id does not exist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { crear };
