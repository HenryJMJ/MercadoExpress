const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales_summary (
        id SERIAL PRIMARY KEY,
        period VARCHAR(20) NOT NULL,
        total_orders INTEGER DEFAULT 0,
        total_revenue DECIMAL(14,2) DEFAULT 0,
        avg_order_value DECIMAL(12,2) DEFAULT 0,
        recorded_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS product_performance (
        id SERIAL PRIMARY KEY,
        product_id UUID NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        total_sold INTEGER DEFAULT 0,
        total_revenue DECIMAL(14,2) DEFAULT 0,
        period VARCHAR(20) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_metrics (
        id SERIAL PRIMARY KEY,
        date DATE UNIQUE NOT NULL,
        new_users INTEGER DEFAULT 0,
        orders_placed INTEGER DEFAULT 0,
        revenue DECIMAL(14,2) DEFAULT 0
      );
    `);

    console.log('[Analytics DB] Tables initialized');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
