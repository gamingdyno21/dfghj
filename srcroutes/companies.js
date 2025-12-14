const express = require('express');
const router = express.Router();
const { getPool } = require('../srcconfig/db');
const pool = getPool();

// List all companies
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Company');
    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
});

// Get one company
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Company WHERE company_id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] || null });
  } catch (e) {
    next(e);
  }
});

// Create company
router.post('/', async (req, res, next) => {
  try {
    const { company_id, name, industry_type, emission_limit, current_emission } = req.body;
    await pool.query(
      'INSERT INTO Company (company_id, name, industry_type, emission_limit, current_emission) VALUES (?,?,?,?,?)',
      [company_id, name, industry_type, emission_limit, current_emission]
    );
    res.status(201).json({ success: true });
  } catch (e) {
    next(e);
  }
});

// Update company
router.put('/:id', async (req, res, next) => {
  try {
    const { name, industry_type, emission_limit, current_emission } = req.body;
    await pool.query(
      'UPDATE Company SET name=?, industry_type=?, emission_limit=?, current_emission=? WHERE company_id=?',
      [name, industry_type, emission_limit, current_emission, req.params.id]
    );
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

// Delete company
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM Company WHERE company_id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;