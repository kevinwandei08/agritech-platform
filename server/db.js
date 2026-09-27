const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false // Required for Supabase / hosted Postgres connections
        }
      }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'agri_app',
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
      }
);

pool.on('connect', () => {
  console.log(`Connected to PostgreSQL database successfully.`);
});

pool.on('error', (err) => {
  console.error('Unexpected database client error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};