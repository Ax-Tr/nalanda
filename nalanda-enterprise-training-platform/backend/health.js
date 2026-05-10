// backend/routes/health.js
// Render.com pings GET /api/health to verify your server is running.
// If this route doesn't exist, Render marks your service as "failed".

const express = require('express');
const router  = express.Router();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

router.get('/health', async (req, res) => {
  try {
    // Also verify DB is reachable
    await pool.query('SELECT 1');
    res.status(200).json({
      status:    'ok',
      service:   'nalanda-backend',
      database:  'connected',
      timestamp: new Date().toISOString(),
      env:       process.env.NODE_ENV,
    });
  } catch (err) {
    res.status(503).json({
      status:   'error',
      database: 'disconnected',
      message:  err.message,
    });
  }
});

module.exports = router;


// ─── HOW TO USE IN server.js ────────────────────────────────────────────────
//
// const healthRoute = require('./routes/health');
// app.use('/api', healthRoute);
//
// This makes GET https://nalanda-backend.onrender.com/api/health work,
// which is what render.yaml's healthCheckPath points to.
// ────────────────────────────────────────────────────────────────────────────
