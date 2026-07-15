const pool = require('../models/db');

/**
 * GET /api/estaciones
 * Lista las estaciones con las coordenadas necesarias para el mapa.
 */
async function listar(_req, res) {
  try {
    const result = await pool.query(`
      SELECT id, codigo_estacion, nombre,
             lat::float AS lat, lon::float AS lon,
              NULLIF(BTRIM(variables -> 'VALORES TOTALES DE EVAPORACIÓN (mm)' ->> 'Promedio'), '')::double precision AS et0,
              NULLIF(BTRIM(variables -> 'VALORES TOTALES DE EVAPORACIÓN (mm)' ->> 'Periodo'), '') AS et0_periodo,
             TRUE AS es_estacion
      FROM estaciones_hidrometeorologicas
      ORDER BY nombre, codigo_estacion
    `);
    res.json({ data: result.rows, total: result.rowCount });
  } catch (err) {
    console.error('listar estaciones:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/estaciones/:id
 */
async function detalle(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, codigo_estacion, nombre,
              lat::float AS lat, lon::float AS lon,
              metadatos, variables, fuente_origen,
              TRUE AS es_estacion
       FROM estaciones_hidrometeorologicas
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estación not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('detalle estación:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listar, detalle };
