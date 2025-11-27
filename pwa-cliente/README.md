# 🍽️ PWA Cliente - Restaurante

Progressive Web App para clientes del restaurante. Permite explorar el menú, gestionar pedidos y visualizar mesas en 3D.

## 📸 Vista Previa

![PWA Cliente Preview](https://github.com/user-attachments/assets/94cd8a0b-d9e0-47ca-8289-16f16bfcbec8)

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Backend** corriendo en `http://localhost:4000` (ver [backend/README.md](../backend/README.md))

### Instalación

```bash
# Navegar al directorio
cd pwa-cliente

# Instalar dependencias
npm install
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

### Compilar para Producción

```bash
npm run build
```

Los archivos se generan en la carpeta `dist/`.

### Vista Previa de Producción

```bash
npm run preview
```

## ⚙️ Configuración

### Puerto del Servidor de Desarrollo

El puerto por defecto es `3000`. Para cambiarlo, edita `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 3000,  // Cambiar este valor
    // ...
  }
});
```

### Conexión al Backend

El proxy API está configurado para conectarse a `http://localhost:4000`. Para cambiar la URL del backend:

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',  // URL del backend
        changeOrigin: true
      }
    }
  }
});
```

### Variables de Entorno (Opcional)

Puedes crear un archivo `.env` para configuración adicional:

```env
VITE_API_URL=http://localhost:4000
```

## 📱 Características

### Navegación Principal

| Sección | Descripción |
|---------|-------------|
| 📋 **Menú** | Explora productos por categorías |
| 🪑 **Mesas** | Visualización 3D de mesas del restaurante |
| 🛒 **Carrito** | Gestiona productos para tu pedido |
| 📦 **Pedidos** | Historial de pedidos realizados |

### Funcionalidades PWA

- ✅ **Instalable** en Android e iOS
- ✅ **Modo Offline** con Service Worker
- ✅ **Sincronización en segundo plano** para pedidos offline
- ✅ **Notificaciones Push** (preparado)

### Visualización 3D de Mesas

- **Verde** 🟢 = Mesa disponible
- **Rojo** 🔴 = Mesa ocupada
- **Amarillo** 🟡 = Mesa reservada

Controles:
- **Arrastrar** para rotar la vista
- **Pellizcar/Scroll** para zoom

## 🧪 Probar la Aplicación

### 1. Iniciar el Backend

```bash
cd ../backend
npm install
npm run dev
```

El backend debe estar corriendo en `http://localhost:4000`.

### 2. Iniciar el Frontend

```bash
cd ../pwa-cliente
npm install
npm run dev
```

### 3. Abrir en el Navegador

Navega a **http://localhost:3000**

### 4. Probar Funcionalidades

1. **Ver Menú**: Navega por las categorías y productos
2. **Agregar al Carrito**: Click en "Agregar" en cualquier producto
3. **Iniciar Sesión**: Click en "Ingresar" e ingresa un número de teléfono
4. **Realizar Pedido**: Ve al carrito y completa el checkout
5. **Ver Mesas 3D**: Navega a "Mesas" para ver la visualización 3D

### 5. Probar Instalación PWA

En Chrome:
1. Abre DevTools (F12)
2. Ve a **Application** → **Manifest**
3. Verifica que no hay errores
4. Click en el botón "Instalar" que aparece en la app

### 6. Probar Modo Offline

1. Abre DevTools → **Application** → **Service Workers**
2. Marca "Offline"
3. Recarga la página
4. La app debe seguir funcionando con datos cacheados

## 📁 Estructura del Proyecto

```
pwa-cliente/
├── index.html          # HTML principal con meta tags PWA
├── manifest.json       # Configuración PWA (iconos, colores, etc.)
├── service-worker.js   # Caché y sincronización offline
├── app.js              # Lógica principal y navegación
├── api.js              # Cliente API para el backend
├── auth.js             # Autenticación JWT
├── cart.js             # Gestión del carrito
├── menu3d.js           # Visualización 3D con Three.js
├── styles.css          # Estilos CSS responsivos
├── vite.config.js      # Configuración de Vite
├── package.json        # Dependencias
└── icons/              # Iconos PWA (72x72 a 512x512)
```

## 🔌 Endpoints del Backend Utilizados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/menu` | Obtener menú completo |
| GET | `/api/menu/categories` | Listar categorías |
| GET | `/api/menu/subcategories` | Filtrar subcategorías |
| GET | `/api/schedule/is-open` | Verificar horario |
| POST | `/api/auth/login/customer` | Login con teléfono |
| POST | `/api/auth/register/customer` | Registro de cliente |
| POST | `/api/orders` | Crear pedido |
| GET | `/api/orders/customer/:id` | Historial de pedidos |

## 🛠️ Tecnologías

- **Vite** - Build tool y servidor de desarrollo
- **Three.js** - Visualización 3D de mesas
- **Service Worker** - Caché y modo offline
- **IndexedDB** - Almacenamiento de pedidos offline

## ❓ Solución de Problemas

### El menú no carga

- Verifica que el backend esté corriendo en `http://localhost:4000`
- Revisa la consola del navegador para errores de red

### La app no se puede instalar

- Asegúrate de acceder via `localhost` o `https://`
- Verifica que el `manifest.json` sea válido en DevTools

### Error de CORS

- El proxy de Vite debe estar configurado correctamente
- Reinicia el servidor de desarrollo

## 📄 Licencia

MIT License - Ver [LICENSE](../LICENSE) para más detalles.
