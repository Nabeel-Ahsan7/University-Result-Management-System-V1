const Teacher = require('../models/teacher.model');
const ExternalTeacher = require('../models/externalTeacher.model');
const bcrypt = require('bcrypt');
const InternalExam = require('../models/internalExam.model');
const ExternalExam = require('../models/externalExam.model');
const CourseAssignment = require('../models/courseAssignment.model');
const Exam = require('../models/exam.model');
const Notice = require('../models/notice.model'); // Add this import
const ApprovalStatus = require('../models/approvalStatus.model');
const ExamCommittee = require('../models/examCommittee.model');

// Teacher login
exports.loginTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find teacher by email with password included
        const teacher = await Teacher.findOne({ email: email.toLowerCase() }).select('+password');

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Check password
        const isMatch = await teacher.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = teacher.generateAuthToken();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            teacher: {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                designation: teacher.designation,
                department_id: teacher.department_id
            }
        });
    } catch (error) {
        console.error('Teacher Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get teacher profile
exports.getProfile = async (req, res) => {
    try {
        // Teacher is added to req by the auth middleware
        const teacher = await Teacher.findById(req.teacherId)
            .select('-password')
            .populate({
                path: 'department_id',
                select: 'name faculty_id',
                populate: {
                    path: 'faculty_id',
                    select: 'name'
                }
            });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            teacher
        });
    } catch (error) {
        console.error('Get Teacher Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Submit internal marks
exports.submitInternalMarks = async (req, res) => {
    try {
        const examinerId = req.examiner._id;
        const examinerType = req.examinerType;
        const { courseAssignmentId, marks } = req.body;

        // Verify this teacher is assigned as first examiner for this course
        const courseAssignment = await CourseAssignment.findById(courseAssignmentId);
        if (!courseAssignment) {
            return res.status(404).json({
                success: false,
                message: 'Course assignment not found'
            });
        }

        // Check if the examiner is the first examiner for this course
        if (courseAssignment.first_examiner_id.toString() !== examinerId.toString() ||
            courseAssignment.first_examiner_type !== examinerType) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to submit internal marks for this course'
            });
        }

        // Process each exam mark
        const results = await Promise.all(marks.map(async (mark) => {
            // Validate the exam belongs to this course assignment
            const exam = await Exam.findById(mark.examId);

            if (!exam || exam.course_assignment_id.toString() !== courseAssignmentId) {
                throw new Error(`Invalid exam ID: ${mark.examId}`);
            }

            // Update or create internal exam record
            const internalExam = await InternalExam.findOneAndUpdate(
                { exam_id: mark.examId },
                {
                    first_exam_mark: mark.firstExamMark,
                    second_exam_mark: mark.secondExamMark,
                    third_exam_mark: mark.thirdExamMark,
                    attendance_mark: mark.attendanceMark,
                    submitted_by: examinerId,
                    submitted_at: Date.now()
                },
                { new: true, upsert: true }
            );

            return internalExam;
        }));

        await updateExamStatus(req.body.exam_id);

        res.status(200).json({
            success: true,
            message: 'Internal marks submitted successfully',
            results
        });

    } catch (error) {
        console.error('Submit Internal Marks Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Submit external marks
exports.submitExternalMarks = async (req, res) => {
    try {
        const examinerId = req.examiner._id;
        let examinerType = req.examinerType; // This is 'Teacher' or 'ExternalTeacher'
        const { examId, marks } = req.body;
        console.log(req.body.marks);
        if (!examId || !marks) {
            return res.status(400).json({
                success: false,
                message: 'Exam ID and marks are required'
            });
        }

        // Find the exam and validate
        const exam = await Exam.findById(examId)
            .populate({
                path: 'course_assignment_id',
                select: 'first_examiner_id second_examiner_id third_examiner_id first_examiner_type second_examiner_type third_examiner_type'
            });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        const courseAssignment = exam.course_assignment_id;

        // Determine if this is first, second, or third examiner
        let examinerPosition = '';
        if (courseAssignment.first_examiner_id.toString() === examinerId.toString() &&
            courseAssignment.first_examiner_type === examinerType) {
            examinerPosition = 'first';
        } else if (courseAssignment.second_examiner_id.toString() === examinerId.toString() &&
            courseAssignment.second_examiner_type === examinerType) {
            examinerPosition = 'second';
        } else if (courseAssignment.third_examiner_id?.toString() === examinerId.toString() &&
            courseAssignment.third_examiner_type === examinerType) {
            examinerPosition = 'third';
        } else {
            return res.status(403).json({
                success: false,
                message: 'Not authorized as an examiner for this exam'
            });
        }

        // Prepare update object - FIXED VERSION with submitted_by_type
        const updateField = {};
        updateField[`${examinerPosition}_examiner_mark`] = marks;
        updateField[`${examinerPosition}_submitted_by`] = examinerId;
        updateField[`${examinerPosition}_submitted_by_type`] = examinerType; // THIS LINE WAS MISSING
        updateField[`${examinerPosition}_submitted_at`] = Date.now();

        // Update external marks
        const externalExam = await ExternalExam.findOneAndUpdate(
            { exam_id: examId },
            updateField,
            { new: true, upsert: true }
        );
        console.log(externalExam);
        // Check if third examiner is needed
        if (examinerType === 'second' && externalExam.first_examiner_mark !== null) {
            const markDifference = Math.abs(externalExam.first_examiner_mark - marks);
            if (markDifference > 12) { // Threshold for third examiner
                await ExternalExam.findByIdAndUpdate(externalExam._id, {
                    is_third_examiner_required: true
                });
            }
        }

        await updateExamStatus(req.body.exam_id);
        res.status(200).json({
            success: true,
            message: 'External marks submitted successfully',
            externalExam
        });

    } catch (error) {
        console.error('Submit External Marks Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get assigned exams for marking
exports.getAssignedExams = async (req, res) => {
    try {
        const examinerId = req.userId;
        const examinerType = req.examinerType;
        const { type } = req.query; // 'internal' or 'external'

        let query;

        // For internal exams, only first examiners can view/grade
        if (type === 'internal') {
            query = {
                first_examiner_id: examinerId,
                first_examiner_type: examinerType
            };
        }
        // For external exams, first, second, or third examiners can view/grade
        else {
            query = {
                $or: [
                    { first_examiner_id: examinerId, first_examiner_type: examinerType },
                    { second_examiner_id: examinerId, second_examiner_type: examinerType },
                    { third_examiner_id: examinerId, third_examiner_type: examinerType }
                ]
            };
        }

        const courseAssignments = await CourseAssignment.find(query)
            .populate([
                {
                    path: 'exam_committee_id',
                    select: 'name session_id department_id',
                    populate: [
                        { path: 'session_id', select: 'name' },
                        { path: 'department_id', select: 'name' }
                    ]
                },
                { path: 'semester_id', select: 'name' },
                { path: 'course_id', select: 'course_code course_name credit' }
            ]);

        const examsList = await Promise.all(courseAssignments.map(async (ca) => {
            // Modified to exclude student name
            const exams = await Exam.find({ course_assignment_id: ca._id })
                .populate('student_id', 'registration_number roll_number');

            if (type === 'internal') {
                const internalExams = await InternalExam.find({
                    exam_id: { $in: exams.map(e => e._id) }
                });
                return { courseAssignment: ca, exams, internalExams };
            } else {
                const externalExams = await ExternalExam.find({
                    exam_id: { $in: exams.map(e => e._id) }
                });
                return { courseAssignment: ca, exams, externalExams };
            }
        }));

        res.status(200).json({
            success: true,
            examsList
        });

    } catch (error) {
        console.error('Get Assigned Exams Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get notices for the teacher based on their committee membership
exports.getTeacherNotices = async (req, res) => {
    try {
        const { committees } = req.query;

        if (!committees) {
            return res.status(200).json({
                success: true,
                notices: []
            });
        }

        // Parse comma-separated committee IDs
        const committeeIds = committees.split(',').map(id => id.trim());

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
        console.error('Get Teacher Notices Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notices',
            error: error.message
        });
    }
};

async function updateExamStatus(examId) {
    const exam = await Exam.findById(examId);
    const internalExam = await InternalExam.findOne({ exam_id: examId });
    const externalExam = await ExternalExam.findOne({ exam_id: examId });

    // Determine status using the same logic as above
    let status = 'pending';

    const isInternalComplete = internalExam && internalExam.submitted_by;

    let isExternalComplete = false;
    if (externalExam) {
        if (externalExam.is_third_examiner_required) {
            isExternalComplete = externalExam.first_examiner_mark !== null &&
                externalExam.second_examiner_mark !== null &&
                externalExam.third_examiner_mark !== null;
        } else {
            isExternalComplete = externalExam.first_examiner_mark !== null &&
                externalExam.second_examiner_mark !== null;
        }
    }

    if (isInternalComplete && isExternalComplete) {
        status = 'completed';
    } else if (isInternalComplete || (externalExam &&
        (externalExam.first_examiner_mark !== null ||
            externalExam.second_examiner_mark !== null ||
            externalExam.third_examiner_mark !== null))) {
        status = 'in_progress';
    }

    // Update status
    await Exam.findByIdAndUpdate(examId, { status });
}

// Add this method to teacher.controller.js

// Get committees where teacher is involved
exports.getTeacherCommittees = async (req, res) => {
    try {
        const teacherId = req.examiner._id;

        // Find committees where teacher is president or member
        const committees = await ExamCommittee.find({
            $or: [
                { president_id: teacherId },
                { members: { $elemMatch: { member_id: teacherId } } }
            ]
        }).populate([
            { path: 'department_id', select: 'name' },
            { path: 'session_id', select: 'name' },
            { path: 'president_id', select: 'name email' },
            { path: 'members.member_id', select: 'name email' }
        ]);

        // Format the response with role information
        const formattedCommittees = committees.map(committee => {
            const isPresident = committee.president_id?._id.toString() === teacherId.toString();
            const memberRole = committee.members.find(
                m => m.member_id?._id.toString() === teacherId.toString()
            )?.role || null;

            return {
                _id: committee._id,
                name: committee.name,
                department: committee.department_id?.name,
                session: committee.session_id?.name,
                role: isPresident ? 'President' : memberRole,
                internal_marks_published: committee.internal_marks_published,
                external_marks_published: committee.external_marks_published,
                isPresident,
                isMember: !isPresident && memberRole !== null
            };
        });

        res.status(200).json({
            success: true,
            committees: formattedCommittees
        });
    } catch (error) {
        console.error('Get Teacher Committees Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch committees',
            error: error.message
        });
    }
};



// Helper function to calculate final external mark
function calculateFinalMark(externalExam) {
    if (!externalExam) return null;

    // If both first and second examiners have submitted
    if (externalExam.first_examiner_mark !== null && externalExam.second_examiner_mark !== null) {

        // If third examiner is required and has submitted
        if (externalExam.is_third_examiner_required && externalExam.third_examiner_mark !== null) {
            // Calculate differences between each pair of examiners
            const diff12 = Math.abs(externalExam.first_examiner_mark - externalExam.second_examiner_mark);
            const diff23 = Math.abs(externalExam.second_examiner_mark - externalExam.third_examiner_mark);
            const diff31 = Math.abs(externalExam.third_examiner_mark - externalExam.first_examiner_mark);

            // Find which pair has the smallest difference
            if (diff12 <= diff23 && diff12 <= diff31) {
                // First and second examiners are closest
                return (externalExam.first_examiner_mark + externalExam.second_examiner_mark) / 2;
            } else if (diff23 <= diff12 && diff23 <= diff31) {
                // Second and third examiners are closest
                return (externalExam.second_examiner_mark + externalExam.third_examiner_mark) / 2;
            } else {
                // Third and first examiners are closest
                return (externalExam.third_examiner_mark + externalExam.first_examiner_mark) / 2;
            }
        }

        // If only first and second examiner marks are available, average them
        return (externalExam.first_examiner_mark + externalExam.second_examiner_mark) / 2;
    }

    return null;
}



// Fix the getTeacherCommittees function
exports.getTeacherCommittees = async (req, res) => {
    try {
        const teacherId = req.teacherId;

        // Find committees where teacher is president or member_1
        const committees = await ExamCommittee.find({
            $or: [
                { president_id: teacherId },
                { member_1_id: teacherId }
            ]
        }).populate([
            { path: 'department_id', select: 'name' },
            { path: 'session_id', select: 'name' },
            { path: 'president_id', select: 'name email' },
            { path: 'member_1_id', select: 'name email' },
            { path: 'member_2_id', select: 'name email' }
        ]);

        // Format the response with role information
        const formattedCommittees = committees.map(committee => {
            const isPresident = committee.president_id._id.toString() === teacherId.toString();
            const isMember1 = committee.member_1_id._id.toString() === teacherId.toString();

            return {
                _id: committee._id,
                name: committee.name,
                department: committee.department_id?.name,
                session: committee.session_id?.name,
                role: isPresident ? 'President' : (isMember1 ? 'Internal Examiner' : null),
                internal_marks_published: committee.internal_marks_published,
                external_marks_published: committee.external_marks_published,
                isPresident,
                isMember: isMember1
            };
        });

        res.status(200).json({
            success: true,
            committees: formattedCommittees
        });
    } catch (error) {
        console.error('Get Teacher Committees Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch committees',
            error: error.message
        });
    }
};

// Fix the getCommitteeMarks function
exports.getCommitteeMarks = async (req, res) => {
    try {
        const { committeeId } = req.params;
        const teacherId = req.teacherId;

        // Verify teacher is part of this committee
        const committee = await ExamCommittee.findById(committeeId).populate([
            { path: 'president_id', select: 'name email' },
            { path: 'member_1_id', select: 'name email' },
            { path: 'member_2_id', select: 'name email' }
        ]);

        if (!committee) {
            return res.status(404).json({
                success: false,
                message: 'Committee not found'
            });
        }

        const isCommitteeMember =
            committee.president_id._id.toString() === teacherId.toString() ||
            committee.member_1_id._id.toString() === teacherId.toString();

        if (!isCommitteeMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view marks for this committee'
            });
        }

        // Get all course assignments for this committee
        const courseAssignments = await CourseAssignment.find({
            exam_committee_id: committeeId
        }).populate([
            { path: 'course_id', select: 'course_code course_name credit' },
            { path: 'semester_id', select: 'name' }
        ]);

        // Get all exams and their marks for these course assignments
        const results = await Promise.all(courseAssignments.map(async (ca) => {
            const exams = await Exam.find({ course_assignment_id: ca._id })
                .populate('student_id', 'registration_number roll_number name');

            const examDetails = await Promise.all(exams.map(async (exam) => {
                const internalExam = await InternalExam.findOne({ exam_id: exam._id });
                const externalExam = await ExternalExam.findOne({ exam_id: exam._id });

                return {
                    examId: exam._id,
                    student: exam.student_id,
                    status: exam.status,
                    internalMarks: internalExam ? {
                        first_exam_mark: internalExam.first_exam_mark,
                        second_exam_mark: internalExam.second_exam_mark,
                        third_exam_mark: internalExam.third_exam_mark,
                        attendance_mark: internalExam.attendance_mark,
                        total: internalExam.first_exam_mark + internalExam.second_exam_mark +
                            internalExam.third_exam_mark + internalExam.attendance_mark
                    } : null,
                    externalMarks: externalExam ? {
                        first_examiner_mark: externalExam.first_examiner_mark,
                        second_examiner_mark: externalExam.second_examiner_mark,
                        third_examiner_mark: externalExam.third_examiner_mark,
                        is_third_examiner_required: externalExam.is_third_examiner_required,
                        final_mark: calculateFinalMark(externalExam)
                    } : null
                };
            }));

            return {
                courseAssignment: {
                    _id: ca._id,
                    course: ca.course_id,
                    semester: ca.semester_id,
                    first_examiner: ca.first_examiner_type === 'Teacher' ?
                        await Teacher.findById(ca.first_examiner_id).select('name') :
                        await ExternalTeacher.findById(ca.first_examiner_id).select('name'),
                    second_examiner: ca.second_examiner_type === 'Teacher' ?
                        await Teacher.findById(ca.second_examiner_id).select('name') :
                        await ExternalTeacher.findById(ca.second_examiner_id).select('name'),
                    third_examiner: ca.third_examiner_id ? (ca.third_examiner_type === 'Teacher' ?
                        await Teacher.findById(ca.third_examiner_id).select('name') :
                        await ExternalTeacher.findById(ca.third_examiner_id).select('name')) : null
                },
                exams: examDetails
            };
        }));

        // Get approval status for this committee
        const semesters = [...new Set(courseAssignments.map(ca => ca.semester_id))];
        const approvalStatuses = await Promise.all(semesters.map(async (semesterId) => {
            return await ApprovalStatus.findOne({
                exam_committee_id: committeeId,
                semester_id: semesterId
            });
        }));

        res.status(200).json({
            success: true,
            committee: {
                name: committee.name,
                internal_marks_published: committee.internal_marks_published,
                external_marks_published: committee.external_marks_published
            },
            approvalStatuses,
            results
        });
    } catch (error) {
        console.error('Get Committee Marks Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch marks',
            error: error.message
        });
    }
};

// Fix the approveMarks function
exports.approveMarks = async (req, res) => {
    try {
        const { committeeId, semesterId, markType, comments } = req.body; // markType: 'internal' or 'external'
        const teacherId = req.teacherId;

        if (!['internal', 'external'].includes(markType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid mark type. Must be "internal" or "external"'
            });
        }

        // Find the committee
        const committee = await ExamCommittee.findById(committeeId);
        if (!committee) {
            return res.status(404).json({
                success: false,
                message: 'Committee not found'
            });
        }

        // Check if user is president or member_1
        const isPresident = committee.president_id.toString() === teacherId.toString();

        if (!isPresident) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to approve marks for this committee'
            });
        }

        // Find or create approval status
        let approvalStatus = await ApprovalStatus.findOne({
            exam_committee_id: committeeId,
            semester_id: semesterId
        });

        if (!approvalStatus) {
            approvalStatus = await ApprovalStatus.create({
                exam_committee_id: committeeId,
                semester_id: semesterId
            });
        }

        // Update the approval status using the model's method
        await approvalStatus.updateMarkStatus(
            markType,
            'approved',
            teacherId,
            'Teacher'
        );

        // Update comments if provided
        if (comments) {
            approvalStatus.comments = comments;
            await approvalStatus.save();
        }

        // Check if all semesters for this committee have been approved
        const semestersForCommittee = await CourseAssignment.distinct('semester_id', {
            exam_committee_id: committeeId
        });

        const allApprovalStatuses = await ApprovalStatus.find({
            exam_committee_id: committeeId,
            semester_id: { $in: semestersForCommittee }
        });

        const allSemestersApproved =
            semestersForCommittee.length === allApprovalStatuses.length &&
            allApprovalStatuses.every(status =>
                status[`${markType}_mark_status`] === 'approved'
            );

        // If all semesters are approved, update the committee published status
        if (allSemestersApproved) {
            const publishUpdate = {};
            publishUpdate[markType === 'internal' ? 'internal_marks_published' : 'external_marks_published'] = true;

            await ExamCommittee.findByIdAndUpdate(
                committeeId,
                publishUpdate
            );
        }

        res.status(200).json({
            success: true,
            message: `${markType.charAt(0).toUpperCase() + markType.slice(1)} marks approved successfully`,
            approvalStatus
        });
    } catch (error) {
        console.error('Approve Marks Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve marks',
            error: error.message
        });
    }
};