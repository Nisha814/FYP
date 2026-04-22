const { AppError } = require('../utils/errorHandler')

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// 404 handler
const notFound = (req, res, next) => {
  const err = new AppError(`Not found - ${req.originalUrl}`, 404)
  next(err)
}

module.exports = {
  asyncHandler,
  notFound
}

