const jwt = require('jsonwebtoken');
const ExternalTeacher = require('../models/externalTeacher.model');

const externalTeacherAuth = async (req, res, next) => {
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
        const decoded = jwt.verify(token, process.env.SECRET_KEY_EXTERNAL_TEACHER);

        // Find external teacher by id
        const externalTeacher = await ExternalTeacher.findById(decoded._id);

        if (!externalTeacher) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. External teacher not found'
            });
        }

        // Add external teacher to request object
        req.externalTeacher = externalTeacher;
        req.externalTeacherId = externalTeacher._id;

        next();
    } catch (error) {
        console.error('External Teacher Auth Middleware Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token or session expired',
            error: error.message
        });
    }
};

module.exports = externalTeacherAuth;