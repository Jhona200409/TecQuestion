const Classroom = require('../models/Classroom');
const User = require('../models/User'); // Might need to resolve student details if they exist

// @desc    Create a new classroom
// @route   POST /api/classrooms
// @access  Private (Teacher)
const createClassroom = async (req, res) => {
    try {
        const { name, accessCode } = req.body;

        if (!name || !accessCode) {
            return res.status(400).json({ message: 'Nombre y código de acceso son requeridos' });
        }

        const classroomExists = await Classroom.findOne({ accessCode });
        if (classroomExists) {
            return res.status(400).json({ message: 'Este código de acceso ya está en uso' });
        }

        const classroom = await Classroom.create({
            name,
            accessCode,
            teacher: req.user._id,
            students: []
        });

        res.status(201).json(classroom);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el salón' });
    }
};

// @desc    Get teacher's classrooms
// @route   GET /api/classrooms/my-classrooms
// @access  Private (Teacher)
const getMyClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find({ teacher: req.user._id })
            .populate('students', 'name controlNumber') // Populate for list view counts and details if cached
            .sort({ createdAt: -1 });
        res.json(classrooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener salones' });
    }
};

// @desc    Get single classroom details
// @route   GET /api/classrooms/:id
// @access  Private (Teacher)
// @desc    Get single classroom details
// @route   GET /api/classrooms/:id
// @access  Private (Teacher)
const getClassroomById = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id)
            .populate('students', 'name controlNumber email'); // Populate student details

        if (!classroom) return res.status(404).json({ message: 'Salón no encontrado' });

        if (classroom.teacher.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        res.json(classroom);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener salón' });
    }
};

// @desc    Add student (matricula) to classroom
// @route   POST /api/classrooms/:id/students
// @access  Private (Teacher)
const addStudent = async (req, res) => {
    try {
        const { studentMatricula, name } = req.body;
        const classroom = await Classroom.findById(req.params.id);

        if (!classroom) return res.status(404).json({ message: 'Salón no encontrado' });

        if (classroom.teacher.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        if (!studentMatricula) {
            return res.status(400).json({ message: 'Matrícula requerida' });
        }

        // Logic check: Find or Create User
        let user = await User.findOne({ controlNumber: studentMatricula });

        if (!user) {
            if (!name) return res.status(400).json({ message: 'El nombre es requerido para nuevos alumnos' });

            // Create user immediately (Pre-registration)
            const bcrypt = require('bcryptjs');
            user = await User.create({
                name,
                controlNumber: studentMatricula,
                role: 'student',
                password: await bcrypt.hash(studentMatricula, 10) // Default pw is matricula
            });
            console.log(`[Classroom] Created new student user: ${name} (${studentMatricula})`);
        }

        // Check if user ObjectId is already in array
        if (classroom.students.includes(user._id)) {
            return res.status(400).json({ message: 'El alumno ya está en este salón' });
        }

        classroom.students.push(user._id);
        await classroom.save();

        // Return updated classroom
        const updatedClassroom = await Classroom.findById(req.params.id).populate('students', 'name controlNumber');
        res.json(updatedClassroom);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al agregar alumno' });
    }
};

// @desc    Remove student (unenroll) from classroom
// @route   DELETE /api/classrooms/:id/students/:studentId
// @access  Private (Teacher)
const removeStudent = async (req, res) => {
    try {
        const { id, studentId } = req.params;

        const classroom = await Classroom.findById(id);

        if (!classroom) return res.status(404).json({ message: 'Salón no encontrado' });

        if (classroom.teacher.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        // Filter out by ID strings
        classroom.students = classroom.students.filter(s => s.toString() !== studentId);
        await classroom.save();

        res.json(classroom);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al remover alumno' });
    }
};

// @desc    Update student details (Name, Matricula)
// @route   PUT /api/classrooms/students/:studentId
// @access  Private (Teacher)
const updateStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { name, controlNumber } = req.body;

        // Find user
        const user = await User.findById(studentId);
        if (!user) return res.status(404).json({ message: 'Alumno no encontrado' });

        // Since this is a "student" update specific to classroom management, 
        // we might want to check if the requester is a teacher. 
        // Middleware already checks 'teacherOnly'.

        // Update fields
        user.name = name || user.name;
        user.controlNumber = controlNumber || user.controlNumber;

        // If controlNumber changed, we might want to update password if it matched the old matricula?
        // For now, let's just update the definition.

        await user.save();

        res.json({ message: 'Alumno actualizado', user });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'La matrícula ya está en uso por otro usuario.' });
        }
        res.status(500).json({ message: 'Error al actualizar alumno' });
    }
};

module.exports = {
    createClassroom,
    getMyClassrooms,
    getClassroomById,
    addStudent,
    removeStudent,
    updateStudent
};
