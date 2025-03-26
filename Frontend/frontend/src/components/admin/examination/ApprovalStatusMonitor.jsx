import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/api';
import { Search, Filter, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const ApprovalStatusMonitor = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [approvalStatuses, setApprovalStatuses] = useState([]);
    const [committees, setCommittees] = useState([]);
    const [semesters, setSemesters] = useState([]);

    // Filter states
    const [selectedCommittee, setSelectedCommittee] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Fetch committees and semesters for filters
        const fetchFilterData = async () => {
            try {
                const [committeesRes, semestersRes] = await Promise.all([
                    adminService.getExamCommittees(),
                    adminService.getSemesters()
                ]);

                if (committeesRes.data.success) {
                    setCommittees(committeesRes.data.examCommittees);
                }

                if (semestersRes.data.success) {
                    setSemesters(semestersRes.data.semesters);
                }
            } catch (err) {
                console.error('Error fetching filter data:', err);
                setError('Failed to load filter options. Please refresh the page.');
            }
        };

        fetchFilterData();
        fetchApprovalStatus();
    }, []);

    const fetchApprovalStatus = async () => {
        try {
            setLoading(true);
            const response = await adminService.getApprovalStatus(
                selectedCommittee,
                selectedSemester
            );

            if (response.data.success) {
                setApprovalStatuses(response.data.approvalStatuses);
            } else {
                setError('Failed to load approval status data.');
            }
        } catch (err) {
            console.error('Error fetching approval status:', err);
            setError('An error occurred while fetching data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = () => {
        fetchApprovalStatus();
    };

    const clearFilters = () => {
        setSelectedCommittee('');
        setSelectedSemester('');
        setSearchQuery('');
        // Fetch all data when filters are cleared
        fetchApprovalStatus();
    };

    // Filter the approval statuses based on search query
    const filteredStatuses = approvalStatuses.filter(status => {
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();

        return (
            status.exam_committee.name.toLowerCase().includes(searchLower) ||
            status.semester.name.toLowerCase().includes(searchLower)
        );
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} className="mr-1" />
                        Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle size={12} className="mr-1" />
                        Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Clock size={12} className="mr-1" />
                        Pending
                    </span>
                );
        }
    };

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Exam Committee
                        </label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={selectedCommittee}
                            onChange={(e) => setSelectedCommittee(e.target.value)}
                        >
                            <option value="">All Committees</option>
                            {committees.map(committee => (
                                <option key={committee._id} value={committee._id}>
                                    {committee.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Semester
                        </label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                        >
                            <option value="">All Semesters</option>
                            {semesters.map(semester => (
                                <option key={semester._id} value={semester._id}>
                                    {semester.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={handleFilterChange}
                            className="px-4 py-2 !bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center"
                        >
                            <Filter size={16} className="mr-1" />
                            Apply
                        </button>

                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Table */}
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600"></div>
                    <span className="ml-3 text-gray-600">Loading data...</span>
                </div>
            ) : filteredStatuses.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                    No approval status records found.
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Exam Committee
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Semester
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Internal Marks
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        External Marks
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Details
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStatuses.map((status) => (
                                    <tr key={status._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {status.exam_committee.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {status.exam_committee.department}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {status.exam_committee.session}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {status.semester.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(status.internal_marks.status)}
                                            {status.internal_marks.status !== 'pending' && (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    <div>By: {status.internal_marks.approved_by?.name || 'N/A'}</div>
                                                    <div>On: {formatDate(status.internal_marks.approval_date)}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(status.external_marks.status)}
                                            {status.external_marks.status !== 'pending' && (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    <div>By: {status.external_marks.approved_by?.name || 'N/A'}</div>
                                                    <div>On: {formatDate(status.external_marks.approval_date)}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {status.comments && (
                                                <div className="text-xs text-gray-500 mb-2">
                                                    <span className="font-semibold">Comments:</span> {status.comments}
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-500">
                                                <span className="font-semibold">Created:</span> {formatDate(status.createdAt)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                <span className="font-semibold">Updated:</span> {formatDate(status.updatedAt)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApprovalStatusMonitor;