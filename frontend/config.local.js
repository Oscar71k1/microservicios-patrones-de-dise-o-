// Configuración para entorno local
const CONFIG_LOCAL = {
    // URLs de la API para desarrollo local
    API_BASE_URL: 'http://localhost:3000/api',
    
    // Configuración de la aplicación
    APP_NAME: 'Sistema Universitario - Local',
    APP_VERSION: '1.0.0',
    
    // Configuración de autenticación
    AUTH: {
        TOKEN_KEY: 'authToken',
        USER_KEY: 'currentUser',
        TOKEN_EXPIRY: 24 * 60 * 60 * 1000 // 24 horas en milisegundos
    },
    
    // Configuración de pagos
    PAYMENTS: {
        CURRENCY: 'COP',
        CURRENCY_SYMBOL: '$',
        DECIMAL_PLACES: 0
    },
    
    // Configuración de UI
    UI: {
        TOAST_DURATION: 3000,
        LOADING_DELAY: 500,
        ANIMATION_DURATION: 300
    },
    
    // Configuración de desarrollo
    DEV: {
        DEBUG: true,
        LOG_LEVEL: 'info',
        SHOW_API_LOGS: true
    },
    
    // URLs de microservicios (para debug)
    SERVICES: {
        GATEWAY: 'http://localhost:3000',
        USUARIOS: 'http://localhost:3001',
        PAGOS: 'http://localhost:3002',
        CATALOGO: 'http://localhost:3004'
    }
};

// Función para obtener configuración
function getConfig(key) {
    return key.split('.').reduce((obj, k) => obj && obj[k], CONFIG_LOCAL);
}

// Función para formatear moneda
function formatCurrency(amount) {
    const { CURRENCY, CURRENCY_SYMBOL, DECIMAL_PLACES } = CONFIG_LOCAL.PAYMENTS;
    
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: CURRENCY,
        minimumFractionDigits: DECIMAL_PLACES,
        maximumFractionDigits: DECIMAL_PLACES
    }).format(amount);
}

// Función para formatear fecha
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para debug
function debug(message, data = null) {
    if (CONFIG_LOCAL.DEV.DEBUG) {
        console.log(`[DEBUG] ${message}`, data || '');
    }
}

// Función para verificar conectividad con servicios
async function checkServicesConnectivity() {
    const results = {};
    
    for (const [serviceName, url] of Object.entries(CONFIG_LOCAL.SERVICES)) {
        try {
            const response = await fetch(`${url}/health`, { 
                method: 'GET',
                timeout: 5000 
            });
            results[serviceName] = {
                status: response.ok ? 'online' : 'error',
                url: url,
                statusCode: response.status
            };
        } catch (error) {
            results[serviceName] = {
                status: 'offline',
                url: url,
                error: error.message
            };
        }
    }
    
    return results;
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        CONFIG_LOCAL, 
        getConfig, 
        formatCurrency, 
        formatDate, 
        debug, 
        checkServicesConnectivity 
    };
} else {
    window.CONFIG = CONFIG_LOCAL;
    window.getConfig = getConfig;
    window.formatCurrency = formatCurrency;
    window.formatDate = formatDate;
    window.debug = debug;
    window.checkServicesConnectivity = checkServicesConnectivity;
}
