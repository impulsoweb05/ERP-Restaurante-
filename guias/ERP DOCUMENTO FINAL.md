📘 DOCUMENTO MAESTRO: SISTEMA ERP RESTAURANTE CON RESERVAS
🎯 OBJETIVO DEL SISTEMA
Crear un sistema completo de gestión para restaurante que incluye:

Pedidos a domicilio (Widget Chat + PWA Cliente)
Gestión de mesas (PWA Mesero)
Comandas de cocina (PWA Cocina)
Administración ERP (PWA Admin)
Sistema de reservas online


📊 ARQUITECTURA GENERAL DEL SISTEMA
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE USUARIOS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👤 CLIENTE      👨‍🍳 MESERO     🍳 COCINA     👨‍💼 ADMIN    │
│     │               │              │              │         │
│     ↓               ↓              ↓              ↓         │
│  ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐       │
│  │Widget│      │ PWA  │      │ PWA  │      │ PWA  │       │
│  │ Chat │      │Mesero│      │Cocina│      │Admin │       │
│  └──────┘      └──────┘      └──────┘      └──────┘       │
│     │               │              │              │         │
│  ┌──────┐          │              │              │         │
│  │ PWA  │          │              │              │         │
│  │Client│          │              │              │         │
│  └──────┘          │              │              │         │
│     │               │              │              │         │
└─────┼───────────────┼──────────────┼──────────────┼─────────┘
      │               │              │              │
      └───────────────┴──────────────┴──────────────┘
                      │
                      ↓ HTTPS REST API + WebSocket
┌─────────────────────────────────────────────────────────────┐
│              BACKEND NODE.JS + EXPRESS                      │
│              Puerto: 4000                                   │
├─────────────────────────────────────────────────────────────┤
│ • Auth & Sessions                                           │
│ • State Machine (Chat niveles 0-15)                         │
│ • Order Management                                          │
│ • Menu Service (filtrado dinámico)                          │
│ • Cart Service                                              │
│ • Kitchen Queue                                             │
│ • Reservation Service (NUEVO)                               │
│ • Notification Service (Email/WhatsApp/Telegram)            │
│ • WebSocket Server (Real-time)                              │
│ • Cron Jobs (auto-release reservas, sesiones)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓ Directus SDK
┌─────────────────────────────────────────────────────────────┐
│           DIRECTUS + POSTGRESQL                             │
│           Puerto: 8055                                      │
├─────────────────────────────────────────────────────────────┤
│ 13 Collections (Tablas):                                    │
│ • customers            • menu_items                         │
│ • menu_categories      • menu_subcategories                 │
│ • orders               • order_items                        │
│ • schedules            • sessions                           │
│ • kitchen_queue        • waiters                            │
│ • tables               • notifications                      │
│ • reservations (NUEVA)                                      │
└─────────────────────────────────────────────────────────────┘

🗄️ ESTRUCTURA DE BASE DE DATOS COMPLETA
1. Collection: customers
┌──────────────────────────────────────────────────────┐
│ Campo              │ Tipo          │ Descripción     │
├──────────────────────────────────────────────────────┤
│ id                 │ UUID PK       │ Identificador   │
│ customer_code      │ STRING UNIQUE │ CLI-{time}-{rnd}│
│ full_name          │ STRING        │ Nombre completo │
│ phone              │ STRING UNIQUE │ 10 dígitos      │
│ email              │ STRING NULL   │ Correo opcional │
│ address_1          │ TEXT          │ Dirección 1     │
│ address_2          │ TEXT NULL     │ Dirección 2     │
│ address_3          │ TEXT NULL     │ Dirección 3     │
│ notes              │ TEXT NULL     │ Notas cliente   │
│ is_active          │ BOOLEAN       │ default: true   │
│ created_at         │ TIMESTAMP     │ Auto            │
│ updated_at         │ TIMESTAMP     │ Auto            │
└──────────────────────────────────────────────────────┘

ÍNDICES:
- phone (UNIQUE)
- customer_code (UNIQUE)

VALIDACIONES CRÍTICAS:
✓ phone: Exactamente 10 dígitos numéricos
✓ Máximo 3 direcciones por cliente
✓ Normalización automática: +57 → sin prefijo
2. Collection: menu_categories
┌──────────────────────────────────────────────────────┐
│ id                 │ UUID PK       │                 │
│ name               │ STRING        │ Ej: "BEBIDAS"   │
│ image_url          │ STRING NULL   │ URL imagen      │
│ display_order      │ INTEGER       │ Orden visual    │
│ is_active          │ BOOLEAN       │ default: true   │
│ created_at         │ TIMESTAMP     │ Auto            │
│ updated_at         │ TIMESTAMP     │ Auto            │
└──────────────────────────────────────────────────────┘
3. Collection: menu_subcategories
┌──────────────────────────────────────────────────────┐
│ id                 │ UUID PK       │                 │
│ category_id        │ UUID FK       │ →menu_categories│
│ name               │ STRING        │ Ej: "GASEOSAS"  │
│ image_url          │ STRING NULL   │ URL imagen      │
│ display_order      │ INTEGER       │ Orden visual    │
│ is_active          │ BOOLEAN       │ default: true   │
│ created_at         │ TIMESTAMP     │ Auto            │
│ updated_at         │ TIMESTAMP     │ Auto            │
└──────────────────────────────────────────────────────┘

RELACIÓN:
menu_categories (1) ←──────── (N) menu_subcategories
4. Collection: menu_items
┌──────────────────────────────────────────────────────┐
│ id                 │ UUID PK       │                 │
│ menu_code          │ STRING UNIQUE │ MENU-{time}-{r} │
│ category_id        │ UUID FK       │ →menu_categories│
│ subcategory_id     │ UUID FK       │ →menu_subcat    │
│ name               │ STRING        │ Ej: "Coca-Cola" │
│ description        │ TEXT          │ Descripción     │
│ price              │ DECIMAL(10,2) │ Precio venta    │
│ delivery_cost      │ DECIMAL(10,2) │ Costo domicilio │
│ status             │ ENUM          │ active/inactive │
│ image_url          │ STRING NULL   │ URL imagen      │
│ preparation_time   │ INTEGER       │ Minutos         │
│ station            │ STRING NULL   │ parrilla/fritos │
│ created_at         │ TIMESTAMP     │ Auto            │
│ updated_at         │ TIMESTAMP     │ Auto            │
└──────────────────────────────────────────────────────┘

ÍNDICES CRÍTICOS:
- (status, category_id, subcategory_id)
- menu_code (UNIQUE)

VALIDACIONES CRÍTICAS:
✓ Solo productos con status='active' visibles en frontend
✓ Delivery cost puede ser 0 (productos sin domicilio)
✓ Precio y delivery_cost siempre > 0
5. Collection: orders
┌──────────────────────────────────────────────────────┐
│ id                 │ UUID PK       │                 │
│ order_number       │ STRING UNIQUE │ PED-{time}-{rnd}│
│ customer_id        │ UUID FK       │ →customers      │
│ waiter_id          │ UUID FK NULL  │ →waiters        │
│ table_id           │ UUID FK NULL  │ →tables         │
│ reservation_id     │ UUID FK NULL  │ →reservations   │
│ order_type         │ ENUM          │ delivery/dine_in│
│ status             │ ENUM          │ Ver abajo       │
│ payment_method     │ ENUM          │ cash/card/trans │
│ subtotal           │ DECIMAL(10,2) │ Sin domicilio   │
│ delivery_cost      │ DECIMAL(10,2) │ MAX items       │
│ total              │ DECIMAL(10,2) │ Sub + delivery  │
│ delivery_address   │ TEXT NULL     │ Si delivery     │
│ customer_notes     │ TEXT NULL     │ Comentarios     │
│ created_at         │ TIMESTAMP     │ Hora pedido     │
│ confirmed_at       │ TIMESTAMP NULL│ Confirmación    │
│ completed_at       │ TIMESTAMP NULL│ Entrega         │
└──────────────────────────────────────────────────────┘

STATUS ENUM:
- pending: Creado, esperando confirmación
- confirmed: Confirmado, va a cocina
- preparing: En cocina
- ready: Listo para entrega/servir
- delivered: Entregado
- cancelled: Cancelado

ORDER_TYPE ENUM:
- delivery: A domicilio
- dine_in: Comer en restaurante
- takeout: Para llevar

PAYMENT_METHOD ENUM:
- cash: Efectivo
- card: Tarjeta
- transfer: Transferencia
- terminal: Datafono

VALIDACIONES CRÍTICAS:
✓ delivery_cost = MAX(item_delivery_cost) NO suma
✓ total = subtotal + delivery_cost
✓ Si delivery: delivery_address obligatorio
✓ Snapshot de precios en order_items (no recalcular)
6. Collection: order_items
┌──────────────────────────────────────────────────────┐
│ id                 │ UUID PK       │                 │
│ order_id           │ UUID FK       │ →orders         │
│ menu_item_id       │ UUID FK       │ →menu_items     │
│ quantity           │ INTEGER       │ > 0             │
│ unit_price         │ DECIMAL(10,2) │ SNAPSHOT precio │
│ item_delivery_cost │ DECIMAL(10,2) │ SNAPSHOT deliv  │
│ subtotal           │ DECIMAL(10,2) │ qty * unit_price│
│ special_instructions│TEXT NULL     │ "Sin cebolla"   │
│ status             │ ENUM          │ Ver abajo       │
│ created_at         │ TIMESTAMP     │ Auto            │
└──────────────────────────────────────────────────────┘

STATUS ENUM:
- pending: Pendiente cocina
- preparing: En preparación
- ready: Listo
- served: Servido (dine-in)

VALIDACIONES CRÍTICAS:
✓ SIEMPRE guardar snapshot (unit_price, item_delivery_cost)
✓ Nunca recalcular desde menu_items (histórico correcto)
✓ subtotal = quantity * unit_price
7. Collection: schedules
┌──────────────────────────────────────────────────────┐
│ id                 │ UUID PK       │                 │
│ day_of_week        │ ENUM          │ MONDAY-SUNDAY   │
│ opening_time       │ TIME          │ HH:MM (11:00)   │
│ closing_time       │ TIME          │ HH:MM (22:00)   │
│ is_open            │ BOOLEAN       │ default: true   │
│ special_note       │ TEXT NULL     │ "Cerrado festivo│
│ created_at         │ TIMESTAMP     │ Auto            │
│ updated_at         │ TIMESTAMP     │ Auto            │
└──────────────────────────────────────────────────────┘

CONSTRAINT:
- UNIQUE (day_of_week)

DAY_OF_WEEK ENUM:
MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY

VALIDACIONES CRÍTICAS:
✓ Validar horario en 3 puntos:
  1. Inicio sesión (nivel 0)
  2. Agregar al carrito (nivel 5)
  3. Confirmar pedido (nivel 14)
✓ Timezone SIEMPRE: America/Bogota
✓ Si is_open=false → rechazar pedidos
8. Collection: sessions
┌──────────────────────────────────────────────────────┐
│ id                 │ UUID PK       │                 │
│ session_id         │ STRING UNIQUE │ Generado UUID   │
│ customer_id        │ UUID FK NULL  │ →customers      │
│ phone              │ STRING NULL   │ Pre-registro    │
│ current_level      │ INTEGER       │ 0-15 state      │
│ is_open            │ BOOLEAN       │ Sesión activa   │
│ is_registered      │ BOOLEAN       │ Cliente existe  │
│ cart               │ JSONB         │ Carrito temporal│
│ selected_category  │ STRING NULL   │ Navegación      │
│ selected_subcategory│STRING NULL   │ Navegación      │
│ temp_menu_item     │ UUID NULL     │ Item temporal   │
│ checkout_data      │ JSONB NULL    │ Datos checkout  │
│ reservation_data   │ JSONB NULL    │ Datos reserva   │
│ created_at         │ TIMESTAMP     │ Auto            │
│ updated_at         │ TIMESTAMP     │ Auto            │
│ expires_at         │ TIMESTAMP     │ +24h            │
└──────────────────────────────────────────────────────┘

ÍNDICES:
- session_id (UNIQUE)
- expires_at

cart JSONB estructura:
[
  {
    menu_item_id: "uuid",
    name: "Picada",
    quantity: 2,
    unit_price: 49000,
    item_delivery_cost: 5000,
    subtotal: 98000
  }
]

CRON JOB:
- Ejecutar cada hora
- DELETE FROM sessions WHERE expires_at < NOW()
9. Collection: kitchen_queue
┌──────────────────────────────────────────────────────┐
│ id                 │ UUID PK       │                 │
│ order_item_id      │ UUID FK       │ →order_items O2O│
│ priority           │ INTEGER       │ 1-5             │
│ status             │ ENUM          │ Ver abajo       │
│ assigned_station   │ STRING NULL   │ parrilla/fritos │
│ started_at         │ TIMESTAMP NULL│ Inicio prep     │
│ completed_at       │ TIMESTAMP NULL│ Fin prep        │
│ estimated_time     │ INTEGER       │ Minutos         │
│ created_at         │ TIMESTAMP     │ Auto            │
└──────────────────────────────────────────────────────┘

STATUS ENUM:
- queued: En cola
- preparing: En preparación
- ready: Listo

PRIORIDAD (calculada automáticamente):
- delivery: 5
- takeout: 4
- dine_in: 3
- +1 si tiempo espera > 30 min
- +1 si tiempo espera > 60 min

ORDEN DE COLA:
ORDER BY priority DESC, created_at ASC

VALIDACIONES CRÍTICAS:
✓ One-to-One con order_items
✓ WebSocket notifica a cocina cuando nuevo
✓ WebSocket notifica a mesero cuando ready
10. Collection: waiters
┌──────────────────────────────────────────────────────┐
│ id                 │ UUID PK       │                 │
│ waiter_code        │ STRING UNIQUE │ MESERO-001      │
│ full_name          │ STRING        │ Nombre completo │
│ phone              │ STRING        │ Teléfono        │
│ pin_code           │ STRING        │ Bcrypt hash     │
│ is_active          │ BOOLEAN       │ default: true   │
│ current_orders     │ INTEGER       │ Contador        │
│ created_at         │ TIMESTAMP     │ Auto            │
│ updated_at         │ TIMESTAMP     │ Auto            │
└──────────────────────────────────────────────────────┘

VALIDACIONES CRÍTICAS:
✓ pin_code SIEMPRE hasheado con bcrypt (nunca plain text)
✓ PIN debe ser 4 dígitos numéricos
✓ Re-autenticación cada 4 horas
11. Collection: tables
┌──────────────────────────────────────────────────────┐
│ id                 │ UUID PK       │                 │
│ table_number       │ STRING UNIQUE │ "1", "VIP-1"    │
│ capacity           │ INTEGER       │ Personas        │
│ zone               │ STRING        │ Salón/Terraza   │
│ status             │ ENUM          │ Ver abajo       │
│ current_order_id   │ UUID FK NULL  │ →orders         │
│ current_reservation_id│UUID FK NULL│ →reservations   │
│ created_at         │ TIMESTAMP     │ Auto            │
│ updated_at         │ TIMESTAMP     │ Auto            │
└──────────────────────────────────────────────────────┘

STATUS ENUM:
- available: Disponible
- occupied: Ocupada (con pedido activo)
- reserved: Reservada
- cleaning: En limpieza

VALIDACIONES CRÍTICAS:
✓ Si status='reserved': validar que existe reserva activa
✓ Si status='occupied': validar que existe order activa
✓ Liberar automáticamente cuando order completed
12. Collection: notifications
┌──────────────────────────────────────────────────────┐
│ id                 │ UUID PK       │                 │
│ order_id           │ UUID FK NULL  │ →orders         │
│ reservation_id     │ UUID FK NULL  │ →reservations   │
│ notification_type  │ ENUM          │ Ver abajo       │
│ recipient          │ STRING        │ Email o teléfono│
│ status             │ ENUM          │ pending/sent    │
│ content            │ JSONB         │ Template data   │
│ sent_at            │ TIMESTAMP NULL│ Envío           │
│ error_message      │ TEXT NULL     │ Si falló        │
│ created_at         │ TIMESTAMP     │ Auto            │
└──────────────────────────────────────────────────────┘

NOTIFICATION_TYPE ENUM:
- email
- whatsapp
- telegram

STATUS ENUM:
- pending: Pendiente envío
- sent: Enviado exitoso
- failed: Falló envío
13. Collection: reservations ⭐ NUEVA
┌──────────────────────────────────────────────────────┐
│ id                 │ UUID PK       │                 │
│ reservation_number │ STRING UNIQUE │ RES-{time}-{rnd}│
│ customer_id        │ UUID FK       │ →customers      │
│ table_id           │ UUID FK       │ →tables         │
│ reservation_date   │ DATE          │ YYYY-MM-DD      │
│ reservation_time   │ TIME          │ HH:MM           │
│ party_size         │ INTEGER       │ Personas        │
│ status             │ ENUM          │ Ver abajo       │
│ customer_name      │ STRING        │ Nombre          │
│ customer_phone     │ STRING        │ 10 dígitos      │
│ customer_email     │ STRING NULL   │ Email opcional  │
│ special_requests   │ TEXT NULL     │ Solicitudes     │
│ created_at         │ TIMESTAMP     │ Auto            │
│ confirmed_at       │ TIMESTAMP NULL│ Admin confirma  │
│ activated_at       │ TIMESTAMP NULL│ Cliente llegó   │
│ completed_at       │ TIMESTAMP NULL│ Servicio terminó│
│ cancelled_at       │ TIMESTAMP NULL│ Cancelación     │
│ auto_released_at   │ TIMESTAMP NULL│ Auto-liberada   │
└──────────────────────────────────────────────────────┘

STATUS ENUM:
- pending: Creada, esperando confirmación admin
- confirmed: Confirmada por admin
- active: Cliente llegó (mesero activó)
- completed: Servicio terminado
- cancelled: Cancelada
- no_show: Auto-liberada (30 min sin llegar)

ÍNDICES:
- (reservation_date, reservation_time, status)
- (table_id, status)
- (customer_phone)
- reservation_number (UNIQUE)

VALIDACIONES CRÍTICAS:
✓ No permitir reservas en pasado
✓ No permitir misma mesa/fecha/hora si existe reserva activa
✓ Validar horario del restaurante (schedules)
✓ party_size <= table.capacity
✓ Auto-liberar 30 min después si status='confirmed' y no activó

🔗 DIAGRAMA DE RELACIONES
customers (1) ←──────────────────── (N) orders
                                         ↓
customers (1) ←──────────────────── (N) reservations
                                         ↓
tables (1) ←─────────────────────── (N) reservations
                                         ↓
tables (1) ←─────────────────────── (1) orders (current_order_id)
                                         ↓
orders (1) ←─────────────────────── (N) order_items
                                         ↓
menu_items (1) ←─────────────────── (N) order_items
                                         ↓
order_items (1) ←────────────────── (1) kitchen_queue
                                         ↓
waiters (1) ←────────────────────── (N) orders
                                         ↓
sessions (N) ──────────────────────→ (1) customers (opcional)
                                         ↓
menu_categories (1) ←────────────── (N) menu_subcategories
                                         ↓
menu_categories (1) ←────────────── (N) menu_items
menu_subcategories (1) ←─────────── (N) menu_items

👥 ROLES Y PERMISOS DETALLADOS
🍔 ROL 1: CLIENTE DOMICILIO
Interfaces:

Widget Chat (HTML embebible)
PWA Cliente (App móvil)

Permisos:
✅ PUEDE:

VISUALIZACIÓN:
- Ver horario actual (abierto/cerrado) en tiempo real
- Ver solo productos con status='active'
- Ver categorías activas
- Ver subcategorías activas
- Ver precios, fotos, descripciones de productos
- Ver sus propios pedidos (historial)
- Ver estado de pedido en tiempo real

ACCIONES - PEDIDOS:
- Registrarse con teléfono (10 dígitos)
- Navegar menú (categoría → subcategoría → producto)
- Agregar productos al carrito
- Modificar cantidad en carrito
- Eliminar items del carrito
- Ver carrito: subtotal + domicilio + total
- Seleccionar dirección de entrega (hasta 3)
- Agregar nueva dirección (si tiene < 3)
- Elegir método de pago
- Agregar comentarios/notas al pedido
- Confirmar pedido
- Recibir número de pedido
- Rastrear pedido en tiempo real
- Recibir notificaciones push

ACCIONES - RESERVAS:
- Crear reserva online
- Ver mesas disponibles para fecha/hora
- Seleccionar mesa
- Agregar solicitudes especiales
- Confirmar reserva
- Ver historial de reservas
- Cancelar reserva (con anticipación)
- Recibir confirmación (email + WhatsApp)

PERFIL:
- Editar nombre, email
- Gestionar hasta 3 direcciones
- Ver estadísticas (total gastado, pedidos)

❌ NO PUEDE:
- Ver productos con status='inactive'
- Pedir fuera de horario
- Ver precios de otros clientes
- Agregar más de 3 direcciones
- Modificar precios
- Ver panel de cocina
- Ver datos de otros clientes
- Acceder a reportes
- Confirmar reserva (solo admin)
Flujo de Uso - PEDIDO DOMICILIO:
WIDGET CHAT:
┌─────────────────────────────────────────────────┐
│ NIVEL 0: BOT valida horario automáticamente     │
│          → Si CERRADO: mensaje + horario        │
│          → Si ABIERTO: continúa                 │
├─────────────────────────────────────────────────┤
│ NIVEL 1: BOT pide teléfono                      │
│          Cliente: 3012345678                    │
│          → Sistema busca cliente existente      │
│          → Si existe: saluda por nombre         │
│          → Si no: crea nuevo cliente            │
├─────────────────────────────────────────────────┤
│ NIVEL 2: BOT muestra categorías con números     │
│          1️⃣ PICADAS                             │
│          2️⃣ PIZZAS                              │
│          3️⃣ BEBIDAS                             │
│          4️⃣ VER CARRITO (si tiene items)        │
│          5️⃣ HACER RESERVA                       │
│          Cliente: 2                             │
├─────────────────────────────────────────────────┤
│ NIVEL 3: BOT muestra subcategorías              │
│          1️⃣ PIZZAS TRADICIONALES                │
│          2️⃣ PIZZAS ESPECIALES                   │
│          3️⃣ ⬅️ VOLVER                           │
│          Cliente: 1                             │
├─────────────────────────────────────────────────┤
│ NIVEL 4: BOT muestra productos                  │
│          1️⃣ Pizza Hawaiana $39K 🚚$3K          │
│          2️⃣ Pizza Napolitana $42K 🚚$3K        │
│          3️⃣ ⬅️ VOLVER                           │
│          Cliente: 1                             │
├─────────────────────────────────────────────────┤
│ NIVEL 5: BOT muestra detalle producto           │
│          🍕 Pizza Hawaiana                      │
│          Piña, jamón, queso mozzarella          │
│          💰 $39.000 | 🚚 $3.000 | ⏱️ 25min     │
│                                                 │
│          → Sistema RE-VALIDA:                   │
│            ✓ Horario actual (aún abierto?)      │
│            ✓ Producto activo (status='active'?) │
│                                                 │
│          ¿Agregar al carrito? 1=Sí 2=No         │
│          Cliente: 1                             │
│          → Si validaciones OK: agrega           │
│          → Si falló: mensaje error específico   │
├─────────────────────────────────────────────────┤
│ NIVEL 6: BOT muestra carrito                    │
│          🛒 TU CARRITO:                         │
│          • Pizza Hawaiana x1 $39.000            │
│          • Cerveza x2 $8.000                    │
│          ━━━━━━━━━━━━━━━━━━━━━━                │
│          Subtotal: $47.000                      │
│          Domicilio: $3.000 (MAX, no suma)       │
│          TOTAL: $50.000                         │
│          ━━━━━━━━━━━━━━━━━━━━━━                │
│          1️⃣ Seguir comprando                    │
│          2️⃣ Finalizar pedido                    │
│          Cliente: 2                             │
├─────────────────────────────────────────────────┤
│ NIVEL 7-13: Checkout                            │
│ NIVEL 7: BOT muestra direcciones guardadas      │
│          1️⃣ Calle 123 #45-67 Apto 301          │
│          2️⃣ Carrera 7 #80-20                    │
│          3️⃣ Agregar nueva dirección             │
│          Cliente: 1                             │
├─────────────────────────────────────────────────┤
│ NIVEL 8-10: Si elige nueva dirección            │
│             Pide: calle, detalles               │
├─────────────────────────────────────────────────┤
│ NIVEL 11: Método de pago                        │
│           1️⃣ Efectivo                           │
│           2️⃣ Transferencia                      │
│           3️⃣ Tarjeta                            │
│           Cliente: 1                            │
├─────────────────────────────────────────────────┤
│ NIVEL 12: Comentarios adicionales               │
│           (Opcional, 0 para omitir)             │
│           Cliente: Tocar timbre                 │
├─────────────────────────────────────────────────┤
│ NIVEL 14: RESUMEN FINAL                         │
│           → Sistema RE-VALIDA:                  │
│             ✓ Horario (última vez)              │
│             ✓ Todos productos activos           │
│             ✓ Dirección válida                  │
│           → Muestra resumen completo            │
│           ¿Confirmar? 1=SíReintentarMDContinuar├─────────────────────────────────────────────────┤
│ NIVEL 15: CONFIRMACIÓN Y PROCESAMIENTO          │
│           → Backend crea orden:                 │
│             1. Genera order_number único        │
│             2. Crea registro en orders          │
│             3. Crea order_items (snapshot)      │
│             4. Calcula delivery (MAX)           │
│             5. Inserta kitchen_queue            │
│             6. Envía notificaciones:            │
│                - Email admin                    │
│                - WhatsApp cliente               │
│                - Telegram cocina                │
│             7. Limpia session.cart              │
│                                                 │
│           ✅ PEDIDO CONFIRMADO                  │
│           📋 Nº: PED-1732564890-042             │
│           💰 Total: $50.000                     │
│           ⏱️ Tiempo estimado: 45 min            │
│                                                 │
│           Te enviamos confirmación por:         │
│           ✅ Email                              │
│           ✅ WhatsApp                           │
└─────────────────────────────────────────────────┘
Flujo de Uso - RESERVA:
WIDGET CHAT - OPCIÓN RESERVA:
┌─────────────────────────────────────────────────┐
│ NIVEL 2: Cliente selecciona "5️⃣ HACER RESERVA" │
├─────────────────────────────────────────────────┤
│ BOT: 📅 ¿Para qué fecha?                        │
│      Formato: DD/MM/YYYY                        │
│      Ejemplo: 25/11/2025                        │
│                                                 │
│ Cliente: 25/11/2025                             │
│ → Sistema valida: fecha futura                  │
├─────────────────────────────────────────────────┤
│ BOT: 🕐 ¿A qué hora?                            │
│      Horario: 11:00 - 22:00                     │
│      Formato: HH:MM                             │
│                                                 │
│ Cliente: 19:30                                  │
│ → Sistema valida: dentro horario restaurante   │
├─────────────────────────────────────────────────┤
│ BOT: 👥 ¿Para cuántas personas?                 │
│                                                 │
│ Cliente: 4                                      │
├─────────────────────────────────────────────────┤
│ BOT: 🪑 Mesas disponibles:                       │
│      (Query: capacity >= 4 AND no reservada)    │
│      1️⃣ Mesa 5 - Salón (6 personas)            │
│      2️⃣ Mesa 8 - Terraza (4 personas)          │
│      3️⃣ Mesa 12 - VIP (8 personas)             │
│                                                 │
│ Cliente: 2                                      │
├─────────────────────────────────────────────────┤
│ BOT: 📝 ¿Solicitudes especiales?                │
│      (Envía 0 para omitir)                      │
│                                                 │
│ Cliente: Celebración cumpleaños                 │
├─────────────────────────────────────────────────┤
│ BOT: ✅ RESUMEN RESERVA                         │
│      ━━━━━━━━━━━━━━━━━━━━━━━━                  │
│      📋 RES-1732564890-042                      │
│      📅 25 Nov 2025 🕐 19:30                    │
│      👤 Juan Pérez                              │
│      📞 301 234 5678                            │
│      🪑 Mesa 8 (Terraza)                         │
│      👥 4 personas                              │
│      📝 Celebración cumpleaños                  │
│      ━━━━━━━━━━━━━━━━━━━━━━━━                  │
│      ⚠️ Liberación automática si no             │
│         llegas 30 min después (20:00)           │
│                                                 │
│      ¿Confirmar? 1=Sí 2=Cancelar                │
│                                                 │
│ Cliente: 1                                      │
├─────────────────────────────────────────────────┤
│ PROCESAMIENTO:                                  │
│ 1. Crea registro en reservations                │
│    - status = 'pending' (espera admin)          │
│ 2. Envía notificaciones:                        │
│    - Email cliente (confirmación recibida)      │
│    - WhatsApp cliente (ticket reserva)          │
│    - Email admin (nueva reserva pendiente)      │
│    - Telegram admin (alerta)                    │
│ 3. Muestra código reserva                       │
│                                                 │
│ ✅ RESERVA CREADA (Pendiente confirmación)      │
│ 📋 Código: RES-1732564890-042                   │
│                                                 │
│ Te contactaremos para confirmar.                │
│ Recibirás notificaciones en:                    │
│ ✅ Email                                        │
│ ✅ WhatsApp                                     │
└─────────────────────────────────────────────────┘
PWA Cliente - Navegación Libre:
PANTALLA HOME:
┌─────────────────────────────────────────┐
│ 🍽️ Restaurante      🛒[3]  👤          │
├─────────────────────────────────────────┤
│ ⏰ Abierto hasta las 22:00              │
├─────────────────────────────────────────┤
│ [🍕 Pedir Ahora] [🪑 Reservar Mesa]     │
├─────────────────────────────────────────┤
│ 🔍 Buscar productos...                  │
├─────────────────────────────────────────┤
│ 📂 Categorías (scroll horizontal)       │
│ [🥩 Picadas][🍕 Pizzas][🍔 Rápidas]     │
├─────────────────────────────────────────┤
│ 🔥 Más Populares                        │
│ ┌───────────────────────────────────┐   │
│ │ [Foto Picada]                     │   │
│ │ Picada Especial                   │   │
│ │ Carne, chorizo, papa, plátano     │   │
│ │ 💰$49.000 🚚$5.000 ⏱️30min       │   │
│ │ [➕ Agregar]          ⭐4.8 (120) │   │
│ └───────────────────────────────────┘   │
│ ┌───────────────────────────────────┐   │
│ │ [Foto Pizza]                      │   │
│ │ Pizza Hawaiana                    │   │
│ │ Piña, jamón, queso mozzarella     │   │
│ │ 💰$39.000 🚚$3.000 ⏱️25min       │   │
│ │ [➕ Agregar]          ⭐4.9 (95)  │   │
│ └───────────────────────────────────┘   │
├─────────────────────────────────────────┤
│ 🏠 Home│📋 Pedidos│🪑 Reservas│👤      │
└─────────────────────────────────────────┘

AL HACER CLIC EN PRODUCTO:
┌─────────────────────────────────────────┐
│ ← Volver          🪑 Reservar Mesa      │
├─────────────────────────────────────────┤
│ [Foto grande Pizza Hawaiana]            │
├─────────────────────────────────────────┤
│ Pizza Hawaiana          ⭐4.9 (95)      │
│ 💰 $39.000                              │
├─────────────────────────────────────────┤
│ 📝 Descripción:                         │
│ Deliciosa pizza con piña, jamón,        │
│ queso mozzarella y salsa de tomate.     │
│                                         │
│ 🚚 Domicilio: $3.000                    │
│ ⏱️ Tiempo: 25 minutos                   │
│ 🥩 Estación: Horno                      │
├─────────────────────────────────────────┤
│ Cantidad: [−  1  +]                     │
│                                         │
│ 📝 Instrucciones especiales (opcional)  │
│ [Extra queso, sin cebolla...]           │
├─────────────────────────────────────────┤
│ [Agregar al carrito $39.000]            │
│                                         │
│ → Al agregar: Sistema RE-VALIDA         │
│   ✓ Horario abierto                     │
│   ✓ Producto status='active'            │
└─────────────────────────────────────────┘

👨‍🍳 ROL 2: MESERO
Interface:

PWA Mesero (Tablet/Móvil)

Permisos:
✅ PUEDE:

LOGIN Y SESIÓN:
- Login con PIN 4 dígitos
- Re-autenticación cada 4 horas
- Ver perfil propio (nombre, código, estadísticas)
- Cerrar sesión

GESTIÓN DE MESAS:
- Ver TODAS las mesas del restaurante
- Ver estado en tiempo real:
  🟢 Disponible
  🔴 Ocupada (con orden activa)
  🟡 Reservada (con reserva activa)
  ⚫ Limpiando
- Filtrar por zona (Salón, Terraza, VIP)
- Ver capacidad de cada mesa
- Asignar mesa a su nombre
- Ocupar mesa (cambiar status)
- Liberar mesa al cerrar cuenta

TOMAR PEDIDOS:
- Crear nuevo pedido en mesa asignada
- Buscar productos por nombre
- Ver SOLO productos status='active'
- Agregar items con cantidad
- Agregar notas por ítem ("Sin cebolla", "Término 3/4")
- Modificar cantidad antes de enviar
- Eliminar items del pedido
- Ver total en tiempo real
- Enviar pedido a cocina
- Ver confirmación que llegó a kitchen_queue

SEGUIMIENTO PEDIDOS:
- Ver MIS pedidos activos (solo los propios)
- Ver estado: confirmado/preparando/listo
- Recibir notificación WebSocket cuando plato listo
- Marcar ítem como "servido" al entregar
- Ver tiempo de espera de cada pedido
- Ver detalle completo de orden

CIERRE DE CUENTA:
- Ver resumen de consumo mesa
- Dividir cuenta entre comensales
- Calcular propina (sugerencia 10%)
- Seleccionar método de pago
- Cerrar cuenta (status='completed')
- Liberar mesa automáticamente
- Generar/imprimir ticket

GESTIÓN RESERVAS:
- Ver reservas del día (TODAS, no solo propias)
- Ver reservas filtradas por estado:
  🟡 Pendientes (esperan confirmación admin)
  🟢 Confirmadas
  🔵 Activas (cliente llegó)
  🔴 No-show
- Ver detalles de reserva:
  - Cliente, teléfono
  - Fecha, hora, personas
  - Mesa asignada
  - Solicitudes especiales
- ACTIVAR reserva cuando cliente llega:
  - Botón "Cliente Llegó"
  - Cambia status: 'confirmed' → 'active'
  - Mesa cambia a 'occupied'
  - Puede iniciar pedido asociado
- Recibir alerta 15 min antes de reserva
- Ver timeline de reservas del día
- Llamar cliente (click en teléfono)

ESTADÍSTICAS PERSONALES:
- Ventas del día
- Mesas atendidas
- Propinas recibidas
- Tiempo promedio atención
- Pedidos completados

❌ NO PUEDE:
- Ver pedidos de OTROS meseros
- Modificar precios de productos
- Activar/desactivar productos del menú
- Ver comandas de cocina (solo notificación "listo")
- Acceder a reportes generales del restaurante
- Crear/editar productos del menú
- Ver datos personales de clientes domicilio
- Modificar horarios del restaurante
- Ver ventas de otros meseros
- CREAR reservas (solo cliente/admin)
- CONFIRMAR reservas pendientes (solo admin)
- CANCELAR reservas (solo admin/cliente)
- Cambiar mesa de reserva confirmada (solo admin)
- Ver reservas históricas (solo del día actual)
Flujo de Uso - TOMAR PEDIDO:
PANTALLA PRINCIPAL:
┌─────────────────────────────────────────┐
│ 👨‍🍳 Mesero: Carlos      [Cerrar Sesión] │
├─────────────────────────────────────────┤
│ [Mesas] [Pedidos] [Reservas]            │
├─────────────────────────────────────────┤
│ 🏠 Zona: Salón Principal    [▼ Cambiar] │
├─────────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│ │🟢 1│ │🔴 2│ │🟢 3│ │🟡 4│            │
│ │4per│ │2per│ │6per│ │4per│            │
│ │$0  │ │$45K│ │$0  │ │Res │            │
│ └────┘ └────┘ └────┘ └────┘            │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│ │🟢 5│ │🟢 6│ │🔴 7│ │🟡 8│            │
│ │6per│ │4per│ │2per│ │4per│            │
│ │$0  │ │$0  │ │$32K│ │Res │            │
│ └────┘ └────┘ └────┘ └────┘            │
├─────────────────────────────────────────┤
│ 📊 Mi Desempeño Hoy:                    │
│ • Mesas atendidas: 8                    │
│ • Ventas: $324.000                      │
│ • Propinas: $32.400                     │
└─────────────────────────────────────────┘

AL HACER CLIC EN MESA LIBRE (ej: Mesa 1):
┌─────────────────────────────────────────┐
│ 🪑 Mesa 1 (4 personas)                  │
├─────────────────────────────────────────┤
│ Estado: 🟢 Disponible                   │
│                                         │
│ [Ocupar Mesa y Tomar Pedido]            │
│ [Cancelar]                              │
└─────────────────────────────────────────┘

DESPUÉS DE OCUPAR:
┌─────────────────────────────────────────┐
│ 📋 Mesa 1 - Nuevo Pedido      [× Salir] │
├─────────────────────────────────────────┤
│ 🔍 Buscar producto o escanear código... │
├─────────────────────────────────────────┤
│ 📂 Categorías Rápidas:                  │
│ [Picadas][Pizzas][Bebidas][Postres]     │
├─────────────────────────────────────────┤
│ 🛒 Pedido Actual:                       │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ 1. Picada Especial                │   │
│ │    💰$49.000 x1 = $49.000         │   │
│ │    📝 Sin cebolla, bien cocida    │   │
│ │    [✏️ Editar] [🗑️ Eliminar]     │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ 2. Cerveza Club                   │   │
│ │    💰$4.000 x2 = $8.000           │   │
│ │    [✏️ Editar] [🗑️ Eliminar]     │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ 3. Gaseosa Coca-Cola              │   │
│ │    💰$3.000 x1 = $3.000           │   │
│ │    [✏️ Editar] [🗑️ Eliminar]     │   │
│ └───────────────────────────────────┘   │
├─────────────────────────────────────────┤
│ 💵 Subtotal: $60.000                    │
│ 🍺 Propina sugerida 10%: $6.000         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━            │
│ 💰 TOTAL: $66.000                       │
├─────────────────────────────────────────┤
│ [➕ Agregar Más Items]                  │
│ [✅ Enviar a Cocina]                    │
└─────────────────────────────────────────┘

AL ENVIAR A COCINA:
→ Backend crea:
  1. Order (order_type='dine_in', table_id=1, waiter_id=mesero)
  2. Order_items (snapshot precios)
  3. Kitchen_queue (por cada item)
  4. WebSocket notifica cocina
  5. Mesa status → 'occupied'

NOTIFICACIÓN CUANDO PLATO LISTO:
┌─────────────────────────────────────────┐
│ 🔔 PEDIDO LISTO                         │
├─────────────────────────────────────────┤
│ Mesa 1 - PED-001                        │
│ • Picada Especial ✅                    │
│                                         │
│ [Ver Detalle] [Marcar Servido]          │
└─────────────────────────────────────────┘
Flujo de Uso - GESTIÓN RESERVAS:
PESTAÑA RESERVAS:
┌─────────────────────────────────────────┐
│ 👨‍🍳 Mesero: Carlos                      │
├─────────────────────────────────────────┤
│ [Mesas] [Pedidos] [Reservas]            │
├─────────────────────────────────────────┤
│ 🪑 RESERVAS DE HOY - 25 Nov 2025         │
│                                         │
│ Filtros: [Todas▼] [Confirmadas]         │
├─────────────────────────────────────────┤
│ 🟢 CONFIRMADAS (3)                      │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ 🕐 19:00 - Mesa 5 (Salón)          │   │
│ │ RES-001                            │   │
│ │ 👤 Juan Pérez                      │   │
│ │ 📞 301 234 5678 [📞 Llamar]        │   │
│ │ 👥 4 personas                      │   │
│ │ 📝 Celebración cumpleaños          │   │
│ │ ⏰ Libera automático: 19:30        │   │
│ │                                   │   │
│ │ [✅ CLIENTE LLEGÓ]                 │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ 🕐 20:00 - Mesa 8 (Terraza)        │   │
│ │ RES-002                            │   │
│ │ 👤 María López                     │   │
│ │ 📞 310 987 6543 [📞 Llamar]        │   │
│ │ 👥 2 personas                      │   │
│ │ ⏰ Libera automático: 20:30        │   │
│ │                                   │   │
│ │ [✅ CLIENTE LLEGÓ]                 │   │
│ └───────────────────────────────────┘   │
├─────────────────────────────────────────┤
│ 🟡 PENDIENTES DE CONFIRMACIÓN (1)       │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ 🕐 21:00 - Mesa 12 (VIP)           │   │
│ │ RES-003                            │   │
│ │ 👤 Pedro García                    │   │
│ │ 📞 320 555 1234                    │   │
│ │ 👥 6 personas                      │   │
│ │                                   │   │
│ │ ⚠️ Esperando confirmación admin    │   │
│ └───────────────────────────────────┘   │
├─────────────────────────────────────────┤
│ 🔴 NO-SHOW (1)                          │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ 🕐 18:30 - Mesa 3                  │   │
│ │ RES-004                            │   │
│ │ Liberada automáticamente 19:00     │   │
│ │ Cliente no se presentó             │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘

AL HACER CLIC EN "CLIENTE LLEGÓ":
┌─────────────────────────────────────────┐
│ ✅ Confirmar Llegada                    │
├─────────────────────────────────────────┤
│ RES-001 - Mesa 5                        │
│ Juan Pérez - 4 personas                 │
│                                         │
│ ¿El cliente llegó?                      │
│                                         │
│ [Sí, Activar Reserva] [Cancelar]        │
└─────────────────────────────────────────┘

DESPUÉS DE ACTIVAR:
→ Backend actualiza:
  1. reservation.status → 'active'
  2. reservation.activated_at → NOW()
  3. table.status → 'occupied'
  4. table.current_reservation_id → reservation_id
→ Mesero puede iniciar pedido normalmente
→ Reserva desaparece de lista "confirmadas"

ALERTA 15 MIN ANTES:
┌─────────────────────────────────────────┐
│ 🔔 RESERVA PRÓXIMA                      │
├─────────────────────────────────────────┤
│ ⏰ 18:45                                │
│                                         │
│ Mesa 5 reservada a las 19:00            │
│ Juan Pérez - 4 personas                 │
│ Celebración cumpleaños                  │
│                                         │
│ [Ver Detalle] [OK]                      │
└─────────────────────────────────────────┘

🍳 ROL 3: COCINA
Interface:

PWA Cocina (Pantalla grande, modo kiosk)

Permisos:
✅ PUEDE:

VISUALIZACIÓN COMANDAS:
- Ver TODOS los pedidos pendientes (domicilio + mesas)
- Ver pedidos en tiempo real (WebSocket)
- Ver pedidos ordenados por prioridad automática
- Filtrar por estación:
  🥩 Parrilla
  🍟 Fritos
  🍕 Horno
  🍺 Bar
  🥗 Ensaladas
- Ver tipo de pedido (Mesa 5, Domicilio, Para llevar)
- Ver hora de ingreso del pedido
- Ver tiempo de espera actual
- Ver alertas de pedidos urgentes (+30 min)

GESTIÓN DE PREPARACIÓN:
- Ver detalles de cada ítem:
  - Nombre producto
  - Cantidad
  - Notas especiales del mesero/cliente
  - Estación asignada
  - Tiempo estimado
- INICIAR preparación:
  - Clic en "Iniciar"
  - status: 'queued' → 'preparing'
  - started_at = NOW()
  - Timer visual inicia
- MARCAR como listo:
  - Clic en "Listo"
  - status: 'preparing' → 'ready'
  - completed_at = NOW()
  - Sistema auto-notifica:
    * WebSocket a mesero (si dine-in)
    * WhatsApp a cliente (si delivery)
    * Actualiza order_item.status = 'ready'

DASHBOARD EN TIEMPO REAL:
- Ver contador de pedidos:
  🟡 En cola: X
  🟠 En preparación: X
  🟢 Listos: X
- Ver todos los pedidos simultáneamente
- Recibir alertas sonoras de nuevos pedidos
- Ver prioridad visual (colores)

NOTIFICACIONES:
- Sonido cuando llega nuevo pedido
- Alerta visual pedidos urgentes
- Contador en tiempo real

❌ NO PUEDE:
- Modificar contenido de pedidos
- Cambiar precios
- Ver datos personales de clientes
- Ver datos de pago
- Acceder a reportes
- Modificar menú
- Ver historial antiguo (solo activos)
- Cancelar pedidos (solo admin)
- Cambiar horarios
- Ver ventas/estadísticas
- Crear pedidos
Flujo de Uso:
PANTALLA PRINCIPAL (Actualización automática):
┌──────────────────────────────────────────────────────┐
│ 👨‍🍳 COCINA - TODAS LAS ESTACIONES  [🔄] 14:35:22    │
├──────────────────────────────────────────────────────┤
│ 📊 🟡 Cola: 5│🟠 Preparando: 3│🟢 Listos: 2        │
├──────────────────────────────────────────────────────┤
│ Filtros: [Todas✓][🥩Parrilla][🍟Fritos][🍕Horno]   │
├──────────────────────────────────────────────────────┤
│ 🔴 URGENTE - Más de 30 minutos esperando             │
│                                                      │
│ ┌─────────────────────────────────────────────────┐  │
│ │ 🔔 PED-001 │ Mesa 5 │ ⏱️ 35 min | Mesero: Carlos│  │
│ │                                                 │  │
│ │ • Picada Especial          x1                   │  │
│ │   🥩 Estación: PARRILLA                         │  │
│ │   📝 Sin cebolla, bien cocida                   │  │
│ │   ⏱️ Tiempo estimado: 30 min                    │  │
│ │                                                 │  │
│ │ • Pizza Hawaiana           x1                   │  │
│ │   🍕 Estación: HORNO                            │  │
│ │   📝 Extra queso                                │  │
│ │   ⏱️ Tiempo estimado: 25 min                    │  │
│ │                                                 │  │
│ │        [▶️ INICIAR PREPARACIÓN]                 │  │
│ └─────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│ 🟡 EN COLA (4)                                       │
│                                                      │
│ ┌─────────────────────────────────────────────────┐  │
│ │ PED-002 │ Domicilio │ ⏱️ 12 min | 📞 301234567 │  │
│ │                                                 │  │
│ │ • Hamburguesa Especial     x2                   │  │
│ │   🍔 Estación: FRITOS                           │  │
│ │   ⏱️ Tiempo estimado: 15 min                    │  │
│ │                                                 │  │
│ │ • Papas Fritas             x2                   │  │
│ │   🍟 Estación: FRITOS                           │  │
│ │   ⏱️ Tiempo estimado: 10 min                    │  │
│ │                                                 │  │
│ │        [▶️ INICIAR]                             │  │
│ └─────────────────────────────────────────────────┘  │
│                                                      │
│ ┌─────────────────────────────────────────────────┐  │
│ │ PED-003 │ Para Llevar │ ⏱️ 8 min | Mostrador   │  │
│ │                                                 │  │
│ │ • Ensalada César           x1                   │  │
│ │   🥗 Estación: ENSALADAS                        │  │
│ │   📝 Sin crutones                               │  │
│ │   ⏱️ Tiempo estimado: 10 min                    │  │
│ │                                                 │  │
│ │        [▶️ INICIAR]                             │  │
│ └─────────────────────────────────────────ReintentarMDContinuar──────────┘  │
├──────────────────────────────────────────────────────┤
│ 🟠 EN PREPARACIÓN (3)                                │
│                                                      │
│ ┌─────────────────────────────────────────────────┐  │
│ │ ⏰ PED-004 │ Mesa 8 │ Iniciado hace 18 min      │  │
│ │                                                 │  │
│ │ • Lasaña                   x2                   │  │
│ │   🍕 Estación: HORNO                            │  │
│ │   ⏱️ Tiempo estimado: 25 min                    │  │
│ │   ⏲️ Tiempo restante: 7 min                     │  │
│ │   ████████████░░░░░ 70%                        │  │
│ │                                                 │  │
│ │        [✅ MARCAR LISTO]                        │  │
│ └─────────────────────────────────────────────────┘  │
│                                                      │
│ ┌─────────────────────────────────────────────────┐  │
│ │ ⏰ PED-005 │ Domicilio │ Iniciado hace 10 min   │  │
│ │                                                 │  │
│ │ • Churrasco                x1                   │  │
│ │   🥩 Estación: PARRILLA                         │  │
│ │   📝 Término 3/4                                │  │
│ │   ⏱️ Tiempo estimado: 20 min                    │  │
│ │   ⏲️ Tiempo restante: 10 min                    │  │
│ │   ██████░░░░░░░░░░ 50%                         │  │
│ │                                                 │  │
│ │        [✅ MARCAR LISTO]                        │  │
│ └─────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│ 🟢 LISTOS PARA SERVIR/ENTREGAR (2)                   │
│                                                      │
│ ┌─────────────────────────────────────────────────┐  │
│ │ ✅ PED-006 │ Mesa 3 │ Listo hace 3 min          │  │
│ │                                                 │  │
│ │ • Pizza Napolitana         x1                   │  │
│ │ • Cerveza Club             x2                   │  │
│ │                                                 │  │
│ │ 📢 Mesero notificado                            │  │
│ └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
CUANDO LLEGA NUEVO PEDIDO (WebSocket):
→ Sonido de alerta: "¡Nuevo pedido!"
→ Aparece en la parte superior de "EN COLA"
→ Animación de entrada (destello)
→ Prioridad calculada automáticamente
AL HACER CLIC EN "INICIAR":
→ Item se mueve a sección "EN PREPARACIÓN"
→ Timer visual comienza
→ Status cambia: queued → preparing
→ started_at = NOW()
AL HACER CLIC EN "MARCAR LISTO":
→ Item se mueve a sección "LISTOS"
→ Status cambia: preparing → ready
→ completed_at = NOW()
→ Backend automáticamente:

Actualiza order_item.status = 'ready'
Si dine-in: WebSocket notifica mesero
Si delivery: WhatsApp notifica cliente
Si todos items listos: order.status = 'ready'

FILTRO POR ESTACIÓN (Ejemplo: Clic en "🥩 Parrilla"):
→ Muestra solo items con station='parrilla'
→ Otros filtros disponibles:

Fritos (hamburguesas, papas, etc)
Horno (pizzas, lasañas, etc)
Bar (bebidas)
Ensaladas
Postres


---

### 👨‍💼 ROL 4: ADMIN (Dueño/Gerente)

#### Interface:
- PWA Admin (Escritorio/Tablet)

#### Permisos:
✅ PUEDE (ACCESO TOTAL):
═══════════════════════════════════════════════════════
📋 MÓDULO 1: GESTIÓN DE MENÚ
═══════════════════════════════════════════════════════
CATEGORÍAS:

CREAR categorías nuevas:

Nombre (ej: "BEBIDAS")
Subir imagen
Definir orden de visualización
Activar/desactivar


EDITAR categorías existentes (todos los campos)
ELIMINAR categorías (soft delete)
Cambiar orden visual (drag & drop)

SUBCATEGORÍAS:

CREAR subcategorías:

Nombre (ej: "GASEOSAS")
Asignar a categoría padre
Subir imagen
Definir orden
Activar/desactivar


EDITAR subcategorías
ELIMINAR subcategorías
Reorganizar orden

PRODUCTOS:

CREAR productos nuevos:

Nombre (ej: "Coca-Cola 1.5L")
Descripción completa
Precio de venta
Costo de domicilio
Tiempo de preparación (minutos)
Subir/cambiar FOTO del producto
Asignar categoría → subcategoría
Asignar estación de cocina
Status: active/inactive (toggle switch)


EDITAR productos existentes:

Modificar cualquier campo
Cambiar precio (histórico se mantiene en orders)
Actualizar foto
Cambiar categorización


ACTIVAR/DESACTIVAR productos:

Toggle switch simple
Efecto INMEDIATO en frontend:

Desactivar → NO aparece en widget/PWA cliente/mesero
Activar → Aparece inmediatamente


Productos inactivos se mantienen en BD (histórico)


ELIMINAR productos (soft delete):

No se borra físicamente
Se marca como eliminado
No aparece en ningún frontend
Histórico de órdenes se mantiene


OPERACIONES MASIVAS:

Seleccionar múltiples productos (checkboxes)
Activar/desactivar en lote
Cambiar categoría en lote
Ajustar precios en porcentaje (ej: +10%)


IMPORTAR/EXPORTAR:

Importar menú desde Excel (template)
Exportar menú completo a Excel
Exportar a PDF con imágenes



GESTIÓN DE IMÁGENES:

Subir fotos de productos
Subir fotos de categorías/subcategorías
Optimización automática de imágenes
Vista previa antes de guardar
Galería de imágenes del restaurante

═══════════════════════════════════════════════════════
📦 MÓDULO 2: GESTIÓN DE PEDIDOS
═══════════════════════════════════════════════════════
VISUALIZACIÓN:

Ver TODOS los pedidos (domicilio + mesas + para llevar)
Ver pedidos en tiempo real (WebSocket dashboard)
Vista de lista completa con scroll infinito

FILTROS AVANZADOS:

Por fecha:

Hoy
Ayer
Esta semana
Este mes
Rango personalizado (desde - hasta)


Por estado:

Pendientes
Confirmados
En preparación
Listos
Entregados
Cancelados


Por tipo:

Delivery (domicilio)
Dine-in (mesas)
Takeout (para llevar)


Por mesero (dropdown lista de meseros)
Por método de pago:

Efectivo
Tarjeta
Transferencia
Datafono


Por cliente (búsqueda por nombre/teléfono)
Por rango de monto (ej: $50K - $100K)

BÚSQUEDA:

Por número de pedido (PED-XXXXX)
Por nombre de cliente
Por teléfono de cliente
Por producto en el pedido

DETALLE DE PEDIDO:

Ver información completa:

Número de pedido
Fecha y hora de creación
Cliente (nombre, teléfono, dirección)
Tipo de pedido
Mesero asignado (si aplica)
Mesa asignada (si aplica)
Items ordenados con:

Nombre producto
Cantidad
Precio unitario (snapshot)
Subtotal por ítem
Notas especiales


Subtotal
Costo de domicilio
Total
Método de pago
Comentarios del cliente
Timeline completo:

Creado: [timestamp]
Confirmado: [timestamp]
En preparación: [timestamp]
Listo: [timestamp]
Entregado: [timestamp]





ACCIONES SOBRE PEDIDOS:

CAMBIAR estado manualmente:

Confirmar pedido pendiente
Marcar como preparando
Marcar como listo
Marcar como entregado
CANCELAR pedido (con razón)


EDITAR pedido (solo si no está en cocina):

Agregar items
Eliminar items
Cambiar dirección
Actualizar notas


REIMPRIMIR ticket/factura
CONTACTAR cliente:

Botón "Llamar" (abre marcador)
Botón "WhatsApp" (abre chat)


ASIGNAR mesero diferente (si dine-in)
GENERAR factura PDF
ENVIAR comprobante por email

REPORTES DE VENTAS:

Ventas por período:

Diarias
Semanales
Mensuales
Anuales
Rango personalizado


Gráficos interactivos (Recharts):

Ventas por día (gráfico de barras)
Ventas por hora (línea temporal)
Comparativa mes actual vs anterior
Tendencia de ventas (gráfico de línea)


Métricas clave:

Total vendido
Número de pedidos
Ticket promedio
Método de pago más usado


Exportar reportes:

Excel (.xlsx)
PDF
CSV



═══════════════════════════════════════════════════════
👥 MÓDULO 3: GESTIÓN DE CLIENTES
═══════════════════════════════════════════════════════
BASE DE DATOS:

Ver listado completo de clientes
Búsqueda por:

Nombre
Teléfono
Email
Código de cliente (CLI-XXXXX)


Paginación (50 clientes por página)

DETALLE DE CLIENTE:

Información personal:

Código único
Nombre completo
Teléfono
Email
Estado (activo/inactivo)
Fecha de registro


Direcciones guardadas (hasta 3):

Dirección 1, 2, 3
Editar direcciones
Eliminar dirección


Historial de pedidos completo:

Lista de todos los pedidos
Fechas, montos, estados
Click para ver detalle


Estadísticas del cliente:

Total de pedidos
Total gastado (lifetime value)
Ticket promedio
Frecuencia de compra
Última compra (hace X días)
Productos favoritos (más pedidos)
Método de pago preferido



SEGMENTACIÓN:

Clientes VIP:

Gastos > $500.000
Frecuencia > 10 pedidos/mes


Clientes frecuentes:

Al menos 1 pedido/semana


Clientes nuevos:

Registrados hace < 30 días


Clientes inactivos:

Sin pedidos > 60 días


Crear segmentos personalizados

ACCIONES:

EDITAR información del cliente
ACTIVAR/DESACTIVAR cliente
AGREGAR notas internas sobre el cliente
ENVIAR promoción vía WhatsApp
EXPORTAR base de clientes a Excel
VER mapa de ubicaciones (si geo disponible)

REPORTES DE CLIENTES:

Cliente más frecuente
Cliente con mayor gasto
Clientes nuevos por período
Tasa de retención
Promedio de pedidos por cliente
Distribución geográfica (por zona)

═══════════════════════════════════════════════════════
👨‍🍳 MÓDULO 4: GESTIÓN DE PERSONAL
═══════════════════════════════════════════════════════
MESEROS:

Ver listado completo
CREAR mesero nuevo:

Nombre completo
Teléfono
Crear PIN de 4 dígitos (hasheado)
Asignar código (MESERO-001)
Estado: activo


EDITAR mesero:

Actualizar datos
CAMBIAR PIN (reset)
Activar/desactivar


ELIMINAR mesero (soft delete)

DESEMPEÑO DE MESEROS:

Estadísticas por mesero:

Pedidos atendidos (hoy/semana/mes)
Ventas generadas
Propinas recibidas
Tiempo promedio de atención
Mesas atendidas
Ticket promedio
Rating (si implementado)


Comparativa entre meseros:

Ranking de ventas
Ranking de eficiencia


Gráficos de desempeño
Exportar reporte de desempeño

TURNOS Y HORARIOS:

Definir turnos de trabajo
Asignar meseros a turnos
Ver quién está trabajando ahora
Historial de asistencia

═══════════════════════════════════════════════════════
🪑 MÓDULO 5: GESTIÓN DE MESAS
═══════════════════════════════════════════════════════
CRUD DE MESAS:

CREAR mesa nueva:

Número/nombre (1, 2, VIP-1)
Capacidad (personas)
Zona (Salón, Terraza, VIP, Bar)
Estado inicial: available


EDITAR mesa:

Cambiar número
Cambiar capacidad
Cambiar zona


ELIMINAR mesa (soft delete)

VISTA EN TIEMPO REAL:

Ver estado actual de TODAS las mesas:

🟢 Disponible
🔴 Ocupada (con pedido PED-XXX)
🟡 Reservada (con reserva RES-XXX)
⚫ Limpiando


Dashboard visual (layout del restaurante)
Actualización automática (WebSocket)
Filtrar por zona
Click en mesa → ver detalle:

Pedido actual
Mesero asignado
Tiempo ocupada
Monto acumulado



ACCIONES:

LIBERAR mesa manualmente
ASIGNAR mesero a mesa
CAMBIAR estado (disponible/limpiando)
Ver historial de rotación:

Cuántas veces usada hoy
Tiempo promedio de ocupación
Ingresos generados



REPORTES:

Mesa más solicitada
Zona más popular
Tiempo promedio por mesa
Rotación por hora del día
Ocupación promedio (%)

═══════════════════════════════════════════════════════
⏰ MÓDULO 6: GESTIÓN DE HORARIOS
═══════════════════════════════════════════════════════
CONFIGURACIÓN POR DÍA:

Ver horario de cada día de la semana
EDITAR horario por día:

Hora de apertura (HH:MM)
Hora de cierre (HH:MM)
Toggle: Abierto/Cerrado
Nota especial (ej: "Cerrado festivo")


Validación:

Cierre debe ser después de apertura
Formato 24 horas



VISTA SEMANAL:
┌──────────────────────────────────────┐
│ Lunes    │ 11:00 - 22:00 │ ✅ Abierto│
│ Martes   │ 11:00 - 22:00 │ ✅ Abierto│
│ Miércoles│ 11:00 - 22:00 │ ✅ Abierto│
│ Jueves   │ 11:00 - 23:00 │ ✅ Abierto│
│ Viernes  │ 11:00 - 00:00 │ ✅ Abierto│
│ Sábado   │ 11:00 - 00:00 │ ✅ Abierto│
│ Domingo  │ CERRADO       │ ❌ Cerrado│
└──────────────────────────────────────┘
DÍAS ESPECIALES:

Marcar día como cerrado (festivo)
Agregar nota visible al cliente
Ejemplos:

"Cerrado por mantenimiento"
"Horario especial Navidad: 12:00-18:00"



EFECTO EN FRONTEND:

Cambios se reflejan INMEDIATAMENTE
Widget valida horario actual
PWA muestra mensaje si cerrado
No permite pedidos fuera de horario

═══════════════════════════════════════════════════════
🪑 MÓDULO 7: GESTIÓN DE RESERVAS (NUEVO)
═══════════════════════════════════════════════════════
VISTA PRINCIPAL:

Ver TODAS las reservas
Filtros:

Por fecha (hoy, mañana, esta semana, mes)
Por estado (pendiente, confirmada, activa, completada, cancelada, no-show)
Por mesa
Por cliente


Búsqueda por código (RES-XXXXX)

ESTADOS DE RESERVAS:
🟡 PENDIENTES DE CONFIRMACIÓN:

Reservas creadas por clientes online
Requieren aprobación de admin
Vista de lista con:

Código reserva
Cliente, teléfono
Fecha, hora
Mesa solicitada
Personas
Solicitudes especiales


ACCIONES:

[✅ CONFIRMAR] → envía notificación cliente
[❌ RECHAZAR] → pide razón, notifica cliente
[✏️ EDITAR] → cambiar mesa, hora, etc



🟢 CONFIRMADAS:

Reservas aprobadas, esperando cliente
Vista con countdown hasta la hora
Alerta cuando faltan 30 min
Sistema auto-libera si no llega (+30 min)
ACCIONES:

[✏️ EDITAR]
[❌ CANCELAR]
[📞 LLAMAR CLIENTE]
[✅ MARCAR COMO ACTIVA] (si llega antes)



🔵 ACTIVAS:

Cliente llegó y está en la mesa
Puede tener pedido asociado
Vista de:

Hora de llegada
Tiempo transcurrido
Pedido actual (si existe)


ACCIONES:

[✅ COMPLETAR] (cuando se van)
[Ver Pedido]



🔴 NO-SHOW:

Liberadas automáticamente (30 min)
Registro para estadísticas
ACCIONES:

[Ver Detalle]
[Contactar Cliente]



CREAR RESERVA MANUAL:

Admin puede crear reserva por teléfono:

Buscar cliente existente o crear nuevo
Seleccionar fecha, hora
Seleccionar mesa disponible
Agregar notas
Estado: 'confirmed' directo
Enviar notificación cliente



EDITAR RESERVA:

Cambiar mesa (si disponible)
Cambiar hora (validar disponibilidad)
Cambiar número de personas
Actualizar solicitudes especiales
Notificar cliente de cambios

CANCELAR RESERVA:

Pedir razón de cancelación
Liberar mesa
Enviar notificación cliente
Registrar en historial

CALENDARIO VISUAL:

Vista de calendario mensual
Ver mesas reservadas por día
Color coding por estado
Click en día → ver reservas del día
Vista de timeline por hora

REPORTES DE RESERVAS:

Total reservas por período
Tasa de confirmación (pendientes → confirmadas)
Tasa de no-show (%)
Mesas más reservadas
Horarios más solicitados
Días con más reservas
Promedio de personas por reserva
Solicitudes especiales más comunes
Exportar a Excel/PDF

CONFIGURACIÓN RESERVAS:

Habilitar/deshabilitar reservas online
Tiempo de auto-liberación (default: 30 min)

Opciones: 15, 30, 45, 60 min


Mesas disponibles para reserva online

Algunas mesas solo presencial


Horarios disponibles para reserva

Puede ser diferente a horario pedidos


Anticipación mínima (ej: 2 horas)
Anticipación máxima (ej: 30 días)

═══════════════════════════════════════════════════════
📊 MÓDULO 8: DASHBOARD Y REPORTES
═══════════════════════════════════════════════════════
DASHBOARD PRINCIPAL:

Métricas en tiempo real:
┌────────────────────────────────┐
│ 💰 Ventas Hoy:     $1.250.000  │
│ 📦 Pedidos Activos:    38      │
│ 🪑 Mesas Ocupadas:    8/15     │
│ 👥 Clientes Nuevos:    24      │
│ 🪑 Reservas Hoy:       12      │
└────────────────────────────────┘
Gráfico ventas por hora (hoy):

Barras interactivas
Hover muestra monto exacto
Identifica horas pico


Top 5 productos más vendidos:

Nombre producto
Unidades vendidas
Ingresos generados
% del total


Pedidos recientes (últimos 10):

Número, tipo, monto, estado
Actualización en tiempo real
Click → ver detalle


Alertas y notificaciones:

🚨 3 productos con stock bajo
⚠️ Mesa 5 abierta +2 horas
🔔 5 reservas pendientes confirmación
❌ 2 pedidos cancelados hoy



REPORTES AVANZADOS:

Reporte de Ventas:

Por período (diario, semanal, mensual, anual)
Comparativas (vs período anterior)
Por categoría de producto
Por tipo de pedido (delivery, dine-in, takeout)
Por método de pago
Por mesero
Gráficos: líneas, barras, tortas


Reporte de Productos:

Más vendidos por unidades
Más vendidos por ingresos
Menos vendidos (candidatos a eliminar)
Por categoría/subcategoría
Análisis de rentabilidad
Horario de mayor demanda por producto


Reporte de Clientes:

Nuevos clientes por período
Clientes más frecuentes
Clientes con mayor gasto
Distribución geográfica
Tasa de retención
Customer Lifetime Value (CLV)
Análisis de churn (clientes perdidos)


Reporte de Meseros:

Ventas por mesero
Pedidos por mesero
Propinas por mesero
Eficiencia (tiempo promedio)
Ranking de desempeño
Comparativa entre períodos


Reporte de Mesas:

Ocupación promedio (%)
Rotación por mesa
Ingresos por mesa
Tiempo promedio de ocupación
Mesas más/menos usadas
Análisis por zona


Reporte de Reservas:

Total reservas por período
Tasa de confirmación
Tasa de no-show
Mesas más reservadas
Análisis de horarios
Solicitudes especiales más comunes


Reporte Financiero:

Ingresos totales
Por método de pago
Tickets de domicilio generados
Propinas totales
Proyecciones
Comparativas año/mes actual vs anterior



EXPORTACIÓN:

Todos los reportes exportables a:

Excel (.xlsx) con fórmulas
PDF con gráficos
CSV para análisis externo


Programar envío automático de reportes:

Diario por email
Semanal
Mensual



═══════════════════════════════════════════════════════
🔔 MÓDULO 9: GESTIÓN DE NOTIFICACIONES
═══════════════════════════════════════════════════════
LOG DE NOTIFICACIONES:

Ver historial completo de notificaciones enviadas
Filtrar por:

Tipo (email, WhatsApp, Telegram)
Estado (enviado, fallido, pendiente)
Fecha
Destinatario


Ver detalle:

Contenido del mensaje
Timestamp de envío
Error (si falló)
Pedido/reserva relacionado



CONFIGURACIÓN:

Email:

SMTP host, puerto
Usuario, contraseña
Email remitente
Templates personalizables


WhatsApp:

Evolution API URL
API Key
Número de envío
Templates de mensajes


Telegram:

Bot Token
Chat ID admin/cocina
Mensajes personalizables



TEMPLATES:

Editar plantillas de mensajes:

Confirmación de pedido
Pedido listo
Pedido en camino
Confirmación de reserva
Recordatorio de reserva
Cancelación


Variables dinámicas:

{{customer_name}}
{{order_number}}
{{total}}
{{reservation_date}}
etc.



REENVIAR:

Botón para reenviar notificación fallida
Enviar notificación manual a cliente

═══════════════════════════════════════════════════════
⚙️ MÓDULO 10: CONFIGURACIÓN GENERAL
═══════════════════════════════════════════════════════
DATOS DEL RESTAURANTE:

Nombre del restaurante
Logo (subir imagen)
Dirección física
Teléfono(s) de contacto
Email de contacto
Redes sociales (URLs)
Descripción/Bio
Horario de atención (resumen)

MÉTODOS DE PAGO:

Activar/desactivar métodos:

Efectivo ✓
Tarjeta ✓
Transferencia ✓
Datafono ✓
Otros


Configurar comisiones (si aplica)

ZONAS DE ENTREGA:

Definir zonas de cobertura
Costo de domicilio por zona
Tiempo estimado por zona
Validación de direcciones

CONFIGURACIÓN PWA:

Tema de colores:

Color primario
Color secundario
Color de acentos


Mensajes de bienvenida (widget/PWA)
Banners promocionales
Habilitar/deshabilitar funciones:

Pedidos a domicilio ✓
Pedidos para llevar ✓
Pedidos en mesa ✓
Reservas online ✓
Propinas sugeridas ✓
Calificaciones ✓



INTEGRACIONES:

Evolution API (WhatsApp)
Telegram Bot
Servicios de email (SMTP)
Pasarelas de pago (futuro)
Google Analytics
Facebook Pixel

BACKUP Y SEGURIDAD:

Backup manual (descargar BD completa)
Programar backups automáticos
Restaurar desde backup
Logs de actividad de admin
Cambiar contraseña admin

USUARIOS DEL SISTEMA:

Crear usuarios admin adicionales
Asignar permisos granulares:

Solo lectura
Gestión de menú
Gestión de pedidos
Reportes
Configuración


Ver log de actividad por usuario

❌ ÚNICO LÍMITE:

No puede romper integridad de BD
No puede eliminar datos críticos de histórico
Debe respetar relaciones entre tablas


---

## 🚀 INSTRUCCIONES PARA DEPLOY

### ARQUITECTURA DE DEPLOY
SERVIDOR VPS (Ubuntu 22.04 LTS)
├── /opt/restaurante-erp/
│   ├── directus/ (Puerto 8055 - interno)
│   └── backend/ (Puerto 4000 - interno)
│
├── /var/www/
│   ├── widget.restaurante.com/ (HTML estático)
│   ├── app.restaurante.com/ (PWA Cliente - build)
│   ├── mesero.restaurante.com/ (PWA Mesero - build)
│   ├── cocina.restaurante.com/ (PWA Cocina - build)
│   └── panel.restaurante.com/ (PWA Admin - build)
│
└── Nginx (Puerto 80/443)
├── api.restaurante.com → proxy → localhost:4000
├── admin.restaurante.com → proxy → localhost:8055
└── Resto de dominios → archivos estáticos

### PASO A PASO PARA CLAUDE CODE / GEMINI CLI
═══════════════════════════════════════════════════════
FASE 1: PREPARACIÓN DEL SERVIDOR
═══════════════════════════════════════════════ReintentarMDContinuar════════════════════════════════════════════════════════
INSTRUCCIÓN 1: Conectar al servidor VPS vía SSH
Comando: ssh root@[IP_DEL_SERVIDOR]
INSTRUCCIÓN 2: Actualizar sistema operativo
Comandos:
apt update && apt upgrade -y
INSTRUCCIÓN 3: Instalar dependencias base
Comandos:
apt install -y curl wget git build-essential
INSTRUCCIÓN 4: Instalar Node.js 20+
Comandos:
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version  # Verificar: debe ser v20.x.x
npm --version
INSTRUCCIÓN 5: Instalar PostgreSQL 15+
Comandos:
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
INSTRUCCIÓN 6: Instalar Nginx
Comandos:
apt install -y nginx
systemctl start nginx
systemctl enable nginx
INSTRUCCIÓN 7: Instalar PM2 (process manager)
Comandos:
npm install -g pm2
INSTRUCCIÓN 8: Instalar Certbot (SSL gratuito)
Comandos:
apt install -y certbot python3-certbot-nginx
═══════════════════════════════════════════════════════
FASE 2: CONFIGURACIÓN DE BASE DE DATOS
═══════════════════════════════════════════════════════
INSTRUCCIÓN 9: Crear base de datos PostgreSQL
Comandos:
sudo -u postgres psql
Dentro de psql:
CREATE DATABASE restaurante_erp;
CREATE USER directus WITH PASSWORD 'password_seguro_aqui';
GRANT ALL PRIVILEGES ON DATABASE restaurante_erp TO directus;
ALTER DATABASE restaurante_erp OWNER TO directus;
\q
INSTRUCCIÓN 10: Configurar acceso remoto PostgreSQL (si necesario)
Archivo: /etc/postgresql/15/main/postgresql.conf
Cambiar: listen_addresses = 'localhost'
A: listen_addresses = '*'  # Solo si necesitas acceso remoto
Archivo: /etc/postgresql/15/main/pg_hba.conf
Agregar línea:
host    restaurante_erp    directus    0.0.0.0/0    md5
Reiniciar:
systemctl restart postgresql
═══════════════════════════════════════════════════════
FASE 3: INSTALACIÓN Y CONFIGURACIÓN DE DIRECTUS
═══════════════════════════════════════════════════════
INSTRUCCIÓN 11: Crear directorio del proyecto
Comandos:
mkdir -p /opt/restaurante-erp
cd /opt/restaurante-erp
INSTRUCCIÓN 12: Instalar Directus
Comandos:
npm install directus
INSTRUCCIÓN 13: Inicializar Directus
Comandos:
npx directus init
INSTRUCCIÓN 14: Configurar variables de entorno Directus
Archivo: /opt/restaurante-erp/.env
Contenido:
KEY=reemplazar_con_key_aleatoria_32_caracteres_minimo
SECRET=reemplazar_con_secret_aleatorio_32_caracteres_minimo
DB_CLIENT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=restaurante_erp
DB_USER=directus
DB_PASSWORD=password_seguro_aqui
ADMIN_EMAIL=admin@restaurante.com
ADMIN_PASSWORD=password_admin_seguro
PUBLIC_URL=https://admin.restaurante.com
CORS_ENABLED=true
CORS_ORIGIN=https://api.restaurante.com,https://app.restaurante.com,https://mesero.restaurante.com,https://cocina.restaurante.com,https://panel.restaurante.com
INSTRUCCIÓN 15: Ejecutar migraciones iniciales de Directus
Comandos:
npx directus bootstrap
INSTRUCCIÓN 16: Iniciar Directus con PM2
Comandos:
pm2 start "npx directus start" --name directus
pm2 save
pm2 startup
INSTRUCCIÓN 17: Verificar que Directus está corriendo
Comandos:
curl http://localhost:8055/server/health
Debe retornar: {"status":"ok"}
INSTRUCCIÓN 18: Acceder a panel de Directus
Navegador: http://[IP_SERVIDOR]:8055
Login: admin@restaurante.com / password_admin_seguro
INSTRUCCIÓN 19: Crear Collections en Directus (vía UI)
CREAR EN ESTE ORDEN (por dependencias):

Collection: menu_categories
Campos:

id (UUID, PK, auto)
name (String, requerido)
image_url (String, nullable)
display_order (Integer, default: 0)
is_active (Boolean, default: true)
created_at (Timestamp, auto)
updated_at (Timestamp, auto)


Collection: menu_subcategories
Campos:

id (UUID, PK, auto)
category_id (UUID, M2O → menu_categories)
name (String, requerido)
image_url (String, nullable)
display_order (Integer, default: 0)
is_active (Boolean, default: true)
created_at (Timestamp, auto)
updated_at (Timestamp, auto)


Collection: menu_items
Campos:

id (UUID, PK, auto)
menu_code (String, UNIQUE, requerido)
category_id (UUID, M2O → menu_categories)
subcategory_id (UUID, M2O → menu_subcategories)
name (String, requerido)
description (Text, requerido)
price (Decimal, requerido)
delivery_cost (Decimal, default: 0)
status (String, default: 'active')
image_url (String, nullable)
preparation_time (Integer, default: 15)
station (String, nullable)
created_at (Timestamp, auto)
updated_at (Timestamp, auto)

Índices:

UNIQUE: menu_code
INDEX: (status, category_id, subcategory_id)


Collection: customers
Campos:

id (UUID, PK, auto)
customer_code (String, UNIQUE, requerido)
full_name (String, requerido)
phone (String, UNIQUE, requerido)
email (String, nullable)
address_1 (Text, requerido)
address_2 (Text, nullable)
address_3 (Text, nullable)
notes (Text, nullable)
is_active (Boolean, default: true)
created_at (Timestamp, auto)
updated_at (Timestamp, auto)

Índices:

UNIQUE: customer_code, phone


Collection: waiters
Campos:

id (UUID, PK, auto)
waiter_code (String, UNIQUE, requerido)
full_name (String, requerido)
phone (String, requerido)
pin_code (String, requerido) # Hash bcrypt
is_active (Boolean, default: true)
current_orders (Integer, default: 0)
created_at (Timestamp, auto)
updated_at (Timestamp, auto)

Índices:

UNIQUE: waiter_code


Collection: tables
Campos:

id (UUID, PK, auto)
table_number (String, UNIQUE, requerido)
capacity (Integer, requerido)
zone (String, requerido)
status (String, default: 'available')
current_order_id (UUID, nullable)
current_reservation_id (UUID, nullable)
created_at (Timestamp, auto)
updated_at (Timestamp, auto)

Índices:

UNIQUE: table_number


Collection: schedules
Campos:

id (UUID, PK, auto)
day_of_week (String, requerido) # MONDAY-SUNDAY
opening_time (Time, requerido)
closing_time (Time, requerido)
is_open (Boolean, default: true)
special_note (Text, nullable)
created_at (Timestamp, auto)
updated_at (Timestamp, auto)

Índices:

UNIQUE: day_of_week


Collection: reservations ⭐ NUEVA
Campos:

id (UUID, PK, auto)
reservation_number (String, UNIQUE, requerido)
customer_id (UUID, M2O → customers)
table_id (UUID, M2O → tables)
reservation_date (Date, requerido)
reservation_time (Time, requerido)
party_size (Integer, requerido)
status (String, default: 'pending')
customer_name (String, requerido)
customer_phone (String, requerido)
customer_email (String, nullable)
special_requests (Text, nullable)
created_at (Timestamp, auto)
confirmed_at (Timestamp, nullable)
activated_at (Timestamp, nullable)
completed_at (Timestamp, nullable)
cancelled_at (Timestamp, nullable)
auto_released_at (Timestamp, nullable)

Índices:

UNIQUE: reservation_number
INDEX: (reservation_date, reservation_time, status)
INDEX: (table_id, status)
INDEX: customer_phone


Collection: orders
Campos:

id (UUID, PK, auto)
order_number (String, UNIQUE, requerido)
customer_id (UUID, M2O → customers)
waiter_id (UUID, M2O → waiters, nullable)
table_id (UUID, M2O → tables, nullable)
reservation_id (UUID, M2O → reservations, nullable)
order_type (String, requerido) # delivery/dine_in/takeout
status (String, default: 'pending')
payment_method (String, requerido)
subtotal (Decimal, requerido)
delivery_cost (Decimal, default: 0)
total (Decimal, requerido)
delivery_address (Text, nullable)
customer_notes (Text, nullable)
created_at (Timestamp, auto)
confirmed_at (Timestamp, nullable)
completed_at (Timestamp, nullable)

Índices:

UNIQUE: order_number
INDEX: (status, order_type, created_at)


Collection: order_items
Campos:

id (UUID, PK, auto)
order_id (UUID, M2O → orders)
menu_item_id (UUID, M2O → menu_items)
quantity (Integer, requerido)
unit_price (Decimal, requerido) # SNAPSHOT
item_delivery_cost (Decimal, default: 0) # SNAPSHOT
subtotal (Decimal, requerido)
special_instructions (Text, nullable)
status (String, default: 'pending')
created_at (Timestamp, auto)


Collection: kitchen_queue
Campos:

id (UUID, PK, auto)
order_item_id (UUID, O2O → order_items)
priority (Integer, default: 3)
status (String, default: 'queued')
assigned_station (String, nullable)
started_at (Timestamp, nullable)
completed_at (Timestamp, nullable)
estimated_time (Integer, nullable)
created_at (Timestamp, auto)


Collection: sessions
Campos:

id (UUID, PK, auto)
session_id (String, UNIQUE, requerido)
customer_id (UUID, M2O → customers, nullable)
phone (String, nullable)
current_level (Integer, default: 0)
is_open (Boolean, default: true)
is_registered (Boolean, default: false)
cart (JSON, nullable)
selected_category (String, nullable)
selected_subcategory (String, nullable)
temp_menu_item (UUID, nullable)
checkout_data (JSON, nullable)
reservation_data (JSON, nullable)
created_at (Timestamp, auto)
updated_at (Timestamp, auto)
expires_at (Timestamp, requerido)

Índices:

UNIQUE: session_id
INDEX: expires_at


Collection: notifications
Campos:

id (UUID, PK, auto)
order_id (UUID, M2O → orders, nullable)
reservation_id (UUID, M2O → reservations, nullable)
notification_type (String, requerido)
recipient (String, requerido)
status (String, default: 'pending')
content (JSON, nullable)
sent_at (Timestamp, nullable)
error_message (Text, nullable)
created_at (Timestamp, auto)



INSTRUCCIÓN 20: Configurar permisos en Directus (vía UI)
ROLES Y PERMISOS:
Role: Public

menu_categories: READ (all)
menu_subcategories: READ (all)
menu_items: READ (where status = 'active')
schedules: READ (all)
reservations: CREATE
orders: CREATE

Role: Customer (Authenticated)

customers: READ (own), UPDATE (own)
orders: READ (where customer_id = $CURRENT_USER)
reservations: READ (where customer_id = $CURRENT_USER), UPDATE (own), DELETE (own)
sessions: READ (own), UPDATE (own)

Role: Waiter

menu_items: READ (where status = 'active')
orders: CREATE, READ (where waiter_id = $CURRENT_USER), UPDATE (own)
order_items: CREATE, UPDATE
tables: READ (all), UPDATE (all)
kitchen_queue: READ (all)
reservations: READ (all), UPDATE (only status to 'active')
waiters: READ (own)

Role: Kitchen

kitchen_queue: READ (all), UPDATE (status, started_at, completed_at)
order_items: READ (all), UPDATE (status)
orders: READ (all)

Role: Admin

ALL COLLECTIONS: FULL ACCESS (CRUD)

INSTRUCCIÓN 21: Crear datos iniciales
VIA DIRECTUS UI:
Schedules (7 registros):

MONDAY: 11:00 - 22:00, is_open: true
TUESDAY: 11:00 - 22:00, is_open: true
WEDNESDAY: 11:00 - 22:00, is_open: true
THURSDAY: 11:00 - 23:00, is_open: true
FRIDAY: 11:00 - 00:00, is_open: true
SATURDAY: 11:00 - 00:00, is_open: true
SUNDAY: CERRADO, is_open: false

Menu Categories (ejemplos):

PICADAS (image_url, display_order: 1)
PIZZAS Y PASTAS (image_url, display_order: 2)
COMIDAS RÁPIDAS (image_url, display_order: 3)
BEBIDAS (image_url, display_order: 4)

Tables (ejemplos):

Mesa 1: capacity 4, zone: Salón
Mesa 2: capacity 2, zone: Salón
Mesa 3: capacity 6, zone: Salón
Mesa 4: capacity 4, zone: Terraza
Mesa 5: capacity 6, zone: Terraza
Mesa VIP-1: capacity 8, zone: VIP

Waiters (ejemplos):

Mesero 1: waiter_code: MESERO-001, PIN: hash de "1234"
Mesero 2: waiter_code: MESERO-002, PIN: hash de "5678"

═══════════════════════════════════════════════════════
FASE 4: CONSTRUCCIÓN DEL BACKEND NODE.JS
═══════════════════════════════════════════════════════
INSTRUCCIÓN 22: Crear estructura del backend
Comandos:
cd /opt/restaurante-erp
mkdir backend
cd backend
npm init -y
INSTRUCCIÓN 23: Instalar dependencias del backend
Comandos:
npm install express @directus/sdk cors helmet dotenv bcryptjs jsonwebtoken express-rate-limit date-fns date-fns-tz socket.io nodemailer axios node-cron
npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/nodemailer ts-node nodemon
INSTRUCCIÓN 24: Configurar TypeScript
Archivo: tsconfig.json
Contenido:
{
"compilerOptions": {
"target": "ES2020",
"module": "commonjs",
"outDir": "./dist",
"rootDir": "./src",
"strict": true,
"esModuleInterop": true,
"skipLibCheck": true,
"forceConsistentCasingInFileNames": true
},
"include": ["src/**/*"],
"exclude": ["node_modules"]
}
INSTRUCCIÓN 25: Crear estructura de carpetas backend
Comandos:
mkdir -p src/{config,services,routes,middleware,state-machine/levels,utils}
INSTRUCCIÓN 26: Configurar variables de entorno backend
Archivo: /opt/restaurante-erp/backend/.env
Contenido:
NODE_ENV=production
PORT=4000
TZ=America/Bogota
DIRECTUS_URL=http://localhost:8055
DIRECTUS_ADMIN_EMAIL=admin@restaurante.com
DIRECTUS_ADMIN_PASSWORD=password_admin_seguro
JWT_SECRET=secret_jwt_minimo_32_caracteres_aleatorios
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notificaciones@restaurante.com
SMTP_PASS=app_password_gmail
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=tu_api_key_evolution
TELEGRAM_BOT_TOKEN=123456:ABC-DEF-GHI
TELEGRAM_CHAT_ID=-100123456789
VAPID_PUBLIC_KEY=tu_vapid_public_key
VAPID_PRIVATE_KEY=tu_vapid_private_key
VAPID_SUBJECT=mailto:admin@restaurante.com
ALLOWED_ORIGINS=https://restaurante.com,https://app.restaurante.com,https://mesero.restaurante.com,https://cocina.restaurante.com,https://panel.restaurante.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
INSTRUCCIÓN 27: Crear archivos principales del backend
ARCHIVOS A CREAR (CLAUDE CODE/GEMINI DEBE GENERARLOS):

src/config/directus.ts

Configurar SDK de Directus
Exportar instancia autenticada


src/config/constants.ts

Definir constantes (estados, tipos, enums)


src/middleware/auth.ts

Middleware de autenticación JWT
Verificar tokens
Roles y permisos


src/middleware/validation.ts

Validación de inputs
Schemas de validación


src/middleware/errorHandler.ts

Manejo centralizado de errores
Logger de errores


src/services/directus.service.ts

Servicio base para CRUD con Directus
Métodos: findOne, findMany, createOne, updateOne, deleteOne


src/services/schedule.service.ts ⚠️ CRÍTICO

validateCurrentSchedule()
Lógica:

Obtener día actual en America/Bogota
Convertir a MONDAY-SUNDAY
Query schedules WHERE day_of_week = ? AND is_open = true
Comparar hora actual vs opening/closing
Retornar: {is_open, day, opening_time, closing_time}




src/services/menu.service.ts ⚠️ CRÍTICO

getActiveCategories()
getActiveSubcategories(categoryId)
getActiveProducts(subcategoryId)
getProductById(id, validateActive = true)
SIEMPRE filtrar status='active' excepto en admin


src/services/cart.service.ts ⚠️ CRÍTICO

addToCart(sessionId, menuItemId)

RE-VALIDAR horario
RE-VALIDAR producto activo
Agregar al session.cart (JSONB)


calculateDeliveryCost(cartItems)

return Math.max(...delivery_costs) # NO SUMAR




src/services/order.service.ts ⚠️ CRÍTICO

createOrder(data)

Validar horario final
Validar todos productos activos
Generar order_number: PED-{timestamp}-{random}
Crear order + order_items (snapshot precios)
Calcular delivery = MAX(item_delivery_cost)
Insert kitchen_queue
Enviar notificaciones
Limpiar session.cart




src/services/reservation.service.ts ⭐ NUEVO

getAvailableTables(date, time, partySize)

Query mesas disponibles
Validar no haya reserva en misma mesa/hora


createReservation(data)

Validar horario restaurante
Validar mesa disponible
Generar reservation_number: RES-{timestamp}-{random}
Crear registro status='pending'
Enviar notificaciones


confirmReservation(id) # ADMIN

Update status='confirmed', confirmed_at=NOW()
Notificar cliente


activateReservation(id) # MESERO

Update status='active', activated_at=NOW()
Table status='occupied'


autoReleaseReservations() # CRON

Query reservas confirmed +30 min pasadas
Update status='no_show', auto_released_at=NOW()
Liberar mesa
Notificar admin




src/services/kitchen.service.ts

getQueuedOrders(station?)
startPreparation(queueItemId)
markAsReady(queueItemId)
calculatePriority(orderItem)


src/services/notification.service.ts ⚠️ CRÍTICO

sendOrderConfirmation(order)

Email al admin
WhatsApp al cliente
Telegram a cocina


sendReservationConfirmation(reservation)

Email al cliente
WhatsApp al cliente
Email al admin (pendiente confirmación)
Telegram al admin


sendEmail(to, subject, html)
sendWhatsApp(phone, message)
sendTelegram(chatId, message)


src/services/session.service.ts

getOrCreateSession(sessionId)
updateSession(sessionId, data)
clearExpiredSessions() # CRON


src/state-machine/dispatcher.ts

processMessage(sessionId, message)
Distribuir a nivel correspondiente


src/state-machine/levels/level-0.ts

Validar horario
Mostrar menú inicial: Pedir / Reservar


src/state-machine/levels/level-1.ts

Capturar teléfono
Buscar/crear cliente


src/state-machine/levels/level-2.ts

Si eligió "Pedir": mostrar categorías
Si eligió "Reservar": ir a flujo reserva


src/state-machine/levels/level-3-4-5.ts

Navegación menú dinámico
Agregar al carrito (con RE-VALIDACIONES)


src/state-machine/levels/level-6.ts

Mostrar carrito


src/state-machine/levels/level-7-13.ts

Checkout (dirección, pago, notas)


src/state-machine/levels/level-14-15.ts

Confirmar y procesar pedido


src/state-machine/levels/reservation-flow.ts ⭐ NUEVO

Capturar fecha, hora, personas
Mostrar mesas disponibles
Capturar solicitudes especiales
Confirmar reserva


src/routes/chat.routes.ts

POST /api/chat/process
GET /api/chat/schedule
GET /api/chat/menu
POST /api/chat/cart/add
GET /api/chat/cart/:sessionId


src/routes/menu.routes.ts

GET /api/menu/categories
GET /api/menu/subcategories/:categoryId
GET /api/menu/items
GET /api/menu/items/:id


src/routes/order.routes.ts

POST /api/orders
GET /api/orders
GET /api/orders/:id
PATCH /api/orders/:id/status


src/routes/reservation.routes.ts ⭐ NUEVO

POST /api/reservations
GET /api/reservations/available-tables
GET /api/reservations
GET /api/reservations/:id
PATCH /api/reservations/:id/confirm
PATCH /api/reservations/:id/activate
PATCH /api/reservations/:id/cancel


src/routes/kitchen.routes.ts

GET /api/kitchen/queue
POST /api/kitchen/:itemId/start
POST /api/kitchen/:itemId/complete


src/routes/waiter.routes.ts

POST /api/waiters/login
GET /api/waiters/orders
GET /api/waiters/tables
POST /api/waiters/tables/:id/occupy


src/routes/admin.routes.ts

GET /api/admin/dashboard
Todos los endpoints CRUD para admin


src/index.ts

Inicializar Express
Configurar middleware
Registrar rutas
Iniciar WebSocket server
Iniciar cron jobs
Escuchar en puerto 4000


src/websocket.ts

Configurar Socket.IO
Namespaces: /kitchen, /waiter, /admin
Eventos: new_order, order_updated, item_ready


src/cron.ts

autoReleaseReservations() cada 5 min
clearExpiredSessions() cada hora


src/utils/validators.ts

Validaciones (teléfono 10 dígitos, etc)


src/utils/normalizers.ts

normalizePhone()


src/utils/generators.ts

generateOrderNumber()
generateReservationNumber()
generateCustomerCode()



INSTRUCCIÓN 28: Scripts en package.json
Archivo: package.json
Agregar scripts:
{
"scripts": {
"dev": "nodemon src/index.ts",
"build": "tsc",
"start": "node dist/index.js"
}
}
INSTRUCCIÓN 29: Compilar y ejecutar backend
Comandos:
npm run build
pm2 start dist/index.js --name backend
pm2 save
INSTRUCCIÓN 30: Verificar backend corriendo
Comandos:
curl http://localhost:4000/api/health
pm2 logs backend
═══════════════════════════════════════════════════════
FASE 5: CONSTRUCCIÓN DE FRONTENDS
═══════════════════════════════════════════════════════
INSTRUCCIÓN 31: Widget Chat HTML
Comandos:
cd /opt/restaurante-erp
mkdir widget-chat
cd widget-chat
CREAR ARCHIVOS:

index.html (botón flotante + ventana chat)
chat.js (state machine, llamadas API)
styles.css (estilos responsivos)

Funcionalidad:

Embebible en cualquier sitio web
Chat conversacional guiado por números
Niveles 0-15 para pedidos
Flujo de reservas integrado
LocalStorage para session_id
Fetch API para comunicación con backend

INSTRUCCIÓN 32: PWA Cliente
Comandos:
cd /opt/restaurante-erp
npx create-react-app pwa-cliente --template typescript
cd pwa-cliente
Instalar dependencias:
npm install react-router-dom axios socket.io-client @tanstack/react-query
Instalar Tailwind CSS:
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
CREAR ESTRUCTURA:
src/
├── pages/
│   ├── Home.tsx
│   ├── Menu.tsx
│   ├── Product.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── MyOrders.tsx
│   ├── Profile.tsx
│   ├── Reservations.tsx ⭐ NUEVO
│   └── NewReservation.tsx ⭐ NUEVO
├── components/
│   ├── Header.tsx
│   ├── CategoryCard.tsx
│   ├── ProductCard.tsx
│   ├── CartItem.tsx
│   └── ReservationCard.tsx ⭐ NUEVO
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── reservations.ts ⭐ NUEVO
├── context/
│   ├── AuthContext.tsx
│   └── CartContext.tsx
└── App.tsx
CREAR manifest.json para PWA:
public/manifest.json
Funcionalidad:

Navegación libre del menú
Carrito persistente
Sistema de reservas completo
Notificaciones push
Service Worker (offline)

BUILD:
npm run build
INSTRUCCIÓN 33: PWA Mesero
Comandos:
cd /opt/restaurante-erp
npx create-react-app pwa-mesero --template typescript
cd pwa-mesero
Similar a PWA Cliente pero con:
CREAR ESTRUCTURA:
src/
├── pages/
│   ├── Login.tsx (PIN 4 dígitos)
│   ├── Tables.tsx (vista mesas)
│   ├── NewOrder.tsx (tomar pedido)
│   ├── ActiveOrders.tsx (pedidos activos)
│   ├── Reservations.tsx ⭐ NUEVO (lista reservas del día)
│   └── Stats.tsx (estadísticas personales)
Funcionalidad específica:

Login con PIN
Gestión de mesas
Tomar pedidos
Ver reservas del día
Activar reservas cuando cliente llega
WebSocket para notificaciones

BUILD:
npm run build
INSTRUCCIÓN 34: PWA Cocina
Comandos:ReintentarMDContinuarcd /opt/restaurante-erp
npx create-react-app pwa-cocina --template typescript
cd pwa-cocina
CREAR ESTRUCTURA:
src/
├── pages/
│   └── Kitchen.tsx (pantalla única, fullscreen)
├── components/
│   ├── QueueItem.tsx
│   ├── PreparingItem.tsx
│   └── ReadyItem.tsx
Funcionalidad:

Vista en tiempo real (WebSocket)
Filtros por estación
Timers visuales
Alertas sonoras
Modo kiosk

BUILD:
npm run build
INSTRUCCIÓN 35: PWA Admin
Comandos:
cd /opt/restaurante-erp
npx create-next-app pwa-admin --typescript --tailwind --app
cd pwa-admin
Instalar dependencias:
npm install @tanstack/react-query axios recharts lucide-react @radix-ui/react-dialog @radix-ui/react-dropdown-menu
CREAR ESTRUCTURA:
app/
├── dashboard/
│   └── page.tsx
├── menu/
│   ├── page.tsx
│   ├── categories/page.tsx
│   ├── subcategories/page.tsx
│   └── products/page.tsx
├── orders/
│   ├── page.tsx
│   └── [id]/page.tsx
├── customers/
│   └── page.tsx
├── staff/
│   └── page.tsx
├── tables/
│   └── page.tsx
├── reservations/ ⭐ NUEVO
│   ├── page.tsx
│   ├── calendar/page.tsx
│   └── [id]/page.tsx
├── reports/
│   └── page.tsx
└── settings/
└── page.tsx
Funcionalidad completa:

Dashboard en tiempo real
CRUD completo de todas las entidades
Sistema de reservas con calendario
Reportes con gráficos (Recharts)
Exportación Excel/PDF
Gestión de imágenes
Configuración del sistema

BUILD:
npm run build
═══════════════════════════════════════════════════════
FASE 6: CONFIGURACIÓN DE NGINX
═══════════════════════════════════════════════════════
INSTRUCCIÓN 36: Copiar builds de frontends
Comandos:
cp -r /opt/restaurante-erp/widget-chat /var/www/widget.restaurante.com
cp -r /opt/restaurante-erp/pwa-cliente/build /var/www/app.restaurante.com
cp -r /opt/restaurante-erp/pwa-mesero/build /var/www/mesero.restaurante.com
cp -r /opt/restaurante-erp/pwa-cocina/build /var/www/cocina.restaurante.com
cp -r /opt/restaurante-erp/pwa-admin/.next /var/www/panel.restaurante.com
INSTRUCCIÓN 37: Configurar Nginx para cada dominio
CREAR ARCHIVOS:

/etc/nginx/sites-available/api.restaurante.com
Contenido:
server {
listen 80;
server_name api.restaurante.com;
location / {
proxy_pass http://localhost:4000;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade;
}
}
/etc/nginx/sites-available/admin.restaurante.com
Contenido:
server {
listen 80;
server_name admin.restaurante.com;
location / {
proxy_pass http://localhost:8055;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade;
}
}

3-7. Similar para app, mesero, cocina, panel, widget
(Servir archivos estáticos)
INSTRUCCIÓN 38: Activar sitios en Nginx
Comandos:
ln -s /etc/nginx/sites-available/api.restaurante.com /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/admin.restaurante.com /etc/nginx/sites-enabled/
Repetir para todos los dominios
nginx -t  # Verificar configuración
systemctl reload nginx
═══════════════════════════════════════════════════════
FASE 7: CONFIGURACIÓN DE SSL
═══════════════════════════════════════════════════════
INSTRUCCIÓN 39: Obtener certificados SSL
Comandos:
certbot --nginx -d api.restaurante.com -d admin.restaurante.com -d app.restaurante.com -d mesero.restaurante.com -d cocina.restaurante.com -d panel.restaurante.com -d widget.restaurante.com
Seguir wizard interactivo
Elegir: Redirect HTTP to HTTPS
INSTRUCCIÓN 40: Configurar renovación automática
Comando:
certbot renew --dry-run  # Test
crontab -e
Agregar línea:
0 3 * * * certbot renew --quiet
═══════════════════════════════════════════════════════
FASE 8: VERIFICACIÓN Y PRUEBAS
═══════════════════════════════════════════════════════
INSTRUCCIÓN 41: Verificar servicios corriendo
Comandos:
pm2 status  # Debe mostrar directus y backend en "online"
systemctl status nginx
systemctl status postgresql
INSTRUCCIÓN 42: Verificar conectividad
Comandos:
curl https://api.restaurante.com/api/health
curl https://admin.restaurante.com/server/health
INSTRUCCIÓN 43: Probar desde navegador
URLs:

https://admin.restaurante.com → Panel Directus
https://app.restaurante.com → PWA Cliente
https://mesero.restaurante.com → PWA Mesero
https://cocina.restaurante.com → PWA Cocina
https://panel.restaurante.com → PWA Admin
https://widget.restaurante.com → Widget embebible

INSTRUCCIÓN 44: Pruebas funcionales críticas
VALIDAR:
✓ Widget: Validación de horario funciona
✓ Widget: Agregar al carrito re-valida horario + producto activo
✓ Widget: Delivery cost = MAX (no suma)
✓ PWA Cliente: Crear reserva online
✓ PWA Mesero: Activar reserva
✓ PWA Cocina: Recibe pedidos en tiempo real
✓ PWA Admin: Confirmar reserva pendiente
✓ Notificaciones: Email, WhatsApp, Telegram funcionan
✓ Cron: Reservas se auto-liberan a los 30 min
═══════════════════════════════════════════════════════
FASE 9: MONITOREO Y MANTENIMIENTO
═══════════════════════════════════════════════════════
INSTRUCCIÓN 45: Configurar logs
Comandos:
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
INSTRUCCIÓN 46: Configurar backups automáticos
Archivo: /root/backup-db.sh
Contenido:
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U directus restaurante_erp > /backup/db_$DATE.sql
find /backup -name "db_*.sql" -mtime +7 -delete
Hacer ejecutable:
chmod +x /root/backup-db.sh
Cron diario:
crontab -e
0 2 * * * /root/backup-db.sh
INSTRUCCIÓN 47: Configurar monitoreo PM2
Comandos:
pm2 startup
pm2 save
INSTRUCCIÓN 48: Verificar uso de recursos
Comandos:
pm2 monit  # Monitoreo en tiempo real
htop       # Uso de CPU/RAM
═══════════════════════════════════════════════════════
CHECKLIST FINAL DE DEPLOY
═══════════════════════════════════════════════════════
BACKEND:
☐ Directus corriendo en puerto 8055
☐ Backend Node.js corriendo en puerto 4000
☐ PM2 configurado con auto-restart
☐ PostgreSQL con todas las collections creadas
☐ Relaciones configuradas correctamente
☐ Permisos por rol configurados
☐ Datos iniciales cargados (schedules, tables, waiters)
☐ Validación de horario funcionando
☐ Validación de productos activos funcionando
☐ Delivery cost = MAX (no suma) ✓
☐ Snapshot de precios en order_items ✓
☐ WebSocket server funcionando
☐ Cron jobs funcionando:
☐ Auto-release reservas (cada 5 min)
☐ Limpiar sesiones expiradas (cada hora)
NOTIFICACIONES:
☐ Email (Nodemailer) configurado y probado
☐ WhatsApp (Evolution API) configurado y probado
☐ Telegram Bot configurado y probado
☐ Templates de mensajes funcionando
FRONTENDS:
☐ Widget Chat desplegado y funcionando
☐ PWA Cliente desplegada
☐ PWA Mesero desplegada
☐ PWA Cocina desplegada
☐ PWA Admin desplegada
☐ Manifest.json configurado para cada PWA
☐ Service Workers funcionando
☐ Sistema de reservas integrado en widget y PWA cliente
☐ Módulo de reservas en PWA admin
NGINX:
☐ Configuración de todos los dominios
☐ Reverse proxy funcionando (api, admin)
☐ Archivos estáticos sirviendo correctamente
☐ SSL activo en todos los dominios (HTTPS)
☐ Renovación automática SSL configurada
SEGURIDAD:
☐ Firewall configurado (puertos 80, 443, 22 únicos abiertos)
☐ PostgreSQL solo localhost
☐ Variables de entorno seguras (.env con permisos 600)
☐ Passwords hasheados (bcrypt para PINs)
☐ JWT configurado correctamente
☐ CORS configurado con whitelist
☐ Rate limiting activo
☐ Helmet.js configurado en backend
MONITOREO:
☐ PM2 monit funcionando
☐ Logs rotando correctamente
☐ Backups automáticos configurados
☐ Alertas configuradas (opcional)
PRUEBAS FUNCIONALES:
☐ Pedido domicilio completo (widget)
☐ Pedido presencial (PWA mesero)
☐ Comandas en cocina (PWA cocina)
☐ Gestión admin (PWA admin)
☐ Crear reserva (cliente)
☐ Confirmar reserva (admin)
☐ Activar reserva (mesero)
☐ Auto-liberación reserva (30 min)
☐ Notificaciones recibidas correctamente
☐ WebSocket actualizaciones en tiempo real
═══════════════════════════════════════════════════════
FIN DEL DOCUMENTO MAESTRO
═══════════════════════════════════════════════════════
RESUMEN EJECUTIVO:
ESTE DOCUMENTO PROPORCIONA:
✓ Arquitectura completa del sistema
✓ Estructura de 13 collections en PostgreSQL
✓ Diagramas de relaciones y flujos
✓ Permisos detallados por cada uno de los 4 roles
✓ Mockups de cada interfaz
✓ Flujos de uso completos con validaciones críticas
✓ Sistema de reservas integrado
✓ Instrucciones paso a paso para deploy
✓ Checklist final de verificación
PUNTOS CRÍTICOS A RECORDAR:

Horario: Validar en 3 puntos (inicio, carrito, confirmar)
Productos: Solo status='active' en frontend
Delivery: MAX de costs, NO suma
Precios: Snapshot en order_items
Teléfonos: Normalizar a 10 dígitos
Reservas: Auto-liberar a los 30 min
Timezone: SIEMPRE America/Bogota
Notificaciones: Multi-canal (Email + WhatsApp + Telegram)
WebSocket: Real-time para cocina y meseros
Seguridad: Bcrypt PINs, JWT tokens, CORS whitelist

PARA CLAUDE CODE
Este documento debe ser suficiente para generar TODO el código necesario siguiendo las instrucciones numeradas. Cada sección tiene contexto suficiente para crear los archivos correspondientes sin ambigüedades.