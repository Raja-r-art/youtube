const errorHandler = (err, req, res, next) => {
  console.error(`❌ ${req.method} ${req.path} →`, err.message);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
  });
};

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
