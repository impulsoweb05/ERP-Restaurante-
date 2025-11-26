/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIGURACIÓN DE DIRECTUS SDK
 * ═══════════════════════════════════════════════════════════════════════════
 */
/**
 * Obtener o crear cliente de Directus
 */
export declare const getDirectusClient: () => any;
/**
 * Validar conexión con Directus
 */
export declare const validateDirectusConnection: () => Promise<boolean>;
/**
 * Obtener configuración de Directus
 */
export declare const getDirectusConfig: () => {
    url: string;
    hasToken: boolean;
};
export default getDirectusClient;
//# sourceMappingURL=directus.d.ts.map