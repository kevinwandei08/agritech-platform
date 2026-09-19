const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/production - Fetch yield logs for chart analytics
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT 
         id, 
         TO_CHAR(log_date, 'YYYY-MM-DD') AS date, 
         entity_type, 
         entity_id, 
         quantity::FLOAT, 
         unit, 
         notes 
       FROM production_logs 
       WHERE user_id = $1 
       ORDER BY log_date ASC`,
      [req.user.id]
    );
    res.json({ success: true, logs: rows });
  } catch (err) {
    console.error('Error fetching production logs:', err.message);
    res.status(500).json({ error: 'Failed to fetch production data' });
  }
});

// POST /api/production - Insert log using entity_type and entity_id
router.post('/', auth, async (req, res) => {
  const { log_date, entity_type, entity_id, quantity, unit, notes } = req.body;

  if (!entity_type || !quantity) {
    return res.status(400).json({ error: 'Entity type and quantity are required.' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO production_logs (user_id, entity_type, entity_id, quantity, unit, log_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, TO_CHAR(log_date, 'YYYY-MM-DD') AS date, entity_type, entity_id, quantity::FLOAT, unit, notes`,
      [
        req.user.id,
        entity_type,
        parseInt(entity_id) || 0,
        parseFloat(quantity),
        unit || 'kg',
        log_date || new Date(),
        notes || ''
      ]
    );
    res.status(201).json({ success: true, log: rows[0] });
  } catch (err) {
    console.error('Error adding production log:', err.message);
    res.status(500).json({ error: 'Failed to record yield entry' });
  }
});

module.exports = router;