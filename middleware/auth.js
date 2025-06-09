const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Obtener el token del header
        const token = req.header('Authorization').replace('Bearer ', '');
        
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Buscar usuario con el ID del token y que tenga ese token
        const user = await User.findOne({ 
            _id: decoded.userId
        });

        if (!user) {
            throw new Error();
        }

        // Añadir usuario y token a la request
        req.token = token;
        req.user = user;
        req.userId = user._id;
        req.userType = user.user_type;
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Por favor autentícate' });
    }
};

module.exports = auth;