const express = require('express');
const cors = require('cors');
const { pool, initDB } = require('./db');
const redis = require('./redis');

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/catalog/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    const redisResult = await redis.ping();
    res.json({
      service: 'catalog',
      status: 'healthy',
      timestamp: dbResult.rows[0].now,
      redis: redisResult,
    });
  } catch (err) {
    res.status(503).json({
      service: 'catalog',
      status: 'unhealthy',
      error: err.message,
    });
  }
});

const catalogRoutes = require('./routes');
const seedData = require('./seed');

// Routes placeholder — will be expanded in Phase 2
app.use('/catalog', catalogRoutes);

async function start() {
  try {
    await initDB();
    await seedData();
    app.listen(PORT, () => {
      console.log(`[Catalog Service] Running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Catalog Service] Failed to start:', err);
    process.exit(1);
  }
}

start();
