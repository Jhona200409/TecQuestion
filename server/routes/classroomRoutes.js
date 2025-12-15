const express = require('express');
const router = express.Router();
const {
    createClassroom,
    getMyClassrooms,
    getClassroomById,
    addStudent,
    removeStudent,
    updateStudent
} = require('../controllers/classroomController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, teacherOnly, createClassroom);

router.route('/my-classrooms')
    .get(protect, teacherOnly, getMyClassrooms);

router.route('/:id')
    .get(protect, teacherOnly, getClassroomById);

router.route('/:id/students')
    .post(protect, teacherOnly, addStudent);

router.route('/:id/students/:studentId')
    .delete(protect, teacherOnly, removeStudent);

router.route('/students/:studentId')
    .put(protect, teacherOnly, updateStudent);

module.exports = router;
