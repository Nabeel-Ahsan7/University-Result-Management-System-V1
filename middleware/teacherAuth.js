const jwt = require('jsonwebtoken');
const Teacher = require('../models/teacher.model');

const teacherAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.SECRET_KEY_TEACHER);

        // Find teacher by id
        const teacher = await Teacher.findById(decoded._id);

        if (!teacher) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Teacher not found'
            });
        }

        // Add teacher to request object
        req.teacher = teacher;
        req.teacherId = teacher._id;

        next();
    } catch (error) {
        console.error('Teacher Auth Middleware Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token or session expired',
            error: error.message
        });
    }
};

module.exports = teacherAuth;