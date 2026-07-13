// routes/certifications.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

// GET /api/certifications — all certs
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM certifications ORDER BY display_order ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Certs DB error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch certifications' });
  }
});

// GET /api/certifications/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM certifications WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/certifications — add new cert (admin use)
router.post('/', async (req, res) => {
  const { title, issuer, credential_url, issued_date, badge_url, display_order } = req.body;
  if (!title || !issuer) return res.status(400).json({ success: false, error: 'title and issuer required' });
  try {
    const result = await db.query(
      `INSERT INTO certifications (title, issuer, credential_url, issued_date, badge_url, display_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, issuer, credential_url || '', issued_date || null, badge_url || '', display_order || 0]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add certification' });
  }
});

// PUT /api/certifications/:id — update cert
router.put('/:id', async (req, res) => {
  const { title, issuer, credential_url, issued_date } = req.body;
  try {
    const result = await db.query(
      `UPDATE certifications SET title=$1, issuer=$2, credential_url=$3, issued_date=$4
       WHERE id=$5 RETURNING *`,
      [title, issuer, credential_url, issued_date, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Update failed' });
  }
});

// DELETE /api/certifications/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM certifications WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
});

module.exports = router;
