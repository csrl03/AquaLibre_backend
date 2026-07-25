const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const ctrl = require('../controllers/auth.controller');

const router = Router();

router.post(
  '/register',
  [
    body('cliente_id').optional().isString().trim().isLength({ min: 10, max: 100 }),
  ],
  validate,
  ctrl.register
);

module.exports = router;