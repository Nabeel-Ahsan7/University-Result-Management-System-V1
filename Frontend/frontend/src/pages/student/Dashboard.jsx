import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import StudentProfile from '../../components/student/StudentProfile';
import CommitteesSection from '../../components/student/CommitteesSection';
import NoticesSection from '../../components/student/NoticesSection';
import TranscriptSection from '../../components/student/TranscriptSection';
import InternalMarksSection from '../../components/student/InternalMarksSection';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const token = localStorage.getItem('studentToken');
        const userRole = localStorage.getItem('userRole');

        // Debug logs
        console.log('Student Dashboard - token:', token ? 'exists' : 'missing');
        console.log('Student Dashboard - userRole:', userRole);

        // Check if logged in and correct role
        if (!token || userRole !== 'student') {
            console.log('Not authenticated as student, redirecting');
            navigate('/');
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await studentService.getProfile();
                setStudent(response.data.student);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile. Please try again.');

                if (err.response?.status === 401) {
                    localStorage.removeItem('studentToken');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('user');
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('studentToken');
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
                                Student Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4 text-gray-600">
                                Welcome, {student?.name}
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
                        {/* Student Profile Section */}
                        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                            <div className="p-6">
                                <StudentProfile student={student} />
                            </div>
                        </div>

                        {/* Dashboard Tabs */}
                        <div className="mb-6">
                            <nav className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab('committees')}
                                    className={`px-4 py-3 text-sm font-medium ${activeTab === 'committees'
                                        ? 'border-b-2 text-green-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    style={{ borderColor: activeTab === 'committees' ? "#025c53" : "transparent", color: activeTab === 'committees' ? "#025c53" : "" }}
                                >
                                    My Committees
                                </button>
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
                                    onClick={() => setActiveTab('transcript')}
                                    className={`px-4 py-3 text-sm font-medium ${activeTab === 'transcript'
                                        ? 'border-b-2 text-green-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    style={{ borderColor: activeTab === 'transcript' ? "#025c53" : "transparent", color: activeTab === 'transcript' ? "#025c53" : "" }}
                                >
                                    Transcript
                                </button>
                                <button
                                    onClick={() => setActiveTab('internal-marks')}
                                    className={`px-4 py-3 text-sm font-medium ${activeTab === 'internal-marks'
                                        ? 'border-b-2 text-green-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    style={{ borderColor: activeTab === 'internal-marks' ? "#025c53" : "transparent", color: activeTab === 'internal-marks' ? "#025c53" : "" }}
                                >
                                    Internal Marks
                                </button>
                            </nav>
                        </div>

                        {/* Tab content */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            {activeTab === 'committees' && <CommitteesSection />}
                            {activeTab === 'notices' && <NoticesSection />}
                            {activeTab === 'transcript' && <TranscriptSection />}
                            {activeTab === 'internal-marks' && <InternalMarksSection />}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;