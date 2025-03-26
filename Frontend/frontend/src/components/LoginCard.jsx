import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Update the import to use authService
import { authService, teacherService } from '../services/api';

const LoginCard = () => {
    const navigate = useNavigate();
    const [activeRole, setActiveRole] = useState('teacher'); // Default to teacher login
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });

    const handleRoleChange = (role) => {
        setActiveRole(role);
        setError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let response;

            switch (activeRole) {
                case 'teacher':
                    // Use the correct service method
                    response = await authService.teacherLogin({
                        email: credentials.email,
                        password: credentials.password
                    });

                    // Update the login success handler
                    // When handling teacher login success:
                    if (response.data.success) {
                        // Change this line - save with the RIGHT name
                        localStorage.setItem('teacherToken', response.data.token); // Save response.data.token as 'teacherToken'
                        localStorage.setItem('userRole', 'teacher');
                        localStorage.setItem('user', JSON.stringify(response.data.teacher));

                        // Add after saving the token
                        localStorage.setItem('teacherToken', response.data.token);
                        localStorage.setItem('userRole', 'teacher');


                        // Then continue with navigation
                        navigate('/teacher/dashboard');
                    }
                    break;

                case 'admin':
                    // Handle admin login
                    // response = await adminService.login(credentials);
                    // ...
                    break;

                case 'student':
                    response = await authService.studentLogin({
                        registration_number: credentials.registration_number,
                        password: credentials.password
                    });

                    if (response.data.success) {
                        // Make sure token is stored properly - check the console log
                        console.log('Student login successful, token:', response.data.token);
                        localStorage.setItem('studentToken', response.data.token);
                        localStorage.setItem('userRole', 'student');
                        localStorage.setItem('user', JSON.stringify(response.data.student));
                        navigate('/student/dashboard');
                    } else {
                        setError(response.data.message || 'Login failed');
                    }
                    break;

                case 'external-teacher':
                    // Login as external teacher
                    response = await authService.externalTeacherLogin({
                        email: credentials.email,
                        password: credentials.password
                    });
                    if (response.data.success) {
                        localStorage.setItem('externalTeacherToken', response.data.token);
                        localStorage.setItem('userRole', 'external-teacher');
                        localStorage.setItem('user', JSON.stringify(response.data.externalTeacher));
                        navigate('/external-teacher/dashboard');
                    }
                    break;

                default:
                    setError('Invalid role selected');
                    break;
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: "#025c53" }}>Login</h2>

            {/* Role selection tabs */}
            <div className="flex mb-6 border-b border-gray-200">
                <button
                    onClick={() => handleRoleChange('student')}
                    className={`flex-1 py-2 px-4 text-center transition-colors ${activeRole === 'student'
                        ? 'border-b-2 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    style={{ borderColor: activeRole === 'student' ? "#025c53" : "transparent" }}
                >
                    Student
                </button>
                <button
                    onClick={() => handleRoleChange('teacher')}
                    className={`flex-1 py-2 px-4 text-center transition-colors ${activeRole === 'teacher'
                        ? 'border-b-2 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    style={{ borderColor: activeRole === 'teacher' ? "#025c53" : "transparent" }}
                >
                    Teacher
                </button>
                <button
                    onClick={() => handleRoleChange('external-teacher')}
                    className={`flex-1 py-2 px-4 text-center transition-colors ${activeRole === 'external-teacher'
                        ? 'border-b-2 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    style={{ borderColor: activeRole === 'external-teacher' ? "#025c53" : "transparent" }}
                >
                    External Teacher
                </button>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit}>
                {activeRole === 'student' ? (
                    <div className="mb-4">
                        <label htmlFor="registration_number" className="block mb-2 text-sm font-medium" style={{ color: "#025c53" }}>
                            Registration Number
                        </label>
                        <input
                            type="text"
                            id="registration_number"
                            name="registration_number"
                            value={credentials.registration_number}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                            style={{ focusRing: "rgba(2, 92, 83, 0.2)" }}
                            required
                        />
                    </div>
                ) : (
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium" style={{ color: "#025c53" }}>
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                            style={{ focusRing: "rgba(2, 92, 83, 0.2)" }}
                            required
                        />
                    </div>
                )}

                <div className="mb-6">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium" style={{ color: "#025c53" }}>
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                        style={{ focusRing: "rgba(2, 92, 83, 0.2)" }}
                        required
                    />
                </div>

                {error && (
                    <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-md font-medium transition-colors"
                    style={{
                        backgroundColor: "#025c53",
                        color: "white",
                        opacity: loading ? 0.7 : 1
                    }}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default LoginCard;