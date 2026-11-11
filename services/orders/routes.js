const express = require('express');
const { pool } = require('./db');
const { calculateShipping, shippingZones } = require('./shipping');

const router = express.Router();
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://catalog:4002';

// POST /orders
router.post('/', async (req, res) => {
  const { user_id, items, shipping_address, shipping_department, shipping_city } = req.body;
  
  if (!user_id || !items || items.length === 0 || !shipping_address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    let total = 0;
    const validatedItems = [];
    
    // Simulate synchronous integration with Catalog to verify stock and prices
    for (const item of items) {
      try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`${CATALOG_SERVICE_URL}/catalog/products/${item.product_id}`);
        if (!response.ok) throw new Error(`Product ${item.product_id} not found`);
        const product = await response.json();
        
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }
        
        const subtotal = product.price * item.quantity;
        total += subtotal;
        
        validatedItems.push({
          product_id: product.id,
          product_name: product.name,
          quantity: item.quantity,
          unit_price: product.price
        });
      } catch (err) {
        throw new Error(`Validation failed for item: ${err.message}`);
      }
    }
    
    // Calculate shipping
    let { cost: shipping_cost, zone: shipping_zone } = calculateShipping(shipping_department, shipping_city);
    
    // Check if first order
    const orderCountResult = await client.query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [user_id]);
    const isFirstOrder = parseInt(orderCountResult.rows[0].count) === 0;
    
    if (isFirstOrder) {
      shipping_cost = 0; // Free shipping on first order
    }

    const final_total = total + shipping_cost;

    // Create order
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total, shipping_address, shipping_cost, shipping_zone, shipping_department, is_first_order) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, final_total, shipping_address, shipping_cost, shipping_zone, shipping_department, isFirstOrder]
    );
    const order = orderResult.rows[0];
    
    // Create order items
    for (const item of validatedItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES ($1, $2, $3, $4, $5)',
        [order.id, item.product_id, item.product_name, item.quantity, item.unit_price]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json({ order, items: validatedItems });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /orders/shipping-cost
router.get('/shipping-cost', async (req, res) => {
  const { department, city, user_id } = req.query;
  
  if (!department) {
    return res.status(400).json({ error: 'Department is required' });
  }
  
  let { cost, zone } = calculateShipping(department, city);
  let isFirstOrder = false;

  if (user_id) {
    try {
      const orderCountResult = await pool.query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [user_id]);
      isFirstOrder = parseInt(orderCountResult.rows[0].count) === 0;
      if (isFirstOrder) {
        cost = 0;
      }
    } catch (err) {
      console.error('Error checking first order:', err);
    }
  }

  res.json({ cost, zone, isFirstOrder });
});

// GET /orders/all (for analytics — returns all orders)
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /orders (for a user)
router.get('/', async (req, res) => {
  const { user_id } = req.query; // in real app, extracted from JWT
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });
  
  try {
    const result = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /orders/:id
router.get('/:id', async (req, res) => {
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    
    const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
    
    const items = itemsResult.rows;
    
    // Enrich items with catalog data (image_url, description)
    try {
      const fetch = (await import('node-fetch')).default;
      for (let item of items) {
        try {
          const response = await fetch(`${CATALOG_SERVICE_URL}/catalog/products/${item.product_id}`);
          if (response.ok) {
            const product = await response.json();
            item.image_url = product.image_url;
            item.description = product.description;
          }
        } catch (fetchErr) {
          console.error(`Failed to fetch catalog details for product ${item.product_id}`);
        }
      }
    } catch (err) {
      console.error('Error importing node-fetch', err);
    }

    res.json({
      ...orderResult.rows[0],
      items: items
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /orders/:id/status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
