const { pool } = require('./db');

const seedData = async () => {
  const client = await pool.connect();
  try {
    // Check if categories exist
    const { rows: categories } = await client.query('SELECT * FROM categories');
    if (categories.length === 0) {
      console.log('[Catalog DB] Seeding categories...');
      await client.query(`
        INSERT INTO categories (name, slug, icon) VALUES
        ('Electrónica', 'electronica', 'laptop'),
        ('Ropa', 'ropa', 'shirt'),
        ('Hogar', 'hogar', 'home')
      `);
      
      const { rows: newCats } = await client.query('SELECT * FROM categories');
      
      console.log('[Catalog DB] Seeding products...');
      const p1 = await client.query(`
        INSERT INTO products (name, description, price, category_id, image_url) VALUES
        ('Laptop Pro 15', 'High performance laptop for professionals', 1299.99, $1, 'https://picsum.photos/400?laptop')
        RETURNING id
      `, [newCats[0].id]);
      
      await client.query('INSERT INTO inventory (product_id, stock) VALUES ($1, 50)', [p1.rows[0].id]);
      
      const p2 = await client.query(`
        INSERT INTO products (name, description, price, category_id, image_url) VALUES
        ('Smartphone X', 'Latest generation smartphone', 899.50, $1, 'https://picsum.photos/400?phone')
        RETURNING id
      `, [newCats[0].id]);
      
      await client.query('INSERT INTO inventory (product_id, stock) VALUES ($1, 200)', [p2.rows[0].id]);
      
      console.log('[Catalog DB] Seed complete.');
    }
  } catch (err) {
    console.error('[Catalog DB] Seeding error:', err);
  } finally {
    client.release();
  }
};

module.exports = seedData;
