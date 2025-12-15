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
        // If student, first find which classrooms they belong to
        if (req.user.role === 'student') {
            const Classroom = require('../models/Classroom');

            // Find classrooms where student is enrolled
            const studentClassrooms = await Classroom.find({ students: req.user._id });
            const classroomIds = studentClassrooms.map(c => c._id);

            // Get exams assigned to those classrooms
            const exams = await Exam.find({
                'settings.isActive': true,
                assignedClassrooms: { $in: classroomIds }
            })
                .populate('creator', 'name')
                .select('-questions.options.isCorrect')
                .sort({ createdAt: -1 });

            // Add attempt status for each exam
            const examsWithStatus = await Promise.all(exams.map(async (exam) => {
                const attempt = await Attempt.findOne({ student: req.user._id, exam: exam._id });
                const examObj = exam.toObject();
                if (attempt) {
                    examObj.attemptStatus = attempt.status;
                    examObj.score = attempt.score;
                } else {
                    examObj.attemptStatus = 'not_started';
                }
                return examObj;
            }));
            return res.json(examsWithStatus);
        }

        // For teachers, return all active exams (they see their own via my-exams)
        const exams = await Exam.find({ 'settings.isActive': true })
            .populate('creator', 'name')
            .select('-questions.options.isCorrect')
            .sort({ createdAt: -1 });

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

// @desc    Assign exam to classrooms
// @route   PUT /api/exams/:id/assign
const assignExam = async (req, res) => {
    try {
        const { classroomIds } = req.body;
        const examId = req.params.id;

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: 'Examen no encontrado' });

        // Verify ownership
        if (exam.creator.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        // Update assigned classrooms
        exam.assignedClassrooms = classroomIds || [];
        await exam.save();

        res.json({ message: 'Examen asignado correctamente', exam });
    } catch (error) {
        console.error("Error assigning exam:", error);
        res.status(500).json({ message: 'Error al asignar examen' });
    }
};

// @desc    Get exam results for a classroom
// @route   GET /api/exams/:examId/results/:classroomId
const getExamResults = async (req, res) => {
    try {
        const { examId, classroomId } = req.params;
        const Classroom = require('../models/Classroom');
        const User = require('../models/User');

        // Get exam
        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: 'Examen no encontrado' });

        // Verify ownership
        if (exam.creator.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        // Get classroom with students
        const classroom = await Classroom.findById(classroomId).populate('students', 'name controlNumber');
        if (!classroom) return res.status(404).json({ message: 'Salón no encontrado' });

        // Get all attempts for this exam
        const attempts = await Attempt.find({ exam: examId });

        // Build results array
        const results = classroom.students.map(student => {
            const attempt = attempts.find(a => a.student.toString() === student._id.toString());

            return {
                studentId: student._id,
                studentName: student.name,
                controlNumber: student.controlNumber,
                status: attempt ? attempt.status : 'not_started',
                score: attempt ? attempt.score : 0,
                maxScore: attempt ? attempt.maxScore : exam.questions.length * 10,
                correctAnswers: attempt ? attempt.answers.filter(a => a.isCorrect).length : 0,
                totalQuestions: exam.questions.length,
                percentage: attempt && attempt.maxScore > 0
                    ? Math.round((attempt.score / attempt.maxScore) * 100)
                    : 0,
                completedAt: attempt?.updatedAt || null
            };
        });

        res.json({
            exam: { _id: exam._id, title: exam.title },
            classroom: { _id: classroom._id, name: classroom.name },
            results,
            summary: {
                totalStudents: results.length,
                completed: results.filter(r => r.status === 'completed').length,
                inProgress: results.filter(r => r.status === 'in-progress').length,
                notStarted: results.filter(r => r.status === 'not_started').length,
                averageScore: results.filter(r => r.status === 'completed').length > 0
                    ? Math.round(results.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.percentage, 0) / results.filter(r => r.status === 'completed').length)
                    : 0
            }
        });
    } catch (error) {
        console.error("Error fetching exam results:", error);
        res.status(500).json({ message: 'Error al obtener resultados' });
    }
};

// @desc    Check a single answer and return if correct + correct answer
// @route   POST /api/exams/:id/check-answer
const checkAnswer = async (req, res) => {
    try {
        const { questionId, selectedOptionText } = req.body;
        const examId = req.params.id;

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: 'Examen no encontrado' });

        const question = exam.questions.find(q => q._id.toString() === questionId);
        if (!question) return res.status(404).json({ message: 'Pregunta no encontrada' });

        const correctOption = question.options.find(opt => opt.isCorrect);
        const isCorrect = correctOption && selectedOptionText === correctOption.text;

        res.json({
            isCorrect,
            correctAnswer: correctOption?.text || null,
            selectedAnswer: selectedOptionText
        });
    } catch (error) {
        console.error("Error checking answer:", error);
        res.status(500).json({ message: 'Error al verificar respuesta' });
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
    saveProgress,
    assignExam,
    getExamResults,
    checkAnswer
};
