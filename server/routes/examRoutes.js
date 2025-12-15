const express = require('express');
const router = express.Router();
const { createExam, getMyExams } = require('../controllers/examController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, teacherOnly, createExam);

router.route('/my-exams')
    .get(protect, teacherOnly, getMyExams);

module.exports = router;
