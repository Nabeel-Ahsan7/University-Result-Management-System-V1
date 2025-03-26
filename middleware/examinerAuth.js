const jwt = require('jsonwebtoken');
const ExternalTeacher = require('../models/externalTeacher.model');
const Teacher = require('../models/teacher.model.js');

const examinerAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided'
            });
        }

        // Try teacher token first
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY_TEACHER);
            const teacher = await Teacher.findById(decoded._id);

            if (teacher) {
                req.examiner = teacher;
                req.examinerType = 'Teacher';
                req.userId = teacher._id;
                return next();
            }
        } catch (teacherError) {
            try {
                const decoded = jwt.verify(token, process.env.SECRET_KEY_EXTERNAL_TEACHER);
                const externalTeacher = await ExternalTeacher.findById(decoded._id);

                if (externalTeacher) {
                    req.examiner = externalTeacher;
                    req.examinerType = 'ExternalTeacher';
                    req.userId = externalTeacher._id;
                    return next();
                }
            } catch (externalTeacherError) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token or session expired'
                });
            }
        }

        // If no valid examiner found
        return res.status(401).json({
            success: false,
            message: 'Not authorized as an examiner'
        });

    } catch (error) {
        console.error('Examiner Auth Middleware Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = examinerAuth;