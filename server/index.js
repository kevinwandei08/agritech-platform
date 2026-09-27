const express = require('express');
const cors = require('cors');
const dns = require('dns');

// Force Node.js to resolve IPv4 addresses first (resolves Render outbound IPv6 limits)
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();

const app = express();

// Global Middleware with Explicit CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://agritech-platform-chi.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback for production testing
    }
  },
  credentials: true
}));

app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const agrovetRoutes = require('./routes/agrovets');
const cropRoutes = require('./routes/crops');
const livestockRoutes = require('./routes/livestock');
const alertsRoutes = require('./routes/alerts');
const weatherRoutes = require('./routes/weather');
const inventoryRoutes = require('./routes/inventory');
const productionRoutes = require('./routes/production');

// Import Cron Jobs Master Handler
const startCronJobs = require('./cron');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/agrovets', agrovetRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/livestock', livestockRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Agritech API operational',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler for Unmatched Routes
app.use((req, res, next) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server & Background Cron Tasks
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🌾 Agritech Server running on http://localhost:${PORT}`);
  console.log(`========================================`);
  
  // Initialize background disease monitoring & weather sync cron jobs
  startCronJobs();
});