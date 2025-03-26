const mongoose = require('mongoose');
const Faculty = require('./faculty.model');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Department name is required'],
        trim: true
    },
    faculty_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: [true, 'Faculty ID is required']
    }
}, {
    timestamps: true
});

// Middleware to validate that faculty_id exists before saving
departmentSchema.pre('save', async function (next) {
    try {
        const faculty = await Faculty.findById(this.faculty_id);
        if (!faculty) {
            throw new Error('Faculty does not exist');
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Create a compound index to ensure department names are unique within a faculty
departmentSchema.index({ name: 1, faculty_id: 1 }, { unique: true });

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;