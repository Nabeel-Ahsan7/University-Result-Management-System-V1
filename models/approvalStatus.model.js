const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the possible status values as constants
const STATUS_VALUES = ['pending', 'approved', 'rejected'];
const APPROVER_TYPES = ['Admin', 'Teacher', 'ExternalTeacher'];

const approvalStatusSchema = new Schema({
    exam_committee_id: {
        type: Schema.Types.ObjectId,
        ref: 'ExamCommittee',
        required: [true, 'Exam committee is required']
    },
    semester_id: {
        type: Schema.Types.ObjectId,
        ref: 'Semester',
        required: [true, 'Semester is required']
    },
    internal_mark_status: {
        type: String,
        enum: {
            values: STATUS_VALUES,
            message: 'Status must be one of: pending, approved, rejected'
        },
        default: 'pending'
    },
    external_mark_status: {
        type: String,
        enum: {
            values: STATUS_VALUES,
            message: 'Status must be one of: pending, approved, rejected'
        },
        default: 'pending'
    },
    // Updated fields to support different approver types
    internal_approved_by: {
        id: {
            type: Schema.Types.ObjectId,
            default: null
        },
        type: {
            type: String,
            enum: APPROVER_TYPES,
            default: null
        }
    },
    external_approved_by: {
        id: {
            type: Schema.Types.ObjectId,
            default: null
        },
        type: {
            type: String,
            enum: APPROVER_TYPES,
            default: null
        }
    },
    internal_approval_date: {
        type: Date,
        default: null
    },
    external_approval_date: {
        type: Date,
        default: null
    },
    comments: {
        type: String,
        default: ''
    }
}, {
    timestamps: true // This automatically adds createdAt and updatedAt fields
});

// Create a compound index to ensure uniqueness of committee + semester combination
approvalStatusSchema.index({ exam_committee_id: 1, semester_id: 1 }, { unique: true });

// Add a static method to check/create status for a committee and semester
approvalStatusSchema.statics.findOrCreateStatus = async function (committeeId, semesterId) {
    let status = await this.findOne({
        exam_committee_id: committeeId,
        semester_id: semesterId
    });

    if (!status) {
        status = await this.create({
            exam_committee_id: committeeId,
            semester_id: semesterId
        });
    }

    return status;
};

// Helper method to update mark status
approvalStatusSchema.methods.updateMarkStatus = async function (markType, status, approverId, approverType) {
    if (markType !== 'internal' && markType !== 'external') {
        throw new Error('Mark type must be either "internal" or "external"');
    }

    const statusField = `${markType}_mark_status`;
    const approverField = `${markType}_approved_by`;
    const dateField = `${markType}_approval_date`;

    this[statusField] = status;

    if (status === 'approved' || status === 'rejected') {
        this[approverField] = {
            id: approverId,
            type: approverType
        };
        this[dateField] = new Date();
    }

    return this.save();
};

const ApprovalStatus = mongoose.model('ApprovalStatus', approvalStatusSchema);

module.exports = ApprovalStatus;