const express = require('express');
const router = express.Router();
const { getPool } = require('../srcconfig/db');
const pool = getPool();

// List transactions
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM `Transaction`');
    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
});

// Get one transaction
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM `Transaction` WHERE transaction_id=?', [req.params.id]);
    res.json({ success: true, data: rows[0] || null });
  } catch (e) {
    next(e);
  }
});

// Create transaction (basic insert for demo)
router.post('/', async (req, res, next) => {
  try {
    const { seller_id, buyer_id, credits_sold, price } = req.body;
    let { date } = req.body;
    if (!seller_id || !buyer_id || !credits_sold || price === undefined) {
      return res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
    }
    const [[s]] = await pool.query('SELECT COUNT(1) AS c FROM Company WHERE company_id=?', [seller_id]);
    const [[b]] = await pool.query('SELECT COUNT(1) AS c FROM Company WHERE company_id=?', [buyer_id]);
    if (!s || s.c === 0) {
      return res.status(400).json({ success: false, error: { message: 'Invalid seller_id' } });
    }
    if (!b || b.c === 0) {
      return res.status(400).json({ success: false, error: { message: 'Invalid buyer_id' } });
    }
    if (!date) { date = new Date().toISOString().slice(0, 10); }
    await pool.query(
      'INSERT INTO `Transaction` (seller_id, buyer_id, credits_sold, price, date) VALUES (?,?,?,?,?)',
      [seller_id, buyer_id, credits_sold, price, date]
    );
    res.status(201).json({ success: true });
  } catch (e) {
    next(e);
  }
});

// Delete transaction
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM `Transaction` WHERE transaction_id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;