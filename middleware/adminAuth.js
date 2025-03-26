const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

// Make sure this is a function, not an object
const adminAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log(token)
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.SECRET_KEY_ADMIN);

        // Find admin by id
        const admin = await Admin.findById(decoded._id);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Admin not found'
            });
        }

        // Add admin to request object
        req.admin = admin;
        req.adminId = admin._id;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token or session expired',
            error: error.message
        });
    }
};

// Make sure we're exporting the function correctly
module.exports = adminAuth;