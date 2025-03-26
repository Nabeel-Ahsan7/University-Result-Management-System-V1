const jwt = require('jsonwebtoken');
const Student = require('../models/student.model');

exports.protect = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        // Verify token - use the same secret key as defined in the student model
        const decoded = jwt.verify(token, process.env.SECRET_KEY_STUDENT);

        // Find student by id
        const student = await Student.findById(decoded._id);
        if (!student) {
            return res.status(401).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Attach student to request object
        req.student = student;
        req.studentId = student._id;
        next();
    } catch (error) {
        console.error('Auth Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};