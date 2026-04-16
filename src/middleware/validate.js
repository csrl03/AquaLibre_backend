const { validationResult } = require('express-validator');

/**
 * Middleware: runs after express-validator chains.
 * Returns 400 with error details if any validation failed.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = { validate };
