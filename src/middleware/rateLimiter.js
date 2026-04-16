const rateLimit = require('express-rate-limit');

const reportesLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reports from this IP. Try again in 1 hour.' },
});

module.exports = { reportesLimiter };
