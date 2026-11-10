import { ERRORS } from './error-dictionary.js';

export class AppError extends Error {
  constructor(errorType, details = null) {
    super(errorType.message);
    this.name = 'AppError';
    this.code = errorType.code;
    this.statusCode = errorType.statusCode;
    this.details = details;
  }
}

export class InvalidIdError extends AppError {
  constructor(id) {
    super(ERRORS.INVALID_ID, { id });
  }
}

export class RouteNotFoundError extends AppError {
  constructor(method, path) {
    super(ERRORS.ROUTE_NOT_FOUND, { method, path });
  }
}

export class UserNotFoundError extends AppError {
  constructor(id) {
    super(ERRORS.USER_NOT_FOUND, { id });
  }
}

export class InvalidPasswordError extends AppError {
  constructor(minLength) {
    super(ERRORS.INVALID_PASSWORD, { minLength });
  }
}

export class ProductNotFoundError extends AppError {
  constructor(id) {
    super(ERRORS.PRODUCT_NOT_FOUND, { id });
  }
}

export class InvalidProductStatusError extends AppError {
  constructor(status) {
    super(ERRORS.INVALID_PRODUCT_STATUS, { received: status });
  }
}

export class InvalidMockQuantityError extends AppError {
  constructor(received, min, max) {
    super(ERRORS.INVALID_MOCK_QTY, { received, min, max });
  }
}

export class NegativeMockQuantityError extends AppError {
  constructor(received) {
    super(ERRORS.NEGATIVE_MOCK_QTY, { received });
  }
}

export class MockSeedForbiddenError extends AppError {
  constructor() {
    super(ERRORS.MOCK_SEED_FORBIDDEN);
  }
}

export class MockSeedError extends AppError {
  constructor(reason) {
    super(ERRORS.MOCK_SEED_FAILED, { reason });
  }
}