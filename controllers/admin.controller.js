// controllers/admin.controller.js
const User = require('../models/User');
const Contact = require('../models/Contact');
const AppError = require('../utils/AppError');
const { isApiRequest } = require('../utils/errorHandler');

const adminController = {

  /* ==================== DASHBOARD ==================== */

  async dashboard(req, res, next) {
    try {
      const totalUsers = await User.count();
      const totalContacts = await Contact.count();
      const newContacts = await Contact.countByStatus('new');
      const readContacts = await Contact.countByStatus('read');
      const repliedContacts = await Contact.countByStatus('replied');

      const recentUsers = await User.getAll();
      const recentContacts = await Contact.findAll();

      const data = {
        user: req.user,
        title: 'Admin Dashboard',
        stats: {
          totalUsers,
          totalContacts,
          newContacts,
          readContacts,
          repliedContacts,
        },
        recentUsers: recentUsers.slice(0, 5),
        recentContacts: recentContacts.slice(0, 5),
      };

      if (isApiRequest(req)) {
        return res.json(data);
      }

      res.render('admin/dashboard', data);
    } catch (error) {
      next(error);
    }
  },

  /* ==================== USER MANAGEMENT ==================== */

  async listUsers(req, res, next) {
    try {
      const role = req.query.role || null;
      const users = role ? await User.getAll(role) : await User.getAll();
      const total = await User.count();

      const data = {
        user: req.user,
        title: 'Manage Users',
        users,
        total,
        filter: role || 'all',
      };

      if (isApiRequest(req)) {
        return res.json(data);
      }

      res.render('admin/users', data);
    } catch (error) {
      next(error);
    }
  },

  async getUser(req, res, next) {
    try {
      const user = await User.getById(req.params.id);
      if (!user) {
        throw AppError.notFound('User');
      }

      const data = {
        user: req.user,
        title: 'User Details',
        profileUser: user,
      };

      if (isApiRequest(req)) {
        return res.json(data);
      }

      res.render('admin/user-detail', data);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { role, status, name, email } = req.body;

      const updated = await User.updateUser(req.params.id, { role, status, name, email });
      if (!updated) {
        throw AppError.notFound('User');
      }

      const data = {
        user: req.user,
        message: 'User updated successfully.',
        data: { user: updated },
      };

      if (isApiRequest(req)) {
        return res.json(data);
      }

      req.flash('success', 'User updated successfully.');
      res.redirect('/admin/users');
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const user = await User.getById(req.params.id);
      if (!user) {
        throw AppError.notFound('User');
      }

      // Prevent admin from deleting themselves
      if (String(user.id) === String(req.user.id)) {
        throw AppError.badRequest('You cannot delete your own account.');
      }

      await User.delete(req.params.id);

      const data = {
        user: req.user,
        message: 'User deleted successfully.',
      };

      if (isApiRequest(req)) {
        return res.json(data);
      }

      req.flash('success', 'User deleted successfully.');
      res.redirect('/admin/users');
    } catch (error) {
      next(error);
    }
  },


  /* ==================== CONTACT MANAGEMENT ==================== */

  async listContacts(req, res, next) {
    try {
      const status = req.query.status || null;
      const contacts = await Contact.findAll();
      const total = await Contact.count();
      const newCount = await Contact.countByStatus('new');
      const readCount = await Contact.countByStatus('read');
      const repliedCount = await Contact.countByStatus('replied');

      const data = {
        user: req.user,
        title: 'Manage Contacts',
        contacts,
        total,
        newCount,
        readCount,
        repliedCount,
        filter: status || 'all',
      };

      if (isApiRequest(req)) {
        return res.json(data);
      }

      res.render('admin/contacts', data);
    } catch (error) {
      next(error);
    }
  },

  async getContact(req, res, next) {
    try {
      const contact = await Contact.getById(req.params.id);
      if (!contact) {
        throw AppError.notFound('Contact');
      }

      const data = {
        user: req.user,
        title: 'Contact Details',
        contact,
      };

      if (isApiRequest(req)) {
        return res.json(data);
      }

      res.render('admin/contact-detail', data);
    } catch (error) {
      next(error);
    }
  },

  async updateContactStatus(req, res, next) {
    try {
      const { status } = req.body;

      const contact = await Contact.getById(req.params.id);
      if (!contact) {
        throw AppError.notFound('Contact');
      }

      await Contact.updateStatus(req.params.id, status);

      const data = {
        user: req.user,
        message: `Contact status updated to '${status}'.`,
        data: { id: contact.id, status },
      };

      if (isApiRequest(req)) {
        return res.json(data);
      }

      req.flash('success', `Contact status updated to '${status}'.`);
      res.redirect('/admin/contacts');
    } catch (error) {
      next(error);
    }
  },

  async deleteContact(req, res, next) {
    try {
      const contact = await Contact.getById(req.params.id);
      if (!contact) {
        throw AppError.notFound('Contact');
      }

      await Contact.delete(req.params.id);

      const data = {
        user: req.user,
        message: 'Contact deleted successfully.',
      };

      if (isApiRequest(req)) {
        return res.json(data);
      }

      req.flash('success', 'Contact deleted successfully.');
      res.redirect('/admin/contacts');
    } catch (error) {
      next(error);
    }
  },

};

module.exports = adminController;