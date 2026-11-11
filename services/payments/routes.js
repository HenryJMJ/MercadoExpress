const express = require('express');
const { pool } = require('./db');

const router = express.Router();

// POST /payments/process
router.post('/process', async (req, res) => {
  const { order_id, user_id, amount, method } = req.body;
  
  if (!order_id || !user_id || !amount || !method) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Simulate payment processing (always succeeds for this demo)
    const status = 'completed';
    
    // Create transaction
    const txResult = await client.query(
      'INSERT INTO transactions (order_id, user_id, amount, method, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [order_id, user_id, amount, method, status]
    );
    const transaction = txResult.rows[0];
    
    // Generate invoice
    const taxRate = 0.19; // 19% VAT
    const subtotal = amount / (1 + taxRate);
    const tax = amount - subtotal;
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const invoiceResult = await client.query(
      'INSERT INTO invoices (transaction_id, invoice_number, subtotal, tax, total) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [transaction.id, invoiceNumber, subtotal, tax, amount]
    );
    const invoice = invoiceResult.rows[0];
    
    await client.query('COMMIT');
    
    // In a real app, this might emit an event or call Orders service to update status
    
    res.status(200).json({ transaction, invoice });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /payments/all (for analytics — returns all transactions)
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /payments/transaction/:id
router.get('/transaction/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /payments/invoices
router.get('/invoices', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, t.order_id, t.user_id 
      FROM invoices i
      JOIN transactions t ON i.transaction_id = t.id
      ORDER BY i.issued_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /payments/invoices/:id
router.get('/invoices/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, t.order_id, t.user_id, t.method, t.status 
      FROM invoices i
      JOIN transactions t ON i.transaction_id = t.id
      WHERE i.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /payments/order/:orderId
router.get('/order/:orderId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, t.order_id, t.user_id, t.method, t.status as payment_status, t.created_at as payment_date
      FROM invoices i
      JOIN transactions t ON i.transaction_id = t.id
      WHERE t.order_id = $1
      ORDER BY i.issued_at DESC
      LIMIT 1
    `, [req.params.orderId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found for this order' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
