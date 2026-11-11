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
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(50)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(12,2) NOT NULL,
        image_url TEXT,
        category_id INTEGER REFERENCES categories(id),
        seller_id UUID,
        seller_name VARCHAR(200),
        approval_status VARCHAR(20) DEFAULT 'approved',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Ensure columns exist for existing databases
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='seller_id') THEN
          ALTER TABLE products ADD COLUMN seller_id UUID;
          ALTER TABLE products ADD COLUMN seller_name VARCHAR(200);
          ALTER TABLE products ADD COLUMN approval_status VARCHAR(20) DEFAULT 'approved';
        END IF;
      END $$;
    `);

    // Migrate existing column if it was VARCHAR
    await client.query(`ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        product_id UUID REFERENCES products(id),
        stock INTEGER NOT NULL DEFAULT 0,
        warehouse VARCHAR(100) DEFAULT 'Principal',
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('[Catalog DB] Tables initialized');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
