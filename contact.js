// routes/contact.js
const express    = require('express');
const router     = express.Router();
const db         = require('../config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Email transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS   // Use Gmail App Password (not your main password)
  }
});

// Input validator
function validateContact({ name, email, message }) {
  if (!name || name.trim().length < 2)    return 'Name must be at least 2 characters';
  if (!email || !/\S+@\S+\.\S+/.test(email)) return 'Valid email required';
  if (!message || message.trim().length < 10) return 'Message must be at least 10 characters';
  return null;
}

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  // Validate
  const error = validateContact({ name, email, message });
  if (error) return res.status(400).json({ success: false, error });

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    // 1. Save to database
    await db.query(
      `INSERT INTO contact_messages (name, email, message, ip_address) VALUES ($1,$2,$3,$4)`,
      [name.trim(), email.trim().toLowerCase(), message.trim(), ip]
    );

    // 2. Send email notification to you
    await transporter.sendMail({
      from:    `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to:      process.env.EMAIL_TO,
      subject: `📬 New message from ${name}`,
      html: `
        <div style="font-family:monospace;background:#05050c;color:#e2e8f0;padding:2rem;border-radius:8px;">
          <h2 style="color:#a855f7">New Portfolio Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#22d3ee">${email}</a></p>
          <p><strong>Message:</strong></p>
          <div style="background:#0a0a14;padding:1rem;border-left:3px solid #a855f7;margin-top:.5rem">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <p style="color:#4a5568;margin-top:1.5rem;font-size:.8rem">Sent from Dewanshu Portfolio · ${new Date().toLocaleString('en-IN')}</p>
        </div>
      `
    });

    // 3. Send auto-reply to sender
    await transporter.sendMail({
      from:    `"Dewanshu Ukare" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `Thanks for reaching out, ${name}!`,
      html: `
        <div style="font-family:monospace;background:#05050c;color:#e2e8f0;padding:2rem;border-radius:8px;">
          <h2 style="color:#a855f7">Hey ${name}! 👋</h2>
          <p>Thanks for your message. I've received it and will get back to you within 24–48 hours.</p>
          <div style="background:#0a0a14;padding:1rem;border-left:3px solid #22d3ee;margin:1rem 0">
            <p style="color:#94a3b8">"${message.slice(0,100)}${message.length > 100 ? '...' : ''}"</p>
          </div>
          <p>— Dewanshu Dashrath Ukare<br/><span style="color:#a855f7">Python Developer · Pune</span></p>
        </div>
      `
    });

    res.json({ success: true, message: 'Message sent! I will reply within 24-48 hours.' });

  } catch (err) {
    console.error('Contact error:', err.message);
    // Still save to DB even if email fails
    res.status(500).json({ success: false, error: 'Failed to send message. Please try again.' });
  }
});

// GET /api/contact/messages — view all messages (admin)
router.get('/messages', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM contact_messages ORDER BY created_at DESC`);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not fetch messages' });
  }
});

module.exports = router;
