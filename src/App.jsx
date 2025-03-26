import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import LandingPage from '@/pages/LandingPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import StudentDashboard from './pages/student/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import ExternalTeacherDashboard from './pages/externalTeacher/Dashboard';
import axios from 'axios';

// Admin Dashboard
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminHome from '@/pages/admin/Home';

// Academic Setup pages
import FacultyManagement from '@/pages/admin/academic/Faculties';
import DepartmentManagement from '@/pages/admin/academic/Departments';
import SessionManagement from '@/pages/admin/academic/Sessions';
import SemesterManagement from '@/pages/admin/academic/Semesters';
import CourseManagement from '@/pages/admin/academic/Courses';

// User Management pages
import StudentManagement from '@/pages/admin/users/Students';
import TeacherManagement from '@/pages/admin/users/Teachers';
import ExternalTeacherManagement from '@/pages/admin/users/ExternalTeachers';

// Examination pages
import ExamCommitteeManagement from '@/pages/admin/examination/ExamCommittees';
import CourseAssignmentManagement from '@/pages/admin/examination/CourseAssignments';
import MonitorExamManagement from '@/pages/admin/examination/MonitorExams';
import ImprovementExamManagement from '@/pages/admin/examination/ImprovementExams';
import ApprovalStatusPage from '../src/components/admin/examination/ApprovalStatusMonitor';
import ResultManagement from '@/pages/admin/examination/Results';
import TranscriptGeneratorPage from '@/pages/admin/examination/TranscriptGenerator';

import DeveloperInfoPage from './pages/DeveloperInfoPage.jsx';

// Set up axios defaults
axios.defaults.baseURL = 'http://localhost:4000'; // Adjust to your backend URL

// Updated ProtectedRoute to use role-specific tokens
const ProtectedRoute = ({ element, allowedRole }) => {
    // Get the appropriate token based on user role
    let token;
    const userRole = localStorage.getItem('userRole');

    if (userRole === 'teacher') {
        token = localStorage.getItem('teacherToken');
    } else if (userRole === 'external-teacher') {
        token = localStorage.getItem('externalTeacherToken');
    } else if (userRole === 'student') {
        token = localStorage.getItem('studentToken');
    } else if (userRole === 'admin') {
        token = localStorage.getItem('adminToken');
    } else {
        token = localStorage.getItem('token');
    }

    // Check for authentication
    if (!token || userRole !== allowedRole) {
        console.log('Authentication failed, redirecting to home');
        return <Navigate to="/" replace />;
    }

    return element;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />

                    {/* Admin Dashboard Routes */}
                    <Route path="/admin" element={<AdminDashboard />}>
                        <Route index element={<AdminHome />} />
                        {/* Academic Setup Routes */}
                        <Route path="faculties" element={<FacultyManagement />} />
                        <Route path="departments" element={<DepartmentManagement />} />
                        <Route path="sessions" element={<SessionManagement />} />
                        <Route path="semesters" element={<SemesterManagement />} />
                        <Route path="courses" element={<CourseManagement />} />

                        {/* User Management Routes */}
                        <Route path="students" element={<StudentManagement />} />
                        <Route path="teachers" element={<TeacherManagement />} />
                        <Route path="external-teachers" element={<ExternalTeacherManagement />} />

                        {/* Examination Routes */}
                        <Route path="exam-committees" element={<ExamCommitteeManagement />} />
                        <Route path="course-assignments" element={<CourseAssignmentManagement />} />
                        <Route path="monitor-exams" element={<MonitorExamManagement />} />
                        <Route path="improvement-exams" element={<ImprovementExamManagement />} />
                        <Route path="approval-status" element={<ApprovalStatusPage />} />
                        <Route path="results" element={<ResultManagement />} />
                        <Route path="transcripts" element={<TranscriptGeneratorPage />} />
                    </Route>

                    <Route
                        path="/student/dashboard"
                        element={<ProtectedRoute element={<StudentDashboard />} allowedRole="student" />}
                    />

                    <Route
                        path="/teacher/dashboard"
                        element={<ProtectedRoute element={<TeacherDashboard />} allowedRole="teacher" />}
                    />

                    <Route
                        path="/external-teacher/dashboard"
                        element={<ProtectedRoute element={<ExternalTeacherDashboard />} allowedRole="external-teacher" />}
                    />
                    <Route path="/developers" element={<DeveloperInfoPage />} />
                    {/* Redirect to landing page for any undefined routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;