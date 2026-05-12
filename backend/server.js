// =============================================
//   server.js — Main Entry Point v2
//   Run: node server.js
// =============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve Frontend Statically ─────────────────
// Express serves all files inside /frontend
// Browser requests /frontend/Htmls/index.html
// → Express finds and sends the file directly
// No manual script loading needed in the module
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

// ── Default Route → Load App ──────────────────
// When user visits http://localhost:5000
// → serve index.html automatically
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Htmls/FreshFold.html'));
});

// ── API Routes ────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// ── Start Server ──────────────────────────────
db.getConnection()
  .then((conn) => {
    console.log('MySQL connected!');
    conn.release();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`App available at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' MySQL failed:', err.message);
    process.exit(1);
  });