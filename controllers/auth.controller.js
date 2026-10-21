// controllers/auth.controller.js
const AuthService = require("../services/auth.service");

const authContoller = {
    async signup(req, res) {
        try {
            const result = await AuthService.signup(req.body);
            
            saveCookie(res, result.token);

            req.flash('success', result.message || 'Account created successfully.');
            res.redirect('/');
        } catch (error) {
            res.status(error.statusCode || 500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    async signin(req, res) {
        try {
            const result = await AuthService.signin(req.body);
            saveCookie(res, result.token);

            redirect(result.user, req, res);
        } catch (error) {
            res.status(error.statusCode || 500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    async forgotPassword(req, res) {
        try {
            const result = await AuthService.forgotPassword(req.body.email);

            // Intentionally no token returned in response (security)
            res.redirect(`/forgot-password?q=${result.message}`);
        } catch (error) {
            res.status(error.statusCode || 500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    async resetPassword(req, res) {
        try {
            const result = await AuthService.resetPassword(
                req.query.token,
                req.body.password
            );

            res.redirect(`/signin?q=${result.message}`);
        } catch (error) {
            res.status(error.statusCode || 500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    async refreshToken(req, res) {
        try {
            const oldToken = req.cookies.token;
            if (!oldToken) {
                return res.status(401).json({
                    status: 'error',
                    message: 'No token provided'
                });
            }

            const result = await AuthService.refreshToken(oldToken);

            saveCookie(res, result.token);

            res.status(200).json({
                status: 'success',
                ...result
            });
        } catch (error) {
            res.status(error.statusCode || 401).json({
                status: 'error',
                message: error.message
            });
        }
    },

    async signWithGoogle(req, res) {
        // fail-safe: passport failed to attach a user
        if (!req.user) {
            return res.redirect('/auth/signin');
        }
        redirect(req.user, req, res);
    },

    logout(req, res, next) {
        req.logout(err => {
            if (err) return next(err);
            // Rotate the session instead of destroying it.
            // destroy() would DELETE the flash message we just wrote (flash lives in the session),
            // so the next request would show nothing. regenerate() empties the old session data
            // (real logout + session-fixation protection) and gives us a fresh session to hold
            // the flash message across the redirect.
            req.session.regenerate(err => {
                if (err) return next(err);

                // flash must be written AFTER regenerate, into the new session
                req.flash('success', 'Signed out successfully!');

                // Clear the JWT cookie too, otherwise optionalAuthenticate keeps the user "logged in"
                res.clearCookie('token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
                });
                // NOTE: do NOT clearCookie('connect.sid') here — express-session sends a NEW
                // session cookie (with the flash) on this response; clearing would fight it.
                res.redirect('/');
            });
        });
    }
}

/* -------------------- COOKIE HELPER -------------------- */
function saveCookie(res, token) {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
}

/* -------------------- Redirect HELPER -------------------- */
function redirect(user, req, res) {
    // Guard against a missing user (e.g. a failed/unset OAuth session)
    if (!user) {
        req.flash('error', 'Authentication required. Please sign in.');
        return res.redirect('/signin');
    }

    req.flash("success", "Signed in successfully!");

    // Redirect based on role
    if (user.role === "admin") {
        res.redirect("/admin/dashboard");
    } else {
        res.redirect("/");
    }
}

module.exports = authContoller;