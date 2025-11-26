-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA: MENÚ COMPLETO DEL RESTAURANTE
-- 10 Categorías, 50 Subcategorías, 150 Productos
-- ═══════════════════════════════════════════════════════════════════════════

-- Limpiar datos existentes (opcional - comentar si desea mantener datos previos)
-- TRUNCATE menu_items, menu_subcategories, menu_categories CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. CATEGORÍAS (10 categorías)
-- ═══════════════════════════════════════════════════════════════════════════

DELETE FROM menu_categories WHERE name IN (
    'BEBIDAS FRÍAS', 'BEBIDAS CALIENTES', 'ENTRADAS', 'PLATOS PRINCIPALES',
    'CARNES', 'PESCADOS Y MARISCOS', 'PASTAS', 'ENSALADAS', 'POSTRES', 'PROMOCIONES'
);

INSERT INTO menu_categories (id, name, image_url, display_order, is_active) VALUES
    (gen_random_uuid(), 'BEBIDAS FRÍAS', 'https://images.unsplash.com/photo-1437418747212-8d9709afab22', 1, true),
    (gen_random_uuid(), 'BEBIDAS CALIENTES', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd', 2, true),
    (gen_random_uuid(), 'ENTRADAS', 'https://images.unsplash.com/photo-1541529086526-db283c563270', 3, true),
    (gen_random_uuid(), 'PLATOS PRINCIPALES', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 4, true),
    (gen_random_uuid(), 'CARNES', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba', 5, true),
    (gen_random_uuid(), 'PESCADOS Y MARISCOS', 'https://images.unsplash.com/photo-1580959375944-1ab5b8e1c3c5', 6, true),
    (gen_random_uuid(), 'PASTAS', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9', 7, true),
    (gen_random_uuid(), 'ENSALADAS', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', 8, true),
    (gen_random_uuid(), 'POSTRES', 'https://images.unsplash.com/photo-1488477181946-6428a0291777', 9, true),
    (gen_random_uuid(), 'PROMOCIONES', 'https://images.unsplash.com/photo-1513104890138-7c749659a591', 10, true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. SUBCATEGORÍAS (50 subcategorías - 5 por categoría)
-- ═══════════════════════════════════════════════════════════════════════════

-- Subcategorías para BEBIDAS FRÍAS
INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Jugos Naturales', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba', 1, true
FROM menu_categories c WHERE c.name = 'BEBIDAS FRÍAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Malteadas', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699', 2, true
FROM menu_categories c WHERE c.name = 'BEBIDAS FRÍAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Sodas', 'https://images.unsplash.com/photo-1527960471264-932f39eb5846', 3, true
FROM menu_categories c WHERE c.name = 'BEBIDAS FRÍAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Cervezas', 'https://images.unsplash.com/photo-1535958636474-b021ee887b13', 4, true
FROM menu_categories c WHERE c.name = 'BEBIDAS FRÍAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Cócteles Sin Alcohol', 'https://images.unsplash.com/photo-1536935338788-846bb9981813', 5, true
FROM menu_categories c WHERE c.name = 'BEBIDAS FRÍAS';

-- Subcategorías para BEBIDAS CALIENTES
INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Cafés', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', 1, true
FROM menu_categories c WHERE c.name = 'BEBIDAS CALIENTES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Tés', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc', 2, true
FROM menu_categories c WHERE c.name = 'BEBIDAS CALIENTES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Chocolates', 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed', 3, true
FROM menu_categories c WHERE c.name = 'BEBIDAS CALIENTES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Infusiones', 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2', 4, true
FROM menu_categories c WHERE c.name = 'BEBIDAS CALIENTES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Capuchinos', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d', 5, true
FROM menu_categories c WHERE c.name = 'BEBIDAS CALIENTES';

-- Subcategorías para ENTRADAS
INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Sopas', 'https://images.unsplash.com/photo-1547592166-23ac45744acd', 1, true
FROM menu_categories c WHERE c.name = 'ENTRADAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Cremas', 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a', 2, true
FROM menu_categories c WHERE c.name = 'ENTRADAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Ceviches', 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3', 3, true
FROM menu_categories c WHERE c.name = 'ENTRADAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Empanadas', 'https://images.unsplash.com/photo-1604467715878-83e57e8bc129', 4, true
FROM menu_categories c WHERE c.name = 'ENTRADAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Carpaccios', 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7', 5, true
FROM menu_categories c WHERE c.name = 'ENTRADAS';

-- Subcategorías para PLATOS PRINCIPALES
INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Arroces', 'https://images.unsplash.com/photo-1596560548464-f010549b84d7', 1, true
FROM menu_categories c WHERE c.name = 'PLATOS PRINCIPALES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Cazuelas', 'https://images.unsplash.com/photo-1534939561126-855b8675edd7', 2, true
FROM menu_categories c WHERE c.name = 'PLATOS PRINCIPALES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Guisos', 'https://images.unsplash.com/photo-1547592166-23ac45744acd', 3, true
FROM menu_categories c WHERE c.name = 'PLATOS PRINCIPALES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Especialidades', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', 4, true
FROM menu_categories c WHERE c.name = 'PLATOS PRINCIPALES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Típicos', 'https://images.unsplash.com/photo-1551326844-4df70f78d0e9', 5, true
FROM menu_categories c WHERE c.name = 'PLATOS PRINCIPALES';

-- Subcategorías para CARNES
INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Res', 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6', 1, true
FROM menu_categories c WHERE c.name = 'CARNES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Cerdo', 'https://images.unsplash.com/photo-1432139555190-58524dae6a55', 2, true
FROM menu_categories c WHERE c.name = 'CARNES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Pollo', 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6', 3, true
FROM menu_categories c WHERE c.name = 'CARNES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Cordero', 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29', 4, true
FROM menu_categories c WHERE c.name = 'CARNES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Mixtas', 'https://images.unsplash.com/photo-1544025162-d76694265947', 5, true
FROM menu_categories c WHERE c.name = 'CARNES';

-- Subcategorías para PESCADOS Y MARISCOS
INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Pescados Frescos', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2', 1, true
FROM menu_categories c WHERE c.name = 'PESCADOS Y MARISCOS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Camarones', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47', 2, true
FROM menu_categories c WHERE c.name = 'PESCADOS Y MARISCOS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Langosta', 'https://images.unsplash.com/photo-1559742811-822873691df8', 3, true
FROM menu_categories c WHERE c.name = 'PESCADOS Y MARISCOS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Pulpo', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38', 4, true
FROM menu_categories c WHERE c.name = 'PESCADOS Y MARISCOS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Mixtos de Mar', 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b', 5, true
FROM menu_categories c WHERE c.name = 'PESCADOS Y MARISCOS';

-- Subcategorías para PASTAS
INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Espaguetis', 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0', 1, true
FROM menu_categories c WHERE c.name = 'PASTAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Fetuccinis', 'https://images.unsplash.com/photo-1556761223-4c4282c73f77', 2, true
FROM menu_categories c WHERE c.name = 'PASTAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Lasañas', 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3', 3, true
FROM menu_categories c WHERE c.name = 'PASTAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Raviolis', 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa', 4, true
FROM menu_categories c WHERE c.name = 'PASTAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Ñoquis', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141', 5, true
FROM menu_categories c WHERE c.name = 'PASTAS';

-- Subcategorías para ENSALADAS
INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Verdes', 'https://images.unsplash.com/photo-1540420773420-3366772f4999', 1, true
FROM menu_categories c WHERE c.name = 'ENSALADAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Con Proteína', 'https://images.unsplash.com/photo-1546793665-c74683f339c1', 2, true
FROM menu_categories c WHERE c.name = 'ENSALADAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Mediterráneas', 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af', 3, true
FROM menu_categories c WHERE c.name = 'ENSALADAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Tropicales', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe', 4, true
FROM menu_categories c WHERE c.name = 'ENSALADAS';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'De Pasta', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601', 5, true
FROM menu_categories c WHERE c.name = 'ENSALADAS';

-- Subcategorías para POSTRES
INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Helados', 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f', 1, true
FROM menu_categories c WHERE c.name = 'POSTRES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Tortas', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', 2, true
FROM menu_categories c WHERE c.name = 'POSTRES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Flanes', 'https://images.unsplash.com/photo-1517427294546-5aa121f68e8a', 3, true
FROM menu_categories c WHERE c.name = 'POSTRES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Mousses', 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3', 4, true
FROM menu_categories c WHERE c.name = 'POSTRES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Frutas', 'https://images.unsplash.com/photo-1564093497595-593b96d80180', 5, true
FROM menu_categories c WHERE c.name = 'POSTRES';

-- Subcategorías para PROMOCIONES
INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Combos Familiares', 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327', 1, true
FROM menu_categories c WHERE c.name = 'PROMOCIONES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Menú del Día', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288', 2, true
FROM menu_categories c WHERE c.name = 'PROMOCIONES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Happy Hour', 'https://images.unsplash.com/photo-1470337458703-46ad1756a187', 3, true
FROM menu_categories c WHERE c.name = 'PROMOCIONES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Especiales de Temporada', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', 4, true
FROM menu_categories c WHERE c.name = 'PROMOCIONES';

INSERT INTO menu_subcategories (id, category_id, name, image_url, display_order, is_active)
SELECT gen_random_uuid(), c.id, 'Para Compartir', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', 5, true
FROM menu_categories c WHERE c.name = 'PROMOCIONES';

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. PRODUCTOS (150 productos - ~15 por categoría, 3 por subcategoría)
-- ═══════════════════════════════════════════════════════════════════════════

-- BEBIDAS FRÍAS - Jugos Naturales (PROD-001 a PROD-003)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-001', c.id, s.id, 'Jugo de Naranja Natural', 'Jugo 100% natural recién exprimido, sin azúcar añadida', 8000, 2000, 'active', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba', 5, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Jugos Naturales' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-002', c.id, s.id, 'Jugo de Fresa con Leche', 'Deliciosa mezcla de fresas frescas con leche', 10000, 2000, 'active', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888', 8, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Jugos Naturales' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-003', c.id, s.id, 'Jugo Verde Detox', 'Espinaca, apio, pepino y manzana verde', 12000, 2000, 'active', 'https://images.unsplash.com/photo-1610970881699-44a5587cabec', 7, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Jugos Naturales' AND s.category_id = c.id;

-- BEBIDAS FRÍAS - Malteadas (PROD-004 a PROD-006)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-004', c.id, s.id, 'Malteada de Chocolate', 'Cremosa malteada con helado de chocolate premium', 14000, 2500, 'active', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699', 8, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Malteadas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-005', c.id, s.id, 'Malteada de Vainilla', 'Clásica malteada con helado de vainilla natural', 13000, 2500, 'active', 'https://images.unsplash.com/photo-1568901839119-631418a3910d', 8, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Malteadas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-006', c.id, s.id, 'Malteada de Oreo', 'Malteada con galletas Oreo y helado de vainilla', 15000, 2500, 'active', 'https://images.unsplash.com/photo-1577805947697-89e18249d767', 10, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Malteadas' AND s.category_id = c.id;

-- BEBIDAS FRÍAS - Sodas (PROD-007 a PROD-009)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-007', c.id, s.id, 'Coca-Cola', 'Bebida refrescante clásica 350ml', 5000, 2000, 'active', 'https://images.unsplash.com/photo-1554866585-cd94860890b7', 2, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Sodas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-008', c.id, s.id, 'Sprite', 'Bebida de limón refrescante 350ml', 5000, 2000, 'active', 'https://images.unsplash.com/photo-1527960471264-932f39eb5846', 2, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Sodas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-009', c.id, s.id, 'Agua Mineral', 'Agua mineral con gas 500ml', 4000, 2000, 'active', 'https://images.unsplash.com/photo-1560023907-5f339617ea30', 1, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Sodas' AND s.category_id = c.id;

-- BEBIDAS FRÍAS - Cervezas (PROD-010 a PROD-012)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-010', c.id, s.id, 'Cerveza Club Colombia', 'Cerveza premium colombiana 330ml', 8000, 2000, 'active', 'https://images.unsplash.com/photo-1535958636474-b021ee887b13', 2, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Cervezas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-011', c.id, s.id, 'Cerveza Artesanal IPA', 'Cerveza artesanal local tipo IPA 350ml', 12000, 2500, 'active', 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d', 2, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Cervezas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-012', c.id, s.id, 'Michelada', 'Cerveza con limón, sal y salsa picante', 10000, 2500, 'active', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd', 5, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Cervezas' AND s.category_id = c.id;

-- BEBIDAS FRÍAS - Cócteles Sin Alcohol (PROD-013 a PROD-015)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-013', c.id, s.id, 'Virgin Mojito', 'Refrescante mojito sin alcohol con menta fresca', 12000, 2500, 'active', 'https://images.unsplash.com/photo-1536935338788-846bb9981813', 8, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Cócteles Sin Alcohol' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-014', c.id, s.id, 'Piña Colada Sin Alcohol', 'Cremosa mezcla de piña y coco', 14000, 2500, 'active', 'https://images.unsplash.com/photo-1582106245687-cfd4d5f0d1a5', 10, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Cócteles Sin Alcohol' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-015', c.id, s.id, 'Limonada de Coco', 'Limonada refrescante con crema de coco', 10000, 2500, 'active', 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e', 7, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS FRÍAS' AND s.name = 'Cócteles Sin Alcohol' AND s.category_id = c.id;

-- BEBIDAS CALIENTES - Cafés (PROD-016 a PROD-018)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-016', c.id, s.id, 'Espresso Doble', 'Café espresso doble intenso', 6000, 2000, 'active', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', 5, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Cafés' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-017', c.id, s.id, 'Café Americano', 'Café espresso con agua caliente', 5000, 2000, 'active', 'https://images.unsplash.com/photo-1495774856032-8b90bbb32b32', 4, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Cafés' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-018', c.id, s.id, 'Latte', 'Espresso con leche cremosa', 8000, 2000, 'active', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735', 6, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Cafés' AND s.category_id = c.id;

-- BEBIDAS CALIENTES - Tés (PROD-019 a PROD-021)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-019', c.id, s.id, 'Té Verde', 'Té verde orgánico con antioxidantes', 6000, 2000, 'active', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc', 5, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Tés' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-020', c.id, s.id, 'Té de Manzanilla', 'Infusión relajante de manzanilla', 5000, 2000, 'active', 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2', 4, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Tés' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-021', c.id, s.id, 'Chai Latte', 'Té chai especiado con leche espumosa', 9000, 2000, 'active', 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f', 7, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Tés' AND s.category_id = c.id;

-- BEBIDAS CALIENTES - Chocolates (PROD-022 a PROD-024)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-022', c.id, s.id, 'Chocolate Caliente', 'Chocolate de cacao premium con leche', 8000, 2000, 'active', 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed', 6, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Chocolates' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-023', c.id, s.id, 'Mocaccino', 'Espresso con chocolate y leche cremosa', 10000, 2000, 'active', 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e', 7, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Chocolates' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-024', c.id, s.id, 'Chocolate Blanco', 'Cremoso chocolate blanco caliente', 9000, 2000, 'active', 'https://images.unsplash.com/photo-1517578239113-b03992dcdd25', 6, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Chocolates' AND s.category_id = c.id;

-- BEBIDAS CALIENTES - Infusiones (PROD-025 a PROD-027)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-025', c.id, s.id, 'Agua de Panela con Limón', 'Bebida tradicional colombiana caliente', 5000, 2000, 'active', 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2', 5, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Infusiones' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-026', c.id, s.id, 'Jengibre y Miel', 'Infusión de jengibre fresco con miel', 7000, 2000, 'active', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574', 6, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Infusiones' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-027', c.id, s.id, 'Aromática de Frutas', 'Infusión de frutas tropicales', 6000, 2000, 'active', 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9', 5, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Infusiones' AND s.category_id = c.id;

-- BEBIDAS CALIENTES - Capuchinos (PROD-028 a PROD-030)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-028', c.id, s.id, 'Capuchino Clásico', 'Espresso con leche espumosa y canela', 8000, 2000, 'active', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d', 6, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Capuchinos' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-029', c.id, s.id, 'Capuchino de Vainilla', 'Capuchino con jarabe de vainilla', 10000, 2000, 'active', 'https://images.unsplash.com/photo-1534778101976-62847782c213', 7, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Capuchinos' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-030', c.id, s.id, 'Capuchino de Caramelo', 'Capuchino con salsa de caramelo', 10000, 2000, 'active', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2', 7, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'BEBIDAS CALIENTES' AND s.name = 'Capuchinos' AND s.category_id = c.id;

-- ENTRADAS - Sopas (PROD-031 a PROD-033)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-031', c.id, s.id, 'Sopa del Día', 'Sopa fresca preparada diariamente', 12000, 3000, 'active', 'https://images.unsplash.com/photo-1547592166-23ac45744acd', 15, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Sopas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-032', c.id, s.id, 'Sancocho Colombiano', 'Tradicional sancocho con pollo y plátano', 18000, 3500, 'active', 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d', 20, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Sopas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-033', c.id, s.id, 'Sopa de Tortilla', 'Sopa mexicana con tortilla crocante', 14000, 3000, 'active', 'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e', 18, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Sopas' AND s.category_id = c.id;

-- ENTRADAS - Cremas (PROD-034 a PROD-036)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-034', c.id, s.id, 'Crema de Champiñones', 'Suave crema con champiñones frescos', 14000, 3000, 'active', 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a', 15, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Cremas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-035', c.id, s.id, 'Crema de Tomate', 'Cremosa sopa de tomate con albahaca', 12000, 3000, 'active', 'https://images.unsplash.com/photo-1574484284002-952d92456975', 12, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Cremas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-036', c.id, s.id, 'Crema de Espárragos', 'Delicada crema de espárragos verdes', 16000, 3000, 'active', 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5', 15, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Cremas' AND s.category_id = c.id;

-- ENTRADAS - Ceviches (PROD-037 a PROD-039)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-037', c.id, s.id, 'Ceviche de Camarón', 'Camarones frescos marinados en limón', 22000, 3500, 'active', 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3', 15, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Ceviches' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-038', c.id, s.id, 'Ceviche Mixto', 'Pescado y mariscos en leche de tigre', 25000, 3500, 'active', 'https://images.unsplash.com/photo-1551218808-94e220e084d2', 18, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Ceviches' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-039', c.id, s.id, 'Ceviche de Pescado', 'Pescado blanco fresco con cebolla morada', 20000, 3500, 'active', 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699', 15, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Ceviches' AND s.category_id = c.id;

-- ENTRADAS - Empanadas (PROD-040 a PROD-042)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-040', c.id, s.id, 'Empanadas de Carne', 'Trio de empanadas criollas de carne', 12000, 2500, 'active', 'https://images.unsplash.com/photo-1604467715878-83e57e8bc129', 12, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Empanadas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-041', c.id, s.id, 'Empanadas de Pollo', 'Trio de empanadas rellenas de pollo', 12000, 2500, 'active', 'https://images.unsplash.com/photo-1609525313344-a56c30168f24', 12, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Empanadas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-042', c.id, s.id, 'Empanadas Hawaianas', 'Empanadas con jamón y piña', 14000, 2500, 'active', 'https://images.unsplash.com/photo-1628840042765-356cda07504e', 12, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Empanadas' AND s.category_id = c.id;

-- ENTRADAS - Carpaccios (PROD-043 a PROD-045)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-043', c.id, s.id, 'Carpaccio de Res', 'Finas láminas de res con parmesano', 24000, 3500, 'active', 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7', 10, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Carpaccios' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-044', c.id, s.id, 'Carpaccio de Salmón', 'Salmón fresco con alcaparras y eneldo', 26000, 3500, 'active', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2', 10, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Carpaccios' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-045', c.id, s.id, 'Carpaccio de Pulpo', 'Pulpo marinado con aceite de oliva', 28000, 3500, 'active', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38', 12, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENTRADAS' AND s.name = 'Carpaccios' AND s.category_id = c.id;

-- PLATOS PRINCIPALES - Arroces (PROD-046 a PROD-048)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-046', c.id, s.id, 'Arroz con Pollo', 'Clásico arroz con pollo y verduras', 25000, 4000, 'active', 'https://images.unsplash.com/photo-1596560548464-f010549b84d7', 25, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Arroces' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-047', c.id, s.id, 'Arroz con Mariscos', 'Arroz marinero con camarones y calamares', 35000, 4500, 'active', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb', 30, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Arroces' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-048', c.id, s.id, 'Arroz Tailandés', 'Arroz frito estilo thai con vegetales', 22000, 4000, 'active', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b', 20, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Arroces' AND s.category_id = c.id;

-- PLATOS PRINCIPALES - Cazuelas (PROD-049 a PROD-051)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-049', c.id, s.id, 'Cazuela de Mariscos', 'Cremosa cazuela con variedad de mariscos', 38000, 5000, 'active', 'https://images.unsplash.com/photo-1534939561126-855b8675edd7', 30, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Cazuelas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-050', c.id, s.id, 'Cazuela de Frijoles', 'Tradicional cazuela con carne y chorizo', 22000, 4000, 'active', 'https://images.unsplash.com/photo-1574484284002-952d92456975', 25, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Cazuelas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-051', c.id, s.id, 'Cazuela Campesina', 'Mezcla de carnes y verduras en salsa criolla', 28000, 4500, 'active', 'https://images.unsplash.com/photo-1547592166-23ac45744acd', 28, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Cazuelas' AND s.category_id = c.id;

-- PLATOS PRINCIPALES - Guisos (PROD-052 a PROD-054)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-052', c.id, s.id, 'Sudado de Pollo', 'Pollo guisado con papa criolla y yuca', 24000, 4000, 'active', 'https://images.unsplash.com/photo-1547592166-23ac45744acd', 30, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Guisos' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-053', c.id, s.id, 'Guiso de Res', 'Carne de res guisada con vegetales', 28000, 4000, 'active', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d', 35, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Guisos' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-054', c.id, s.id, 'Estofado de Cerdo', 'Cerdo estofado con papas y zanahorias', 26000, 4000, 'active', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', 35, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Guisos' AND s.category_id = c.id;

-- PLATOS PRINCIPALES - Especialidades (PROD-055 a PROD-057)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-055', c.id, s.id, 'Filet Mignon', 'Medallón de res premium con salsa de vino tinto', 45000, 5000, 'active', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', 30, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Especialidades' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-056', c.id, s.id, 'Salmón a la Plancha', 'Filete de salmón con vegetales grillados', 42000, 5000, 'active', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288', 25, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Especialidades' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-057', c.id, s.id, 'Pechuga Cordon Bleu', 'Pechuga rellena de jamón y queso', 32000, 4500, 'active', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b', 28, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Especialidades' AND s.category_id = c.id;

-- PLATOS PRINCIPALES - Típicos (PROD-058 a PROD-060)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-058', c.id, s.id, 'Bandeja Paisa', 'Plato típico con frijoles, arroz, carne, chicharrón y más', 35000, 5000, 'active', 'https://images.unsplash.com/photo-1551326844-4df70f78d0e9', 30, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Típicos' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-059', c.id, s.id, 'Ajiaco Bogotano', 'Sopa tradicional con pollo, papa y guascas', 28000, 4500, 'active', 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d', 35, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Típicos' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-060', c.id, s.id, 'Tamal Tolimense', 'Tamal tradicional con arroz y carnes', 18000, 3500, 'active', 'https://images.unsplash.com/photo-1619546952812-520e98064a52', 20, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PLATOS PRINCIPALES' AND s.name = 'Típicos' AND s.category_id = c.id;

-- CARNES - Res (PROD-061 a PROD-063)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-061', c.id, s.id, 'Lomo de Res a la Parrilla', 'Jugoso lomo de res asado al carbón', 38000, 5000, 'active', 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6', 25, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Res' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-062', c.id, s.id, 'T-Bone Steak', 'Corte T-Bone de 400g a la parrilla', 52000, 5000, 'active', 'https://images.unsplash.com/photo-1558030006-450675393462', 30, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Res' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-063', c.id, s.id, 'Punta de Anca', 'Corte magro a la parrilla con chimichurri', 42000, 5000, 'active', 'https://images.unsplash.com/photo-1544025162-d76694265947', 28, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Res' AND s.category_id = c.id;

-- CARNES - Cerdo (PROD-064 a PROD-066)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-064', c.id, s.id, 'Costillas BBQ', 'Costillas de cerdo glaseadas con salsa BBQ', 35000, 4500, 'active', 'https://images.unsplash.com/photo-1432139555190-58524dae6a55', 35, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Cerdo' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-065', c.id, s.id, 'Chuleta de Cerdo', 'Chuleta ahumada con puré de manzana', 28000, 4000, 'active', 'https://images.unsplash.com/photo-1559847844-5315695dadae', 25, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Cerdo' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-066', c.id, s.id, 'Lechona Porción', 'Tradicional lechona tolimense porción individual', 25000, 4000, 'active', 'https://images.unsplash.com/photo-1606728035253-49e8a23146de', 15, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Cerdo' AND s.category_id = c.id;

-- CARNES - Pollo (PROD-067 a PROD-069)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-067', c.id, s.id, 'Pollo a la Parrilla', 'Medio pollo asado con hierbas', 28000, 4000, 'active', 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6', 30, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Pollo' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-068', c.id, s.id, 'Alitas BBQ', 'Alitas de pollo con salsa BBQ picante', 22000, 3500, 'active', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f', 20, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Pollo' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-069', c.id, s.id, 'Pollo Teriyaki', 'Pechuga de pollo glaseada con salsa teriyaki', 26000, 4000, 'active', 'https://images.unsplash.com/photo-1527477396000-e27163b481c2', 25, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Pollo' AND s.category_id = c.id;

-- CARNES - Cordero (PROD-070 a PROD-072)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-070', c.id, s.id, 'Rack de Cordero', 'Costillar de cordero con costra de hierbas', 55000, 5000, 'active', 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29', 35, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Cordero' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-071', c.id, s.id, 'Pierna de Cordero', 'Pierna de cordero al horno con romero', 48000, 5000, 'active', 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143', 40, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Cordero' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-072', c.id, s.id, 'Chuletas de Cordero', 'Chuletas de cordero a la parrilla', 42000, 5000, 'active', 'https://images.unsplash.com/photo-1608039790890-54f7a0076b5d', 30, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Cordero' AND s.category_id = c.id;

-- CARNES - Mixtas (PROD-073 a PROD-075)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-073', c.id, s.id, 'Parrillada Mixta', 'Selección de res, cerdo y pollo a la parrilla', 65000, 5000, 'active', 'https://images.unsplash.com/photo-1544025162-d76694265947', 40, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Mixtas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-074', c.id, s.id, 'Brochetas Mixtas', 'Brochetas de res, pollo y vegetales', 32000, 4000, 'active', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', 25, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Mixtas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-075', c.id, s.id, 'Picada Campestre', 'Selección de carnes fritas y asadas para compartir', 58000, 5000, 'active', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba', 35, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'CARNES' AND s.name = 'Mixtas' AND s.category_id = c.id;

-- PESCADOS Y MARISCOS - Pescados Frescos (PROD-076 a PROD-078)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-076', c.id, s.id, 'Mojarra Frita', 'Mojarra fresca frita con patacones', 28000, 4000, 'active', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2', 25, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Pescados Frescos' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-077', c.id, s.id, 'Trucha al Ajillo', 'Trucha con ajo y mantequilla de hierbas', 32000, 4500, 'active', 'https://images.unsplash.com/photo-1580959375944-1ab5b8e1c3c5', 22, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Pescados Frescos' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-078', c.id, s.id, 'Robalo a la Plancha', 'Filete de robalo con vegetales salteados', 38000, 4500, 'active', 'https://images.unsplash.com/photo-1485921325833-c519f76c4927', 25, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Pescados Frescos' AND s.category_id = c.id;

-- PESCADOS Y MARISCOS - Camarones (PROD-079 a PROD-081)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-079', c.id, s.id, 'Camarones al Ajillo', 'Camarones salteados con ajo y aceite de oliva', 35000, 4500, 'active', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47', 18, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Camarones' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-080', c.id, s.id, 'Camarones Apanados', 'Camarones crocantes con salsa tártara', 32000, 4000, 'active', 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6', 20, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Camarones' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-081', c.id, s.id, 'Camarones en Salsa de Coco', 'Camarones en cremosa salsa de coco', 38000, 4500, 'active', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b', 22, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Camarones' AND s.category_id = c.id;

-- PESCADOS Y MARISCOS - Langosta (PROD-082 a PROD-084)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-082', c.id, s.id, 'Langosta Thermidor', 'Media langosta gratinada con queso', 75000, 5000, 'active', 'https://images.unsplash.com/photo-1559742811-822873691df8', 35, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Langosta' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-083', c.id, s.id, 'Cola de Langosta a la Mantequilla', 'Cola de langosta con mantequilla de hierbas', 68000, 5000, 'active', 'https://images.unsplash.com/photo-1606731219412-94c9a45aa8c2', 30, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Langosta' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-084', c.id, s.id, 'Langosta a la Parrilla', 'Langosta entera asada con limón', 85000, 5000, 'active', 'https://images.unsplash.com/photo-1553247407-23251ce81f59', 35, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Langosta' AND s.category_id = c.id;

-- PESCADOS Y MARISCOS - Pulpo (PROD-085 a PROD-087)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-085', c.id, s.id, 'Pulpo a la Gallega', 'Pulpo con pimentón y aceite de oliva', 45000, 5000, 'active', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38', 30, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Pulpo' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-086', c.id, s.id, 'Pulpo a la Parrilla', 'Tentáculos de pulpo asados al carbón', 48000, 5000, 'active', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38', 35, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Pulpo' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-087', c.id, s.id, 'Ensalada de Pulpo', 'Pulpo frío con vegetales mediterráneos', 42000, 4500, 'active', 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7', 25, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Pulpo' AND s.category_id = c.id;

-- PESCADOS Y MARISCOS - Mixtos de Mar (PROD-088 a PROD-090)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-088', c.id, s.id, 'Paella Marinera', 'Arroz con variedad de mariscos al estilo español', 55000, 5000, 'active', 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b', 40, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Mixtos de Mar' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-089', c.id, s.id, 'Bandeja de Mariscos', 'Selección de mariscos frescos para 2 personas', 85000, 5000, 'active', 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62', 35, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Mixtos de Mar' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-090', c.id, s.id, 'Salpicón de Mariscos', 'Mezcla fría de mariscos con aguacate', 38000, 4500, 'active', 'https://images.unsplash.com/photo-1534080564583-6be75777b70a', 20, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PESCADOS Y MARISCOS' AND s.name = 'Mixtos de Mar' AND s.category_id = c.id;

-- PASTAS - Espaguetis (PROD-091 a PROD-093)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-091', c.id, s.id, 'Spaghetti Bolognesa', 'Pasta con salsa de carne italiana', 24000, 4000, 'active', 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0', 20, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Espaguetis' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-092', c.id, s.id, 'Spaghetti Carbonara', 'Pasta con huevo, panceta y parmesano', 26000, 4000, 'active', 'https://images.unsplash.com/photo-1612874742237-6526221588e3', 18, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Espaguetis' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-093', c.id, s.id, 'Spaghetti Pomodoro', 'Pasta con salsa de tomate fresco y albahaca', 20000, 3500, 'active', 'https://images.unsplash.com/photo-1598866594230-a7c12756260f', 15, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Espaguetis' AND s.category_id = c.id;

-- PASTAS - Fetuccinis (PROD-094 a PROD-096)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-094', c.id, s.id, 'Fettuccine Alfredo', 'Pasta en cremosa salsa blanca', 25000, 4000, 'active', 'https://images.unsplash.com/photo-1556761223-4c4282c73f77', 18, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Fetuccinis' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-095', c.id, s.id, 'Fettuccine con Pollo', 'Pasta con tiras de pollo en salsa cremosa', 28000, 4000, 'active', 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8', 22, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Fetuccinis' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-096', c.id, s.id, 'Fettuccine ai Frutti di Mare', 'Pasta con mariscos en salsa de vino blanco', 35000, 4500, 'active', 'https://images.unsplash.com/photo-1611270629569-8b357cb88da9', 25, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Fetuccinis' AND s.category_id = c.id;

-- PASTAS - Lasañas (PROD-097 a PROD-099)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-097', c.id, s.id, 'Lasaña Clásica', 'Lasaña de carne con bechamel y mozzarella', 28000, 4000, 'active', 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3', 25, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Lasañas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-098', c.id, s.id, 'Lasaña de Pollo y Champiñones', 'Capas de pasta con pollo y champiñones', 26000, 4000, 'active', 'https://images.unsplash.com/photo-1560684352-8497838a2229', 25, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Lasañas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-099', c.id, s.id, 'Lasaña Vegetariana', 'Lasaña de vegetales con ricotta', 24000, 4000, 'active', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9', 25, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Lasañas' AND s.category_id = c.id;

-- PASTAS - Raviolis (PROD-100 a PROD-102)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-100', c.id, s.id, 'Ravioli de Ricotta y Espinaca', 'Raviolis rellenos con salsa de mantequilla', 26000, 4000, 'active', 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa', 20, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Raviolis' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-101', c.id, s.id, 'Ravioli de Carne', 'Raviolis de carne en salsa napolitana', 28000, 4000, 'active', 'https://images.unsplash.com/photo-1608897013039-887f21d8c804', 22, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Raviolis' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-102', c.id, s.id, 'Ravioli de Langosta', 'Raviolis premium de langosta con salsa rosada', 42000, 5000, 'active', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141', 25, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Raviolis' AND s.category_id = c.id;

-- PASTAS - Ñoquis (PROD-103 a PROD-105)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-103', c.id, s.id, 'Ñoquis con Pesto', 'Ñoquis de papa con salsa pesto genovés', 24000, 4000, 'active', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141', 18, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Ñoquis' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-104', c.id, s.id, 'Ñoquis a los 4 Quesos', 'Ñoquis en cremosa salsa de quesos', 26000, 4000, 'active', 'https://images.unsplash.com/photo-1548940740-204726a19be3', 20, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Ñoquis' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-105', c.id, s.id, 'Ñoquis al Pomodoro', 'Ñoquis con salsa de tomate fresco', 22000, 3500, 'active', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9', 18, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PASTAS' AND s.name = 'Ñoquis' AND s.category_id = c.id;

-- ENSALADAS - Verdes (PROD-106 a PROD-108)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-106', c.id, s.id, 'Ensalada Mixta', 'Lechuga, tomate, cebolla y aguacate', 14000, 3000, 'active', 'https://images.unsplash.com/photo-1540420773420-3366772f4999', 10, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'Verdes' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-107', c.id, s.id, 'Ensalada de Rúcula', 'Rúcula fresca con parmesano y nueces', 18000, 3000, 'active', 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af', 10, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'Verdes' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-108', c.id, s.id, 'Ensalada de Espinacas', 'Espinacas baby con fresas y almendras', 16000, 3000, 'active', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', 10, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'Verdes' AND s.category_id = c.id;

-- ENSALADAS - Con Proteína (PROD-109 a PROD-111)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-109', c.id, s.id, 'Ensalada César con Pollo', 'Clásica ensalada césar con pechuga grillada', 24000, 3500, 'active', 'https://images.unsplash.com/photo-1546793665-c74683f339c1', 15, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'Con Proteína' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-110', c.id, s.id, 'Ensalada con Salmón', 'Mix de lechugas con salmón ahumado', 32000, 4000, 'active', 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71', 15, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'Con Proteína' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-111', c.id, s.id, 'Ensalada con Camarones', 'Ensalada fresca con camarones salteados', 28000, 3500, 'active', 'https://images.unsplash.com/photo-1551248429-40975aa4de74', 18, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'Con Proteína' AND s.category_id = c.id;

-- ENSALADAS - Mediterráneas (PROD-112 a PROD-114)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-112', c.id, s.id, 'Ensalada Griega', 'Tomate, pepino, aceitunas y queso feta', 20000, 3000, 'active', 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af', 12, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'Mediterráneas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-113', c.id, s.id, 'Ensalada Caprese', 'Tomate, mozzarella fresca y albahaca', 22000, 3000, 'active', 'https://images.unsplash.com/photo-1608032077018-c9aad9565d29', 10, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'Mediterráneas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-114', c.id, s.id, 'Tabulé', 'Ensalada libanesa de bulgur con hierbas', 18000, 3000, 'active', 'https://images.unsplash.com/photo-1529059997568-3d847b1154f0', 15, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'Mediterráneas' AND s.category_id = c.id;

-- ENSALADAS - Tropicales (PROD-115 a PROD-117)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-115', c.id, s.id, 'Ensalada Tropical', 'Mix de frutas tropicales con lechugas', 18000, 3000, 'active', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe', 12, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'Tropicales' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-116', c.id, s.id, 'Ensalada de Mango y Aguacate', 'Mango fresco con aguacate y vinagreta', 20000, 3000, 'active', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 12, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'Tropicales' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-117', c.id, s.id, 'Ensalada de Papaya', 'Papaya verde rallada estilo thai', 22000, 3000, 'active', 'https://images.unsplash.com/photo-1564093497595-593b96d80180', 15, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'Tropicales' AND s.category_id = c.id;

-- ENSALADAS - De Pasta (PROD-118 a PROD-120)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-118', c.id, s.id, 'Ensalada de Fusilli', 'Pasta fusilli con vegetales y aderezo italiano', 16000, 3000, 'active', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601', 15, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'De Pasta' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-119', c.id, s.id, 'Ensalada de Coditos', 'Coditos con mayonesa y vegetales', 14000, 3000, 'active', 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71', 15, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'De Pasta' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-120', c.id, s.id, 'Ensalada Penne Mediterránea', 'Penne con aceitunas, tomates secos y feta', 20000, 3000, 'active', 'https://images.unsplash.com/photo-1510693206972-df098062cb71', 15, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'ENSALADAS' AND s.name = 'De Pasta' AND s.category_id = c.id;

-- POSTRES - Helados (PROD-121 a PROD-123)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-121', c.id, s.id, 'Copa de Helado', 'Tres bolas de helado con toppings', 12000, 3000, 'active', 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f', 5, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Helados' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-122', c.id, s.id, 'Banana Split', 'Clásico banana split con helado y frutas', 15000, 3000, 'active', 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9', 8, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Helados' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-123', c.id, s.id, 'Brownie con Helado', 'Brownie caliente con helado de vainilla', 16000, 3000, 'active', 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e', 10, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Helados' AND s.category_id = c.id;

-- POSTRES - Tortas (PROD-124 a PROD-126)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-124', c.id, s.id, 'Torta de Chocolate', 'Porción de torta de chocolate con ganache', 14000, 3000, 'active', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', 5, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Tortas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-125', c.id, s.id, 'Cheesecake de Frutos Rojos', 'Cremoso cheesecake con coulis de frutos rojos', 16000, 3000, 'active', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad', 5, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Tortas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-126', c.id, s.id, 'Tres Leches', 'Bizcocho bañado en tres tipos de leche', 12000, 3000, 'active', 'https://images.unsplash.com/photo-1488477181946-6428a0291777', 5, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Tortas' AND s.category_id = c.id;

-- POSTRES - Flanes (PROD-127 a PROD-129)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-127', c.id, s.id, 'Flan de Caramelo', 'Clásico flan con caramelo líquido', 10000, 2500, 'active', 'https://images.unsplash.com/photo-1517427294546-5aa121f68e8a', 5, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Flanes' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-128', c.id, s.id, 'Flan de Coco', 'Flan cremoso con ralladura de coco', 12000, 2500, 'active', 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40', 5, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Flanes' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-129', c.id, s.id, 'Flan Napolitano', 'Flan tradicional estilo napolitano', 11000, 2500, 'active', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac', 5, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Flanes' AND s.category_id = c.id;

-- POSTRES - Mousses (PROD-130 a PROD-132)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-130', c.id, s.id, 'Mousse de Chocolate', 'Suave mousse de chocolate belga', 14000, 3000, 'active', 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3', 5, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Mousses' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-131', c.id, s.id, 'Mousse de Maracuyá', 'Refrescante mousse de maracuyá', 13000, 3000, 'active', 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3', 5, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Mousses' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-132', c.id, s.id, 'Mousse de Limón', 'Mousse cítrico de limón', 12000, 3000, 'active', 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13', 5, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Mousses' AND s.category_id = c.id;

-- POSTRES - Frutas (PROD-133 a PROD-135)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-133', c.id, s.id, 'Ensalada de Frutas', 'Mix de frutas frescas de temporada', 10000, 2500, 'active', 'https://images.unsplash.com/photo-1564093497595-593b96d80180', 8, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Frutas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-134', c.id, s.id, 'Fresas con Crema', 'Fresas frescas con crema chantilly', 12000, 2500, 'active', 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87', 6, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Frutas' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-135', c.id, s.id, 'Piña Flameada', 'Rodajas de piña caramelizadas con ron', 14000, 3000, 'active', 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea', 10, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'POSTRES' AND s.name = 'Frutas' AND s.category_id = c.id;

-- PROMOCIONES - Combos Familiares (PROD-136 a PROD-138)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-136', c.id, s.id, 'Combo Familiar Parrilla', 'Parrillada mixta + ensalada + papas + 4 bebidas', 120000, 5000, 'active', 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327', 45, 'parrilla'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Combos Familiares' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-137', c.id, s.id, 'Combo Familiar Pasta', '4 platos de pasta + pan al ajo + 4 bebidas', 95000, 5000, 'active', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9', 35, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Combos Familiares' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-138', c.id, s.id, 'Combo Familiar Mariscos', 'Bandeja de mariscos + arroz + 4 bebidas', 150000, 5000, 'active', 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b', 40, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Combos Familiares' AND s.category_id = c.id;

-- PROMOCIONES - Menú del Día (PROD-139 a PROD-141)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-139', c.id, s.id, 'Almuerzo Ejecutivo', 'Sopa + plato principal + bebida + postre', 25000, 4000, 'active', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288', 20, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Menú del Día' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-140', c.id, s.id, 'Menú Light', 'Ensalada + proteína grillada + jugo natural', 28000, 3500, 'active', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 18, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Menú del Día' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-141', c.id, s.id, 'Menú Infantil', 'Nuggets + papas + bebida + helado', 18000, 3000, 'active', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187', 15, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Menú del Día' AND s.category_id = c.id;

-- PROMOCIONES - Happy Hour (PROD-142 a PROD-144)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-142', c.id, s.id, '2x1 Cervezas Nacionales', 'Pague 1 lleve 2 en cervezas nacionales', 8000, 2000, 'active', 'https://images.unsplash.com/photo-1470337458703-46ad1756a187', 2, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Happy Hour' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-143', c.id, s.id, 'Cóctel + Alitas', 'Virgin mojito + 6 alitas BBQ', 25000, 3500, 'active', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f', 15, 'bar'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Happy Hour' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-144', c.id, s.id, 'Café + Postre', 'Café premium + postre del día al 30% off', 15000, 2500, 'active', 'https://images.unsplash.com/photo-1551024506-0bccd828d307', 8, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Happy Hour' AND s.category_id = c.id;

-- PROMOCIONES - Especiales de Temporada (PROD-145 a PROD-147)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-145', c.id, s.id, 'Festival de Mariscos', 'Selección especial de mariscos de temporada', 65000, 5000, 'active', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', 35, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Especiales de Temporada' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-146', c.id, s.id, 'Menú Navideño', 'Pavo relleno + ensalada rusa + natilla', 48000, 5000, 'active', 'https://images.unsplash.com/photo-1574484284002-952d92456975', 40, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Especiales de Temporada' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-147', c.id, s.id, 'Festival de Postres', 'Degustación de 5 mini postres', 22000, 3500, 'active', 'https://images.unsplash.com/photo-1488477181946-6428a0291777', 15, 'postres'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Especiales de Temporada' AND s.category_id = c.id;

-- PROMOCIONES - Para Compartir (PROD-148 a PROD-150)
INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-148', c.id, s.id, 'Tabla de Quesos y Carnes', 'Selección de quesos, jamones y embutidos', 45000, 4500, 'active', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', 15, 'cocina_fria'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Para Compartir' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-149', c.id, s.id, 'Nachos Supremos', 'Nachos con carne, queso, guacamole y pico de gallo', 32000, 4000, 'active', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d', 18, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Para Compartir' AND s.category_id = c.id;

INSERT INTO menu_items (menu_code, category_id, subcategory_id, name, description, price, delivery_cost, status, image_url, preparation_time, station)
SELECT 'PROD-150', c.id, s.id, 'Pizza Artesanal Grande', 'Pizza de masa artesanal con ingredientes premium', 42000, 4500, 'active', 'https://images.unsplash.com/photo-1513104890138-7c749659a591', 25, 'cocina_caliente'
FROM menu_categories c, menu_subcategories s WHERE c.name = 'PROMOCIONES' AND s.name = 'Para Compartir' AND s.category_id = c.id;

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DEL SEED DATA - MENÚ COMPLETO
-- ═══════════════════════════════════════════════════════════════════════════
-- Total: 10 Categorías, 50 Subcategorías, 150 Productos
-- ═══════════════════════════════════════════════════════════════════════════
