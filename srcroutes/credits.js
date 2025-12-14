const express = require('express');
const router = express.Router();
const { getPool } = require('../srcconfig/db');
const pool = getPool();

// List credits, optional filter by company_id
router.get('/', async (req, res, next) => {
  try {
    const { company_id } = req.query;
    let sql = 'SELECT * FROM CarbonCredit';
    let params = [];
    if (company_id) {
      sql += ' WHERE company_id=?';
      params = [company_id];
    }
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
});

// Aggregate available credits for a company (non-expired)
router.get('/available/:company_id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(credit_amount), 0) AS available
       FROM CarbonCredit
       WHERE company_id = ? AND expiry_date >= CURDATE()`,
      [req.params.company_id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    next(e);
  }
});

// Create credit record
router.post('/', async (req, res, next) => {
  try {
    const { company_id, credit_amount, expiry_date } = req.body;
    await pool.query(
      'INSERT INTO CarbonCredit (company_id, credit_amount, expiry_date) VALUES (?,?,?)',
      [company_id, credit_amount, expiry_date]
    );
    res.status(201).json({ success: true });
  } catch (e) {
    next(e);
  }
});

// Update credit record
router.put('/:id', async (req, res, next) => {
  try {
    const { credit_amount, expiry_date } = req.body;
    await pool.query(
      'UPDATE CarbonCredit SET credit_amount=?, expiry_date=? WHERE credit_id=?',
      [credit_amount, expiry_date, req.params.id]
    );
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

// Delete credit record
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM CarbonCredit WHERE credit_id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;