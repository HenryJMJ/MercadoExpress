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
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        total DECIMAL(12,2) NOT NULL,
        shipping_address TEXT NOT NULL,
        shipping_cost DECIMAL(12,2) DEFAULT 0,
        shipping_zone VARCHAR(100),
        shipping_department VARCHAR(100),
        is_first_order BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Ensure columns exist for existing databases
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shipping_cost') THEN
          ALTER TABLE orders ADD COLUMN shipping_cost DECIMAL(12,2) DEFAULT 0;
          ALTER TABLE orders ADD COLUMN shipping_zone VARCHAR(100);
          ALTER TABLE orders ADD COLUMN shipping_department VARCHAR(100);
          ALTER TABLE orders ADD COLUMN is_first_order BOOLEAN DEFAULT false;
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id UUID REFERENCES orders(id),
        product_id UUID NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(12,2) NOT NULL
      );
    `);

    console.log('[Orders DB] Tables initialized');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
