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
    saveProgress
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

module.exports = router;
