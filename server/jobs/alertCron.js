const cron = require('node-cron');
const db = require('../db');

const initAlertCron = () => {
  // Runs every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('[CRON] Running automated agronomic disease & weather scan...');

    try {
      const simulatedHumidity = Math.floor(Math.random() * (95 - 65 + 1)) + 65;
      
      if (simulatedHumidity > 80) {
        const title = 'High Humidity Trigger: Coffee Berry Disease Alert';
        const description = `Relative humidity hit ${simulatedHumidity}%. High risk for Colletotrichum kahawae spore germination. Recommend preventive fungicide application.`;
        
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
          console.log('[CRON] High humidity disease advisory added.');
        }
      }
    } catch (err) {
      console.error('[CRON] Error running job:', err.message);
    }
  });
};

module.exports = initAlertCron;