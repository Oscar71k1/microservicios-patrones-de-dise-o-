// API Configuration - Usar configuración centralizada
const API_BASE_URL = window.CONFIG ? window.CONFIG.API_BASE_URL : 'http://localhost:3000/api';

// Debug: Verificar configuración
console.log('🔧 Frontend Configuration:');
console.log('   - API_BASE_URL:', API_BASE_URL);
console.log('   - CONFIG disponible:', !!window.CONFIG);
if (window.CONFIG) {
    console.log('   - CONFIG.API_BASE_URL:', window.CONFIG.API_BASE_URL);
}


// Global State
let currentUser = null;
let authToken = null;

// DOM Elements
const elements = {
    // Navigation
    nav: document.getElementById('nav'),
    loginLink: document.getElementById('login-link'),
    registerLink: document.getElementById('register-link'),
    dashboardLink: document.getElementById('dashboard-link'),
    catalogLink: document.getElementById('catalog-link'),
    paymentsLink: document.getElementById('payments-link'),
    logoutLink: document.getElementById('logout-link'),
    
    // Pages
    pages: {
        home: document.getElementById('home-page'),
        login: document.getElementById('login-page'),
        register: document.getElementById('register-page'),
        dashboard: document.getElementById('dashboard-page'),
        catalog: document.getElementById('catalog-page'),
        payments: document.getElementById('payments-page')
    },
    
    // Forms
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    createPaymentForm: document.getElementById('create-payment-form'),
    createConceptForm: document.getElementById('create-concept-form'),
    
    // User info
    userName: document.getElementById('user-name'),
    userFullName: document.getElementById('user-full-name'),
    userEmail: document.getElementById('user-email'),
    userRole: document.getElementById('user-role'),
    
    // Payments
    paymentsList: document.getElementById('payments-list'),
    recentPayments: document.getElementById('recent-payments'),
    statusFilter: document.getElementById('status-filter'),
    
    // Catalog
    catalogList: document.getElementById('catalog-list'),
    catalogCampus: document.getElementById('catalog-campus'),
    catalogCarrera: document.getElementById('catalog-carrera'),
    
    // Modals
    createPaymentModal: document.getElementById('create-payment-modal'),
    closePaymentModal: document.getElementById('close-payment-modal'),
    createPaymentModalBtn: document.getElementById('create-payment-modal-btn'),
    createPaymentBtn: document.getElementById('create-payment-btn'),
    cancelPayment: document.getElementById('cancel-payment'),
    
    // Loading
    loadingOverlay: document.getElementById('loading-overlay'),
    toastContainer: document.getElementById('toast-container')
};

// Función para verificar conectividad con el API Gateway
async function checkAPIConnectivity() {
    try {
        console.log('🔍 Verificando conectividad con API Gateway...');
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Gateway conectado:', data);
            return true;
        } else {
            console.warn('⚠️ API Gateway respondió con error:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Error conectando con API Gateway:', error.message);
        console.error('   - URL intentada:', `${API_BASE_URL.replace('/api', '')}/health`);
        return false;
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando aplicación...');
    setupEventListeners();
    checkAuthStatus();
    
    // Verificar conectividad con API Gateway (asíncrono)
    checkAPIConnectivity().then(isConnected => {
        if (!isConnected) {
            showToast('⚠️ No se pudo conectar con el API Gateway. Verifique que esté ejecutándose en localhost:3000', 'warning');
        }
    });
    
    console.log('✅ Aplicación inicializada correctamente');
});

function setupEventListeners() {
    // Navigation - para enlaces de navegación
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Botones con data-page (incluyendo los de la página de inicio)
    document.querySelectorAll('[data-page]').forEach(button => {
        button.addEventListener('click', handleNavigation);
    });
    
    // Forms
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    elements.createPaymentForm.addEventListener('submit', handleCreatePayment);
    elements.createConceptForm.addEventListener('submit', handleCreateConcept);
    
    // Logout
    elements.logoutLink.addEventListener('click', handleLogout);
    
    // Payment actions
    elements.createPaymentModalBtn.addEventListener('click', () => showModal('create-payment-modal'));
    elements.createPaymentBtn.addEventListener('click', () => showModal('create-payment-modal'));
    elements.closePaymentModal.addEventListener('click', () => hideModal('create-payment-modal'));
    elements.cancelPayment.addEventListener('click', () => hideModal('create-payment-modal'));
    
    // Filters
    elements.statusFilter.addEventListener('change', filterPayments);
    elements.catalogCampus.addEventListener('change', loadCatalog);
    elements.catalogCarrera.addEventListener('change', loadCatalog);
    
    // Modal close on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}

// Navigation
function handleNavigation(e) {
    e.preventDefault();
    const page = e.currentTarget.dataset.page;
    console.log('🔄 Navegando a página:', page);
    if (page) {
        showPage(page);
    }
}

function showPage(pageName) {
    console.log('📄 Mostrando página:', pageName);
    
    // Hide all pages
    Object.values(elements.pages).forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    if (elements.pages[pageName]) {
        elements.pages[pageName].classList.add('active');
        console.log('✅ Página activada:', pageName);
        
        // Load page-specific data
        if (pageName === 'dashboard') {
            loadDashboard();
        } else if (pageName === 'payments') {
            loadPayments();
        } else if (pageName === 'catalog') {
            loadCatalog();
        }
    } else {
        console.error('❌ Página no encontrada:', pageName);
    }
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    showLoading();
    
    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('email'),
        contraseña: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.usuario;
            
            // Save to localStorage
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateUIForLoggedInUser();
            showToast('Login exitoso', 'success');
            showPage('dashboard');
        } else {
            showToast(data.error || 'Error en el login', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
        console.error('Login error:', error);
    } finally {
        hideLoading();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    showLoading();
    
    const formData = new FormData(e.target);
    const registerData = {
        nombre: formData.get('nombre'),
        email: formData.get('email'),
        contraseña: formData.get('password'),
        rol: formData.get('rol')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.usuario;
            
            // Save to localStorage
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateUIForLoggedInUser();
            showToast('Registro exitoso', 'success');
            showPage('dashboard');
        } else {
            showToast(data.error || 'Error en el registro', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
        console.error('Register error:', error);
    } finally {
        hideLoading();
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    updateUIForLoggedOutUser();
    showToast('Sesión cerrada', 'success');
    showPage('home');
}

function updateUIForLoggedInUser() {
    // Update user info
    elements.userName.textContent = currentUser.nombre;
    elements.userFullName.textContent = currentUser.nombre;
    elements.userEmail.textContent = currentUser.email;
    elements.userRole.textContent = currentUser.rol;
    
    // Show/hide navigation elements
    elements.loginLink.style.display = 'none';
    elements.registerLink.style.display = 'none';
    elements.dashboardLink.style.display = 'flex';
    elements.catalogLink.style.display = 'flex';
    elements.paymentsLink.style.display = 'flex';
    elements.logoutLink.style.display = 'flex';
}

function updateUIForLoggedOutUser() {
    // Show/hide navigation elements
    elements.loginLink.style.display = 'flex';
    elements.registerLink.style.display = 'flex';
    elements.dashboardLink.style.display = 'none';
    elements.catalogLink.style.display = 'none';
    elements.paymentsLink.style.display = 'none';
    elements.logoutLink.style.display = 'none';
}

function checkAuthStatus() {
    // Verificar si hay usuario autenticado en localStorage
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        try {
            authToken = savedToken;
            currentUser = JSON.parse(savedUser);
            updateUIForLoggedInUser();
            console.log('👤 Usuario autenticado encontrado:', currentUser.nombre);
        } catch (error) {
            console.error('❌ Error al cargar usuario autenticado:', error);
            // Limpiar datos corruptos
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            authToken = null;
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    } else {
        console.log('👤 No hay usuario autenticado');
        updateUIForLoggedOutUser();
        showPage('home');
    }
}

// Función para manejar logout
function handleLogout() {
    console.log('🚪 Cerrando sesión...');
    
    // Limpiar datos de autenticación
    authToken = null;
    currentUser = null;
    
    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Actualizar UI
    updateUIForLoggedOutUser();
    showPage('home');
    
    showToast('Sesión cerrada exitosamente', 'success');
}

// Dashboard
async function loadDashboard() {
    if (!currentUser) return;
    
    try {
        // Load user payments
        console.log('🔐 Enviando petición a pagos con token:', authToken ? authToken.substring(0, 50) + '...' : 'No token');
        const response = await fetch(`${API_BASE_URL}/pagos/usuario/${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayRecentPayments(data.pagos.slice(0, 3));
        } else {
            elements.recentPayments.innerHTML = '<p class="loading">Error al cargar pagos</p>';
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        elements.recentPayments.innerHTML = '<p class="loading">Error al cargar datos</p>';
    }
}

function displayRecentPayments(payments) {
    if (payments.length === 0) {
        elements.recentPayments.innerHTML = '<p>No hay pagos recientes</p>';
        return;
    }
    
    const paymentsHTML = payments.map(payment => `
        <div class="payment-item">
            <div class="payment-info">
                <h4>${payment.concepto}</h4>
                <p>${new Date(payment.fechaCreacion).toLocaleDateString()}</p>
            </div>
            <div class="payment-amount">$${payment.monto.toLocaleString()}</div>
            <div class="payment-status status-${payment.estado.toLowerCase()}">${payment.estado}</div>
        </div>
    `).join('');
    
    elements.recentPayments.innerHTML = paymentsHTML;
}

// Payments
async function loadPayments() {
    if (!currentUser) return;
    
    showLoading();
    
    try {
        console.log('🔐 Enviando petición a pagos con token:', authToken ? authToken.substring(0, 50) + '...' : 'No token');
        const response = await fetch(`${API_BASE_URL}/pagos/usuario/${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayPayments(data.pagos);
        } else {
            elements.paymentsList.innerHTML = '<div class="loading">Error al cargar pagos</div>';
        }
    } catch (error) {
        console.error('Error loading payments:', error);
        elements.paymentsList.innerHTML = '<div class="loading">Error de conexión</div>';
    } finally {
        hideLoading();
    }
}

function displayPayments(payments) {
    if (payments.length === 0) {
        elements.paymentsList.innerHTML = '<div class="loading">No hay pagos registrados</div>';
        return;
    }
    
    const paymentsHTML = payments.map(payment => `
        <div class="payment-item" data-status="${payment.estado}">
            <div class="payment-info">
                <h4>${payment.concepto}</h4>
                <p>${new Date(payment.fechaCreacion).toLocaleDateString()}</p>
            </div>
            <div class="payment-amount">$${payment.monto.toLocaleString()}</div>
            <div class="payment-status status-${payment.estado.toLowerCase()}">${payment.estado}</div>
        </div>
    `).join('');
    
    elements.paymentsList.innerHTML = paymentsHTML;
}

function filterPayments() {
    const status = elements.statusFilter.value;
    const paymentItems = elements.paymentsList.querySelectorAll('.payment-item');
    
    paymentItems.forEach(item => {
        if (!status || item.dataset.status === status) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Create Payment
async function handleCreatePayment(e) {
    e.preventDefault();
    showLoading();
    
    const formData = new FormData(e.target);
    const paymentData = {
        usuarioId: currentUser.id,
        concepto: formData.get('concepto'),
        monto: parseFloat(formData.get('monto'))
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/pagos/crear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(paymentData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Pago creado exitosamente', 'success');
            hideModal('create-payment-modal');
            e.target.reset();
            
            // Reload payments if on payments page
            if (elements.pages.payments.classList.contains('active')) {
                loadPayments();
            }
            
            // Reload dashboard if on dashboard page
            if (elements.pages.dashboard.classList.contains('active')) {
                loadDashboard();
            }
        } else {
            showToast(data.error || 'Error al crear pago', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
        console.error('Create payment error:', error);
    } finally {
        hideLoading();
    }
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Loading Functions
function showLoading() {
    elements.loadingOverlay.classList.add('active');
}

function hideLoading() {
    elements.loadingOverlay.classList.remove('active');
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Catalog Functions
async function loadCatalog() {
    if (!currentUser) return;
    
    showLoading();
    
    try {
        // Verificar que los elementos existan
        if (!elements.catalogCampus || !elements.catalogCarrera) {
            console.error('❌ Elementos del catálogo no encontrados');
            return;
        }
        
        const campus = elements.catalogCampus.value;
        const carrera = elements.catalogCarrera.value;
        
        console.log('🔍 Valores de filtros:', { 
            campus: campus, 
            carrera: carrera,
            campusElement: elements.catalogCampus,
            carreraElement: elements.catalogCarrera
        });
        
        let url = `${API_BASE_URL}/catalogo/conceptos?tenantId=${currentUser.tenantId || 'universidad_principal'}`;
        if (campus && campus !== '') url += `&campus=${campus}`;
        if (carrera && carrera !== '') url += `&carrera=${carrera}`;
        
        console.log('🔍 URL construida:', url);
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        console.log('📋 Respuesta del catálogo:', data);
        
        if (response.ok) {
            displayCatalog(data.conceptos);
        } else {
            console.error('❌ Error en catálogo:', data);
            elements.catalogList.innerHTML = '<div class="loading">Error al cargar conceptos</div>';
        }
    } catch (error) {
        console.error('Error loading catalog:', error);
        elements.catalogList.innerHTML = '<div class="loading">Error de conexión</div>';
    } finally {
        hideLoading();
    }
}

function displayCatalog(conceptos) {
    console.log('🎨 Mostrando catálogo:', conceptos.length, 'conceptos');
    
    if (conceptos.length === 0) {
        elements.catalogList.innerHTML = '<div class="loading">No hay conceptos disponibles</div>';
        return;
    }
    
    const conceptosHTML = conceptos.map(concepto => `
        <div class="catalog-item">
            <div class="catalog-info">
                <h4>${concepto.nombre}</h4>
                <p class="catalog-code">Código: ${concepto.codigo}</p>
                <p class="catalog-description">${concepto.descripcion}</p>
                <div class="catalog-details">
                    <span class="catalog-type">${concepto.tipo}</span>
                    <span class="catalog-period">${concepto.periodo}</span>
                    <span class="catalog-campus">${concepto.campus}</span>
                </div>
            </div>
            <div class="catalog-amount">$${concepto.monto.toLocaleString()}</div>
            <div class="catalog-actions">
                <button class="btn btn-primary btn-sm" onclick="createPaymentFromConcept('${concepto.id}', '${concepto.nombre}', ${concepto.monto})">
                    <i class="fas fa-plus"></i>
                    Crear Pago
                </button>
            </div>
        </div>
    `).join('');
    
    elements.catalogList.innerHTML = conceptosHTML;
    console.log('✅ Catálogo renderizado:', conceptosHTML.length, 'caracteres');
}

function createPaymentFromConcept(conceptoId, conceptoNombre, monto) {
    // Llenar el formulario de pago con los datos del concepto
    document.getElementById('payment-concept').value = conceptoNombre;
    document.getElementById('payment-amount').value = monto;
    
    // Mostrar el modal de pago
    showModal('create-payment-modal');
}

// Función para mostrar modal de crear concepto
function showCreateConceptModal() {
    showModal('create-concept-modal');
}

// Función para crear concepto específico
async function handleCreateConcept(e) {
    e.preventDefault();
    showLoading();
    
    const formData = new FormData(e.target);
    const conceptData = {
        matricula: formData.get('matricula'),
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion'),
        monto: parseFloat(formData.get('monto')),
        tipo: formData.get('tipo')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/catalogo/conceptos/alumno`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(conceptData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Concepto creado exitosamente', 'success');
            hideModal('create-concept-modal');
            // Recargar el catálogo
            loadCatalog();
        } else {
            showToast(data.error || 'Error al crear concepto', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
        console.error('Create concept error:', error);
    } finally {
        hideLoading();
    }
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}



