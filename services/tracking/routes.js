const express = require('express');
const { pool } = require('./db');

const router = express.Router();

// GET /tracking/:orderId
router.get('/:orderId', async (req, res) => {
  try {
    const shipmentResult = await pool.query(
      'SELECT * FROM shipments WHERE order_id::text LIKE $1', 
      [`${req.params.orderId.toLowerCase()}%`]
    );
    if (shipmentResult.rows.length === 0) return res.status(404).json({ error: 'Shipment not found for this order' });
    
    const shipment = shipmentResult.rows[0];
    
    const eventsResult = await pool.query('SELECT * FROM tracking_events WHERE shipment_id = $1 ORDER BY event_at DESC', [shipment.id]);
    
    res.json({
      ...shipment,
      events: eventsResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tracking/shipment/:id
router.get('/shipment/:id', async (req, res) => {
  try {
    const shipmentResult = await pool.query('SELECT * FROM shipments WHERE id = $1', [req.params.id]);
    if (shipmentResult.rows.length === 0) return res.status(404).json({ error: 'Shipment not found' });
    
    const shipment = shipmentResult.rows[0];
    
    const eventsResult = await pool.query('SELECT * FROM tracking_events WHERE shipment_id = $1 ORDER BY event_at DESC', [shipment.id]);
    
    res.json({
      ...shipment,
      events: eventsResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tracking/update
// Usually called internally by webhooks from carriers or an admin
router.post('/update', async (req, res) => {
  const { shipment_id, order_id, status, location, description } = req.body;
  
  if (!status || (!shipment_id && !order_id)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    let shipmentId = shipment_id;
    
    // If order_id is provided but no shipment exists, create one
    if (!shipmentId && order_id) {
      const existing = await client.query('SELECT id FROM shipments WHERE order_id = $1', [order_id]);
      if (existing.rows.length > 0) {
        shipmentId = existing.rows[0].id;
      } else {
        const trackingNumber = `TRK-${Date.now()}`;
        const newShipment = await client.query(
          'INSERT INTO shipments (order_id, tracking_number, estimated_delivery) VALUES ($1, $2, CURRENT_DATE + 3) RETURNING id',
          [order_id, trackingNumber]
        );
        shipmentId = newShipment.rows[0].id;
      }
    }
    
    const eventResult = await client.query(
      'INSERT INTO tracking_events (shipment_id, status, location, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [shipmentId, status, location, description]
    );
    
    await client.query('COMMIT');
    res.status(201).json(eventResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
