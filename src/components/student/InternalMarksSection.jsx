import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const InternalMarksSection = () => {
    const navigate = useNavigate();
    const [committees, setCommittees] = useState([]);
    const [selectedCommittee, setSelectedCommittee] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [courseInternalMarks, setCourseInternalMarks] = useState(null);
    const [loading, setLoading] = useState(true);
    const [markLoading, setMarkLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCommittees = async () => {
            try {
                setLoading(true);
                const response = await studentService.getCommittees();

                // Filter committees with published internal marks
                const filteredCommittees = response.data.committees.filter(
                    committee => committee.internal_marks_published
                );

                setCommittees(filteredCommittees);
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

    const fetchCourseInternalMarks = async (courseAssignmentId) => {
        try {
            setMarkLoading(true);
            setError('');
            setCourseInternalMarks(null);

            const response = await studentService.getCourseInternalMarks(courseAssignmentId);
            setCourseInternalMarks(response.data);
        } catch (err) {
            console.error('Error fetching internal marks:', err);

            if (err.response?.status === 403) {
                setError('Internal marks have not been published yet.');
            } else if (err.response?.status === 404) {
                setError('Internal marks not found for this course.');
            } else {
                setError('Failed to load internal marks. Please try again.');
            }

            if (err.response?.status === 401) {
                localStorage.removeItem('studentToken');
                localStorage.removeItem('userRole');
                navigate('/');
            }
        } finally {
            setMarkLoading(false);
        }
    };

    const handleCommitteeChange = (e) => {
        const committeeId = e.target.value;
        setSelectedCommittee(committeeId);
        setSelectedCourse('');
        setCourseInternalMarks(null);
    };

    const handleCourseChange = (e) => {
        const courseAssignmentId = e.target.value;
        setSelectedCourse(courseAssignmentId);

        if (courseAssignmentId) {
            fetchCourseInternalMarks(courseAssignmentId);
        } else {
            setCourseInternalMarks(null);
        }
    };

    // Get available courses for selected committee
    const getCoursesForCommittee = () => {
        if (!selectedCommittee) return [];

        const committee = committees.find(c => c._id === selectedCommittee);
        return committee ? committee.courses : [];
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin inline-block h-8 w-8 border-t-2 border-b-2 border-green-500 rounded-full"></div>
                <p className="mt-2 text-gray-600">Loading committees...</p>
            </div>
        );
    }

    if (error && !courseInternalMarks && !selectedCourse) {
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
                <p className="text-gray-500">No committees with published internal marks found.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-lg font-medium mb-4" style={{ color: "#025c53" }}>
                Internal Marks
            </h2>

            <div className="mb-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Committee</label>
                    <select
                        value={selectedCommittee}
                        onChange={handleCommitteeChange}
                        className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">-- Select Committee --</option>
                        {committees.map(committee => (
                            <option key={committee._id} value={committee._id}>
                                {committee.name} ({committee.department})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedCommittee && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                        <select
                            value={selectedCourse}
                            onChange={handleCourseChange}
                            className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">-- Select Course --</option>
                            {getCoursesForCommittee().map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.name} ({course.semester.name})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {markLoading && (
                <div className="text-center py-8">
                    <div className="animate-spin inline-block h-8 w-8 border-t-2 border-b-2 border-green-500 rounded-full"></div>
                    <p className="mt-2 text-gray-600">Loading marks...</p>
                </div>
            )}

            {error && selectedCourse && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-6">
                    {error}
                </div>
            )}

            {courseInternalMarks && (
                <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                        <h3 className="font-medium text-gray-800">
                            {courseInternalMarks.courseDetails.code} - {courseInternalMarks.courseDetails.name}
                        </h3>
                        <div className="mt-1 text-sm text-gray-600">
                            <span>Credit: {courseInternalMarks.courseDetails.credit}</span>
                            <span className="mx-2">•</span>
                            <span>Semester: {courseInternalMarks.courseDetails.semester}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                            <span>Committee: {courseInternalMarks.courseDetails.committee}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                            <span>Examiner: {courseInternalMarks.courseDetails.examiner.name} ({courseInternalMarks.courseDetails.examiner.type})</span>
                        </div>
                    </div>

                    <div className="p-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-4">Internal Marks Breakdown:</h4>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">First Exam</p>
                                    <p className="text-2xl font-bold" style={{ color: "#025c53" }}>
                                        {courseInternalMarks.internalMarks.first_exam_mark} / 10
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Second Exam</p>
                                    <p className="text-2xl font-bold" style={{ color: "#025c53" }}>
                                        {courseInternalMarks.internalMarks.second_exam_mark} / 10
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Third Exam</p>
                                    <p className="text-2xl font-bold" style={{ color: "#025c53" }}>
                                        {courseInternalMarks.internalMarks.third_exam_mark} / 10
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Attendance</p>
                                    <p className="text-2xl font-bold" style={{ color: "#025c53" }}>
                                        {courseInternalMarks.internalMarks.attendance_mark} / 10
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-sm font-medium text-gray-500">Total Internal Marks</p>
                                <p className="text-3xl font-bold" style={{ color: "#025c53" }}>
                                    {courseInternalMarks.internalMarks.total} / 40
                                </p>
                            </div>
                        </div>

                        <div className="text-right mt-4 text-sm text-gray-500">
                            <p>Submitted by: {courseInternalMarks.internalMarks.submitted_by}</p>
                            <p>Submitted on: {new Date(courseInternalMarks.internalMarks.submitted_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InternalMarksSection;