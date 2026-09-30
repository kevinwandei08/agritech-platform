const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/inventory - Fetch all user inventory items
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      `SELECT * FROM inventory WHERE user_id = $1 ORDER BY item_name ASC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Fetch Inventory Error:', err);
    res.status(500).json({ error: 'Failed to fetch inventory records' });
  }
});

// POST /api/inventory - Add new inventory item
router.post('/', auth, async (req, res) => {
  const { item_name, category, quantity, unit, reorder_level } = req.body;
  const userId = req.user.id;

  if (!item_name || !category || quantity === undefined || !unit) {
    return res.status(400).json({ error: 'Item name, category, quantity, and unit are required.' });
  }

  try {
    const query = `
      INSERT INTO inventory (user_id, item_name, category, quantity, unit, reorder_level)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [userId, item_name, category, quantity, unit, reorder_level || 5];
    const { rows } = await pool.query(query, values);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Add Inventory Error:', err);
    res.status(500).json({ error: 'Failed to add inventory item' });
  }
});

// PUT /api/inventory/:id - Update item quantity / reorder level
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { quantity, reorder_level } = req.body;
  const userId = req.user.id;

  try {
    const query = `
      UPDATE inventory 
      SET quantity = $1, reorder_level = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [quantity, reorder_level, id, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item not found or unauthorized' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Update Inventory Error:', err);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

module.exports = router;