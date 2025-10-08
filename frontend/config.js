// Configuración del frontend
const CONFIG = {
    // URLs de la API
    API_BASE_URL: 'http://localhost:3000/api',
    
    // Configuración de la aplicación
    APP_NAME: 'Sistema Universitario',
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
        LOG_LEVEL: 'info'
    }
};

// Función para obtener configuración
function getConfig(key) {
    return key.split('.').reduce((obj, k) => obj && obj[k], CONFIG);
}

// Función para formatear moneda
function formatCurrency(amount) {
    const { CURRENCY, CURRENCY_SYMBOL, DECIMAL_PLACES } = CONFIG.PAYMENTS;
    
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
    if (CONFIG.DEV.DEBUG) {
        console.log(`[DEBUG] ${message}`, data || '');
    }
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getConfig, formatCurrency, formatDate, debug };
} else {
    window.CONFIG = CONFIG;
    window.getConfig = getConfig;
    window.formatCurrency = formatCurrency;
    window.formatDate = formatDate;
    window.debug = debug;
}




