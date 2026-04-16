const { Router } = require('express');
const { param } = require('express-validator');
const { validate } = require('../middleware/validate');
const ctrl = require('../controllers/capas.controller');

const router = Router();

router.get(
  '/:nombre',
  [param('nombre').isString().trim().isLength({ min: 2, max: 50 })],
  validate,
  ctrl.obtenerCapa
);

module.exports = router;
