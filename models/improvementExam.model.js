const mongoose = require('mongoose');

const improvementExamSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    exam_committee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamCommittee',
        required: true
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    semester_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'scheduled', 'rejected', 'completed'],
        default: 'pending'
    },
    requested_date: {
        type: Date,
        default: Date.now
    },
    exam_date: {
        type: Date
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});

// Add indexes for better performance
improvementExamSchema.index({ student_id: 1 });
improvementExamSchema.index({ exam_committee_id: 1 });
improvementExamSchema.index({ course_id: 1 });
improvementExamSchema.index({ status: 1 });

const ImprovementExam = mongoose.model('ImprovementExam', improvementExamSchema);

module.exports = ImprovementExam;