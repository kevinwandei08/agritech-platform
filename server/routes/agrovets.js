const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/agrovets - Retrieve all agrovets or query nearest by lat/lng
router.get('/', async (req, res) => {
  try {
    // Default origin coordinates: Watamu (-3.3533, 40.0156)
    const lat = parseFloat(req.query.lat) || -3.3533;
    const lng = parseFloat(req.query.lng) || 40.0156;
    const radiusKm = parseFloat(req.query.radius) || 50; // Default 50km radius

    const query = `
      SELECT 
        id, 
        name, 
        town, 
        address, 
        phone, 
        rating, 
        services, 
        is_open,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS translateY,
        ST_Y(location::geometry) AS latitude,
        ROUND((ST_DistanceSphere(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)) / 1000)::numeric, 2) AS distance_km
      FROM agrovets
      WHERE ST_DWithin(
        location::geography, 
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 
        $3 * 1000
      )
      ORDER BY distance_km ASC
      LIMIT 20;
    `;

    const { rows } = await db.query(query, [lng, lat, radiusKm]);

    res.json({
      count: rows.length,
      origin: { latitude: lat, longitude: lng },
      agrovets: rows
    });
  } catch (err) {
    console.error('Error querying spatial agrovets:', err.message);
    res.status(500).json({ error: 'Failed to retrieve agrovets' });
  }
});

// GET /api/agrovets/:id - Retrieve single agrovet details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT id, name, town, address, phone, rating, services, is_open,
              ST_X(location::geometry) AS longitude,
              ST_Y(location::geometry) AS latitude
       FROM agrovets WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Agrovet not found' });
    }

    res.json({ agrovet: rows[0] });
  } catch (err) {
    console.error('Error fetching agrovet:', err.message);
    res.status(500).json({ error: 'Failed to fetch agrovet' });
  }
});

module.exports = router;