/
  Error Handler Middleware
  Centralized error handling for API
  
  Functions:
   - errorHandler(err, req, res, next): Process errors and send responses
 /

module.exports = (err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || ;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      status,
      message,
      timestamp: new Date().toISOString(),
    },
  });
};
