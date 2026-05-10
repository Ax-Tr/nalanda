// backend/middleware/cors.js
// Drop this file into your backend and import it in server.js

const cors = require('cors');

const allowedOrigins = [
  'https://nalandalms.netlify.app',   // Production Netlify frontend
  'http://localhost:5173',             // Vite dev server (default port)
  'http://localhost:3000',             // fallback
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: origin ${origin} not allowed`));
    }
  },
  credentials: true,                          // Required for cookies / Authorization header
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

module.exports = cors(corsOptions);


// ─── HOW TO USE IN server.js ────────────────────────────────────────────────
//
// const corsMiddleware = require('./middleware/cors');
// app.use(corsMiddleware);
//
// Make sure this is the FIRST middleware registered, before any routes.
// ────────────────────────────────────────────────────────────────────────────
