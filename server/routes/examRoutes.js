const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/examController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, teacherOnly, createExam);

router.route('/my-exams')
    .get(protect, teacherOnly, getMyExams);

router.route('/available')
    .get(protect, getAvailableExams);

router.route('/:id')
    .get(protect, getExamById)
    .put(protect, teacherOnly, updateExam)
    .delete(protect, teacherOnly, deleteExam);

router.route('/:id/submit')
    .post(protect, submitExam);

router.route('/:id/start')
    .post(protect, startExam);

router.route('/:id/progress')
    .put(protect, saveProgress);

router.route('/:id/assign')
    .put(protect, teacherOnly, assignExam);

router.route('/:id/check-answer')
    .post(protect, checkAnswer);

router.route('/:examId/results/:classroomId')
    .get(protect, teacherOnly, getExamResults);

module.exports = router;
