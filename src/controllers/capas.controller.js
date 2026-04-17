const pool = require('../models/db');

// Chocontá municipality bounding box (WGS84) — generous margin included
const BBOX = { minLon: -74.10, maxLon: -73.30, minLat: 4.85, maxLat: 5.45 };

/**
 * Check if any coordinate in a (possibly nested) array falls within BBOX.
 * Coords are GeoJSON [lon, lat] pairs.
 */
function coordsInBBox(coords) {
  if (!Array.isArray(coords)) return false;
  if (typeof coords[0] === 'number') {
    return coords[0] >= BBOX.minLon && coords[0] <= BBOX.maxLon &&
           coords[1] >= BBOX.minLat && coords[1] <= BBOX.maxLat;
  }
  return coords.some(coordsInBBox);
}

/**
 * Recursively truncate all numbers in a coordinate array to `precision` decimals.
 */
function truncateCoords(coords, precision = 5) {
  if (!Array.isArray(coords)) return coords;
  if (typeof coords[0] === 'number') {
    const f = Math.pow(10, precision);
    return [Math.round(coords[0] * f) / f, Math.round(coords[1] * f) / f];
  }
  return coords.map((c) => truncateCoords(c, precision));
}

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

    const geojson = result.rows[0].geojson;

    // Filter to Chocontá bbox and reduce coordinate precision to limit response size
    const filtered = {
      ...geojson,
      features: (geojson.features || [])
        .filter((f) => f.geometry && coordsInBBox(f.geometry.coordinates))
        .map((f) => ({
          ...f,
          geometry: {
            ...f.geometry,
            coordinates: truncateCoords(f.geometry.coordinates),
          },
        })),
    };

    res.json(filtered);
  } catch (err) {
    console.error('obtener capa:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { obtenerCapa };
