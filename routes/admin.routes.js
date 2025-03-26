const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/uploadMiddleware');
const noticeController = require('../controllers/notice.controller');

// Public routes
// POST /v1/api/admin/register - Register a new admin
router.post('/register', adminController.registerAdmin);

// POST /v1/api/admin/login - Login an admin
router.post('/login', adminController.loginAdmin);

// Protected routes (require admin authentication)
// Admin management
// GET /v1/api/admin - Get all admins
router.get('/', adminAuth, adminController.getAllAdmins);

// DELETE /v1/api/admin/:id - Delete an admin by ID
router.delete('/:id', adminAuth, adminController.deleteAdmin);

// Faculty management routes (all protected with adminAuth)
// POST /v1/api/admin/faculty - Add a new faculty
router.post('/faculty', adminAuth, adminController.addFaculty);

// GET /v1/api/admin/faculty - Get all faculties
router.get('/faculty', adminAuth, adminController.getAllFaculties);

// GET /v1/api/admin/faculty/:id - Get a specific faculty
router.get('/faculty/:id', adminAuth, adminController.getFaculty);

// PUT /v1/api/admin/faculty/:id - Update a faculty
router.put('/faculty/:id', adminAuth, adminController.updateFaculty);

// DELETE /v1/api/admin/faculty/:id - Delete a faculty by ID
router.delete('/faculty/:id', adminAuth, adminController.deleteFaculty);

// Department management routes (all protected with adminAuth)
// POST /v1/api/admin/department - Add a new department
router.post('/department', adminAuth, adminController.addDepartment);

// GET /v1/api/admin/department - Get all departments (can filter by faculty_id via query param)
router.get('/department', adminAuth, adminController.getAllDepartments);

// GET /v1/api/admin/department/:id - Get a specific department
router.get('/department/:id', adminAuth, adminController.getDepartment);

// PUT /v1/api/admin/department/:id - Update a department
router.put('/department/:id', adminAuth, adminController.updateDepartment);

// DELETE /v1/api/admin/department/:id - Delete a department
router.delete('/department/:id', adminAuth, adminController.deleteDepartment);

// Course management routes (all protected with adminAuth)
// POST /v1/api/admin/course - Add a new course
router.post('/course', adminAuth, adminController.addCourse);

// GET /v1/api/admin/course - Get all courses (can filter by department_id via query param)
router.get('/course', adminAuth, adminController.getAllCourses);

// GET /v1/api/admin/course/:id - Get a specific course
router.get('/course/:id', adminAuth, adminController.getCourse);

// PUT /v1/api/admin/course/:id - Update a course
router.put('/course/:id', adminAuth, adminController.updateCourse);

// DELETE /v1/api/admin/course/:id - Delete a course
router.delete('/course/:id', adminAuth, adminController.deleteCourse);

// Course Assignment Routes
router.post('/course-assignment', adminAuth, adminController.addCourseAssignment);
router.get('/course-assignment', adminAuth, adminController.getAllCourseAssignments);
router.get('/course-assignment/:id', adminAuth, adminController.getCourseAssignment);
router.put('/course-assignment/:id', adminAuth, adminController.updateCourseAssignment);
router.delete('/course-assignment/:id', adminAuth, adminController.deleteCourseAssignment);

// Session management routes (all protected with adminAuth)
// POST /v1/api/admin/session - Add a new session
router.post('/session', adminAuth, adminController.addSession);

// GET /v1/api/admin/session - Get all sessions
router.get('/session', adminAuth, adminController.getAllSessions);

// GET /v1/api/admin/session/:id - Get a specific session
router.get('/session/:id', adminAuth, adminController.getSession);

// PUT /v1/api/admin/session/:id - Update a session
router.put('/session/:id', adminAuth, adminController.updateSession);

// DELETE /v1/api/admin/session/:id - Delete a session
router.delete('/session/:id', adminAuth, adminController.deleteSession);

// Semester management routes (all protected with adminAuth)
// POST /v1/api/admin/semester - Add a new semester
router.post('/semester', adminAuth, adminController.addSemester);

// GET /v1/api/admin/semester - Get all semesters
router.get('/semester', adminAuth, adminController.getAllSemesters);

// GET /v1/api/admin/semester/:id - Get a specific semester
router.get('/semester/:id', adminAuth, adminController.getSemester);

// PUT /v1/api/admin/semester/:id - Update a semester
router.put('/semester/:id', adminAuth, adminController.updateSemester);

// DELETE /v1/api/admin/semester/:id - Delete a semester
router.delete('/semester/:id', adminAuth, adminController.deleteSemester);

// Teacher management routes (all protected with adminAuth)
// POST /v1/api/admin/teacher - Add a new teacher
router.post('/teacher', adminAuth, adminController.addTeacher);

// GET /v1/api/admin/teacher - Get all teachers (can filter by department_id via query param)
router.get('/teacher', adminAuth, adminController.getAllTeachers);

// GET /v1/api/admin/teacher/:id - Get a specific teacher
router.get('/teacher/:id', adminAuth, adminController.getTeacher);

// PUT /v1/api/admin/teacher/:id - Update a teacher
router.put('/teacher/:id', adminAuth, adminController.updateTeacher);

// DELETE /v1/api/admin/teacher/:id - Delete a teacher
router.delete('/teacher/:id', adminAuth, adminController.deleteTeacher);

// Add these routes to your existing admin.routes.js

// Student management routes (all protected with adminAuth)
// POST /v1/api/admin/student - Add a new student
router.post('/student', adminAuth, adminController.addStudent);

// GET /v1/api/admin/student - Get all students (can filter by department_id, current_session_id, type via query params)
router.get('/student', adminAuth, adminController.getAllStudents);

// // GET /v1/api/admin/student/:id - Get a specific student
// router.get('/student/:id', adminAuth, adminController.getStudent);

// PUT /v1/api/admin/student/:id - Update a student
router.put('/student/:id', adminAuth, adminController.updateStudent);

// DELETE /v1/api/admin/student/:id - Delete a student
router.delete('/student/:id', adminAuth, adminController.deleteStudent);

// GET /v1/api/admin/student/search - Search students by name, registration number, or roll number
router.get('/student/search', adminAuth, adminController.searchStudents);

// External Teacher management routes (all protected with adminAuth)
// POST /v1/api/admin/external-teacher - Add a new external teacher
router.post('/external-teacher', adminAuth, adminController.addExternalTeacher);

// GET /v1/api/admin/external-teacher - Get all external teachers
router.get('/external-teacher', adminAuth, adminController.getAllExternalTeachers);

// GET /v1/api/admin/external-teacher/:id - Get a specific external teacher
router.get('/external-teacher/:id', adminAuth, adminController.getExternalTeacher);

// PUT /v1/api/admin/external-teacher/:id - Update an external teacher
router.put('/external-teacher/:id', adminAuth, adminController.updateExternalTeacher);

// DELETE /v1/api/admin/external-teacher/:id - Delete an external teacher
router.delete('/external-teacher/:id', adminAuth, adminController.deleteExternalTeacher);

// Exam Committee Routes
router.post('/exam-committee', adminAuth, adminController.addExamCommittee);
router.get('/exam-committee', adminAuth, adminController.getAllExamCommittees);
router.get('/exam-committee/:id', adminAuth, adminController.getExamCommittee);
router.put('/exam-committee/:id', adminAuth, adminController.updateExamCommittee);
router.delete('/exam-committee/:id', adminAuth, adminController.deleteExamCommittee);

// Improvement Exam Routes
router.post('/improvement-exam', adminAuth, adminController.addImprovementExam);
router.get('/improvement-exam', adminAuth, adminController.getImprovementExams);
router.delete('/improvement-exam/:id', adminAuth, adminController.deleteImprovementExam);

// Route for comprehensive exam data
router.get('/comprehensive-exam-data', adminAuth, adminController.getComprehensiveExamData);

// Dashboard count route
router.get('/dashboard/counts', adminAuth, adminController.getDashboardCounts);

// Notice Routes - all protected with adminAuth
// POST /v1/api/admin/notice - Create a new notice
router.post('/notice', adminAuth, upload.array('documents', 5), noticeController.createNotice);

// GET /v1/api/admin/notice - Get all notices (with optional filtering)
router.get('/notice', adminAuth, noticeController.getAllNotices);

// GET /v1/api/admin/notice/:id - Get a specific notice
router.get('/notice/:id', adminAuth, noticeController.getNoticeById);

// PUT /v1/api/admin/notice/:id - Update a notice
router.put('/notice/:id', adminAuth, upload.array('documents', 5), noticeController.updateNotice);

// DELETE /v1/api/admin/notice/:id - Delete a notice
router.delete('/notice/:id', adminAuth, noticeController.deleteNotice);

// DELETE /v1/api/admin/notice/:id/document - Delete a specific document from a notice
router.delete('/notice/:id/document', adminAuth, noticeController.deleteDocument);

// Add these routes to your admin.routes.js file

// Get approval statuses
router.get('/approval-status', adminAuth, adminController.getApprovalStatus);
// Get exams with filtering options
router.get('/exams', adminAuth, adminController.getExams);

// Get detailed exam data for specific student/semester/committee
// router.get('/exams/detailed', adminAuth, adminController.getDetailedExams);

// Get all results for a specific student
router.get('/results/student/:studentId', adminAuth, adminController.getStudentResults);

// Get results for a specific session/semester combination
router.get('/results/session/:sessionId', adminAuth, adminController.getSessionResults);

// Get results for a specific exam committee
router.get('/results/committee/:committeeId', adminAuth, adminController.getCommitteeResults);

// Get improvement exams with details
router.get('/improvement-results', adminAuth, adminController.getImprovementResults);

// Compare original and improvement results
router.get('/compare-results/:studentId/:courseId', adminAuth, adminController.compareResults);

// Get complete academic record for a student
router.get('/academic-record/:studentId', adminAuth, adminController.getStudentAcademicRecord);

// GET /v1/api/admin/student-detailed-results - Get detailed academic results for a student
router.get('/student-detailed-results', adminAuth, adminController.getStudentDetailedResults);

router.get('/student-transcript', adminAuth, adminController.getStudentTranscript);

// GET students by committee and semester for transcript generation
// Add this new route before module.exports:
router.get('/transcript-students', adminAuth, adminController.getStudentsForTranscript);

module.exports = router;