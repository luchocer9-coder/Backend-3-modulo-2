import { AppError } from '../errors/custom-errors.js';
import { ERRORS } from '../errors/error-dictionary.js';

// Convierte cualquier error en un AppError del diccionario
const toAppError = (err) => {
  if (err instanceof AppError) return err;

  if (err.type === 'entity.parse.failed') {
    return new AppError(ERRORS.INVALID_JSON);
  }

  if (err.name === 'CastError') {
    return new AppError(ERRORS.INVALID_ID, { field: err.path, value: err.value });
  }

  if (err.name === 'ValidationError') {
    const fields = Object.values(err.errors).map((fieldError) => ({
      field: fieldError.path,
      message: fieldError.message,
    }));
    return new AppError(ERRORS.VALIDATION_ERROR, { fields });
  }

  if (err.code === 11000) {
    return new AppError(ERRORS.DUPLICATE_KEY, { fields: Object.keys(err.keyValue ?? {}) });
  }

  return new AppError(ERRORS.INTERNAL_ERROR);
};

export const errorHandler = (err, req, res, next) => {
  const appError = toAppError(err);

  // Solo se registran en consola los errores inesperados
  if (appError.code === ERRORS.INTERNAL_ERROR.code) {
    console.error(err);
  }

  res.status(appError.statusCode).json({
    status: 'error',
    statusCode: appError.statusCode,
    code: appError.code,
    message: appError.message,
    details: appError.details,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};