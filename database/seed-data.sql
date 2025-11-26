-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA: SISTEMA ERP RESTAURANTE
-- Datos de ejemplo para desarrollo y pruebas
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. SCHEDULES (7 Horarios - días de la semana)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO schedules (id, day_of_week, opening_time, closing_time, is_open, special_note) VALUES
('a1b2c3d4-0001-4001-8001-000000000001', 'MONDAY', '11:00', '22:00', true, NULL),
('a1b2c3d4-0001-4001-8001-000000000002', 'TUESDAY', '11:00', '22:00', true, NULL),
('a1b2c3d4-0001-4001-8001-000000000003', 'WEDNESDAY', '11:00', '22:00', true, NULL),
('a1b2c3d4-0001-4001-8001-000000000004', 'THURSDAY', '11:00', '22:00', true, NULL),
('a1b2c3d4-0001-4001-8001-000000000005', 'FRIDAY', '11:00', '23:00', true, 'Horario extendido fin de semana'),
('a1b2c3d4-0001-4001-8001-000000000006', 'SATURDAY', '12:00', '23:00', true, 'Horario extendido fin de semana'),
('a1b2c3d4-0001-4001-8001-000000000007', 'SUNDAY', '12:00', '21:00', true, 'Cierre temprano')
ON CONFLICT (day_of_week) DO UPDATE SET
  opening_time = EXCLUDED.opening_time,
  closing_time = EXCLUDED.closing_time,
  is_open = EXCLUDED.is_open,
  special_note = EXCLUDED.special_note;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. CUSTOMERS (10 Clientes de ejemplo)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO customers (id, customer_code, full_name, phone, email, address_1, address_2, address_3, notes, is_active) VALUES
('c1000001-0001-4001-8001-000000000001', 'CLI-001', 'María García López', '3101234567', 'maria.garcia@email.com', 'Calle 45 #23-15, Barrio El Poblado', 'Carrera 70 #45-10, Laureles', NULL, 'Cliente frecuente, prefiere entregas rápidas', true),
('c1000001-0001-4001-8001-000000000002', 'CLI-002', 'Carlos Andrés Martínez', '3209876543', 'carlos.martinez@email.com', 'Avenida El Poblado #10-20, Torre A Apt 501', NULL, NULL, 'Alérgico al maní', true),
('c1000001-0001-4001-8001-000000000003', 'CLI-003', 'Ana Lucía Rodríguez', '3156789012', 'ana.rodriguez@email.com', 'Calle 10 #43-25, Centro', 'Carrera 80 #32-10, Belén', 'Calle 33 #76-20, Estadio', 'Tres direcciones registradas', true),
('c1000001-0001-4001-8001-000000000004', 'CLI-004', 'Juan Pablo Hernández', '3183456789', 'juan.hernandez@email.com', 'Carrera 43A #1-50, El Poblado', NULL, NULL, NULL, true),
('c1000001-0001-4001-8001-000000000005', 'CLI-005', 'Laura Valentina Gómez', '3002345678', 'laura.gomez@email.com', 'Calle 30 #65-10, Laureles', 'Avenida 33 #74-55, Floresta', NULL, 'Vegetariana', true),
('c1000001-0001-4001-8001-000000000006', 'CLI-006', 'Diego Fernando Sánchez', '3114567890', 'diego.sanchez@email.com', 'Transversal 39 #75-50, Conquistadores', NULL, NULL, 'Prefiere pago en efectivo', true),
('c1000001-0001-4001-8001-000000000007', 'CLI-007', 'Valentina Restrepo', '3175678901', 'valentina.restrepo@email.com', 'Calle 50 #80-30, Belén', NULL, NULL, 'Cliente corporativo', true),
('c1000001-0001-4001-8001-000000000008', 'CLI-008', 'Andrés Felipe Ospina', '3046789012', 'andres.ospina@email.com', 'Carrera 25 #1-30, Manila', 'Calle 9 #32-15, El Poblado', NULL, NULL, true),
('c1000001-0001-4001-8001-000000000009', 'CLI-009', 'Carolina Mejía Torres', '3127890123', 'carolina.mejia@email.com', 'Avenida Las Vegas #10-50, Envigado', NULL, NULL, 'Cumpleaños: 15 de marzo', true),
('c1000001-0001-4001-8001-000000000010', 'CLI-010', 'Sebastián López Ríos', '3198901234', 'sebastian.lopez@email.com', 'Calle 4 Sur #43A-100, El Poblado', NULL, NULL, NULL, true)
ON CONFLICT (phone) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. MENU CATEGORIES (9 Categorías principales)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO menu_categories (id, name, display_order, is_active) VALUES
('cat00001-0001-4001-8001-000000000001', 'ENTRADAS', 1, true),
('cat00001-0001-4001-8001-000000000002', 'PICADAS', 2, true),
('cat00001-0001-4001-8001-000000000003', 'PLATOS FUERTES', 3, true),
('cat00001-0001-4001-8001-000000000004', 'PIZZAS', 4, true),
('cat00001-0001-4001-8001-000000000005', 'HAMBURGUESAS', 5, true),
('cat00001-0001-4001-8001-000000000006', 'PASTAS', 6, true),
('cat00001-0001-4001-8001-000000000007', 'BEBIDAS', 7, true),
('cat00001-0001-4001-8001-000000000008', 'POSTRES', 8, true),
('cat00001-0001-4001-8001-000000000009', 'PROMOCIONES', 9, true)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. MENU SUBCATEGORIES (27 Subcategorías)
-- ═══════════════════════════════════════════════════════════════════════════
-- ENTRADAS (3 subcategorías)
INSERT INTO menu_subcategories (id, category_id, name, display_order, is_active) VALUES
('sub00001-0001-4001-8001-000000000001', 'cat00001-0001-4001-8001-000000000001', 'Sopas', 1, true),
('sub00001-0001-4001-8001-000000000002', 'cat00001-0001-4001-8001-000000000001', 'Ensaladas', 2, true),
('sub00001-0001-4001-8001-000000000003', 'cat00001-0001-4001-8001-000000000001', 'Aperitivos', 3, true),

-- PICADAS (3 subcategorías)
('sub00001-0001-4001-8001-000000000004', 'cat00001-0001-4001-8001-000000000002', 'Picadas Individuales', 1, true),
('sub00001-0001-4001-8001-000000000005', 'cat00001-0001-4001-8001-000000000002', 'Picadas para Compartir', 2, true),
('sub00001-0001-4001-8001-000000000006', 'cat00001-0001-4001-8001-000000000002', 'Picadas Especiales', 3, true),

-- PLATOS FUERTES (3 subcategorías)
('sub00001-0001-4001-8001-000000000007', 'cat00001-0001-4001-8001-000000000003', 'Carnes', 1, true),
('sub00001-0001-4001-8001-000000000008', 'cat00001-0001-4001-8001-000000000003', 'Pollo', 2, true),
('sub00001-0001-4001-8001-000000000009', 'cat00001-0001-4001-8001-000000000003', 'Mariscos', 3, true),

-- PIZZAS (3 subcategorías)
('sub00001-0001-4001-8001-000000000010', 'cat00001-0001-4001-8001-000000000004', 'Pizzas Tradicionales', 1, true),
('sub00001-0001-4001-8001-000000000011', 'cat00001-0001-4001-8001-000000000004', 'Pizzas Especiales', 2, true),
('sub00001-0001-4001-8001-000000000012', 'cat00001-0001-4001-8001-000000000004', 'Pizzas Premium', 3, true),

-- HAMBURGUESAS (3 subcategorías)
('sub00001-0001-4001-8001-000000000013', 'cat00001-0001-4001-8001-000000000005', 'Hamburguesas Clásicas', 1, true),
('sub00001-0001-4001-8001-000000000014', 'cat00001-0001-4001-8001-000000000005', 'Hamburguesas Especiales', 2, true),
('sub00001-0001-4001-8001-000000000015', 'cat00001-0001-4001-8001-000000000005', 'Hamburguesas Gourmet', 3, true),

-- PASTAS (3 subcategorías)
('sub00001-0001-4001-8001-000000000016', 'cat00001-0001-4001-8001-000000000006', 'Pastas en Salsa Roja', 1, true),
('sub00001-0001-4001-8001-000000000017', 'cat00001-0001-4001-8001-000000000006', 'Pastas en Salsa Blanca', 2, true),
('sub00001-0001-4001-8001-000000000018', 'cat00001-0001-4001-8001-000000000006', 'Pastas Especiales', 3, true),

-- BEBIDAS (3 subcategorías)
('sub00001-0001-4001-8001-000000000019', 'cat00001-0001-4001-8001-000000000007', 'Gaseosas y Refrescos', 1, true),
('sub00001-0001-4001-8001-000000000020', 'cat00001-0001-4001-8001-000000000007', 'Jugos Naturales', 2, true),
('sub00001-0001-4001-8001-000000000021', 'cat00001-0001-4001-8001-000000000007', 'Cervezas y Licores', 3, true),

-- POSTRES (3 subcategorías)
('sub00001-0001-4001-8001-000000000022', 'cat00001-0001-4001-8001-000000000008', 'Tortas y Pasteles', 1, true),
('sub00001-0001-4001-8001-000000000023', 'cat00001-0001-4001-8001-000000000008', 'Helados', 2, true),
('sub00001-0001-4001-8001-000000000024', 'cat00001-0001-4001-8001-000000000008', 'Postres Especiales', 3, true),

-- PROMOCIONES (3 subcategorías)
('sub00001-0001-4001-8001-000000000025', 'cat00001-0001-4001-8001-000000000009', 'Combos Individuales', 1, true),
('sub00001-0001-4001-8001-000000000026', 'cat00001-0001-4001-8001-000000000009', 'Combos Familiares', 2, true),
('sub00001-0001-4001-8001-000000000027', 'cat00001-0001-4001-8001-000000000009', 'Promociones del Día', 3, true)
ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════
-- 5. MENU ITEMS (153 Productos)
-- ═══════════════════════════════════════════════════════════════════════════

-- ENTRADAS - Sopas (6 productos)
INSERT INTO menu_items (id, menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, preparation_time, station) VALUES
('item0001-0001-4001-8001-000000000001', 'MENU-001', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000001', 'Sopa de Tortilla', 'Tradicional sopa mexicana con tiras de tortilla, aguacate, crema y queso', 18000, 2000, 'active', 15, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000002', 'MENU-002', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000001', 'Crema de Tomate', 'Crema suave de tomate con crutones y albahaca fresca', 15000, 2000, 'active', 12, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000003', 'MENU-003', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000001', 'Consomé de Pollo', 'Caldo de pollo con verduras, arroz y hierbas aromáticas', 16000, 2000, 'active', 10, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000004', 'MENU-004', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000001', 'Sancocho Trifásico', 'Tradicional sancocho colombiano con res, cerdo y pollo', 28000, 3000, 'active', 25, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000005', 'MENU-005', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000001', 'Sopa de Lentejas', 'Sopa nutritiva de lentejas con chorizo y verduras', 17000, 2000, 'active', 15, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000006', 'MENU-006', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000001', 'Ajiaco Santafereño', 'Típico ajiaco bogotano con pollo, papas criollas, guascas y alcaparras', 32000, 3500, 'active', 30, 'cocina_caliente'),

-- ENTRADAS - Ensaladas (6 productos)
('item0001-0001-4001-8001-000000000007', 'MENU-007', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000002', 'Ensalada César', 'Lechuga romana, crutones, parmesano y aderezo César casero', 22000, 2500, 'active', 10, 'cocina_fria'),
('item0001-0001-4001-8001-000000000008', 'MENU-008', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000002', 'Ensalada Mediterránea', 'Mix de lechugas, tomate cherry, aceitunas, queso feta y vinagreta', 24000, 2500, 'active', 10, 'cocina_fria'),
('item0001-0001-4001-8001-000000000009', 'MENU-009', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000002', 'Ensalada Tropical', 'Lechugas frescas con mango, piña, aguacate y aderezo de maracuyá', 26000, 2500, 'active', 10, 'cocina_fria'),
('item0001-0001-4001-8001-000000000010', 'MENU-010', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000002', 'Ensalada de Pollo Grillado', 'Mix de lechugas con pechuga de pollo a la plancha, tomate y aguacate', 28000, 3000, 'active', 15, 'cocina_fria'),
('item0001-0001-4001-8001-000000000011', 'MENU-011', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000002', 'Ensalada Caprese', 'Tomate, mozzarella fresca, albahaca y reducción de balsámico', 25000, 2500, 'active', 8, 'cocina_fria'),
('item0001-0001-4001-8001-000000000012', 'MENU-012', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000002', 'Ensalada de la Casa', 'Mezcla de lechugas, zanahoria, pepino, tomate y vinagreta de la casa', 18000, 2000, 'active', 8, 'cocina_fria'),

-- ENTRADAS - Aperitivos (6 productos)
('item0001-0001-4001-8001-000000000013', 'MENU-013', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000003', 'Aros de Cebolla', 'Crujientes aros de cebolla empanizados con salsa ranch', 16000, 2000, 'active', 12, 'freidora'),
('item0001-0001-4001-8001-000000000014', 'MENU-014', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000003', 'Dedos de Queso', 'Palitos de queso mozzarella empanizados con salsa marinara', 18000, 2000, 'active', 10, 'freidora'),
('item0001-0001-4001-8001-000000000015', 'MENU-015', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000003', 'Nachos con Queso', 'Totopos con queso cheddar fundido, jalapeños y pico de gallo', 22000, 2500, 'active', 10, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000016', 'MENU-016', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000003', 'Alitas BBQ (8 unidades)', 'Alitas de pollo bañadas en salsa BBQ con acompañamiento de apio', 28000, 3000, 'active', 18, 'freidora'),
('item0001-0001-4001-8001-000000000017', 'MENU-017', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000003', 'Empanadas Colombianas (6 unidades)', 'Tradicionales empanadas de carne con ají casero', 15000, 2000, 'active', 12, 'freidora'),
('item0001-0001-4001-8001-000000000018', 'MENU-018', 'cat00001-0001-4001-8001-000000000001', 'sub00001-0001-4001-8001-000000000003', 'Patacones con Hogao', 'Patacones crujientes con hogao tradicional y queso rallado', 14000, 2000, 'active', 10, 'freidora'),

-- PICADAS - Individuales (6 productos)
('item0001-0001-4001-8001-000000000019', 'MENU-019', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000004', 'Picada Personal', 'Chorizo, chicharrón, papas criollas, arepa y ají (1 persona)', 35000, 4000, 'active', 20, 'parrilla'),
('item0001-0001-4001-8001-000000000020', 'MENU-020', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000004', 'Mini Picada de Pollo', 'Pechuga grillada, alitas, papas a la francesa y ensalada', 32000, 3500, 'active', 18, 'parrilla'),
('item0001-0001-4001-8001-000000000021', 'MENU-021', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000004', 'Picada de Cerdo', 'Costilla BBQ, chicharrón, morcilla y papas criollas', 38000, 4000, 'active', 22, 'parrilla'),
('item0001-0001-4001-8001-000000000022', 'MENU-022', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000004', 'Picada de Res', 'Churrasco, chorizo, papa criolla y arepa con mantequilla', 42000, 4500, 'active', 25, 'parrilla'),
('item0001-0001-4001-8001-000000000023', 'MENU-023', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000004', 'Picada Vegetariana', 'Champiñones, vegetales grillados, queso asado, hummus y patacones', 30000, 3500, 'active', 18, 'parrilla'),
('item0001-0001-4001-8001-000000000024', 'MENU-024', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000004', 'Picada Marina Personal', 'Camarones, calamares, pescado y chicharrón de pescado', 48000, 5000, 'active', 22, 'freidora'),

-- PICADAS - Para Compartir (6 productos)
('item0001-0001-4001-8001-000000000025', 'MENU-025', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000005', 'Picada Paisa (2-3 personas)', 'Chorizo, chicharrón, morcilla, carne asada, papas, arepas y ají', 75000, 6000, 'active', 30, 'parrilla'),
('item0001-0001-4001-8001-000000000026', 'MENU-026', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000005', 'Picada Mixta Mediana (3-4 personas)', 'Res, cerdo, pollo, chorizo, chicharrón, papas y arepas', 95000, 7000, 'active', 35, 'parrilla'),
('item0001-0001-4001-8001-000000000027', 'MENU-027', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000005', 'Picada Familiar Grande (5-6 personas)', 'Toda la parrilla: res, cerdo, pollo, chorizos, morcilla, chicharrón', 145000, 8000, 'active', 45, 'parrilla'),
('item0001-0001-4001-8001-000000000028', 'MENU-028', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000005', 'Picada de Mariscos (2-3 personas)', 'Camarones, langostinos, calamares, pescado y chicharrón de pescado', 120000, 8000, 'active', 35, 'freidora'),
('item0001-0001-4001-8001-000000000029', 'MENU-029', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000005', 'Picada de Alitas (20 unidades)', 'Alitas en 3 salsas: BBQ, buffalo y miel mostaza', 55000, 5000, 'active', 25, 'freidora'),
('item0001-0001-4001-8001-000000000030', 'MENU-030', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000005', 'Tabla de Quesos y Carnes Frías', 'Selección de quesos, jamón serrano, salami y aceitunas', 65000, 5000, 'active', 15, 'cocina_fria'),

-- PICADAS - Especiales (5 productos)
('item0001-0001-4001-8001-000000000031', 'MENU-031', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000006', 'Picada Premium de la Casa', 'Lomo de res, costilla BBQ, pechuga, chorizo argentino y guarniciones', 165000, 10000, 'active', 50, 'parrilla'),
('item0001-0001-4001-8001-000000000032', 'MENU-032', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000006', 'Picada Costeña', 'Pescado frito, patacones, arroz con coco, ensalada y ají de suero', 85000, 7000, 'active', 35, 'freidora'),
('item0001-0001-4001-8001-000000000033', 'MENU-033', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000006', 'Picada Santandereana', 'Carne oreada, pepitoria, cabro, morcilla santandereana y arepa', 95000, 7000, 'active', 40, 'parrilla'),
('item0001-0001-4001-8001-000000000034', 'MENU-034', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000006', 'Picada Valluna', 'Aborrajados, marranitas, empanadas, chontaduro y cholado', 70000, 6000, 'active', 30, 'freidora'),
('item0001-0001-4001-8001-000000000035', 'MENU-035', 'cat00001-0001-4001-8001-000000000002', 'sub00001-0001-4001-8001-000000000006', 'Super Picada Aniversario (8-10 personas)', 'La más grande: todas las carnes, mariscos, guarniciones y salsas', 250000, 12000, 'active', 60, 'parrilla')
ON CONFLICT (menu_code) DO NOTHING;


-- PLATOS FUERTES - Carnes (7 productos)
INSERT INTO menu_items (id, menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, preparation_time, station) VALUES
('item0001-0001-4001-8001-000000000036', 'MENU-036', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000007', 'Lomo de Res a la Pimienta', 'Medallones de lomo en salsa de pimienta verde, papas duquesa y vegetales', 52000, 5000, 'active', 25, 'parrilla'),
('item0001-0001-4001-8001-000000000037', 'MENU-037', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000007', 'Churrasco Argentino', 'Corte premium de res a la parrilla con chimichurri, papas y ensalada', 58000, 5500, 'active', 28, 'parrilla'),
('item0001-0001-4001-8001-000000000038', 'MENU-038', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000007', 'Punta de Anca', 'Corte jugoso de punta de anca con papas a la francesa y ensalada', 48000, 5000, 'active', 25, 'parrilla'),
('item0001-0001-4001-8001-000000000039', 'MENU-039', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000007', 'Baby Beef', 'Corte tierno de lomo fino con mantequilla de hierbas y guarnición', 55000, 5000, 'active', 22, 'parrilla'),
('item0001-0001-4001-8001-000000000040', 'MENU-040', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000007', 'Costilla BBQ', 'Costilla de res bañada en salsa BBQ casera con coleslaw y papas', 65000, 6000, 'active', 35, 'parrilla'),
('item0001-0001-4001-8001-000000000041', 'MENU-041', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000007', 'Sobrebarriga a la Criolla', 'Sobrebarriga en salsa criolla con arroz, papa y patacón', 42000, 4500, 'active', 30, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000042', 'MENU-042', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000007', 'Bandeja Paisa Completa', 'El plato típico antioqueño: frijoles, arroz, carne, chicharrón, chorizo, huevo, arepa, aguacate y plátano', 38000, 4500, 'active', 25, 'cocina_caliente'),

-- PLATOS FUERTES - Pollo (6 productos)
('item0001-0001-4001-8001-000000000043', 'MENU-043', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000008', 'Pechuga Grillada', 'Pechuga de pollo a la plancha con vegetales salteados y arroz', 32000, 3500, 'active', 18, 'parrilla'),
('item0001-0001-4001-8001-000000000044', 'MENU-044', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000008', 'Pollo a la Parmesana', 'Pechuga empanizada con salsa marinara, queso mozzarella gratinado y pasta', 36000, 4000, 'active', 22, 'horno'),
('item0001-0001-4001-8001-000000000045', 'MENU-045', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000008', 'Pollo al Champiñón', 'Pechuga en salsa cremosa de champiñones con puré de papa', 35000, 4000, 'active', 20, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000046', 'MENU-046', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000008', 'Pollo Cordon Bleu', 'Pechuga rellena de jamón y queso, empanizada, con salsa de la casa', 38000, 4000, 'active', 25, 'freidora'),
('item0001-0001-4001-8001-000000000047', 'MENU-047', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000008', 'Pollo Teriyaki', 'Pechuga en salsa teriyaki con arroz jazmín y vegetales orientales', 34000, 3500, 'active', 18, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000048', 'MENU-048', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000008', 'Medio Pollo Asado', 'Medio pollo asado al horno con papa salada y ensalada', 42000, 4500, 'active', 35, 'horno'),

-- PLATOS FUERTES - Mariscos (6 productos)
('item0001-0001-4001-8001-000000000049', 'MENU-049', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000009', 'Mojarra Frita', 'Mojarra frita entera con patacones, arroz con coco y ensalada', 45000, 5000, 'active', 25, 'freidora'),
('item0001-0001-4001-8001-000000000050', 'MENU-050', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000009', 'Filete de Trucha', 'Filete de trucha al ajillo con arroz con verduras y ensalada', 42000, 4500, 'active', 20, 'parrilla'),
('item0001-0001-4001-8001-000000000051', 'MENU-051', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000009', 'Arroz con Camarones', 'Arroz especial con camarones salteados, pimentón y cebolla', 48000, 5000, 'active', 22, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000052', 'MENU-052', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000009', 'Cazuela de Mariscos', 'Camarones, langostinos, calamares y mejillones en salsa cremosa', 55000, 5500, 'active', 25, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000053', 'MENU-053', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000009', 'Ceviche Mixto', 'Pescado, camarones y pulpo marinados en limón con cebolla morada y cilantro', 38000, 4000, 'active', 10, 'cocina_fria'),
('item0001-0001-4001-8001-000000000054', 'MENU-054', 'cat00001-0001-4001-8001-000000000003', 'sub00001-0001-4001-8001-000000000009', 'Langostinos al Ajillo', 'Langostinos salteados en mantequilla de ajo con arroz y ensalada', 62000, 6000, 'active', 18, 'cocina_caliente'),

-- PIZZAS - Tradicionales (6 productos)
('item0001-0001-4001-8001-000000000055', 'MENU-055', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000010', 'Pizza Margarita', 'Salsa de tomate, mozzarella, tomate fresco y albahaca', 32000, 3000, 'active', 18, 'horno'),
('item0001-0001-4001-8001-000000000056', 'MENU-056', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000010', 'Pizza Pepperoni', 'Salsa de tomate, mozzarella y abundante pepperoni', 36000, 3000, 'active', 18, 'horno'),
('item0001-0001-4001-8001-000000000057', 'MENU-057', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000010', 'Pizza Hawaiana', 'Salsa de tomate, mozzarella, jamón y piña', 35000, 3000, 'active', 18, 'horno'),
('item0001-0001-4001-8001-000000000058', 'MENU-058', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000010', 'Pizza Napolitana', 'Salsa de tomate, mozzarella, anchoas, aceitunas y alcaparras', 38000, 3000, 'active', 18, 'horno'),
('item0001-0001-4001-8001-000000000059', 'MENU-059', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000010', 'Pizza Cuatro Quesos', 'Mozzarella, gorgonzola, parmesano y queso de cabra', 42000, 3500, 'active', 18, 'horno'),
('item0001-0001-4001-8001-000000000060', 'MENU-060', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000010', 'Pizza Vegetariana', 'Champiñones, pimentón, cebolla, tomate y aceitunas', 34000, 3000, 'active', 18, 'horno'),

-- PIZZAS - Especiales (6 productos)
('item0001-0001-4001-8001-000000000061', 'MENU-061', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000011', 'Pizza BBQ Chicken', 'Salsa BBQ, pollo grillado, cebolla caramelizada y cilantro', 42000, 3500, 'active', 20, 'horno'),
('item0001-0001-4001-8001-000000000062', 'MENU-062', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000011', 'Pizza Mexicana', 'Carne molida, jalapeños, frijoles, pico de gallo y crema agria', 44000, 3500, 'active', 20, 'horno'),
('item0001-0001-4001-8001-000000000063', 'MENU-063', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000011', 'Pizza Carbonara', 'Crema, tocino, cebolla caramelizada, huevo y parmesano', 45000, 3500, 'active', 20, 'horno'),
('item0001-0001-4001-8001-000000000064', 'MENU-064', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000011', 'Pizza Suprema', 'Pepperoni, jamón, salchicha, champiñones, pimentón y cebolla', 48000, 4000, 'active', 22, 'horno'),
('item0001-0001-4001-8001-000000000065', 'MENU-065', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000011', 'Pizza Mediterránea', 'Aceitunas negras, tomate seco, alcachofas, queso feta y orégano', 46000, 3500, 'active', 20, 'horno'),
('item0001-0001-4001-8001-000000000066', 'MENU-066', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000011', 'Pizza Criolla', 'Chorizo, chicharrón, hogao, arepa desmenuzada y cilantro', 44000, 3500, 'active', 20, 'horno'),

-- PIZZAS - Premium (6 productos)
('item0001-0001-4001-8001-000000000067', 'MENU-067', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000012', 'Pizza de Langostinos', 'Langostinos, camarones, ajo, perejil y aceite de oliva', 58000, 5000, 'active', 22, 'horno'),
('item0001-0001-4001-8001-000000000068', 'MENU-068', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000012', 'Pizza Prosciutto', 'Jamón prosciutto, rúcula, parmesano y tomate cherry', 52000, 4500, 'active', 20, 'horno'),
('item0001-0001-4001-8001-000000000069', 'MENU-069', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000012', 'Pizza Trufada', 'Crema de trufa, champiñones, parmesano y aceite de trufa', 62000, 5000, 'active', 22, 'horno'),
('item0001-0001-4001-8001-000000000070', 'MENU-070', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000012', 'Pizza Salmón Ahumado', 'Crema agria, salmón ahumado, alcaparras y cebolla morada', 55000, 4500, 'active', 18, 'horno'),
('item0001-0001-4001-8001-000000000071', 'MENU-071', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000012', 'Pizza del Chef', 'Creación especial del día - pregunte al mesero', 50000, 4500, 'active', 22, 'horno'),
('item0001-0001-4001-8001-000000000072', 'MENU-072', 'cat00001-0001-4001-8001-000000000004', 'sub00001-0001-4001-8001-000000000012', 'Pizza Familiar XXL (50cm)', 'Pizza gigante con 4 sabores a elección del cliente', 85000, 8000, 'active', 30, 'horno')
ON CONFLICT (menu_code) DO NOTHING;


-- HAMBURGUESAS - Clásicas (6 productos)
INSERT INTO menu_items (id, menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, preparation_time, station) VALUES
('item0001-0001-4001-8001-000000000073', 'MENU-073', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000013', 'Hamburguesa Clásica', 'Carne de res, lechuga, tomate, cebolla y salsas', 25000, 2500, 'active', 15, 'parrilla'),
('item0001-0001-4001-8001-000000000074', 'MENU-074', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000013', 'Hamburguesa con Queso', 'Carne de res con queso cheddar, lechuga, tomate y salsas', 28000, 2500, 'active', 15, 'parrilla'),
('item0001-0001-4001-8001-000000000075', 'MENU-075', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000013', 'Hamburguesa Doble', 'Doble carne de res, doble queso, lechuga, tomate y salsas', 35000, 3000, 'active', 18, 'parrilla'),
('item0001-0001-4001-8001-000000000076', 'MENU-076', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000013', 'Hamburguesa de Pollo', 'Pechuga empanizada o grillada con lechuga, tomate y mayonesa', 26000, 2500, 'active', 15, 'parrilla'),
('item0001-0001-4001-8001-000000000077', 'MENU-077', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000013', 'Hamburguesa Vegetariana', 'Medallón de lentejas y quinoa, lechuga, tomate, aguacate', 27000, 2500, 'active', 15, 'parrilla'),
('item0001-0001-4001-8001-000000000078', 'MENU-078', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000013', 'Kids Burger', 'Mini hamburguesa con papas y jugo para niños', 18000, 2000, 'active', 12, 'parrilla'),

-- HAMBURGUESAS - Especiales (6 productos)
('item0001-0001-4001-8001-000000000079', 'MENU-079', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000014', 'Hamburguesa BBQ Bacon', 'Carne de res, tocino crocante, queso cheddar, cebolla caramelizada y salsa BBQ', 38000, 3500, 'active', 18, 'parrilla'),
('item0001-0001-4001-8001-000000000080', 'MENU-080', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000014', 'Hamburguesa Mexicana', 'Carne de res, guacamole, jalapeños, queso pepper jack y chipotle', 36000, 3500, 'active', 18, 'parrilla'),
('item0001-0001-4001-8001-000000000081', 'MENU-081', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000014', 'Hamburguesa Criolla', 'Carne de res, chorizo desmenuzado, hogao, queso costeño y patacón', 38000, 3500, 'active', 18, 'parrilla'),
('item0001-0001-4001-8001-000000000082', 'MENU-082', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000014', 'Hamburguesa Mushroom Swiss', 'Carne de res, champiñones salteados, queso suizo y cebolla grillada', 37000, 3500, 'active', 18, 'parrilla'),
('item0001-0001-4001-8001-000000000083', 'MENU-083', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000014', 'Hamburguesa Hawaiana', 'Carne de res, piña grillada, jamón, queso suizo y salsa teriyaki', 36000, 3500, 'active', 18, 'parrilla'),
('item0001-0001-4001-8001-000000000084', 'MENU-084', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000014', 'Hamburguesa Tex-Mex', 'Carne de res, nachos, queso cheddar, frijoles y pico de gallo', 37000, 3500, 'active', 18, 'parrilla'),

-- HAMBURGUESAS - Gourmet (5 productos)
('item0001-0001-4001-8001-000000000085', 'MENU-085', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000015', 'Hamburguesa Angus Premium', 'Carne Angus 250g, queso gruyere, rúcula, tomate confitado y aioli', 48000, 4500, 'active', 20, 'parrilla'),
('item0001-0001-4001-8001-000000000086', 'MENU-086', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000015', 'Hamburguesa Blue Cheese', 'Carne de res, queso azul, tocino, cebolla caramelizada y rúcula', 45000, 4500, 'active', 18, 'parrilla'),
('item0001-0001-4001-8001-000000000087', 'MENU-087', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000015', 'Hamburguesa Trufada', 'Carne de res, queso brie, champiñones, aceite de trufa y rúcula', 52000, 5000, 'active', 20, 'parrilla'),
('item0001-0001-4001-8001-000000000088', 'MENU-088', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000015', 'Hamburguesa del Chef', 'Creación especial de la semana - pregunte al mesero', 44000, 4500, 'active', 20, 'parrilla'),
('item0001-0001-4001-8001-000000000089', 'MENU-089', 'cat00001-0001-4001-8001-000000000005', 'sub00001-0001-4001-8001-000000000015', 'Monster Burger Triple', 'Triple carne, triple queso, triple tocino y todos los toppings', 55000, 5000, 'active', 25, 'parrilla'),

-- PASTAS - Salsa Roja (6 productos)
('item0001-0001-4001-8001-000000000090', 'MENU-090', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000016', 'Spaghetti Bolognesa', 'Spaghetti con salsa bolognesa de carne y parmesano', 28000, 3000, 'active', 18, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000091', 'MENU-091', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000016', 'Penne Arrabbiata', 'Penne en salsa de tomate picante con ajo y albahaca', 26000, 3000, 'active', 15, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000092', 'MENU-092', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000016', 'Lasaña Clásica', 'Capas de pasta con carne, salsa bolognesa, bechamel y queso gratinado', 35000, 4000, 'active', 25, 'horno'),
('item0001-0001-4001-8001-000000000093', 'MENU-093', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000016', 'Spaghetti a la Marinara', 'Spaghetti con salsa de tomate, mariscos y hierbas frescas', 38000, 4000, 'active', 20, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000094', 'MENU-094', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000016', 'Raviolis de Carne', 'Raviolis rellenos de carne en salsa pomodoro', 32000, 3500, 'active', 18, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000095', 'MENU-095', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000016', 'Pappardelle con Ragú', 'Pasta ancha con ragú de carne de res y cerdo cocido lentamente', 34000, 3500, 'active', 20, 'cocina_caliente'),

-- PASTAS - Salsa Blanca (6 productos)
('item0001-0001-4001-8001-000000000096', 'MENU-096', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000017', 'Fettuccine Alfredo', 'Fettuccine en salsa cremosa de parmesano', 30000, 3000, 'active', 15, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000097', 'MENU-097', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000017', 'Spaghetti Carbonara', 'Spaghetti con tocino, huevo, parmesano y pimienta negra', 32000, 3000, 'active', 18, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000098', 'MENU-098', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000017', 'Penne al Champiñón', 'Penne en salsa cremosa de champiñones y hierbas', 29000, 3000, 'active', 15, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000099', 'MENU-099', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000017', 'Tortellini con Crema', 'Tortellini de queso en salsa cremosa con espinacas', 34000, 3500, 'active', 18, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000100', 'MENU-100', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000017', 'Gnocchi al Gorgonzola', 'Gnocchi de papa en salsa de queso gorgonzola y nueces', 33000, 3500, 'active', 18, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000101', 'MENU-101', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000017', 'Linguini con Camarones', 'Linguini con camarones en salsa cremosa de ajo y limón', 42000, 4500, 'active', 20, 'cocina_caliente'),

-- PASTAS - Especiales (6 productos)
('item0001-0001-4001-8001-000000000102', 'MENU-102', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000018', 'Lasaña Vegetariana', 'Capas de pasta con espinacas, champiñones, ricotta y bechamel', 33000, 4000, 'active', 25, 'horno'),
('item0001-0001-4001-8001-000000000103', 'MENU-103', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000018', 'Pasta Primavera', 'Penne con vegetales de temporada salteados en aceite de oliva', 28000, 3000, 'active', 18, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000104', 'MENU-104', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000018', 'Pasta al Pesto', 'Spaghetti con pesto genovés de albahaca, piñones y parmesano', 32000, 3000, 'active', 15, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000105', 'MENU-105', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000018', 'Canelones de Pollo', 'Canelones rellenos de pollo en salsa bechamel gratinada', 34000, 3500, 'active', 22, 'horno'),
('item0001-0001-4001-8001-000000000106', 'MENU-106', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000018', 'Pasta Frutti di Mare', 'Spaghetti con mariscos variados en salsa de vino blanco', 48000, 5000, 'active', 22, 'cocina_caliente'),
('item0001-0001-4001-8001-000000000107', 'MENU-107', 'cat00001-0001-4001-8001-000000000006', 'sub00001-0001-4001-8001-000000000018', 'Ñoquis de la Nonna', 'Ñoquis caseros en salsa de tomate con albahaca fresca', 30000, 3000, 'active', 18, 'cocina_caliente')
ON CONFLICT (menu_code) DO NOTHING;


-- BEBIDAS - Gaseosas y Refrescos (10 productos)
INSERT INTO menu_items (id, menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, preparation_time, station) VALUES
('item0001-0001-4001-8001-000000000108', 'MENU-108', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000019', 'Coca-Cola Personal', 'Coca-Cola 350ml', 5000, 500, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000109', 'MENU-109', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000019', 'Coca-Cola 1.5L', 'Coca-Cola tamaño familiar', 12000, 1000, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000110', 'MENU-110', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000019', 'Sprite Personal', 'Sprite 350ml', 5000, 500, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000111', 'MENU-111', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000019', 'Fanta Naranja', 'Fanta de naranja 350ml', 5000, 500, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000112', 'MENU-112', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000019', 'Agua Mineral', 'Agua mineral sin gas 600ml', 4000, 500, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000113', 'MENU-113', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000019', 'Agua con Gas', 'Agua mineral con gas 600ml', 5000, 500, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000114', 'MENU-114', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000019', 'Té Helado', 'Té helado sabor limón o durazno 500ml', 6000, 500, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000115', 'MENU-115', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000019', 'Red Bull', 'Bebida energizante 250ml', 12000, 1000, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000116', 'MENU-116', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000019', 'Manzana Postobón', 'Manzana Postobón 350ml', 5000, 500, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000117', 'MENU-117', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000019', 'Colombiana', 'Colombiana 350ml', 5000, 500, 'active', 2, 'barra'),

-- BEBIDAS - Jugos Naturales (8 productos)
('item0001-0001-4001-8001-000000000118', 'MENU-118', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000020', 'Limonada Natural', 'Limonada fresca recién exprimida', 8000, 1000, 'active', 5, 'barra'),
('item0001-0001-4001-8001-000000000119', 'MENU-119', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000020', 'Limonada de Coco', 'Limonada con crema de coco', 10000, 1000, 'active', 5, 'barra'),
('item0001-0001-4001-8001-000000000120', 'MENU-120', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000020', 'Limonada Cerezada', 'Limonada con jarabe de cereza', 10000, 1000, 'active', 5, 'barra'),
('item0001-0001-4001-8001-000000000121', 'MENU-121', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000020', 'Jugo de Naranja', 'Jugo de naranja natural recién exprimido', 9000, 1000, 'active', 5, 'barra'),
('item0001-0001-4001-8001-000000000122', 'MENU-122', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000020', 'Jugo de Maracuyá', 'Jugo natural de maracuyá', 9000, 1000, 'active', 5, 'barra'),
('item0001-0001-4001-8001-000000000123', 'MENU-123', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000020', 'Jugo de Lulo', 'Jugo natural de lulo', 9000, 1000, 'active', 5, 'barra'),
('item0001-0001-4001-8001-000000000124', 'MENU-124', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000020', 'Jugo de Mango', 'Jugo natural de mango', 9000, 1000, 'active', 5, 'barra'),
('item0001-0001-4001-8001-000000000125', 'MENU-125', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000020', 'Salpicón de Frutas', 'Mezcla de frutas tropicales con jugo de naranja', 12000, 1500, 'active', 8, 'barra'),

-- BEBIDAS - Cervezas y Licores (10 productos)
('item0001-0001-4001-8001-000000000126', 'MENU-126', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000021', 'Cerveza Club Colombia', 'Cerveza Club Colombia 330ml', 8000, 1000, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000127', 'MENU-127', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000021', 'Cerveza Poker', 'Cerveza Poker 330ml', 6000, 1000, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000128', 'MENU-128', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000021', 'Cerveza Águila', 'Cerveza Águila 330ml', 6000, 1000, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000129', 'MENU-129', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000021', 'Cerveza Artesanal', 'Cerveza artesanal local del día', 12000, 1500, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000130', 'MENU-130', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000021', 'Corona', 'Cerveza Corona 355ml', 10000, 1000, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000131', 'MENU-131', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000021', 'Heineken', 'Cerveza Heineken 330ml', 10000, 1000, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000132', 'MENU-132', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000021', 'Copa de Vino Tinto', 'Copa de vino tinto de la casa', 15000, 0, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000133', 'MENU-133', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000021', 'Copa de Vino Blanco', 'Copa de vino blanco de la casa', 15000, 0, 'active', 2, 'barra'),
('item0001-0001-4001-8001-000000000134', 'MENU-134', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000021', 'Sangría Jarra', 'Jarra de sangría con frutas (1L)', 45000, 0, 'active', 10, 'barra'),
('item0001-0001-4001-8001-000000000135', 'MENU-135', 'cat00001-0001-4001-8001-000000000007', 'sub00001-0001-4001-8001-000000000021', 'Michelada', 'Cerveza con limón, sal, salsa negra y picante', 12000, 1000, 'active', 5, 'barra'),

-- POSTRES - Tortas y Pasteles (6 productos)
('item0001-0001-4001-8001-000000000136', 'MENU-136', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000022', 'Brownie con Helado', 'Brownie de chocolate caliente con helado de vainilla y salsa de chocolate', 16000, 2000, 'active', 8, 'cocina_fria'),
('item0001-0001-4001-8001-000000000137', 'MENU-137', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000022', 'Cheesecake de Frutos Rojos', 'Cheesecake cremoso con coulis de frutos rojos', 18000, 2000, 'active', 5, 'cocina_fria'),
('item0001-0001-4001-8001-000000000138', 'MENU-138', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000022', 'Tiramisú', 'Clásico tiramisú italiano con café y mascarpone', 18000, 2000, 'active', 5, 'cocina_fria'),
('item0001-0001-4001-8001-000000000139', 'MENU-139', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000022', 'Tres Leches', 'Bizcocho empapado en tres leches con crema chantilly', 15000, 2000, 'active', 5, 'cocina_fria'),
('item0001-0001-4001-8001-000000000140', 'MENU-140', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000022', 'Torta de Chocolate', 'Torta húmeda de chocolate con ganache', 16000, 2000, 'active', 5, 'cocina_fria'),
('item0001-0001-4001-8001-000000000141', 'MENU-141', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000022', 'Volcán de Chocolate', 'Bizcocho tibio de chocolate con centro líquido', 20000, 2500, 'active', 12, 'horno'),

-- POSTRES - Helados (6 productos)
('item0001-0001-4001-8001-000000000142', 'MENU-142', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000023', 'Copa de Helado (2 bolas)', 'Dos bolas de helado artesanal con topping a elección', 12000, 1500, 'active', 5, 'cocina_fria'),
('item0001-0001-4001-8001-000000000143', 'MENU-143', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000023', 'Banana Split', 'Banana con tres bolas de helado, crema, chocolate y cereza', 18000, 2000, 'active', 8, 'cocina_fria'),
('item0001-0001-4001-8001-000000000144', 'MENU-144', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000023', 'Sundae de Chocolate', 'Helado de vainilla con salsa de chocolate, nueces y crema', 15000, 1500, 'active', 5, 'cocina_fria'),
('item0001-0001-4001-8001-000000000145', 'MENU-145', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000023', 'Affogato', 'Helado de vainilla bañado en espresso caliente', 14000, 1500, 'active', 3, 'barra'),
('item0001-0001-4001-8001-000000000146', 'MENU-146', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000023', 'Malteada de Vainilla', 'Malteada cremosa de vainilla', 14000, 1500, 'active', 5, 'barra'),
('item0001-0001-4001-8001-000000000147', 'MENU-147', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000023', 'Malteada de Chocolate', 'Malteada cremosa de chocolate', 14000, 1500, 'active', 5, 'barra'),

-- POSTRES - Especiales (6 productos)
('item0001-0001-4001-8001-000000000148', 'MENU-148', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000024', 'Flan de Caramelo', 'Tradicional flan de vainilla con caramelo', 12000, 1500, 'active', 5, 'cocina_fria'),
('item0001-0001-4001-8001-000000000149', 'MENU-149', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000024', 'Churros con Chocolate', 'Churros recién fritos con chocolate español', 14000, 2000, 'active', 10, 'freidora'),
('item0001-0001-4001-8001-000000000150', 'MENU-150', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000024', 'Crème Brûlée', 'Crema de vainilla con costra de caramelo', 18000, 2000, 'active', 5, 'cocina_fria'),
('item0001-0001-4001-8001-000000000151', 'MENU-151', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000024', 'Obleas con Arequipe', 'Tradicionales obleas colombianas con arequipe y queso', 10000, 1500, 'active', 3, 'cocina_fria'),
('item0001-0001-4001-8001-000000000152', 'MENU-152', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000024', 'Natilla con Buñuelos', 'Natilla tradicional con buñuelos dorados (4 uds)', 15000, 2000, 'active', 8, 'freidora'),
('item0001-0001-4001-8001-000000000153', 'MENU-153', 'cat00001-0001-4001-8001-000000000008', 'sub00001-0001-4001-8001-000000000024', 'Tabla de Postres para Compartir', 'Selección de mini postres: brownie, cheesecake, tiramisú y flan', 35000, 3500, 'active', 10, 'cocina_fria')
ON CONFLICT (menu_code) DO NOTHING;


-- PROMOCIONES (Ya tenemos 153 productos, añadimos 0 más en promociones ya que están completos)
-- Los combos usan productos existentes, no se insertan como nuevos

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. TABLES (20 Mesas en 4 zonas)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO tables (id, table_number, capacity, zone, status) VALUES
-- Salón Principal (8 mesas)
('tab00001-0001-4001-8001-000000000001', '1', 2, 'Salón Principal', 'available'),
('tab00001-0001-4001-8001-000000000002', '2', 2, 'Salón Principal', 'available'),
('tab00001-0001-4001-8001-000000000003', '3', 4, 'Salón Principal', 'available'),
('tab00001-0001-4001-8001-000000000004', '4', 4, 'Salón Principal', 'available'),
('tab00001-0001-4001-8001-000000000005', '5', 4, 'Salón Principal', 'available'),
('tab00001-0001-4001-8001-000000000006', '6', 6, 'Salón Principal', 'available'),
('tab00001-0001-4001-8001-000000000007', '7', 6, 'Salón Principal', 'available'),
('tab00001-0001-4001-8001-000000000008', '8', 8, 'Salón Principal', 'available'),
-- Terraza (5 mesas)
('tab00001-0001-4001-8001-000000000009', 'T1', 2, 'Terraza', 'available'),
('tab00001-0001-4001-8001-000000000010', 'T2', 2, 'Terraza', 'available'),
('tab00001-0001-4001-8001-000000000011', 'T3', 4, 'Terraza', 'available'),
('tab00001-0001-4001-8001-000000000012', 'T4', 4, 'Terraza', 'available'),
('tab00001-0001-4001-8001-000000000013', 'T5', 6, 'Terraza', 'available'),
-- VIP (4 mesas)
('tab00001-0001-4001-8001-000000000014', 'VIP-1', 4, 'Salón VIP', 'available'),
('tab00001-0001-4001-8001-000000000015', 'VIP-2', 6, 'Salón VIP', 'available'),
('tab00001-0001-4001-8001-000000000016', 'VIP-3', 8, 'Salón VIP', 'available'),
('tab00001-0001-4001-8001-000000000017', 'VIP-4', 10, 'Salón VIP', 'available'),
-- Barra (3 mesas)
('tab00001-0001-4001-8001-000000000018', 'B1', 2, 'Barra', 'available'),
('tab00001-0001-4001-8001-000000000019', 'B2', 2, 'Barra', 'available'),
('tab00001-0001-4001-8001-000000000020', 'B3', 3, 'Barra', 'available')
ON CONFLICT (table_number) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. WAITERS/STAFF (5 empleados: 3 meseros + 2 cocina)
-- PIN: 1234 -> $2b$10$ hash (todos usan el mismo PIN de ejemplo)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO waiters (id, waiter_code, full_name, phone, pin_code, is_active, current_orders) VALUES
-- Meseros
('wtr00001-0001-4001-8001-000000000001', 'MES001', 'Carlos Alberto García', '3101111111', '$2b$10$N9qo8uLOickgx2ZMRZoHK.z3KN7D5g.ZZd9pVZG3GvzR1YzLY3nfS', true, 0),
('wtr00001-0001-4001-8001-000000000002', 'MES002', 'María Fernanda López', '3102222222', '$2b$10$N9qo8uLOickgx2ZMRZoHK.z3KN7D5g.ZZd9pVZG3GvzR1YzLY3nfS', true, 0),
('wtr00001-0001-4001-8001-000000000003', 'MES003', 'Juan David Martínez', '3103333333', '$2b$10$N9qo8uLOickgx2ZMRZoHK.z3KN7D5g.ZZd9pVZG3GvzR1YzLY3nfS', true, 0),
-- Cocina
('wtr00001-0001-4001-8001-000000000004', 'COC001', 'Pedro Antonio Ramírez', '3104444444', '$2b$10$N9qo8uLOickgx2ZMRZoHK.z3KN7D5g.ZZd9pVZG3GvzR1YzLY3nfS', true, 0),
('wtr00001-0001-4001-8001-000000000005', 'COC002', 'Ana María Sánchez', '3105555555', '$2b$10$N9qo8uLOickgx2ZMRZoHK.z3KN7D5g.ZZd9pVZG3GvzR1YzLY3nfS', true, 0)
ON CONFLICT (waiter_code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. ORDERS (15 Pedidos de ejemplo con diferentes estados)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO orders (id, order_number, customer_id, waiter_id, table_id, order_type, status, payment_method, subtotal, delivery_cost, total, delivery_address, customer_notes, created_at, confirmed_at, completed_at) VALUES
-- Pedidos delivery en diferentes estados
('ord00001-0001-4001-8001-000000000001', 'ORD-2024-0001', 'c1000001-0001-4001-8001-000000000001', NULL, NULL, 'delivery', 'pending', NULL, 75000, 5000, 80000, 'Calle 45 #23-15, Barrio El Poblado', 'Sin cebolla en la hamburguesa', CURRENT_TIMESTAMP - INTERVAL '2 hours', NULL, NULL),
('ord00001-0001-4001-8001-000000000002', 'ORD-2024-0002', 'c1000001-0001-4001-8001-000000000002', NULL, NULL, 'delivery', 'confirmed', 'card', 120000, 8000, 128000, 'Avenida El Poblado #10-20, Torre A Apt 501', NULL, CURRENT_TIMESTAMP - INTERVAL '1 hour 30 minutes', CURRENT_TIMESTAMP - INTERVAL '1 hour 25 minutes', NULL),
('ord00001-0001-4001-8001-000000000003', 'ORD-2024-0003', 'c1000001-0001-4001-8001-000000000003', NULL, NULL, 'delivery', 'preparing', 'transfer', 85000, 6000, 91000, 'Calle 10 #43-25, Centro', 'Llamar al llegar', CURRENT_TIMESTAMP - INTERVAL '45 minutes', CURRENT_TIMESTAMP - INTERVAL '40 minutes', NULL),
('ord00001-0001-4001-8001-000000000004', 'ORD-2024-0004', 'c1000001-0001-4001-8001-000000000004', NULL, NULL, 'delivery', 'ready', 'cash', 55000, 4000, 59000, 'Carrera 43A #1-50, El Poblado', NULL, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '55 minutes', NULL),
('ord00001-0001-4001-8001-000000000005', 'ORD-2024-0005', 'c1000001-0001-4001-8001-000000000005', NULL, NULL, 'delivery', 'delivered', 'card', 145000, 8000, 153000, 'Calle 30 #65-10, Laureles', 'Pedido vegetariano', CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours 55 minutes', CURRENT_TIMESTAMP - INTERVAL '2 hours'),

-- Pedidos en mesa (dine_in)
('ord00001-0001-4001-8001-000000000006', 'ORD-2024-0006', 'c1000001-0001-4001-8001-000000000006', 'wtr00001-0001-4001-8001-000000000001', 'tab00001-0001-4001-8001-000000000003', 'dine_in', 'pending', NULL, 95000, 0, 95000, NULL, 'Mesa 3', CURRENT_TIMESTAMP - INTERVAL '30 minutes', NULL, NULL),
('ord00001-0001-4001-8001-000000000007', 'ORD-2024-0007', 'c1000001-0001-4001-8001-000000000007', 'wtr00001-0001-4001-8001-000000000002', 'tab00001-0001-4001-8001-000000000014', 'dine_in', 'confirmed', 'terminal', 250000, 0, 250000, NULL, 'VIP - Celebración cumpleaños', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '55 minutes', NULL),
('ord00001-0001-4001-8001-000000000008', 'ORD-2024-0008', 'c1000001-0001-4001-8001-000000000008', 'wtr00001-0001-4001-8001-000000000003', 'tab00001-0001-4001-8001-000000000009', 'dine_in', 'preparing', 'cash', 78000, 0, 78000, NULL, 'Terraza T1', CURRENT_TIMESTAMP - INTERVAL '20 minutes', CURRENT_TIMESTAMP - INTERVAL '18 minutes', NULL),
('ord00001-0001-4001-8001-000000000009', 'ORD-2024-0009', 'c1000001-0001-4001-8001-000000000009', 'wtr00001-0001-4001-8001-000000000001', 'tab00001-0001-4001-8001-000000000006', 'dine_in', 'ready', 'card', 165000, 0, 165000, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '45 minutes', CURRENT_TIMESTAMP - INTERVAL '42 minutes', NULL),
('ord00001-0001-4001-8001-000000000010', 'ORD-2024-0010', 'c1000001-0001-4001-8001-000000000010', 'wtr00001-0001-4001-8001-000000000002', 'tab00001-0001-4001-8001-000000000001', 'dine_in', 'delivered', 'terminal', 52000, 0, 52000, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour 55 minutes', CURRENT_TIMESTAMP - INTERVAL '1 hour 30 minutes'),

-- Pedidos para llevar (takeout)
('ord00001-0001-4001-8001-000000000011', 'ORD-2024-0011', 'c1000001-0001-4001-8001-000000000001', NULL, NULL, 'takeout', 'pending', NULL, 42000, 0, 42000, NULL, 'Recoger en 20 min', CURRENT_TIMESTAMP - INTERVAL '15 minutes', NULL, NULL),
('ord00001-0001-4001-8001-000000000012', 'ORD-2024-0012', 'c1000001-0001-4001-8001-000000000002', NULL, NULL, 'takeout', 'confirmed', 'cash', 68000, 0, 68000, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '25 minutes', CURRENT_TIMESTAMP - INTERVAL '23 minutes', NULL),
('ord00001-0001-4001-8001-000000000013', 'ORD-2024-0013', 'c1000001-0001-4001-8001-000000000003', NULL, NULL, 'takeout', 'ready', 'card', 35000, 0, 35000, NULL, 'Para llevar', CURRENT_TIMESTAMP - INTERVAL '35 minutes', CURRENT_TIMESTAMP - INTERVAL '33 minutes', NULL),

-- Pedidos cancelados
('ord00001-0001-4001-8001-000000000014', 'ORD-2024-0014', 'c1000001-0001-4001-8001-000000000004', NULL, NULL, 'delivery', 'cancelled', NULL, 90000, 6000, 96000, 'Carrera 43A #1-50, El Poblado', 'Cliente canceló - cambio de planes', CURRENT_TIMESTAMP - INTERVAL '4 hours', NULL, NULL),
('ord00001-0001-4001-8001-000000000015', 'ORD-2024-0015', 'c1000001-0001-4001-8001-000000000005', NULL, NULL, 'takeout', 'cancelled', NULL, 45000, 0, 45000, NULL, 'Tiempo de espera muy largo', CURRENT_TIMESTAMP - INTERVAL '5 hours', NULL, NULL)
ON CONFLICT (order_number) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. ORDER ITEMS (Items para los pedidos)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, item_delivery_cost, subtotal, special_instructions, status) VALUES
-- Items para pedido 1 (delivery pending)
('orit0001-0001-4001-8001-000000000001', 'ord00001-0001-4001-8001-000000000001', 'item0001-0001-4001-8001-000000000079', 2, 38000, 3500, 76000, 'Sin cebolla', 'pending'),
-- Items para pedido 2 (delivery confirmed)
('orit0001-0001-4001-8001-000000000002', 'ord00001-0001-4001-8001-000000000002', 'item0001-0001-4001-8001-000000000025', 1, 75000, 6000, 75000, NULL, 'pending'),
('orit0001-0001-4001-8001-000000000003', 'ord00001-0001-4001-8001-000000000002', 'item0001-0001-4001-8001-000000000126', 4, 8000, 1000, 32000, NULL, 'pending'),
('orit0001-0001-4001-8001-000000000004', 'ord00001-0001-4001-8001-000000000002', 'item0001-0001-4001-8001-000000000118', 2, 8000, 1000, 16000, NULL, 'pending'),
-- Items para pedido 3 (delivery preparing)
('orit0001-0001-4001-8001-000000000005', 'ord00001-0001-4001-8001-000000000003', 'item0001-0001-4001-8001-000000000057', 2, 35000, 3000, 70000, NULL, 'preparing'),
('orit0001-0001-4001-8001-000000000006', 'ord00001-0001-4001-8001-000000000003', 'item0001-0001-4001-8001-000000000108', 2, 5000, 500, 10000, NULL, 'preparing'),
-- Items para pedido 4 (delivery ready)
('orit0001-0001-4001-8001-000000000007', 'ord00001-0001-4001-8001-000000000004', 'item0001-0001-4001-8001-000000000073', 2, 25000, 2500, 50000, NULL, 'ready'),
('orit0001-0001-4001-8001-000000000008', 'ord00001-0001-4001-8001-000000000004', 'item0001-0001-4001-8001-000000000110', 2, 5000, 500, 10000, NULL, 'ready'),
-- Items para pedido 5 (delivery delivered)
('orit0001-0001-4001-8001-000000000009', 'ord00001-0001-4001-8001-000000000005', 'item0001-0001-4001-8001-000000000027', 1, 145000, 8000, 145000, 'Pedido vegetariano grande', 'served'),
-- Items para pedido 6 (dine_in pending)
('orit0001-0001-4001-8001-000000000010', 'ord00001-0001-4001-8001-000000000006', 'item0001-0001-4001-8001-000000000036', 2, 52000, 0, 104000, NULL, 'pending'),
-- Items para pedido 7 (dine_in confirmed VIP)
('orit0001-0001-4001-8001-000000000011', 'ord00001-0001-4001-8001-000000000007', 'item0001-0001-4001-8001-000000000031', 1, 165000, 0, 165000, 'Celebración especial', 'pending'),
('orit0001-0001-4001-8001-000000000012', 'ord00001-0001-4001-8001-000000000007', 'item0001-0001-4001-8001-000000000134', 2, 45000, 0, 90000, NULL, 'pending'),
-- Items para pedido 8 (dine_in preparing)
('orit0001-0001-4001-8001-000000000013', 'ord00001-0001-4001-8001-000000000008', 'item0001-0001-4001-8001-000000000043', 2, 32000, 0, 64000, NULL, 'preparing'),
('orit0001-0001-4001-8001-000000000014', 'ord00001-0001-4001-8001-000000000008', 'item0001-0001-4001-8001-000000000118', 2, 8000, 0, 16000, NULL, 'preparing'),
-- Items para pedido 9 (dine_in ready)
('orit0001-0001-4001-8001-000000000015', 'ord00001-0001-4001-8001-000000000009', 'item0001-0001-4001-8001-000000000026', 1, 95000, 0, 95000, NULL, 'ready'),
('orit0001-0001-4001-8001-000000000016', 'ord00001-0001-4001-8001-000000000009', 'item0001-0001-4001-8001-000000000059', 1, 42000, 0, 42000, NULL, 'ready'),
('orit0001-0001-4001-8001-000000000017', 'ord00001-0001-4001-8001-000000000009', 'item0001-0001-4001-8001-000000000136', 2, 16000, 0, 32000, NULL, 'ready'),
-- Items para pedido 10 (dine_in delivered)
('orit0001-0001-4001-8001-000000000018', 'ord00001-0001-4001-8001-000000000010', 'item0001-0001-4001-8001-000000000074', 2, 28000, 0, 56000, NULL, 'served'),
-- Items para pedido 11 (takeout pending)
('orit0001-0001-4001-8001-000000000019', 'ord00001-0001-4001-8001-000000000011', 'item0001-0001-4001-8001-000000000056', 1, 36000, 0, 36000, NULL, 'pending'),
('orit0001-0001-4001-8001-000000000020', 'ord00001-0001-4001-8001-000000000011', 'item0001-0001-4001-8001-000000000108', 1, 5000, 0, 5000, NULL, 'pending'),
-- Items para pedido 12 (takeout confirmed)
('orit0001-0001-4001-8001-000000000021', 'ord00001-0001-4001-8001-000000000012', 'item0001-0001-4001-8001-000000000090', 2, 28000, 0, 56000, NULL, 'pending'),
('orit0001-0001-4001-8001-000000000022', 'ord00001-0001-4001-8001-000000000012', 'item0001-0001-4001-8001-000000000137', 1, 18000, 0, 18000, NULL, 'pending'),
-- Items para pedido 13 (takeout ready)
('orit0001-0001-4001-8001-000000000023', 'ord00001-0001-4001-8001-000000000013', 'item0001-0001-4001-8001-000000000075', 1, 35000, 0, 35000, NULL, 'ready')
ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════
-- 10. RESERVATIONS (10 Reservas de ejemplo)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO reservations (id, reservation_number, customer_id, table_id, reservation_date, reservation_time, party_size, status, customer_name, customer_phone, customer_email, special_requests, created_at, confirmed_at, activated_at, completed_at, cancelled_at) VALUES
-- Reservas futuras (pending y confirmed)
('res00001-0001-4001-8001-000000000001', 'RES-2024-0001', 'c1000001-0001-4001-8001-000000000001', 'tab00001-0001-4001-8001-000000000014', CURRENT_DATE + INTERVAL '1 day', '19:00', 4, 'pending', 'María García López', '3101234567', 'maria.garcia@email.com', 'Celebración de aniversario', CURRENT_TIMESTAMP - INTERVAL '2 hours', NULL, NULL, NULL, NULL),
('res00001-0001-4001-8001-000000000002', 'RES-2024-0002', 'c1000001-0001-4001-8001-000000000002', 'tab00001-0001-4001-8001-000000000015', CURRENT_DATE + INTERVAL '2 days', '20:00', 6, 'confirmed', 'Carlos Andrés Martínez', '3209876543', 'carlos.martinez@email.com', 'Cena de negocios - necesitamos proyector', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '23 hours', NULL, NULL, NULL),
('res00001-0001-4001-8001-000000000003', 'RES-2024-0003', 'c1000001-0001-4001-8001-000000000003', 'tab00001-0001-4001-8001-000000000006', CURRENT_DATE + INTERVAL '3 days', '13:00', 5, 'pending', 'Ana Lucía Rodríguez', '3156789012', 'ana.rodriguez@email.com', 'Almuerzo familiar', CURRENT_TIMESTAMP - INTERVAL '5 hours', NULL, NULL, NULL, NULL),
('res00001-0001-4001-8001-000000000004', 'RES-2024-0004', 'c1000001-0001-4001-8001-000000000004', 'tab00001-0001-4001-8001-000000000016', CURRENT_DATE + INTERVAL '5 days', '19:30', 8, 'confirmed', 'Juan Pablo Hernández', '3183456789', 'juan.hernandez@email.com', 'Cumpleaños - traer pastel', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day 22 hours', NULL, NULL, NULL),

-- Reservas para hoy (active)
('res00001-0001-4001-8001-000000000005', 'RES-2024-0005', 'c1000001-0001-4001-8001-000000000005', 'tab00001-0001-4001-8001-000000000003', CURRENT_DATE, '12:30', 4, 'active', 'Laura Valentina Gómez', '3002345678', 'laura.gomez@email.com', 'Menú vegetariano preferido', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '23 hours', CURRENT_TIMESTAMP - INTERVAL '30 minutes', NULL, NULL),
('res00001-0001-4001-8001-000000000006', 'RES-2024-0006', 'c1000001-0001-4001-8001-000000000006', 'tab00001-0001-4001-8001-000000000011', CURRENT_DATE, '13:00', 3, 'active', 'Diego Fernando Sánchez', '3114567890', 'diego.sanchez@email.com', 'Terraza si está disponible', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day 20 hours', CURRENT_TIMESTAMP - INTERVAL '15 minutes', NULL, NULL),

-- Reservas completadas
('res00001-0001-4001-8001-000000000007', 'RES-2024-0007', 'c1000001-0001-4001-8001-000000000007', 'tab00001-0001-4001-8001-000000000001', CURRENT_DATE - INTERVAL '1 day', '19:00', 2, 'completed', 'Valentina Restrepo', '3175678901', 'valentina.restrepo@email.com', 'Cena romántica', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '2 days 22 hours', CURRENT_TIMESTAMP - INTERVAL '1 day 5 hours', CURRENT_TIMESTAMP - INTERVAL '1 day 3 hours', NULL),
('res00001-0001-4001-8001-000000000008', 'RES-2024-0008', 'c1000001-0001-4001-8001-000000000008', 'tab00001-0001-4001-8001-000000000008', CURRENT_DATE - INTERVAL '2 days', '20:30', 8, 'completed', 'Andrés Felipe Ospina', '3046789012', 'andres.ospina@email.com', 'Reunión de trabajo', CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '3 days 20 hours', CURRENT_TIMESTAMP - INTERVAL '2 days 3 hours', CURRENT_TIMESTAMP - INTERVAL '2 days 1 hour', NULL),

-- Reserva cancelada
('res00001-0001-4001-8001-000000000009', 'RES-2024-0009', 'c1000001-0001-4001-8001-000000000009', 'tab00001-0001-4001-8001-000000000017', CURRENT_DATE + INTERVAL '1 day', '21:00', 10, 'cancelled', 'Carolina Mejía Torres', '3127890123', 'carolina.mejia@email.com', 'Evento corporativo - CANCELADO', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '4 days 20 hours', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '1 day'),

-- Reserva no_show (auto-liberada)
('res00001-0001-4001-8001-000000000010', 'RES-2024-0010', 'c1000001-0001-4001-8001-000000000010', 'tab00001-0001-4001-8001-000000000009', CURRENT_DATE - INTERVAL '1 day', '18:00', 2, 'no_show', 'Sebastián López Ríos', '3198901234', 'sebastian.lopez@email.com', NULL, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day 22 hours', NULL, NULL, NULL)
ON CONFLICT (reservation_number) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 11. KITCHEN QUEUE (Cola de cocina para pedidos en preparación)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO kitchen_queue (id, order_item_id, priority, status, assigned_station, started_at, estimated_time) VALUES
-- Items en cola de pedido 3 (delivery preparing)
('kq000001-0001-4001-8001-000000000001', 'orit0001-0001-4001-8001-000000000005', 5, 'preparing', 'horno', CURRENT_TIMESTAMP - INTERVAL '10 minutes', 18),
('kq000001-0001-4001-8001-000000000002', 'orit0001-0001-4001-8001-000000000006', 5, 'queued', 'barra', NULL, 2),
-- Items en cola de pedido 8 (dine_in preparing)
('kq000001-0001-4001-8001-000000000003', 'orit0001-0001-4001-8001-000000000013', 3, 'preparing', 'parrilla', CURRENT_TIMESTAMP - INTERVAL '5 minutes', 18),
('kq000001-0001-4001-8001-000000000004', 'orit0001-0001-4001-8001-000000000014', 3, 'queued', 'barra', NULL, 5),
-- Items listos de pedido 4 y 9
('kq000001-0001-4001-8001-000000000005', 'orit0001-0001-4001-8001-000000000007', 5, 'ready', 'parrilla', CURRENT_TIMESTAMP - INTERVAL '25 minutes', 15),
('kq000001-0001-4001-8001-000000000006', 'orit0001-0001-4001-8001-000000000015', 3, 'ready', 'parrilla', CURRENT_TIMESTAMP - INTERVAL '20 minutes', 35)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DE DATOS DE EJEMPLO
-- ═══════════════════════════════════════════════════════════════════════════
