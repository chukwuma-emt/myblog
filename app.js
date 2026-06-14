require('dotenv').config();
const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routerHelpers');

const app = express();
const PORT = process.env.PORT || 10000;

// Database connection
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
// Generate a CSP nonce per request so JSON-LD inline scripts are allowed
app.use((req, res, next) => {
  res.locals.cspNonce = require('crypto').randomBytes(16).toString('base64');
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
      scriptSrcAttr: ["'unsafe-inline'"], // allows onsubmit/onclick in admin forms
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    }
  }
}));
app.use(compression()); // Compress responses

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  }
}));

// Static assets
app.use(express.static('public'));

// Serve media files by folder
app.use('/uploads/images', express.static('public/uploads/images'));
app.use('/uploads/videos', express.static('public/uploads/videos'));
app.use('/uploads/audio', express.static('public/uploads/audio'));

// View Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Route helpers
app.locals.isActiveRoute = isActiveRoute;
app.locals.siteUrl = process.env.SITE_URL || 'https://blog.ekolinc.com';
app.use((req, res, next) => {
  res.locals.currentRoute = req.path;
  next();
});

// Routes
app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));
app.use('/', require('./server/routes/owner'));
const sitemapRoutes = require('./server/routes/sitemap');
app.use('/', sitemapRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {
    locals: { title: 'Page Not Found', noindex: true },
    currentRoute: req.path
  });
});

// Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
