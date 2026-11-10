import { RouteNotFoundError } from '../errors/custom-errors.js';

export const notFoundHandler = (req, res, next) => {
  next(new RouteNotFoundError(req.method, req.originalUrl));
};