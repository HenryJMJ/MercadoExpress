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
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        phone VARCHAR(20),
        role_id INTEGER REFERENCES roles(id) DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed default roles if they don't exist
    const roles = ['Cliente', 'Operador', 'Vendedor', 'Contador', 'Administrador'];
    for (const role of roles) {
      await client.query(
        `INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [role]
      );
    }

    console.log('[Auth DB] Tables initialized & roles seeded');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
