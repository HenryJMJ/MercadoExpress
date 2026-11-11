const express = require('express');
const { pool } = require('./db');
const redis = require('./redis');

const router = express.Router();

// Helper for caching
const cacheRequest = async (req, res, next) => {
  const key = `cache:catalog:${req.originalUrl}`;
  try {
    const cached = await redis.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    // Override res.json to cache response
    const originalJson = res.json;
    res.json = (body) => {
      redis.setex(key, 300, JSON.stringify(body)); // 5 mins cache
      originalJson.call(res, body);
    };
    next();
  } catch (err) {
    next(); // Silently fail cache if Redis is down
  }
};

// GET /catalog/categories
router.get('/categories', cacheRequest, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /catalog/products
router.get('/products', cacheRequest, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = `
      SELECT p.*, c.name as category_name, i.stock 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = true AND p.approval_status IN ('approved', 'paused')
    `;
    const params = [];
    
    if (category) {
      params.push(category);
      query += ` AND c.slug = $${params.length}`;
    }
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND p.name ILIKE $${params.length}`;
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /catalog/products/:id
router.get('/products/:id', cacheRequest, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name, i.stock 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id = $1 AND p.approval_status IN ('approved', 'paused')
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /catalog/products
router.post('/products', async (req, res) => {
  const { name, description, price, category, image_url, stock } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Find category id
    const catResult = await client.query('SELECT id FROM categories WHERE slug = $1', [category || 'electronica']);
    let category_id = null;
    if (catResult.rows.length > 0) {
      category_id = catResult.rows[0].id;
    } else {
      const newCat = await client.query('INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id', [category, category]);
      category_id = newCat.rows[0].id;
    }

    const productResult = await client.query(
      'INSERT INTO products (name, description, price, category_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, category_id, image_url]
    );
    const product = productResult.rows[0];

    if (stock !== undefined) {
      await client.query('INSERT INTO inventory (product_id, stock) VALUES ($1, $2)', [product.id, stock]);
    } else {
      await client.query('INSERT INTO inventory (product_id, stock) VALUES ($1, 0)', [product.id]);
    }
    
    // Invalidate cache
    await redis.keys('cache:catalog*').then(keys => {
      if (keys.length > 0) redis.del(...keys);
    });
    
    await client.query('COMMIT');
    res.status(201).json(product);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /catalog/products/:id
router.put('/products/:id', async (req, res) => {
  const { name, description, price, category, image_url, stock, is_active, approval_status } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (price !== undefined) { fields.push(`price = $${idx++}`); values.push(price); }
    if (image_url !== undefined) { fields.push(`image_url = $${idx++}`); values.push(image_url); }
    if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }
    if (approval_status !== undefined) { fields.push(`approval_status = $${idx++}`); values.push(approval_status); }

    if (fields.length > 0) {
      values.push(req.params.id);
      await client.query(`UPDATE products SET ${fields.join(', ')} WHERE id = $${idx}`, values);
    }

    if (stock !== undefined) {
      const invCheck = await client.query('SELECT product_id FROM inventory WHERE product_id = $1', [req.params.id]);
      if (invCheck.rows.length > 0) {
        await client.query('UPDATE inventory SET stock = $1 WHERE product_id = $2', [stock, req.params.id]);
      } else {
        await client.query('INSERT INTO inventory (product_id, stock) VALUES ($1, $2)', [req.params.id, stock]);
      }
    }
    
    // Invalidate cache
    await redis.keys('cache:catalog*').then(keys => {
      if (keys.length > 0) redis.del(...keys);
    });
    
    await client.query('COMMIT');
    res.json({ message: 'Product updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /catalog/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    // Soft delete: set is_active to false
    await pool.query('UPDATE products SET is_active = false WHERE id = $1', [req.params.id]);
    
    // Invalidate cache
    await redis.keys('cache:catalog*').then(keys => {
      if (keys.length > 0) redis.del(...keys);
    });
    
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SELLER MARKETPLACE ENDPOINTS
// ==========================================

// GET /catalog/seller-products (For a specific seller or all pending for admin)
router.get('/seller-products', async (req, res) => {
  const { seller_id, status } = req.query;
  try {
    let query = `
      SELECT p.*, c.name as category_name, i.stock 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.seller_id IS NOT NULL
    `;
    const params = [];
    
    if (seller_id) {
      params.push(seller_id);
      query += ` AND p.seller_id = $${params.length}`;
    }
    
    // Add is_active = true to not fetch deleted items
    query += ` AND p.is_active = true`;
    
    if (status && status !== 'all') {
      params.push(status);
      query += ` AND p.approval_status = $${params.length}`;
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /catalog/seller-products/:id (Get a specific seller product regardless of approval status)
router.get('/seller-products/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name, i.stock 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id = $1 AND p.seller_id IS NOT NULL
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /catalog/seller-products
router.post('/seller-products', async (req, res) => {
  const { name, description, price, category, image_url, stock, seller_id, seller_name } = req.body;
  if (!name || !price || !seller_id || !seller_name) {
    return res.status(400).json({ error: 'Name, price, seller_id and seller_name are required' });
  }
  
  if (price < 10000) {
    return res.status(400).json({ error: 'El precio mínimo para publicar es $10,000' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const catResult = await client.query('SELECT id FROM categories WHERE slug = $1', [category || 'otros']);
    let category_id = null;
    if (catResult.rows.length > 0) {
      category_id = catResult.rows[0].id;
    } else {
      const newCat = await client.query('INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id', [category || 'Otros', category || 'otros']);
      category_id = newCat.rows[0].id;
    }

    const productResult = await client.query(
      'INSERT INTO products (name, description, price, category_id, image_url, seller_id, seller_name, approval_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, description, price, category_id, image_url, seller_id, seller_name, 'pending']
    );
    const product = productResult.rows[0];

    if (stock !== undefined) {
      await client.query('INSERT INTO inventory (product_id, stock) VALUES ($1, $2)', [product.id, stock]);
    } else {
      await client.query('INSERT INTO inventory (product_id, stock) VALUES ($1, 0)', [product.id]);
    }
    
    await client.query('COMMIT');
    res.status(201).json(product);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /catalog/seller-products/:id/approve
router.put('/seller-products/:id/approve', async (req, res) => {
  const { status } = req.body; 
  
  if (!['approved', 'rejected', 'paused', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      'UPDATE products SET approval_status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Invalidate cache for any status change so it updates immediately
    await redis.keys('cache:catalog*').then(keys => {
      if (keys.length > 0) redis.del(...keys);
    });
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
