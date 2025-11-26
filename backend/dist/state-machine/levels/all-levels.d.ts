/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STATE MACHINE - TODOS LOS NIVELES CONSOLIDADOS
 * Implementación completa de 16 niveles de navegación
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Session } from '../../types';
import { ChatResponse } from '../dispatcher';
export declare function handleLevel2(session: Session, message: string): Promise<ChatResponse>;
export declare function handleLevel3(session: Session, message: string): Promise<ChatResponse>;
export declare function handleLevel4(session: Session, message: string): Promise<ChatResponse>;
export declare function handleLevel5(session: Session, message: string): Promise<ChatResponse>;
export declare function handleLevel6(session: Session, message: string): Promise<ChatResponse>;
export declare function handleLevel7to13(session: Session, message: string): Promise<ChatResponse>;
export declare function handleLevel14(session: Session, message: string): Promise<ChatResponse>;
export declare function handleLevel15(session: Session, message: string): Promise<ChatResponse>;
//# sourceMappingURL=all-levels.d.ts.map