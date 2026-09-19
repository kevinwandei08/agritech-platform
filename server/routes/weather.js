const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

// Helper function to generate actionable agronomic advice based on live weather
function generateAgriInsights(temperature, precipitation, windspeed) {
  const insights = [];

  // Spraying & Fertilizer Guidance
  if (precipitation > 1.5) {
    insights.push("🌧️ High Rainfall Warning: Hold off on applying liquid fertilizers or pesticides to prevent washing off and soil runoff.");
    insights.push("💧 Drainage Check: Inspect field drainage to prevent waterlogging in crop roots.");
  } else if (windspeed > 20) {
    insights.push("💨 High Wind Notice: Avoid pesticide/fungicide spraying today due to high spray drift risk.");
  } else if (precipitation === 0 && temperature > 26) {
    insights.push("☀️ Ideal Spraying Window: Weather is calm and dry. Good conditions for crop spraying and field weeding.");
  }

  // Irrigation & Soil Moisture
  if (temperature > 28 && precipitation < 0.5) {
    insights.push("🔥 High Evapotranspiration: Ensure supplemental irrigation for young crops.");
  }

  // Livestock Management
  if (temperature > 30) {
    insights.push("🐄 Heat Stress Alert: Ensure dairy cattle and poultry have adequate shade and fresh water.");
  } else if (temperature < 16) {
    insights.push("🐥 Cold Stress Alert: Keep young chicks and livestock sheltered and dry tonight.");
  }

  if (insights.length === 0) {
    insights.push("🌱 Normal Weather Conditions: Ideal day for routine farm management and monitoring.");
  }

  return insights;
}

// GET /api/weather/current - Real-time weather & agronomic advice
router.get('/current', auth, async (req, res) => {
  // Default to Kilifi / Coastal coordinates (-3.35, 40.02) if lat/lng are omitted
  const { lat = -3.35, lng = 40.02 } = req.query;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=precipitation,relativehumidity_2m`;
    const response = await axios.get(url);
    const data = response.data;

    if (!data.current_weather) {
      return res.status(500).json({ error: 'Unable to fetch weather data' });
    }

    const { temperature, windspeed, weathercode, time } = data.current_weather;
    const precipitation = data.hourly?.precipitation?.[0] || 0.0;
    const humidity = data.hourly?.relativehumidity_2m?.[0] || 60;

    const farmingInsights = generateAgriInsights(temperature, precipitation, windspeed);

    res.json({
      location: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
      },
      weather: {
        temperature_celsius: temperature,
        wind_speed_kmh: windspeed,
        precipitation_mm: precipitation,
        humidity_percent: humidity,
        weather_code: weathercode,
        recorded_at: time
      },
      agronomic_insights: farmingInsights
    });
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.status(500).json({ error: 'Server error fetching weather data' });
  }
});

module.exports = router;