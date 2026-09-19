const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Import Authentication Middleware (Required to extract req.user.id from JWT)
const authMiddleware = require('./middleware/auth'); 

// Import Routes
const authRoutes = require('./routes/auth');
const agrovetRoutes = require('./routes/agrovets');
const cropRoutes = require('./routes/crops');
const livestockRoutes = require('./routes/livestock');
const alertsRoutes = require('./routes/alerts');
const weatherRoutes = require('./routes/weather');
const inventoryRoutes = require('./routes/inventory'); // 1. Import Inventory Route

// Import Cron Jobs Master Handler
const startCronJobs = require('./cron');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/agrovets', agrovetRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/livestock', livestockRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/inventory', authMiddleware, inventoryRoutes); // 2. Mount Inventory Route with Auth Protection

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