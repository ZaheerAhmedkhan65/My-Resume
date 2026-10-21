// services/contact.service.js
const Contact = require('../models/Contact');
const AppError = require('../utils/AppError');

// Simple, dependency-free validation patterns
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-().\s]{7,20}$/;

const STATUSES = ['new', 'read', 'replied'];

class ContactService {

    /* -------------------- SUBMIT (public "Contact Us") -------------------- */
    /**
     * Validate and store a contact message.
     *
     * @param {object} payload  { name, email, contact_no, message, website? }
     *   - `website` is a hidden honeypot field: humans never see it, bots
     *     commonly fill it. When present we pretend success but store nothing.
     * @returns {object} created contact row (or { honeypot: true })
     * @throws  AppError.badRequest(message, details) when validation fails
     */
    static async submit(payload = {}) {
        const name = String(payload.name || '').trim();
        const email = String(payload.email || '').trim();
        const contact_no = String(payload.contact_no || '').trim();
        const message = String(payload.message || '').trim();

        // Honeypot triggered -> silent fake success, nothing persisted
        if (payload.website) {
            return { id: null, honeypot: true };
        }

        const details = {};

        if (!name) {
            details.name = 'Name is required.';
        } else if (name.length < 2) {
            details.name = 'Name must be at least 2 characters.';
        } else if (name.length > 255) {
            details.name = 'Name must be at most 255 characters.';
        }

        if (!email) {
            details.email = 'Email is required.';
        } else if (email.length > 255 || !EMAIL_RE.test(email)) {
            details.email = 'Please enter a valid email address.';
        }

        if (contact_no && !PHONE_RE.test(contact_no)) {
            details.contact_no = 'Please enter a valid phone number (7-20 characters: digits, +, -, spaces).';
        }

        if (!message) {
            details.message = 'Message is required.';
        } else if (message.length < 3) {
            details.message = 'Message must be at least 3 characters.';
        } else if (message.length > 2000) {
            details.message = 'Message must be at most 2000 characters.';
        }

        const errorKeys = Object.keys(details);
        if (errorKeys.length > 0) {
            // message = first problem (nice for flash toast), details = full map (nice for APIs)
            throw AppError.badRequest(details[errorKeys[0]], details);
        }

        return Contact.create({ name, email, contact_no, message });
    }

    /* -------------------- ADMIN / RESOURCE HELPERS -------------------- */
    static async list() {
        return Contact.findAll();
    }

    static async getById(id) {
        const contact = await Contact.getById(id);
        if (!contact) {
            throw AppError.notFound('Contact');
        }
        return contact;
    }

    static async markStatus(id, status) {
        if (!STATUSES.includes(status)) {
            throw AppError.badRequest(`Status must be one of: ${STATUSES.join(', ')}`);
        }
        const contact = await Contact.getById(id);
        if (!contact) {
            throw AppError.notFound('Contact');
        }
        await Contact.updateStatus(id, status);
        return { ...contact, status };
    }

    static async remove(id) {
        const contact = await Contact.getById(id);
        if (!contact) {
            throw AppError.notFound('Contact');
        }
        await Contact.delete(id);
        return contact;
    }

}

module.exports = ContactService;
