import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { externalTeacherService } from '../../services/api';

const ExternalMarkSection = () => {
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

    // Replace selectedCourseId with expandedCourseId for the collapsible UI
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [studentMarks, setStudentMarks] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Fetch assigned exams where external teacher is an examiner
    useEffect(() => {
        const fetchAssignedExams = async () => {
            try {
                setLoading(true);
                const response = await externalTeacherService.getAssignedExams('external');
                console.log('External exams data:', response.data);
                setAssignments(response.data.examsList || []);
                setFilteredAssignments(response.data.examsList || []);
            } catch (err) {
                console.error('Error fetching external exams:', err);
                setError('Failed to load assigned exams. Please try again.');

                if (err.response?.status === 401) {
                    setError('Your session has expired. Please log in again.');
                    localStorage.removeItem('externalTeacherToken'); // FIXED! Use correct token name
                    localStorage.removeItem('userRole');
                    setTimeout(() => navigate('/'), 2000);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedExams();
    }, [navigate]);

    // Apply filters when filter values change
    useEffect(() => {
        if (assignments.length === 0) return;

        let filtered = [...assignments];

        if (filters.committee) {
            filtered = filtered.filter(item =>
                item.courseAssignment.exam_committee_id.name === filters.committee
            );
        }

        if (filters.semester) {
            filtered = filtered.filter(item =>
                item.courseAssignment.semester_id.name === filters.semester
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
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            committee: '',
            semester: ''
        });
    };

    // Handle mark input change
    const handleMarkChange = (index, value) => {
        // Only allow numeric input with decimal
        if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;

        // External exam marks should be in range 0-60 (not 100)
        if (value !== '' && Number(value) > 60) return;

        const newMarks = [...studentMarks];
        newMarks[index].mark = value;
        setStudentMarks(newMarks);
    };

    // Update handleSelectCourse for expandable UI
    const handleSelectCourse = async (courseAssignmentId) => {
        // If already expanded, close it
        if (expandedCourseId === courseAssignmentId) {
            setExpandedCourseId(null);
            setStudentMarks([]);
            return;
        }

        setExpandedCourseId(courseAssignmentId);
        setSubmitSuccess(false);
        setError('');

        // Find the selected course assignment
        const selectedAssignment = assignments.find(
            item => item.courseAssignment._id === courseAssignmentId
        );

        if (!selectedAssignment) return;

        // Determine examiner type (first, second, or third)
        const examinerType = determineExaminerType(selectedAssignment.courseAssignment);

        // Map student data to the format needed for the form
        const formattedMarks = selectedAssignment.exams.map(exam => {
            const externalExam = selectedAssignment.externalExams.find(
                ee => ee.exam_id === exam._id
            );

            // Get mark based on examiner type
            let mark = '';
            if (externalExam) {
                if (examinerType === 'first') {
                    mark = externalExam.first_examiner_mark !== null
                        ? externalExam.first_examiner_mark.toString()
                        : '';
                } else if (examinerType === 'second') {
                    mark = externalExam.second_examiner_mark !== null
                        ? externalExam.second_examiner_mark.toString()
                        : '';
                } else if (examinerType === 'third') {
                    mark = externalExam.third_examiner_mark !== null
                        ? externalExam.third_examiner_mark.toString()
                        : '';
                }
            }

            return {
                examId: exam._id,
                rollNumber: exam.student_id.roll_number,
                registrationNumber: exam.student_id.registration_number,
                mark: mark,
                examinerType: examinerType
            };
        });

        setStudentMarks(formattedMarks);
    };

    // Get examiner's mark (if exists) based on examiner position
    const getExaminerMark = (exam) => {
        const externalExam = exam.externalExams?.find(e => e.exam_id === exam._id);
        if (!externalExam) return null;

        // Determine which examiner mark to return based on the position
        const courseAssignment = exam.courseAssignment;
        const externalTeacherId = JSON.parse(localStorage.getItem('user'))?.id;

        if (courseAssignment.first_examiner_id === externalTeacherId &&
            courseAssignment.first_examiner_type === 'ExternalTeacher') {
            return externalExam.first_examiner_mark;
        } else if (courseAssignment.second_examiner_id === externalTeacherId &&
            courseAssignment.second_examiner_type === 'ExternalTeacher') {
            return externalExam.second_examiner_mark;
        } else if (courseAssignment.third_examiner_id === externalTeacherId &&
            courseAssignment.third_examiner_type === 'ExternalTeacher') {
            return externalExam.third_examiner_mark;
        }

        return null;
    };

    // Submit external mark
    const handleSubmitMark = async () => {
        if (!selectedExam || markValue === '') {
            setError('Please enter a valid mark');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            await externalTeacherService.submitExternalMarks(selectedExam._id, {
                mark: Number(markValue)
            });

            setSubmitSuccess(true);

            // Refresh the exams data
            const response = await externalTeacherService.getAssignedExams('external');
            setAssignments(response.data.examsList || []);
            setFilteredAssignments(response.data.examsList || []);

            // Clear selection
            setSelectedExam(null);
            setMarkValue('');
        } catch (err) {
            console.error('Error submitting mark:', err);
            setError(err.response?.data?.message || 'Failed to submit mark. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Back button handler
    const handleBack = () => {
        setSelectedExam(null);
        setMarkValue('');
        setSubmitSuccess(false);
        setError('');
    };

    // Get unique committees from assignments
    const getUniqueCommittees = () => {
        const committees = assignments.map(item => ({
            id: item.courseAssignment.exam_committee_id._id,
            name: item.courseAssignment.exam_committee_id.name
        }));

        return [...new Map(committees.map(item => [item.id, item])).values()];
    };

    // Get unique semesters from assignments
    const getUniqueSemesters = () => {
        const semesters = assignments.map(item => ({
            id: item.courseAssignment.semester_id._id,
            name: item.courseAssignment.semester_id.name
        }));

        return [...new Map(semesters.map(item => [item.id, item])).values()];
    };

    // Helper function to determine examiner type
    const determineExaminerType = (courseAssignment) => {
        // Get external teacher ID from the token or localStorage
        const externalTeacherId = JSON.parse(localStorage.getItem('user'))?.id;

        if (!externalTeacherId) return 'unknown';

        console.log('Examiner comparison:', {
            externalTeacherId,
            first: courseAssignment.first_examiner_id,
            second: courseAssignment.second_examiner_id,
            third: courseAssignment.third_examiner_id
        });

        if (courseAssignment.first_examiner_id === externalTeacherId &&
            courseAssignment.first_examiner_type === 'ExternalTeacher') {
            return 'first';
        }
        else if (courseAssignment.second_examiner_id === externalTeacherId &&
            courseAssignment.second_examiner_type === 'ExternalTeacher') {
            return 'second';
        }
        else if (courseAssignment.third_examiner_id === externalTeacherId &&
            courseAssignment.third_examiner_type === 'ExternalTeacher') {
            return 'third';
        }

        // If no match is found, check string comparison
        if (String(externalTeacherId) === String(courseAssignment.first_examiner_id) &&
            courseAssignment.first_examiner_type === 'ExternalTeacher') {
            return 'first';
        }
        else if (String(externalTeacherId) === String(courseAssignment.second_examiner_id) &&
            courseAssignment.second_examiner_type === 'ExternalTeacher') {
            return 'second';
        }
        else if (String(externalTeacherId) === String(courseAssignment.third_examiner_id) &&
            courseAssignment.third_examiner_type === 'ExternalTeacher') {
            return 'third';
        }

        console.warn('Could not determine examiner type, defaulting to first');
        return 'first'; // Default fallback
    };

    const handleSubmitMarks = async () => {
        setSubmitting(true);
        setError('');
        setSubmitSuccess(false);

        try {
            // Find the selected assignment to double-check examiner type
            const selectedAssignment = assignments.find(
                item => item.courseAssignment._id === expandedCourseId
            );

            // Get current examiner type for this course
            const examinerType = determineExaminerType(selectedAssignment.courseAssignment);
            console.log('Confirmed examiner type:', examinerType);

            // Format data for submission - one call per exam
            for (const student of studentMarks) {
                if (student.mark === '') continue;

                console.log('Submitting mark for exam:', student.examId, 'as', examinerType, 'examiner');

                // Use externalTeacherService instead of teacherService
                await externalTeacherService.submitExternalMarks(
                    student.examId,
                    {
                        mark: Number(student.mark),
                        examinerType: examinerType
                    }
                );
            }

            setSubmitSuccess(true);

            // Refresh assignments data - also use externalTeacherService here
            const response = await externalTeacherService.getAssignedExams('external');
            setAssignments(response.data.examsList || []);
            setFilteredAssignments(response.data.examsList || []);

        } catch (err) {
            console.error('Error submitting external marks:', err);
            setError(err.response?.data?.message || 'Failed to submit marks. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const validateForm = () => {
        // Check if any mark is invalid
        return studentMarks.every(sm => {
            if (sm.mark === '') return true; // Empty marks are allowed
            const numMark = Number(sm.mark);
            return !isNaN(numMark) && numMark >= 0 && numMark <= 60;
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                <span className="ml-2">Loading...</span>
            </div>
        );
    }

    if (error && assignments.length === 0) {
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
            <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 text-blue-600 p-4 rounded-md">
                    You don't have any assigned external exams at this time.
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-lg font-medium mb-4" style={{ color: "#025c53" }}>
                    External Marks Management
                </h2>

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
            </div>

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
                                    Examiner Role
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
                                const examinerType = determineExaminerType(assignment.courseAssignment);

                                // Calculate submission status
                                const totalExams = assignment.exams.length;
                                const markedExams = assignment.externalExams.filter(ee => {
                                    if (examinerType === 'first') {
                                        return ee.first_examiner_mark !== null;
                                    } else if (examinerType === 'second') {
                                        return ee.second_examiner_mark !== null;
                                    } else if (examinerType === 'third') {
                                        return ee.third_examiner_mark !== null;
                                    }
                                    return false;
                                }).length;

                                let statusText, statusClass;
                                if (markedExams === 0) {
                                    statusText = 'Not Started';
                                    statusClass = 'bg-gray-100 text-gray-800';
                                } else if (markedExams < totalExams) {
                                    statusText = 'Partial';
                                    statusClass = 'bg-yellow-100 text-yellow-800';
                                } else {
                                    statusText = 'Completed';
                                    statusClass = 'bg-green-100 text-green-800';
                                }

                                const isExpanded = expandedCourseId === assignment.courseAssignment._id;

                                return (
                                    <React.Fragment key={assignment.courseAssignment._id}>
                                        {/* Course row */}
                                        <tr className={isExpanded ? "bg-gray-50" : ""}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {assignment.courseAssignment.course_id.course_code}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {assignment.courseAssignment.course_id.course_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {assignment.courseAssignment.exam_committee_id.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {assignment.courseAssignment.semester_id.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {assignment.exams.length}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {examinerType.charAt(0).toUpperCase() + examinerType.slice(1)} Examiner
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                                                    {isExpanded ? 'Close Form' : 'Enter Marks'}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded marks entry form */}
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan="7" className="p-0">
                                                    <div className="border-t border-b border-gray-200 bg-white">
                                                        {submitSuccess && (
                                                            <div className="m-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                                                                External marks submitted successfully!
                                                            </div>
                                                        )}

                                                        {error && (
                                                            <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                                                                {error}
                                                            </div>
                                                        )}

                                                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                                            <h3 className="text-lg font-medium" style={{ color: "#025c53" }}>
                                                                External Marks for {assignment.courseAssignment.course_id.course_name}
                                                                ({assignment.courseAssignment.course_id.course_code})
                                                            </h3>
                                                            <div className="text-sm mt-1 text-gray-500">
                                                                {examinerType.charAt(0).toUpperCase() + examinerType.slice(1)} Examiner • Committee: {assignment.courseAssignment.exam_committee_id.name}
                                                                • Semester: {assignment.courseAssignment.semester_id.name}
                                                            </div>
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
                                                                            Mark (60)
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
                                                                                    value={student.mark}
                                                                                    onChange={(e) => handleMarkChange(index, e.target.value)}
                                                                                    className="w-20 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                                    placeholder="0-60"
                                                                                    style={{ borderColor: student.mark !== '' && (isNaN(Number(student.mark)) || Number(student.mark) > 60) ? 'red' : '' }}
                                                                                />
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
                                                                {submitting ? 'Submitting...' : 'Submit External Marks'}
                                                            </button>
                                                            <p className="mt-2 text-sm text-gray-500">
                                                                Make sure all marks are correctly entered before submitting.
                                                            </p>
                                                            <p className="mt-2 text-sm text-gray-500">
                                                                Marks should be in the range of 0-60 for external examinations.
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

            {/* Remove the form at the bottom of the page since we're now showing it inline */}
        </div>
    );
};

export default ExternalMarkSection;