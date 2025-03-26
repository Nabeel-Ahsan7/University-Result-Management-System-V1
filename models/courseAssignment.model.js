const mongoose = require('mongoose');

const courseAssignmentSchema = new mongoose.Schema({
    exam_committee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamCommittee',
        required: [true, 'Exam committee is required']
    },
    semester_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: [true, 'Semester is required']
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course is required']
    },
    first_examiner_id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'first_examiner_type',
        required: [true, 'First examiner is required']
    },
    first_examiner_type: {
        type: String,
        required: true,
        enum: ['Teacher', 'ExternalTeacher']
    },
    second_examiner_id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'second_examiner_type',
        required: [true, 'Second examiner is required']
    },
    second_examiner_type: {
        type: String,
        required: true,
        enum: ['Teacher', 'ExternalTeacher']
    },
    third_examiner_id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'third_examiner_type',
        required: false
    },
    third_examiner_type: {
        type: String,
        required: function () {
            return this.third_examiner_id != null;
        },
        enum: ['Teacher', 'ExternalTeacher']
    }
}, {
    timestamps: true
});

// Validation to ensure all examiners are different
courseAssignmentSchema.pre('validate', function (next) {
    const firstId = this.first_examiner_id.toString();
    const secondId = this.second_examiner_id.toString();

    if (firstId === secondId) {
        return next(new Error('All examiners must be different'));
    }

    // Only check third examiner if it exists
    if (this.third_examiner_id) {
        const thirdId = this.third_examiner_id.toString();
        if ((firstId === thirdId && this.third_examiner_type === 'Teacher') ||
            (secondId === thirdId && this.third_examiner_type === 'Teacher')) {
            return next(new Error('All examiners must be different'));
        }
    }
    next();
});

// Add a unique constraint to prevent duplicate assignments for the same committee, semester, and course
courseAssignmentSchema.index({ exam_committee_id: 1, semester_id: 1, course_id: 1 }, { unique: true });

const CourseAssignment = mongoose.model('CourseAssignment', courseAssignmentSchema);

module.exports = CourseAssignment;