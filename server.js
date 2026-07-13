// server.js — Dewanshu Portfolio Backend
require('dotenv').config();
const express = require('express');
const app     = express();

// ── MIDDLEWARE ──
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Helmet — security headers
try {
  const helmet = require('helmet');
  app.use(helmet());
} catch(e) {}

// CORS — allow your frontend domain
try {
  const cors = require('cors');
  app.use(cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:5500',   // VS Code Live Server
      'http://127.0.0.1:5500',
      'https://yourusername.github.io'  // Update with your GitHub Pages URL
    ],
    methods: ['GET','POST','PUT','DELETE'],
    credentials: true
  }));
} catch(e) {
  // Basic manual CORS if package not installed
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
}

// Rate limiter
try {
  const { apiLimiter, contactLimiter } = require('./middleware/rateLimiter');
  app.use('/api/', apiLimiter);
  app.use('/api/contact', contactLimiter);
} catch(e) {}

// Request logger
app.use((req, res, next) => {
  const t = new Date().toISOString().slice(11,19);
  console.log(`[${t}] ${req.method} ${req.path}`);
  next();
});

// ── ROUTES ──
app.use('/api/projects',       require('./routes/projects'));
app.use('/api/certifications', require('./routes/certifications'));
app.use('/api/contact',        require('./routes/contact'));
app.use('/api/skills',         require('./routes/skills'));

// ── HEALTH CHECK ──
app.get('/', (req, res) => {
  res.json({
    status:  '✅ Dewanshu Portfolio API running',
    version: '1.0.0',
    endpoints: {
      projects:       'GET /api/projects',
      github_repos:   'GET /api/projects/github',
      certifications: 'GET /api/certifications',
      skills:         'GET /api/skills',
      contact:        'POST /api/contact'
    }
  });
});

app.get('/api/health', async (req, res) => {
  const db = require('./config/db');
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
  } catch(e) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: e.message });
  }
});

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.path} not found` });
});

// ── ERROR handler ──
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ── START ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio API running → http://localhost:${PORT}`);
  console.log(`📊 Health check       → http://localhost:${PORT}/api/health`);
  console.log(`📁 Projects           → http://localhost:${PORT}/api/projects`);
  console.log(`🐙 GitHub repos       → http://localhost:${PORT}/api/projects/github`);
  console.log(`🎓 Certifications     → http://localhost:${PORT}/api/certifications`);
  console.log(`📬 Contact            → POST http://localhost:${PORT}/api/contact\n`);
});
