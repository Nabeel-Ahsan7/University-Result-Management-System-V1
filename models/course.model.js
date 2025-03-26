const mongoose = require('mongoose');
const Department = require('./department.model');

const courseSchema = new mongoose.Schema({
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Department ID is required']
    },
    course_code: {
        type: String,
        required: [true, 'Course code is required'],
        trim: true,
        uppercase: true
    },
    course_name: {
        type: String,
        required: [true, 'Course name is required'],
        trim: true
    },
    credit: {
        type: Number,
        required: [true, 'Credit hours are required'],
        min: [0.5, 'Credit hours must be at least 0.5'],
        max: [10, 'Credit hours cannot exceed 10']
    }
}, {
    timestamps: true
});

// Create a compound index to ensure course codes are unique within a department
courseSchema.index({ course_code: 1, department_id: 1 }, { unique: true });

// Adding a pre-save hook to validate that the referenced department exists
courseSchema.pre('save', async function (next) {
    try {
        const department = await Department.findById(this.department_id);

        if (!department) {
            throw new Error('Referenced department does not exist');
        }

        next();
    } catch (error) {
        next(error);
    }
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
