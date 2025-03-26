import React, { useState, useEffect } from 'react';
import { externalTeacherService } from '../../services/api';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

// Add these helper functions before your component definition
const calculateGrade = (totalMarks) => {
    if (totalMarks >= 80) return { letter: 'A+', point: 4.00 };
    if (totalMarks >= 75) return { letter: 'A', point: 3.75 };
    if (totalMarks >= 70) return { letter: 'A-', point: 3.50 };
    if (totalMarks >= 65) return { letter: 'B+', point: 3.25 };
    if (totalMarks >= 60) return { letter: 'B', point: 3.00 };
    if (totalMarks >= 55) return { letter: 'B-', point: 2.75 };
    if (totalMarks >= 50) return { letter: 'C+', point: 2.50 };
    if (totalMarks >= 45) return { letter: 'C', point: 2.25 };
    if (totalMarks >= 40) return { letter: 'D', point: 2.00 };
    return { letter: 'F', point: 0.00 };
};

const getExamStatus = (totalMarks) => {
    return totalMarks >= 40 ? 'Passed' : 'Failed';
};

// Helper function to determine letter grade from GPA
const calculateGradeFromGPA = (gpa) => {
    if (gpa >= 4.00) return 'A+';
    if (gpa >= 3.75) return 'A';
    if (gpa >= 3.50) return 'A-';
    if (gpa >= 3.25) return 'B+';
    if (gpa >= 3.00) return 'B';
    if (gpa >= 2.75) return 'B-';
    if (gpa >= 2.50) return 'C+';
    if (gpa >= 2.25) return 'C';
    if (gpa >= 2.00) return 'D';
    return 'F';
};

const CommitteeSection = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [committees, setCommittees] = useState([]);
    const [selectedCommittee, setSelectedCommittee] = useState(null);
    const [committeeMarks, setCommitteeMarks] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [approvalStatus, setApprovalStatus] = useState({});
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');

    // Fetch committees on component mount
    useEffect(() => {
        const fetchCommittees = async () => {
            try {
                setLoading(true);
                const response = await externalTeacherService.getCommittees();
                setCommittees(response.data.committees || []);
            } catch (err) {
                console.error('Error fetching committees:', err);
                setError('Failed to load committees. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCommittees();
    }, []);

    // Fetch committee marks when a committee is selected
    useEffect(() => {
        if (!selectedCommittee) return;

        const fetchCommitteeMarks = async () => {
            try {
                setLoading(true);
                const response = await externalTeacherService.getCommitteeMarks(selectedCommittee._id);
                setCommitteeMarks(response.data);

                // Extract unique semesters from the results
                const uniqueSemesters = {};
                response.data.results.forEach(result => {
                    const semesterId = result.courseAssignment.semester._id;
                    const semesterName = result.courseAssignment.semester.name;

                    if (!uniqueSemesters[semesterId]) {
                        uniqueSemesters[semesterId] = semesterName;
                    }
                });

                // Convert to array format for dropdown
                const semesterOptions = Object.entries(uniqueSemesters).map(([id, name]) => ({
                    id,
                    name
                }));

                setSemesters(semesterOptions);

                // Extract approval statuses
                if (response.data.approvalStatuses) {
                    const statusMap = {};
                    response.data.approvalStatuses.forEach(status => {
                        if (status) {
                            statusMap[status.semester_id] = status;
                        }
                    });
                    setApprovalStatus(statusMap);
                }
            } catch (err) {
                console.error('Error fetching committee marks:', err);
                setError('Failed to load committee marks. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCommitteeMarks();
    }, [selectedCommittee]);

    // Add this effect to collect unique students when a semester is selected
    useEffect(() => {
        if (selectedSemester && committeeMarks) {
            // Create a map of unique students
            const studentSet = new Map();

            committeeMarks.results
                .filter(result => result.courseAssignment.semester._id === selectedSemester)
                .forEach(result => {
                    result.exams.forEach(exam => {
                        const student = exam.student;
                        if (!studentSet.has(student.roll_number)) {
                            studentSet.set(student.roll_number, {
                                roll: student.roll_number,
                                name: student.name,
                                regNo: student.registration_number
                            });
                        }
                    });
                });

            // Convert to array for dropdown
            const uniqueStudents = Array.from(studentSet.values())
                .sort((a, b) => a.roll.localeCompare(b.roll));

            setStudents(uniqueStudents);
        } else {
            setStudents([]);
        }

        setSelectedStudent('');
    }, [selectedSemester, committeeMarks]);

    const handleSelectCommittee = (committee) => {
        setSelectedCommittee(committee);
        setSelectedSemester('');
        setCommitteeMarks(null);
    };

    // Add this function inside your CommitteeSection component
    const generateCoursePDF = (courseData, exams) => {
        try {
            console.log("Generating PDF for", courseData.course.course_code);

            // Create PDF with landscape orientation
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Add title
            doc.setFontSize(16);
            doc.text(`Course Result: ${courseData.course.course_code}`, 14, 20);

            // Course details
            doc.setFontSize(12);
            doc.text(`Course Name: ${courseData.course.course_name}`, 14, 30);
            doc.text(`Credit: ${courseData.course.credit}`, 14, 38);

            // Examiner details
            doc.text('Examiners:', 14, 48);
            doc.text(`First Examiner: ${courseData.first_examiner?.name || 'N/A'}`, 20, 56);
            doc.text(`Second Examiner: ${courseData.second_examiner?.name || 'N/A'}`, 20, 64);
            if (courseData.third_examiner) {
                doc.text(`Third Examiner: ${courseData.third_examiner.name}`, 20, 72);
            }

            // Add serial numbers to the data
            let serialNumber = 1;

            // Format table data with the new column structure
            const tableColumn = [
                'SI No.',
                'Roll No.',
                'Internal\nMark',
                'Examiner-1',
                'Examiner-2',
                'Examiner-3',
                'External\nTotal',
                'Total',
                'Letter\nGrade',
                'Grade\nPoint',
                'Type'
            ];

            const tableRows = [];

            // Process each exam row
            exams.forEach(exam => {
                try {
                    const internalTotal = exam.internalMarks ? exam.internalMarks.total : 0;
                    const externalTotal = exam.externalMarks ? exam.externalMarks.final_mark : 0;
                    const grandTotal = internalTotal + externalTotal;
                    const grade = calculateGrade(grandTotal);

                    // Get examiner marks
                    const firstExaminerMark = exam.externalMarks?.first_examiner_mark !== undefined ?
                        exam.externalMarks.first_examiner_mark : 'N/A';

                    const secondExaminerMark = exam.externalMarks?.second_examiner_mark !== undefined ?
                        exam.externalMarks.second_examiner_mark : 'N/A';

                    const thirdExaminerMark = exam.externalMarks?.third_examiner_mark !== undefined ?
                        exam.externalMarks.third_examiner_mark :
                        (exam.externalMarks?.is_third_examiner_required ? 'Pending' : '-');

                    // Determine if student is regular or improver with abbreviation
                    const type = exam.internalMarks ? 'R' : 'I';  // R for Regular, I for Improver

                    // Push the row data in the new order
                    tableRows.push([
                        serialNumber++,  // Serial number
                        exam.student.roll_number,
                        internalTotal || 'N/A',
                        firstExaminerMark,
                        secondExaminerMark,
                        thirdExaminerMark,
                        externalTotal || 'N/A',
                        (exam.internalMarks && exam.externalMarks) ? grandTotal : 'Incomplete',
                        (exam.internalMarks && exam.externalMarks) ? grade.letter : 'N/A',
                        (exam.internalMarks && exam.externalMarks) ? grade.point.toFixed(2) : 'N/A',
                        type
                    ]);
                } catch (err) {
                    console.error("Error processing exam row:", err, exam);
                }
            });

            // Generate the table without custom cell drawing
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 80,
                styles: {
                    fontSize: 9,
                    cellPadding: 2,
                    valign: 'middle',
                    halign: 'center'
                },
                headStyles: {
                    fillColor: [5, 92, 83],
                    fontSize: 9,
                    fontStyle: 'bold',
                    halign: 'center',
                    cellPadding: 3
                },
                columnStyles: {
                    0: { cellWidth: 11 },  // SI No.
                    1: { cellWidth: 20 },  // Roll No.
                    2: { cellWidth: 20 },  // Internal Mark
                    3: { cellWidth: 25 },  // Examiner-1
                    4: { cellWidth: 25 },  // Examiner-2
                    5: { cellWidth: 25 },  // Examiner-3
                    6: { cellWidth: 20 },  // External Total
                    7: { cellWidth: 20 },  // Total
                    8: { cellWidth: 20 },  // Letter Grade
                    9: { cellWidth: 20 },  // Grade Point
                    10: { cellWidth: 15 }  // Type
                },
                margin: { top: 10, right: 10, bottom: 15, left: 10 },
                pageBreak: 'auto'
            });

            // Add timestamp and page info
            const pageCount = doc.internal.getNumberOfPages();
            const today = new Date();
            doc.setFontSize(8);

            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Generated on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, 14, doc.internal.pageSize.height - 10);
                doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
            }

            // Save the PDF
            doc.save(`${courseData.course.course_code}-Result.pdf`);
            console.log("PDF generation complete");
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Failed to generate PDF. See console for details.");
        }
    };

    // Add this function inside your CommitteeSection component after generateCoursePDF
    const generateSemesterResultPDF = (committeeData, semesterId, results) => {
        try {
            console.log("Generating semester result PDF");

            // Create PDF with portrait orientation
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Get the selected semester name
            const selectedSemesterName = semesters.find(sem => sem.id === semesterId)?.name || 'Unknown Semester';

            // Add title
            doc.setFontSize(16);
            doc.text(`Semester Result: ${selectedSemesterName}`, 14, 20);

            // Committee details
            doc.setFontSize(12);
            doc.text(`Committee: ${selectedCommittee.name}`, 14, 30);
            doc.text(`Department: ${selectedCommittee.department}`, 14, 38);
            doc.text(`Session: ${selectedCommittee.session}`, 14, 46);

            // Get all student data across all courses
            const studentMap = new Map();

            results.forEach(result => {
                // Only process results for the selected semester
                if (result.courseAssignment.semester._id === semesterId) {
                    const courseCredit = result.courseAssignment.course.credit;
                    const courseCode = result.courseAssignment.course.course_code;

                    result.exams.forEach(exam => {
                        const studentId = exam.student.roll_number;
                        const isRegular = exam.internalMarks ? true : false;

                        if (!studentMap.has(studentId)) {
                            studentMap.set(studentId, {
                                roll: studentId,
                                name: exam.student.name,
                                regNo: exam.student.registration_number,
                                isRegular: isRegular,
                                courses: [],
                                totalCreditPoints: 0,
                                totalCredits: 0,
                                failedCourses: []
                            });
                        }

                        const student = studentMap.get(studentId);

                        // Only update isRegular if this course shows the student is regular
                        // This ensures a student is marked regular if they have internal marks for ANY course
                        if (isRegular) {
                            student.isRegular = true;
                        }

                        // Calculate course result
                        const internalTotal = exam.internalMarks ? exam.internalMarks.total : 0;
                        const externalTotal = exam.externalMarks ? exam.externalMarks.final_mark : 0;
                        const totalMarks = internalTotal + externalTotal;
                        const grade = calculateGrade(totalMarks);
                        const status = getExamStatus(totalMarks);

                        // Add course data
                        student.courses.push({
                            code: courseCode,
                            credit: courseCredit,
                            gradePoint: grade.point,
                            status: status
                        });

                        // Track failed courses
                        if (status === 'Failed') {
                            student.failedCourses.push(courseCode);
                        }

                        // Update credit points (only if both internal and external marks exist)
                        if (exam.internalMarks && exam.externalMarks) {
                            student.totalCreditPoints += (grade.point * courseCredit);
                            student.totalCredits += courseCredit;
                        }
                    });
                }
            });

            // Calculate GPA for each student
            for (const student of studentMap.values()) {
                student.gpa = student.totalCredits > 0 ?
                    (student.totalCreditPoints / student.totalCredits).toFixed(2) : 'N/A';

                // Determine letter grade based on GPA
                student.letterGrade = student.failedCourses.length > 0 ? 'F' :
                    calculateGradeFromGPA(parseFloat(student.gpa));
            }

            // Separate regular and improver students
            const regularStudents = Array.from(studentMap.values())
                .filter(student => student.isRegular)
                .sort((a, b) => a.roll.localeCompare(b.roll));

            const improverStudents = Array.from(studentMap.values())
                .filter(student => !student.isRegular)
                .sort((a, b) => a.roll.localeCompare(b.roll));

            // Table column headers
            const tableColumn = [
                'SI No.',
                'Roll No.',
                'GPA',
                'Letter Grade',
                'Remarks'
            ];

            // Generate table for regular students
            let startY = 55;

            if (regularStudents.length > 0) {
                doc.setFontSize(14);
                doc.text("Regular Students", 14, startY);
                startY += 10;

                const regularRows = regularStudents.map((student, index) => [
                    index + 1,
                    student.roll,
                    student.gpa,
                    student.letterGrade,
                    student.failedCourses.join(', ')
                ]);

                autoTable(doc, {
                    head: [tableColumn],
                    body: regularRows,
                    startY: startY,
                    styles: {
                        fontSize: 10,
                        cellPadding: 3,
                        valign: 'middle',
                        halign: 'center'
                    },
                    headStyles: {
                        fillColor: [5, 92, 83],
                        fontSize: 10,
                        fontStyle: 'bold',
                        halign: 'center'
                    },
                    columnStyles: {
                        0: { cellWidth: 15 },  // SI No.
                        1: { cellWidth: 30 },  // Roll No.
                        2: { cellWidth: 20 },  // GPA
                        3: { cellWidth: 25 },  // Letter Grade
                        4: { cellWidth: 25 }  // Remarks
                    },
                    margin: { top: 10, right: 10, bottom: 15, left: 10 }
                });

                startY = doc.lastAutoTable.finalY + 15;
            }

            // Generate table for improver students
            if (improverStudents.length > 0) {
                doc.setFontSize(14);
                doc.text("Improver Students", 14, startY);
                startY += 10;

                const improverRows = improverStudents.map((student, index) => [
                    index + 1,
                    student.roll,
                    student.gpa,
                    student.letterGrade,
                    student.failedCourses.join(', ')
                ]);

                autoTable(doc, {
                    head: [tableColumn],
                    body: improverRows,
                    startY: startY,
                    styles: {
                        fontSize: 10,
                        cellPadding: 3,
                        valign: 'middle',
                        halign: 'center'
                    },
                    headStyles: {
                        fillColor: [5, 92, 83],
                        fontSize: 10,
                        fontStyle: 'bold',
                        halign: 'center'
                    },
                    columnStyles: {
                        0: { cellWidth: 15 },  // SI No.
                        1: { cellWidth: 30 },  // Roll No.
                        2: { cellWidth: 20 },  // GPA
                        3: { cellWidth: 25 },  // Letter Grade
                        4: { cellWidth: 110 }  // Remarks
                    },
                    margin: { top: 10, right: 10, bottom: 15, left: 10 }
                });
            }

            // Add timestamp and page info
            const pageCount = doc.internal.getNumberOfPages();
            const today = new Date();
            doc.setFontSize(8);

            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Generated on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, 14, doc.internal.pageSize.height - 10);
                doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
            }

            // Save the PDF
            doc.save(`${selectedSemesterName}-Result.pdf`);
            console.log("Semester PDF generation complete");
        } catch (err) {
            console.error("Semester PDF generation failed:", err);
            alert("Failed to generate semester result PDF. See console for details.");
        }
    };

    // Add this function to generate student transcript PDF
    const generateStudentTranscriptPDF = (committeeData, semesterId, results, studentRoll) => {
        try {
            console.log("Generating transcript for student", studentRoll);

            // Find student data across all courses
            const studentData = {
                roll: studentRoll,
                name: "",
                regNo: "",
                courses: [],
                totalCreditPoints: 0,
                totalCredits: 0,
                creditsEarned: 0,
                failedCourses: []
            };

            // Get semester info
            const selectedSemesterName = semesters.find(sem => sem.id === semesterId)?.name || 'Unknown Semester';

            // Extract all the courses and marks for this student
            results.forEach(result => {
                // Only process results for the selected semester
                if (result.courseAssignment.semester._id === semesterId) {
                    const courseCredit = result.courseAssignment.course.credit;
                    const courseCode = result.courseAssignment.course.course_code;
                    const courseName = result.courseAssignment.course.course_name;

                    result.exams.forEach(exam => {
                        if (exam.student.roll_number === studentRoll) {
                            // Set student details if not already set
                            if (!studentData.name) {
                                studentData.name = exam.student.name;
                                studentData.regNo = exam.student.registration_number;
                            }

                            // Calculate course result
                            const internalTotal = exam.internalMarks ? exam.internalMarks.total : 0;
                            const externalTotal = exam.externalMarks ? exam.externalMarks.final_mark : 0;
                            const totalMarks = internalTotal + externalTotal;
                            const grade = calculateGrade(totalMarks);
                            const status = getExamStatus(totalMarks);

                            // Add course data with full details
                            studentData.courses.push({
                                code: courseCode,
                                name: courseName,
                                credit: courseCredit,
                                letterGrade: grade.letter,
                                gradePoint: grade.point,
                                pointsEarned: grade.point * courseCredit,
                                status: status
                            });

                            // Track failed courses
                            if (status === 'Failed') {
                                studentData.failedCourses.push(courseCode);
                            } else {
                                studentData.creditsEarned += courseCredit;
                            }

                            // Update credit points (only if both internal and external marks exist)
                            if (exam.internalMarks && exam.externalMarks) {
                                studentData.totalCreditPoints += (grade.point * courseCredit);
                                studentData.totalCredits += courseCredit;
                            }
                        }
                    });
                }
            });

            // Calculate GPA
            studentData.gpa = studentData.totalCredits > 0 ?
                (studentData.totalCreditPoints / studentData.totalCredits).toFixed(2) : 'N/A';

            // Create PDF in portrait mode (best for transcript)
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Add university logo and header
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text("ACADEMIC TRANSCRIPT", doc.internal.pageSize.width / 2, 20, { align: 'center' });

            // Department Header
            doc.setFontSize(14);
            doc.text(`${committeeData.department}`, doc.internal.pageSize.width / 2, 30, { align: 'center' });

            // Add horizontal line
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.line(20, 35, doc.internal.pageSize.width - 20, 35);

            // Student Details
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Student Name: ${studentData.name}`, 20, 45);
            doc.text(`Roll Number: ${studentData.roll}`, 20, 52);
            doc.text(`Registration No: ${studentData.regNo}`, 20, 59);

            // Semester and Session
            doc.text(`Semester: ${selectedSemesterName}`, doc.internal.pageSize.width - 20, 45, { align: 'right' });
            doc.text(`Session: ${committeeData.session}`, doc.internal.pageSize.width - 20, 52, { align: 'right' });

            // Summary of Results
            const courseTableColumn = [
                'Course Code',
                'Course Name',
                'Credit',
                'Letter Grade',
                'Grade Point',
                'GPE'
            ];

            const courseTableRows = studentData.courses.map(course => [
                course.code,
                course.name,
                course.credit,
                course.letterGrade,
                course.gradePoint.toFixed(2),
                course.pointsEarned.toFixed(2)
            ]);

            // Generate course table
            autoTable(doc, {
                head: [courseTableColumn],
                body: courseTableRows,
                startY: 68,
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                },
                headStyles: {
                    fillColor: [5, 92, 83],
                    fontSize: 9,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 25 },  // Course Code
                    1: { cellWidth: 70 },  // Course Name
                    2: { cellWidth: 15, halign: 'center' },  // Credit
                    3: { cellWidth: 20, halign: 'center' },  // Letter Grade
                    4: { cellWidth: 25, halign: 'center' },  // Grade Point
                    5: { cellWidth: 25, halign: 'center' }   // GPE
                },
                margin: { top: 10, right: 10, bottom: 15, left: 10 }
            });

            // Add summary table
            const summaryY = doc.lastAutoTable.finalY + 15;

            // Add Summary Heading
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text("Result Summary", doc.internal.pageSize.width - 65, summaryY - 5);

            const summaryColumn = ['Particular', 'Value'];
            const summaryRows = [
                ['Total Credits', studentData.totalCredits.toString()],
                ['Credits Earned', studentData.creditsEarned.toString()],
                ['GPA', studentData.gpa],
                ['Status', studentData.failedCourses.length > 0 ? 'Failed' : 'Passed'],
            ];

            autoTable(doc, {
                head: [summaryColumn],
                body: summaryRows,
                startY: summaryY,
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                },
                headStyles: {
                    fillColor: [5, 92, 83],
                    fontSize: 9,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 20, halign: 'center' }
                },
                margin: { left: doc.internal.pageSize.width - 70 }
            });

            // Add signature lines at the bottom
            const signatureY = doc.internal.pageSize.height - 35;

            // Left signature - Additional Director
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text("Additional Director", 30, signatureY + 15, { align: 'center' });
            doc.line(10, signatureY, 50, signatureY);

            // Right signatures - Prepared By, Checked By
            doc.setFontSize(10);
            doc.text("Prepared By: _______________________", doc.internal.pageSize.width - 60, signatureY - 10);
            doc.text("Checked By: _______________________", doc.internal.pageSize.width - 60, signatureY);

            // Add date
            const today = new Date();
            doc.text(`Date: ${today.toLocaleDateString()}`, doc.internal.pageSize.width - 60, signatureY + 10);

            // Add page info at footer
            doc.setFontSize(8);
            doc.text(`Generated on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, 10, doc.internal.pageSize.height - 10);
            doc.text(`Page 1 of 1`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);

            // Save the PDF with student roll number
            doc.save(`${studentData.roll}-Transcript-${selectedSemesterName}.pdf`);
            console.log("Transcript generation complete");
        } catch (err) {
            console.error("Transcript generation failed:", err);
            alert("Failed to generate student transcript. See console for details.");
        }
    };

    if (loading && committees.length === 0) {
        return (
            <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error && committees.length === 0) {
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
            <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 text-blue-600 p-4 rounded-md">
                    You are not a member of any exam committees.
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-6" style={{ color: "#025c53" }}>
                Exam Committees
            </h2>

            {/* Committee List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-1">
                    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <h3 className="text-lg font-medium mb-4" style={{ color: "#025c53" }}>
                            Your Committees
                        </h3>
                        <div className="space-y-2">
                            {committees.map(committee => (
                                <div
                                    key={committee._id}
                                    className={`p-3 rounded-md cursor-pointer transition-colors ${selectedCommittee?._id === committee._id
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                        }`}
                                    onClick={() => handleSelectCommittee(committee)}
                                >
                                    <div className="font-medium">{committee.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {committee.department} • {committee.session}
                                    </div>
                                    <div className="mt-1 flex items-center">
                                        <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                                            {committee.role}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    {selectedCommittee ? (
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                            <h3 className="text-lg font-medium mb-4" style={{ color: "#025c53" }}>
                                {selectedCommittee.name} Details
                            </h3>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                                    {error}
                                </div>
                            )}

                            {!committeeMarks ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Committee Status */}
                                    <div className="mb-6 p-4 bg-gray-50 rounded-md">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Internal Marks Status:</span>
                                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${committeeMarks.committee.internal_marks_published
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {committeeMarks.committee.internal_marks_published ? 'Published' : 'Not Published'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">External Marks Status:</span>
                                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${committeeMarks.committee.external_marks_published
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {committeeMarks.committee.external_marks_published ? 'Published' : 'Not Published'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Semester Selection */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Semester to View Results
                                        </label>
                                        <select
                                            value={selectedSemester}
                                            onChange={(e) => setSelectedSemester(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="">-- Select Semester --</option>
                                            {semesters.map(semester => (
                                                <option
                                                    key={semester.id}
                                                    value={semester.id}
                                                >
                                                    {semester.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Approval Status - View Only */}
                                    {selectedSemester && (
                                        <div className="mb-6 p-4 bg-gray-50 rounded-md">
                                            <h4 className="text-md font-medium mb-3">Approval Status</h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-sm font-medium">Internal Marks:</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${approvalStatus[selectedSemester]?.internal_mark_status === 'approved'
                                                            ? '!bg-green-100 text-green-800'
                                                            : '!bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {approvalStatus[selectedSemester]?.internal_mark_status === 'approved'
                                                                ? 'Approved'
                                                                : 'Pending Approval'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-sm font-medium">External Marks:</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${approvalStatus[selectedSemester]?.external_mark_status === 'approved'
                                                            ? '!bg-green-100 text-green-800'
                                                            : '!bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {approvalStatus[selectedSemester]?.external_mark_status === 'approved'
                                                                ? 'Approved'
                                                                : 'Pending Approval'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Student Transcript Generator - MOVED UP */}
                                    {selectedSemester && (
                                        <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                                            <h4 className="text-md font-medium mb-3">Generate Student Transcript</h4>
                                            <div className="flex flex-col md:flex-row md:items-end gap-4">
                                                <div className="flex-grow">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Select Student for Transcript
                                                    </label>
                                                    <select
                                                        value={selectedStudent}
                                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                    >
                                                        <option value="">-- Select Student --</option>
                                                        {students.map(student => (
                                                            <option
                                                                key={student.roll}
                                                                value={student.roll}
                                                            >
                                                                {student.roll} - {student.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() => generateStudentTranscriptPDF(selectedCommittee, selectedSemester, committeeMarks.results, selectedStudent)}
                                                        disabled={!selectedStudent}
                                                        className={`px-4 py-2 rounded text-white flex items-center ${!selectedStudent
                                                            ? '!bg-gray-300 cursor-not-allowed'
                                                            : '!bg-purple-600 hover:bg-purple-700'
                                                            }`}
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                        </svg>
                                                        Generate Student Transcript
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* THEN put Results Display after */}
                                    {selectedSemester && (
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-md font-medium">Course Results</h4>
                                                <button
                                                    onClick={() => generateSemesterResultPDF(selectedCommittee, selectedSemester, committeeMarks.results)}
                                                    className="px-4 py-2 !bg-blue-600 text-white rounded hover:!bg-blue-700 flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                                    </svg>
                                                    Download Semester Result PDF
                                                </button>
                                            </div>

                                            {committeeMarks.results
                                                .filter(result => result.courseAssignment.semester._id === selectedSemester)
                                                .map(result => (
                                                    <div key={result.courseAssignment._id} className="mb-6 border border-gray-200 rounded-md">
                                                        <div className="p-3 bg-gray-50 border-b border-gray-200">
                                                            <h5 className="font-medium">{result.courseAssignment.course.course_code}: {result.courseAssignment.course.course_name}</h5>
                                                            <div className="text-sm text-gray-500 mt-1">
                                                                <div>Credit: {result.courseAssignment.course.credit}</div>
                                                                <div className="mt-1">
                                                                    <span className="font-medium">Examiners:</span>
                                                                    <span className="ml-2">
                                                                        {result.courseAssignment.first_examiner?.name} (First),&nbsp;
                                                                        {result.courseAssignment.second_examiner?.name} (Second)
                                                                        {result.courseAssignment.third_examiner && `, ${result.courseAssignment.third_examiner.name} (Third)`}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-3">
                                                            <div className="overflow-x-auto">
                                                                <table className="min-w-full divide-y divide-gray-200">
                                                                    <thead className="bg-gray-50">
                                                                        <tr>
                                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                Roll No.
                                                                            </th>
                                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                Registration No.
                                                                            </th>
                                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                Name
                                                                            </th>
                                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                Internal (40)
                                                                            </th>
                                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                1st Examiner
                                                                            </th>
                                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                2nd Examiner
                                                                            </th>
                                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                3rd Examiner
                                                                            </th>
                                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                External (60)
                                                                            </th>
                                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                Total (100)
                                                                            </th>
                                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                Grade
                                                                            </th>
                                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                                Status
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                                        {result.exams.map(exam => {
                                                                            const internalTotal = exam.internalMarks ? exam.internalMarks.total : 0;
                                                                            const externalTotal = exam.externalMarks ? exam.externalMarks.final_mark : 0;
                                                                            const grandTotal = internalTotal + externalTotal;
                                                                            const grade = calculateGrade(grandTotal);
                                                                            const status = getExamStatus(grandTotal);

                                                                            return (
                                                                                <tr key={exam.examId}>
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                                        {exam.student.roll_number}
                                                                                    </td>
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                        {exam.student.registration_number}
                                                                                    </td>
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                                        {exam.student.name}
                                                                                    </td>
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                                        {exam.internalMarks ? internalTotal : 'N/A'}
                                                                                    </td>
                                                                                    {/* First Examiner Mark */}
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                                        {exam.externalMarks?.first_examiner_mark !== undefined ?
                                                                                            exam.externalMarks.first_examiner_mark : 'N/A'}
                                                                                    </td>
                                                                                    {/* Second Examiner Mark */}
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                                        {exam.externalMarks?.second_examiner_mark !== undefined ?
                                                                                            exam.externalMarks.second_examiner_mark : 'N/A'}
                                                                                    </td>
                                                                                    {/* Third Examiner Mark */}
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                                        {exam.externalMarks?.third_examiner_mark !== undefined ?
                                                                                            exam.externalMarks.third_examiner_mark :
                                                                                            (exam.externalMarks?.is_third_examiner_required ? 'Pending' : '-')}
                                                                                    </td>
                                                                                    {/* External Total Mark */}
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                                        {exam.externalMarks ? externalTotal : 'N/A'}
                                                                                    </td>
                                                                                    {/* Grand Total */}
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                                        {exam.internalMarks && exam.externalMarks ? grandTotal : 'Incomplete'}
                                                                                    </td>
                                                                                    {/* Grade - Letter and Point */}
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                                        {exam.internalMarks && exam.externalMarks ? (
                                                                                            <span>
                                                                                                <span className="font-medium">{grade.letter}</span>
                                                                                                <span className="text-gray-500 ml-1">({grade.point.toFixed(2)})</span>
                                                                                            </span>
                                                                                        ) : 'N/A'}
                                                                                    </td>
                                                                                    {/* Pass/Fail Status */}
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                                        {exam.internalMarks && exam.externalMarks ? (
                                                                                            <span className={`px-2 py-1 text-xs rounded-full ${status === 'Passed' ?
                                                                                                'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                                                {status}
                                                                                            </span>
                                                                                        ) : 'N/A'}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <div className="mt-4 flex justify-end">
                                                                <button
                                                                    onClick={() => generateCoursePDF(result.courseAssignment, result.exams)}
                                                                    className="px-4 py-2 !bg-green-600 text-white rounded hover:!bg-green-700 flex items-center"
                                                                >
                                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                                                    </svg>
                                                                    Download Course Result PDF
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-8 rounded-lg shadow border border-gray-200 flex justify-center items-center">
                            <p className="text-gray-500">Select a committee to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommitteeSection;