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
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL,
        user_id UUID NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        processed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id UUID REFERENCES transactions(id),
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        subtotal DECIMAL(12,2) NOT NULL,
        tax DECIMAL(12,2) NOT NULL,
        total DECIMAL(12,2) NOT NULL,
        issued_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('[Payments DB] Tables initialized');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
