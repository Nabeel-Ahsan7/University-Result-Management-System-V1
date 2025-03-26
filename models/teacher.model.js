const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Department = mongoose.model('Department');


const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    designation: {
        type: String,
        required: [true, 'Designation is required'],
        trim: true
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Department is required']
    },
    phone_number: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
});

// Hash password before saving
teacherSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare entered password with hashed password
teacherSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
teacherSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.SECRET_KEY_TEACHER,
        { expiresIn: '30d' }
    );
};
// Check if department exists before saving
teacherSchema.pre('save', async function (next) {
    try {
        const departmentExists = await Department.findById(this.department_id);

        if (!departmentExists) {
            const error = new Error('Department not found');
            error.statusCode = 404;
            return next(error);
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Static method to check if department exists
teacherSchema.statics.checkDepartment = async function (departmentId) {
    try {
        const department = await Department.findById(departmentId);

        if (!department) {
            const error = new Error('Department not found');
            error.statusCode = 404;
            throw error;
        }
        return department;
    } catch (error) {
        throw error;
    }
};

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;