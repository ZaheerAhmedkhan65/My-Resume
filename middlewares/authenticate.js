// middlewares/authenticate.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware that supports both JWT and Session (Google OAuth)
 * - Checks for JWT token in cookies, Authorization header, or query string
 * - Verifies user account is not deleted
 * - Falls back to session authentication (for Google OAuth)
 * - Sets req.user from either method
 */
const authenticate = async (req, res, next) => {
    // First, try to authenticate via JWT token
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1] || req.query.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            // Check if user account still exists and is not deleted
            const user = await User.getById(decoded.id);
            if (!user) {
                res.clearCookie('token');
                return res.status(401).json({
                    status: 'error',
                    message: 'Account no longer exists'
                });
            }

            if (user.status === 'deleted') {
                res.clearCookie('token');
                return res.status(403).json({
                    status: 'error',
                    message: 'Account has been deleted'
                });
            }

            req.user = decoded;
            return next();
        } catch (err) {
            // Token is invalid, clear cookie and continue
            res.clearCookie('token');
            console.log('JWT verification failed:', err.message);
        }
    }
    // No valid authentication found
    if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ status: 'error', message: 'Access required! Please log in' });
    }

    return res.redirect('/auth/login');
};

/**
 * Optional authentication - sets user if authenticated via JWT or session, 
 * but doesn't block if not authenticated
 */
const optionalAuthenticate = (req, res, next) => {
    // Try JWT token first
    const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1] || req.query.token;
    if (token) {
        try {
            const user = jwt.verify(token, process.env.SECRET_KEY);
            req.user = user;
            return next();
        } catch (err) {
            // Token invalid, continue without error
        }
    }

    // Check session authentication
    if (req.isAuthenticated && req.isAuthenticated()) {
        // User is authenticated via session
        return next();
    }

    // No authentication, but that's okay for optional auth
    next();
};


module.exports = {
    authenticate,
    optionalAuthenticate
}