## Manejo de errores

Los errores se manejan en una capa centralizada:

- `src/errors/error-dictionary.js`: diccionario con todos los errores posibles, cada uno con su código, status HTTP y mensaje.
- `src/errors/custom-errors.js`: errores personalizados del dominio, como `UserNotFoundError` o `NegativeMockQuantityError`.
- `src/middlewares/error.middleware.js`: middleware global y único lugar que responde errores al cliente.

Los services detectan los errores y los lanzan. Los controllers y las rutas no arman respuestas de error. Los errores de Mongoose y de JSON inválido también se traducen al formato común.

### Estructura de la respuesta

```json
{
  "status": "error",
  "statusCode": 400,
  "code": "NEGATIVE_MOCK_QTY",
  "message": "La cantidad de datos a generar no puede ser negativa",
  "details": { "received": -3 },
  "path": "/api/mocks/users?qty=-3",
  "timestamp": "2026-11-10T21:51:40.814Z"
}
```

- `code`: identificador fijo del error, para que el cliente pueda reconocerlo.
- `details`: información extra sobre el error, o `null` si no hay.

### Errores disponibles

| Código | Status | Cuándo ocurre |
|---|---|---|
| `INVALID_ID` | 400 | El id no tiene formato válido |
| `INVALID_JSON` | 400 | El cuerpo de la petición no es un JSON válido |
| `VALIDATION_ERROR` | 400 | Faltan datos o no cumplen las reglas del modelo |
| `INVALID_PASSWORD` | 400 | La contraseña tiene menos de 8 caracteres |
| `INVALID_PRODUCT_STATUS` | 400 | Se envía `status` en un producto, aunque se calcula según el stock |
| `INVALID_MOCK_QTY` | 400 | `qty` no es un entero entre 1 y 100 |
| `NEGATIVE_MOCK_QTY` | 400 | `qty` es negativo |
| `MOCK_SEED_FORBIDDEN` | 403 | Se intenta cargar datos con `NODE_ENV=production` |
| `USER_NOT_FOUND` | 404 | No existe el usuario |
| `PRODUCT_NOT_FOUND` | 404 | No existe el producto |
| `ROUTE_NOT_FOUND` | 404 | La ruta no existe |
| `DUPLICATE_KEY` | 409 | Ya existe un registro con ese dato único, como el email |
| `MOCK_SEED_FAILED` | 500 | MongoDB falló durante la carga de datos de prueba |
| `INTERNAL_ERROR` | 500 | Error inesperado |

Si la carga de datos de prueba falla a mitad de camino, se borran los registros que se llegaron a guardar, para no dejar datos incompletos.

### Cómo probar los casos inválidos

Con el servidor corriendo, abrir en el navegador:

- `http://localhost:8080/api/mocks/users?qty=-3` → `NEGATIVE_MOCK_QTY`
- `http://localhost:8080/api/mocks/users?qty=abc` → `INVALID_MOCK_QTY`
- `http://localhost:8080/api/mocks/users?qty=500` → `INVALID_MOCK_QTY`
- `http://localhost:8080/api/users/123` → `INVALID_ID`
- `http://localhost:8080/api/users/6af38d8e956809dfdcdde832` → `USER_NOT_FOUND`
- `http://localhost:8080/api/nada` → `ROUTE_NOT_FOUND`

Para probar un POST desde PowerShell:

```powershell
curl.exe -X POST "http://localhost:8080/api/mocks/seed?qty=-1"
```