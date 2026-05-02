const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
let userProfileSchemaReady = false;

async function ensureUserProfileColumns() {
  if (userProfileSchemaReady) return;
  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS middle_name VARCHAR(120),
      ADD COLUMN IF NOT EXISTS suffix VARCHAR(50),
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(40),
      ADD COLUMN IF NOT EXISTS gender VARCHAR(40),
      ADD COLUMN IF NOT EXISTS birthdate DATE,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS department VARCHAR(120),
      ADD COLUMN IF NOT EXISTS position VARCHAR(120),
      ADD COLUMN IF NOT EXISTS account_status VARCHAR(30) DEFAULT 'active'
  `);
  userProfileSchemaReady = true;
}

// GET /users - list all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email FROM users ORDER BY first_name ASC'
    );
    res.json(
      result.rows.map((u) => ({
        id: u.id,
        name: `${u.first_name} ${u.last_name}`,
        email: u.email,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// GET /users/:id
router.get('/:id', async (req, res) => {
  try {
    await ensureUserProfileColumns();
    const result = await pool.query(
      `SELECT
        id,
        first_name,
        middle_name,
        last_name,
        suffix,
        email,
        role,
        phone_number,
        gender,
        birthdate,
        address,
        department,
        position,
        account_status,
        profile_picture_url,
        created_at,
        updated_at
      FROM users
      WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    const user = result.rows[0];
    res.json({
      id: user.id,
      firstName: user.first_name,
      middleName: user.middle_name,
      lastName: user.last_name,
      suffix: user.suffix,
      email: user.email,
      role: user.role,
      phoneNumber: user.phone_number,
      gender: user.gender,
      birthdate: user.birthdate,
      address: user.address,
      department: user.department,
      position: user.position,
      accountStatus: user.account_status,
      profilePictureUrl: user.profile_picture_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /users/:id/profile  — update name & photo
router.patch('/:id/profile', async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    suffix,
    phoneNumber,
    gender,
    birthdate,
    address,
    department,
    position,
    profilePictureUrl,
  } = req.body;
  try {
    await ensureUserProfileColumns();
    const profilePictureSql = profilePictureUrl !== undefined ? profilePictureUrl : null;
    const result = await pool.query(
      `UPDATE users
       SET
         first_name = $1,
         middle_name = $2,
         last_name = $3,
         suffix = $4,
         phone_number = $5,
         gender = $6,
         birthdate = $7,
         address = $8,
         department = $9,
         position = $10,
         profile_picture_url = COALESCE($11, profile_picture_url),
         updated_at = NOW()
       WHERE id = $12
       RETURNING
         id, first_name, middle_name, last_name, suffix, email, role,
         phone_number, gender, birthdate, address, department, position,
         account_status, profile_picture_url, created_at, updated_at`,
      [
        firstName,
        middleName || null,
        lastName,
        suffix || null,
        phoneNumber || null,
        gender || null,
        birthdate || null,
        address || null,
        department || null,
        position || null,
        profilePictureSql,
        req.params.id,
      ]
    );

    const user = result.rows[0];
    res.json({
      id: user.id,
      firstName: user.first_name,
      middleName: user.middle_name,
      lastName: user.last_name,
      suffix: user.suffix,
      email: user.email,
      role: user.role,
      phoneNumber: user.phone_number,
      gender: user.gender,
      birthdate: user.birthdate,
      address: user.address,
      department: user.department,
      position: user.position,
      accountStatus: user.account_status,
      profilePictureUrl: user.profile_picture_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// PATCH /users/:id/account  — update email and/or password
router.patch('/:id/account', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET email = $1, password_hash = $2 WHERE id = $3', [
        email,
        hashed,
        req.params.id,
      ]);
    } else {
      await pool.query('UPDATE users SET email = $1 WHERE id = $2', [email, req.params.id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update account.' });
  }
});

// PATCH /users/:id/push-token — save Expo Push Token
router.patch('/:id/push-token', async (req, res) => {
  const { pushToken } = req.body;
  try {
    await pool.query('UPDATE users SET push_token = $1 WHERE id = $2', [
      pushToken,
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save push token.' });
  }
});

module.exports = router;
