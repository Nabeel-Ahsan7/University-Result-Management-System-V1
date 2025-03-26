import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // This import doesn't automatically add to jsPDF prototype

// Grade calculation helpers
export const calculateGrade = (totalMarks) => {
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

export const getExamStatus = (totalMarks) => {
    return totalMarks >= 40 ? 'Passed' : 'Failed';
};

export const calculateGradeFromGPA = (gpa) => {
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

// Generate student transcript PDF
export const generateStudentTranscriptPDF = (committee, semester, results, student) => {
    try {
        console.log("Generating transcript for student", student.name);

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
        doc.text(`${committee.department}`, doc.internal.pageSize.width / 2, 30, { align: 'center' });

        // Add horizontal line
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(20, 35, doc.internal.pageSize.width - 20, 35);

        // Student Details
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Student Name: ${student.name}`, 20, 45);
        doc.text(`Roll Number: ${student.roll_number}`, 20, 52);
        doc.text(`Registration No: ${student.registration_number}`, 20, 59);

        // Semester and Session
        doc.text(`Semester: ${semester.name}`, doc.internal.pageSize.width - 20, 45, { align: 'right' });
        doc.text(`Session: ${committee.session}`, doc.internal.pageSize.width - 20, 52, { align: 'right' });

        // Process student data for the transcript
        const courseData = [];
        let totalCredit = 0;
        let totalGradePoints = 0;
        let creditsEarned = 0;
        let failedCourses = [];

        results.forEach(result => {
            const course = result.course;
            const marks = result.marks || {};
            const internalTotal = marks.internal?.total || 0;
            const externalTotal = marks.external?.final || 0;
            const totalMark = internalTotal + externalTotal;
            const grade = calculateGrade(totalMark);
            const credit = parseFloat(course.credit);
            const gradePoint = grade.point;
            const pointsEarned = credit * gradePoint;

            courseData.push({
                code: course.course_code,
                name: course.course_name,
                credit: credit,
                internalMarks: internalTotal,
                externalMarks: externalTotal,
                totalMarks: totalMark,
                letterGrade: grade.letter,
                gradePoint: gradePoint,
                pointsEarned: pointsEarned
            });

            totalCredit += credit;
            totalGradePoints += pointsEarned;

            if (grade.letter !== 'F') {
                creditsEarned += credit;
            } else {
                failedCourses.push(course.course_code);
            }
        });

        // Calculate GPA
        const gpa = totalCredit > 0 ? (totalGradePoints / totalCredit).toFixed(2) : 'N/A';

        // Summary of Results - Course Table
        const courseTableColumn = [
            'Course Code',
            'Course Name',
            'Credit',
            'Letter Grade',
            'Grade Point',
            'GPE'
        ];

        const courseTableRows = courseData.map(course => [
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
                fillColor: [2, 92, 83],
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
        let summaryY;
        try {
            summaryY = doc.lastAutoTable.finalY + 15;
        } catch (err) {
            summaryY = 150; // Fallback position if we can't get the table position
        }

        // Add Summary Heading
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Result Summary", doc.internal.pageSize.width - 65, summaryY - 5);

        const summaryColumn = ['Particular', 'Value'];
        const summaryRows = [
            ['Total Credits', totalCredit.toString()],
            ['Credits Earned', creditsEarned.toString()],
            ['GPA', gpa],
            ['Status', failedCourses.length > 0 ? 'Failed' : 'Passed'],
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
                fillColor: [2, 92, 83],
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
        doc.text("Chairman", 30, signatureY + 15, { align: 'center' });
        doc.line(10, signatureY, 50, signatureY);

        // Center signature - Controller
        doc.text("Controller of Examinations", doc.internal.pageSize.width / 2, signatureY + 15, { align: 'center' });
        doc.line(doc.internal.pageSize.width / 2 - 30, signatureY, doc.internal.pageSize.width / 2 + 30, signatureY);

        // Right signatures - Dean
        doc.text("Dean", doc.internal.pageSize.width - 30, signatureY + 15, { align: 'center' });
        doc.line(doc.internal.pageSize.width - 50, signatureY, doc.internal.pageSize.width - 10, signatureY);

        // Add date
        const today = new Date();
        doc.text(`Date: ${today.toLocaleDateString()}`, 15, signatureY - 10);

        // Add page info at footer
        doc.setFontSize(8);
        doc.text(`Generated on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, 10, doc.internal.pageSize.height - 10);
        doc.text(`Page 1 of 1`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);

        // Save the PDF with student roll number
        doc.save(`${student.roll_number}-Transcript-${semester.name.replace(/ /g, '_')}.pdf`);
        console.log("Transcript generation complete");
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
};