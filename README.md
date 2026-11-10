# ShipNow API

API REST con Node.js, Express y MongoDB para gestionar usuarios, productos, pedidos y entregas, organizada en arquitectura de capas.

## Cómo correr el proyecto

1. Clonar el repositorio y entrar a la carpeta.
2. Instalar las dependencias:

   ```bash
   npm install
   ```

3. Crear un archivo `.env` a partir de `.env.example` y completar `PORT`, `MONGODB_URI` y `NODE_ENV`.
4. Iniciar en modo desarrollo:

   ```bash
   npm run dev
   ```

Si falta una variable obligatoria, la aplicación muestra cuál es y no arranca.

## Arquitectura

El flujo es `Router → Controller → Service → Repository → Model`.

- **Controller:** recibe la petición HTTP y devuelve la respuesta con su status code.
- **Service:** contiene las reglas de negocio.
- **Repository:** es la única capa que usa Mongoose para acceder a MongoDB.

Los roles, estados y prioridades están definidos en `src/constants/index.js`.

## Mocking y datos de prueba

El módulo de mocking usa [Faker](https://fakerjs.dev/) para generar datos simulados con la misma estructura que los modelos reales. Todos los endpoints aceptan `qty`, un número entero entre 1 y 100. Si no se envía, se generan 5 registros.

### Datos que se pueden generar

| Entidad | Datos | Reglas |
|---|---|---|
| Usuarios | `name`, `email`, `role` | Rol `USER` (cliente) o `DRIVER` (repartidor) |
| Repartidores | Usuarios con rol `DRIVER` | No son una colección aparte |
| Pedidos | `user`, `address`, `total`, `status`, `priority` | Pertenecen a un usuario con rol `USER` |
| Entregas | `order`, `driver`, `status`, `deliveredAt` | Pertenecen a un pedido y solo tienen repartidor si están asignadas, en camino o entregadas |

El estado de cada entrega depende del estado de su pedido:

| Pedido | Entrega | ¿Tiene repartidor? |
|---|---|---|
| `PENDING` | `PENDING_ASSIGNMENT` | No |
| `PREPARING` | `ASSIGNED` | Sí |
| `SHIPPED` | `IN_TRANSIT` | Sí |
| `DELIVERED` | `DELIVERED` | Sí |
| `CANCELLED` | `CANCELLED` | No |

### Endpoints que no guardan datos

| Método | Ruta | Devuelve |
|---|---|---|
| GET | `/api/mocks/users?qty=2` | Usuarios con rol `USER` o `DRIVER` |
| GET | `/api/mocks/drivers?qty=2` | Repartidores |
| GET | `/api/mocks/dataset?qty=4` | Usuarios, pedidos y entregas relacionados entre sí |

Ejemplo de `GET /api/mocks/users?qty=2`:

```json
[
  { "_id": "6af3...", "name": "Ana Pérez", "email": "ana.perez.x7k2p@test.com", "role": "USER" },
  { "_id": "6af3...", "name": "Luis Gómez", "email": "luis.gomez.9qw3e@test.com", "role": "DRIVER" }
]
```

Las claves están en inglés porque coinciden con los campos de los modelos reales.

### Carga de datos de prueba en MongoDB

| Método | Ruta | Inserta |
|---|---|---|
| POST | `/api/mocks/seed?qty=10` | Usuarios en la colección `users` |
| POST | `/api/mocks/seed/dataset?qty=6` | Usuarios, pedidos y entregas relacionados |

Ejemplos de respuesta:

```json
{ "insertados": 10, "coleccion": "users" }
```

```json
{ "insertados": { "users": 5, "orders": 6, "deliveries": 6 } }
```

En `seed/dataset`, `qty` es la cantidad de pedidos. Se generan además `qty / 2` clientes y `qty / 3` repartidores, redondeando hacia arriba, y una entrega por pedido.

La carga está controlada:

- `qty` tiene que estar entre 1 y 100. Si no, la API responde `400`.
- No se permite cuando `NODE_ENV=production`. En ese caso, la API responde `403`.
- Todos los usuarios cargados tienen la contraseña `mock1234`, guardada encriptada.

### Cómo probarlo en PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/mocks/users?qty=2"
Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/mocks/seed?qty=10"
Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/mocks/seed/dataset?qty=6"
```

## Otros endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Verifica que el servidor esté activo |
| GET, POST | `/api/products` | Lista productos disponibles o crea uno |
| GET, PUT, DELETE | `/api/products/:id` | Obtiene, actualiza o elimina un producto |
| GET, POST | `/api/users` | Lista usuarios o crea uno |
| GET, PUT, DELETE | `/api/users/:id` | Obtiene, actualiza o elimina un usuario |

## Por qué separé Service y Repository

El Service decide qué debe pasar y el Repository resuelve cómo buscarlo o guardarlo.

- **En el Service:** listar solo productos disponibles, calcular estados, encriptar contraseñas, generar los datos de prueba, mantener las relaciones entre entidades y validar cuántos registros se pueden cargar.
- **En el Repository:** consultar e insertar datos, definir qué campos se devuelven y generar los ids de MongoDB.

Así, si cambia la forma de acceder a los datos, las reglas de negocio no deberían cambiar.

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