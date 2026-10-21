const express = require('express');
const passport = require('passport');
const authContoller = require('../controllers/auth.controller');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/auth/signin',
        failureFlash: true
    }),
    authContoller.signWithGoogle
);

router.get('/signin', async (req, res) => {
    try {
        res.render('auth/signin', { user: req.user, title: 'Sign in Required!' });
    } catch (error) {
        req.flash('error', 'Failed to load signin page');
        res.status(500).render('error', { title: 'Error', message: 'Failed to load signin page' });
    }
});

router.get('/signup', async (req, res) => {
    try {
        res.render('auth/signup', { user: req.user, title: 'Sign up Required!' });
    } catch (error) {
        req.flash('error', 'Failed to load signup page');
        res.status(500).render('error', { title: 'Error', message: 'Failed to load signup page' });
    }
});

router.get('/forgot-password', async (req, res) => {
    try {
        res.render('auth/forgot-password', { user: req.user, title: 'Forgot Password' });
    } catch (error) {
        req.flash('error', 'Failed to load forgot password page');
        res.status(500).render('error', { title: 'Error', message: 'Failed to load forgot password page' });
    }
});

router.get('/reset-password', async (req, res) => {
    try {
        res.render('auth/reset-password', { user: req.user, title: 'Forgot Password' });
    } catch (error) {
        req.flash('error', 'Failed to load reset password page');
        res.status(500).render('error', { title: 'Error', message: 'Failed to load reset password page' });
    }
});

router.post('/signup', authContoller.signup);
router.post('/signin', authContoller.signin);
router.delete('/signout', authContoller.logout);

module.exports = router;