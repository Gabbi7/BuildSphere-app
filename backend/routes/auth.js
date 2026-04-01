const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'buildsphere_secret_key';

// POST /auth/signup
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    // Check if user already exists
    const existing = await pool.query('SELECT id FROM "public"."users" WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO "public"."users" (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email',
      [firstName, lastName, email, hashed, 'user']
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role || 'general_staff',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    console.log(`[DEBUG] Login attempt for: "${email}"`);
    const result = await pool.query('SELECT * FROM "public"."users" WHERE email = $1', [email]);
    console.log(`[DEBUG] DB Result size: ${result.rows.length}`);
    
    if (result.rows.length === 0) {
      console.log(`[DEBUG] NO ACCOUNT FOUND for: "${email}"`);
      return res.status(401).json({ error: 'No account found with that email.' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log(`[DEBUG] INCORRECT PASSWORD for: "${email}"`);
      return res.status(401).json({ error: 'Incorrect password.' });
    }
    console.log(`[DEBUG] LOGIN SUCCESS for: "${email}"`);
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role || 'general_staff',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

module.exports = router;
