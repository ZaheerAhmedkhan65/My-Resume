// services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');

class AuthService {

    /* -------------------- SIGNUP -------------------- */
    static async signup(user) {
        const existingUser = await User.findByEmail(user.email);
        if (existingUser) {
            const token = this.generateToken(existingUser);
            return {
                user: {
                    id: existingUser.id,
                    email: existingUser.email,
                    name: existingUser.name,
                    role: existingUser.role,
                    profile: existingUser.profile
                },
                token,
                message: 'Account already exists.'
            }
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);

        const newUser = await User.create({
            ...user,
            password: hashedPassword
        });

        const token = this.generateToken(newUser);

        return {
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                profile: newUser.profile
            },
            token,
            message: 'Account created successfully.'
        };
    }

    /* -------------------- SIGNIN -------------------- */
    static async signin({ email, password }) {
        const user = await User.findByEmail(email);
        
        // Unified error → prevents user enumeration
        if (!user) {
            throw new AppError('Invalid Email or password', 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid Email or password', 401);
        }

        const token = this.generateToken(user);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile
            },
            token,
            message: 'Signed in successfully'
        };
    }

    /* -------------------- FORGOT PASSWORD -------------------- */
    static async forgotPassword(email) {
        const user = await User.findByEmail(email);
        // Silent success → security best practice
        if (!user) {
            return { message: 'If an account exists, a reset link was sent.' };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

        await User.setResetToken(email, resetToken, resetTokenExpiry);

        return {
            message: 'Password reset email sent. Check your gmail inbox.'
        };
    }

    /* -------------------- RESET PASSWORD -------------------- */
    static async resetPassword(token, newPassword) {
        const user = await User.findByResetToken(token);

        if (!user) {
            throw new AppError('Invalid or expired reset token', 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePassword(user.id, hashedPassword);

        return {
            message: 'Password reset successfully'
        };
    }

    /* -------------------- REFRESH TOKEN -------------------- */
    static async refreshToken(oldToken) {
        let decoded;

        try {
            decoded = jwt.verify(oldToken, process.env.SECRET_KEY, {
                ignoreExpiration: true
            });
        } catch {
            throw new AppError('Invalid token', 401);
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            throw new AppError('User no longer exists', 401);
        }

        const newToken = this.generateToken(user);

        return {
            token: newToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile,
                emailNotifications: user.emailNotifications
            },
            message: 'Token refreshed successfully'
        };
    }

    /* -------------------- TOKEN HELPERS -------------------- */
    static generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile,
                emailNotifications: user.emailNotifications,
            },
            process.env.SECRET_KEY,
            {
                expiresIn: process.env.JWT_EXPIRY || '7d',
                issuer: process.env.JWT_ISSUER || 'VU Empire Genie'
            }
        );
    }

    static verifyToken(token) {
        try {
            return jwt.verify(token, process.env.SECRET_KEY);
        } catch {
            throw new AppError('Invalid token', 401);
        }
    }

}

module.exports = AuthService;