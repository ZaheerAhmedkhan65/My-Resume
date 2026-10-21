const express = require('express');
const adminController = require('../controllers/admin.controller');
const router = express.Router();

/* ==================== DASHBOARD ==================== */
router.get('/dashboard', adminController.dashboard);

/* ==================== USER MANAGEMENT ==================== */
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

/* ==================== CONTACT MANAGEMENT ==================== */
router.get('/contacts', adminController.listContacts);
router.get('/contacts/:id', adminController.getContact);
router.put('/contacts/:id/status', adminController.updateContactStatus);
router.delete('/contacts/:id', adminController.deleteContact);

module.exports = router;