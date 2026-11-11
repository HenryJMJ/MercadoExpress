const express = require('express');
const cors = require('cors');
const { pool, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 4005;

app.use(cors());
app.use(express.json());

// Health check
app.get('/tracking/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    res.json({
      service: 'tracking',
      status: 'healthy',
      timestamp: dbResult.rows[0].now,
    });
  } catch (err) {
    res.status(503).json({
      service: 'tracking',
      status: 'unhealthy',
      error: err.message,
    });
  }
});

const trackingRoutes = require('./routes');

// Routes placeholder — will be expanded in Phase 2
app.use('/tracking', trackingRoutes);

async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`[Tracking Service] Running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Tracking Service] Failed to start:', err);
    process.exit(1);
  }
}

start();
