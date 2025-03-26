const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    course_assignment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseAssignment',
        required: [true, 'Course assignment is required']
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student is required']
    },
    student_type: {
        type: String,
        enum: ['regular', 'improve'],
        required: [true, 'Student type is required'],
        default: 'regular'
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Compound index to ensure a student doesn't have multiple exams for the same course assignment and type
examSchema.index({ course_assignment_id: 1, student_id: 1, student_type: 1 }, { unique: true });

examSchema.virtual('internalExam', {
    ref: 'InternalExam',
    localField: '_id',
    foreignField: 'exam_id',
    justOne: true
});

examSchema.virtual('externalExam', {
    ref: 'ExternalExam',
    localField: '_id',
    foreignField: 'exam_id',
    justOne: true
});

// Enable virtuals in JSON
examSchema.set('toJSON', { virtuals: true });
examSchema.set('toObject', { virtuals: true });

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;