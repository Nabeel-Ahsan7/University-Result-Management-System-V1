const express = require('express');
const router = express.Router();
const externalTeacherController = require('../controllers/externalTeacher.controller');
const externalTeacherAuth = require('../middleware/externalTeacherAuth');
const examinerAuth = require('../middleware/examinerAuth.js');

// Public routes
// POST /v1/api/external-teacher/login - Login as external teacher
router.post('/login', externalTeacherController.loginExternalTeacher);

// Protected routes
// GET /v1/api/external-teacher/profile - Get external teacher profile
router.get('/profile', externalTeacherAuth, externalTeacherController.getProfile);

// Get notices for committees
router.get('/notices', externalTeacherAuth, externalTeacherController.getExternalTeacherNotices);

// Protected routes using examinerAuth
router.get('/assigned-exams', examinerAuth, externalTeacherController.getAssignedExams);
router.post('/internal-marks', examinerAuth, externalTeacherController.submitInternalMarks);
router.post('/external-marks', examinerAuth, externalTeacherController.submitExternalMarks);

// External teacher routes

// Get committees where external teacher is involved
router.get('/committees', externalTeacherAuth, externalTeacherController.getExternalTeacherCommittees);

// Get marks for a specific committee
router.get('/committee-marks/:committeeId', externalTeacherAuth, externalTeacherController.getCommitteeMarks);

module.exports = router;