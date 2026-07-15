const { Router } = require('express');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const { reportesLimiter } = require('../middleware/rateLimiter');
const ctrl = require('../controllers/reportes.controller');

const router = Router();

router.get(
  '/',
  [query('cliente_id').isString().trim().isLength({ min: 10, max: 100 })],
  validate,
  ctrl.listarPorCliente
);

router.post(
  '/',
  reportesLimiter,
  [
    body('fuente_id').isUUID(),
    body('nombre_usuario').optional().isString().trim().isLength({ max: 255 }),
    body('actividades').isArray({ min: 1, max: 7 }),
    body('actividades.*').isString().trim().isLength({ min: 3, max: 1000 }),
    body('cliente_id').optional().isString().trim().isLength({ min: 10, max: 100 }),
    body('cliente_reporte_id').optional().isString().trim().isLength({ min: 10, max: 100 }),
    body('cantidad_agua').optional().isFloat({ min: 0 }),
    body('unidad_agua').optional().isString().trim().isLength({ max: 20 }),
    body('campos_extra').optional().isObject(),
  ],
  validate,
  ctrl.crear
);

router.delete(
  '/:id',
  [
    param('id').isUUID(),
    query('cliente_id').isString().trim().isLength({ min: 10, max: 100 }),
  ],
  validate,
  ctrl.eliminar
);

module.exports = router;
