// server/cron.js (or server/cron/index.js)
const cron = require('node-cron');
const db = require('./db');

const startCronJobs = () => {
  console.log('⏰ [Cron Engine] Initializing scheduled background tasks...');

  // Job 1: Automated Micro-Climate & Disease Risk Scanner (Runs every 15 minutes)
  cron.schedule('*/15 * * * *', async () => {
    console.log('[CRON] Running automated agronomic disease & weather scan...');

    try {
      // Simulate relative humidity scan (e.g. 65% - 95%)
      const simulatedHumidity = Math.floor(Math.random() * (95 - 65 + 1)) + 65;
      
      if (simulatedHumidity > 80) {
        const title = 'High Humidity Trigger: Coffee Berry Disease Alert';
        const description = `Relative humidity hit ${simulatedHumidity}%. High risk for Colletotrichum kahawae spore germination in regional coffee blocks.`;

        // Check if an unread alert with this title already exists
        const existing = await db.query(
          `SELECT id FROM alerts WHERE title = $1 AND read = FALSE`,
          [title]
        );

        if (existing.rowCount === 0) {
          await db.query(
            `INSERT INTO alerts (type, severity, title, description, source)
             VALUES ($1, $2, $3, $4, $5)`,
            ['pandemic', 'critical', title, description, 'Automated Humidity Sensor Engine']
          );
          console.log('🚨 [CRON] High humidity disease advisory inserted into PostgreSQL.');
        }
      } else {
        console.log(`✅ [CRON] Weather scan nominal (Humidity: ${simulatedHumidity}%).`);
      }
    } catch (err) {
      console.error('❌ [CRON] Error executing disease monitoring job:', err.message);
    }
  });

  console.log('✅ [Cron Engine] Background workers active and listening.');
};

module.exports = startCronJobs;