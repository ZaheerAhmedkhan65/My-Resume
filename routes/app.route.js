const express = require('express');
const passport = require('passport');
const authContoller = require('../controllers/auth.controller');
const contactController = require('../controllers/contact.controller');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.render('index', {
            title: 'Home'
        });
    } catch (error) {
        console.error('Homepage error:', error);
        req.flash('error', 'Failed to load homepage');
        // Do NOT redirect back to '/' - that re-renders this page and loops.
        res.status(500).render('error', { title: 'Error', message: 'Failed to load homepage' });
    }
});

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

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

router.post('/auth/signup', authContoller.signup);
router.post('/auth/signin', authContoller.signin);
router.delete('/auth/signout', authContoller.logout);

// Contact us
router.get('/contact', contactController.show);
router.post('/contact', contactController.submit);

module.exports = router;