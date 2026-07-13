// routes/skills.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// GET /api/skills — all skills
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM skills ORDER BY display_order ASC`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch skills' });
  }
});

// GET /api/skills/grouped — grouped by category
router.get('/grouped', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM skills ORDER BY category, display_order`);
    const grouped = result.rows.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {});
    res.json({ success: true, data: grouped });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch skills' });
  }
});

module.exports = router;
