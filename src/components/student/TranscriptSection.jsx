import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const TranscriptSection = () => {
    const navigate = useNavigate();
    const [transcript, setTranscript] = useState(null);
    const [studentInfo, setStudentInfo] = useState(null);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('regular'); // Add tab state

    useEffect(() => {
        fetchTranscript();
    }, [selectedSemester]);

    const fetchTranscript = async () => {
        try {
            setLoading(true);
            let url = '';

            if (selectedSemester !== 'all') {
                // Check if we're using a name instead of an ID
                if (selectedSemester.startsWith('name:')) {
                    // Filter on the client side instead
                    const semesterName = selectedSemester.substring(5); // Remove 'name:' prefix
                    const response = await studentService.getTranscript('');

                    // Filter results client-side by semester name
                    const filteredResults = response.data.transcript.results.filter(
                        result => result.semester === semesterName
                    );

                    // Create a modified transcript
                    const filteredTranscript = {
                        ...response.data.transcript,
                        results: filteredResults
                    };

                    setTranscript(filteredTranscript);
                    setStudentInfo(response.data.student);
                    setLoading(false);
                    return;
                } else {
                    // We have a valid ID - use the API's filtering
                    url = `/${selectedSemester}`;
                }
            }

            const response = await studentService.getTranscript(url);

            // Extract semesters from response - add this note for clarity
            if (response.data.transcript.results && response.data.transcript.results.length === 0) {
                setSemesters([]);
                setTranscript(response.data.transcript);
                setStudentInfo(response.data.student);
                setLoading(false);
                return;
            }

            // If student_type is missing, fetch course assignments to determine type
            const committees = await studentService.getCommittees();

            // Create a map using course assignment ID (not just code) for better uniqueness
            const courseAssignmentMap = {};
            committees.data.committees.forEach(committee => {
                committee.courses.forEach(course => {
                    // Use course assignment ID as the key 
                    courseAssignmentMap[course.id] = {
                        type: course.student_type,
                        code: course.code
                    };
                });
            });

            // The transcript results might have a course_assignment_id property
            // If not, we'll need to match by code but recognize this is imperfect
            const resultsWithType = response.data.transcript.results.map(result => {
                // First try to find an exact match by course assignment ID
                if (result.course_assignment_id) {
                    const match = courseAssignmentMap[result.course_assignment_id];
                    if (match) {
                        return {
                            ...result,
                            student_type: match.type
                        };
                    }
                }

                // Fall back to matching by code + exam ID
                // Use the exam ID or another unique identifier to distinguish between attempts
                if (result.exam_id) {
                    // Look for exact match of both course code and exam ID
                    const exactMatch = Object.values(courseAssignmentMap).find(
                        entry => entry.code === result.code && entry.exam_id === result.exam_id
                    );
                    if (exactMatch) {
                        return {
                            ...result,
                            student_type: exactMatch.type
                        };
                    }
                }

                // Additional differentiation logic
                // Mark as improve only if the date is newer than the regular attempt
                // or if this semester is not the original semester for this course
                const isRepeatedCourse = result.is_repeated || false;
                const isLaterSemester = result.original_semester_id !== result.current_semester_id;

                if (isRepeatedCourse || isLaterSemester) {
                    return {
                        ...result,
                        student_type: 'improve'
                    };
                }

                // Default to regular if we can't determine for sure
                return {
                    ...result,
                    student_type: result.student_type || 'regular'
                };
            });

            // Update transcript with the new results
            const updatedTranscript = {
                ...response.data.transcript,
                results: resultsWithType
            };

            setTranscript(updatedTranscript);
            setStudentInfo(response.data.student);

            // Extract unique semesters with correct IDs
            if (response.data.transcript.results && response.data.transcript.results.length > 0) {
                // First check if semester_id is available in the results
                const hasSemesterId = response.data.transcript.results.some(r => r.semester_id);

                if (hasSemesterId) {
                    // Use semester_id (ObjectId) as the ID if available
                    const uniqueSemesters = [...new Set(
                        response.data.transcript.results
                            .map(result => ({
                                id: result.semester_id || result.semester, // Use ID if available
                                name: result.semester
                            }))
                            .map(JSON.stringify)
                    )].map(JSON.parse);

                    setSemesters(uniqueSemesters);
                } else {
                    // Fallback to just using names for display purposes only
                    // But don't allow filtering by semester to avoid the ObjectId error
                    const uniqueSemesterNames = [...new Set(
                        response.data.transcript.results.map(result => result.semester)
                    )];

                    const displayOnlySemesters = uniqueSemesterNames.map(name => ({
                        id: 'name:' + name, // Add prefix to indicate this is a name
                        name: name
                    }));

                    setSemesters(displayOnlySemesters);
                }
            }
        } catch (err) {
            console.error('Error fetching transcript:', err);
            setError('Failed to load transcript. Please try again.');

            if (err.response?.status === 401) {
                localStorage.removeItem('studentToken');
                localStorage.removeItem('userRole');
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = () => {
        try {
            const doc = new jsPDF();

            // Filter only regular results for PDF
            const regularResults = transcript.results.filter(result =>
                result.student_type === 'regular' || !result.student_type
            );

            // ===== HEADER SECTION =====
            // Add university logo and header
            doc.setFillColor(240, 240, 240);
            doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');

            doc.setDrawColor(2, 92, 83);
            doc.setLineWidth(0.5);
            doc.line(0, 30, doc.internal.pageSize.width, 30);

            // University Name
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.setTextColor(2, 92, 83);
            doc.text("Jatiya Kabi Kazi Nazrul Islam University", doc.internal.pageSize.width / 2, 12, { align: 'center' });

            doc.setFontSize(12);
            doc.text("Department of " + studentInfo.department, doc.internal.pageSize.width / 2, 18, { align: 'center' });

            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text("ACADEMIC TRANSCRIPT", doc.internal.pageSize.width / 2, 25, { align: 'center' });

            // ===== STUDENT INFORMATION SECTION =====
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");

            // Left column
            doc.text("Student Name:", 15, 40);
            doc.text("Registration No:", 15, 46);
            doc.text("Roll Number:", 15, 52);

            // Right column
            doc.text("Department:", 120, 40);
            doc.text("Session:", 120, 46);
            doc.text("Date of Issue:", 120, 52);

            // Add student info with bold styling
            doc.setFont("helvetica", "bold");
            doc.text(studentInfo.name, 50, 40);
            doc.text(studentInfo.registration_number, 50, 46);
            doc.text(studentInfo.roll_number, 50, 52);

            doc.text(studentInfo.department, 155, 40);
            doc.text(studentInfo.session, 155, 46);
            doc.text(new Date().toLocaleDateString(), 155, 52);

            // Add horizontal line after student info
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);
            doc.line(15, 58, doc.internal.pageSize.width - 15, 58);

            // ===== RESULTS SECTION =====
            // Calculate GPA for regular courses
            let totalGradePoints = 0;
            let totalCredits = 0;

            regularResults.forEach(result => {
                if (typeof result.gradePoint === 'number') {
                    totalGradePoints += result.gradePoint * result.credit;
                    totalCredits += result.credit;
                }
            });

            const regularGPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 'N/A';

            // Add GPA info
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text("RESULTS SUMMARY", doc.internal.pageSize.width / 2, 66, { align: 'center' });

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(`Total Courses: ${regularResults.length}`, 15, 74);
            doc.text(`Total Credits: ${totalCredits}`, 80, 74);
            doc.text(`GPA: ${regularGPA}`, 145, 74);

            // Add another horizontal line below the results summary
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);
            doc.line(15, 80, doc.internal.pageSize.width - 15, 80);

            // ===== GRADING SCALE SECTION - RIGHT SIDE =====
            // Add smaller grading scale on the right side, positioned after the line
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7); // Smaller font
            doc.text("GRADING SCALE", 150, 88);

            // Smaller grading scale table with shorter headers
            const gradeScaleColumns = ["Range", "Grade", "Points"];
            const gradeScaleRows = [
                ["80-100", "A+", "4.00"],
                ["75-79", "A", "3.75"],
                ["70-74", "A-", "3.50"],
                ["65-69", "B+", "3.25"],
                ["60-64", "B", "3.00"],
                ["55-59", "B-", "2.75"],
                ["50-54", "C+", "2.50"],
                ["45-49", "C", "2.25"],
                ["40-44", "D", "2.00"],
                ["0-39", "F", "0.00"]
            ];

            // Position the grading scale on right side, below the second horizontal line
            autoTable(doc, {
                head: [gradeScaleColumns],
                body: gradeScaleRows,
                startY: 90,
                tableWidth: 55, // Even smaller width
                styles: {
                    fontSize: 5,  // Smaller font
                    cellPadding: 1,
                },
                headStyles: {
                    fillColor: [2, 92, 83],
                    fontSize: 5,  // Smaller header font
                    fontStyle: 'bold',
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 18, halign: 'center' },
                    1: { cellWidth: 18, halign: 'center' },
                    2: { cellWidth: 18, halign: 'center' }
                },
                margin: { left: 140 }  // Position on right side
            });

            // Group results by semester for better organization
            const resultsBySemester = {};
            regularResults.forEach(result => {
                if (!resultsBySemester[result.semester]) {
                    resultsBySemester[result.semester] = [];
                }
                resultsBySemester[result.semester].push(result);
            });

            // Results table(s)
            const tableColumn = [
                'Course Code',
                'Course Title',
                'Credit',
                'Internal (40)',
                'External (60)',
                'Total (100)',
                'Grade',
                'Grade Point'
            ];

            let yPos = 90;  // Position first semester results below the summary
            // Will be adjusted if grading scale table is taller

            // After grading scale table is created, get its ending Y position
            const gradeScaleEndY = doc.lastAutoTable.finalY;
            yPos = Math.max(yPos, gradeScaleEndY + 10);  // Use the larger value

            // For each semester, create a separate table
            Object.keys(resultsBySemester).forEach((semester, index) => {
                // Add semester header
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(2, 92, 83);

                // Check if we need a new page
                if (yPos > doc.internal.pageSize.height - 40) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.text(`${semester}`, 15, yPos);
                yPos += 6;

                // Reset text color
                doc.setTextColor(0, 0, 0);

                // Create table rows for this semester
                const semesterRows = resultsBySemester[semester].map(result => [
                    result.code,
                    result.name,
                    result.credit,
                    result.internalMarks !== null ? result.internalMarks.toString() : 'N/A',
                    result.externalMarks !== null ? result.externalMarks.toString() : 'N/A',
                    result.totalMarks !== null ? result.totalMarks.toString() : 'N/A',
                    result.letterGrade,
                    typeof result.gradePoint === 'number' ? result.gradePoint.toFixed(2) : result.gradePoint
                ]);

                // Add the table
                autoTable(doc, {
                    head: [tableColumn],
                    body: semesterRows,
                    startY: yPos,
                    styles: {
                        fontSize: 8,
                        cellPadding: 2,
                    },
                    headStyles: {
                        fillColor: [2, 92, 83],
                        fontSize: 8,
                        fontStyle: 'bold',
                        halign: 'center'
                    },
                    columnStyles: {
                        0: { cellWidth: 20 },  // Course Code
                        1: { cellWidth: 55 },  // Course Name
                        2: { cellWidth: 12, halign: 'center' },  // Credit
                        3: { cellWidth: 18, halign: 'center' },  // Internal
                        4: { cellWidth: 18, halign: 'center' },  // External
                        5: { cellWidth: 18, halign: 'center' },  // Total
                        6: { cellWidth: 15, halign: 'center' },  // Grade
                        7: { cellWidth: 18, halign: 'center' }   // Grade Point
                    },
                    margin: { left: 15, right: 15 }
                });

                // Update Y position for the next table
                yPos = doc.lastAutoTable.finalY + 10;
            });

            // ===== GRADING SCALE SECTION =====
            // Add grading scale
            if (yPos > doc.internal.pageSize.height - 60) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            yPos += 6;
            // ===== SIGNATURE SECTION =====
            // Add signature line
            yPos = doc.lastAutoTable.finalY + 30;

            if (yPos > doc.internal.pageSize.height - 40) {
                doc.addPage();
                yPos = 40;
            }

            // Add 3 signature lines
            const signatureWidth = 50;
            const signatureSpacing = (doc.internal.pageSize.width - 30 - (signatureWidth * 3)) / 2;

            // First signature (Controller of Examinations)
            doc.line(15, yPos, 15 + signatureWidth, yPos);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text("Controller of Examinations", 15 + signatureWidth / 2, yPos + 4, { align: 'center' });

            // Second signature (Registrar)
            doc.line(15 + signatureWidth + signatureSpacing, yPos, 15 + (signatureWidth * 2) + signatureSpacing, yPos);
            doc.text("Registrar", 15 + signatureWidth + signatureSpacing + signatureWidth / 2, yPos + 4, { align: 'center' });

            // Third signature (Vice-Chancellor)
            doc.line(15 + (signatureWidth * 2) + (signatureSpacing * 2), yPos, 15 + (signatureWidth * 3) + (signatureSpacing * 2), yPos);
            doc.text("Vice-Chancellor", 15 + (signatureWidth * 2) + (signatureSpacing * 2) + signatureWidth / 2, yPos + 4, { align: 'center' });

            // ===== FOOTER SECTION =====
            // Add timestamp and verification statement
            doc.setFontSize(7);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
            doc.text("This document is computer generated and does not require signature if printed from official portal.", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 6, { align: 'center' });

            // Add page numbers
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 15);
            }

            // Save PDF
            const semesterText = selectedSemester === 'all' ? 'Complete' : semesters.find(s => s.id === selectedSemester)?.name || 'Semester';
            doc.save(`Academic_Transcript-${studentInfo.registration_number}-${semesterText}.pdf`);

            return true;
        } catch (err) {
            console.error('Error generating transcript PDF:', err);
            setError('Failed to generate PDF transcript');
            return false;
        }
    };

    if (loading && !transcript) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin inline-block h-8 w-8 border-t-2 border-b-2 border-green-500 rounded-full"></div>
                <p className="mt-2 text-gray-600">Loading transcript...</p>
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

    if (!transcript || transcript.results.length === 0) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">No transcript data available.</p>
            </div>
        );
    }

    // Filter results based on active tab
    const filteredResults = transcript.results.filter(result => {
        if (activeTab === 'regular') {
            return result.student_type === 'regular' || !result.student_type;
        } else {
            return result.student_type === 'improve';
        }
    });

    // Calculate GPA for filtered results
    let totalGradePoints = 0;
    let totalCredits = 0;

    filteredResults.forEach(result => {
        if (typeof result.gradePoint === 'number') {
            totalGradePoints += result.gradePoint * result.credit;
            totalCredits += result.credit;
        }
    });

    const filteredGPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 'N/A';

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium" style={{ color: "#025c53" }}>
                    Academic Transcript
                </h2>

                <div className="flex items-center space-x-4">
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="border border-gray-300 rounded-md py-1 px-3 text-sm"
                    >
                        <option value="all">All Semesters</option>
                        {semesters.map(semester => (
                            <option key={semester.id} value={semester.id}>{semester.name}</option>
                        ))}
                    </select>

                    {activeTab === 'regular' && (
                        <button
                            onClick={generatePDF}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                        >
                            Download PDF
                        </button>
                    )}
                </div>
            </div>

            {/* Transcript Type Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4">
                        <button
                            onClick={() => setActiveTab('regular')}
                            className={`py-2 px-1 border-b-2 text-sm font-medium ${activeTab === 'regular'
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            style={{
                                borderColor: activeTab === 'regular' ? '#025c53' : 'transparent',
                                color: activeTab === 'regular' ? '#025c53' : ''
                            }}
                        >
                            Regular Courses
                        </button>
                        <button
                            onClick={() => setActiveTab('improve')}
                            className={`py-2 px-1 border-b-2 text-sm font-medium ${activeTab === 'improve'
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            style={{
                                borderColor: activeTab === 'improve' ? '#025c53' : 'transparent',
                                color: activeTab === 'improve' ? '#025c53' : ''
                            }}
                        >
                            Improvement Courses
                        </button>
                    </nav>
                </div>
            </div>

            {/* Student info box - only shown for regular courses */}
            {activeTab === 'regular' ? (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Student</p>
                            <p className="text-sm">{studentInfo.name}</p>
                            <p className="text-sm">Reg: {studentInfo.registration_number}</p>
                            <p className="text-sm">Roll: {studentInfo.roll_number}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Department</p>
                            <p className="text-sm">{studentInfo.department}</p>
                            <p className="text-sm font-medium text-gray-500 mt-2">Session</p>
                            <p className="text-sm">{studentInfo.session}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">GPA</p>
                            <p className="text-2xl font-bold" style={{ color: "#025c53" }}>
                                {filteredGPA}
                            </p>
                            <p className="text-sm font-medium text-gray-500 mt-2">Total Credits</p>
                            <p className="text-sm">{totalCredits}</p>
                        </div>
                    </div>
                </div>
            ) : (
                // For improvement tab, just show a simpler header
                <div className="bg-gray-50 p-3 rounded-lg mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium">Improvement Courses</p>
                            <p className="text-xs text-gray-500">These are courses you're attempting to improve</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Student: {studentInfo.name}</p>
                            <p className="text-xs text-gray-500">Roll: {studentInfo.roll_number}</p>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-4">
                    <div className="animate-spin inline-block h-6 w-6 border-t-2 border-b-2 border-green-500 rounded-full"></div>
                    <p className="mt-2 text-sm text-gray-600">Refreshing data...</p>
                </div>
            ) : filteredResults.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">
                        {activeTab === 'regular'
                            ? 'No regular course results available.'
                            : 'No improvement course results available.'}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Internal (40)</th>

                                {/* Always show External column but the rest only for regular */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">External (60)</th>

                                {activeTab === 'regular' && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Point</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredResults.map((result, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.code}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{result.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{result.credit}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{result.semester}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{result.internalMarks !== null ? result.internalMarks : 'N/A'}</td>

                                    {activeTab === 'regular' ? (
                                        <>
                                            <td className="px-6 py-4 text-sm text-gray-500">{result.externalMarks !== null ? result.externalMarks : 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{result.totalMarks !== null ? result.totalMarks : 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${result.letterGrade === 'F'
                                                    ? 'bg-red-100 text-red-800'
                                                    : result.letterGrade === 'N/A'
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {result.letterGrade}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {typeof result.gradePoint === 'number' ? result.gradePoint.toFixed(2) : result.gradePoint}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${result.status === 'Failed'
                                                    ? 'bg-red-100 text-red-800'
                                                    : result.status === 'Pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {result.status}
                                                </span>
                                            </td>
                                        </>
                                    ) : (
                                        // For improvement tab, just show external marks column and possibly status
                                        <td className="px-6 py-4 text-sm text-gray-500">{result.externalMarks !== null ? result.externalMarks : 'N/A'}</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TranscriptSection;