const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    exam_committee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamCommittee',
        required: [true, 'Exam committee is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    document_urls: [{
        type: String
    }]
}, {
    timestamps: true
});

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;