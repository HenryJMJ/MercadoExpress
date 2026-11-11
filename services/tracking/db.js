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
      CREATE TABLE IF NOT EXISTS shipments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL,
        carrier VARCHAR(100) DEFAULT 'MercadoExpress Logistics',
        tracking_number VARCHAR(100) UNIQUE,
        estimated_delivery DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tracking_events (
        id SERIAL PRIMARY KEY,
        shipment_id UUID REFERENCES shipments(id),
        status VARCHAR(50) NOT NULL,
        location VARCHAR(200),
        description TEXT,
        event_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('[Tracking DB] Tables initialized');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
