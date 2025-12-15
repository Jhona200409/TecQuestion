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
        const { email, password, role, controlNumber, accessCode } = req.body;

        // --- STUDENT LOGIN (Matricula + Class Code) ---
        if (role === 'student' || controlNumber) {
            console.log(`[Login] Student Attempt: ${controlNumber} with Code: ${accessCode}`);

            if (!controlNumber || !accessCode) {
                return res.status(400).json({ message: 'Matrícula y Clave de Salón son requeridos' });
            }

            // 1. Find Classroom
            const Classroom = require('../models/Classroom');
            const classroom = await Classroom.findOne({ accessCode });

            if (!classroom) {
                return res.status(404).json({ message: 'Clave de salón no encontrada.' });
            }

            // 2. Find User by Control Number first
            // Since classroom.students stores ObjectIds, we must resolve the control number to an ID first.
            let user = await User.findOne({ controlNumber });

            if (!user) {
                // If user doesn't exist in DB, they can't be validly enrolled in our new system
                // (Assuming addStudent logic guarantees User creation).
                return res.status(403).json({ message: 'Tu matrícula no está registrada en el sistema. Pide a tu profesor que te registre.' });
            }

            // 3. Check if student ID is in the classroom list
            // We cast to strings to ensure safe comparison between ObjectId objects and string representations
            const isEnrolled = classroom.students.some(studentId => studentId.toString() === user._id.toString());

            if (!isEnrolled) {
                return res.status(403).json({ message: 'Tu matrícula no está inscrita en este salón.' });
            }

            console.log(`[Login] Student Login Success: ${user.name}`);

            // 4. Return Token
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: 'student',
                controlNumber: user.controlNumber,
                token: generateToken(user._id)
            });
        }

        // --- TEACHER LOGIN (Email + Password) ---
        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son requeridos' });
        }

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                controlNumber: user.controlNumber,
                token: generateToken(user._id)
            });
        } else {
            return res.status(401).json({ message: 'Credenciales inválidas' });
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
