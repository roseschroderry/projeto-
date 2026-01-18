// config.js
// Configuração centralizada de URLs e constantes do projeto

const CONFIG = {
    // Ambiente atual (detecta automaticamente)
    ENVIRONMENT: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'development' 
        : 'production',
    
    // URLs dos Backends
    API_URLS: {
        development: {
            MAIN_BACKEND: 'http://localhost:8000',
            API_SERVER: 'http://localhost:3000',
            CHAT_IA: 'http://localhost:8001',
            PYTHON_API: 'http://localhost:8002'
        },
        production: {
            // URLs serão atualizadas após deploy no Render
            MAIN_BACKEND: 'https://chat-ai-backend.onrender.com',
            API_SERVER: 'https://seu-api-server.onrender.com',
            CHAT_IA: 'https://seu-chat-ia.onrender.com',
            PYTHON_API: 'https://seu-python-api.onrender.com'
        }
    },
    
    // Configurações de autenticação
    AUTH: {
        TOKEN_KEY: 'api_token',
        USER_KEY: 'user_data',
        TOKEN_REFRESH_INTERVAL: 55 * 60 * 1000 // 55 minutos
    },
    
    // Configurações de API
    API: {
        TIMEOUT: 30000, // 30 segundos
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000 // 1 segundo
    },
    
    // Configurações de upload
    UPLOAD: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_TYPES: ['.xlsx', '.xls', '.xlsm', '.csv'],
        CHUNK_SIZE: 512 * 1024 // 512KB para uploads em chunks
    },
    
    // Mensagens
    MESSAGES: {
        LOGIN_REQUIRED: 'Por favor, faça login para continuar',
        SESSION_EXPIRED: 'Sua sessão expirou. Faça login novamente',
        NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
        UPLOAD_SUCCESS: 'Arquivo enviado com sucesso',
        UPLOAD_ERROR: 'Erro ao enviar arquivo'
    },
    
    // Métodos auxiliares
    getBackendUrl(serviceName = 'MAIN_BACKEND') {
        const env = this.ENVIRONMENT;
        return this.API_URLS[env][serviceName];
    },
    
    getApiUrl(endpoint) {
        return `${this.getBackendUrl()}/api${endpoint}`;
    },
    
    isProduction() {
        return this.ENVIRONMENT === 'production';
    },
    
    isDevelopment() {
        return this.ENVIRONMENT === 'development';
    },
    
    // Headers padrão para requisições
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (includeAuth) {
            const token = localStorage.getItem(this.AUTH.TOKEN_KEY);
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    },
    
    // Verificar se usuário está autenticado
    isAuthenticated() {
        return !!localStorage.getItem(this.AUTH.TOKEN_KEY);
    },
    
    // Obter dados do usuário logado
    getUser() {
        const userData = localStorage.getItem(this.AUTH.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    },
    
    // Fazer logout
    logout() {
        localStorage.removeItem(this.AUTH.TOKEN_KEY);
        localStorage.removeItem(this.AUTH.USER_KEY);
        window.location.href = '/login.html';
    },
    
    // Logging com controle de ambiente
    log(...args) {
        if (this.isDevelopment()) {
            console.log('[CONFIG]', ...args);
        }
    },
    
    error(...args) {
        console.error('[CONFIG ERROR]', ...args);
    }
};

// Exportar configuração
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Log de inicialização
CONFIG.log(`Ambiente: ${CONFIG.ENVIRONMENT}`);
CONFIG.log(`Backend URL: ${CONFIG.getBackendUrl()}`);
