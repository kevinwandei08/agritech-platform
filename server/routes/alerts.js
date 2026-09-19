const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const axios = require('axios');
const twilio = require('twilio');

// Initialize Twilio Client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// GET /api/alerts - Feed combining DB advisories and live weather triggers
router.get('/', async (req, res) => {
  try {
    const { rows: dbAlerts } = await db.query(
      `SELECT id, type, severity, title, description, source, read, to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as timestamp 
       FROM alerts 
       ORDER BY created_at DESC 
       LIMIT 50`
    );

    // Fetch weather risk triggers (Watamu/Kilifi default coords)
    let weatherAlerts = [];
    try {
      const weatherRes = await axios.get(
        'https://api.open-meteo.com/v1/forecast?latitude=-3.35&longitude=40.02&daily=precipitation_sum,temperature_2m_max&timezone=auto'
      );
      const daily = weatherRes.data?.daily;
      if (daily) {
        const maxTemp = daily.temperature_2m_max[0];
        const rainSum = daily.precipitation_sum[0];

        if (rainSum > 10) {
          weatherAlerts.push({
            id: 'wx-rain-' + Date.now(),
            severity: 'warning',
            source: 'Agro-Weather API',
            title: 'Heavy Rainfall Advisory',
            description: `Expected rainfall of ${rainSum}mm. Delay copper/fungicide applications on Coffee & Tea blocks.`,
            read: false,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
          });
        }

        if (maxTemp > 30) {
          weatherAlerts.push({
            id: 'wx-heat-' + Date.now(),
            severity: 'critical',
            source: 'Agro-Weather API',
            title: 'Livestock Heat Stress Warning',
            description: `Temperatures reaching ${maxTemp}°C. Ensure additional shade and hydration for high-yielding cows.`,
            read: false,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
          });
        }
      }
    } catch (wxErr) {
      console.log('Skipping live weather fetch:', wxErr.message);
    }

    res.json({ alerts: [...weatherAlerts, ...dbAlerts] });
  } catch (err) {
    console.error('Error fetching alerts:', err.message);
    res.status(500).json({ error: 'Failed to retrieve alerts feed' });
  }
});

// POST /api/alerts/notify-whatsapp - Dispatch alert via Twilio WhatsApp API
router.post('/notify-whatsapp', async (req, res) => {
  const { alertTitle, alertDescription, recipientPhone } = req.body;

  if (!alertTitle || !alertDescription) {
    return res.status(400).json({ error: 'Alert title and description are required' });
  }

  const targetPhone = recipientPhone || process.env.MANAGER_WHATSAPP_NUMBER;

  try {
    const message = await twilioClient.messages.create({
      body: `🌾 *AGRITECH RISK ADVISORY*\n\n*${alertTitle}*\n${alertDescription}`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${targetPhone}`
    });

    return res.json({ success: true, sid: message.sid });
  } catch (err) {
    console.error('Twilio WhatsApp dispatch error:', err.message);
    return res.status(500).json({ error: 'Failed to send WhatsApp alert' });
  }
});

// PATCH /api/alerts/read-all - Protected (Mark all as read)
router.patch('/read-all', auth, async (req, res) => {
  try {
    await db.query('UPDATE alerts SET read = TRUE WHERE read = FALSE');
    res.json({ message: 'All alerts marked as read' });
  } catch (err) {
    console.error('Error updating alerts:', err.message);
    res.status(500).json({ error: 'Failed to update alerts' });
  }
});

// PATCH /api/alerts/:id/read - Protected (Mark single alert as read)
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('UPDATE alerts SET read = TRUE WHERE id = $1 RETURNING *', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ message: 'Alert marked as read', alert: rows[0] });
  } catch (err) {
    console.error('Error updating single alert:', err.message);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

module.exports = router;