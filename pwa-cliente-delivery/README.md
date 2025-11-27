# 🍕 PWA Cliente Delivery

Aplicación móvil progresiva (PWA) para clientes que piden comida a domicilio.

## 📸 Vista Previa

Esta es una app móvil tipo Rappi/UberEats para que los clientes:
- 📋 Exploren el menú por categorías
- 🛒 Agreguen productos al carrito
- 📦 Hagan pedidos a domicilio
- 👤 Gestionen su perfil

## 🚀 Inicio Rápido

### Requisitos

- **Node.js** >= 18.0.0
- **Backend** corriendo en `http://localhost:4000`

### Instalación

```bash
cd pwa-cliente-delivery
npm install
```

### Ejecutar

```bash
npm run dev
```

Abre **http://localhost:3001** en tu navegador (preferiblemente en modo móvil F12 → Ctrl+Shift+M).

### Compilar

```bash
npm run build
```

## ⚙️ Configuración

### Puertos

| Servicio | Puerto |
|----------|--------|
| PWA Delivery | 3001 |
| Backend API | 4000 |

Para cambiar el puerto, edita `vite.config.js`:

```javascript
server: {
  port: 3001  // Cambiar aquí
}
```

## 📱 Características

### Navegación

| Sección | Función |
|---------|---------|
| 🏠 Inicio | Ver menú y categorías |
| 🔍 Buscar | Buscar productos |
| 🛒 Carrito | Ver y editar pedido |
| 📦 Pedidos | Historial de pedidos |
| 👤 Perfil | Login y configuración |

### PWA

- ✅ Instalable en Android/iOS
- ✅ Funciona offline
- ✅ Diseño mobile-first

## 🧪 Probar

### 1. Iniciar Backend

```bash
cd ../backend
npm run dev
```

### 2. Iniciar PWA

```bash
cd ../pwa-cliente-delivery
npm run dev
```

### 3. Abrir en Móvil

- Abre Chrome en tu celular
- Navega a `http://TU_IP:3001`
- O usa el modo móvil en DevTools (F12 → Ctrl+Shift+M)

### 4. Flujo de Prueba

1. Ver productos en el menú
2. Agregar productos al carrito
3. Ir al carrito y ajustar cantidades
4. Registrarse o iniciar sesión
5. Completar el pedido

## 📁 Estructura

```
pwa-cliente-delivery/
├── index.html          # HTML principal
├── manifest.json       # Configuración PWA
├── service-worker.js   # Cache offline
├── app.js              # Lógica principal
├── api.js              # Cliente API
├── auth.js             # Autenticación
├── cart.js             # Carrito
├── styles.css          # Estilos móviles
├── vite.config.js      # Configuración Vite
└── icons/              # Iconos PWA
```

## 🔌 API Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/menu` | Obtener menú |
| GET | `/api/menu/categories` | Categorías |
| POST | `/api/auth/login/customer` | Login |
| POST | `/api/auth/register/customer` | Registro |
| POST | `/api/orders` | Crear pedido |
| GET | `/api/orders?customer_id=X` | Mis pedidos |

## ❓ Problemas Comunes

### No carga el menú
- Verifica que el backend esté en `localhost:4000`

### No puedo instalar la PWA
- Accede via `localhost` o `https://`
- Usa Chrome o Edge

### Error de conexión
- Reinicia el servidor de desarrollo
