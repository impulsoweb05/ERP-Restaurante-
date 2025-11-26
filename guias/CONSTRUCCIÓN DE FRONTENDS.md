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

