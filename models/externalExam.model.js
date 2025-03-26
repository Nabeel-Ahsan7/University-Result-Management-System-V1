const mongoose = require('mongoose');

const externalExamSchema = new mongoose.Schema({
    exam_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: [true, 'Exam reference is required'],
        unique: true
    },
    first_examiner_mark: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    second_examiner_mark: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    third_examiner_mark: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    is_third_examiner_required: {
        type: Boolean,
        default: false
    },
    first_submitted_by: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'first_submitted_by_type'
    },
    first_submitted_by_type: {
        type: String,
        enum: ['Teacher', 'ExternalTeacher']
    },
    first_submitted_at: {
        type: Date
    },
    second_submitted_by: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'second_submitted_by_type'
    },
    second_submitted_by_type: {
        type: String,
        enum: ['Teacher', 'ExternalTeacher']
    },
    second_submitted_at: {
        type: Date
    },
    third_submitted_by: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'third_submitted_by_type'
    },
    third_submitted_by_type: {
        type: String,
        enum: ['Teacher', 'ExternalTeacher']
    },
    third_submitted_at: {
        type: Date
    }
}, {
    timestamps: true
});

const ExternalExam = mongoose.model('ExternalExam', externalExamSchema);

module.exports = ExternalExam;