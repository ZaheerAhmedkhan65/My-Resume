// server.js
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require("method-override");
const path = require('path');
const morgan = require("morgan");
const passport = require('passport');
const flash = require('connect-flash');
const expressLayouts = require("express-ejs-layouts");
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const pool = require('./db'); // MySQL connection pool
const { optionalAuthenticate } = require('../middlewares/authenticate');
const { errorHandler, notFoundHandler } = require('../utils/errorHandler');

// Routes
const appRoute = require('../routes/app.route');

require('dotenv').config({
    quiet: true
});

require('./passport');

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: function (req, res) {
        return res.statusCode < 400;
    }
}));
app.use(methodOverride("_method"));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);

app.set("layout", "layouts/application");

app.use(express.static(path.join(__dirname, '../public')));
// Serve static files from uploads directory in development
if (process.env.NODE_ENV !== 'production') {
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// server.js
const sessionStore = new MySQLStore({
    expiration: 86400000, // 1 day in milliseconds
    createDatabaseTable: true, // Will create sessions table if it doesn't exist
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, pool);

app.set('trust proxy', 1);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production' ? true : false,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Passport and flash middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Set req.user if authenticated (via JWT or session), but don't block if not
app.use(optionalAuthenticate);

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.path = req.originalUrl;
    res.locals.title = "IBC Tank Store";
    if (req.path.startsWith("/admin")) {
        res.locals.layout = "layouts/admin";
    } else {
        res.locals.layout = "layouts/application";
    }
    next();
});

// Routes
app.use('/', appRoute);

// ========== ADD 404 HANDLER HERE ==========
// app.use((req, res) => {
//     res.status(404).render('404', {
//         title: 'Page Not Found',
//         viewPage: "404",
//         user: req.user || null
//     });
// });
// ==========================================

// Note: errors passed via next(err) are handled by the shared errorHandler
// at the end of this file (JSON response for API clients, rendered HTML page
// for browsers). Do NOT add another error middleware here — it would shadow it.

// 404 catch-all (must be after all routes)
app.use(notFoundHandler);

// Generic error handler (must be last)
app.use(errorHandler);

module.exports = app;