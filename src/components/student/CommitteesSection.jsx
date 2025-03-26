import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const CommitteesSection = () => {
    const navigate = useNavigate();
    const [committees, setCommittees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCommittees = async () => {
            try {
                setLoading(true);
                const response = await studentService.getCommittees();
                setCommittees(response.data.committees);
            } catch (err) {
                console.error('Error fetching committees:', err);
                setError('Failed to load committees. Please try again.');

                if (err.response?.status === 401) {
                    localStorage.removeItem('studentToken');
                    localStorage.removeItem('userRole');
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCommittees();
    }, [navigate]);

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin inline-block h-8 w-8 border-t-2 border-b-2 border-green-500 rounded-full"></div>
                <p className="mt-2 text-gray-600">Loading committees...</p>
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

    if (committees.length === 0) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">You are not enrolled in any examination committees.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-lg font-medium mb-4" style={{ color: "#025c53" }}>
                My Examination Committees
            </h2>

            <div className="space-y-6">
                {committees.map((committee) => (
                    <div key={committee._id} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b">
                            <h3 className="font-medium text-gray-800">
                                {committee.name}
                            </h3>
                            <div className="mt-1 text-sm text-gray-600">
                                {committee.department} | {committee.session}
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="mb-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Semesters:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {committee.semesters.map(semester => (
                                        <span key={semester.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                            {semester.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Courses:</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {committee.courses.map((course, idx) => (
                                                <tr key={`${course.id}-${idx}`}>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{course.code}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-500">{course.name}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-500">{course.credit}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-500">{course.semester.name}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-500">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${course.student_type === 'regular'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {course.student_type.charAt(0).toUpperCase() + course.student_type.slice(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mt-3 text-sm">
                                <div className="flex items-center space-x-1">
                                    <span className="font-medium">Mark Status:</span>
                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                                        Internal: {committee.internal_marks_published ? 'Published' : 'Not Published'}
                                    </span>
                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                                        External: {committee.external_marks_published ? 'Published' : 'Not Published'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommitteesSection;