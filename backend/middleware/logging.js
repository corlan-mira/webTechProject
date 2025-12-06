/
  Logging Middleware
  Log HTTP requests
  
  Functions:
   - requestLogger(req, res, next): Log incoming requests
 /

const { LOG_LEVEL } = require('../config/environment');

module.exports = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};
