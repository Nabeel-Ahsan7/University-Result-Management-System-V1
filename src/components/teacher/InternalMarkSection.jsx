import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../../services/api';

const InternalMarkSection = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);

    // Filters
    const [filters, setFilters] = useState({
        committee: '',
        semester: ''
    });

    // Selected course assignment for marking
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [studentMarks, setStudentMarks] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [expandedCourseId, setExpandedCourseId] = useState(null);

    // Fetch assigned exams where teacher is first examiner
    useEffect(() => {
        // Use teacherToken, not token
        const token = localStorage.getItem('teacherToken');

        // Add debug logging

        if (!token) {
            console.error('No teacherToken found in localStorage');
            setError('Authentication required. Please log in again.');
            navigate('/');
            return;
        }

        fetchInternalExams();
    }, [navigate]);

    const fetchInternalExams = async () => {
        try {
            setLoading(true);

            const response = await teacherService.getAssignedExams('internal');

            // Filter assignments where this teacher is the first examiner
            const assignedAsFirstExaminer = response.data.examsList.filter(
                item => item.courseAssignment.first_examiner_type === 'Teacher'
            );

            setAssignments(assignedAsFirstExaminer);
            setFilteredAssignments(assignedAsFirstExaminer);
        } catch (err) {
            console.error('Error fetching internal exams:', err);
            setError('Failed to load internal exams. Please try again.');

            // IMPORTANT: Only remove token if it's truly an auth error
            if (err.response?.status === 401) {
                console.error('Authentication error in InternalMarkSection');
                localStorage.removeItem('teacherToken');
                localStorage.removeItem('userRole');
                localStorage.removeItem('user');
                setTimeout(() => navigate('/'), 1000); // Add delay before redirect
            }
        } finally {
            setLoading(false);
        }
    };

    // Apply filters when filter values change
    useEffect(() => {
        if (assignments.length === 0) return;

        let filtered = [...assignments];

        if (filters.committee) {
            filtered = filtered.filter(
                item => item.courseAssignment.exam_committee_id.name === filters.committee
            );
        }

        if (filters.semester) {
            filtered = filtered.filter(
                item => item.courseAssignment.semester_id.name === filters.semester
            );
        }

        setFilteredAssignments(filtered);
    }, [filters, assignments]);

    // Get unique committee names and semesters for filter dropdowns
    const committees = [...new Set(assignments.map(
        item => item.courseAssignment.exam_committee_id.name
    ))];

    const semesters = [...new Set(assignments.map(
        item => item.courseAssignment.semester_id.name
    ))];

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Updated handleSelectCourse function to filter out improvement students

    const handleSelectCourse = (courseAssignmentId) => {
        // If already expanded, close it
        if (expandedCourseId === courseAssignmentId) {
            setExpandedCourseId(null);
            setStudentMarks([]);
            return;
        }

        const selected = filteredAssignments.find(
            item => item.courseAssignment._id === courseAssignmentId
        );

        if (!selected) return;

        setExpandedCourseId(courseAssignmentId);

        // Filter out improvement students for internal marks
        const regularExams = selected.exams.filter(exam => exam.student_type !== 'improve');

        // Initialize student marks data (only for regular students)
        const marksData = regularExams.map(exam => {
            // Find internal exam data if it exists
            const internalExam = selected.internalExams.find(
                item => item.exam_id.toString() === exam._id.toString()
            );

            return {
                examId: exam._id,
                studentId: exam.student_id._id,
                registrationNumber: exam.student_id.registration_number,
                rollNumber: exam.student_id.roll_number,
                studentType: exam.student_type,
                firstExamMark: internalExam?.first_exam_mark ?? '',
                secondExamMark: internalExam?.second_exam_mark ?? '',
                thirdExamMark: internalExam?.third_exam_mark ?? '',
                attendanceMark: internalExam?.attendance_mark ?? '',
                totalMark: calculateTotal(
                    internalExam?.first_exam_mark,
                    internalExam?.second_exam_mark,
                    internalExam?.third_exam_mark,
                    internalExam?.attendance_mark
                ),
                submitted: internalExam && (
                    internalExam.first_exam_mark !== null ||
                    internalExam.second_exam_mark !== null ||
                    internalExam.third_exam_mark !== null ||
                    internalExam.attendance_mark !== null
                )
            };
        });

        setStudentMarks(marksData);
    };

    // Calculate total mark
    const calculateTotal = (first, second, third, attendance) => {
        first = Number(first) || 0;
        second = Number(second) || 0;
        third = Number(third) || 0;
        attendance = Number(attendance) || 0;

        return first + second + third + attendance;
    };

    const handleMarkChange = (index, field, value) => {
        // Only allow numeric input with decimal
        if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;

        // Check max values - update all exam marks to 10 max
        if (field === 'firstExamMark' && Number(value) > 10) return;
        if (field === 'secondExamMark' && Number(value) > 10) return;
        if (field === 'thirdExamMark' && Number(value) > 10) return;
        if (field === 'attendanceMark' && Number(value) > 10) return;

        const newMarks = [...studentMarks];
        newMarks[index][field] = value;

        // Recalculate total
        newMarks[index].totalMark = calculateTotal(
            newMarks[index].firstExamMark,
            newMarks[index].secondExamMark,
            newMarks[index].thirdExamMark,
            newMarks[index].attendanceMark
        );

        setStudentMarks(newMarks);
    };

    const handleSubmitMarks = async () => {
        try {
            setSubmitting(true);
            setError('');
            setSubmitSuccess(false);

            // Create an array of marks to submit
            const marksToSubmit = studentMarks.map(student => ({
                examId: student.examId,
                firstExamMark: parseFloat(student.firstExamMark) || 0,
                secondExamMark: parseFloat(student.secondExamMark) || 0,
                thirdExamMark: parseFloat(student.thirdExamMark) || 0,
                attendanceMark: parseFloat(student.attendanceMark) || 0
            }));



            const response = await teacherService.submitInternalMarks(selectedCourseId, marksToSubmit);

            setSubmitSuccess(true);

            // Update submitted status
            const updatedMarks = studentMarks.map(student => ({
                ...student,
                submitted: true
            }));

            setStudentMarks(updatedMarks);
        } catch (err) {
            console.error('Error submitting marks:', err);
            setError(`Failed to submit marks: ${err.response?.data?.message || err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const validateForm = () => {
        // Check if any student has at least one mark filled
        return studentMarks.some(student =>
            student.firstExamMark !== '' ||
            student.secondExamMark !== '' ||
            student.thirdExamMark !== '' ||
            student.attendanceMark !== ''
        );
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading internal exam assignments...</p>
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

    if (assignments.length === 0) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">You don't have any assigned internal exams at the moment.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-lg font-medium mb-4" style={{ color: "#025c53" }}>
                    Internal Marks Management
                </h2>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="committee" className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Committee
                        </label>
                        <select
                            id="committee"
                            name="committee"
                            value={filters.committee}
                            onChange={handleFilterChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Committees</option>
                            {committees.map((committee, index) => (
                                <option key={index} value={committee}>
                                    {committee}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Semester
                        </label>
                        <select
                            id="semester"
                            name="semester"
                            value={filters.semester}
                            onChange={handleFilterChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Semesters</option>
                            {semesters.map((semester, index) => (
                                <option key={index} value={semester}>
                                    {semester}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Course Assignments List */}
                {filteredAssignments.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        No assignments match the selected filters.
                    </div>
                ) : (
                    <div className="overflow-x-auto mb-6">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Course
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Committee
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Semester
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Students
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAssignments.map((assignment) => {
                                    // Check if any student has marks submitted
                                    const hasSubmittedMarks = assignment.internalExams.some(exam =>
                                        exam.first_exam_mark !== null ||
                                        exam.second_exam_mark !== null ||
                                        exam.third_exam_mark !== null ||
                                        exam.attendance_mark !== null
                                    );

                                    // Check if all students have marks submitted
                                    const allMarksSubmitted = assignment.exams.length > 0 &&
                                        assignment.internalExams.length === assignment.exams.length &&
                                        assignment.internalExams.every(exam =>
                                            exam.first_exam_mark !== null &&
                                            exam.second_exam_mark !== null &&
                                            exam.third_exam_mark !== null &&
                                            exam.attendance_mark !== null
                                        );

                                    let statusText = 'Not Started';
                                    let statusClass = 'bg-gray-100 text-gray-800';

                                    if (allMarksSubmitted) {
                                        statusText = 'Completed';
                                        statusClass = 'bg-green-100 text-green-800';
                                    } else if (hasSubmittedMarks) {
                                        statusText = 'Partial';
                                        statusClass = 'bg-yellow-100 text-yellow-800';
                                    }

                                    const isExpanded = expandedCourseId === assignment.courseAssignment._id;

                                    return (
                                        <React.Fragment key={assignment.courseAssignment._id}>
                                            {/* Course row */}
                                            <tr className={isExpanded ? "bg-gray-50" : ""}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {assignment.courseAssignment.course_id.course_code}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {assignment.courseAssignment.course_id.course_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {assignment.courseAssignment.exam_committee_id.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {assignment.courseAssignment.semester_id.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {assignment.exams.length} students
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                                                        {statusText}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleSelectCourse(assignment.courseAssignment._id)}
                                                        className="px-3 py-1 rounded-md hover:bg-green-200"
                                                        style={{
                                                            backgroundColor: isExpanded ? "#025c53" : "rgba(2, 92, 83, 0.1)",
                                                            color: isExpanded ? "white" : "#025c53"
                                                        }}
                                                    >
                                                        {isExpanded ? 'Close Form' : 'Manage Marks'}
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Expanded marks entry form */}
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan="6" className="p-0">
                                                        <div className="border-t border-b border-gray-200 bg-white">
                                                            {submitSuccess && (
                                                                <div className="m-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                                                                    Marks submitted successfully!
                                                                </div>
                                                            )}

                                                            {error && (
                                                                <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                                                                    {error}
                                                                </div>
                                                            )}

                                                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                                                <h3 className="text-lg font-medium" style={{ color: "#025c53" }}>
                                                                    Internal Marks for {assignment.courseAssignment.course_id.course_name}
                                                                    ({assignment.courseAssignment.course_id.course_code})
                                                                </h3>
                                                            </div>

                                                            <div className="overflow-x-auto">
                                                                <table className="min-w-full divide-y divide-gray-200">
                                                                    <thead className="bg-gray-50">
                                                                        <tr>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                Roll Number
                                                                            </th>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                Registration Number
                                                                            </th>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                First Exam (10)
                                                                            </th>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                Second Exam (10)
                                                                            </th>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                Third Exam (10)
                                                                            </th>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                Attendance (10)
                                                                            </th>
                                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                Total (40)
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                                        {studentMarks.map((student, index) => (
                                                                            <tr key={student.examId}>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                                    {student.rollNumber}
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                    {student.registrationNumber}
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={student.firstExamMark}
                                                                                        onChange={(e) => handleMarkChange(index, 'firstExamMark', e.target.value)}
                                                                                        className="w-20 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                                        placeholder="0-10"
                                                                                        style={{ borderColor: Number(student.firstExamMark) > 10 ? 'red' : '' }}
                                                                                    />
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={student.secondExamMark}
                                                                                        onChange={(e) => handleMarkChange(index, 'secondExamMark', e.target.value)}
                                                                                        className="w-20 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                                        placeholder="0-10"
                                                                                        style={{ borderColor: Number(student.secondExamMark) > 10 ? 'red' : '' }}
                                                                                    />
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={student.thirdExamMark}
                                                                                        onChange={(e) => handleMarkChange(index, 'thirdExamMark', e.target.value)}
                                                                                        className="w-20 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                                        placeholder="0-10"
                                                                                        style={{ borderColor: Number(student.thirdExamMark) > 10 ? 'red' : '' }}
                                                                                    />
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={student.attendanceMark}
                                                                                        onChange={(e) => handleMarkChange(index, 'attendanceMark', e.target.value)}
                                                                                        className="w-20 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                                        placeholder="0-10"
                                                                                        style={{ borderColor: Number(student.attendanceMark) > 10 ? 'red' : '' }}
                                                                                    />
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                                    <span className={student.totalMark > 40 ? 'text-red-600' : ''}>
                                                                                        {student.totalMark}
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                                                <button
                                                                    onClick={handleSubmitMarks}
                                                                    disabled={submitting || !validateForm()}
                                                                    className="px-4 py-2 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                                                                    style={{ backgroundColor: "#025c53" }}
                                                                >
                                                                    {submitting ? 'Submitting...' : 'Submit Internal Marks'}
                                                                </button>
                                                                <p className="mt-2 text-sm text-gray-500">
                                                                    Make sure all marks are correctly entered before submitting.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Student Marks Form */}
                {selectedCourseId && (
                    <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium" style={{ color: "#025c53" }}>
                                    Internal Marks for {filteredAssignments.find(a => a.courseAssignment._id === selectedCourseId)?.courseAssignment.course_id.course_name}
                                    ({filteredAssignments.find(a => a.courseAssignment._id === selectedCourseId)?.courseAssignment.course_id.course_code})
                                </h3>
                                <div className="text-sm text-gray-500 mt-1">
                                    Committee: {filteredAssignments.find(a => a.courseAssignment._id === selectedCourseId)?.courseAssignment.exam_committee_id.name}
                                    • Semester: {filteredAssignments.find(a => a.courseAssignment._id === selectedCourseId)?.courseAssignment.semester_id.name}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCourseId(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ← Back to courses
                            </button>
                        </div>

                        {submitSuccess && (
                            <div className="m-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                                Marks submitted successfully!
                            </div>
                        )}

                        {error && (
                            <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Roll Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Registration Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            First Exam (10)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Second Exam (10)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Third Exam (10)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Attendance (10)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total (40)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {studentMarks.map((student, index) => (
                                        <tr key={student.examId}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {student.rollNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {student.registrationNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={student.firstExamMark}
                                                    onChange={(e) => handleMarkChange(index, 'firstExamMark', e.target.value)}
                                                    className="w-20 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="0-10"
                                                    style={{ borderColor: Number(student.firstExamMark) > 10 ? 'red' : '' }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={student.secondExamMark}
                                                    onChange={(e) => handleMarkChange(index, 'secondExamMark', e.target.value)}
                                                    className="w-20 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="0-10"
                                                    style={{ borderColor: Number(student.secondExamMark) > 10 ? 'red' : '' }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={student.thirdExamMark}
                                                    onChange={(e) => handleMarkChange(index, 'thirdExamMark', e.target.value)}
                                                    className="w-20 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="0-10"
                                                    style={{ borderColor: Number(student.thirdExamMark) > 10 ? 'red' : '' }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={student.attendanceMark}
                                                    onChange={(e) => handleMarkChange(index, 'attendanceMark', e.target.value)}
                                                    className="w-20 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="0-10"
                                                    style={{ borderColor: Number(student.attendanceMark) > 10 ? 'red' : '' }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <span className={student.totalMark > 40 ? 'text-red-600' : ''}>
                                                    {student.totalMark}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Submit button moved to right after the table */}
                        <div className="px-6 py-4 sticky bottom-0 bg-gray-50 border-t border-gray-200">
                            <button
                                onClick={handleSubmitMarks}
                                disabled={submitting || !validateForm()}
                                className="px-4 py-2 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                                style={{ backgroundColor: "#025c53" }}
                            >
                                {submitting ? 'Submitting...' : 'Submit Internal Marks'}
                            </button>
                            <p className="mt-2 text-sm text-gray-500">
                                Make sure all marks are correctly entered before submitting.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InternalMarkSection;