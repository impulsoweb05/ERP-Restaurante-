/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STATE MACHINE DISPATCHER
 * Router principal que distribuye mensajes a los niveles correspondientes
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Session } from '../types';
export interface ChatResponse {
    message: string;
    session: Session;
    options?: string[];
    data?: any;
}
/**
 * Procesar mensaje del usuario según el nivel actual de su sesión
 */
export declare function processMessage(sessionId: string, message: string, phone?: string): Promise<ChatResponse>;
//# sourceMappingURL=dispatcher.d.ts.map