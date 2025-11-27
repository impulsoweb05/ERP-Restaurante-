# 🍕 PWA Cliente Delivery

App móvil para clientes que piden comida a domicilio (tipo Rappi/UberEats).

---

## 🚀 INSTRUCCIONES PASO A PASO

### PASO 1: Abrir Terminal en la raíz del proyecto

```bash
cd ERP-Restaurante-
```

### PASO 2: Iniciar el Backend (OBLIGATORIO)

```bash
cd backend
npm install
npm run dev
```

✅ Debe aparecer: `Server running on port 4000`

**Dejar esta terminal abierta.**

### PASO 3: Abrir OTRA terminal e iniciar la PWA

```bash
cd ERP-Restaurante-/pwa-cliente-delivery
npm install
npm run dev
```

✅ Debe aparecer: `Local: http://localhost:3001/`

### PASO 4: Abrir en el navegador

1. Abre Chrome
2. Ve a: **http://localhost:3001**
3. Presiona **F12** para abrir DevTools
4. Presiona **Ctrl+Shift+M** para modo móvil
5. Selecciona un dispositivo (ej: iPhone 12)

---

## 📱 Qué vas a ver

| Sección | Función |
|---------|---------|
| 🏠 Inicio | Ver menú y categorías |
| 🔍 Buscar | Buscar productos |
| 🛒 Carrito | Ver y editar pedido |
| 📦 Pedidos | Historial de pedidos |
| 👤 Perfil | Login y configuración |

---

## ⚙️ Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Backend API | 4000 | http://localhost:4000 |
| PWA Delivery | 3001 | http://localhost:3001 |
| PWA Admin | 3000 | http://localhost:3000 |

---

## 🧪 Flujo de Prueba

1. Ver productos en el menú
2. Agregar productos al carrito (botón +)
3. Ir al carrito y ajustar cantidades
4. Ir a Perfil → Registrarse
5. Completar el pedido

---

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

---

## ❓ Problemas Comunes

### No carga el menú
- **Causa**: El backend no está corriendo
- **Solución**: Ejecuta primero `cd backend && npm run dev`

### Error "Cannot GET /"
- **Causa**: npm install no se ejecutó
- **Solución**: Ejecuta `npm install` antes de `npm run dev`

### No puedo instalar la PWA
- Accede via `localhost` o `https://`
- Usa Chrome o Edge
