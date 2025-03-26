const Notice = require('../models/notice.model');
const ExamCommittee = require('../models/examCommittee.model');
const fs = require('fs');
const path = require('path');

// Create a new notice
exports.createNotice = async (req, res) => {
    try {
        const { exam_committee_id, title, description } = req.body;

        // Validate required fields
        if (!exam_committee_id || !title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: exam_committee_id, title, and description are required'
            });
        }

        // Check if exam committee exists
        const examCommittee = await ExamCommittee.findById(exam_committee_id);
        if (!examCommittee) {
            return res.status(404).json({
                success: false,
                message: 'Exam committee not found'
            });
        }

        // Process uploaded files
        let document_urls = [];
        if (req.files && req.files.length > 0) {
            document_urls = req.files.map(file => `/uploads/notices/${file.filename}`);
        }

        // Create new notice
        const notice = new Notice({
            exam_committee_id,
            title,
            description,
            document_urls
        });

        await notice.save();

        // Populate exam committee data
        await notice.populate({
            path: 'exam_committee_id',
            select: 'name department_id session_id',
            populate: [
                { path: 'department_id', select: 'name' },
                { path: 'session_id', select: 'name' }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Notice created successfully',
            notice
        });
    } catch (error) {
        console.error('Create Notice Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all notices with optional filtering by exam committee
exports.getAllNotices = async (req, res) => {
    try {
        const { exam_committee_id } = req.query;

        // Build query
        let query = {};
        if (exam_committee_id) {
            query.exam_committee_id = exam_committee_id;
        }

        const notices = await Notice.find(query)
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
            count: notices.length,
            notices
        });
    } catch (error) {
        console.error('Get All Notices Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get a single notice by ID
exports.getNoticeById = async (req, res) => {
    try {
        const { id } = req.params;

        const notice = await Notice.findById(id)
            .populate({
                path: 'exam_committee_id',
                select: 'name department_id session_id',
                populate: [
                    { path: 'department_id', select: 'name' },
                    { path: 'session_id', select: 'name' }
                ]
            });

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        res.status(200).json({
            success: true,
            notice
        });
    } catch (error) {
        console.error('Get Notice Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update a notice
exports.updateNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, exam_committee_id } = req.body;

        // Find notice
        const notice = await Notice.findById(id);
        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        // Check if exam committee exists if ID is provided
        if (exam_committee_id) {
            const examCommittee = await ExamCommittee.findById(exam_committee_id);
            if (!examCommittee) {
                return res.status(404).json({
                    success: false,
                    message: 'Exam committee not found'
                });
            }
        }

        // Process new uploaded files
        let document_urls = [...notice.document_urls];
        if (req.files && req.files.length > 0) {
            const newUrls = req.files.map(file => `/uploads/notices/${file.filename}`);
            document_urls = [...document_urls, ...newUrls];
        }

        // Update notice
        const updatedNotice = await Notice.findByIdAndUpdate(
            id,
            {
                title: title || notice.title,
                description: description || notice.description,
                exam_committee_id: exam_committee_id || notice.exam_committee_id,
                document_urls
            },
            { new: true, runValidators: true }
        ).populate({
            path: 'exam_committee_id',
            select: 'name department_id session_id',
            populate: [
                { path: 'department_id', select: 'name' },
                { path: 'session_id', select: 'name' }
            ]
        });

        res.status(200).json({
            success: true,
            message: 'Notice updated successfully',
            notice: updatedNotice
        });
    } catch (error) {
        console.error('Update Notice Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete a notice
exports.deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;

        const notice = await Notice.findById(id);
        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        // Delete associated files
        if (notice.document_urls && notice.document_urls.length > 0) {
            notice.document_urls.forEach(url => {
                const filePath = path.join(__dirname, '..', url);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        // Delete notice from database
        await Notice.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Notice deleted successfully'
        });
    } catch (error) {
        console.error('Delete Notice Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete a specific document from a notice
exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { documentUrl } = req.body;

        if (!documentUrl) {
            return res.status(400).json({
                success: false,
                message: 'Document URL is required'
            });
        }

        const notice = await Notice.findById(id);
        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        // Check if document exists in the notice
        if (!notice.document_urls.includes(documentUrl)) {
            return res.status(404).json({
                success: false,
                message: 'Document not found in notice'
            });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', documentUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove document URL from notice
        const updatedUrls = notice.document_urls.filter(url => url !== documentUrl);
        const updatedNotice = await Notice.findByIdAndUpdate(
            id,
            { document_urls: updatedUrls },
            { new: true, runValidators: true }
        ).populate({
            path: 'exam_committee_id',
            select: 'name department_id session_id',
            populate: [
                { path: 'department_id', select: 'name' },
                { path: 'session_id', select: 'name' }
            ]
        });

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully',
            notice: updatedNotice
        });
    } catch (error) {
        console.error('Delete Document Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};