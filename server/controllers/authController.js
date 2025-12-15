const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret_fallback_123', {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, controlNumber, accessCode, avatar } = req.body;

        if (!name || !role) {
            return res.status(400).json({ message: 'Nombre y Rol son requeridos' });
        }

        let user;

        if (role === 'teacher') {
            // Teacher Validation
            if (!email || !password) {
                return res.status(400).json({ message: 'Email y Contraseña requeridos para profesores' });
            }
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'El correo ya está registrado' });
            }
            // Create Teacher
            user = await User.create({
                name,
                email,
                password,
                role: 'teacher',
                avatar
            });

        } else if (role === 'student') {
            // Students cannot self-register publicly anymore.
            return res.status(403).json({ message: 'Los estudiantes deben ser registrados por un profesor.' });
        } else {
            return res.status(400).json({ message: 'Rol inválido' });
        }

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                controlNumber: user.controlNumber,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Datos de usuario inválidos' });
        }

    } catch (error) {
        console.error("Error en registro:", error.message);
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, controlNumber, password, accessCode } = req.body;

        let user;
        let isMatch = false;

        // Try to identify user
        if (email) {
            console.log("Attempting login for teacher:", email);
            // Assume Teacher
            user = await User.findOne({ email });
            if (!user) console.log("User not found by email");

            if (user && (await user.matchPassword(password))) {
                isMatch = true;
                console.log("Password matched for teacher");
            } else if (user) {
                console.log("Password mismathed for teacher");
            }
        } else if (controlNumber) {
            // Assume Student
            console.log("Attempting login for student:", controlNumber);
            user = await User.findOne({ controlNumber });
            const enteredCode = accessCode || password;

            if (enteredCode === process.env.STUDENT_ACCESS_CODE) {
                isMatch = true;
            } else if (user && (await user.matchPassword(enteredCode))) {
                isMatch = true;
            }
        }

        if (user && isMatch) {
            console.log("Login successful");
            res.json({
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    role: user.role,
                    name: user.name,
                    email: user.email,
                    controlNumber: user.controlNumber
                }
            });
        } else {
            console.log("Login failed: Invalid credentials");
            res.status(401).json({ message: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
