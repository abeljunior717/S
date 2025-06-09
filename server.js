require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Para permitir conexiones desde el frontend

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors()); // Habilita CORS para todas las rutas

// Configuración
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_mejorada';
const PORT = process.env.PORT || 3000;

// Datos temporales (en producción usar MongoDB)
let users = [
    {
        id: 1,
        name: 'Admin',
        email: 'admin@joyeria.com',
        password: bcrypt.hashSync('admin123', 10),
        address: 'Av. Principal 123',
        phone: '1234567890',
        user_type: 0, // 0 = admin
        created_at: new Date()
    }
];

let products = [
    {
        id: 1,
        name: 'Anillo de Oro',
        description: 'Anillo de oro de 18k con diseño clásico',
        price: 1500,
        category: 'joyas',
        stock: 15,
        is_active: true
    },
    // Más productos...
];

// Middleware de autenticación mejorado
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) return res.status(401).json({ message: 'Acceso no autorizado' });
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = users.find(u => u.id === decoded.id);
        
        if (!req.user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }
        
        next();
    } catch (error) {
        res.status(403).json({ message: 'Token inválido o expirado' });
    }
}

// Middleware para verificar si es admin
function isAdmin(req, res, next) {
    if (req.user.user_type !== 0) {
        return res.status(403).json({ message: 'Requiere privilegios de administrador' });
    }
    next();
}

// Rutas de autenticación
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Validación básica
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }
    
    const user = users.find(u => u.email === email);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    
    const token = jwt.sign(
        { id: user.id, user_type: user.user_type },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
    
    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            phone: user.phone,
            user_type: user.user_type
        }
    });
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, password, confirm_password, address, phone } = req.body;
    
    // Validaciones
    if (!name || !email || !password || !address || !phone) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    if (password !== confirm_password) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }
    
    if (users.some(u => u.email === email)) {
        return res.status(400).json({ message: 'El email ya está registrado' });
    }
    
    // Crear nuevo usuario (siempre como cliente)
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password: bcrypt.hashSync(password, 10),
        address,
        phone,
        user_type: 1, // 1 = cliente
        created_at: new Date()
    };
    
    users.push(newUser);
    
    // Crear token JWT
    const token = jwt.sign(
        { id: newUser.id, user_type: newUser.user_type },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
    
    res.status(201).json({
        token,
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            address: newUser.address,
            phone: newUser.phone,
            user_type: newUser.user_type
        }
    });
});

// Rutas de perfil de usuario
app.get('/api/users/me', authenticate, (req, res) => {
    const { password, ...userData } = req.user;
    res.json(userData);
});

app.put('/api/users/me', authenticate, (req, res) => {
    const { name, address, phone } = req.body;
    
    // Validaciones
    if (!name || !address || !phone) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    // Actualizar datos (excepto email y tipo de usuario)
    req.user.name = name;
    req.user.address = address;
    req.user.phone = phone;
    
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        address: req.user.address,
        phone: req.user.phone,
        user_type: req.user.user_type
    });
});

app.post('/api/users/change-password', authenticate, (req, res) => {
    const { current_password, new_password, confirm_password } = req.body;
    
    // Validaciones
    if (!current_password || !new_password || !confirm_password) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    if (new_password !== confirm_password) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }
    
    if (!bcrypt.compareSync(current_password, req.user.password)) {
        return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }
    
    // Actualizar contraseña
    req.user.password = bcrypt.hashSync(new_password, 10);
    
    res.json({ message: 'Contraseña actualizada correctamente' });
});

// Rutas de productos
app.get('/api/products', (req, res) => {
    res.json(products.filter(p => p.is_active));
});

// Ruta para obtener información del usuario actual (para el header)
app.get('/api/auth/current', authenticate, (req, res) => {
    const { password, ...userData } = req.user;
    res.json(userData);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});