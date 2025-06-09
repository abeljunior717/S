// login.js - Manejo específico de la página de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    // Si ya está logueado, redirigir
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        window.location.href = currentUser.role === 'admin' ? 'admin.html' : 'index.html';
        return;
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // 1. Verificar credenciales de admin
        if (email === 'admin@suarezjoyeria.com' && password === 'admin123') {
            const adminUser = {
                id: 'admin_001',
                name: 'Administrador',
                email: email,
                role: 'admin',
                status: 'active',
                registrationDate: new Date().toISOString()
            };
            
            // Guardar admin en users si no existe
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const adminExists = users.some(u => u.email === email);
            
            if (!adminExists) {
                users.push(adminUser);
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            localStorage.setItem('currentUser', JSON.stringify(adminUser));
            window.location.href = 'admin.html';
            return;
        }
        
        // 2. Verificar usuarios normales
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password
        );
        
        if (user) {
            // Actualizar último login
            user.lastLogin = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(users));
            
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                name: user.fullname || `${user.firstname} ${user.lastname}`,
                email: user.email,
                role: user.role || 'user'
            }));
            
            window.location.href = 'index.html';
        } else {
            alert('Credenciales incorrectas. Por favor verifica tu email y contraseña.');
        }
    });
});