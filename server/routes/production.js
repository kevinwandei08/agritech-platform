const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/production - Fetch yield logs for chart analytics (Filtered by entity_type and entity_id)
router.get('/', auth, async (req, res) => {
  const { entity_type, entity_id } = req.query;

  try {
    let query = `
      SELECT id, TO_CHAR(log_date, 'YYYY-MM-DD') AS date, entity_type, entity_id, quantity::FLOAT, unit, notes 
      FROM production_logs 
      WHERE user_id = $1
    `;
    let params = [req.user.id];

    // Filter by entity_type ('crop' or 'livestock')
    if (entity_type) {
      params.push(entity_type);
      query += ` AND entity_type = $${params.length}`;
    }

    // Filter by specific animal or crop block ID (e.g., Bessie's ID)
    if (entity_id) {
      params.push(parseInt(entity_id));
      query += ` AND entity_id = $${params.length}`;
    }

    query += ` ORDER BY log_date ASC`;

    const { rows } = await db.query(query, params);

    // Return both formats to prevent frontend structure breaking
    res.json({ success: true, logs: rows, data: rows });
  } catch (err) {
    console.error('Error fetching production logs:', err.message);
    res.status(500).json({ error: 'Failed to fetch production data' });
  }
});

// POST /api/production - Insert log using entity_type and entity_id
router.post('/', auth, async (req, res) => {
  const { log_date, entity_type, entity_id, quantity, unit, notes } = req.body;

  if (!entity_type || quantity === undefined) {
    return res.status(400).json({ error: 'Entity type and quantity are required.' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO production_logs (user_id, entity_type, entity_id, quantity, unit, log_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, TO_CHAR(log_date, 'YYYY-MM-DD') AS date, entity_type, entity_id, quantity::FLOAT, unit, notes`,
      [
        req.user.id,
        entity_type, // 'crop' or 'livestock'
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