-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA: DATOS DE PRUEBA PARA EL SISTEMA ERP RESTAURANTE
-- 10 Meseros, 20 Mesas, 15 Clientes, 7 Horarios
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. MESEROS (10 meseros ficticios)
-- Nota: Todos los PINs son '1234' hasheados con bcrypt
-- ═══════════════════════════════════════════════════════════════════════════

DELETE FROM waiters WHERE waiter_code IN (
    'MES-001', 'MES-002', 'MES-003', 'MES-004', 'MES-005',
    'MES-006', 'MES-007', 'MES-008', 'MES-009', 'MES-010'
);

INSERT INTO waiters (waiter_code, full_name, phone, pin_code, is_active, current_orders) VALUES
('MES-001', 'Juan Pérez', '3001111111', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J/VUuMUd8CqJhFCMFi.yx8Jz3U7eOW', true, 0),
('MES-002', 'María García', '3002222222', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J/VUuMUd8CqJhFCMFi.yx8Jz3U7eOW', true, 0),
('MES-003', 'Carlos López', '3003333333', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J/VUuMUd8CqJhFCMFi.yx8Jz3U7eOW', true, 0),
('MES-004', 'Ana Martínez', '3004444444', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J/VUuMUd8CqJhFCMFi.yx8Jz3U7eOW', true, 0),
('MES-005', 'Luis Rodríguez', '3005555555', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J/VUuMUd8CqJhFCMFi.yx8Jz3U7eOW', true, 0),
('MES-006', 'Laura Sánchez', '3006666666', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J/VUuMUd8CqJhFCMFi.yx8Jz3U7eOW', false, 0),
('MES-007', 'Pedro Torres', '3007777777', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J/VUuMUd8CqJhFCMFi.yx8Jz3U7eOW', true, 0),
('MES-008', 'Sofia Ramírez', '3008888888', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J/VUuMUd8CqJhFCMFi.yx8Jz3U7eOW', true, 0),
('MES-009', 'Diego Flores', '3009999999', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J/VUuMUd8CqJhFCMFi.yx8Jz3U7eOW', false, 0),
('MES-010', 'Valentina Cruz', '3000000000', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J/VUuMUd8CqJhFCMFi.yx8Jz3U7eOW', true, 0);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. MESAS (20 mesas ficticias)
-- ═══════════════════════════════════════════════════════════════════════════

DELETE FROM tables WHERE table_number IN (
    'MESA-01', 'MESA-02', 'MESA-03', 'MESA-04', 'MESA-05',
    'MESA-06', 'MESA-07', 'MESA-08', 'MESA-09', 'MESA-10',
    'MESA-11', 'MESA-12', 'MESA-13', 'MESA-14', 'MESA-15',
    'MESA-16', 'MESA-17', 'MESA-18', 'MESA-19', 'MESA-20'
);

INSERT INTO tables (table_number, capacity, zone, status) VALUES
('MESA-01', 2, 'Terraza', 'available'),
('MESA-02', 2, 'Terraza', 'available'),
('MESA-03', 4, 'Interior', 'available'),
('MESA-04', 4, 'Interior', 'available'),
('MESA-05', 6, 'Interior', 'available'),
('MESA-06', 6, 'Salón Principal', 'available'),
('MESA-07', 8, 'Salón Principal', 'available'),
('MESA-08', 2, 'Ventana', 'available'),
('MESA-09', 2, 'Ventana', 'available'),
('MESA-10', 4, 'Ventana', 'available'),
('MESA-11', 4, 'Barra', 'available'),
('MESA-12', 2, 'Barra', 'available'),
('MESA-13', 4, 'Privado VIP', 'available'),
('MESA-14', 6, 'Privado VIP', 'available'),
('MESA-15', 2, 'Terraza', 'occupied'),
('MESA-16', 4, 'Interior', 'reserved'),
('MESA-17', 4, 'Salón Principal', 'available'),
('MESA-18', 6, 'Salón Principal', 'available'),
('MESA-19', 8, 'Salón Principal', 'available'),
('MESA-20', 10, 'Privado VIP', 'available');

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. CLIENTES (15 clientes ficticios)
-- ═══════════════════════════════════════════════════════════════════════════

DELETE FROM customers WHERE customer_code IN (
    'CLI-001', 'CLI-002', 'CLI-003', 'CLI-004', 'CLI-005',
    'CLI-006', 'CLI-007', 'CLI-008', 'CLI-009', 'CLI-010',
    'CLI-011', 'CLI-012', 'CLI-013', 'CLI-014', 'CLI-015'
);

INSERT INTO customers (customer_code, full_name, phone, email, address_1, address_2, notes, is_active) VALUES
('CLI-001', 'Roberto Gómez', '3101111111', 'roberto.gomez@example.com', 'Calle 10 #20-30, Barrio Centro', 'Apartamento 301', 'Cliente frecuente', true),
('CLI-002', 'Patricia Díaz', '3102222222', 'patricia.diaz@example.com', 'Carrera 15 #40-50, Barrio Norte', NULL, NULL, true),
('CLI-003', 'Fernando Ruiz', '3103333333', 'fernando.ruiz@example.com', 'Avenida 25 #60-70, Barrio Sur', 'Casa 12', 'Alérgico a mariscos', true),
('CLI-004', 'Gabriela Moreno', '3104444444', 'gabriela.moreno@example.com', 'Calle 5 #15-25, Barrio Este', NULL, NULL, true),
('CLI-005', 'Andrés Castro', '3105555555', 'andres.castro@example.com', 'Carrera 30 #80-90, Barrio Oeste', 'Torre B, Piso 5', 'VIP', true),
('CLI-006', 'Camila Vargas', '3106666666', 'camila.vargas@example.com', 'Calle 12 #22-32, Barrio Centro', NULL, NULL, true),
('CLI-007', 'Miguel Herrera', '3107777777', 'miguel.herrera@example.com', 'Avenida 50 #100-110, Barrio Norte', 'Oficina 202', NULL, true),
('CLI-008', 'Daniela Ortiz', '3108888888', 'daniela.ortiz@example.com', 'Carrera 8 #16-26, Barrio Sur', NULL, 'Vegetariana', true),
('CLI-009', 'Santiago Ramos', '3109999999', 'santiago.ramos@example.com', 'Calle 20 #40-50, Barrio Este', 'Casa 5', NULL, true),
('CLI-010', 'Isabella Mendoza', '3100000000', 'isabella.mendoza@example.com', 'Avenida 10 #30-40, Barrio Oeste', NULL, 'Cliente corporativo', true),
('CLI-011', 'Mateo Silva', '3111111111', 'mateo.silva@example.com', 'Calle 18 #36-46, Barrio Centro', 'Apartamento 102', NULL, true),
('CLI-012', 'Valeria Rojas', '3112222222', 'valeria.rojas@example.com', 'Carrera 22 #44-54, Barrio Norte', NULL, NULL, false),
('CLI-013', 'Lucas Navarro', '3113333333', 'lucas.navarro@example.com', 'Avenida 35 #70-80, Barrio Sur', 'Torre C, Piso 8', 'Cumpleaños: 15 de Mayo', true),
('CLI-014', 'Martina Guerrero', '3114444444', 'martina.guerrero@example.com', 'Calle 7 #14-24, Barrio Este', NULL, NULL, true),
('CLI-015', 'Sebastián Medina', '3115555555', 'sebastian.medina@example.com', 'Carrera 40 #90-100, Barrio Oeste', 'Casa 20', 'Sin gluten', true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. HORARIOS (7 días de la semana)
-- ═══════════════════════════════════════════════════════════════════════════

DELETE FROM schedules WHERE day_of_week IN (
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
);

INSERT INTO schedules (day_of_week, opening_time, closing_time, is_open, special_note) VALUES
('MONDAY', '11:00:00', '22:00:00', true, NULL),
('TUESDAY', '11:00:00', '22:00:00', true, NULL),
('WEDNESDAY', '11:00:00', '22:00:00', true, NULL),
('THURSDAY', '11:00:00', '23:00:00', true, 'Happy Hour 18:00-20:00'),
('FRIDAY', '11:00:00', '00:00:00', true, 'Música en vivo desde las 20:00'),
('SATURDAY', '12:00:00', '01:00:00', true, 'Brunch especial hasta las 15:00'),
('SUNDAY', '12:00:00', '21:00:00', true, 'Menú familiar con descuento');

-- ═══════════════════════════════════════════════════════════════════════════
-- FIN DEL SEED DATA - DATOS DE PRUEBA
-- ═══════════════════════════════════════════════════════════════════════════
-- Total: 10 Meseros, 20 Mesas, 15 Clientes, 7 Horarios
-- PIN de meseros: 1234 (todos)
-- ═══════════════════════════════════════════════════════════════════════════
