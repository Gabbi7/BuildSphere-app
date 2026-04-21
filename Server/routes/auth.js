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
        role: user.role || 'staff',
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
        role: user.role || 'staff',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    const userResult = await pool.query('SELECT id FROM "public"."users" WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // Act like it succeeded for security reasons
      return res.json({ success: true, message: 'If registered, an OTP was sent.' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Clear old tokens for this email and insert new one
    await pool.query('DELETE FROM password_reset_tokens WHERE email = $1', [email]);
    await pool.query('INSERT INTO password_reset_tokens (email, token, created_at) VALUES ($1, $2, NOW())', [email, otp]);

    console.log(`\n========================================`);
    console.log(`📧 OTP EMAIL SIMULATION for: ${email}`);
    console.log(`🔑 Your Reset PIN is: ${otp}`);
    console.log(`========================================\n`);

    res.json({ success: true, message: 'OTP sent to email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during password reset request.' });
  }
});

// POST /auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await pool.query('SELECT * FROM password_reset_tokens WHERE email = $1 AND token = $2', [email, otp]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }
    
    // Check if OTP is older than 15 minutes
    const tokenTime = new Date(result.rows[0].created_at).getTime();
    if (Date.now() - tokenTime > 15 * 60 * 1000) {
      await pool.query('DELETE FROM password_reset_tokens WHERE email = $1', [email]);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    res.json({ success: true, message: 'OTP verified.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during OTP verification.' });
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    // Final check to make sure OTP is valid before resetting
    const tokenResult = await pool.query('SELECT * FROM password_reset_tokens WHERE email = $1 AND token = $2', [email, otp]);
    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE "public"."users" SET password = $1 WHERE email = $2', [hashed, email]);
    await pool.query('DELETE FROM password_reset_tokens WHERE email = $1', [email]);

    res.json({ success: true, message: 'Password has been successfully reset.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during password reset.' });
  }
});

module.exports = router;
