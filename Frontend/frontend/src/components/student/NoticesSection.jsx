import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const NoticesSection = () => {
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedNotice, setSelectedNotice] = useState(null);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                setLoading(true);
                const response = await studentService.getNotices();
                setNotices(response.data.notices);
            } catch (err) {
                console.error('Error fetching notices:', err);
                setError('Failed to load notices. Please try again.');

                if (err.response?.status === 401) {
                    localStorage.removeItem('studentToken');
                    localStorage.removeItem('userRole');
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, [navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin inline-block h-8 w-8 border-t-2 border-b-2 border-green-500 rounded-full"></div>
                <p className="mt-2 text-gray-600">Loading notices...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
                    {error}
                </div>
            </div>
        );
    }

    if (notices.length === 0) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">No notices available at this time.</p>
            </div>
        );
    }

    if (selectedNotice) {
        return (
            <div className="p-6">
                <div className="mb-4">
                    <button
                        onClick={() => setSelectedNotice(null)}
                        className="text-sm font-medium text-gray-600 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to all notices
                    </button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                        <h3 className="font-medium text-lg text-gray-800">
                            {selectedNotice.title}
                        </h3>
                        <div className="mt-1 text-sm text-gray-600 flex items-center justify-between">
                            <div>
                                <span className="font-medium">Committee:</span> {selectedNotice.exam_committee_id.name} ({selectedNotice.exam_committee_id.department_id.name})
                            </div>
                            <div>Published: {formatDate(selectedNotice.createdAt)}</div>
                        </div>
                    </div>
                    <div className="px-6 py-4">
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedNotice.content }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-lg font-medium mb-4" style={{ color: "#025c53" }}>
                Notices
            </h2>

            <div className="space-y-4">
                {notices.map((notice) => (
                    <div
                        key={notice._id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedNotice(notice)}
                    >
                        <h3 className="font-medium text-gray-800">
                            {notice.title}
                        </h3>
                        <div className="mt-1 text-sm text-gray-600 flex items-center justify-between">
                            <div>
                                <span className="font-medium">Committee:</span> {notice.exam_committee_id.name}
                            </div>
                            <div>{formatDate(notice.createdAt)}</div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {notice.content.replace(/<[^>]*>/g, '')}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NoticesSection;