const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Department = require('./department.model');
const Session = require('./session.model');

const studentSchema = new mongoose.Schema({
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
    registration_number: {
        type: String,
        required: [true, 'Registration number is required'],
        unique: true,
        trim: true
    },
    roll_number: {
        type: String,
        required: [true, 'Roll number is required'],
        trim: true
    },
    admission_session_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: [true, 'Admission session is required']
    },
    current_session_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: [true, 'Current session is required']
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Department is required']
    },
    type: {
        type: String,
        required: [true, 'Student type is required'],
        enum: ['undergraduate', 'graduate', 'masters', 'phd'],
        default: 'undergraduate'
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
});

// Create a compound index to ensure roll_number is unique within a department and session
studentSchema.index({ roll_number: 1, department_id: 1, current_session_id: 1 }, { unique: true });

// Adding a pre-save hook to validate that the referenced department exists
studentSchema.pre('save', async function (next) {
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

// Adding a pre-save hook to validate that the referenced admission session exists
studentSchema.pre('save', async function (next) {
    try {
        const session = await Session.findById(this.admission_session_id);

        if (!session) {
            throw new Error('Referenced admission session does not exist');
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Hash password before saving
studentSchema.pre('save', async function (next) {
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
studentSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
studentSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.SECRET_KEY_STUDENT,
        { expiresIn: '30d' }
    );
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;