const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Hash de la contraseña
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
        
        // Crear token JWT
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

// Obtener perfil del usuario (protegido)
router.get('/me', async (req, res) => {
    try {
        // El middleware de autenticación añade req.user
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;