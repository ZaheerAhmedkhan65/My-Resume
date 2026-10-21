const express = require('express');
const contactController = require('../controllers/contact.controller');
const router = express.Router();
const  { authenticate } = require("../middlewares/authenticate");
const { authorize } = require("../middlewares/authorize");
const authRoutes = require("./auth.route");
const adminRoutes = require("./admin.route");

router.use('/auth', authRoutes);

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

// Contact us
router.get('/contact', contactController.show);
router.post('/contact', contactController.submit);

router.use(authenticate, authorize('admin'));
router.use('/admin', adminRoutes);


module.exports = router;