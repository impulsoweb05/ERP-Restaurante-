/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCRIPT DE VALIDACIÓN DE ENDPOINTS CRÍTICOS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Ejecutar: npm run test:endpoints
 * 
 * Este script valida todos los endpoints críticos del backend del ERP Restaurante
 * para asegurar que están funcionando correctamente.
 */

import axios, { AxiosError } from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:4000';

interface TestResult {
  name: string;
  method: string;
  url: string;
  status: number | null;
  success: boolean;
  error?: string;
  responseTime?: number;
}

const results: TestResult[] = [];

/**
 * Ejecutar prueba de endpoint
 */
async function testEndpoint(
  name: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any,
  headers?: Record<string, string>
): Promise<void> {
  const startTime = Date.now();
  
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${url}`,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000,
      validateStatus: () => true // Accept any status code
    });

    const responseTime = Date.now() - startTime;
    const isSuccess = response.status >= 200 && response.status < 400;

    results.push({
      name,
      method,
      url,
      status: response.status,
      success: isSuccess,
      responseTime
    });

    const statusIcon = isSuccess ? '✅' : '❌';
    console.log(`${statusIcon} ${name}: ${response.status} (${responseTime}ms)`);

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    const axiosError = error as AxiosError;
    
    results.push({
      name,
      method,
      url,
      status: axiosError.response?.status || null,
      success: false,
      error: axiosError.message,
      responseTime
    });

    console.error(`❌ ${name}: ${axiosError.message}`);
  }
}

/**
 * Ejecutar todas las pruebas
 */
async function runTests(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 VALIDACIÓN DE ENDPOINTS CRÍTICOS');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. HEALTH CHECK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n📋 HEALTH CHECK');
  console.log('─────────────────────────────────────────');
  await testEndpoint('Health Check', 'GET', '/health');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. SCHEDULE (Horarios)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n📅 HORARIOS');
  console.log('─────────────────────────────────────────');
  await testEndpoint('Get Schedule', 'GET', '/api/schedule');
  await testEndpoint('Check if Open', 'GET', '/api/schedule/is-open');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. MENU
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n🍽️ MENÚ');
  console.log('─────────────────────────────────────────');
  await testEndpoint('Get Categories', 'GET', '/api/menu/categories');
  await testEndpoint('Get All Menu', 'GET', '/api/menu');
  await testEndpoint('Get Subcategories', 'GET', '/api/menu/subcategories');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. AUTH - Registro y Login
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n🔐 AUTENTICACIÓN');
  console.log('─────────────────────────────────────────');
  
  // Test de registro de cliente (puede fallar si ya existe)
  const testPhone = `300${Date.now().toString().slice(-7)}`;
  await testEndpoint('Register Customer', 'POST', '/api/auth/register/customer', {
    full_name: 'Test User Validation',
    phone: testPhone,
    address_1: 'Test Address 123'
  });

  // Test de login de cliente (con teléfono de prueba)
  await testEndpoint('Login Customer', 'POST', '/api/auth/login/customer', {
    phone: testPhone
  });

  // Test de login de mesero (puede fallar si no hay meseros)
  await testEndpoint('Login Waiter', 'POST', '/api/auth/login/waiter', {
    waiter_code: 'MESERO-001',
    pin: '1234'
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. TABLES (Mesas)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n🪑 MESAS');
  console.log('─────────────────────────────────────────');
  await testEndpoint('List Tables', 'GET', '/api/tables');
  await testEndpoint('Get Available Tables', 'GET', '/api/tables/available');
  await testEndpoint('Get Table Stats', 'GET', '/api/tables/stats');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. WAITERS (Meseros)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n👨‍🍳 MESEROS');
  console.log('─────────────────────────────────────────');
  await testEndpoint('List Waiters', 'GET', '/api/waiters');
  await testEndpoint('Get Active Waiters', 'GET', '/api/waiters/active');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. KITCHEN (Cocina)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n🍳 COCINA');
  console.log('─────────────────────────────────────────');
  await testEndpoint('Kitchen Queue', 'GET', '/api/kitchen/queue');
  await testEndpoint('Kitchen Stats', 'GET', '/api/kitchen/stats');
  await testEndpoint('Kitchen Stations', 'GET', '/api/kitchen/stations');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. CUSTOMERS (Clientes)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n👥 CLIENTES');
  console.log('─────────────────────────────────────────');
  await testEndpoint('List Customers', 'GET', '/api/customers');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9. ORDERS (Pedidos) - Require auth
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n📦 PEDIDOS');
  console.log('─────────────────────────────────────────');
  await testEndpoint('List Orders (Auth Required)', 'GET', '/api/orders');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 10. RESERVATIONS (Reservas) - Require auth
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n📝 RESERVAS');
  console.log('─────────────────────────────────────────');
  await testEndpoint('List Reservations Today (Auth Required)', 'GET', '/api/reservations/today');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESUMEN FINAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE RESULTADOS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const totalTime = results.reduce((sum, r) => sum + (r.responseTime || 0), 0);
  const avgTime = results.length > 0 ? Math.round(totalTime / results.length) : 0;

  console.log(`📈 Total de endpoints probados: ${results.length}`);
  console.log(`✅ Exitosos: ${successCount}`);
  console.log(`❌ Fallidos: ${failCount}`);
  console.log(`⏱️  Tiempo promedio de respuesta: ${avgTime}ms`);
  console.log(`⏱️  Tiempo total: ${totalTime}ms`);

  // Mostrar endpoints fallidos
  const failedEndpoints = results.filter(r => !r.success);
  if (failedEndpoints.length > 0) {
    console.log('\n⚠️  ENDPOINTS FALLIDOS:');
    console.log('─────────────────────────────────────────');
    failedEndpoints.forEach(r => {
      console.log(`  • ${r.name} (${r.method} ${r.url})`);
      console.log(`    Status: ${r.status || 'N/A'}`);
      if (r.error) console.log(`    Error: ${r.error}`);
    });
  }

  // Código de salida basado en resultados
  console.log('\n═══════════════════════════════════════════════════════════════');
  
  if (failCount > 0) {
    console.log('⚠️  ALGUNAS PRUEBAS FALLARON - Revisar endpoints arriba');
    process.exit(1);
  } else {
    console.log('✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
    process.exit(0);
  }
}

// Ejecutar pruebas
runTests().catch(error => {
  console.error('❌ Error fatal al ejecutar pruebas:', error);
  process.exit(1);
});
