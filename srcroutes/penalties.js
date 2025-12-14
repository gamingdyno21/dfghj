const express = require('express');
const router = express.Router();
const { getPool } = require('../srcconfig/db');
const pool = getPool();

// List all penalties
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Penalty');
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// List penalties for a company
router.get('/:company_id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Penalty WHERE company_id=?', [req.params.company_id]);
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

// Create penalty
router.post('/', async (req, res, next) => {
  try {
    const { penalty_id, company_id, reason, amount, date } = req.body;
    await pool.query(
      'INSERT INTO Penalty (penalty_id, company_id, reason, amount, date) VALUES (?,?,?,?,?)',
      [penalty_id, company_id, reason, amount, date]
    );
    res.status(201).json({ success: true });
  } catch (e) { next(e); }
});

// Delete penalty
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM Penalty WHERE penalty_id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { next(e); }
});

module.exports = router;