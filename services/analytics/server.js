const express = require('express');
const cors = require('cors');
const { pool, initDB } = require('./db');
const redis = require('./redis');

const app = express();
const PORT = process.env.PORT || 4006;

app.use(cors());
app.use(express.json());

// Health check
app.get('/analytics/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    const redisResult = await redis.ping();
    res.json({
      service: 'analytics',
      status: 'healthy',
      timestamp: dbResult.rows[0].now,
      redis: redisResult,
    });
  } catch (err) {
    res.status(503).json({
      service: 'analytics',
      status: 'unhealthy',
      error: err.message,
    });
  }
});

const analyticsRoutes = require('./routes');

// Routes placeholder — will be expanded in Phase 2
app.use('/analytics', analyticsRoutes);

async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`[Analytics Service] Running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Analytics Service] Failed to start:', err);
    process.exit(1);
  }
}

start();
