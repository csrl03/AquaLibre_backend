const pool = require('../models/db');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/reportes
 * Body: { fuente_id, nombre_usuario, actividades, campos_extra? }
 */
async function crear(req, res) {
  try {
    const {
      fuente_id,
      nombre_usuario,
      actividades,
      cantidad_agua,
      unidad_agua,
      campos_extra,
      cliente_id,
      cliente_reporte_id,
    } = req.body;
    const actividadesNormalizadas = [...new Set(
      actividades.map((actividad) => actividad.trim()).filter(Boolean)
    )];

    if (actividadesNormalizadas.length === 0) {
      return res.status(400).json({ error: 'At least one activity is required' });
    }

    const actividad = actividadesNormalizadas.join(', ');

    if ((cliente_id && !cliente_reporte_id) || (!cliente_id && cliente_reporte_id)) {
      return res.status(400).json({ error: 'cliente_id and cliente_reporte_id must be provided together' });
    }

    if (cliente_id && cliente_reporte_id) {
      const existing = await pool.query(
        `SELECT id, fuente_id, nombre_usuario, actividad, actividades, cantidad_agua,
                unidad_agua, campos_extra, created_at
         FROM reportes_uso
         WHERE cliente_id = $1 AND cliente_reporte_id = $2`,
        [cliente_id, cliente_reporte_id]
      );
      if (existing.rows.length > 0) {
        return res.status(200).json(existing.rows[0]);
      }
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO reportes_uso (id, fuente_id, nombre_usuario, actividad, actividades,
                                cliente_id, cliente_reporte_id, cantidad_agua, unidad_agua, campos_extra)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, fuente_id, nombre_usuario, actividad, actividades, cliente_id,
                 cliente_reporte_id, cantidad_agua, unidad_agua, campos_extra, created_at`,
      [
        id,
        fuente_id,
        nombre_usuario ? nombre_usuario.trim().slice(0, 255) : null,
        actividad,
        JSON.stringify(actividadesNormalizadas),
        cliente_id || null,
        cliente_reporte_id || null,
        cantidad_agua ?? null,
        unidad_agua || 'L/s',
        campos_extra ? JSON.stringify(campos_extra) : null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('crear reporte:', err.message);
    if (err.code === '23505' && req.body.cliente_id && req.body.cliente_reporte_id) {
      const existing = await pool.query(
        `SELECT id, fuente_id, nombre_usuario, actividad, actividades, cliente_id,
                cliente_reporte_id, cantidad_agua, unidad_agua, campos_extra, created_at
         FROM reportes_uso
         WHERE cliente_id = $1 AND cliente_reporte_id = $2`,
        [req.body.cliente_id, req.body.cliente_reporte_id]
      );
      if (existing.rows.length > 0) return res.status(200).json(existing.rows[0]);
    }
    if (err.code === '23503') {
      return res.status(400).json({ error: 'fuente_id does not exist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function listarPorCliente(req, res) {
  try {
    const result = await pool.query(
      `SELECT r.id, r.fuente_id, r.nombre_usuario, r.actividad, r.actividades,
              r.cliente_id, r.cliente_reporte_id, r.cantidad_agua, r.unidad_agua,
              r.campos_extra, r.created_at,
              f.nombre_fuente, f.municipio, f.vereda,
              f.lat::float AS lat, f.lon::float AS lon
       FROM reportes_uso r
       INNER JOIN fuentes_hidricas f ON f.id = r.fuente_id
       WHERE r.cliente_id = $1
       ORDER BY r.created_at DESC
       LIMIT 200`,
      [req.query.cliente_id]
    );
    res.json({ data: result.rows, total: result.rowCount });
  } catch (err) {
    console.error('listar reportes por cliente:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function eliminar(req, res) {
  try {
    const result = await pool.query(
      `DELETE FROM reportes_uso
       WHERE id = $1 AND cliente_id = $2
       RETURNING id`,
      [req.params.id, req.query.cliente_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found for this client' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('eliminar reporte:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { crear, listarPorCliente, eliminar };
