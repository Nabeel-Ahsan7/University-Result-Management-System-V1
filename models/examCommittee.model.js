const mongoose = require('mongoose');

const examCommitteeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Committee name is required'],
        trim: true
    },
    session_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: [true, 'Session is required']
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Department is required']
    },
    semesters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: [true, 'At least one semester is required']
    }],
    president_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: [true, 'Committee president is required']
    },
    member_1_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: [true, 'Committee member 1 is required']
    },
    member_2_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExternalTeacher',
        required: [true, 'Committee member 2 is required']
    },
    is_active: {
        type: Boolean,
        default: true
    },
    internal_marks_published: { type: Boolean, default: false },
    external_marks_published: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Add a unique constraint to prevent duplicate committees for the same session and department
examCommitteeSchema.index({ session_id: 1, department_id: 1, name: 1 }, { unique: true });

const ExamCommittee = mongoose.model('ExamCommittee', examCommitteeSchema);

module.exports = ExamCommittee;