module.exports = (err, req, res, next) => {
  console.error(err.stack || err);

  const status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Sanitize message in production for internal server errors
  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'An unexpected error occurred. Please contact system support.';
  }

  res.status(status).json({
    success: false,
    message,
  });
};

