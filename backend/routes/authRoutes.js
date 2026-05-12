// =============================================
//   routes/authRoutes.js
//   Handles Register + Login for ALL 3 methods
//   Method is controlled from frontend, not here
// =============================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// ─────────────────────────────────────────────
// POST /api/auth/register
// Creates a new user account
// Body: { name, email, password }
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // 2. Check if email already exists
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // 3. Hash the password — NEVER store plain text passwords
    //    bcrypt adds a "salt" (random data) so same password gives different hash
    //    10 = cost factor (how slow the hashing is — higher = more secure but slower)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert new user into DB
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']  // always register as 'user', not admin
    );

    res.status(201).json({
      message: 'Account created successfully!',
      userId: result.insertId,
    });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// Checks credentials, returns user data
// Body: { email, password }
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 2. Find user by email
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];

    // 3. Compare entered password with hashed password in DB
    //    bcrypt.compare handles the unhashing internally
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 4. Build the user object to send back (NEVER send password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // 5. Create JWT token (used only in JWT method)
    //    jwt.sign(payload, secret, options)
    //    Token expires in 24 hours — user must log in again after that
    // const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '24h' });

    // 6. Send back user data + token
    //    Frontend picks what it needs based on which login method it uses
    res.status(200).json({
      message: 'Login successful!',
      user: userData,
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;