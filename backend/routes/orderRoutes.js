// =============================================
//   routes/orderRoutes.js — Orders API
//   Now includes user_id + payment fields
// =============================================

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/orders — Place a new order
router.post('/', async (req, res) => {
  try {
    const { user_id, name, phone, address, service, weight,
      date, notes, total, payment_method } = req.body;

    if (!name || !phone || !address || !service || !weight) {
      return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    const sql = `
      INSERT INTO orders
        (user_id, name, phone, address, service, weight, date, notes, total, status, payment_method, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Received', ?, ?)
    `;

    const paymentStatus = payment_method === 'COD' ? 'Pending' : 'Paid';

    const [result] = await db.execute(sql, [
      user_id, name, phone, address, service,
      weight, date || 'TBD', notes || '', total || 0,
      payment_method || 'COD', paymentStatus
    ]);

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: result.insertId,
    });

  } catch (err) {
    console.error('POST /api/orders FULL ERROR:', err); // 👈 full error
    res.status(500).json({
      error: err.message,       // 👈 send real message to Postman
      code: err.code,           // 👈 MySQL error code
    });
  }
});

// GET /api/orders — All orders (admin) or user's orders (user)
// Pass ?user_id=X to filter by user
router.get('/', async (req, res) => {
  try {
    let sql = 'SELECT * FROM orders';
    let params = [];

    // If user_id query param provided, filter to that user's orders only
    if (req.query.user_id) {
      sql = 'SELECT * FROM orders WHERE user_id = ?';
      params = [req.query.user_id];
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.execute(sql, params);
    res.status(200).json(rows);

  } catch (err) {
    console.error('GET /api/orders error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/orders/:id — Track single order
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM orders WHERE id = ?', [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/orders/:id/status — Update status (admin only in frontend)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Received', 'Processing', 'Ready', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const [result] = await db.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({ message: 'Status updated!', id: req.params.id, status });

  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/orders/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM orders WHERE id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.status(200).json({ message: 'Order deleted!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;