import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services/api';
import { Link } from 'react-router-dom';

const NoticeSection = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [committeeMap, setCommitteeMap] = useState({});
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            setLoading(true);

            // Step 1: Get all exam committees the teacher is part of
            const [internalResponse, externalResponse] = await teacherService.getAllAssignedExams();
            ;

            // Process internal assignments - access examsList instead of assignments
            const internalCommittees = internalResponse.data.examsList
                ? internalResponse.data.examsList.map(item => ({
                    id: item.courseAssignment.exam_committee_id._id,
                    name: item.courseAssignment.exam_committee_id.name,
                    department: item.courseAssignment.exam_committee_id.department_id?.name || 'Unknown',
                    session: item.courseAssignment.exam_committee_id.session_id?.name || 'Unknown'
                }))
                : [];

            // Process external assignments - access examsList instead of assignments
            const externalCommittees = externalResponse.data.examsList
                ? externalResponse.data.examsList.map(item => ({
                    id: item.courseAssignment.exam_committee_id._id,
                    name: item.courseAssignment.exam_committee_id.name,
                    department: item.courseAssignment.exam_committee_id.department_id?.name || 'Unknown',
                    session: item.courseAssignment.exam_committee_id.session_id?.name || 'Unknown'
                }))
                : [];

            // Merge committees and remove duplicates using an object
            const uniqueCommittees = {};
            [...internalCommittees, ...externalCommittees].forEach(committee => {
                if (committee.id) {
                    uniqueCommittees[committee.id] = committee;
                }
            });

            // Update committee map for reference
            setCommitteeMap(uniqueCommittees);

            // Get committee IDs
            const committeeIds = Object.keys(uniqueCommittees);

            if (committeeIds.length === 0) {
                setNotices([]);
                setLoading(false);
                return;
            }

            // Step 2: Fetch notices for these committees
            const noticesResponse = await teacherService.getCommitteeNotices(committeeIds);

            if (noticesResponse.data.success) {
                setNotices(noticesResponse.data.notices || []);
            } else {
                setError('Failed to load notices.');
            }
        } catch (err) {
            console.error('Error fetching notices:', err);
            setError('An error occurred while fetching notices. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewNotice = (notice) => {
        setSelectedNotice(notice);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedNotice(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading notices...</p>
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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold" style={{ color: "#025c53" }}>
                    Committee Notices
                </h2>
                <button
                    onClick={fetchNotices}
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: "#025c53" }}
                >
                    Refresh
                </button>
            </div>

            {notices.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No notices available for your committees.</p>
                </div>
            ) : (
                <div className="bg-white overflow-hidden">
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
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {notices.map((notice) => (
                                    <tr key={notice._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {notice.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {notice.exam_committee_id.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {formatDate(notice.createdAt)}
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
                                                className="text-green-600 hover:text-green-900"
                                                style={{ color: "#025c53" }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Notice View Modal */}
            {showViewModal && selectedNotice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-90vh overflow-y-auto">
                        <div className="px-6 py-4 border-b" style={{ backgroundColor: "#025c53" }}>
                            <h3 className="text-xl font-semibold text-white">Notice Details</h3>
                        </div>

                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">{selectedNotice.title}</h2>

                            <div className="mb-6">
                                <p className="text-sm text-gray-500">
                                    Posted: {formatDate(selectedNotice.createdAt)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Committee: {selectedNotice.exam_committee_id.name}
                                </p>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-lg font-medium mb-2">Description</h4>
                                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line">
                                    {selectedNotice.description}
                                </div>
                            </div>

                            {selectedNotice.document_urls && selectedNotice.document_urls.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-medium mb-2">Attachments</h4>
                                    <ul className="bg-gray-50 p-4 rounded-md">
                                        {selectedNotice.document_urls.map((url, index) => (
                                            <li key={index} className="mb-2 last:mb-0">
                                                <div className="flex items-center justify-between">
                                                    <span>{url.split('/').pop()}</span>
                                                    <div>
                                                        <a
                                                            href={`http://localhost:4000${url}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline mr-3"
                                                        >
                                                            View
                                                        </a>
                                                        <a
                                                            href={`http://localhost:4000${url}`}
                                                            download
                                                            className="text-green-600 hover:underline"
                                                            style={{ color: "#025c53" }}
                                                        >
                                                            Download
                                                        </a>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t flex justify-end">
                            <button
                                onClick={closeViewModal}
                                className="px-4 py-2 rounded text-white"
                                style={{ backgroundColor: "#025c53" }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeSection;