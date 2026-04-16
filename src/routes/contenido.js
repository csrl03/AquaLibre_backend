const { Router } = require('express');
const { param, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const ctrl = require('../controllers/contenido.controller');

const router = Router();

router.get(
  '/',
  [
    query('categoria').optional().isString().trim().isLength({ max: 100 }),
    query('tipo').optional().isIn(['video', 'articulo', 'consejo']),
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

module.exports = router;
