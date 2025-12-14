const express = require('express');
const router = express.Router();
const { getPool } = require('../srcconfig/db');
const pool = getPool();

// Companies exceeding emission limit
router.get('/exceeding', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT name FROM Company WHERE current_emission > emission_limit'
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
});

// Available credits by company (non-expired)
router.get('/available-credits', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.name, COALESCE(SUM(cc.credit_amount), 0) AS available_credits
       FROM Company c
       LEFT JOIN CarbonCredit cc 
         ON c.company_id = cc.company_id 
        AND cc.expiry_date >= CURDATE()
       GROUP BY c.name`
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
});

// Total penalty collected
router.get('/penalty-total', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT SUM(amount) AS total_penalty FROM Penalty');
    res.json({ success: true, data: rows[0] || { total_penalty: 0 } });
  } catch (e) {
    next(e);
  }
});

// Companies that bought credits
router.get('/buyers', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT c.name AS BuyerName
       FROM Company c
       JOIN \`Transaction\` t ON c.company_id = t.buyer_id`
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
});

// Transaction summary (seller/buyer names, credits, price)
router.get('/transactions-summary', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.transaction_id, s.name AS Seller, b.name AS Buyer, t.credits_sold, t.price
       FROM \`Transaction\` t
       JOIN Company s ON t.seller_id = s.company_id
       JOIN Company b ON t.buyer_id = b.company_id`
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
});

router.get('/manual', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT mr.report_id, mr.company_id, c.name AS company_name, mr.remaining_credits, mr.credits_bought, mr.penalty_amount, mr.created_at
       FROM ManualReport mr
       JOIN Company c ON mr.company_id = c.company_id
       ORDER BY mr.report_id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

router.post('/manual', async (req, res, next) => {
  try {
    const { company_id, remaining_credits, credits_bought, penalty_amount } = req.body || {};
    const cid = Number(company_id);
    const rc = Number(remaining_credits);
    const cb = Number(credits_bought);
    const pa = Number(penalty_amount);
    if ([cid, rc, cb, pa].some(n => Number.isNaN(n))) {
      return res.status(400).json({ success: false, error: { message: 'Invalid numeric values' } });
    }
    const [exists] = await pool.query('SELECT 1 FROM Company WHERE company_id = ?', [cid]);
    if (!exists || exists.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Company not found' } });
    }
    await pool.query(
      'INSERT INTO ManualReport (company_id, remaining_credits, credits_bought, penalty_amount) VALUES (?,?,?,?)',
      [cid, rc, cb, pa]
    );
    res.status(201).json({ success: true });
  } catch (e) { next(e); }
});


module.exports = router;
