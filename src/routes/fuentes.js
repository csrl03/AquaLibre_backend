const { Router } = require('express');
const { param, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const ctrl = require('../controllers/fuentes.controller');

const router = Router();

router.get(
  '/buscar',
  [query('q').isString().trim().isLength({ min: 2, max: 100 })],
  validate,
  ctrl.buscar
);

router.get(
  '/reverse-geocode',
  [
    query('lat').isFloat({ min: -90, max: 90 }),
    query('lon').isFloat({ min: -180, max: 180 }),
  ],
  validate,
  ctrl.reverseGeocode
);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('vereda').optional().isString().trim().isLength({ max: 100 }),
    query('uso').optional().isString().trim().isLength({ max: 100 }),
    query('tipo').optional().isString().trim().isLength({ max: 100 }),
  ],
  validate,
  ctrl.listar
);

router.get(
  '/:id',
  [param('id').isUUID()],
  validate,
  ctrl.detalle
);

router.get(
  '/:id/reportes',
  [param('id').isUUID()],
  validate,
  ctrl.reportesPorFuente
);

module.exports = router;
