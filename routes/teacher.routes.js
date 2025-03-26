const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');
const teacherAuth = require('../middleware/teacherAuth');
const examinerAuth = require('../middleware/examinerAuth.js');
// Public routes
// POST /v1/api/teacher/login - Login as teacher
router.post('/login', teacherController.loginTeacher);

// Protected routes
// GET /v1/api/teacher/profile - Get teacher profile
router.get('/profile', teacherAuth, teacherController.getProfile);

// Protected routes - require teacher authentication
router.get('/assigned-exams', examinerAuth, teacherController.getAssignedExams);
router.post('/internal-marks', examinerAuth, teacherController.submitInternalMarks);
router.post('/external-marks', examinerAuth, teacherController.submitExternalMarks);
// Update route to use controller function
router.get('/notices', teacherAuth, teacherController.getTeacherNotices);

// Teacher routes

// Get committees where teacher is involved
router.get('/committees', teacherAuth, teacherController.getTeacherCommittees);

// Get marks for a specific committee
router.get('/committee-marks/:committeeId', teacherAuth, teacherController.getCommitteeMarks);

// Approve marks (internal or external)
router.post('/approve-marks', teacherAuth, teacherController.approveMarks);

module.exports = router;