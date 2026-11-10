export const ERRORS = Object.freeze({
  // Generales
  INVALID_ID: { code: 'INVALID_ID', statusCode: 400, message: 'El id enviado no es válido' },
  INVALID_JSON: { code: 'INVALID_JSON', statusCode: 400, message: 'El cuerpo de la petición no es un JSON válido' },
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', statusCode: 400, message: 'Los datos enviados no son válidos' },
  DUPLICATE_KEY: { code: 'DUPLICATE_KEY', statusCode: 409, message: 'Ya existe un registro con esos datos' },
  ROUTE_NOT_FOUND: { code: 'ROUTE_NOT_FOUND', statusCode: 404, message: 'La ruta solicitada no existe' },
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', statusCode: 500, message: 'Error interno del servidor' },

  // Usuarios
  USER_NOT_FOUND: { code: 'USER_NOT_FOUND', statusCode: 404, message: 'Usuario no encontrado' },
  INVALID_PASSWORD: { code: 'INVALID_PASSWORD', statusCode: 400, message: 'La contraseña no cumple los requisitos' },

  // Productos
  PRODUCT_NOT_FOUND: { code: 'PRODUCT_NOT_FOUND', statusCode: 404, message: 'Producto no encontrado' },
  INVALID_PRODUCT_STATUS: {
    code: 'INVALID_PRODUCT_STATUS',
    statusCode: 400,
    message: 'El estado del producto se calcula según el stock y no puede enviarse',
  },

  // Mocks
  INVALID_MOCK_QTY: { code: 'INVALID_MOCK_QTY', statusCode: 400, message: 'La cantidad de datos a generar no es válida' },
  NEGATIVE_MOCK_QTY: { code: 'NEGATIVE_MOCK_QTY', statusCode: 400, message: 'La cantidad de datos a generar no puede ser negativa' },
  MOCK_SEED_FORBIDDEN: {
    code: 'MOCK_SEED_FORBIDDEN',
    statusCode: 403,
    message: 'La carga de datos de prueba no está permitida en producción',
  },
  MOCK_SEED_FAILED: {
    code: 'MOCK_SEED_FAILED',
    statusCode: 500,
    message: 'No se pudieron guardar los datos de prueba. No quedó ningún registro a medias',
  },
});