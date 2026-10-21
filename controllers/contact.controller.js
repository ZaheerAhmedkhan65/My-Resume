// controllers/contact.controller.js
const ContactService = require('../services/contact.service');
const { isApiRequest } = require('../utils/errorHandler');

const contactController = {

    /**
     * GET /contact
     * The form lives in the homepage's #contact section, so send visitors there.
     */
    show(req, res) {
        res.redirect('/#contact');
    },

    /**
     * POST /contact
     * - Browser form  -> flash message + redirect back to #contact
     * - API client    -> JSON (201 on success, 400/500 via global errorHandler)
     */
    async submit(req, res, next) {
        try {
            const contact = await ContactService.submit(req.body);

            if (isApiRequest(req)) {
                return res.status(201).json({
                    status: 'success',
                    message: 'Thank you! Your message has been sent.',
                    data: { id: contact.id }
                });
            }

            req.flash('success', 'Thank you! Your message has been sent — I will get back to you soon.');
            res.redirect('/#contact');

        } catch (error) {
            // API clients get structured JSON from the global error handler
            if (isApiRequest(req)) return next(error);

            // Browser: show the problem (operational messages only, never internals)
            const msg = error.isOperational && error.message
                ? error.message
                : 'Sorry, we could not send your message. Please try again later.';
            req.flash('error', msg);
            res.redirect('/#contact');
        }
    }
};

module.exports = contactController;
