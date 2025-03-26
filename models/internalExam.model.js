const mongoose = require('mongoose');

const internalExamSchema = new mongoose.Schema({
    exam_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: [true, 'Exam reference is required'],
        unique: true
    },
    first_exam_mark: {
        type: Number,
        min: 0,
        max: 10,
        default: null
    },
    second_exam_mark: {
        type: Number,
        min: 0,
        max: 10,
        default: null
    },
    third_exam_mark: {
        type: Number,
        min: 0,
        max: 10,
        default: null
    },
    attendance_mark: {
        type: Number,
        min: 0,
        max: 10,
        default: null
    },
    submitted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    submitted_at: {
        type: Date
    }
}, {
    timestamps: true
});

const InternalExam = mongoose.model('InternalExam', internalExamSchema);

module.exports = InternalExam;