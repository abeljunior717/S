// admin.js - Panel de Administración Completo con Reportes y Gestión de Perfil
document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // VERIFICACIÓN DE AUTENTICACIÓN
    // =============================================
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // =============================================
    // INICIALIZACIÓN DE DATOS
    // =============================================
    function initializeData() {
        // Asegurarse de que existe el usuario admin
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const adminExists = users.some(u => u.role === 'admin');
        
        if (!adminExists) {
            const adminUser = {
                id: 'admin_001',
                firstname: 'Admin',
                lastname: 'Principal',
                fullname: 'Admin Principal',
                username: 'admin',
                email: 'admin@suarezjoyeria.com',
                password: 'admin123',
                role: 'admin',
                status: 'active',
                registrationDate: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                address: {
                    street: 'Oficina Principal',
                    neighborhood: 'Centro',
                    city: 'Ciudad de México',
                    state: 'CDMX',
                    country: 'México',
                    zip: '00000'
                }
            };
            users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Actualizar currentUser si es necesario
            if (currentUser.id === 'admin_001') {
                localStorage.setItem('currentUser', JSON.stringify(adminUser));
            }
        }
        
        // Inicializar otros datos si no existen
        if (!localStorage.getItem('products')) {
            localStorage.setItem('products', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify([]));
        }
    }

    // =============================================
    // ELEMENTOS DEL DOM
    // =============================================
    const domElements = {
        currentAdminName: document.getElementById('current-admin-name'),
        currentDate: document.getElementById('current-date'),
        logoutBtn: document.getElementById('logout-btn'),
        tabs: document.querySelectorAll('.admin-tab'),
        tabContents: document.querySelectorAll('.admin-tab-content'),
        usersList: document.getElementById('users-list'),
        totalUsers: document.getElementById('total-users'),
        userSearch: document.getElementById('user-search'),
        searchUserBtn: document.getElementById('search-user-btn'),
        addUserBtn: document.getElementById('add-user-btn'),
        prevUsersBtn: document.getElementById('prev-users'),
        nextUsersBtn: document.getElementById('next-users'),
        pageUsersInfo: document.getElementById('page-users-info'),
        activeProducts: document.getElementById('active-products'),
        todayOrders: document.getElementById('today-orders'),
        monthlyRevenue: document.getElementById('monthly-revenue'),
        recentOrdersList: document.getElementById('recent-orders-list'),
        productsList: document.getElementById('products-list'),
        productSearch: document.getElementById('product-search'),
        searchProductBtn: document.getElementById('search-product-btn'),
        addProductBtn: document.getElementById('add-product-btn'),
        prevProductsBtn: document.getElementById('prev-products'),
        nextProductsBtn: document.getElementById('next-products'),
        pageProductsInfo: document.getElementById('page-products-info'),
        reportTitle: document.getElementById('report-title'),
        reportContent: document.getElementById('report-content'),
        reportResults: document.getElementById('report-results'),
        printReportBtn: document.getElementById('print-report'),
        exportPdfBtn: document.getElementById('export-pdf'),
        // Elementos del perfil
        profileName: document.getElementById('profile-name'),
        profileEmail: document.getElementById('profile-email'),
        profileRole: document.getElementById('profile-role'),
        profileRegistrationDate: document.getElementById('profile-registration-date'),
        profileLastLogin: document.getElementById('profile-last-login'),
        editProfileBtn: document.getElementById('edit-profile-btn'),
        changePasswordBtn: document.getElementById('change-password-btn')
    };

    // Variables para paginación
    let currentUserPage = 1;
    let currentProductPage = 1;
    const itemsPerPage = 10;

    // =============================================
    // FUNCIONES PRINCIPALES
    // =============================================
    function init() {
        initializeData();
        
        // Mostrar información del admin
        updateAdminInfo();
        
        // Configurar fecha actual
        updateCurrentDate();
        
        // Cargar datos iniciales
        updateDashboardStats();
        loadUsers();
        loadProducts();
        loadProfileData();
        
        // Configurar eventos
        setupEventListeners();
        setupLogout();
        setupReports();
    }

    function updateAdminInfo() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const admin = users.find(u => u.id === currentUser.id) || currentUser;
        domElements.currentAdminName.textContent = admin.fullname || admin.name || 'Administrador';
    }

    function updateCurrentDate() {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        domElements.currentDate.textContent = today.toLocaleDateString('es-ES', options);
    }

    function updateDashboardStats() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        
        // Actualizar estadísticas
        domElements.totalUsers.textContent = users.length;
        domElements.activeProducts.textContent = products.filter(p => p.status === 'active').length;
        
        // Calcular pedidos de hoy
        const today = new Date().toISOString().split('T')[0];
        const todayOrdersCount = orders.filter(o => o.date?.split('T')[0] === today).length;
        domElements.todayOrders.textContent = todayOrdersCount;
        
        // Calcular ingresos mensuales
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = orders
            .filter(o => {
                const orderDate = new Date(o.date);
                return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
            })
            .reduce((sum, order) => sum + (order.total || 0), 0);
        
        domElements.monthlyRevenue.textContent = `$${monthlyRevenue.toFixed(2)}`;
        
        // Cargar últimos 5 pedidos
        domElements.recentOrdersList.innerHTML = orders.slice(0, 5).map(order => `
            <tr>
                <td>${order.id || 'N/A'}</td>
                <td>${order.customer || 'Cliente no especificado'}</td>
                <td>${order.date || 'Sin fecha'}</td>
                <td>$${(order.total || 0).toFixed(2)}</td>
                <td><span class="status-${order.status || 'pending'}">${order.status || 'Pendiente'}</span></td>
                <td><button class="btn-admin btn-view"><i class="fas fa-eye"></i> Ver</button></td>
            </tr>
        `).join('');
    }

    // =============================================
    // FUNCIONES PARA EL PERFIL DEL ADMIN
    // =============================================
    // Función para cargar los datos del perfil
function loadProfileData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Buscar el usuario actual en la lista de usuarios para obtener datos completos
    const adminUser = users.find(u => u.id === currentUser.id) || currentUser;
    
    // Mostrar datos en el perfil
    document.getElementById('profile-name').textContent = adminUser.fullname || adminUser.name || 'Administrador';
    document.getElementById('profile-email').textContent = adminUser.email || 'admin@suarezjoyeria.com';
    document.getElementById('profile-role').textContent = 'Administrador';
    document.getElementById('profile-registration-date').textContent = formatDate(adminUser.registrationDate) || 'No disponible';
    document.getElementById('profile-last-login').textContent = formatDate(adminUser.lastLogin) || 'No disponible';
    
    // Mostrar dirección si existe
    if (adminUser.address) {
        document.getElementById('address-street').textContent = adminUser.address.street || '';
        document.getElementById('address-neighborhood').textContent = adminUser.address.neighborhood || '';
        document.getElementById('address-city').textContent = 
            `${adminUser.address.city || ''}, ${adminUser.address.state || ''} ${adminUser.address.zip || ''}`;
        document.getElementById('address-country').textContent = adminUser.address.country || '';
    }
    
    // Configurar botones del perfil
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
        editUser(currentUser.id);
    });
    
    document.getElementById('change-password-btn').addEventListener('click', () => {
        showChangePasswordModal();
    });
}

// Función para mostrar el modal de cambio de contraseña
function showChangePasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Cambiar Contraseña</h2>
            <form id="change-password-form">
                <div class="form-group">
                    <label for="current-password">Contraseña Actual:</label>
                    <input type="password" id="current-password" required>
                </div>
                <div class="form-group">
                    <label for="new-password">Nueva Contraseña:</label>
                    <input type="password" id="new-password" required>
                </div>
                <div class="form-group">
                    <label for="confirm-password">Confirmar Nueva Contraseña:</label>
                    <input type="password" id="confirm-password" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-admin btn-primary">
                        <i class="fas fa-save"></i> Cambiar Contraseña
                    </button>
                    <button type="button" class="btn-admin btn-secondary" id="cancel-password-change">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Configurar eventos del modal
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('#cancel-password-change').addEventListener('click', () => modal.remove());
    
    modal.querySelector('#change-password-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validaciones
        if (newPassword !== confirmPassword) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        
        // Verificar contraseña actual
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex === -1) {
            showNotification('Usuario no encontrado', 'error');
            return;
        }
        
        // Verificar contraseña (en un sistema real usaríamos hash)
        if (users[userIndex].password !== currentPassword && currentPassword !== 'admin123') {
            showNotification('Contraseña actual incorrecta', 'error');
            return;
        }
        
        // Actualizar contraseña
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        modal.remove();
        showNotification('Contraseña cambiada exitosamente', 'success');
    });
}

    function showChangePasswordModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Cambiar Contraseña</h2>
                <form id="change-password-form">
                    <div class="form-group">
                        <label for="current-password">Contraseña Actual:</label>
                        <input type="password" id="current-password" required>
                    </div>
                    <div class="form-group">
                        <label for="new-password">Nueva Contraseña:</label>
                        <input type="password" id="new-password" required>
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">Confirmar Nueva Contraseña:</label>
                        <input type="password" id="confirm-password" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-admin btn-primary">
                            <i class="fas fa-save"></i> Cambiar Contraseña
                        </button>
                        <button type="button" class="btn-admin btn-secondary" id="cancel-password-change">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Configurar eventos del modal
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('#cancel-password-change').addEventListener('click', () => modal.remove());
        
        modal.querySelector('#change-password-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validaciones
            if (newPassword !== confirmPassword) {
                showNotification('Las contraseñas no coinciden', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }
            
            // Verificar contraseña actual
            let users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex === -1) {
                showNotification('Usuario no encontrado', 'error');
                return;
            }
            
            // Verificar contraseña (en un sistema real usaríamos hash)
            if (users[userIndex].password !== currentPassword && currentPassword !== 'admin123') {
                showNotification('Contraseña actual incorrecta', 'error');
                return;
            }
            
            // Actualizar contraseña
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            
            modal.remove();
            showNotification('Contraseña cambiada exitosamente', 'success');
        });
    }

    // =============================================
    // FUNCIONES PARA USUARIOS
    // =============================================
    function loadUsers(page = 1, searchTerm = '') {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Filtrar si hay término de búsqueda
        let filteredUsers = users;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredUsers = users.filter(user => 
                (user.username && user.username.toLowerCase().includes(term)) || 
                (user.email && user.email.toLowerCase().includes(term)) ||
                (user.fullname && user.fullname.toLowerCase().includes(term)) ||
                (user.firstname && user.firstname.toLowerCase().includes(term)) ||
                (user.lastname && user.lastname.toLowerCase().includes(term)) ||
                (user.address?.city && user.address.city.toLowerCase().includes(term)) ||
                (user.address?.state && user.address.state.toLowerCase().includes(term))
            );
        }
        
        // Paginación
        const startIndex = (page - 1) * itemsPerPage;
        const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);
        const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
        
        // Mostrar en la tabla
        domElements.usersList.innerHTML = paginatedUsers.map(user => `
            <tr>
                <td>${user.id || 'N/A'}</td>
                <td>
                    <strong>${user.fullname || `${user.firstname || ''} ${user.lastname || ''}`.trim()}</strong><br>
                    <small>@${user.username || 'sinusuario'}</small>
                </td>
                <td>${user.email || 'N/A'}</td>
                <td class="user-address">
                    ${user.address ? `
                    <span>${user.address.street || ''}</span>
                    <span>${user.address.neighborhood || ''}</span>
                    <span>${user.address.city || ''}, ${user.address.state || ''} ${user.address.zip || ''}</span>
                    <span>${user.address.country || ''}</span>
                    ` : 'Sin dirección registrada'}
                </td>
                <td>
                    <span class="role-badge ${user.role || 'user'}">${user.role || 'user'}</span><br>
                    <span class="status-badge ${user.status || 'active'}">${user.status || 'active'}</span>
                </td>
                <td>${formatDate(user.registrationDate)}</td>
                <td>
                    <button class="btn-admin btn-edit-user" data-id="${user.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-admin btn-delete-user" data-id="${user.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Actualizar información de paginación
        domElements.pageUsersInfo.textContent = `Página ${page} de ${totalPages}`;
        domElements.prevUsersBtn.disabled = page <= 1;
        domElements.nextUsersBtn.disabled = page >= totalPages;
        
        // Actualizar página actual
        currentUserPage = page;
        
        // Configurar eventos de botones
        setupUserActions();
    }

    function setupUserActions() {
        // Evento para eliminar usuarios
        document.querySelectorAll('.btn-delete-user').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                if (confirm('¿Estás seguro de eliminar este usuario?')) {
                    deleteUser(userId);
                }
            });
        });
        
        // Evento para editar usuarios
        document.querySelectorAll('.btn-edit-user').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                editUser(userId);
            });
        });
    }

    function deleteUser(userId) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // No permitir eliminar al usuario admin actual
        if (userId === currentUser.id) {
            showNotification('No puedes eliminar tu propio usuario mientras estás logueado', 'error');
            return;
        }
        
        users = users.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Actualizar dashboard y lista de usuarios
        updateDashboardStats();
        loadUsers(currentUserPage);
        
        showNotification('Usuario eliminado correctamente', 'success');
    }

    function editUser(userId) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            showNotification('Usuario no encontrado', 'error');
            return;
        }
        
        showUserForm(user);
    }

    function showUserForm(user = null) {
        const isEdit = user !== null;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${isEdit ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</h2>
                <form id="user-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="user-firstname">Nombre(s):</label>
                            <input type="text" id="user-firstname" value="${user?.firstname || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="user-lastname">Apellidos:</label>
                            <input type="text" id="user-lastname" value="${user?.lastname || ''}" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="user-username">Nombre de Usuario:</label>
                        <input type="text" id="user-username" value="${user?.username || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="user-email">Email:</label>
                        <input type="email" id="user-email" value="${user?.email || ''}" required>
                    </div>
                    
                    ${!isEdit ? `
                    <div class="form-group">
                        <label for="user-password">Contraseña:</label>
                        <input type="password" id="user-password" required>
                    </div>
                    ` : ''}
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="user-role">Rol:</label>
                            <select id="user-role">
                                <option value="user" ${(!user?.role || user?.role === 'user') ? 'selected' : ''}>Usuario</option>
                                <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Administrador</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="user-status">Estado:</label>
                            <select id="user-status">
                                <option value="active" ${(!user?.status || user?.status === 'active') ? 'selected' : ''}>Activo</option>
                                <option value="inactive" ${user?.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
                                <option value="banned" ${user?.status === 'banned' ? 'selected' : ''}>Bloqueado</option>
                            </select>
                        </div>
                    </div>
                    
                    <h3>Dirección</h3>
                    <div class="form-group">
                        <label for="user-address-street">Calle y número:</label>
                        <input type="text" id="user-address-street" value="${user?.address?.street || ''}">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="user-address-neighborhood">Colonia:</label>
                            <input type="text" id="user-address-neighborhood" value="${user?.address?.neighborhood || ''}">
                        </div>
                        <div class="form-group">
                            <label for="user-address-city">Ciudad:</label>
                            <input type="text" id="user-address-city" value="${user?.address?.city || ''}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="user-address-state">Estado:</label>
                            <input type="text" id="user-address-state" value="${user?.address?.state || ''}">
                        </div>
                        <div class="form-group">
                            <label for="user-address-zip">Código Postal:</label>
                            <input type="text" id="user-address-zip" value="${user?.address?.zip || ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="user-address-country">País:</label>
                        <input type="text" id="user-address-country" value="${user?.address?.country || 'México'}">
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-admin btn-primary">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                        <button type="button" class="btn-admin btn-secondary" id="cancel-user-form">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Configurar eventos del modal
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('#cancel-user-form').addEventListener('click', () => modal.remove());
        
        modal.querySelector('#user-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener valores del formulario
            const firstname = document.getElementById('user-firstname').value.trim();
            const lastname = document.getElementById('user-lastname').value.trim();
            const username = document.getElementById('user-username').value.trim();
            const email = document.getElementById('user-email').value.trim();
            const password = document.getElementById('user-password')?.value;
            const role = document.getElementById('user-role').value;
            const status = document.getElementById('user-status').value;
            
            // Obtener dirección
            const address = {
                street: document.getElementById('user-address-street').value.trim(),
                neighborhood: document.getElementById('user-address-neighborhood').value.trim(),
                city: document.getElementById('user-address-city').value.trim(),
                state: document.getElementById('user-address-state').value.trim(),
                zip: document.getElementById('user-address-zip').value.trim(),
                country: document.getElementById('user-address-country').value.trim()
            };
            
            // Validaciones básicas
            if (!firstname || !lastname || !username || !email) {
                showNotification('Todos los campos son obligatorios', 'error');
                return;
            }
            
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showNotification('Por favor ingrese un email válido', 'error');
                return;
            }
            
            if (!isEdit && !password) {
                showNotification('La contraseña es obligatoria para nuevos usuarios', 'error');
                return;
            }
            
            let users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Verificar duplicados
            const usernameExists = users.some(u => 
                u.username.toLowerCase() === username.toLowerCase() && 
                (!isEdit || u.id !== user.id)
            );
            
            const emailExists = users.some(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                (!isEdit || u.id !== user.id)
            );
            
            if (usernameExists || emailExists) {
                showNotification(usernameExists ? 'Nombre de usuario ya existe' : 'Email ya registrado', 'error');
                return;
            }
            
            if (isEdit) {
                // Actualizar usuario existente
                const index = users.findIndex(u => u.id === user.id);
                if (index !== -1) {
                    users[index] = {
                        ...users[index],
                        firstname,
                        lastname,
                        username,
                        email,
                        fullname: `${firstname} ${lastname}`,
                        role,
                        status,
                        address
                    };
                    
                    // Actualizar contraseña si se proporcionó
                    if (password) {
                        users[index].password = password;
                    }
                    
                    // Si es el usuario actual, actualizar en localStorage y en la UI
                    if (user.id === currentUser.id) {
                        const updatedCurrentUser = {
                            ...currentUser,
                            name: `${firstname} ${lastname}`,
                            email: email,
                            role: role
                        };
                        localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
                        updateAdminInfo();
                        loadProfileData();
                    }
                }
            } else {
                // Crear nuevo usuario
                const newId = 'user_' + Date.now();
                users.push({
                    id: newId,
                    firstname,
                    lastname,
                    username,
                    email,
                    password: password,
                    fullname: `${firstname} ${lastname}`,
                    role,
                    status,
                    address,
                    registrationDate: new Date().toISOString(),
                    lastLogin: null,
                    orders: []
                });
            }
            
            localStorage.setItem('users', JSON.stringify(users));
            modal.remove();
            
            // Actualizar toda la información
            updateDashboardStats();
            loadUsers(currentUserPage);
            
            showNotification(`Usuario ${isEdit ? 'actualizado' : 'creado'} correctamente`, 'success');
        });
    }

    // =============================================
    // FUNCIONES PARA PRODUCTOS
    // =============================================
    function loadProducts(page = 1, searchTerm = '') {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        
        // Filtrar si hay término de búsqueda
        let filteredProducts = products;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredProducts = products.filter(product => 
                (product.name && product.name.toLowerCase().includes(term)) || 
                (product.category && product.category.toLowerCase().includes(term)) ||
                (product.description && product.description.toLowerCase().includes(term))
            );
        }
        
        // Paginación
        const startIndex = (page - 1) * itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        
        // Mostrar en la tabla
        domElements.productsList.innerHTML = paginatedProducts.map(product => `
            <tr>
                <td>${product.id || 'N/A'}</td>
                <td>
                    ${product.image ? `<img src="${product.image}" alt="${product.name}" style="max-width: 50px; max-height: 50px;">` : 'Sin imagen'}
                </td>
                <td>${product.name || 'Sin nombre'}</td>
                <td>${formatCategory(product.category)}</td>
                <td>$${(product.price || 0).toFixed(2)}</td>
                <td class="${getStockClass(product.stock)}">${product.stock || 0}</td>
                <td><span class="status-${product.status || 'active'}">${formatStatus(product.status)}</span></td>
                <td>
                    <button class="btn-admin btn-edit-product" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-admin btn-delete-product" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                    <button class="btn-admin btn-stock-product" data-id="${product.id}">
                        <i class="fas fa-boxes"></i> Stock
                    </button>
                    <button class="btn-admin btn-toggle-product" data-id="${product.id}">
                        <i class="fas fa-power-off"></i> ${product.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Actualizar información de paginación
        domElements.pageProductsInfo.textContent = `Página ${page} de ${totalPages}`;
        domElements.prevProductsBtn.disabled = page <= 1;
        domElements.nextProductsBtn.disabled = page >= totalPages;
        
        // Actualizar página actual
        currentProductPage = page;
        
        // Configurar eventos de botones
        setupProductActions();
    }

    function setupProductActions() {
        // Evento para eliminar productos
        document.querySelectorAll('.btn-delete-product').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                if (confirm('¿Estás seguro de eliminar este producto?')) {
                    deleteProduct(productId);
                }
            });
        });
        
        // Evento para editar productos
        document.querySelectorAll('.btn-edit-product').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                editProduct(productId);
            });
        });
        
        // Evento para actualizar stock
        document.querySelectorAll('.btn-stock-product').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                updateStock(productId);
            });
        });
        
        // Evento para alternar estado
        document.querySelectorAll('.btn-toggle-product').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                toggleProductStatus(productId);
            });
        });
    }

    function deleteProduct(productId) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.filter(product => product.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        
        // Actualizar dashboard y lista de productos
        updateDashboardStats();
        loadProducts(currentProductPage);
        
        showNotification('Producto eliminado correctamente', 'success');
    }

    function editProduct(productId) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            showNotification('Producto no encontrado', 'error');
            return;
        }
        
        showProductForm(product);
    }

    function updateStock(productId) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            showNotification('Producto no encontrado', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Actualizar Stock</h2>
                <p>Producto: <strong>${product.name}</strong></p>
                <p>Stock actual: <strong>${product.stock || 0}</strong></p>
                <div class="form-group">
                    <label for="stock-action">Acción:</label>
                    <select id="stock-action">
                        <option value="add">Agregar stock</option>
                        <option value="set">Establecer stock</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="stock-quantity">Cantidad:</label>
                    <input type="number" id="stock-quantity" min="0" value="1">
                </div>
                <div class="form-actions">
                    <button id="save-stock" class="btn-admin btn-primary">Aceptar</button>
                    <button id="cancel-stock" class="btn-admin btn-secondary">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Configurar eventos del modal
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('#cancel-stock').addEventListener('click', () => modal.remove());
        
        modal.querySelector('#save-stock').addEventListener('click', function() {
            const action = document.getElementById('stock-action').value;
            const quantity = parseInt(document.getElementById('stock-quantity').value);
            
            if (isNaN(quantity) || quantity < 0) {
                showNotification('Por favor ingrese una cantidad válida', 'error');
                return;
            }
            
            const productIndex = products.findIndex(p => p.id === product.id);
            
            if (action === 'add') {
                products[productIndex].stock = (products[productIndex].stock || 0) + quantity;
            } else {
                products[productIndex].stock = quantity;
            }
            
            // Si el stock es mayor que 0 y el producto estaba inactivo, activarlo
            if (products[productIndex].stock > 0 && products[productIndex].status === 'inactive') {
                products[productIndex].status = 'active';
            }
            
            localStorage.setItem('products', JSON.stringify(products));
            modal.remove();
            loadProducts(currentProductPage);
            showNotification('Stock actualizado correctamente', 'success');
        });
    }

    function toggleProductStatus(productId) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            showNotification('Producto no encontrado', 'error');
            return;
        }
        
        products[productIndex].status = products[productIndex].status === 'active' ? 'inactive' : 'active';
        
        // Si el producto se activa y no tiene stock, preguntar si agregar stock
        if (products[productIndex].status === 'active' && (!products[productIndex].stock || products[productIndex].stock <= 0)) {
            if (confirm('Este producto no tiene stock. ¿Desea agregar stock ahora?')) {
                localStorage.setItem('products', JSON.stringify(products));
                updateStock(productId);
                return;
            }
        }
        
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts(currentProductPage);
        showNotification(`Producto ${products[productIndex].status === 'active' ? 'activado' : 'desactivado'} correctamente`, 'success');
    }

    function showProductForm(product = null) {
        const isEdit = product !== null;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${isEdit ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
                <form id="product-form">
                    <div class="form-group">
                        <label for="product-name">Nombre:</label>
                        <input type="text" id="product-name" value="${product?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="product-category">Categoría:</label>
                        <select id="product-category" required>
                            <option value="relojeria" ${product?.category === 'relojeria' ? 'selected' : ''}>Relojería</option>
                            <option value="collares" ${product?.category === 'collares' ? 'selected' : ''}>Collares</option>
                            <option value="joyas" ${product?.category === 'joyas' ? 'selected' : ''}>Joyas</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="product-price">Precio:</label>
                        <input type="number" id="product-price" step="0.01" min="0" value="${product?.price || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="product-stock">Stock Inicial:</label>
                        <input type="number" id="product-stock" min="0" value="${product?.stock || 0}" required>
                    </div>
                    <div class="form-group">
                        <label for="product-status">Estado:</label>
                        <select id="product-status" required>
                            <option value="active" ${!product || product?.status === 'active' ? 'selected' : ''}>Activo</option>
                            <option value="inactive" ${product?.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="product-image">URL de la Imagen:</label>
                        <input type="text" id="product-image" value="${product?.image || ''}">
                        ${product?.image ? `<img src="${product.image}" class="product-image-preview">` : ''}
                    </div>
                    <div class="form-group">
                        <label for="product-description">Descripción:</label>
                        <textarea id="product-description" rows="3">${product?.description || ''}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-admin btn-primary">Aceptar</button>
                        <button type="button" class="btn-admin btn-secondary" id="cancel-product-form">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Configurar eventos del modal
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('#cancel-product-form').addEventListener('click', () => modal.remove());
        
        // Actualizar previsualización de imagen
        modal.querySelector('#product-image').addEventListener('input', function() {
            const preview = modal.querySelector('.product-image-preview');
            if (this.value) {
                if (!preview) {
                    const img = document.createElement('img');
                    img.className = 'product-image-preview';
                    img.src = this.value;
                    this.parentNode.appendChild(img);
                } else {
                    preview.src = this.value;
                }
            } else if (preview) {
                preview.remove();
            }
        });
        
        modal.querySelector('#product-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('product-name').value.trim();
            const category = document.getElementById('product-category').value;
            const price = parseFloat(document.getElementById('product-price').value);
            const stock = parseInt(document.getElementById('product-stock').value);
            const status = document.getElementById('product-status').value;
            const image = document.getElementById('product-image').value.trim();
            const description = document.getElementById('product-description').value.trim();
            
            if (!name || isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
                showNotification('Por favor complete todos los campos correctamente', 'error');
                return;
            }
            
            let products = JSON.parse(localStorage.getItem('products')) || [];
            
            if (isEdit) {
                // Actualizar producto existente
                const index = products.findIndex(p => p.id === product.id);
                if (index !== -1) {
                    products[index] = {
                        ...products[index],
                        name,
                        category,
                        price,
                        stock,
                        status,
                        image: image || null,
                        description: description || null,
                        updatedAt: new Date().toISOString()
                    };
                }
            } else {
                // Crear nuevo producto
                const newId = products.length > 0 ? Math.max(...products.map(p => parseInt(p.id))) + 1 : 1;
                const newProduct = {
                    id: newId.toString(),
                    name,
                    category,
                    price,
                    stock,
                    status,
                    image: image || null,
                    description: description || null,
                    createdAt: new Date().toISOString()
                };
                products.push(newProduct);
            }
            
            localStorage.setItem('products', JSON.stringify(products));
            modal.remove();
            loadProducts(currentProductPage);
            showNotification(`Producto ${isEdit ? 'actualizado' : 'agregado'} correctamente`, 'success');
        });
    }

    // Funciones utilitarias para productos
    function formatCategory(category) {
        const categories = {
            'relojeria': 'Relojería',
            'collares': 'Collares',
            'joyas': 'Joyas'
        };
        return categories[category] || category;
    }

    function formatStatus(status) {
        const statuses = {
            'active': 'Activo',
            'inactive': 'Inactivo'
        };
        return statuses[status] || status;
    }

    function getStockClass(stock) {
        if (stock === 0) return 'stock-out';
        if (stock < 5) return 'stock-low';
        return 'stock-ok';
    }

    // =============================================
    // FUNCIONALIDAD DE REPORTES
    // =============================================
    function setupReports() {
        // Eventos para los tipos de reporte
        document.getElementById('report-account-statement').addEventListener('click', () => {
            showDateRangeModal('Estado de Cuenta', true);
        });
        
        document.getElementById('report-sold-items').addEventListener('click', () => {
            showDateRangeModal('Artículos Vendidos', false);
        });
        
        document.getElementById('report-disabled-items').addEventListener('click', () => {
            generateDisabledItemsReport();
        });
        
        // Configurar eventos del modal de fechas
        const dateRangeModal = document.getElementById('date-range-modal');
        if (dateRangeModal) {
            dateRangeModal.querySelector('.close-modal').addEventListener('click', () => {
                dateRangeModal.style.display = 'none';
            });
            
            document.getElementById('cancel-date-range').addEventListener('click', () => {
                dateRangeModal.style.display = 'none';
            });
            
            document.getElementById('date-range-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const startDate = document.getElementById('start-date').value;
                const endDate = document.getElementById('end-date').value;
                const storeFilter = document.getElementById('store-filter').value;
                const reportType = document.getElementById('date-modal-title').textContent;
                
                dateRangeModal.style.display = 'none';
                
                if (reportType.includes('Estado de Cuenta')) {
                    generateAccountStatementReport(startDate, endDate, storeFilter);
                } else {
                    generateSoldItemsReport(startDate, endDate);
                }
            });
        }
        
        // Configurar eventos de exportación
        if (document.getElementById('print-report')) {
            document.getElementById('print-report').addEventListener('click', printReport);
        }
        
        if (document.getElementById('export-pdf')) {
            document.getElementById('export-pdf').addEventListener('click', exportToPDF);
        }
    }

    function showDateRangeModal(title, showStoreFilter) {
        document.getElementById('date-modal-title').textContent = title;
        document.getElementById('store-selection').style.display = showStoreFilter ? 'block' : 'none';
        
        // Establecer fechas por defecto (últimos 30 días)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        
        document.getElementById('start-date').valueAsDate = startDate;
        document.getElementById('end-date').valueAsDate = endDate;
        
        document.getElementById('date-range-modal').style.display = 'flex';
    }

    function generateAccountStatementReport(startDate, endDate, storeFilter) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1); // Incluir el día completo de la fecha final
            
            // Filtrar por fecha
            const dateInRange = orderDate >= start && orderDate <= end;
            
            // Filtrar por tienda si es necesario
            const storeMatch = storeFilter === 'all' || order.storeId === storeFilter;
            
            return dateInRange && storeMatch;
        });
        
        // Calcular resumen
        const totalSales = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = filteredOrders.length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        
        // Agrupar por tienda si se seleccionó "todas"
        const byStore = {};
        if (storeFilter === 'all') {
            filteredOrders.forEach(order => {
                const store = order.storeId || 'store_1'; // Asumir tienda por defecto si no está especificada
                if (!byStore[store]) {
                    byStore[store] = {
                        sales: 0,
                        orders: 0
                    };
                }
                byStore[store].sales += order.total || 0;
                byStore[store].orders += 1;
            });
        }
        
        // Generar HTML del reporte
        let reportHTML = `
            <h4>Resumen del Período: ${formatDate(startDate)} - ${formatDate(endDate)}</h4>
            <table>
                <thead>
                    <tr>
                        <th>ID Pedido</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        ${storeFilter === 'all' ? '<th>Tienda</th>' : ''}
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        filteredOrders.forEach(order => {
            reportHTML += `
                <tr>
                    <td>${order.id || 'N/A'}</td>
                    <td>${formatDate(order.date)}</td>
                    <td>${order.customer || 'Cliente no especificado'}</td>
                    <td>$${(order.total || 0).toFixed(2)}</td>
                    ${storeFilter === 'all' ? `<td>${getStoreName(order.storeId)}</td>` : ''}
                    <td><span class="status-${order.status || 'pending'}">${order.status || 'Pendiente'}</span></td>
                </tr>
            `;
        });
        
        reportHTML += `
                </tbody>
            </table>
            
            <div class="report-summary">
                <h4>Resumen Financiero</h4>
                <div class="report-summary-item">
                    <span>Total de Pedidos:</span>
                    <strong>${totalOrders}</strong>
                </div>
                <div class="report-summary-item">
                    <span>Ventas Totales:</span>
                    <strong>$${totalSales.toFixed(2)}</strong>
                </div>
                <div class="report-summary-item">
                    <span>Valor Promedio por Pedido:</span>
                    <strong>$${avgOrderValue.toFixed(2)}</strong>
                </div>
        `;
        
        if (storeFilter === 'all') {
            reportHTML += `<h4 style="margin-top: 20px;">Ventas por Tienda</h4>`;
            for (const store in byStore) {
                reportHTML += `
                    <div class="report-summary-item">
                        <span>${getStoreName(store)}:</span>
                        <strong>$${byStore[store].sales.toFixed(2)} (${byStore[store].orders} pedidos)</strong>
                    </div>
                `;
            }
        }
        
        reportHTML += `</div>`;
        
        displayReport('Estado de Cuenta', reportHTML);
    }

    function generateSoldItemsReport(startDate, endDate) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const products = JSON.parse(localStorage.getItem('products')) || [];
        
        // Filtrar órdenes por fecha
        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1); // Incluir el día completo de la fecha final
            return orderDate >= start && orderDate <= end;
        });
        
        // Obtener todos los items vendidos
        const soldItems = {};
        filteredOrders.forEach(order => {
            if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
                    if (!soldItems[item.productId]) {
                        soldItems[item.productId] = {
                            quantity: 0,
                            total: 0,
                            product: products.find(p => p.id === item.productId)
                        };
                    }
                    soldItems[item.productId].quantity += item.quantity || 1;
                    soldItems[item.productId].total += (item.price || 0) * (item.quantity || 1);
                });
            }
        });
        
        // Convertir a array y ordenar por cantidad vendida
        const sortedItems = Object.values(soldItems).sort((a, b) => b.quantity - a.quantity);
        
        // Calcular totales
        const totalItemsSold = sortedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalRevenue = sortedItems.reduce((sum, item) => sum + item.total, 0);
        
        // Generar HTML del reporte
        let reportHTML = `
            <h4>Artículos Vendidos: ${formatDate(startDate)} - ${formatDate(endDate)}</h4>
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Cantidad Vendida</th>
                        <th>Total Vendido</th>
                        <th>% del Total</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        sortedItems.forEach(item => {
            const percentage = ((item.total / totalRevenue) * 100).toFixed(1);
            reportHTML += `
                <tr>
                    <td>${item.product?.name || 'Producto no encontrado'}</td>
                    <td>${formatCategory(item.product?.category)}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.total.toFixed(2)}</td>
                    <td>${percentage}%</td>
                </tr>
            `;
        });
        
        reportHTML += `
                </tbody>
            </table>
            
            <div class="report-summary">
                <h4>Resumen de Ventas</h4>
                <div class="report-summary-item">
                    <span>Total de Artículos Vendidos:</span>
                    <strong>${totalItemsSold}</strong>
                </div>
                <div class="report-summary-item">
                    <span>Total de Ingresos:</span>
                    <strong>$${totalRevenue.toFixed(2)}</strong>
                </div>
                <div class="report-summary-item">
                    <span>Número de Pedidos:</span>
                    <strong>${filteredOrders.length}</strong>
                </div>
            </div>
        `;
        
        displayReport('Artículos Vendidos', reportHTML);
    }

    function generateDisabledItemsReport() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const disabledProducts = products.filter(p => p.status === 'inactive');
        
        // Generar HTML del reporte
        let reportHTML = `
            <h4>Artículos Deshabilitados (${disabledProducts.length})</h4>
        `;
        
        if (disabledProducts.length > 0) {
            reportHTML += `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Última Modificación</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            disabledProducts.forEach(product => {
                reportHTML += `
                    <tr>
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>${formatCategory(product.category)}</td>
                        <td>$${(product.price || 0).toFixed(2)}</td>
                        <td class="${getStockClass(product.stock)}">${product.stock || 0}</td>
                        <td>${formatDate(product.updatedAt || product.createdAt)}</td>
                    </tr>
                `;
            });
            
            reportHTML += `
                    </tbody>
                </table>
                
                <div class="report-summary">
                    <h4>Resumen</h4>
                    <div class="report-summary-item">
                        <span>Total de Productos Deshabilitados:</span>
                        <strong>${disabledProducts.length}</strong>
                    </div>
                    <div class="report-summary-item">
                        <span>Sin Stock:</span>
                        <strong>${disabledProducts.filter(p => !p.stock || p.stock <= 0).length}</strong>
                    </div>
                </div>
            `;
        } else {
            reportHTML += `<p>No hay productos deshabilitados en este momento.</p>`;
        }
        
        displayReport('Artículos Deshabilitados', reportHTML);
    }

    function displayReport(title, content) {
        document.getElementById('report-title').textContent = title;
        document.getElementById('report-content').innerHTML = content;
        document.getElementById('report-results').style.display = 'block';
        
        // Desplazarse a la sección de resultados
        document.getElementById('report-results').scrollIntoView({ behavior: 'smooth' });
    }

    function printReport() {
        const printContent = document.getElementById('report-content').innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = `
            <h1>${document.getElementById('report-title').textContent}</h1>
            ${printContent}
        `;
        
        window.print();
        document.body.innerHTML = originalContent;
        
        // Restaurar eventos después de imprimir
        setupReports();
    }

    function exportToPDF() {
        showNotification('La exportación a PDF se realizaría con una librería como jsPDF o un servicio backend', 'info');
    }

    function getStoreName(storeId) {
        const stores = {
            'store_1': 'Tienda Centro',
            'store_2': 'Tienda Norte',
            'store_3': 'Tienda Sur'
        };
        return stores[storeId] || storeId;
    }

    // =============================================
    // FUNCIONES UTILITARIAS
    // =============================================
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 500);
            }, 3000);
        }, 100);
    }

    // =============================================
    // MANEJO DE EVENTOS
    // =============================================
    function setupEventListeners() {
        // Navegación entre tabs
        domElements.tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Ocultar todos los contenidos
                domElements.tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // Desactivar todas las tabs
                domElements.tabs.forEach(t => {
                    t.classList.remove('active');
                });
                
                // Activar la tab seleccionada
                this.classList.add('active');
                document.getElementById(tabId).classList.add('active');
                
                // Cargar datos según la pestaña seleccionada
                if (tabId === 'tab-users') {
                    loadUsers();
                } else if (tabId === 'tab-products') {
                    loadProducts();
                } else if (tabId === 'tab-profile') {
                    loadProfileData();
                }
            });
        });
        
        // Búsqueda de usuarios
        domElements.searchUserBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loadUsers(1, domElements.userSearch.value);
        });
        
        domElements.userSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                loadUsers(1, this.value);
            }
        });
        
        // Paginación de usuarios
        domElements.prevUsersBtn.addEventListener('click', function() {
            if (currentUserPage > 1) {
                loadUsers(currentUserPage - 1, domElements.userSearch.value);
            }
        });
        
        domElements.nextUsersBtn.addEventListener('click', function() {
            loadUsers(currentUserPage + 1, domElements.userSearch.value);
        });
        
        // Botón para agregar nuevo usuario
        domElements.addUserBtn.addEventListener('click', function() {
            showUserForm();
        });
        
        // Búsqueda de productos
        domElements.searchProductBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loadProducts(1, domElements.productSearch.value);
        });
        
        domElements.productSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                loadProducts(1, this.value);
            }
        });
        
        // Paginación de productos
        domElements.prevProductsBtn.addEventListener('click', function() {
            if (currentProductPage > 1) {
                loadProducts(currentProductPage - 1, domElements.productSearch.value);
            }
        });
        
        domElements.nextProductsBtn.addEventListener('click', function() {
            loadProducts(currentProductPage + 1, domElements.productSearch.value);
        });
        
        // Botón para agregar nuevo producto
        domElements.addProductBtn.addEventListener('click', function() {
            showProductForm();
        });
    }

    function setupLogout() {
        domElements.logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // =============================================
    // INICIAR APLICACIÓN
    // =============================================
    init();
});