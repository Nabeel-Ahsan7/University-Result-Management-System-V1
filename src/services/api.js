import axios from 'axios';

const API_URL = 'http://localhost:4000/v1/api'; // Adjust this to your backend URL

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Enhanced debugging in the interceptor

api.interceptors.request.use(
    (config) => {
        let token;

        // CRITICAL DEBUG - add this to trace all API requests
        console.log('⚡ API REQUEST:', config.method.toUpperCase(), config.url);

        // Add this new condition FIRST for student routes
        if (config.url.startsWith('/student') ||
            localStorage.getItem('userRole') === 'student') {
            token = localStorage.getItem('studentToken');
            console.log('🔑 Using studentToken:', token ? 'Found' : 'MISSING');
        }
        else if (config.url.startsWith('/teacher') ||
            localStorage.getItem('userRole') === 'teacher') {
            token = localStorage.getItem('teacherToken');
            console.log('🔑 Using teacherToken:', token ? 'Found' : 'MISSING');
        }
        else if (config.url.startsWith('/external-teacher') ||
            localStorage.getItem('userRole') === 'external-teacher') {
            token = localStorage.getItem('externalTeacherToken');
            console.log('🔑 Using externalTeacherToken:', token ? 'Found' : 'MISSING');
        }
        else if (config.url.startsWith('/admin')) {
            token = localStorage.getItem('adminToken');
        }
        else {
            // Use userRole as a fallback to determine which token to use
            const userRole = localStorage.getItem('userRole');
            if (userRole === 'teacher') {
                token = localStorage.getItem('teacherToken');
            } else if (userRole === 'external-teacher') {
                token = localStorage.getItem('externalTeacherToken');
            } else {
                token = localStorage.getItem('token');
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Added auth header');
        } else {
            console.warn('⛔ NO TOKEN for request:', config.url);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Authentication services
const authService = {
    // Student authentication
    studentLogin: (credentials) => {
        return api.post('/student/login', {
            registration_number: credentials.registration_number,
            password: credentials.password
        });
    },

    // Teacher authentication
    teacherLogin: (credentials) => {
        return api.post('/teacher/login', {
            email: credentials.email,
            password: credentials.password
        });
    },

    // External teacher authentication
    externalTeacherLogin: (credentials) => {
        return api.post('/external-teacher/login', {
            email: credentials.email,
            password: credentials.password
        });
    },
};

// Student services
const studentService = {
    getProfile: () => api.get('/student/profile'),
    getCommittees: () => api.get('/student/committees'),
    getNotices: () => api.get('/student/notices'),
    getTranscript: (semesterIdPath = '') => api.get(`/student/transcript${semesterIdPath}`),
    getCourseInternalMarks: (courseAssignmentId) => api.get(`/student/marks/internal/${courseAssignmentId}`),
    getResults: () => api.get('/student/results')
};

// Teacher services
const teacherService = {
    getProfile: () => api.get('/teacher/profile'), // Make sure this includes '/teacher/'
    // FIX THIS METHOD!
    getAssignedExams: (type) => {
        const userRole = localStorage.getItem('userRole');

        // Make sure token exists before making the request
        const token = localStorage.getItem('teacherToken');
        if (!token) {
            console.error('No teacherToken found! Cannot fetch assigned exams');
            return Promise.reject(new Error('Authentication required'));
        }

        return api.get(`/teacher/assigned-exams?type=${type}`);
    },
    getAllAssignedExams: () => {
        // This fetches both internal and external assignments in parallel
        return Promise.all([
            api.get('/teacher/assigned-exams?type=internal'),
            api.get('/teacher/assigned-exams?type=external')
        ]);
    },
    getCommitteeNotices: (committeeIds) => {
        if (!committeeIds || committeeIds.length === 0) {
            return Promise.resolve({ data: { success: true, notices: [] } });
        }
        // Convert array to comma-separated string
        const committeeParam = committeeIds.join(',');
        return api.get(`/teacher/notices?committees=${committeeParam}`);
    },
    submitInternalMarks: (courseAssignmentId, marks) => api.post('/teacher/internal-marks', {
        courseAssignmentId,
        marks
    }),
    submitExternalMarks: (examId, markData) => api.post('/teacher/external-marks', {
        examId,
        marks: markData.mark,
        examinerType: markData.examinerType
    }),
    // Teacher service methods for committee management
    getCommittees: () => api.get('/teacher/committees'),
    getCommitteeMarks: (committeeId) => api.get(`/teacher/committee-marks/${committeeId}`),
    approveMarks: (data) => api.post('/teacher/approve-marks', data)
    // Other methods...
};

// External teacher services
const externalTeacherService = {
    getProfile: () => api.get('/external-teacher/profile'), // Make sure this includes '/external-teacher/'
    getAssignedExams: (type = 'external') => api.get(`/external-teacher/assigned-exams?type=${type}`),
    getAllAssignedExams: () => {
        // This fetches both internal and external assignments in parallel
        return Promise.all([
            api.get('/external-teacher/assigned-exams?type=internal'),
            api.get('/external-teacher/assigned-exams?type=external')
        ]);
    },
    getCommitteeNotices: (committeeIds) => {
        if (!committeeIds || committeeIds.length === 0) {
            return Promise.resolve({ data: { success: true, notices: [] } });
        }
        // Convert array to comma-separated string
        const committeeParam = committeeIds.join(',');
        return api.get(`/external-teacher/notices?committees=${committeeParam}`);
    },
    submitInternalMarks: (courseAssignmentId, marks) => api.post('/external-teacher/internal-marks', {
        courseAssignmentId,
        marks
    }),
    submitExternalMarks: (examId, markData) => api.post('/external-teacher/external-marks', {
        examId: examId,  // This is correct - matches controller
        mark: markData.mark
        // No need to send examinerType, controller determines it
    }),
    // External teacher service methods for committee management
    getCommittees: () => api.get('/external-teacher/committees'),
    getCommitteeMarks: (committeeId) => api.get(`/external-teacher/committee-marks/${committeeId}`)
};

// Admin services (keep existing admin functionality)
const adminService = {
    login: (credentials) => {
        return api.post('/admin/login', {
            email: credentials.email,
            password: credentials.password
        });
    },
    // Add this new method to fetch dashboard counts
    getDashboardCounts: () => api.get('/admin/dashboard/counts'),

    // Notice management endpoints
    getNotices: (committeeId = '') => {
        const url = committeeId
            ? `/admin/notice?exam_committee_id=${committeeId}`
            : '/admin/notice';
        return api.get(url);
    },
    getNoticeById: (id) => api.get(`/admin/notice/${id}`),
    createNotice: (noticeData) => {
        // For multipart form data (files + json)
        const formData = new FormData();

        // Add text fields
        formData.append('title', noticeData.title);
        formData.append('description', noticeData.description);
        formData.append('exam_committee_id', noticeData.exam_committee_id);

        // Add document files
        if (noticeData.documents && noticeData.documents.length) {
            noticeData.documents.forEach(file => {
                formData.append('documents', file);
            });
        }

        return api.post('/admin/notice', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    updateNotice: (id, noticeData) => {
        // For multipart form data (files + json)
        const formData = new FormData();

        // Add text fields
        if (noticeData.title) formData.append('title', noticeData.title);
        if (noticeData.description) formData.append('description', noticeData.description);
        if (noticeData.exam_committee_id) formData.append('exam_committee_id', noticeData.exam_committee_id);

        // Add document files
        if (noticeData.documents && noticeData.documents.length) {
            noticeData.documents.forEach(file => {
                formData.append('documents', file);
            });
        }

        return api.put(`/admin/notice/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    deleteNotice: (id) => api.delete(`/admin/notice/${id}`),
    deleteNoticeDocument: (noticeId, documentUrl) =>
        api.delete(`/admin/notice/${noticeId}/document`, { data: { documentUrl } }),

    // Exam Committee endpoints
    getExamCommittees: () => api.get('/admin/exam-committee'),

    // Add this method
    getApprovalStatus: (committeeId = '', semesterId = '') => {
        let url = '/admin/approval-status';
        const params = [];

        if (committeeId) params.push(`exam_committee_id=${committeeId}`);
        if (semesterId) params.push(`semester_id=${semesterId}`);

        if (params.length > 0) {
            url += `?${params.join('&')}`;
        }

        return api.get(url);
    },

    // Add these methods for the approval status monitoring
    getSemesters: () => api.get('/admin/semester'),

    // Add these methods to your adminService object

    // Results management endpoints
    getExams: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/admin/exams${queryString ? `?${queryString}` : ''}`);
    },

    getDetailedExams: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/admin/exams/detailed${queryString ? `?${queryString}` : ''}`);
    },

    getStudentResults: (studentId, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/admin/results/student/${studentId}${queryString ? `?${queryString}` : ''}`);
    },

    getSessionResults: (sessionId, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/admin/results/session/${sessionId}${queryString ? `?${queryString}` : ''}`);
    },

    getCommitteeResults: (committeeId, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/admin/results/committee/${committeeId}${queryString ? `?${queryString}` : ''}`);
    },

    getImprovementResults: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/admin/improvement-results${queryString ? `?${queryString}` : ''}`);
    },

    compareResults: (studentId, courseId) => {
        return api.get(`/admin/compare-results/${studentId}/${courseId}`);
    },

    getStudentAcademicRecord: (studentId) => {
        return api.get(`/admin/academic-record/${studentId}`);
    },

    // Reference data methods needed for results components
    getStudents: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/admin/student${queryString ? `?${queryString}` : ''}`);
    },

    getSemesters: () => api.get('/admin/semester'),

    getSessions: () => api.get('/admin/session'),

    getTeachers: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/admin/teacher${queryString ? `?${queryString}` : ''}`);
    },

    getExamCommittees: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/admin/exam-committee${queryString ? `?${queryString}` : ''}`);
    },

    getDepartments: () => api.get('/admin/department'),

    // Add this to your adminService object

    // Student search for transcript generation
    getStudentsByCommitteeAndSemester: (committeeId, semesterId) => {
        return api.get(`/admin/transcript-students?committee=${committeeId}&semester=${semesterId}`);
    },

    // Student transcript generation
    getStudentTranscript: (committeeId, semesterId, studentId) => {
        return api.get('/admin/student-transcript', {
            params: { committeeId, semesterId, studentId }
        });
    },
};

// Add these at the bottom of your file to help debug:

// Debug function to check token in localStorage
export const checkAuthToken = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

export {
    api as default,
    authService,
    studentService,
    teacherService,
    externalTeacherService,
    adminService
};