const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { protect } = require('../middleware/studentAuth');

// Authentication routes
router.post('/login', studentController.login);

// Protected routes (require authentication)
router.get('/profile', protect, studentController.getProfile);
router.get('/committees', protect, studentController.getStudentCommittees);
router.get('/notices', protect, studentController.getStudentNotices);
router.get('/transcript', protect, studentController.getStudentTranscript);
router.get('/transcript/:semesterId', protect, studentController.getStudentTranscript);
router.get('/marks/internal/:courseAssignmentId', protect, studentController.getCourseInternalMarks);

module.exports = router;