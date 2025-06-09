document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const logoutBtn = document.getElementById('logout-btn');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileAddress = document.getElementById('profile-address');
    const profilePhone = document.getElementById('profile-phone');

    // ======================
    // 1. FUNCIÓN DE NOTIFICACIÓN
    // ======================
    function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // ======================
    // 2. VERIFICAR AUTENTICACIÓN
    // ======================
    function checkAuth() {
        const token = localStorage.getItem('userToken');
        if (!token) {
            showNotification('Debes iniciar sesión para ver esta página', 'error');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return false;
        }
        return true;
    }

    // ======================
    // 3. CONFIGURAR INTERFAZ
    // ======================
    function setupUI() {
        const userName = localStorage.getItem('userName');
        const headerUsername = document.getElementById('header-username');
        
        if (userName) {
            headerUsername.textContent = `Bienvenido, ${userName}`;
            headerUsername.style.display = 'block';
            
            // Mostrar/ocultar elementos de navegación
            document.getElementById('login-link').style.display = 'none';
            document.getElementById('register-link').style.display = 'none';
            document.getElementById('profile-link').style.display = 'block';
            document.getElementById('logout-link').style.display = 'block';
        }
    }

    // ======================
    // 4. CARGAR DATOS DEL PERFIL
    // ======================
    async function loadProfile() {
        if (!checkAuth()) return;
        
        try {
            // Mostrar estado de carga
            profileName.disabled = true;
            profileEmail.disabled = true;
            profileAddress.disabled = true;
            profilePhone.disabled = true;

            const token = localStorage.getItem('userToken');
            const response = await fetch('http://localhost:3000/api/users/me', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${await response.text()}`);
            }
            
            const userData = await response.json();
            
            // Llenar formulario con datos del usuario
            if (userData) {
                profileName.value = userData.name || '';
                profileEmail.value = userData.email || '';
                profileAddress.value = userData.address || '';
                profilePhone.value = userData.phone || '';
                
                // Actualizar nombre en localStorage
                if (userData.name) {
                    localStorage.setItem('userName', userData.name);
                    setupUI();
                }
            }
            
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            showNotification(error.message || 'Error al cargar perfil', 'error');
            
            // Si es error 401 (no autorizado), redirigir a login
            if (error.message.includes('401')) {
                localStorage.removeItem('userToken');
                localStorage.removeItem('userName');
                setTimeout(() => window.location.href = 'login.html', 1500);
            }
        } finally {
            // Restaurar inputs
            profileName.disabled = false;
            profileEmail.disabled = false;
            profileAddress.disabled = false;
            profilePhone.disabled = false;
        }
    }

    // ======================
    // 5. ACTUALIZAR PERFIL
    // ======================
    async function updateProfile(e) {
        e.preventDefault();
        
        if (!checkAuth()) return;
        
        const updatedData = {
            name: profileName.value.trim(),
            address: profileAddress.value.trim(),
            phone: profilePhone.value.trim()
        };

        // Validación
        if (!updatedData.name) {
            showNotification('El nombre es obligatorio', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch('http://localhost:3000/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${await response.text()}`);
            }

            showNotification('Perfil actualizado correctamente', 'success');
            localStorage.setItem('userName', updatedData.name);
            setupUI();
            
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            showNotification(error.message || 'Error al actualizar perfil', 'error');
        }
    }

    // ======================
    // 6. CAMBIAR CONTRASEÑA
    // ======================
    async function changePassword(e) {
        e.preventDefault();
        
        if (!checkAuth()) return;
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
        
        // Validaciones
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('Todos los campos son obligatorios', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch('http://localhost:3000/api/users/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${await response.text()}`);
            }

            showNotification('Contraseña cambiada exitosamente', 'success');
            passwordForm.reset();
            
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            showNotification(error.message || 'Error al cambiar contraseña', 'error');
        }
    }

    // ======================
    // 7. CERRAR SESIÓN
    // ======================
    function logout(e) {
        e.preventDefault();
        localStorage.removeItem('userToken');
        localStorage.removeItem('userName');
        showNotification('Sesión cerrada correctamente', 'success');
        setTimeout(() => window.location.href = 'login.html', 1500);
    }

    // ======================
    // 8. INICIALIZACIÓN
    // ======================
    function init() {
        // Configurar eventos
        if (profileForm) profileForm.addEventListener('submit', updateProfile);
        if (passwordForm) passwordForm.addEventListener('submit', changePassword);
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
        
        // Cargar datos iniciales
        setupUI();
        loadProfile();
    }

    init();
});