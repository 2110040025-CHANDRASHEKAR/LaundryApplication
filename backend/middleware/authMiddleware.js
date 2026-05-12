// =============================================
//   middleware/authMiddleware.js
//   Protects routes — only logged-in users pass
//   Used only in the JWT login method
// =============================================

const jwt = require('jsonwebtoken');
require('dotenv').config();

// ── protectRoute ──────────────────────────────
// Add this to any route you want to protect
// Example: router.get('/', protectRoute, async (req,res) => {...})
const protectRoute = (req, res, next) => {

  // 1. Get token from request header
  //    Frontend sends: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // get part after "Bearer "

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Please log in.' });
  }

  try {
    // 2. Verify token using same secret used to create it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach decoded user info to request object
    //    Now any route after this can access req.user
    req.user = decoded;  // { id, name, email, role }

    next(); // pass to next handler

  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};

// ── adminOnly ─────────────────────────────────
// Add this AFTER protectRoute for admin-only routes
// Example: router.put('/:id/status', protectRoute, adminOnly, async (req,res) => {...})
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

module.exports = { protectRoute, adminOnly };