const { Router } = require('express');
const { param } = require('express-validator');
const { validate } = require('../middleware/validate');
const ctrl = require('../controllers/estaciones.controller');

const router = Router();

router.get('/', ctrl.listar);

router.get(
  '/:id',
  [param('id').isUUID()],
  validate,
  ctrl.detalle
);

module.exports = router;
