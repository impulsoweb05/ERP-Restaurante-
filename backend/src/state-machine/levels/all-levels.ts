/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STATE MACHINE - TODOS LOS NIVELES CONSOLIDADOS
 * Implementación completa de 16 niveles de navegación
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Session } from '../../types';
import { SessionService } from '../../services/SessionService';
import { MenuService } from '../../services/MenuService';
import { CartService } from '../../services/CartService';
import { ScheduleService } from '../../services/ScheduleService';
import { OrderService } from '../../services/OrderService';
import { ValidationService } from '../../services/ValidationService';
import { ChatResponse } from '../dispatcher';
import { logger } from '../../utils/logger';

// ═══════════════════════════════════════════════════════════════════════════
// NIVELES 2-3-4: Navegación de Menú (Categorías → Subcategorías → Productos)
// ═══════════════════════════════════════════════════════════════════════════

export async function handleLevel2(session: Session, message: string): Promise<ChatResponse> {
  try {
    // Obtener categorías activas
    const categories = await MenuService.getCategories();

    if (categories.length === 0) {
      return {
        message: 'Lo sentimos, no tenemos categorías disponibles en este momento.',
        session
      };
    }

    let response = '📋 **Categorías Disponibles:**\n\n';
    categories.forEach((cat, index) => {
      response += `${index + 1}️⃣ ${cat.name}\n`;
    });

    response += `\n0️⃣ Ver Carrito 🛒\n`;
    response += `\nEscribe el número de la categoría que deseas ver:`;

    return {
      message: response,
      session,
      options: categories.map(c => c.name),
      data: { categories }
    };
  } catch (error) {
    logger.error('Error in level 2', error as Error);
    return {
      message: 'Error al cargar categorías. Intenta de nuevo.',
      session
    };
  }
}

export async function handleLevel3(session: Session, message: string): Promise<ChatResponse> {
  try {
    if (!session.selected_category) {
      return {
        message: 'Error: No hay categoría seleccionada.',
        session: await SessionService.updateLevel(session.session_id, 2)
      };
    }

    const subcategories = await MenuService.getSubcategoriesByCategory(session.selected_category);

    if (subcategories.length === 0) {
      return {
        message: 'No hay subcategorías disponibles. Volviendo al menú...',
        session: await SessionService.updateLevel(session.session_id, 2)
      };
    }

    let response = '📂 **Subcategorías:**\n\n';
    subcategories.forEach((sub, index) => {
      response += `${index + 1}️⃣ ${sub.name}\n`;
    });

    response += `\n0️⃣ Volver a Categorías\n`;

    return {
      message: response,
      session,
      options: subcategories.map(s => s.name),
      data: { subcategories }
    };
  } catch (error) {
    logger.error('Error in level 3', error as Error);
    return {
      message: 'Error al cargar subcategorías.',
      session
    };
  }
}

export async function handleLevel4(session: Session, message: string): Promise<ChatResponse> {
  try {
    if (!session.selected_subcategory) {
      return {
        message: 'Error: No hay subcategoría seleccionada.',
        session: await SessionService.updateLevel(session.session_id, 3)
      };
    }

    const items = await MenuService.getItemsBySubcategory(session.selected_subcategory);

    if (items.length === 0) {
      return {
        message: 'No hay productos disponibles en esta subcategoría.',
        session: await SessionService.updateLevel(session.session_id, 3)
      };
    }

    let response = '🍽️ **Productos Disponibles:**\n\n';
    items.forEach((item, index) => {
      response += `${index + 1}️⃣ **${item.name}**\n`;
      response += `   💰 $${item.price.toLocaleString()}\n`;
      if (item.delivery_cost > 0) {
        response += `   🛵 Domicilio: $${item.delivery_cost.toLocaleString()}\n`;
      }
      response += `\n`;
    });

    response += `0️⃣ Volver a Subcategorías\n`;

    return {
      message: response,
      session,
      options: items.map(i => i.name),
      data: { items }
    };
  } catch (error) {
    logger.error('Error in level 4', error as Error);
    return {
      message: 'Error al cargar productos.',
      session
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NIVEL 5: Detalle del Producto y Agregar al Carrito (CON VALIDACIONES)
// ═══════════════════════════════════════════════════════════════════════════

export async function handleLevel5(session: Session, message: string): Promise<ChatResponse> {
  try {
    if (!session.temp_menu_item) {
      return {
        message: 'Error: No hay producto seleccionado.',
        session: await SessionService.updateLevel(session.session_id, 4)
      };
    }

    // Obtener producto
    const item = await MenuService.getItemById(session.temp_menu_item);

    if (!item) {
      return {
        message: 'Producto no encontrado.',
        session: await SessionService.updateLevel(session.session_id, 4)
      };
    }

    // ⚠️ VALIDACIÓN CRÍTICA 1: Re-validar horario
    const schedule = await ScheduleService.isOpenNow();
    if (!schedule.isOpen) {
      return {
        message: `❌ Lo sentimos, el restaurante acaba de cerrar.

No podemos procesar tu pedido en este momento.

Horarios: ${schedule.message}`,
        session
      };
    }

    // ⚠️ VALIDACIÓN CRÍTICA 2: Re-validar producto activo
    if (item.status !== 'active') {
      return {
        message: `❌ Lo sentimos, el producto "${item.name}" ya no está disponible.

Volviendo al menú...`,
        session: await SessionService.updateLevel(session.session_id, 4)
      };
    }

    // Mostrar detalle del producto
    let response = `🍽️ **${item.name}**\n\n`;
    response += `${item.description}\n\n`;
    response += `💰 Precio: $${item.price.toLocaleString()}\n`;
    if (item.delivery_cost > 0) {
      response += `🛵 Costo Domicilio: $${item.delivery_cost.toLocaleString()}\n`;
    }
    response += `⏱️ Tiempo de preparación: ${item.preparation_time} min\n\n`;
    response += `¿Cuántas unidades deseas agregar?\n\n`;
    response += `Escribe la cantidad (ej: 2) o 0 para volver`;

    return {
      message: response,
      session,
      data: { item }
    };
  } catch (error) {
    logger.error('Error in level 5', error as Error);
    return {
      message: 'Error al cargar producto.',
      session
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NIVEL 6: Ver Carrito y Calcular Totales (VALIDACIÓN delivery = MAX)
// ═══════════════════════════════════════════════════════════════════════════

export async function handleLevel6(session: Session, message: string): Promise<ChatResponse> {
  try {
    const cart = await CartService.getCart(session.session_id);

    if (cart.length === 0) {
      return {
        message: `🛒 Tu carrito está vacío.

¿Qué deseas hacer?

1️⃣ Ver Menú
2️⃣ Salir`,
        session
      };
    }

    // ⚠️ VALIDACIÓN CRÍTICA: Calcular delivery = MAX (no suma)
    const totals = CartService.calculateTotals(cart);

    let response = `🛒 **Tu Carrito:**\n\n`;
    cart.forEach((item, index) => {
      response += `${index + 1}. **${item.name}** x${item.quantity}\n`;
      response += `   $${item.unit_price.toLocaleString()} c/u = $${item.subtotal.toLocaleString()}\n\n`;
    });

    response += `📊 **Resumen:**\n`;
    response += `Subtotal: $${totals.subtotal.toLocaleString()}\n`;
    response += `Domicilio: $${totals.delivery_cost.toLocaleString()} (MAX)\n`;
    response += `**Total: $${totals.total.toLocaleString()}**\n\n`;
    response += `¿Qué deseas hacer?\n\n`;
    response += `1️⃣ Finalizar Pedido\n`;
    response += `2️⃣ Seguir Comprando\n`;
    response += `3️⃣ Vaciar Carrito`;

    return {
      message: response,
      session,
      options: ['Finalizar', 'Seguir Comprando', 'Vaciar'],
      data: { cart, totals }
    };
  } catch (error) {
    logger.error('Error in level 6', error as Error);
    return {
      message: 'Error al mostrar carrito.',
      session
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NIVELES 7-13: Proceso de Checkout (Dirección, Pago, Comentarios)
// ═══════════════════════════════════════════════════════════════════════════

export async function handleLevel7to13(
  session: Session,
  message: string
): Promise<ChatResponse> {
  try {
    const level = session.current_level;

    // Nivel 7: Seleccionar dirección
    if (level === 7) {
      return {
        message: `📍 **Dirección de Entrega**

Ingresa tu dirección completa:

Ejemplo: Calle 123 #45-67, Barrio Centro`,
        session
      };
    }

    // Nivel 11: Método de pago
    if (level === 11) {
      return {
        message: `💳 **Método de Pago**

Selecciona cómo pagarás:

1️⃣ Efectivo 💵
2️⃣ Transferencia 🏦
3️⃣ Tarjeta 💳
4️⃣ Datafono en el lugar`,
        session,
        options: ['Efectivo', 'Transferencia', 'Tarjeta', 'Datafono']
      };
    }

    // Nivel 12: Comentarios opcionales
    if (level === 12) {
      return {
        message: `📝 **Comentarios Adicionales**

¿Alguna instrucción especial para tu pedido?

Escribe tus comentarios o escribe "ninguno" para continuar:`,
        session
      };
    }

    // Nivel 13: Guardar datos de checkout
    if (level === 13) {
      // Avanzar a nivel 14 (resumen)
      const nextSession = await SessionService.updateLevel(session.session_id, 14);
      return {
        message: 'Preparando resumen de tu pedido...',
        session: nextSession
      };
    }

    // Por defecto, avanzar al siguiente nivel
    const nextSession = await SessionService.updateLevel(session.session_id, level + 1);
    return {
      message: 'Continuando...',
      session: nextSession
    };
  } catch (error) {
    logger.error('Error in checkout levels', error as Error);
    return {
      message: 'Error en el proceso de checkout.',
      session
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NIVEL 14: Resumen Final y Validaciones Finales
// ═══════════════════════════════════════════════════════════════════════════

export async function handleLevel14(session: Session, message: string): Promise<ChatResponse> {
  try {
    const cart = await CartService.getCart(session.session_id);

    if (cart.length === 0) {
      return {
        message: 'Tu carrito está vacío. Volviendo al menú...',
        session: await SessionService.updateLevel(session.session_id, 2)
      };
    }

    // ⚠️ VALIDACIÓN CRÍTICA FINAL 1: Horario
    const schedule = await ScheduleService.isOpenNow();
    if (!schedule.isOpen) {
      return {
        message: `❌ El restaurante ha cerrado.

No podemos procesar tu pedido.`,
        session
      };
    }

    // ⚠️ VALIDACIÓN CRÍTICA FINAL 2: Todos los productos activos
    for (const item of cart) {
      const menuItem = await MenuService.getItemById(item.menu_item_id);
      if (!menuItem || menuItem.status !== 'active') {
        return {
          message: `❌ El producto "${item.name}" ya no está disponible.

Por favor revisa tu carrito.`,
          session: await SessionService.updateLevel(session.session_id, 6)
        };
      }
    }

    const totals = CartService.calculateTotals(cart);
    const checkoutData = session.checkout_data as any;

    const responseMessage = `📋 **RESUMEN DE TU PEDIDO**

🛒 **Productos:**
${cart.map(item => `• ${item.name} x${item.quantity} = $${item.subtotal.toLocaleString()}`).join('\n')}

📍 **Entrega en:**
${checkoutData?.delivery_address || 'No especificada'}

💳 **Pago:**
${checkoutData?.payment_method || 'Efectivo'}

💰 **Totales:**
Subtotal: $${totals.subtotal.toLocaleString()}
Domicilio: $${totals.delivery_cost.toLocaleString()}
**TOTAL: $${totals.total.toLocaleString()}**

¿Confirmar pedido?

1️⃣ SÍ, Confirmar
2️⃣ NO, Cancelar`;

    return {
      message: responseMessage,
      session,
      options: ['Confirmar', 'Cancelar'],
      data: { cart, totals, checkoutData }
    };
  } catch (error) {
    logger.error('Error in level 14', error as Error);
    return {
      message: 'Error al generar resumen.',
      session
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NIVEL 15: Confirmación y Creación del Pedido (TRANSACCIÓN COMPLETA)
// ═══════════════════════════════════════════════════════════════════════════

export async function handleLevel15(session: Session, message: string): Promise<ChatResponse> {
  try {
    const choice = message.trim();

    // Cancelar
    if (choice === '2' || choice.toLowerCase().includes('no') || choice.toLowerCase().includes('cancelar')) {
      await CartService.clearCart(session.session_id);
      return {
        message: 'Pedido cancelado. ¡Hasta pronto!',
        session: await SessionService.updateLevel(session.session_id, 0)
      };
    }

    // Confirmar
    if (choice !== '1' && !choice.toLowerCase().includes('si') && !choice.toLowerCase().includes('confirmar')) {
      return {
        message: 'Opción no válida. Escribe 1 para confirmar o 2 para cancelar.',
        session
      };
    }

    const cart = await CartService.getCart(session.session_id);
    const checkoutData = session.checkout_data as any;

    if (!session.customer_id) {
      return {
        message: 'Error: Cliente no identificado.',
        session: await SessionService.updateLevel(session.session_id, 1)
      };
    }

    // Crear pedido con transacción completa
    const orderItems = cart.map(item => ({
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      special_instructions: ''
    }));

    const { order, items } = await OrderService.createOrder({
      customer_id: session.customer_id,
      order_type: 'delivery' as any,
      payment_method: checkoutData?.payment_method || 'cash',
      delivery_address: checkoutData?.delivery_address || '',
      customer_notes: checkoutData?.comments || '',
      order_items: orderItems
    });

    // Limpiar carrito
    await CartService.clearCart(session.session_id);

    // Resetear sesión a nivel 0
    await SessionService.updateLevel(session.session_id, 0);

    const confirmMessage = `✅ **¡PEDIDO CONFIRMADO!**

📦 Número de pedido: **${order.order_number}**

💰 Total: $${order.total.toLocaleString()}
📍 Dirección: ${order.delivery_address}

⏱️ Tiempo estimado: 30-45 minutos

Recibirás notificaciones sobre el estado de tu pedido.

¡Gracias por tu preferencia!`;

    return {
      message: confirmMessage,
      session: await SessionService.getOrCreateSession(session.session_id),
      data: { order, items }
    };
  } catch (error) {
    logger.error('Error creating order in level 15', error as Error);
    return {
      message: `❌ Error al crear el pedido: ${(error as Error).message}

Por favor intenta de nuevo o contacta con soporte.`,
      session
    };
  }
}
