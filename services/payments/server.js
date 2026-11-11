const express = require('express');
const cors = require('cors');
const { pool, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

// Health check
app.get('/payments/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    res.json({
      service: 'payments',
      status: 'healthy',
      timestamp: dbResult.rows[0].now,
    });
  } catch (err) {
    res.status(503).json({
      service: 'payments',
      status: 'unhealthy',
      error: err.message,
    });
  }
});

const paymentsRoutes = require('./routes');

// Routes placeholder — will be expanded in Phase 2
app.use('/payments', paymentsRoutes);

async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`[Payments Service] Running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Payments Service] Failed to start:', err);
    process.exit(1);
  }
}

start();
