const Exam = require('../models/Exam');
const Attempt = require('../models/Attempt');

// @desc    Create a new exam
// @route   POST /api/exams
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
const getMyExams = async (req, res) => {
    try {
        const exams = await Exam.find({ creator: req.user._id }).sort({ createdAt: -1 });
        res.json(exams);
    } catch (error) {
        console.error("Error fetching exams:", error);
        res.status(500).json({ message: 'Error al obtener exámenes' });
    }
};

// @desc    Get all active exams for students
// @route   GET /api/exams/available
const getAvailableExams = async (req, res) => {
    try {
        const exams = await Exam.find({ 'settings.isActive': true })
            .populate('creator', 'name')
            .select('-questions.options.isCorrect')
            .sort({ createdAt: -1 });

        // If student, check attempts status for each exam
        if (req.user.role === 'student') {
            const examsWithStatus = await Promise.all(exams.map(async (exam) => {
                const attempt = await Attempt.findOne({ student: req.user._id, exam: exam._id });
                const examObj = exam.toObject();
                if (attempt) {
                    examObj.attemptStatus = attempt.status; // 'in-progress' or 'completed'
                    examObj.score = attempt.score;
                } else {
                    examObj.attemptStatus = 'not_started';
                }
                return examObj;
            }));
            return res.json(examsWithStatus);
        }

        res.json(exams);
    } catch (error) {
        console.error("Error fetching available exams:", error);
        res.status(500).json({ message: 'Error al obtener exámenes disponibles' });
    }
};

// @desc    Get single exam details & Update & Delete
// @route   GET /api/exams/:id
const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Examen no encontrado' });

        if (req.user.role === 'student' && exam.settings.isActive) {
            // Hide answers for students if taking the exam
            const examObj = exam.toObject();
            examObj.questions.forEach(q => {
                q.options.forEach(o => delete o.isCorrect);
            });
            return res.json(examObj);
        }

        // If teacher, return full (allow editing)
        res.json(exam);
    } catch (error) {
        console.error("Error fetching exam:", error);
        res.status(500).json({ message: 'Error al obtener el examen' });
    }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Teacher Only)
const updateExam = async (req, res) => {
    try {
        const { title, questions, settings } = req.body;
        const exam = await Exam.findById(req.params.id);

        if (!exam) return res.status(404).json({ message: 'Examen no encontrado' });

        if (exam.creator.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'No autorizado para editar este examen' });
        }

        exam.title = title || exam.title;
        exam.questions = questions || exam.questions;
        exam.settings = settings || exam.settings;

        const updatedExam = await exam.save();
        res.json(updatedExam);
    } catch (error) {
        console.error("Error updating exam:", error);
        res.status(500).json({ message: 'Error al actualizar el examen' });
    }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private (Teacher Only)
const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) return res.status(404).json({ message: 'Examen no encontrado' });

        if (exam.creator.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'No autorizado para eliminar este examen' });
        }

        await exam.deleteOne();
        res.json({ message: 'Examen eliminado' });
    } catch (error) {
        console.error("Error deleting exam:", error);
        res.status(500).json({ message: 'Error al eliminar el examen' });
    }
};

// @desc    Start or Resume an exam
// @route   POST /api/exams/:id/start
const startExam = async (req, res) => {
    try {
        const examId = req.params.id;
        const studentId = req.user._id;

        // Check if attempt exists
        let attempt = await Attempt.findOne({ student: studentId, exam: examId });

        if (!attempt) {
            // Create new attempt
            const exam = await Exam.findById(examId);
            if (!exam) return res.status(404).json({ message: 'Examen no encontrado' });

            attempt = await Attempt.create({
                student: studentId,
                exam: examId,
                status: 'in-progress',
                lastQuestionIndex: 0,
                answers: []
            });
        } else if (attempt.status === 'completed') {
            return res.status(400).json({ message: 'Este examen ya ha sido completado.', completed: true });
        }

        res.json(attempt);
    } catch (error) {
        console.error("Error starting exam:", error);
        res.status(500).json({ message: 'Error al iniciar el examen' });
    }
};

// @desc    Save progress (auto-save)
// @route   PUT /api/exams/:id/progress
const saveProgress = async (req, res) => {
    try {
        const { answers, lastQuestionIndex } = req.body;
        const examId = req.params.id;
        const studentId = req.user._id;

        const attempt = await Attempt.findOne({ student: studentId, exam: examId });

        if (!attempt) return res.status(404).json({ message: 'Intento no encontrado' });
        if (attempt.status === 'completed') return res.status(400).json({ message: 'El examen ya está finalizado' });

        attempt.answers = answers;
        attempt.lastQuestionIndex = lastQuestionIndex;
        await attempt.save();

        res.json({ message: 'Progreso guardado' });
    } catch (error) {
        console.error("Error saving progress:", error);
        res.status(500).json({ message: 'Error al guardar progreso' });
    }
};

// @desc    Submit an exam attempt
// @route   POST /api/exams/:id/submit
const submitExam = async (req, res) => {
    try {
        const { answers } = req.body;
        const examId = req.params.id;
        const studentId = req.user._id;

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: 'Examen no encontrado' });

        // Find existing attempt to update, or create if somehow missing (failsafe)
        let attempt = await Attempt.findOne({ student: studentId, exam: examId });
        if (!attempt) {
            attempt = new Attempt({ student: studentId, exam: examId });
        }

        if (attempt.status === 'completed') {
            return res.json(attempt); // Already done, idempotent
        }

        let totalScore = 0;
        let maxScore = 0;
        const processedAnswers = [];

        exam.questions.forEach(question => {
            const questionPoints = question.points || 10;
            maxScore += questionPoints;

            const studentAnswer = answers.find(a => a.questionId === question._id.toString());

            let isCorrect = false;
            let pointsAwarded = 0;

            if (studentAnswer) {
                const correctOption = question.options.find(opt => opt.isCorrect);
                if (correctOption && studentAnswer.selectedOptionText === correctOption.text) {
                    isCorrect = true;
                    pointsAwarded = questionPoints;
                }
            }

            totalScore += pointsAwarded;
            processedAnswers.push({
                questionId: question._id,
                selectedOptionText: studentAnswer ? studentAnswer.selectedOptionText : null,
                isCorrect,
                pointsAwarded
            });
        });

        attempt.score = totalScore;
        attempt.maxScore = maxScore;
        attempt.answers = processedAnswers;
        attempt.status = 'completed';

        await attempt.save();

        res.status(200).json(attempt);

    } catch (error) {
        console.error("Error submitting exam:", error);
        res.status(500).json({ message: 'Error al enviar el examen' });
    }
};

module.exports = {
    createExam,
    getMyExams,
    getAvailableExams,
    getExamById,
    updateExam,
    deleteExam,
    submitExam,
    startExam,
    saveProgress
};
