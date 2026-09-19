const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Supported crop types
const VALID_CROPS = ['coffee', 'sugarcane', 'avocado', 'tea'];

// @route   POST /api/crops
// @desc    Register a new crop batch/field for the logged-in farmer
// @access  Protected
router.post('/', auth, async (req, res) => {
  const { crop_type, stage, acreage, planted_at, expected_harvest_date } = req.body;

  if (!VALID_CROPS.includes(crop_type.toLowerCase())) {
    return res.status(400).json({ error: `Invalid crop_type. Must be one of: ${VALID_CROPS.join(', ')}` });
  }

  try {
    const query = `
      INSERT INTO crops (user_id, crop_type, stage, acreage, planted_at, expected_harvest_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await db.query(query, [
      req.user.id,
      crop_type.toLowerCase(),
      stage || 'cultivation',
      acreage,
      planted_at,
      expected_harvest_date || null
    ]);

    res.status(201).json({ message: 'Crop record created successfully', crop: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/crops
// @desc    Get all crops owned by the logged-in farmer
// @access  Protected
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM crops WHERE user_id = $1 ORDER BY planted_at DESC',
      [req.user.id]
    );

    res.json({ count: result.rows.length, crops: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/crops/:id/stage
// @desc    Update the growth lifecycle stage of a crop (e.g., cultivation -> weeding -> harvest)
// @access  Protected
router.put('/:id/stage', auth, async (req, res) => {
  const { stage } = req.body;
  const cropId = req.params.id;

  try {
    const query = `
      UPDATE crops
      SET stage = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *;
    `;

    const result = await db.query(query, [stage, cropId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crop record not found or unauthorized' });
    }

    res.json({ message: 'Crop lifecycle stage updated', crop: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;