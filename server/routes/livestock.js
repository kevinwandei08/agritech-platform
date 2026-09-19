const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

const VALID_LIVESTOCK = ['beef', 'dairy', 'poultry'];

// @route   POST /api/livestock
// @desc    Add a new animal/flock entry
// @access  Protected
router.post('/', auth, async (req, res) => {
  const { animal_type, tag_id, stage, birth_date, notes } = req.body;

  if (!VALID_LIVESTOCK.includes(animal_type.toLowerCase())) {
    return res.status(400).json({ error: `Invalid animal_type. Must be one of: ${VALID_LIVESTOCK.join(', ')}` });
  }

  try {
    const query = `
      INSERT INTO livestock (user_id, animal_type, tag_id, stage, birth_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await db.query(query, [
      req.user.id,
      animal_type.toLowerCase(),
      tag_id || null,
      stage || 'birth',
      birth_date,
      notes || null
    ]);

    res.status(201).json({ message: 'Livestock entry added', livestock: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/livestock
// @desc    Get all livestock owned by the logged-in farmer
// @access  Protected
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM livestock WHERE user_id = $1 ORDER BY birth_date DESC',
      [req.user.id]
    );

    res.json({ count: result.rows.length, livestock: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/livestock/:id/stage
// @desc    Transition animal stage (e.g., birth -> milking -> processing/butcher)
// @access  Protected
router.put('/:id/stage', auth, async (req, res) => {
  const { stage, notes } = req.body;
  const livestockId = req.params.id;

  try {
    const query = `
      UPDATE livestock
      SET stage = $1, notes = COALESCE($2, notes)
      WHERE id = $3 AND user_id = $4
      RETURNING *;
    `;

    const result = await db.query(query, [stage, notes, livestockId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Livestock record not found or unauthorized' });
    }

    res.json({ message: 'Livestock stage updated', livestock: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;