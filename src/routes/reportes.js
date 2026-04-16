const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { reportesLimiter } = require('../middleware/rateLimiter');
const ctrl = require('../controllers/reportes.controller');

const router = Router();

router.post(
  '/',
  reportesLimiter,
  [
    body('fuente_id').isUUID(),
    body('nombre_usuario').optional().isString().trim().isLength({ max: 255 }),
    body('actividad').isString().trim().isLength({ min: 3, max: 1000 }),
    body('cantidad_agua').optional().isFloat({ min: 0 }),
    body('unidad_agua').optional().isString().trim().isLength({ max: 20 }),
    body('campos_extra').optional().isObject(),
  ],
  validate,
  ctrl.crear
);

module.exports = router;
