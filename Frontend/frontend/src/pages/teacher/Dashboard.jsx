import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../../services/api';
import InternalMarkSection from '../../components/teacher/InternalMarkSection';
import ExternalMarkSection from '../../components/teacher/ExternalMarkSection';
import NoticeSection from '../../components/teacher/NoticeSection';
import CommitteeSection from '../../components/teacher/CommitteeSection';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('notices'); // Set notices tab as default

    // Fetch teacher profile data on component mount
    useEffect(() => {
        // Use teacherToken consistently
        const token = localStorage.getItem('teacherToken'); // CORRECT
        const userRole = localStorage.getItem('userRole');


        // For debugging - log first few characters of token


        if (!token || userRole !== 'teacher') {
            console.error('Authentication error - missing token or wrong role');
            setError('Authentication required. Please log in again.');
            setTimeout(() => navigate('/'), 2000);
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await teacherService.getProfile();
                setTeacher(response.data.teacher);
                // REMOVE THESE 3 LINES - they're overwriting your token incorrectly
                // localStorage.setItem('teacherToken', response.data.token);
                // localStorage.setItem('userRole', 'teacher');
                // localStorage.setItem('user', JSON.stringify(response.data.teacher));
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile. Please try again.');

                if (err.response?.status === 401) {
                    // FIX: Use teacherToken consistently
                    localStorage.removeItem('teacherToken'); // FIXED!
                    localStorage.removeItem('user');
                    localStorage.removeItem('userRole');
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('teacherToken'); // Instead of 'token'
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold" style={{ color: "#025c53" }}>
                                Teacher Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4 text-gray-600">
                                Welcome, {teacher?.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-md text-white"
                                style={{ backgroundColor: "#025c53" }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error ? (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-6">
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Teacher Profile Section */}
                        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h2 className="text-xl font-semibold" style={{ color: "#025c53" }}>
                                    Teacher Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Name</p>
                                        <p className="mt-1">{teacher?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p className="mt-1">{teacher?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Designation</p>
                                        <p className="mt-1">{teacher?.designation}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Department</p>
                                        <p className="mt-1">{teacher?.department_id?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Faculty</p>
                                        <p className="mt-1">{teacher?.department_id?.faculty_id?.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Tabs */}
                        <div className="mb-6">
                            <nav className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab('notices')}
                                    className={`px-4 py-3 text-sm font-medium ${activeTab === 'notices'
                                        ? 'border-b-2 text-green-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    style={{ borderColor: activeTab === 'notices' ? "#025c53" : "transparent", color: activeTab === 'notices' ? "#025c53" : "" }}
                                >
                                    Notices
                                </button>
                                <button
                                    onClick={() => setActiveTab('committee')}
                                    className={`px-4 py-3 text-sm font-medium ${activeTab === 'committee'
                                        ? 'border-b-2 text-green-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    style={{ borderColor: activeTab === 'committee' ? "#025c53" : "transparent", color: activeTab === 'committee' ? "#025c53" : "" }}
                                >
                                    Committee
                                </button>
                                <button
                                    onClick={() => setActiveTab('internal')}
                                    className={`px-4 py-3 text-sm font-medium ${activeTab === 'internal'
                                        ? 'border-b-2 text-green-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    style={{ borderColor: activeTab === 'internal' ? "#025c53" : "transparent", color: activeTab === 'internal' ? "#025c53" : "" }}
                                >
                                    Internal Marks
                                </button>
                                <button
                                    onClick={() => setActiveTab('external')}
                                    className={`px-4 py-3 text-sm font-medium ${activeTab === 'external'
                                        ? 'border-b-2 text-green-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    style={{ borderColor: activeTab === 'external' ? "#025c53" : "transparent", color: activeTab === 'external' ? "#025c53" : "" }}
                                >
                                    External Marks
                                </button>
                            </nav>
                        </div>

                        {/* Tab content */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            {activeTab === 'notices' && <NoticeSection />}
                            {activeTab === 'committee' && <CommitteeSection />}
                            {activeTab === 'internal' && <InternalMarkSection />}
                            {activeTab === 'external' && <ExternalMarkSection />}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default TeacherDashboard;