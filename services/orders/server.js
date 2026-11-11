const express = require('express');
const cors = require('cors');
const { pool, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

// Health check
app.get('/orders/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    res.json({
      service: 'orders',
      status: 'healthy',
      timestamp: dbResult.rows[0].now,
    });
  } catch (err) {
    res.status(503).json({
      service: 'orders',
      status: 'unhealthy',
      error: err.message,
    });
  }
});

const ordersRoutes = require('./routes');

// Routes placeholder — will be expanded in Phase 2
app.use('/orders', ordersRoutes);

async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`[Orders Service] Running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Orders Service] Failed to start:', err);
    process.exit(1);
  }
}

start();
