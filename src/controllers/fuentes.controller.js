const pool = require('../models/db');

const PAGE_SIZE = 20;

/**
 * GET /api/fuentes
 * Query params: vereda, uso, tipo, page
 */
async function listar(req, res) {
  try {
    const { vereda, uso, tipo, page = 1 } = req.query;
    const offset = (parseInt(page, 10) - 1) * PAGE_SIZE;

    const conditions = [];
    const values = [];
    let i = 1;

    if (vereda) { conditions.push(`vereda ILIKE $${i++}`);        values.push(`%${vereda}%`); }
    if (uso)    { conditions.push(`uso_principal ILIKE $${i++}`); values.push(`%${uso}%`);    }
    if (tipo)   { conditions.push(`tipo_captacion ILIKE $${i++}`); values.push(`%${tipo}%`);  }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(PAGE_SIZE, offset);

    const sql = `
      SELECT id, expediente, nombre_fuente, tipo_captacion, uso_principal,
             caudal_ls, municipio, vereda, es_vertimiento,
             lat::float AS lat, lon::float AS lon
      FROM fuentes_hidricas
      ${where}
      ORDER BY nombre_fuente
      LIMIT $${i} OFFSET $${i + 1}
    `;
    const countSql = `SELECT COUNT(*) FROM fuentes_hidricas ${where}`;

    const [data, total] = await Promise.all([
      pool.query(sql, values),
      pool.query(countSql, values.slice(0, -2)),
    ]);

    res.json({
      data: data.rows,
      total: parseInt(total.rows[0].count, 10),
      page: parseInt(page, 10),
      pageSize: PAGE_SIZE,
    });
  } catch (err) {
    console.error('listar fuentes:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/fuentes/buscar?q=<nombre>
 */
async function buscar(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query "q" must be at least 2 characters' });
    }
    const result = await pool.query(
      `SELECT id, nombre_fuente, tipo_captacion, uso_principal, vereda,
              lat::float AS lat, lon::float AS lon
       FROM fuentes_hidricas
       WHERE nombre_fuente ILIKE $1
       ORDER BY nombre_fuente
       LIMIT 20`,
      [`%${q.trim()}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('buscar fuentes:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/fuentes/:id
 */
async function detalle(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT *, lat::float AS lat, lon::float AS lon FROM fuentes_hidricas WHERE id = $1`,

      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fuente not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('detalle fuente:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/fuentes/reverse-geocode?lat=X&lon=Y
 * Uses PostGIS ST_Contains on capas_geo (veredas + municipio) to reverse-geocode
 * a point to its vereda and municipio name from the GIS layers.
 */
async function reverseGeocode(req, res) {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)
        || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ error: 'lat and lon must be valid numeric coordinates' });
    }

    const point = `ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)`;

    // Query veredas layer — property NOMBRE_VER holds the vereda name
    const veredaResult = await pool.query(
      `SELECT feature->'properties'->>'NOMBRE_VER' AS vereda,
              feature->'properties'->>'NOMB_MPIO'  AS municipio
       FROM capas_geo,
            jsonb_array_elements(geojson->'features') AS feature
       WHERE nombre_capa = 'veredas'
         AND ST_Contains(
           ST_GeomFromGeoJSON(feature->'geometry'::text, 4326),
           ${point}
         )
       LIMIT 1`
    );

    // Query municipio layer — property "nombre" holds the municipality name
    const municipioResult = await pool.query(
      `SELECT feature->'properties'->>'nombre' AS municipio
       FROM capas_geo,
            jsonb_array_elements(geojson->'features') AS feature
       WHERE nombre_capa = 'municipio'
         AND ST_Contains(
           ST_GeomFromGeoJSON(feature->'geometry'::text, 4326),
           ${point}
         )
       LIMIT 1`
    );

    const vereda = veredaResult.rows[0]?.vereda || null;
    const municipio =
      veredaResult.rows[0]?.municipio
      || municipioResult.rows[0]?.municipio
      || null;
    const nombre = vereda || municipio || null;

    res.json({ nombre, municipio, vereda });
  } catch (err) {
    console.error('reverse geocode:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/fuentes/:id/reportes
 */
async function reportesPorFuente(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, nombre_usuario, actividad, actividades, cantidad_agua, unidad_agua, created_at
       FROM reportes_uso
       WHERE fuente_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('reportes por fuente:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listar, buscar, detalle, reportesPorFuente, reverseGeocode };
