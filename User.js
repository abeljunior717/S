const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware de autenticación
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Acceso no autorizado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Acceso no autorizado' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Acceso no autorizado' });
    }
};

// Middleware de administrador
const isAdmin = (req, res, next) => {
    if (req.user.user_type !== 2) { // 2 = admin
        return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador' });
    }
    next();
};

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            address: req.body.address,
            phone: req.body.phone,
            user_type: req.body.user_type || 1 // Por defecto cliente
        });

        await user.save();
        
        const token = jwt.sign(
            { userId: user._id, userType: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({ 
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                user_type: user.user_type
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
        
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
        
        const token = jwt.sign(
            { userId: user._id, userType: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ 
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                user_type: user.user_type
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener perfil del usuario
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener todos los usuarios (solo admin)
router.get('/', authenticate, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        
        let query = {};
        if (req.query.search) {
            query = {
                $or: [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { email: { $regex: req.query.search, $options: 'i' } }
                ]
            };
        }
        
        const users = await User.find(query)
            .select('-password')
            .skip(skip)
            .limit(limit);
            
        const totalUsers = await User.countDocuments(query);
        
        res.json({
            users,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener un usuario por ID (solo admin)
router.get('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar usuario (solo admin)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const { password, ...updateData } = req.body;
        
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');
        
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Eliminar usuario (solo admin)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;