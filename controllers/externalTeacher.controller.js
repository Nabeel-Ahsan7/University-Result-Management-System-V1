const ExternalTeacher = require('../models/externalTeacher.model');
const InternalExam = require('../models/internalExam.model');
const ExternalExam = require('../models/externalExam.model');
const CourseAssignment = require('../models/courseAssignment.model');
const Exam = require('../models/exam.model');
const Notice = require('../models/notice.model');
const Teacher = require('../models/teacher.model'); // Add this
const ExamCommittee = require('../models/examCommittee.model'); // Add this
const ApprovalStatus = require('../models/approvalStatus.model'); // Add this

// External teacher login
exports.loginExternalTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find external teacher by email with password included
        const externalTeacher = await ExternalTeacher.findOne({ email: email.toLowerCase() }).select('+password');

        if (!externalTeacher) {
            return res.status(404).json({
                success: false,
                message: 'External teacher not found'
            });
        }

        // Check password
        const isMatch = await externalTeacher.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = externalTeacher.generateAuthToken();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            externalTeacher: {
                id: externalTeacher._id,
                name: externalTeacher.name,
                email: externalTeacher.email,
                designation: externalTeacher.designation,
                department: externalTeacher.department,
                university_name: externalTeacher.university_name
            }
        });
    } catch (error) {
        console.error('External Teacher Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get external teacher profile
exports.getProfile = async (req, res) => {
    try {
        // External teacher is added to req by the auth middleware
        const externalTeacher = await ExternalTeacher.findById(req.externalTeacherId)
            .select('-password');

        if (!externalTeacher) {
            return res.status(404).json({
                success: false,
                message: 'External teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            externalTeacher
        });
    } catch (error) {
        console.error('Get External Teacher Profile Error:', error);
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
        const examinerId = req.examiner._id;
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

// Update the submitInternalMarks function

exports.submitInternalMarks = async (req, res) => {
    try {
        // PROBLEM: You're using req.body or req.params incorrectly as an ID

        // Get marks array from request body
        const marks = req.body.courseAssignmentId.marks;
        if (!marks || !Array.isArray(marks) || marks.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No marks provided or invalid format'
            });
        }

        // Process each mark individually
        let updatedCount = 0;
        for (const mark of marks) {
            const { exam_id, first_exam_mark, second_exam_mark, third_exam_mark, attendance_mark } = mark;

            // IMPORTANT: Find the internal exam by exam_id (not the entire request body)
            const internalExam = await InternalExam.findOneAndUpdate(
                { exam_id: exam_id }, // Correct way to query
                {
                    first_exam_mark,
                    second_exam_mark,
                    third_exam_mark,
                    attendance_mark
                },
                { new: true }
            );

            if (internalExam) updatedCount++;
        }

        return res.status(200).json({
            success: true,
            message: `Successfully updated ${updatedCount} internal marks`
        });

    } catch (error) {
        console.error('Submit Internal Marks Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating internal marks',
            error: error.message
        });
    }
};

// Submit external marks
exports.submitExternalMarks = async (req, res) => {
    try {
        const { examId, mark } = req.body;

        // FIX 1: Use req.examiner._id instead of req.userId
        const externalTeacherId = req.examiner._id;

        // Find the exam and course assignment
        const exam = await Exam.findById(examId)
            .populate('course_assignment_id');

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Determine examiner type (first, second, or third)
        const courseAssignment = exam.course_assignment_id;
        let examinerType = null;

        if (courseAssignment.third_examiner_id &&
            courseAssignment.third_examiner_id.toString() === externalTeacherId.toString() &&
            courseAssignment.third_examiner_type === 'ExternalTeacher') {
            examinerType = 'third';
        } else if (courseAssignment.second_examiner_id &&
            courseAssignment.second_examiner_id.toString() === externalTeacherId.toString() &&
            courseAssignment.second_examiner_type === 'ExternalTeacher') {
            examinerType = 'second';
        } else if (courseAssignment.first_examiner_id &&
            courseAssignment.first_examiner_id.toString() === externalTeacherId.toString() &&
            courseAssignment.first_examiner_type === 'ExternalTeacher') {
            examinerType = 'first';
        }


        if (!examinerType) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to submit marks for this exam'
            });
        }

        // Prepare update object
        const updateField = {};
        updateField[`${examinerType}_examiner_mark`] = mark;
        updateField[`${examinerType}_submitted_by`] = externalTeacherId;
        updateField[`${examinerType}_submitted_by_type`] = 'ExternalTeacher'; // Add this for ALL examiner types
        updateField[`${examinerType}_submitted_at`] = Date.now();

        // Update external marks
        const externalExam = await ExternalExam.findOneAndUpdate(
            { exam_id: examId },
            updateField,
            { new: true, upsert: true }
        );

        // Check if third examiner is needed
        if (examinerType === 'second' && externalExam.first_examiner_mark !== null) {
            const markDifference = Math.abs(externalExam.first_examiner_mark - mark);
            if (markDifference > 12) { // Threshold for third examiner
                await ExternalExam.findByIdAndUpdate(externalExam._id, {
                    is_third_examiner_required: true
                });
            }
        }

        // FIX 2: Use examId instead of req.body.exam_id
        await updateExamStatus(examId);

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

// Get notices for the external teacher based on their committee membership
exports.getExternalTeacherNotices = async (req, res) => {
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
        console.error('Get External Teacher Notices Error:', error);
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



// Get all marks for a committee
exports.getCommitteeMarks = async (req, res) => {
    try {
        const { committeeId } = req.params;
        const externalTeacherId = req.externalTeacherId;

        // Verify external teacher is part of this committee
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

        // Check if external teacher is member_2_id (which is the external teacher in your model)
        const isCommitteeMember = committee.member_2_id._id.toString() === externalTeacherId.toString();

        if (!isCommitteeMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view marks for this committee'
            });
        }

        // Rest of the function remains similar
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



// Fix the getExternalTeacherCommittees function
exports.getExternalTeacherCommittees = async (req, res) => {
    try {
        const externalTeacherId = req.externalTeacherId;

        // Find committees where external teacher is member_2_id
        const committees = await ExamCommittee.find({
            member_2_id: externalTeacherId
        }).populate([
            { path: 'department_id', select: 'name' },
            { path: 'session_id', select: 'name' },
            { path: 'president_id', select: 'name email' },
            { path: 'member_1_id', select: 'name email' },
            { path: 'member_2_id', select: 'name email' }
        ]);

        // Format the response
        const formattedCommittees = committees.map(committee => {
            return {
                _id: committee._id,
                name: committee.name,
                department: committee.department_id?.name,
                session: committee.session_id?.name,
                role: 'External Examiner', // External teacher is always member_2 with this role
                internal_marks_published: committee.internal_marks_published,
                external_marks_published: committee.external_marks_published,
                isPresident: false,
                isMember: true
            };
        });

        res.status(200).json({
            success: true,
            committees: formattedCommittees
        });
    } catch (error) {
        console.error('Get External Teacher Committees Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch committees',
            error: error.message
        });
    }
};