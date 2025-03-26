import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import NoticeForm from '../../components/admin/notices/NoticeForm.jsx';
import ViewNoticeDialog from '../../components/admin/notices/ViewNoticeDialog';
import DeleteNoticeDialog from '../../components/admin/notices/DeleteNoticeDialog';
import {
    Users,
    UserCog,
    BookOpen,
    Building2,
    Calendar,
    GraduationCap,
    ClipboardList,
    Plus,
    Search
} from 'lucide-react';

export default function AdminHome() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        faculties: 0,
        departments: 0,
        sessions: 0,
        semesters: 0,
        courses: 0,
        students: 0,
        teachers: 0,
        externalTeachers: 0,
        examCommittees: 0,
        courseAssignments: 0
    });

    // Notice management states
    const [notices, setNotices] = useState([]);
    const [examCommittees, setExamCommittees] = useState([]);
    const [selectedCommittee, setSelectedCommittee] = useState('');
    const [isCreateNoticeOpen, setIsCreateNoticeOpen] = useState(false);
    const [isViewNoticeOpen, setIsViewNoticeOpen] = useState(false);
    const [isEditNoticeOpen, setIsEditNoticeOpen] = useState(false);
    const [isDeleteNoticeOpen, setIsDeleteNoticeOpen] = useState(false);
    const [currentNotice, setCurrentNotice] = useState(null);
    const [noticeSearch, setNoticeSearch] = useState('');

    const [loading, setLoading] = useState(true);
    const [noticesLoading, setNoticesLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);

                // Check if adminToken exists in localStorage
                const adminToken = localStorage.getItem('adminToken');
                if (!adminToken) {
                    console.error('No admin token found in localStorage');
                    setError('Authentication error: Please log in to view the dashboard');
                    setLoading(false);
                    setTimeout(() => navigate('/admin/login'), 3000);
                    return;
                }


                // Explicitly pass the token in the headers for this request
                const response = await adminService.getDashboardCounts();

                if (response.data.success) {
                    setStats(response.data.counts);
                } else {
                    console.error('API Error:', response.data);
                    setError(`Error: ${response.data.message || 'Failed to load dashboard statistics'}`);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err.response || err);

                // More specific error message based on the error type
                if (err.response?.status === 401 || err.response?.data?.message?.includes('token')) {
                    setError('Authentication error: Your session has expired. Please log in again.');
                    setTimeout(() => navigate('/admin/login'), 3000);
                } else {
                    setError(`Error: ${err.response?.data?.message || err.message || 'Failed to load dashboard statistics'}`);
                }
                setLoading(false);
            }
        };

        fetchStats();
        // Also fetch exam committees and notices when component mounts
        fetchExamCommittees();
        fetchNotices();
    }, [navigate]);

    // Fetch exam committees for the dropdown
    const fetchExamCommittees = async () => {
        try {
            const response = await adminService.getExamCommittees();
            if (response.data.success) {
                setExamCommittees(response.data.examCommittees);
            }
        } catch (err) {
            console.error('Error fetching exam committees:', err);
        }
    };

    // Fetch notices with optional committee filter
    const fetchNotices = async (committeeId = '') => {
        try {
            setNoticesLoading(true);

            const response = await adminService.getNotices(committeeId);

            if (response.data.success) {
                setNotices(response.data.notices);
            } else {
                console.error('Failed to fetch notices:', response.data);
            }
            setNoticesLoading(false);
        } catch (err) {
            console.error('Error fetching notices:', err);
            setNoticesLoading(false);
        }
    };

    // Filter notices based on search term
    const filteredNotices = notices.filter(notice =>
        notice.title.toLowerCase().includes(noticeSearch.toLowerCase()) ||
        notice.description.toLowerCase().includes(noticeSearch.toLowerCase())
    );

    // Handle committee filter change
    const handleCommitteeChange = (e) => {
        const committeeId = e.target.value;
        setSelectedCommittee(committeeId);
        fetchNotices(committeeId);
    };

    const handleCreateNotice = () => {
        setCurrentNotice(null);
        setIsCreateNoticeOpen(true);
    };

    const handleViewNotice = (notice) => {
        setCurrentNotice(notice);
        setIsViewNoticeOpen(true);
    };

    const handleEditNotice = (notice) => {
        setCurrentNotice(notice);
        setIsEditNoticeOpen(true);
    };

    const handleDeleteNotice = (notice) => {
        setCurrentNotice(notice);
        setIsDeleteNoticeOpen(true);
    };

    const handleNoticeAction = async (data) => {
        try {
            if (data.action === 'create') {
                const response = await adminService.createNotice({
                    title: data.title,
                    description: data.description,
                    exam_committee_id: data.exam_committee_id,
                    documents: data.documents
                });

                if (response.data.success) {
                    // Refresh notices after creating
                    fetchNotices(selectedCommittee);
                    return { success: true };
                }
                return { success: false, error: response.data.message || 'Failed to create notice' };
            }

            if (data.action === 'update') {
                const response = await adminService.updateNotice(data.noticeId, {
                    title: data.title,
                    description: data.description,
                    exam_committee_id: data.exam_committee_id,
                    documents: data.documents
                });

                if (response.data.success) {
                    // Refresh notices after updating
                    fetchNotices(selectedCommittee);
                    return { success: true };
                }
                return { success: false, error: response.data.message || 'Failed to update notice' };
            }

            if (data.action === 'removeDocument') {
                const response = await adminService.deleteNoticeDocument(
                    data.noticeId,
                    data.documentUrl
                );

                if (response.data.success) {
                    return { success: true };
                }
                return { success: false, error: response.data.message || 'Failed to remove document' };
            }

            return { success: false, error: 'Invalid action' };
        } catch (err) {
            console.error('Notice action error:', err);
            return {
                success: false,
                error: err.response?.data?.message || err.message || 'An error occurred'
            };
        }
    };

    const performDeleteNotice = async (noticeId) => {
        try {
            const response = await adminService.deleteNotice(noticeId);

            if (response.data.success) {
                // Refresh notices after deletion
                fetchNotices(selectedCommittee);
                return { success: true };
            }
            return { success: false, error: response.data.message || 'Failed to delete notice' };
        } catch (err) {
            console.error('Delete notice error:', err);
            return {
                success: false,
                error: err.response?.data?.message || err.message || 'Failed to delete notice'
            };
        }
    };

    const StatCard = ({ title, value, icon, color }) => (
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                <div className="mt-1 text-2xl font-semibold">{value}</div>
            </div>
        </div>
    );

    if (loading) return <div className="text-center py-12">Loading dashboard statistics...</div>;

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 mb-4">{error}</div>
                {error.includes('log in') || error.includes('session') ? (
                    <button
                        onClick={() => navigate('/admin/login')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                ) : null}
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Faculties"
                    value={stats.faculties}
                    icon={<Building2 size={24} className="text-white" />}
                    color="bg-teal-600"
                />
                <StatCard
                    title="Departments"
                    value={stats.departments}
                    icon={<Building2 size={24} className="text-white" />}
                    color="bg-teal-600"
                />
                <StatCard
                    title="Sessions"
                    value={stats.sessions}
                    icon={<Calendar size={24} className="text-white" />}
                    color="bg-teal-600"
                />
                <StatCard
                    title="Semesters"
                    value={stats.semesters}
                    icon={<BookOpen size={24} className="text-white" />}
                    color="bg-teal-600"
                />
                <StatCard
                    title="Courses"
                    value={stats.courses}
                    icon={<BookOpen size={24} className="text-white" />}
                    color="bg-sky-600"
                />
                <StatCard
                    title="Students"
                    value={stats.students}
                    icon={<Users size={24} className="text-white" />}
                    color="bg-sky-600"
                />
                <StatCard
                    title="Teachers"
                    value={stats.teachers}
                    icon={<UserCog size={24} className="text-white" />}
                    color="bg-sky-600"
                />
                <StatCard
                    title="External Teachers"
                    value={stats.externalTeachers}
                    icon={<UserCog size={24} className="text-white" />}
                    color="bg-sky-600"
                />
                <StatCard
                    title="Exam Committees"
                    value={stats.examCommittees}
                    icon={<ClipboardList size={24} className="text-white" />}
                    color="bg-purple-600"
                />
                <StatCard
                    title="Course Assignments"
                    value={stats.courseAssignments}
                    icon={<GraduationCap size={24} className="text-white" />}
                    color="bg-purple-600"
                />
            </div>

            {/* Notice Management Section (replaces Activity Log) */}
            <div className="mt-12">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Notice Management</h2>
                    <button
                        onClick={handleCreateNotice}
                        className="flex items-center px-3 py-2 !bg-teal-600 text-white rounded-md hover:bg-teal-700"
                    >
                        <span className="mr-1 font-bold text-lg">+</span> Add Notice
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search notices..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                                    value={noticeSearch}
                                    onChange={(e) => setNoticeSearch(e.target.value)}
                                />
                            </div>

                            <div className="w-full md:w-64">
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={selectedCommittee}
                                    onChange={handleCommitteeChange}
                                >
                                    <option value="">All Committees</option>
                                    {examCommittees.map(committee => (
                                        <option key={committee._id} value={committee._id}>
                                            {committee.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {noticesLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Loading notices...</p>
                        </div>
                    ) : filteredNotices.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No notices found. Create a new notice to get started.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Committee
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Attachments
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredNotices.map((notice) => (
                                        <tr key={notice._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{notice.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {notice.exam_committee_id.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(notice.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {notice.document_urls.length} files
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewNotice(notice)}
                                                    className="text-teal-600 hover:text-teal-900 mr-3"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleEditNotice(notice)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteNotice(notice)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog components for CRUD operations */}
            <NoticeForm
                open={isCreateNoticeOpen || isEditNoticeOpen}
                onClose={() => {
                    setIsCreateNoticeOpen(false);
                    setIsEditNoticeOpen(false);
                }}
                onSave={handleNoticeAction}
                notice={currentNotice}
                examCommittees={examCommittees}
                editMode={isEditNoticeOpen}
            />

            <ViewNoticeDialog
                open={isViewNoticeOpen}
                onClose={() => setIsViewNoticeOpen(false)}
                notice={currentNotice}
            />

            <DeleteNoticeDialog
                open={isDeleteNoticeOpen}
                onClose={() => setIsDeleteNoticeOpen(false)}
                notice={currentNotice}
                onDelete={performDeleteNotice}  // Use the new function name here
            />
        </div>
    );
}