const Exam = require('../models/Exam');

// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private (Teachers only)
const createExam = async (req, res) => {
    try {
        const { title, questions, settings } = req.body;

        if (!title || !questions || questions.length === 0) {
            return res.status(400).json({ message: 'El título y al menos una pregunta son requeridos.' });
        }

        const exam = await Exam.create({
            title,
            questions,
            settings: settings || {},
            creator: req.user._id
        });

        res.status(201).json(exam);
    } catch (error) {
        console.error("Error creating exam:", error);
        res.status(500).json({ message: 'Error al crear el examen' });
    }
};

// @desc    Get exams created by logged in teacher
// @route   GET /api/exams/my-exams
// @access  Private (Teachers only)
const getMyExams = async (req, res) => {
    try {
        const exams = await Exam.find({ creator: req.user._id }).sort({ createdAt: -1 });
        res.json(exams);
    } catch (error) {
        console.error("Error fetching exams:", error);
        res.status(500).json({ message: 'Error al obtener exámenes' });
    }
};

module.exports = {
    createExam,
    getMyExams
};
