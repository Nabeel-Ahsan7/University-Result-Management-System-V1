const Student = require('../models/student.model');
const Exam = require('../models/exam.model');
const ExamCommittee = require('../models/examCommittee.model');
const Notice = require('../models/notice.model');
const CourseAssignment = require('../models/courseAssignment.model');
const InternalExam = require('../models/internalExam.model');
const ExternalExam = require('../models/externalExam.model');
const ApprovalStatus = require('../models/approvalStatus.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Login student
exports.login = async (req, res) => {
    try {
        const { registration_number, password } = req.body;

        // Check if registration number and password are provided
        if (!registration_number || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide registration number and password'
            });
        }

        // Find student by registration number
        const student = await Student.findOne({ registration_number }).select('+password');
        if (!student) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await student.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = student.generateAuthToken();

        res.status(200).json({
            success: true,
            token,
            student: {
                id: student._id,
                name: student.name,
                registration_number: student.registration_number,
                roll_number: student.roll_number,
                department: student.department_id
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get student profile
exports.getProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.studentId)
            .populate('department_id', 'name')
            .populate('current_session_id', 'name')
            .populate('admission_session_id', 'name');

        res.status(200).json({
            success: true,
            student
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get committees student is enrolled in
exports.getStudentCommittees = async (req, res) => {
    try {
        // Find all exams for this student
        const exams = await Exam.find({ student_id: req.studentId })
            .populate({
                path: 'course_assignment_id',
                populate: [
                    {
                        path: 'exam_committee_id',
                        select: 'name department_id session_id internal_marks_published external_marks_published',
                        populate: [
                            { path: 'department_id', select: 'name' },
                            { path: 'session_id', select: 'name' }
                        ]
                    },
                    { path: 'semester_id', select: 'name' },
                    { path: 'course_id', select: 'course_name course_code credit' }
                ]
            });

        // Extract unique committees
        const committeesMap = {};

        exams.forEach(exam => {
            const committee = exam.course_assignment_id.exam_committee_id;
            if (committee) {
                const committeeId = committee._id.toString();

                if (!committeesMap[committeeId]) {
                    committeesMap[committeeId] = {
                        _id: committeeId,
                        name: committee.name,
                        department: committee.department_id?.name || 'Unknown',
                        session: committee.session_id?.name || 'Unknown',
                        internal_marks_published: committee.internal_marks_published,
                        external_marks_published: committee.external_marks_published,
                        semesters: [],
                        courses: []
                    };
                }

                // Add semester if not already in array
                const semesterId = exam.course_assignment_id.semester_id._id.toString();
                const semesterName = exam.course_assignment_id.semester_id.name;

                if (!committeesMap[committeeId].semesters.some(s => s.id === semesterId)) {
                    committeesMap[committeeId].semesters.push({
                        id: semesterId,
                        name: semesterName
                    });
                }

                // Add course
                committeesMap[committeeId].courses.push({
                    id: exam.course_assignment_id._id,  // CHANGED: Use course_assignment_id directly
                    course_id: exam.course_assignment_id.course_id._id, // Keep original course ID if needed
                    code: exam.course_assignment_id.course_id.course_code,
                    name: exam.course_assignment_id.course_id.course_name,
                    credit: exam.course_assignment_id.course_id.credit,
                    semester: {
                        id: semesterId,
                        name: semesterName
                    },
                    student_type: exam.student_type
                });
            }
        });

        res.status(200).json({
            success: true,
            committees: Object.values(committeesMap)
        });
    } catch (error) {
        console.error('Get Student Committees Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get notices for student committees
exports.getStudentNotices = async (req, res) => {
    try {
        // Find committees the student is enrolled in
        const exams = await Exam.find({ student_id: req.studentId })
            .populate({
                path: 'course_assignment_id',
                select: 'exam_committee_id',
                populate: {
                    path: 'exam_committee_id',
                    select: '_id'
                }
            });

        // Extract unique committee IDs
        const committeeIds = [...new Set(
            exams
                .map(exam => exam.course_assignment_id?.exam_committee_id?._id?.toString())
                .filter(id => id)
        )];

        if (committeeIds.length === 0) {
            return res.status(200).json({
                success: true,
                notices: []
            });
        }

        // Find notices for these committees
        const notices = await Notice.find({
            exam_committee_id: { $in: committeeIds }
        })
            .populate({
                path: 'exam_committee_id',
                select: 'name department_id session_id',
                populate: [
                    { path: 'department_id', select: 'name' },
                    { path: 'session_id', select: 'name' }
                ]
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            notices
        });
    } catch (error) {
        console.error('Get Student Notices Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get student transcript
exports.getStudentTranscript = async (req, res) => {
    try {
        const { semesterId } = req.params;
        const studentId = req.studentId;

        // Find student
        const student = await Student.findById(studentId)
            .populate('department_id', 'name')
            .populate('current_session_id', 'name');

        // Build query to find exams
        const examQuery = { student_id: studentId };
        let courseAssignmentQuery = {};

        if (semesterId) {
            courseAssignmentQuery.semester_id = semesterId;
        }

        // Find course assignments that match our criteria
        const courseAssignmentIds = await CourseAssignment.find(courseAssignmentQuery)
            .distinct('_id');

        // Find exams using those course assignments
        examQuery.course_assignment_id = { $in: courseAssignmentIds };

        const exams = await Exam.find(examQuery)
            .populate({
                path: 'course_assignment_id',
                populate: [
                    { path: 'course_id', select: 'course_code course_name credit' },
                    { path: 'semester_id', select: 'name' },
                    {
                        path: 'exam_committee_id',
                        select: 'name department_id session_id internal_marks_published external_marks_published',
                        populate: [
                            { path: 'department_id', select: 'name' },
                            { path: 'session_id', select: 'name' }
                        ]
                    }
                ]
            })
            .populate('internalExam')
            .populate('externalExam');

        // Process results to calculate grades
        const results = [];
        let totalGradePoints = 0;
        let totalCredits = 0;

        for (const exam of exams) {
            // Get course data
            const courseData = {
                code: exam.course_assignment_id.course_id.course_code,
                name: exam.course_assignment_id.course_id.course_name,
                credit: exam.course_assignment_id.course_id.credit,
                semester: exam.course_assignment_id.semester_id.name,
                committee: exam.course_assignment_id.exam_committee_id.name
            };

            // Check if marks are published for this committee
            const committee = exam.course_assignment_id.exam_committee_id;
            const marksPublished = {
                internal: committee.internal_marks_published,
                external: committee.external_marks_published
            };

            // Skip if both marks aren't published
            if (!marksPublished.internal || !marksPublished.external) {
                continue; // Skip this course entirely
            }

            // Calculate internal marks
            let internalMarks = null;
            if (exam.internalExam) {
                internalMarks = (
                    (exam.internalExam.first_exam_mark || 0) +
                    (exam.internalExam.second_exam_mark || 0) +
                    (exam.internalExam.third_exam_mark || 0) +
                    (exam.internalExam.attendance_mark || 0)
                );
            }

            // Calculate external marks
            let externalMarks = null;
            if (exam.externalExam) {
                const externalExam = exam.externalExam;

                // Calculate based on available marks and if third examiner is required
                if (externalExam.is_third_examiner_required && externalExam.third_examiner_mark !== null) {
                    const firstMark = externalExam.first_examiner_mark || 0;
                    const secondMark = externalExam.second_examiner_mark || 0;
                    const thirdMark = externalExam.third_examiner_mark || 0;

                    // Find which two examiners have closest marks
                    const diff12 = Math.abs(firstMark - secondMark);
                    const diff13 = Math.abs(firstMark - thirdMark);
                    const diff23 = Math.abs(secondMark - thirdMark);

                    if (diff12 <= diff13 && diff12 <= diff23) {
                        externalMarks = (firstMark + secondMark) / 2;
                    } else if (diff23 <= diff12 && diff23 <= diff13) {
                        externalMarks = (secondMark + thirdMark) / 2;
                    } else {
                        externalMarks = (firstMark + thirdMark) / 2;
                    }
                } else if (externalExam.first_examiner_mark !== null && externalExam.second_examiner_mark !== null) {
                    externalMarks = (externalExam.first_examiner_mark + externalExam.second_examiner_mark) / 2;
                } else if (externalExam.first_examiner_mark !== null) {
                    externalMarks = externalExam.first_examiner_mark;
                } else if (externalExam.second_examiner_mark !== null) {
                    externalMarks = externalExam.second_examiner_mark;
                }
            }

            // Calculate total marks and grade
            let totalMarks = null;
            let letterGrade = 'N/A';
            let gradePoint = 'N/A';
            let status = 'Pending';

            if (internalMarks !== null && externalMarks !== null) {
                totalMarks = internalMarks + externalMarks;

                // Calculate grade based on total marks
                if (totalMarks >= 80) {
                    letterGrade = 'A+';
                    gradePoint = 4.00;
                } else if (totalMarks >= 75) {
                    letterGrade = 'A';
                    gradePoint = 3.75;
                } else if (totalMarks >= 70) {
                    letterGrade = 'A-';
                    gradePoint = 3.50;
                } else if (totalMarks >= 65) {
                    letterGrade = 'B+';
                    gradePoint = 3.25;
                } else if (totalMarks >= 60) {
                    letterGrade = 'B';
                    gradePoint = 3.00;
                } else if (totalMarks >= 55) {
                    letterGrade = 'B-';
                    gradePoint = 2.75;
                } else if (totalMarks >= 50) {
                    letterGrade = 'C+';
                    gradePoint = 2.50;
                } else if (totalMarks >= 45) {
                    letterGrade = 'C';
                    gradePoint = 2.25;
                } else if (totalMarks >= 40) {
                    letterGrade = 'D';
                    gradePoint = 2.00;
                } else {
                    letterGrade = 'F';
                    gradePoint = 0.00;
                }

                status = gradePoint >= 2.00 ? 'Passed' : 'Failed';

                // Add to GPA calculation
                if (typeof gradePoint === 'number') {
                    totalGradePoints += gradePoint * courseData.credit;
                    totalCredits += courseData.credit;
                }
            }

            // Add to results
            results.push({
                ...courseData,
                status,
                internalMarks,
                externalMarks,
                totalMarks,
                letterGrade,
                gradePoint,
                student_type: exam.student_type
            });
        }

        // Calculate GPA
        const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 'N/A';

        res.status(200).json({
            success: true,
            student: {
                name: student.name,
                registration_number: student.registration_number,
                roll_number: student.roll_number,
                department: student.department_id?.name || 'Unknown',
                session: student.current_session_id?.name || 'Unknown'
            },
            transcript: {
                results,
                gpa,
                totalCredits,
                semesterId: semesterId || 'all'
            }
        });
    } catch (error) {
        console.error('Get Student Transcript Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get internal marks for a specific course
exports.getCourseInternalMarks = async (req, res) => {
    try {
        const { courseAssignmentId } = req.params;
        console.log(req.studentId);
        console.log(courseAssignmentId);
        // Verify that this student has an exam for this course assignment
        const exam = await Exam.findOne({
            student_id: req.studentId,
            course_assignment_id: courseAssignmentId,
            student_type: "regular",
        })
            .populate({
                path: 'course_assignment_id',
                populate: [
                    { path: 'course_id', select: 'course_code course_name credit' },
                    { path: 'semester_id', select: 'name' },
                    {
                        path: 'exam_committee_id',
                        select: 'name department_id session_id internal_marks_published',
                        populate: [
                            { path: 'department_id', select: 'name' },
                            { path: 'session_id', select: 'name' }
                        ]
                    },
                    { path: 'first_examiner_id', select: 'name' },
                    { path: 'first_examiner_type' }
                ]
            });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam record not found'
            });
        }

        // Check if internal marks are published
        const committee = exam.course_assignment_id.exam_committee_id;
        if (!committee.internal_marks_published) {
            return res.status(403).json({
                success: false,
                message: 'Internal marks have not been published yet'
            });
        }

        // Get internal marks
        const internalExam = await InternalExam.findOne({ exam_id: exam._id })
            .populate('submitted_by', 'name');

        if (!internalExam) {
            return res.status(404).json({
                success: false,
                message: 'Internal marks not found'
            });
        }

        // Return course and mark details
        res.status(200).json({
            success: true,
            courseDetails: {
                code: exam.course_assignment_id.course_id.course_code,
                name: exam.course_assignment_id.course_id.course_name,
                credit: exam.course_assignment_id.course_id.credit,
                semester: exam.course_assignment_id.semester_id.name,
                committee: exam.course_assignment_id.exam_committee_id.name,
                examiner: {
                    name: exam.course_assignment_id.first_examiner_id?.name || 'Unknown',
                    type: exam.course_assignment_id.first_examiner_type
                }
            },
            internalMarks: {
                first_exam_mark: internalExam.first_exam_mark,
                second_exam_mark: internalExam.second_exam_mark,
                third_exam_mark: internalExam.third_exam_mark,
                attendance_mark: internalExam.attendance_mark,
                total: internalExam.first_exam_mark + internalExam.second_exam_mark +
                    internalExam.third_exam_mark + internalExam.attendance_mark,
                submitted_by: internalExam.submitted_by?.name || 'Unknown',
                submitted_at: internalExam.submitted_at
            }
        });
    } catch (error) {
        console.error('Get Course Internal Marks Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};