# 🍽️ SISTEMA ERP COMPLETO PARA RESTAURANTE

> Sistema integral de gestión para restaurante con pedidos domicilio, reservas, gestión de mesas y cocina

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Estructura de Directorios](#estructura-de-directorios)
- [Componentes](#componentes)
- [Despliegue](#despliegue)
- [Documentación](#documentación)

## 🏗️ Arquitectura

### Componentes Principales

```
┌─────────────────────────────────────────────────┐
│          5 APLICACIONES FRONTEND (PWA)          │
│  Widget Chat │ Cliente │ Mesero │ Cocina │Admin │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼ REST API + WebSocket
┌─────────────────────────────────────────────────┐
│      BACKEND NODE.JS + EXPRESS (Puerto 4000)    │
│  • 14 servicios críticos                        │
│  • WebSocket real-time                          │
│  • Cron jobs (auto-release, cleanup)            │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼ Directus SDK
┌─────────────────────────────────────────────────┐
│    DIRECTUS CMS + PostgreSQL (Puerto 8055)      │
│  • 13 collections (tablas)                      │
│  • Gestión de permisos por rol                  │
│  • API automática                               │
└─────────────────────────────────────────────────┘
```

## 🛠️ Requisitos

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** >= 20.10 (para Directus + PostgreSQL)
- **PostgreSQL** 15+
- **Navegador moderno** (Chrome, Firefox, Safari)

## 🚀 Instalación

### 1. Clonar y Acceder al Proyecto

```bash
cd /home/claude/restaurante-erp
```

### 2. Iniciar Base de Datos y Directus

```bash
cd database
docker-compose up -d

# Verificar que servicios están corriendo
docker-compose ps
```

**Acceso Directus:**
- URL: http://localhost:8055
- Email: admin@restaurante.com
- Contraseña: Admin@12345

Ver [`deployment/DOCKER_SETUP.md`](deployment/DOCKER_SETUP.md) para detalles.

### 3. Instalar Backend

```bash
cd ../backend
npm install
npm run build

# Verificar compilación
npm run build
```

### 4. Instalar Frontends (Cada uno)

```bash
cd ../frontends/cliente
npm install
npm run build

# Repetir para: mesero, cocina, admin, widget
```

### 5. Iniciar en Desarrollo

**Terminal 1 - Backend:**
```bash
cd /home/claude/restaurante-erp/backend
npm run dev
# Server escuchando en http://localhost:4000
```

**Terminal 2+ - Frontends:**
```bash
cd /home/claude/restaurante-erp/frontends/cliente
npm run dev
# App escuchando en http://localhost:3000
```

## 📁 Estructura de Directorios

```
restaurante-erp/
├── guias/
│   ├── ERP DOCUMENTO FINAL.md          # Documento maestro completo (3,432 líneas)
│   └── CONSTRUCCIÓN DE FRONTENDS.md    # Guía de frontends
│
├── database/
│   ├── schema.sql                      # Schema con 13 collections
│   ├── init-data.sql                   # Datos iniciales
│   └── docker-compose.yml              # Composición Docker
│
├── backend/
│   ├── src/
│   │   ├── index.ts                    # Servidor principal
│   │   ├── config/
│   │   │   └── directus.ts            # SDK Directus
│   │   ├── middleware/
│   │   │   ├── auth.ts                # JWT + Autenticación
│   │   │   ├── errorHandler.ts        # Manejo de errores
│   │   │   └── validation.ts          # Validaciones
│   │   ├── services/
│   │   │   ├── AuthService.ts         # Registro/Login
│   │   │   ├── MenuService.ts         # Catálogo
│   │   │   ├── OrderService.ts        # Pedidos
│   │   │   ├── ReservationService.ts  # Reservas
│   │   │   ├── KitchenQueueService.ts # Cola cocina
│   │   │   └── ScheduleService.ts     # Horarios
│   │   ├── types/
│   │   │   └── index.ts               # Tipos TypeScript
│   │   └── utils/
│   │       └── logger.ts              # Winston logger
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontends/
│   ├── widget/                         # Widget embebible
│   ├── cliente/                        # PWA Cliente
│   ├── mesero/                         # PWA Mesero
│   ├── cocina/                         # PWA Cocina
│   └── admin/                          # PWA Admin
│
├── deployment/
│   ├── DOCKER_SETUP.md
│   ├── DEPLOY_GUIDE.md
│   ├── pm2.config.js                  # Configuración PM2
│   └── nginx.conf                      # Configuración Nginx
│
└── .env                                # Variables de entorno
```

## 🔧 Componentes

### Backend Servicios (14)

1. **AuthService** - Registro y login (cliente/mesero)
2. **MenuService** - Gestión de productos activos
3. **OrderService** - Creación y rastreo de pedidos
4. **ReservationService** - Reservas de mesas
5. **KitchenQueueService** - Cola de cocina con prioridades
6. **ScheduleService** - Horarios del restaurante
7. **CartService** - Carrito temporal (sessions)
8. **TableService** - Gestión de mesas
9. **WaiterService** - Gestión de meseros
10. **NotificationService** - Email/WhatsApp/Telegram
11. **SessionService** - Sesiones clientes
12. **CustomerService** - Gestión de clientes
13. **WebSocketService** - Real-time (cocina/meseros)
14. **DirectusClient** - SDK conexión a Directus

### Middlewares

- **Auth** - JWT verification
- **ErrorHandler** - Gestión centralizada de errores
- **Validation** - Express-validator + custom validators
- **Rate Limiting** - Protection contra abuso
- **CORS** - Cross-origin configuration

### Database Collections (13)

1. **customers** - Datos clientes
2. **menu_categories** - Categorías
3. **menu_subcategories** - Subcategorías
4. **menu_items** - Productos
5. **orders** - Pedidos
6. **order_items** - Items en pedidos
7. **schedules** - Horarios
8. **sessions** - Sesiones clientes
9. **kitchen_queue** - Cola de cocina
10. **waiters** - Meseros
11. **tables** - Mesas
12. **notifications** - Notificaciones
13. **reservations** - Reservas (NUEVA)

### Frontends (5 Apps)

Cada una es una PWA independiente:

1. **Widget Chat** - Embebible en cualquier sitio
2. **PWA Cliente** - Catálogo, carrito, pedidos
3. **PWA Mesero** - Tomar pedidos, mesas, reservas
4. **PWA Cocina** - Cola con prioridades
5. **PWA Admin** - Dashboard, reportes, configuración

## 🔗 Validaciones Críticas

### Horarios
- ✅ Validar en 3 puntos: inicio sesión, agregar carrito, confirmar
- ✅ Timezone: SIEMPRE America/Bogota
- ✅ Si is_open=false → rechazar pedidos

### Productos
- ✅ Solo status='active' visibles
- ✅ Precio y delivery_cost > 0

### Pedidos
- ✅ **delivery_cost = MAX(items), NO suma** ⭐
- ✅ **Snapshot de precios en order_items** ⭐
- ✅ Si delivery → delivery_address obligatorio

### Teléfono
- ✅ Exactamente 10 dígitos
- ✅ Normalizar +57 → sin prefijo
- ✅ UNIQUE en customers

### Reservas
- ✅ Auto-liberar 30 min después si no se activa
- ✅ No permitir misma mesa/fecha/hora
- ✅ party_size <= table.capacity

## 📊 Cron Jobs

- **Auto-release reservas** - Cada 5 minutos
- **Limpiar sesiones expiradas** - Cada hora
- **Notificaciones pendientes** - Cada 5 minutos

## 🌍 WebSocket Eventos

```
order:created        → Notifica a cocina/meseros
order:updated        → Actualiza estado
kitchen_queue:new    → Nuevo item en cola
kitchen_queue:ready  → Item listo
reservation:confirmed → Cliente confirmó
table:status_changed → Cambio en mesa
```

## 📚 Documentación

- [`guias/ERP DOCUMENTO FINAL.md`](guias/ERP%20DOCUMENTO%20FINAL.md) - Documento maestro completo
- [`deployment/DOCKER_SETUP.md`](deployment/DOCKER_SETUP.md) - Setup con Docker
- [`deployment/DEPLOY_GUIDE.md`](deployment/DEPLOY_GUIDE.md) - Guía de despliegue (TODO)

## 🚀 Despliegue

### Desarrollo

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontends
cd frontends/cliente && npm run dev
```

### Producción

```bash
# 1. Build
npm run build

# 2. Configurar PM2
pm2 start deployment/pm2.config.js

# 3. Verificar
pm2 monit
```

Ver [`deployment/DEPLOY_GUIDE.md`](deployment/DEPLOY_GUIDE.md) para detalles.

## 🔐 Seguridad

- ✅ JWT para autenticación
- ✅ Bcrypt para passwords/PINs
- ✅ CORS configurado
- ✅ Helmet.js para headers
- ✅ Rate limiting
- ✅ Validación en todos los endpoints
- ✅ PostgreSQL solo localhost

## 📝 Variables de Entorno

Copiar y editar `.env.example`:

```bash
cp backend/.env.example backend/.env
```

Campos importantes:
- `DIRECTUS_URL` - URL de Directus
- `DIRECTUS_TOKEN` - Token de acceso
- `JWT_SECRET` - Clave para JWT
- `CORS_ORIGIN` - Dominios permitidos

## 🐛 Troubleshooting

### Directus no inicia
```bash
docker-compose logs directus
docker-compose restart directus
```

### Backend no conecta
```bash
# Verificar Directus está disponible
curl http://localhost:8055/server/health
```

### Puerto ya en uso
```bash
# Cambiar en .env o docker-compose.yml
PORT=4001
```

## 👥 Roles y Permisos

- **Cliente** - Pedidos, reservas, perfil
- **Mesero** - Tomar pedidos, mesas, reservas
- **Cocina** - Ver y actualizar cola
- **Admin** - Acceso total

## 📦 Paquetes Principales

- **Express** - Framework HTTP
- **TypeScript** - Type safety
- **@directus/sdk** - SDK Directus
- **jsonwebtoken** - JWT
- **bcryptjs** - Hashing
- **Winston** - Logging
- **Node-cron** - Cron jobs
- **Axios** - HTTP requests
- **Nodemailer** - Email

## 📞 Soporte

Para problemas, consultar:
1. `guias/ERP DOCUMENTO FINAL.md` - Sección específica
2. Logs del backend: `logs/combined.log`
3. Logs de Directus: `docker-compose logs directus`

## 📄 Licencia

MIT

---

**Última actualización:** 2025-11-25
**Estado:** 🚀 En construcción
