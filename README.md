# 🍽️ SISTEMA ERP COMPLETO PARA RESTAURANTE

> Sistema integral de gestión para restaurante con pedidos domicilio, reservas, gestión de mesas y cocina

## 📋 Tabla de Contenidos

- [URLs de Aplicaciones](#urls-de-aplicaciones)
- [Usuarios de Prueba](#usuarios-de-prueba)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Inicio Rápido](#inicio-rápido)
- [Instalar PWA en Móvil](#instalar-pwa-en-móvil)
- [Widget Chat](#widget-chat)
- [Probar Notificaciones](#probar-notificaciones)
- [Estructura de Directorios](#estructura-de-directorios)
- [Componentes](#componentes)
- [Despliegue](#despliegue)
- [Documentación](#documentación)

## 🌐 URLs de Aplicaciones

| Aplicación | Puerto | URL Local | URL Red Local |
|------------|--------|-----------|---------------|
| **PWA Cliente** | 3000 | http://localhost:3000 | http://192.168.0.6:3000 |
| **PWA Mesero** | 3001 | http://localhost:3001 | http://192.168.0.6:3001 |
| **PWA Cocina** | 3002 | http://localhost:3002 | http://192.168.0.6:3002 |
| **PWA Admin** | 3003 | http://localhost:3003 | http://192.168.0.6:3003 |
| **Backend API** | 4000 | http://localhost:4000 | http://192.168.0.6:4000 |
| **Directus CMS** | 8055 | http://localhost:8055 | http://192.168.0.6:8055 |

## 👤 Usuarios de Prueba

### Clientes (10 registrados)

| Nombre | Teléfono | Email |
|--------|----------|-------|
| María García López | 3101234567 | maria.garcia@email.com |
| Carlos Andrés Martínez | 3209876543 | carlos.martinez@email.com |
| Ana Lucía Rodríguez | 3156789012 | ana.rodriguez@email.com |
| Juan Pablo Hernández | 3183456789 | juan.hernandez@email.com |
| Laura Valentina Gómez | 3002345678 | laura.gomez@email.com |

### Meseros (3 registrados)

| Código | Nombre | PIN |
|--------|--------|-----|
| MES001 | Carlos Alberto García | 1234 |
| MES002 | María Fernanda López | 1234 |
| MES003 | Juan David Martínez | 1234 |

### Personal de Cocina (2 registrados)

| Código | Nombre | PIN |
|--------|--------|-----|
| COC001 | Pedro Antonio Ramírez | 1234 |
| COC002 | Ana María Sánchez | 1234 |

### Acceso Directus (Admin)

- **URL:** http://localhost:8055
- **Email:** admin@restaurante.com
- **Contraseña:** Admin@12345

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

## ⚡ Inicio Rápido

### Iniciar Todos los Servicios (Desarrollo)

Para iniciar el backend y todos los frontends con un solo comando:

```bash
# Desde la raíz del proyecto
npm run dev:all
```

Este comando inicia:
- Backend en puerto 4000
- PWA Cliente en puerto 3000
- PWA Mesero en puerto 3001
- PWA Cocina en puerto 3002
- PWA Admin en puerto 3003

### Iniciar Servicios Individuales

```bash
# Solo Backend
cd backend && npm run dev

# Solo PWA Cliente
cd frontends/cliente && npm run dev

# Solo PWA Mesero
cd frontends/mesero && npm run dev -- -p 3001

# Solo PWA Cocina
cd frontends/cocina && npm run dev -- -p 3002

# Solo PWA Admin
cd frontends/admin && npm run dev -- -p 3003
```

## 📱 Instalar PWA en Móvil

Las aplicaciones son Progressive Web Apps (PWA) instalables en dispositivos móviles.

### Android (Chrome)

1. Abrir la URL de la aplicación en Chrome móvil
   - Cliente: http://192.168.0.6:3000
   - Mesero: http://192.168.0.6:3001
   - Cocina: http://192.168.0.6:3002
2. Esperar a que cargue completamente
3. Tocar el menú (⋮) en la esquina superior derecha
4. Seleccionar **"Instalar aplicación"** o **"Añadir a pantalla de inicio"**
5. Confirmar la instalación
6. La app aparecerá como icono en tu pantalla de inicio

### iOS (Safari)

1. Abrir la URL de la aplicación en Safari
   - Cliente: http://192.168.0.6:3000
   - Mesero: http://192.168.0.6:3001
   - Cocina: http://192.168.0.6:3002
2. Tocar el botón de compartir (□↑)
3. Desplazar hacia abajo y seleccionar **"Añadir a pantalla de inicio"**
4. Nombrar la aplicación y tocar **"Añadir"**
5. La app aparecerá como icono en tu pantalla de inicio

### Verificar Instalación

- La PWA debe funcionar sin conexión (modo offline)
- Debe tener su propio icono en la pantalla de inicio
- Se abrirá en pantalla completa sin barra del navegador

## 💬 Widget Chat

El widget de chat es un componente embebible que puede integrarse en cualquier sitio web.

### Integrar Widget en tu Sitio

Añade el siguiente código antes de cerrar el tag `</body>`:

```html
<!-- Widget Chat Restaurante -->
<script>
  (function() {
    var widget = document.createElement('script');
    widget.src = 'http://localhost:3000/widget.js';
    widget.async = true;
    document.head.appendChild(widget);
  })();
</script>

<!-- O si tienes el widget como componente separado -->
<iframe 
  src="http://localhost:3000/widget" 
  style="position: fixed; bottom: 20px; right: 20px; width: 380px; height: 600px; border: none; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);"
  allow="microphone"
></iframe>
```

### Personalización del Widget

```javascript
// Configuración del widget
window.RestauranteWidget = {
  position: 'bottom-right',  // bottom-right, bottom-left
  primaryColor: '#FF6B35',   // Color principal
  greeting: '¡Hola! ¿En qué te puedo ayudar?',
  restaurantName: 'Mi Restaurante'
};
```

### Funcionalidades del Widget

- 🛒 Ver menú y agregar al carrito
- 📝 Hacer pedidos a domicilio
- 📅 Reservar mesas
- 📍 Rastrear pedidos en tiempo real
- 💬 Chat conversacional

## 🔔 Probar Notificaciones

El sistema soporta tres canales de notificación:

### 1. Email (SMTP Gmail)

```bash
# Probar envío de email
curl -X POST http://localhost:4000/api/notifications/test/email \
  -H "Content-Type: application/json" \
  -d '{"to": "tu-email@gmail.com", "subject": "Test", "message": "Prueba de notificación"}'
```

### 2. WhatsApp (Evolution API)

Requisitos:
- Evolution API corriendo en http://192.168.0.6:8102
- Instancia BOTRESTAURANTE configurada
- Número de WhatsApp conectado

```bash
# Probar envío de WhatsApp
curl -X POST http://localhost:4000/api/notifications/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone": "573332549729", "message": "Prueba de notificación"}'
```

### 3. Telegram

Requisitos:
- Bot de Telegram creado (@BotFather)
- Chat ID obtenido

```bash
# Probar envío de Telegram
curl -X POST http://localhost:4000/api/notifications/test/telegram \
  -H "Content-Type: application/json" \
  -d '{"message": "Prueba de notificación desde el restaurante"}'
```

### Eventos que Generan Notificaciones

| Evento | Email | WhatsApp | Telegram |
|--------|-------|----------|----------|
| Nuevo pedido | ✅ | ✅ | ✅ |
| Pedido confirmado | ✅ | ✅ | ❌ |
| Pedido listo | ❌ | ✅ | ✅ |
| Nueva reserva | ✅ | ✅ | ✅ |
| Reserva confirmada | ✅ | ✅ | ❌ |

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

**Última actualización:** 2025-11-26
**Estado:** 🚀 En desarrollo activo
