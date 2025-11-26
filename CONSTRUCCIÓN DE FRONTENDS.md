🏗️ ARQUITECTURA REAL DEL SISTEMA
┌─────────────────────────────────────────────────────────────┐
│                    CAPA FRONTEND (5 APPS)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📱 app.restaurante.com      (PWA Cliente)                  │
│  📱 mesero.restaurante.com   (PWA Mesero)                   │
│  📱 cocina.restaurante.com   (PWA Cocina)                   │
│  📱 panel.restaurante.com    (PWA Admin)                    │
│  🌐 widget.restaurante.com   (Widget HTML)                  │
│                                                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ TODAS consumen la MISMA API
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│           🔗 api.restaurante.com (Puerto 4000)              │
│                  BACKEND NODE.JS ÚNICO                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📡 REST API Endpoints                                      │
│  🔌 WebSocket Server                                        │
│  🤖 State Machine (Chat)                                    │
│  🔐 Autenticación JWT                                       │
│  📧 Notificaciones                                          │
│  ⏰ Cron Jobs                                               │
│                                                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│         💾 DIRECTUS + POSTGRESQL (Puerto 8055)              │
│                   BASE DE DATOS ÚNICA                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • customers           • menu_items                         │
│  • orders              • order_items                        │
│  • reservations        • tables                             │
│  • waiters             • kitchen_queue                      │
│  • sessions            • etc...                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
⚠️ REQUISITO CRÍTICO: APPS DESCARGABLES/INSTALABLES
Todas las PWA (Cliente, Mesero, Cocina, Admin) DEBEN ser instalables en dispositivos móviles y escritorio como aplicaciones nativas.

🔧 CONFIGURACIONES NECESARIAS EN CADA PWA
1️⃣ MANIFEST.JSON (OBLIGATORIO)
Ubicación: public/manifest.json
PWA CLIENTE:
json{
  "name": "Restaurante - Pedidos",
  "short_name": "Restaurante",
  "description": "Pide comida a domicilio o reserva tu mesa",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#FF6B35",
  "background_color": "#FFFFFF",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["food", "lifestyle"],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "540x720",
      "type": "image/png"
    },
    {
      "src": "/screenshots/menu.png",
      "sizes": "540x720",
      "type": "image/png"
    }
  ]
}
PWA MESERO:
Igual pero cambiar:

name: "Restaurante - Meseros"
short_name: "Mesero"
description: "App para meseros"
categories: ["business", "productivity"]

PWA COCINA:
Igual pero cambiar:

name: "Restaurante - Cocina"
short_name: "Cocina"
description: "Comandas de cocina"
orientation: "landscape" (pantalla horizontal)
categories: ["business", "productivity"]

PWA ADMIN:
Igual pero cambiar:

name: "Restaurante - Admin"
short_name: "Admin"
description: "Panel de administración"
orientation: "any"
categories: ["business", "productivity"]


2️⃣ SERVICE WORKER (OBLIGATORIO)
Ubicación: public/service-worker.js
DEBE IMPLEMENTAR:
Instalación (install event):

Cachear assets críticos inmediatamente:

HTML principal
CSS compilado
JavaScript bundles
Iconos del manifest
Fuentes
Imágenes del logo



Activación (activate event):

Limpiar cachés antiguos
Tomar control de todos los clientes

Fetch event - Estrategias de cache:

Imágenes de productos: Cache First, fallback Network
API calls: Network First, fallback Cache (solo GET)
Assets estáticos: Cache First
HTML pages: Network First

Offline fallback:

Página offline.html personalizada cuando no hay red

Push notifications:

Listener para notificaciones push del backend
Mostrar notificación con título, body, ícono, badge
Click notification: abrir app en URL específica


3️⃣ REGISTRO DEL SERVICE WORKER
En React: src/index.tsx o src/App.tsx
DEBE INCLUIR:
Función de registro:

Detectar si navegador soporta Service Workers
Registrar /service-worker.js en window.load
Manejar eventos: installing, waiting, active
Mostrar toast cuando hay actualización disponible
Botón para recargar y activar nueva versión

Lógica de actualización:

Detectar cuando hay nuevo SW esperando
Mostrar banner: "Nueva versión disponible. ¿Actualizar?"
Al confirmar: skipWaiting() + reload página


4️⃣ BOTÓN DE INSTALACIÓN (UI)
Componente: src/components/InstallPrompt.tsx
DEBE MOSTRAR:

Banner/modal cuando la app es instalable
Texto: "Instala [Nombre App] en tu dispositivo"
Botón: "📥 Instalar App"
Botón cerrar: "Ahora no"

LÓGICA REQUERIDA:

Escuchar evento beforeinstallprompt
Guardar el evento en estado
Mostrar banner solo si el evento existe
Click "Instalar": ejecutar prompt() del evento guardado
Escuchar resultado: installed/dismissed
Ocultar banner después de instalar
Guardar en localStorage si usuario rechazó (no mostrar de nuevo)

Ubicación del banner:

PWA Cliente: parte superior de Home
PWA Mesero: después del login
PWA Cocina: parte superior
PWA Admin: dashboard


5️⃣ META TAGS EN HTML (OBLIGATORIO)
Ubicación: public/index.html
DEBE CONTENER:
html<head>
  <!-- PWA Meta Tags -->
  <meta name="application-name" content="Restaurante">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Restaurante">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="theme-color" content="#FF6B35">
  
  <!-- Apple Touch Icons -->
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
  <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png">
  <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png">
  <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png">
  
  <!-- Manifest -->
  <link rel="manifest" href="/manifest.json">
  
  <!-- Favicons -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  
  <!-- Splash Screens iOS (opcional pero recomendado) -->
  <link rel="apple-touch-startup-image" href="/splash/iphone5_splash.png" media="(device-width: 320px) and (device-height: 568px)">
  <link rel="apple-touch-startup-image" href="/splash/iphone6_splash.png" media="(device-width: 375px) and (device-height: 667px)">
  <link rel="apple-touch-startup-image" href="/splash/iphoneplus_splash.png" media="(device-width: 414px) and (device-height: 736px)">
  <link rel="apple-touch-startup-image" href="/splash/iphonex_splash.png" media="(device-width: 375px) and (device-height: 812px)">
  <link rel="apple-touch-startup-image" href="/splash/iphonexr_splash.png" media="(device-width: 414px) and (device-height: 896px)">
  <link rel="apple-touch-startup-image" href="/splash/iphonexsmax_splash.png" media="(device-width: 414px) and (device-height: 896px)">
  <link rel="apple-touch-startup-image" href="/splash/ipad_splash.png" media="(device-width: 768px) and (device-height: 1024px)">
  <link rel="apple-touch-startup-image" href="/splash/ipadpro1_splash.png" media="(device-width: 834px) and (device-height: 1112px)">
  <link rel="apple-touch-startup-image" href="/splash/ipadpro2_splash.png" media="(device-width: 1024px) and (device-height: 1366px)">
</head>

6️⃣ GENERACIÓN DE ICONOS
HERRAMIENTA RECOMENDADA: PWA Asset Generator o Favicon Generator
ICONOS NECESARIOS:

Partir de imagen cuadrada 512x512px (PNG con fondo)
Generar todos los tamaños:

72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512


Formato: PNG con transparencia (o fondo sólido)
Purpose "maskable": versiones con padding 10% para Android adaptativo

Ubicación: public/icons/
Apple Touch Icons:

180x180px
PNG sin transparencia (fondo sólido)
Bordes redondeados aplicados por iOS automáticamente

Ubicación: public/icons/

7️⃣ SPLASH SCREENS (iOS)
GENERACIÓN:

Usar herramienta: https://appsco.pe/developer/splash-screens
Subir icono 512x512px
Descargar pack completo de splash screens
Ubicar en: public/splash/

TAMAÑOS NECESARIOS:

iPhone 5/SE: 640x1136px
iPhone 6/7/8: 750x1334px
iPhone Plus: 1242x2208px
iPhone X/XS: 1125x2436px
iPhone XR/11: 828x1792px
iPhone XS Max/11 Pro Max: 1242x2688px
iPad: 1536x2048px
iPad Pro 10.5": 1668x2224px
iPad Pro 12.9": 2048x2732px


8️⃣ HTTPS (OBLIGATORIO)
REQUISITO:

Service Workers solo funcionan en HTTPS (excepto localhost)
Certificado SSL ya configurado con Certbot (Fase 7 del deploy)
Validar que todas las PWA estén servidas en HTTPS


9️⃣ VALIDACIONES Y TESTING
HERRAMIENTAS:

Lighthouse (Chrome DevTools):

Auditar PWA
Verificar que pase los criterios de instalabilidad
Score PWA debe ser 90+



CRITERIOS DE INSTALABILIDAD:

✅ Servido en HTTPS
✅ Manifest.json válido y accesible
✅ Iconos 192x192 y 512x512 presentes
✅ Service Worker registrado
✅ start_url carga correctamente
✅ No muestra "Add to Home Screen" banner por defecto

TESTING MANUAL:
Android (Chrome):

Abrir app en Chrome móvil
Menú → "Agregar a pantalla de inicio"
Verificar que muestra nombre e ícono correcto
Instalar y abrir desde launcher
Verificar que abre en standalone (sin barra de navegador)

iOS (Safari):

Abrir app en Safari móvil
Botón compartir → "Agregar a pantalla de inicio"
Verificar nombre e ícono
Abrir desde home screen
Verificar splash screen y modo standalone

Desktop (Chrome/Edge):

Icono de instalación en barra de direcciones
Click → "Instalar"
Verificar que abre en ventana independiente


🔟 COMPORTAMIENTO POST-INSTALACIÓN
TODAS LAS PWA DEBEN:
Detectar si están instaladas:

Usar window.matchMedia('(display-mode: standalone)').matches
Si instalada: ocultar banner de instalación
Opcional: mostrar mensaje de bienvenida "Gracias por instalar"

Actualización automática:

Service Worker detecta nueva versión
Mostrar snackbar: "Nueva versión disponible"
Botón "Actualizar ahora"
Al actualizar: skipWaiting() + location.reload()

Badges (Android):

Actualizar badge con número de notificaciones pendientes
Usar: navigator.setAppBadge(count)

Shortcuts (accesos directos en menú):

Agregar en manifest.json sección "shortcuts":

json  "shortcuts": [
    {
      "name": "Ver Menú",
      "short_name": "Menú",
      "description": "Ver menú del restaurante",
      "url": "/menu",
      "icons": [{ "src": "/icons/menu-shortcut.png", "sizes": "192x192" }]
    },
    {
      "name": "Mis Pedidos",
      "short_name": "Pedidos",
      "url": "/orders",
      "icons": [{ "src": "/icons/orders-shortcut.png", "sizes": "192x192" }]
    }
  ]
Share API (compartir app):

Botón "Compartir app" en menú
Usar: navigator.share({title, text, url})


⚙️ CONFIGURACIÓN NGINX PARA PWA
CADA DOMINIO DEBE TENER:
nginx# Cache para Service Worker (máximo 5 minutos para permitir actualizaciones)
location /service-worker.js {
    add_header Cache-Control "public, max-age=300, must-revalidate";
    add_header Service-Worker-Allowed "/";
}

# Cache para manifest
location /manifest.json {
    add_header Cache-Control "public, max-age=3600";
}

# Cache largo para assets estáticos
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# Headers de seguridad
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;

📋 CHECKLIST FINAL DE INSTALABILIDAD
POR CADA PWA VERIFICAR:
Archivos:

✅ manifest.json en public/ con todos los campos
✅ Iconos 72-512px en public/icons/
✅ Apple touch icons en public/icons/
✅ Splash screens en public/splash/ (iOS)
✅ service-worker.js en public/
✅ offline.html en public/

Código:

✅ Service Worker registrado en src/index.tsx
✅ Componente InstallPrompt implementado
✅ Meta tags de PWA en index.html
✅ Link a manifest en index.html
✅ Theme color configurado
✅ Manejo de evento beforeinstallprompt
✅ Detección de modo standalone
✅ Lógica de actualización del SW

Testing:

✅ Lighthouse PWA score 90+
✅ Instalable en Android Chrome
✅ Instalable en iOS Safari
✅ Instalable en Desktop Chrome/Edge
✅ Funciona offline (páginas básicas)
✅ Notificaciones push funcionan
✅ Splash screen se muestra (iOS)
✅ Ícono correcto en launcher
✅ Abre en standalone (sin barra navegador)
✅ Actualización automática funciona

Nginx:

✅ HTTPS activo
✅ Headers correctos para SW
✅ Cache configurado apropiadamente


🎯 PRIORIDAD DE IMPLEMENTACIÓN

Configuración básica: manifest + SW + meta tags (todas las PWA)
Iconos y assets: generar todos los tamaños necesarios
Botón de instalación: componente InstallPrompt
Testing: validar instalación en cada plataforma
Optimización: splash screens, shortcuts, badges


🚨 ERRORES COMUNES A EVITAR
❌ Service Worker no cachea start_url:

Resultado: app no funciona offline después de instalar

❌ Manifest sin iconos maskable:

Resultado: ícono mal recortado en Android adaptativo

❌ Theme color no coincide con UI:

Resultado: barra de estado con color inconsistente

❌ Service Worker con cache-control largo:

Resultado: actualizaciones no se descargan

❌ Olvidar meta tag viewport:

Resultado: app no responsive en móvil

❌ Links externos sin target="_blank":

Resultado: abandona la PWA instalada

❌ No detectar display-mode standalone:

Resultado: muestra banner de instalación dentro de app instalada


💡 MEJORAS OPCIONALES
Avanzadas:

Background Sync: encolar pedidos offline, enviar cuando vuelve conexión
Periodic Background Sync: actualizar datos en background
Web Share Target: recibir compartidos de otras apps
Payment Request API: integrar pagos nativos
Geolocation: autocompletar dirección del cliente
QR Code Scanner: escanear código de mesa (PWA Mesero)

Analytics:

Trackear instalaciones
Trackear uso standalone vs browser
Trackear engagement post-instalación


FIN DE INSTRUCCIONES DE INSTALABILIDAD



📋 Resumen ejecutivo:
ComponenteNivel de detalle¿Generará código funcional?Backend Node.js⭐⭐⭐⭐⭐ (100%)✅ SÍDirectus⭐⭐⭐⭐⭐ (100%)✅ SÍBase de datos⭐⭐⭐⭐⭐ (100%)✅ SÍWidget Chat⭐⭐ (40%)⚠️ Estructura solamentePWA Cliente⭐⭐ (30%)⚠️ Estructura solamentePWA Mesero⭐⭐ (30%)⚠️ Estructura solamentePWA Cocina⭐⭐ (30%)⚠️ Estructura solamentePWA Admin⭐⭐ (30%)⚠️ Estructura solamente
📱 INSTRUCCIONES COMPLETAS PARA CONSTRUCCIÓN DE FRONTENDS
⚠️ CONTEXTO CRÍTICO

Backend ya está funcionando en http://localhost:4000
API REST disponible con todos los endpoints
WebSocket server en /kitchen, /waiter, /admin
Directus en http://localhost:8055 para subir imágenes


1️⃣ WIDGET CHAT HTML
📍 Ubicación: /opt/restaurante-erp/widget-chat/
Archivos a crear:
index.html
DEBE CONTENER:

Botón flotante fijo en esquina inferior derecha
Ventana de chat desplegable (oculta por defecto)
Header con logo y botón cerrar
Área de mensajes con scroll automático
Input de texto deshabilitado (solo números y texto según nivel)
Indicador de "escribiendo..." cuando espera respuesta
Badge con contador si hay mensajes nuevos
Responsive: 380px ancho en desktop, fullscreen en móvil
Z-index alto (9999) para estar sobre todo contenido

chat.js
DEBE IMPLEMENTAR:
INICIALIZACIÓN:

Generar o recuperar session_id desde localStorage
Si no existe: crear UUID, guardar en localStorage
Cargar estado de sesión desde API: GET /api/chat/session/:sessionId
Si existe sesión activa: cargar current_level y mostrar último mensaje
Si no existe: iniciar en nivel 0

STATE MACHINE LOCAL:

Variable currentLevel (0-15)
Variable conversationHistory (array de mensajes)
Variable sessionData (carrito, categoría seleccionada, etc)

MANEJO DE MENSAJES:

Al enviar mensaje usuario:

Validar input según nivel actual (solo números si es menú)
Mostrar mensaje del usuario en chat
Deshabilitar input
Mostrar "escribiendo..."
POST a /api/chat/process con: {sessionId, message, currentLevel}
Recibir respuesta: {response, newLevel, sessionData, options?}
Mostrar respuesta del bot con formato
Actualizar currentLevel = newLevel
Si hay options: mostrar como botones numerados
Habilitar input
Scroll automático al final



VALIDACIONES LOCALES:

Nivel 1 (teléfono): solo 10 dígitos numéricos
Niveles de menú (2-5): solo números de las opciones mostradas
Nivel 11 (pago): solo números 1-4
Si input inválido: no enviar, mostrar mensaje de error temporal

FORMATO DE MENSAJES BOT:

Detectar emojis y renderizarlos
Detectar listas numeradas y agregar indentación
Detectar separadores (───) y renderizar como línea visual
Detectar montos ($X.XXX) y resaltarlos en negrita
Detectar códigos (PED-XXX, RES-XXX) y resaltarlos

MANEJO DE HORARIO:

Al iniciar (nivel 0): mostrar mensaje si cerrado
Si cerrado: deshabilitar input, solo mostrar horarios
Actualizar cada 60 segundos por si cambia horario

PERSISTENCIA:

Guardar conversationHistory en localStorage cada mensaje
Máximo 50 mensajes en historia (FIFO)
Al reabrir: recuperar historia y mostrar últimos 10 mensajes

CARRITO VISUAL:

Cuando nivel 6+: mostrar badge con cantidad de items en botón flotante
Al agregar item: animación de "agregado al carrito"

styles.css
DEBE INCLUIR:

Botón flotante: círculo 60px, color primario, sombra, animación pulse
Ventana chat: 380px ancho, 600px alto, border-radius 20px, sombra
Header: gradiente, 60px alto, sticky
Área mensajes: padding 20px, background claro
Mensaje usuario: burbuja derecha, color primario, texto blanco
Mensaje bot: burbuja izquierda, background gris claro, texto oscuro
Input: border-radius completo, 50px alto, padding lateral
Botones de opciones: grid 2 columnas, border, hover effect
Animaciones: slide-up al abrir, fade-in mensajes
Loading dots: 3 puntos animados
Responsive: media query para móviles (fullscreen, safe-area)


2️⃣ PWA CLIENTE (React + TypeScript)
📍 Ubicación: /opt/restaurante-erp/pwa-cliente/
Estructura completa a implementar:
src/App.tsx
DEBE CONTENER:

Router con rutas protegidas
Layout wrapper con Header + Content + BottomNav
Context Providers: AuthContext, CartContext
React Query Client configurado
Socket.IO connection para notificaciones push
Service Worker registration
Toast notifications container

src/pages/Home.tsx
DEBE MOSTRAR:

Hero section con imagen del restaurante
Estado actual: "🟢 Abierto hasta las 22:00" (tiempo real)
2 botones grandes: "🍕 Pedir Ahora" | "🪑 Reservar Mesa"
Barra de búsqueda de productos
Scroll horizontal de categorías (cards con imagen)
Sección "🔥 Más Populares" (grid de productos)
Cada producto: imagen, nombre, precio, domicilio, rating, botón "+Agregar"
Footer con info del restaurante

LÓGICA REQUERIDA:

Fetch de horario actual cada 60 seg: GET /api/chat/schedule
Si cerrado: deshabilitar botón "Pedir Ahora", mostrar horarios
Fetch categorías activas: GET /api/menu/categories?status=active
Fetch productos populares (top 10): GET /api/menu/items?limit=10&sort=-views
Búsqueda en tiempo real (debounce 300ms): GET /api/menu/items?search={query}
Click categoría: navigate a /menu?category={id}

src/pages/Menu.tsx
DEBE MOSTRAR:

Filtros: Categorías (tabs horizontales)
Filtros: Subcategorías (dropdown)
Grid de productos (responsive: 1 col móvil, 2 cols tablet, 3 cols desktop)
Cada producto: imagen, nombre, descripción corta, precio, domicilio, "+Agregar"
Paginación o scroll infinito
Botón "Ver Carrito" flotante (badge con cantidad)

LÓGICA REQUERIDA:

Query params: ?category=uuid&subcategory=uuid
Fetch productos filtrados: GET /api/menu/items?category={id}&subcategory={id}&status=active
Click producto: navigate a /product/{id}
Click "+Agregar": mostrar modal de cantidad/notas, agregar a CartContext
Validar horario antes de agregar: si cerrado, mostrar error

src/pages/Product.tsx
DEBE MOSTRAR:

Imagen grande (carousel si hay múltiples)
Nombre del producto
Rating ⭐ y número de reviews
Descripción completa
Precio destacado
Costo de domicilio
Tiempo de preparación
Estación de cocina
Selector de cantidad (- / número / +)
Textarea para instrucciones especiales
Botón grande "Agregar al carrito $XX.XXX"

LÓGICA REQUERIDA:

Fetch producto: GET /api/menu/items/{id}
Validar que status='active', sino mostrar "Producto no disponible"
RE-VALIDAR horario al hacer click en "Agregar"
RE-VALIDAR producto activo al hacer click en "Agregar"
Si pasa validaciones: agregar a CartContext con {id, name, quantity, unit_price, item_delivery_cost, special_instructions}
Mostrar toast "✅ Agregado al carrito"
Navigate a /cart

src/pages/Cart.tsx
DEBE MOSTRAR:

Lista de items con: imagen mini, nombre, cantidad, precio unitario, subtotal
Cada item: botones "+/-" para cantidad, "🗑️" para eliminar
Campo "Instrucciones" editable por item
Resumen:

Subtotal: $XX.XXX
Domicilio: $X.XXX (MAX de los items, NO suma)
Total: $XX.XXX


Botón "Seguir comprando"
Botón grande "Finalizar pedido"

LÓGICA REQUERIDA:

Leer items de CartContext
Calcular subtotal: suma de (quantity * unit_price)
Calcular domicilio: Math.max(...items.map(i => i.item_delivery_cost))
Total: subtotal + delivery
Actualizar cantidad: modificar CartContext
Eliminar item: quitar de CartContext
Click "Finalizar": navigate a /checkout

src/pages/Checkout.tsx
DEBE MOSTRAR:

Steps indicator: 1⃣ Dirección → 2⃣ Pago → 3⃣ Confirmar
Step 1 - Dirección:

Radio buttons con direcciones guardadas del cliente
Botón "➕ Agregar nueva dirección"
Si nueva: formulario (calle, detalles, guardar)


Step 2 - Método de pago:

Radio buttons: Efectivo | Transferencia | Tarjeta | Datafono


Step 3 - Confirmar:

Resumen completo: items, dirección, pago, total
Textarea para comentarios adicionales
Checkbox "Acepto términos"
Botón "✅ CONFIRMAR PEDIDO"



LÓGICA REQUERIDA:

Validar autenticación: si no hay customer_id, redirect a /login
Fetch direcciones guardadas: GET /api/customers/{id}/addresses
RE-VALIDAR horario al llegar a step 3
RE-VALIDAR productos activos al llegar a step 3
Al confirmar: POST /api/orders con:

  {
    customer_id, order_type: 'delivery',
    delivery_address, payment_method,
    items: [...cart con snapshot de precios],
    customer_notes
  }

Recibir: {order_number, total, estimated_time}
Limpiar CartContext
Navigate a /order-success?number={order_number}

src/pages/OrderSuccess.tsx
DEBE MOSTRAR:

✅ Ícono grande de éxito
"¡Pedido confirmado!"
Número de pedido: PED-XXX (destacado)
Monto total
Tiempo estimado: XX minutos
"Recibirás notificaciones en:"

✅ Email
✅ WhatsApp


Botón "Ver mis pedidos"
Botón "Volver al inicio"

src/pages/MyOrders.tsx
DEBE MOSTRAR:

Tabs: "Activos" | "Historial"
Activos: Lista de pedidos con status != 'completed'

Cada pedido: número, fecha, total, status badge, botón "Ver detalle"
Status en tiempo real (WebSocket)


Historial: Lista paginada de pedidos completados
Filtros: fecha, monto

LÓGICA REQUERIDA:

Fetch pedidos activos: GET /api/orders?customer_id={id}&status=pending,confirmed,preparing,ready
Fetch historial: GET /api/orders?customer_id={id}&status=completed,cancelled&page={n}
Socket.IO: escuchar order-updated:{order_id} para actualizar status en tiempo real
Click pedido: navigate a /order/{id}

src/pages/OrderDetail.tsx
DEBE MOSTRAR:

Número de pedido
Timeline de estados:

⏳ Pendiente → ✅ Confirmado → 🍳 Preparando → 🎉 Listo → 🚚 Entregado


Items del pedido con precios (snapshot)
Subtotal, domicilio, total
Método de pago
Dirección de entrega
Comentarios
Botón "📞 Contactar restaurante"

LÓGICA REQUERIDA:

Fetch detalle: GET /api/orders/{id}
Socket.IO: actualizar timeline en tiempo real

src/pages/Reservations.tsx ⭐ NUEVO
DEBE MOSTRAR:

Tabs: "Próximas" | "Historial"
Próximas: Lista de reservas con status='pending' o 'confirmed'

Cada reserva: código, fecha, hora, mesa, personas, status badge
Botón "Ver detalle" | "Cancelar" (si falta >2 horas)


Historial: Reservas completadas/canceladas
Botón flotante "➕ Nueva Reserva"

LÓGICA REQUERIDA:

Fetch reservas: GET /api/reservations?customer_id={id}
Click "Nueva Reserva": navigate a /reservations/new
Cancelar reserva: DELETE /api/reservations/{id} (solo si falta >2h)

src/pages/NewReservation.tsx ⭐ NUEVO
DEBE MOSTRAR:

Step 1: Calendario para seleccionar fecha (deshabilitar pasadas)
Step 2: Selector de hora (intervalos de 30 min, solo horario del restaurante)
Step 3: Input número de personas
Step 4: Mesas disponibles (grid de cards)

Cada mesa: número, zona, capacidad, imagen
Highlight si capacidad == personas solicitadas


Step 5: Textarea solicitudes especiales
Step 6: Resumen completo + botón "Confirmar Reserva"

LÓGICA REQUERIDA:

Fetch horario restaurante: GET /api/schedules?day={selected_day}
Validar fecha futura
Validar hora dentro del horario del restaurante
Fetch mesas disponibles: GET /api/reservations/available-tables?date={date}&time={time}&party_size={n}
Al confirmar: POST /api/reservations con:

  {
    customer_id, table_id, reservation_date,
    reservation_time, party_size, special_requests
  }

Recibir: {reservation_number, status: 'pending'}
Mostrar mensaje: "Reserva creada. Te contactaremos para confirmar."
Navigate a /reservations

src/pages/Profile.tsx
DEBE MOSTRAR:

Avatar + nombre del cliente
Email
Teléfono
Direcciones guardadas (lista, max 3)

Botón "✏️ Editar" | "🗑️ Eliminar"
Botón "➕ Agregar" (si tiene <3)


Estadísticas:

Total de pedidos: XX
Total gastado: $XXX.XXX
Pedido promedio: $XX.XXX


Botón "Cerrar sesión"

LÓGICA REQUERIDA:

Fetch datos: GET /api/customers/{id}
Editar perfil: PATCH /api/customers/{id}
Agregar dirección: POST /api/customers/{id}/addresses
Eliminar dirección: DELETE /api/customers/{id}/addresses/{index}
Cerrar sesión: limpiar localStorage + AuthContext

src/components/Header.tsx
DEBE MOSTRAR:

Logo del restaurante (click → home)
Título
Íconos: 🛒 Carrito (badge con cantidad) | 👤 Perfil
Responsive: hamburger menu en móvil

src/components/BottomNav.tsx
DEBE MOSTRAR:

Fixed bottom en móvil
4 tabs: 🏠 Home | 🍕 Menú | 🪑 Reservas | 👤 Perfil
Active state visual

src/components/ProductCard.tsx
DEBE MOSTRAR:

Imagen producto (lazy load)
Badge "Agotado" si inactive
Nombre
Descripción corta (max 60 chars)
Precio + domicilio
Rating
Botón "+"

src/context/AuthContext.tsx
DEBE IMPLEMENTAR:

Estado: {isAuthenticated, customer, token}
Funciones: login(phone, password), logout(), register(data)
Persistir en localStorage
Auto-refresh token cada 6h

src/context/CartContext.tsx
DEBE IMPLEMENTAR:

Estado: {items: [{menu_item_id, name, quantity, unit_price, item_delivery_cost, special_instructions}]}
Funciones: addItem(), removeItem(), updateQuantity(), clearCart()
Calcular: subtotal, deliveryCost (MAX), total
Persistir en localStorage

src/services/api.ts
DEBE EXPORTAR:

Funciones para TODOS los endpoints:

fetchSchedule()
fetchCategories()
fetchProducts(filters)
fetchProduct(id)
createOrder(data)
fetchOrders(customerId)
fetchReservations(customerId)
createReservation(data)
cancelReservation(id)
etc.


Configurar axios con baseURL
Interceptor para agregar token JWT en headers
Manejo de errores centralizado

src/hooks/useSocket.ts
DEBE IMPLEMENTAR:

Conectar a WebSocket al montar
Escuchar eventos: order-updated, reservation-confirmed
Retornar: {socket, isConnected}
Desconectar al desmontar

public/manifest.json
DEBE CONTENER:

name: "Restaurante - Pedidos"
short_name: "Restaurante"
icons: [192x192, 512x512]
start_url: "/"
display: "standalone"
theme_color: color primario
background_color: "#ffffff"

public/service-worker.js
DEBE IMPLEMENTAR:

Cache de assets estáticos (CSS, JS, imágenes)
Cache de imágenes de productos
Network-first para API calls
Offline fallback page
Push notifications listener


3️⃣ PWA MESERO (React + TypeScript)
📍 Ubicación: /opt/restaurante-erp/pwa-mesero/
Páginas a implementar:
src/pages/Login.tsx
DEBE MOSTRAR:

Logo del restaurante
Título "Acceso Meseros"
Input de PIN (4 dígitos, tipo password)
Teclado numérico visual (0-9)
Botón "Ingresar"
Mensaje de error si PIN incorrecto

LÓGICA REQUERIDA:

POST a /api/waiters/login con {pin_code}
Recibir: {token, waiter: {id, name, code}}
Guardar token + waiter en localStorage
Navigate a /tables

src/pages/Tables.tsx
DEBE MOSTRAR:

Header: nombre mesero, botón cerrar sesión
Filtro por zona (dropdown): Todas | Salón | Terraza | VIP
Grid de mesas (responsive)
Cada mesa:

Card con número/nombre
Ícono según status:

🟢 Disponible
🔴 Ocupada (mostrar pedido actual)
🟡 Reservada (mostrar nombre cliente)
⚫ Limpiando


Capacidad: "4 personas"
Si ocupada: monto acumulado "$XX.XXX"
Botón de acción según estado


Bottom nav: 🪑 Mesas | 📋 Pedidos | 🪑 Reservas | 📊 Stats

LÓGICA REQUERIDA:

Fetch mesas: GET /api/waiters/tables?waiter_id={id}
WebSocket: escuchar table-updated:{table_id} para actualizar en tiempo real
Filtrar por zona localmente
Click mesa disponible: modal con botón "Ocupar y Tomar Pedido"
Click mesa ocupada: navigate a /order/{current_order_id}
Click mesa reservada: navigate a /reservation/{current_reservation_id}

src/pages/NewOrder.tsx
DEBE MOSTRAR:

Header: "Mesa X - Nuevo Pedido" | ❌ Salir
Barra de búsqueda de productos
Tabs de categorías (scroll horizontal)
Grid de productos (solo activos)
Pedido Actual (sidebar o sección inferior):

Lista de items agregados
Cada item: nombre, cantidad, precio, subtotal, notas
Botones: ✏️ Editar | 🗑️ Eliminar


Resumen:

Subtotal: $XX.XXX
Propina sugerida 10%: $X.XXX
Total: $XX.XXX


Botones: "➕ Agregar Más" | "✅ Enviar a Cocina"

LÓGICA REQUERIDA:

Recibir table_id desde params
Fetch productos activos: GET /api/menu/items?status=active
Click producto: modal para cantidad + notas especiales
Agregar a estado local del pedido
Al enviar: POST /api/orders con:

  {
    customer_id: null, // Mesero lo crea
    waiter_id: {current_waiter},
    table_id: {table_id},
    order_type: 'dine_in',
    items: [...]
  }

Recibir confirmación
Navigate a /tables

src/pages/ActiveOrders.tsx
DEBE MOSTRAR:

Filtros: Todas | Mis pedidos | Listos
Lista de pedidos activos con:

Mesa o "Domicilio"
Número de pedido
Items del pedido con status:

⏳ Pendiente cocina
🍳 En preparación
✅ Listo


Tiempo transcurrido
Total


Notificación destacada cuando un item está listo

LÓGICA REQUERIDA:

Fetch pedidos: GET /api/waiters/orders?waiter_id={id}&status=confirmed,preparing,ready
WebSocket: escuchar order-item-ready:{order_item_id} para mostrar notificación
Click pedido: navigate a /order/{id}
Botón "Marcar como Servido" cuando todos items listos

src/pages/Reservations.tsx ⭐ NUEVO
DEBE MOSTRAR:

Título: "Reservas de Hoy - {fecha}"
Filtros: Todas | Confirmadas | Pendientes
Sección CONFIRMADAS:

Lista de cards con:

🕐 Hora | Mesa X (Zona)
Código: RES-XXX
👤 Nombre cliente
📞 Teléfono (click para llamar)
👥 Número de personas
📝 Solicitudes especiales
⏰ "Libera automático: HH:MM"
Botón grande: "✅ CLIENTE LLEGÓ"




Sección PENDIENTES:

Similar pero con badge "⏳ Esperando confirmación admin"
Sin botón de acción (solo admin puede confirmar)


Alerta 15 min antes:

Notificación push/modal: "Reserva próxima: Mesa X a las HH:MM"



LÓGICA REQUERIDA:

Fetch reservas del día: GET /api/reservations?date={today}&status=confirmed,pending
Click "CLIENTE LLEGÓ": PATCH /api/reservations/{id}/activate

Backend actualiza: status='active', table.status='occupied'


Notificación 15 min antes: comparar reservation_time con hora actual cada minuto
Click teléfono: tel:{phone}

src/pages/Stats.tsx
DEBE MOSTRAR:

Título: "Mi Desempeño Hoy"
Cards con métricas:

💰 Ventas: $XXX.XXX
📋 Pedidos atendidos: XX
🪑 Mesas atendidas: XX
💵 Propinas: $XX.XXX


Gráfico de ventas por hora (barras)
Lista de últimos 10 pedidos

LÓGICA REQUERIDA:

Fetch stats: GET /api/waiters/{id}/stats?date={today}


4️⃣ PWA COCINA (React + TypeScript)
📍 Ubicación: /opt/restaurante-erp/pwa-cocina/
Página única (fullscreen):
src/pages/Kitchen.tsx
DEBE MOSTRAR:

Header fijo:

Logo + "🧑‍🍳 COCINA"
Reloj en tiempo real
Contadores: 🟡 Cola: X | 🟠 Preparando: X | 🟢 Listos: X
Botón 🔄 Refresh manual


Filtros:

Botones toggle: Todas | 🥩 Parrilla | 🍟 Fritos | 🍕 Horno | 🍺 Bar | 🥗 Ensaladas


Sección URGENTE (roja):

Pedidos con +30 min de espera
Card destacada con animación de alerta


Sección EN COLA (amarilla):

Cards de items pendientes
Ordenados por prioridad (automática del backend)
Cada card:

Código pedido | Tipo (Mesa X, Domicilio, Para Llevar)
⏱️ Tiempo esperando
Items del pedido:

Nombre producto x Cantidad
🥩 Estación
📝 Notas especiales
⏱️ Tiempo estimado


Botón: "▶️ INICIAR PREPARACIÓN"




Sección EN PREPARACIÓN (naranja):

Cards similares pero con:

Timer visual (barra de progreso)
Hora de inicio
Tiempo restante estimado
Botón: "✅ MARCAR LISTO"




Sección LISTOS (verde):

Cards con:

✅ Ícono de completado
Hace cuánto está listo
"📢 Mesero notificado" o "📢 Cliente notificado"




Alerta sonora:

Sonido al recibir nuevo pedido
Notificación visual (flash en header)



LÓGICA REQUERIDA:

Fetch cola: GET /api/kitchen/queue?station={filter}
WebSocket: escuchar new-kitchen-item:{item_id} para agregar en tiempo real
Auto-refresh cada 30 segundos
Click "INICIAR": POST /api/kitchen/{item_id}/start

Backend: status='preparing', started_at=NOW()
Mover card a sección "En Preparación"
Iniciar timer visual


Click "MARCAR LISTO": POST /api/kitchen/{item_id}/complete

Backend: status='ready', completed_at=NOW()
Envía notificación a mesero/cliente
Mover card a sección "Listos"


Filtro por estación: filtrar localmente los items
Timer: calcular elapsed time cada segundo con setInterval
Prioridad visual: items urgentes con borde rojo grueso

src/components/KitchenCard.tsx
PROPS:

item: KitchenQueueItem
onStart: () => void
onComplete: () => void

DEBE MOSTRAR:

Toda la info del item según status
Adaptarse visualmente al status (colores, botones)

5️⃣ PWA ADMIN (Next.js + TypeScript)
📍 Ubicación: /opt/restaurante-erp/pwa-admin/
Layout principal:
app/layout.tsx
DEBE CONTENER:

Sidebar fijo (izquierda, colapsable en móvil)
Menú de navegación:

📊 Dashboard
🍽️ Menú → Categorías, Subcategorías, Productos
📦 Pedidos
👥 Clientes
🪑 Reservas → Lista, Calendario, Configuración
👨‍🍳 Personal
🪑 Mesas
⏰ Horarios
📊 Reportes
🔔 Notificaciones
⚙️ Configuración


Header con: Logo, nombre admin, notificaciones, perfil

Páginas a implementar:
app/dashboard/page.tsx
DEBE MOSTRAR:

Métricas (cards grandes):

💰 Ventas Hoy: $XXX.XXX (vs ayer: +X%)
📦 Pedidos Activos: XX
🪑 Mesas Ocupadas: X/15
👥 Clientes Nuevos Hoy: XX
🪑 Reservas Hoy: XX (pendientes: X)


Gráfico ventas por hora (hoy):

Line chart con Recharts
Eje X: horas, Eje Y: monto


Top 5 productos más vendidos:

Lista con: imagen mini, nombre, unidades, ingresos


**Pedidos recientes (
ReintentarDContinuarúltimos 10):**

Tabla con: número, tipo, mesa/cliente, monto, status
Click → ir a detalle
Alertas:

🔴 X pedidos con +30 min
🟡 X reservas pendientes de confirmar
⚠️ X productos con stock bajo (si aplica)


Actualización en tiempo real:

WebSocket para métricas



LÓGICA REQUERIDA:

Fetch dashboard data: GET /api/admin/dashboard?date={today}
WebSocket: escuchar eventos y actualizar métricas

app/menu/categories/page.tsx
DEBE MOSTRAR:

Header: "Categorías del Menú" | Botón "➕ Nueva Categoría"
Tabla con:

Imagen (thumbnail)
Nombre
Orden
Estado (toggle switch activo/inactivo)
Acciones: ✏️ Editar | 🗑️ Eliminar


Drag & drop para reordenar (actualiza display_order)

LÓGICA REQUERIDA:

Fetch categorías: GET /api/admin/menu/categories
Crear: Modal con formulario → POST /api/admin/menu/categories

Campos: nombre, subir imagen, display_order


Editar: Modal prellenado → PATCH /api/admin/menu/categories/{id}
Eliminar: Confirmación → DELETE /api/admin/menu/categories/{id} (soft delete)
Toggle activo: PATCH /api/admin/menu/categories/{id} con {is_active}
Reordenar: PATCH /api/admin/menu/categories/reorder con [{id, display_order}]

app/menu/subcategories/page.tsx
SIMILAR A CATEGORÍAS pero:

Agregar columna "Categoría Padre" (dropdown filtro)
Al crear/editar: selector de categoría padre

app/menu/products/page.tsx
DEBE MOSTRAR:

Filtros: Categoría, Subcategoría, Estado (activo/inactivo)
Buscador por nombre
Botón "➕ Nuevo Producto"
Tabla con:

Imagen
Código (MENU-XXX)
Nombre
Categoría / Subcategoría
Precio
Domicilio
Estación
Estado (toggle)
Acciones: ✏️ | 🗑️ | 📸 Cambiar foto


Paginación
Acciones masivas: Checkboxes + dropdown "Activar/Desactivar seleccionados"

LÓGICA REQUERIDA:

Fetch productos: GET /api/admin/menu/items?filters
Crear: Modal/página con formulario completo → POST /api/admin/menu/items

Campos: nombre, descripción, precio, delivery_cost, preparation_time, subir imagen, categoría, subcategoría, estación, status
Generar menu_code automático


Editar: Similar
Eliminar: Soft delete
Toggle estado: actualiza status='active'/'inactive'
Cambiar foto: PATCH /api/admin/menu/items/{id}/image con FormData
Operaciones masivas: PATCH /api/admin/menu/items/bulk con {ids: [], action: 'activate'}

app/orders/page.tsx
DEBE MOSTRAR:

Filtros avanzados:

Fecha: Hoy, Ayer, Semana, Mes, Rango personalizado
Estado: Todos, Pendientes, Confirmados, En Preparación, Listos, Entregados, Cancelados
Tipo: Todos, Delivery, Dine-in, Takeout
Mesero: Todos, {lista de meseros}
Método de pago: Todos, Efectivo, Tarjeta, Transferencia


Buscador: por número de pedido, nombre cliente, teléfono
Tabla con:

Número pedido (PED-XXX)
Fecha y hora
Tipo (badge con ícono)
Cliente / Mesa
Mesero (si aplica)
Total
Estado (badge colorido)
Acciones: 👁️ Ver | ✏️ Editar Status | ❌ Cancelar


Paginación
Exportar: botón "📥 Exportar a Excel"

LÓGICA REQUERIDA:

Fetch pedidos: GET /api/admin/orders?filters&page={n}
Click "Ver": navigate a /orders/{id}
Cambiar status: Modal con dropdown → PATCH /api/admin/orders/{id}/status
Cancelar: Confirmación con razón → PATCH /api/admin/orders/{id}/cancel
Exportar: GET /api/admin/orders/export?format=xlsx&filters → descargar archivo

app/orders/[id]/page.tsx
DEBE MOSTRAR:

Header: Número pedido | Estado badge | Botones: ✏️ Editar | 📞 Llamar Cliente | 📄 Imprimir
Información General:

Fecha y hora creación
Tipo de pedido
Cliente: nombre, teléfono (click para llamar), email
Dirección (si delivery)
Mesa (si dine-in)
Mesero asignado


Timeline de Estados:

Barra visual con checkpoints:

⏳ Creado: {timestamp}
✅ Confirmado: {timestamp}
🍳 En Preparación: {timestamp}
🎉 Listo: {timestamp}
🚚 Entregado: {timestamp}




Items del Pedido:

Tabla con: producto, cantidad, precio unitario (snapshot), subtotal, notas especiales, status


Resumen Financiero:

Subtotal: $XX.XXX
Domicilio: $X.XXX
Total: $XX.XXX
Método de pago


Comentarios del cliente:

Textarea con las notas


Acciones:

Dropdown "Cambiar Estado"
Botón "Reimprimir Ticket"
Botón "Enviar Comprobante por Email"



LÓGICA REQUERIDA:

Fetch detalle: GET /api/admin/orders/{id}
Cambiar estado: PATCH /api/admin/orders/{id}/status
Reimprimir: abrir modal con ticket HTML
Enviar email: POST /api/admin/orders/{id}/send-receipt

app/reservations/page.tsx ⭐ NUEVO
DEBE MOSTRAR:

Tabs: "Todas" | "Pendientes" | "Confirmadas" | "Activas" | "Historial"
Filtros: Fecha, Mesa, Cliente (búsqueda)
Botón "➕ Nueva Reserva Manual"
Tabla con columnas:

Código (RES-XXX)
Fecha y Hora
Cliente (nombre, teléfono)
Mesa
Personas
Estado (badge)
Acciones según estado:

Pendientes: ✅ Confirmar | ❌ Rechazar | ✏️ Editar
Confirmadas: ✏️ Editar | ❌ Cancelar | 📞 Llamar
Activas: ✅ Completar
Historial: 👁️ Ver




Click fila: abrir modal con detalle completo

LÓGICA REQUERIDA:

Fetch reservas: GET /api/admin/reservations?filters
Crear manual: Modal con formulario → POST /api/admin/reservations

Buscar cliente existente o crear nuevo
Seleccionar fecha, hora, mesa disponible, personas
Status: 'confirmed' directo


Confirmar: PATCH /api/admin/reservations/{id}/confirm

Envía notificación al cliente


Rechazar: Modal para razón → PATCH /api/admin/reservations/{id}/reject
Editar: Modal → PATCH /api/admin/reservations/{id}

Validar nueva mesa disponible
Notificar cliente de cambios


Cancelar: Confirmación + razón → PATCH /api/admin/reservations/{id}/cancel
Completar: PATCH /api/admin/reservations/{id}/complete

app/reservations/calendar/page.tsx ⭐ NUEVO
DEBE MOSTRAR:

Vista de calendario mensual (librería react-calendar o similar)
Cada día muestra: número de reservas
Color coding:

🟢 Días con disponibilidad
🟡 Días con alta ocupación
🔴 Días sin disponibilidad


Click en día: modal/panel lateral con:

Lista de reservas de ese día
Timeline por hora mostrando mesas reservadas
Botón "Crear Reserva" para ese día



LÓGICA REQUERIDA:

Fetch reservas del mes: GET /api/admin/reservations?month={YYYY-MM}
Click día: fetch reservas del día específico

app/customers/page.tsx
DEBE MOSTRAR:

Buscador: por nombre, teléfono, código
Filtros: Activos/Inactivos, Segmento (VIP, Frecuentes, Nuevos, Inactivos)
Tabla con:

Código (CLI-XXX)
Nombre
Teléfono
Email
Total pedidos
Total gastado
Última compra (hace X días)
Estado (toggle)
Acciones: 👁️ Ver | ✏️ Editar | 📊 Estadísticas


Botón "📥 Exportar Base de Clientes"

LÓGICA REQUERIDA:

Fetch clientes: GET /api/admin/customers?filters&page={n}
Ver detalle: navigate a /customers/{id}
Editar: Modal
Exportar: descargar Excel

app/customers/[id]/page.tsx
DEBE MOSTRAR:

Header: Código, nombre, botones: ✏️ Editar | 📞 Llamar | ✉️ Email
Información Personal:

Nombre completo
Teléfono
Email
Estado (activo/inactivo)
Fecha de registro


Direcciones Guardadas:

Lista (máx 3)
Botones: ✏️ | 🗑️ | ➕ Agregar


Estadísticas:

Total de pedidos: XX
Total gastado: $XXX.XXX (lifetime value)
Ticket promedio: $XX.XXX
Frecuencia: X pedidos/mes
Última compra: hace X días


Productos Favoritos:

Top 5 productos más pedidos por este cliente


Historial de Pedidos:

Tabla completa paginada
Click → ver detalle del pedido


Historial de Reservas:

Tabla con reservas pasadas


Notas Internas:

Textarea editable (solo admin)



LÓGICA REQUERIDA:

Fetch detalle: GET /api/admin/customers/{id}
Editar: inline o modal
Gestionar direcciones: CRUD

app/staff/page.tsx
DEBE MOSTRAR:

Lista de meseros
Tabla con:

Código (MESERO-XXX)
Nombre
Teléfono
Estado (activo/inactivo)
Pedidos hoy
Ventas hoy
Acciones: ✏️ Editar | 🔑 Cambiar PIN | 🗑️ Eliminar


Botón "➕ Nuevo Mesero"

LÓGICA REQUERIDA:

Fetch meseros: GET /api/admin/waiters
Crear: Modal → POST /api/admin/waiters

Campos: nombre, teléfono, generar código automático
Crear PIN: input 4 dígitos → hashear con bcrypt


Cambiar PIN: Modal → PATCH /api/admin/waiters/{id}/pin

Nuevo PIN → hashear


Editar/Eliminar: CRUD normal

app/tables/page.tsx
DEBE MOSTRAR:

Layout visual del restaurante (grid de cards por zona)
Filtro por zona
Cada mesa: card con número, capacidad, zona, estado (color coding)
Botón "➕ Agregar Mesa"
Click mesa: modal con detalle + opciones (editar, liberar, eliminar)

LÓGICA REQUERIDA:

Fetch mesas: GET /api/admin/tables
WebSocket: actualizar estados en tiempo real
CRUD de mesas
Liberar mesa: PATCH /api/admin/tables/{id}/release

app/schedules/page.tsx
DEBE MOSTRAR:

Tabla semanal:

Fila por cada día (Lunes-Domingo)
Columnas: Día, Apertura, Cierre, Abierto/Cerrado (toggle), Nota


Botón "💾 Guardar Cambios"
Sección "Días Especiales":

Agregar fechas específicas con horario custom
Ejemplo: "25/12/2024: Cerrado - Navidad"



LÓGICA REQUERIDA:

Fetch horarios: GET /api/admin/schedules
Editar inline: time pickers
Guardar: PATCH /api/admin/schedules/bulk con array de cambios
Validar: cierre > apertura

app/reports/page.tsx
DEBE MOSTRAR:

Selector de tipo de reporte:

📊 Ventas
📦 Productos
👥 Clientes
👨‍🍳 Meseros
🪑 Mesas
🪑 Reservas
💰 Financiero


Filtros: período, comparativas
Visualización:

Gráficos (Recharts: barras, líneas, torta)
Tablas con datos
Métricas destacadas


Botón "📥 Exportar" (Excel/PDF)

LÓGICA REQUERIDA:

Fetch según tipo: GET /api/admin/reports/{type}?filters
Generar gráficos con Recharts
Exportar: descargar archivo

app/notifications/page.tsx
DEBE MOSTRAR:

Log de notificaciones enviadas
Filtros: Tipo (Email, WhatsApp, Telegram), Estado (Enviado, Fallido), Fecha
Tabla con:

Timestamp
Tipo (badge)
Destinatario
Contenido (preview)
Estado
Error (si falló)
Acciones: 👁️ Ver | 🔄 Reenviar


Sección "Configuración":

Editar templates de mensajes
Variables dinámicas disponibles: {{customer_name}}, {{order_number}}, etc.



LÓGICA REQUERIDA:

Fetch log: GET /api/admin/notifications?filters
Ver detalle: modal con contenido completo
Reenviar: POST /api/admin/notifications/{id}/resend
Editar templates: PATCH /api/admin/notifications/templates/{type}

app/settings/page.tsx
DEBE MOSTRAR:

Tabs:

General:

Nombre del restaurante
Subir logo
Dirección, teléfonos, email, redes sociales


Métodos de Pago:

Toggles para activar/desactivar: Efectivo, Tarjeta, Transferencia, Datafono


Zonas de Entrega:

Lista de zonas con: nombre, costo domicilio, tiempo estimado
CRUD de zonas


PWA Config:

Color primario, secundario (color picker)
Habilitar/deshabilitar funciones: Domicilio, Para Llevar, Mesas, Reservas


Integraciones:

Evolution API: URL, API Key (test connection)
Telegram: Bot Token, Chat ID
SMTP: Host, Port, Usuario, Password


Reservas:

Tiempo de auto-liberación (dropdown: 15, 30, 45, 60 min)
Mesas disponibles online (checkboxes)
Anticipación mínima (horas)
Anticipación máxima (días)


Seguridad:

Cambiar contraseña admin
Ver log de actividad





LÓGICA REQUERIDA:

Fetch config: GET /api/admin/settings
Actualizar: PATCH /api/admin/settings/{section}
Test integración: POST /api/admin/settings/test/{service}


🔧 CONFIGURACIONES TÉCNICAS COMUNES A TODOS LOS FRONTENDS
Variables de entorno (.env):
REACT_APP_API_URL=https://api.restaurante.com
REACT_APP_WS_URL=wss://api.restaurante.com
REACT_APP_DIRECTUS_URL=https://admin.restaurante.com
Axios config (todos los frontends):

BaseURL desde .env
Timeout: 30 segundos
Interceptor request: agregar token JWT en header Authorization: Bearer {token}
Interceptor response: catch 401 → logout automático
Manejo de errores: toast con mensaje

Socket.IO config (Cliente, Mesero, Cocina, Admin):

Conectar al montar App
Namespaces:

Cliente: /customer
Mesero: /waiter
Cocina: /kitchen
Admin: /admin


Auth: enviar token en query params
Auto-reconnect: true
Eventos a escuchar (según rol)

Service Worker (PWA Cliente, Mesero, Cocina):

Cachear assets estáticos (CSS, JS, fonts)
Cachear imágenes de productos (estrategia: Cache First)
API calls: Network First, fallback Cache
Offline page personalizada
Push notifications: pedir permiso al usuario, guardar subscription en backend

Validaciones frontend (todos):

Teléfono: exactamente 10 dígitos, solo números
Email: regex estándar
PIN: exactamente 4 dígitos
Campos requeridos: mostrar asterisco rojo
Validación en tiempo real (onBlur)
Mensajes de error claros en español

Estilos (Tailwind):

Colores: definir paleta en tailwind.config.js

Primary: restaurante brand color
Secondary, accent, success, warning, error


Responsive: mobile-first approach
Dark mode: considerar si es necesario
Animaciones: usar transition-all duration-300

Manejo de errores:

Try-catch en todas las llamadas API
Toast notifications con biblioteca (react-hot-toast o similar)
Mensajes user-friendly en español
Logs en consola solo en desarrollo

Optimización:

Lazy loading de páginas (React.lazy + Suspense)
Lazy loading de imágenes (react-lazy-load-image o native)
Debounce en búsquedas (300ms)
Throttle en scroll events
Memoización de componentes pesados (React.memo)
useCallback y useMemo donde sea necesario

Testing (opcional pero recomendado):

Tests unitarios de componentes críticos
Tests de integración de flujos principales
Tests E2E de flujo completo de pedido/reserva


✅ CHECKLIST FINAL DE FUNCIONALIDAD
Widget Chat:

✅ State machine 0-15 funcional
✅ Validación de horario en 3 puntos
✅ RE-validación producto activo al agregar
✅ Delivery cost = MAX calculado correctamente
✅ Flujo de pedido completo
✅ Flujo de reserva completo
✅ Persistencia en localStorage
✅ Formato de mensajes atractivo

PWA Cliente:

✅ Navegación completa del menú
✅ Carrito funcional con persistencia
✅ Checkout completo con validaciones
✅ Crear reserva online paso a paso
✅ Ver mis pedidos en tiempo real
✅ Ver mis reservas
✅ Notificaciones push
✅ Offline mode básico

PWA Mesero:

✅ Login con PIN
✅ Gestión de mesas en tiempo real
✅ Tomar pedidos desde mesa
✅ Ver reservas del día
✅ Activar reserva cuando cliente llega
✅ Notificaciones de platos listos
✅ Estadísticas personales

PWA Cocina:

✅ Ver cola completa
✅ Filtros por estación
✅ Iniciar preparación (timer visual)
✅ Marcar listo (notifica automáticamente)
✅ Actualización en tiempo real
✅ Alertas sonoras de nuevos pedidos
✅ Modo fullscreen/kiosk

PWA Admin:

✅ Dashboard con métricas tiempo real
✅ CRUD completo de menú (categorías, subcategorías, productos)
✅ Gestión de imágenes
✅ Activar/desactivar productos (efecto inmediato)
✅ Gestión completa de pedidos
✅ Gestión completa de reservas (confirmar, editar, cancelar)
✅ Calendario de reservas visual
✅ Gestión de clientes con estadísticas
✅ Gestión de personal (meseros)
✅ Gestión de mesas
✅ Configuración de horarios
✅ Reportes con gráficos
✅ Log de notificaciones
✅ Configuración general del sistema
✅ Exportación a Excel/PDF


🎯 PRIORIDAD DE IMPLEMENTACIÓN SUGERIDA:

PWA Admin (crear y configurar todo el menú primero)
Widget Chat (para que clientes puedan pedir)
PWA Cliente (experiencia mejorada para clientes)
PWA Cocina (para procesar los pedidos)
PWA Mesero (para pedidos presenciales y reservas)


FIN DE INSTRUCCIONES DE FRONTEND

