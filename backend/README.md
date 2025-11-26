# 🍽️ ERP Restaurante - Backend

Backend completo para el Sistema ERP de Restaurante con Node.js, Express, TypeScript y PostgreSQL.

## 📋 Requisitos

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL 14+
- Docker (opcional, para PostgreSQL)

## 🚀 Inicialización Rápida

### 1. Iniciar PostgreSQL

```bash
cd database
docker-compose up -d postgres
```

O si tienes PostgreSQL instalado localmente, asegúrate de que esté corriendo.

### 2. Configurar variables de entorno

```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

### 3. Cargar datos de prueba

```bash
cd backend/scripts
./init-db.sh
```

### 4. Instalar dependencias e iniciar backend

```bash
cd backend
npm install
npm run build
npm run dev
```

### 5. Validar endpoints

```bash
npm run test:endpoints
```

## 🔑 Credenciales de Prueba

### Meseros
| Código | Nombre | PIN | Estado |
|--------|--------|-----|--------|
| `MES-001` | Juan Pérez | `1234` | Activo |
| `MES-002` | María García | `1234` | Activo |
| `MES-003` | Carlos López | `1234` | Activo |
| `MES-004` | Ana Martínez | `1234` | Activo |
| `MES-005` | Luis Rodríguez | `1234` | Activo |
| `MES-006` | Laura Sánchez | `1234` | Inactivo |
| `MES-007` | Pedro Torres | `1234` | Activo |
| `MES-008` | Sofia Ramírez | `1234` | Activo |
| `MES-009` | Diego Flores | `1234` | Inactivo |
| `MES-010` | Valentina Cruz | `1234` | Activo |

### Clientes
- Teléfonos: `3101111111` a `3115555555`
- Formato: `CLI-001` a `CLI-015`

### Mesas
- `MESA-01` a `MESA-20`
- Capacidad: 2-10 personas
- Zonas: Terraza, Interior, Salón Principal, Ventana, Barra, Privado VIP

## 📊 Datos de Prueba

Después de ejecutar `./init-db.sh`, la base de datos contendrá:

| Entidad | Cantidad |
|---------|----------|
| Meseros | 10 |
| Mesas | 20 |
| Clientes | 15 |
| Categorías | 10 |
| Subcategorías | 50 |
| Productos | 150 |
| Horarios | 7 días |

## ✅ Verificación de Endpoints

Después de la inicialización, estos endpoints deben funcionar:

### Health Check
```bash
curl http://localhost:4000/health
# Respuesta: 200
```

### Categorías del Menú
```bash
curl http://localhost:4000/api/menu/categories
# Respuesta: 10 categorías
```

### Productos del Menú
```bash
curl http://localhost:4000/api/menu
# Respuesta: 150 productos
```

### Mesas
```bash
curl http://localhost:4000/api/tables
# Respuesta: 20 mesas
```

### Horarios
```bash
curl http://localhost:4000/api/schedule/is-open
# Respuesta: { is_open: true/false, ... }
```

### Login de Mesero
```bash
curl -X POST http://localhost:4000/api/auth/login/waiter \
  -H "Content-Type: application/json" \
  -d '{"waiter_code": "MES-001", "pin_code": "1234"}'
# Respuesta: { success: true, token: "JWT...", waiter: {...} }
```

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar servidor en modo desarrollo |
| `npm run build` | Compilar TypeScript |
| `npm run start` | Iniciar servidor compilado |
| `npm run test:endpoints` | Validar todos los endpoints críticos |

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/         # Configuración de DB y app
│   ├── middleware/     # Middleware de autenticación
│   ├── routes/         # Rutas de la API
│   ├── services/       # Lógica de negocio
│   ├── state-machine/  # Máquina de estados del chat
│   ├── types/          # Tipos de TypeScript
│   ├── utils/          # Utilidades (logger, etc.)
│   └── index.ts        # Punto de entrada
├── scripts/
│   └── init-db.sh      # Script de inicialización de BD
├── tests/
│   └── validate-endpoints.ts  # Tests de endpoints
└── database/           # Link a archivos SQL
```

## 🔒 Autenticación

El backend usa JWT para autenticación. Los endpoints protegidos requieren el header:

```
Authorization: Bearer <token>
```

### Obtener Token

```bash
# Login de mesero
curl -X POST http://localhost:4000/api/auth/login/waiter \
  -H "Content-Type: application/json" \
  -d '{"waiter_code": "MES-001", "pin_code": "1234"}'

# Login de cliente
curl -X POST http://localhost:4000/api/auth/login/customer \
  -H "Content-Type: application/json" \
  -d '{"phone": "3101111111"}'
```

## 🌐 API Endpoints Principales

### Públicos (sin autenticación)
- `GET /health` - Health check
- `GET /api/menu` - Menú completo
- `GET /api/menu/categories` - Categorías
- `GET /api/menu/subcategories?category_id=<UUID>` - Subcategorías
- `GET /api/schedule` - Horarios
- `GET /api/schedule/is-open` - ¿Está abierto?
- `GET /api/tables` - Mesas
- `GET /api/waiters` - Meseros
- `POST /api/auth/login/waiter` - Login mesero
- `POST /api/auth/login/customer` - Login cliente
- `POST /api/auth/register/customer` - Registro cliente

### Protegidos (requieren autenticación)
- `GET /api/orders` - Listar pedidos (admin/mesero)
- `POST /api/orders` - Crear pedido
- `GET /api/reservations/today` - Reservas de hoy

## 📝 Notas

- Todos los datos son **ficticios** y solo para pruebas
- Los PINs de meseros son todos `1234`
- Las imágenes de productos usan URLs de Unsplash
- Los teléfonos usan el formato `310XXXXXXX`
- Los emails usan el dominio `@example.com`

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request
