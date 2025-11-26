"use strict";
// ═════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES - Autenticación y Autorización
// ═════════════════════════════════════════════════════════════════════════════
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthService_1 = require("@services/AuthService");
const CustomerService_1 = require("@services/CustomerService");
const WaiterService_1 = require("@services/WaiterService");
const auth_middleware_1 = require("@middleware/auth.middleware");
const router = (0, express_1.Router)();
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /auth/register/customer - Registrar Cliente
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/register/customer', async (req, res) => {
    try {
        const { full_name, phone, email, address_1, address_2, address_3, notes } = req.body;
        // Validaciones básicas
        if (!full_name || !phone || !address_1) {
            return res.status(400).json({
                success: false,
                error: 'Campos requeridos: full_name, phone, address_1'
            });
        }
        // Crear cliente
        const result = await CustomerService_1.CustomerService.createCustomer({
            full_name,
            phone,
            email,
            address_1,
            address_2,
            address_3,
            notes
        });
        // Generar token
        const tokenResult = await AuthService_1.AuthService.loginCustomer(phone);
        res.status(201).json({
            success: true,
            customer: result.customer,
            token: tokenResult.token,
            message: 'Cliente registrado exitosamente'
        });
    }
    catch (error) {
        console.error('❌ Error en registro de cliente:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /auth/register/waiter - Registrar Mesero (Solo Admin)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/register/waiter', auth_middleware_1.authenticate, auth_middleware_1.isAdmin, async (req, res) => {
    try {
        const { waiter_code, full_name, phone, pin_code } = req.body;
        // Validaciones básicas
        if (!waiter_code || !full_name || !pin_code) {
            return res.status(400).json({
                success: false,
                error: 'Campos requeridos: waiter_code, full_name, pin_code'
            });
        }
        // Crear mesero
        const result = await AuthService_1.AuthService.registerWaiter({
            waiter_code,
            full_name,
            phone,
            pin_code
        });
        res.status(201).json({
            success: true,
            waiter: result.waiter,
            message: 'Mesero registrado exitosamente'
        });
    }
    catch (error) {
        console.error('❌ Error en registro de mesero:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /auth/login/customer - Login Cliente
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/login/customer', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({
                success: false,
                error: 'Teléfono requerido'
            });
        }
        const result = await AuthService_1.AuthService.loginCustomer(phone);
        res.json({
            success: true,
            token: result.token,
            customer: result.customer,
            message: 'Login exitoso'
        });
    }
    catch (error) {
        console.error('❌ Error en login de cliente:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /auth/login/waiter - Login Mesero
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/login/waiter', async (req, res) => {
    try {
        const { waiter_code, pin_code } = req.body;
        if (!waiter_code || !pin_code) {
            return res.status(400).json({
                success: false,
                error: 'Código de mesero y PIN requeridos'
            });
        }
        const result = await AuthService_1.AuthService.loginWaiter(waiter_code, pin_code);
        res.json({
            success: true,
            token: result.token,
            waiter: result.waiter,
            message: 'Login exitoso'
        });
    }
    catch (error) {
        console.error('❌ Error en login de mesero:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /auth/verify - Verificar Token
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token requerido'
            });
        }
        const decoded = await AuthService_1.AuthService.verifyToken(token);
        res.json({
            success: true,
            valid: true,
            decoded: decoded,
            message: 'Token válido'
        });
    }
    catch (error) {
        console.error('❌ Error en verificación de token:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /auth/me - Obtener Datos del Usuario Autenticado
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/me', auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        let userData = {
            id: req.user.id,
            role: req.user.role
        };
        // Obtener datos adicionales según el rol
        if (req.user.role === 'customer') {
            const result = await CustomerService_1.CustomerService.getCustomerById(req.user.id);
            if (result.success) {
                userData = { ...userData, ...result.customer };
            }
        }
        else if (req.user.role === 'waiter') {
            const result = await WaiterService_1.WaiterService.getWaiterById(req.user.id);
            if (result.success) {
                userData = { ...userData, ...result.waiter };
            }
        }
        res.json({
            success: true,
            user: userData
        });
    }
    catch (error) {
        console.error('❌ Error al obtener datos del usuario:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /auth/refresh - Refresh Token (opcional)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/refresh', auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        // Generar nuevo token
        const newToken = await AuthService_1.AuthService.generateToken({
            id: req.user.id,
            type: req.user.role,
            role: req.user.role,
            phone: req.user.phone,
            waiter_code: req.user.waiter_code
        });
        res.json({
            success: true,
            token: newToken,
            message: 'Token renovado exitosamente'
        });
    }
    catch (error) {
        console.error('❌ Error al renovar token:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUT /auth/change-pin - Cambiar PIN de Mesero
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.put('/change-pin', auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        if (req.user.role !== 'waiter' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Solo meseros pueden cambiar su PIN'
            });
        }
        const { new_pin } = req.body;
        if (!new_pin) {
            return res.status(400).json({
                success: false,
                error: 'Nuevo PIN requerido'
            });
        }
        const result = await WaiterService_1.WaiterService.changeWaiterPin(req.user.id, new_pin);
        res.json({
            success: true,
            message: 'PIN actualizado exitosamente'
        });
    }
    catch (error) {
        console.error('❌ Error al cambiar PIN:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map