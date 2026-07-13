// routes/projects.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const https   = require('https');

// Helper: fetch from GitHub API using native https
function githubFetch(path) {
  return new Promise((resolve, reject) => {
    const token = process.env.GITHUB_TOKEN;
    const options = {
      hostname: 'api.github.com',
      path,
      headers: {
        'User-Agent': 'portfolio-backend',
        'Accept': 'application/vnd.github.v3+json',
        ...(token ? { 'Authorization': `token ${token}` } : {})
      }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// GET /api/projects — all projects from DB
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM projects ORDER BY display_order ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Projects DB error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/featured — only featured projects
router.get('/featured', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM projects WHERE is_featured = TRUE ORDER BY display_order ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch featured projects' });
  }
});

// GET /api/projects/github — live GitHub repos
router.get('/github', async (req, res) => {
  try {
    const username = process.env.GITHUB_USERNAME || 'yourusername';
    const repos = await githubFetch(`/users/${username}/repos?sort=updated&per_page=10&type=public`);

    if (!Array.isArray(repos)) {
      return res.status(502).json({ success: false, error: 'GitHub API error' });
    }

    const mapped = repos
      .filter(r => !r.fork)
      .map(r => ({
        id:          r.id,
        name:        r.name,
        description: r.description || '',
        url:         r.html_url,
        homepage:    r.homepage || '',
        stars:       r.stargazers_count,
        language:    r.language || '',
        updated_at:  r.updated_at,
        topics:      r.topics || []
      }));

    res.json({ success: true, data: mapped, count: mapped.length });
  } catch (err) {
    console.error('GitHub API error:', err.message);
    res.status(502).json({ success: false, error: 'Could not reach GitHub API' });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
