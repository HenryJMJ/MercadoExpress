const express = require('express');
const cors = require('cors');
const { pool, initDB } = require('./db');
const redis = require('./redis');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/auth/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    const redisResult = await redis.ping();
    res.json({
      service: 'auth',
      status: 'healthy',
      timestamp: dbResult.rows[0].now,
      redis: redisResult,
    });
  } catch (err) {
    res.status(503).json({
      service: 'auth',
      status: 'unhealthy',
      error: err.message,
    });
  }
});

const authRoutes = require('./routes');
const { authMiddleware } = require('./middleware');

// Routes placeholder — will be expanded in Phase 2
app.use('/auth', authRoutes);

app.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, full_name, phone, role_id FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`[Auth Service] Running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Auth Service] Failed to start:', err);
    process.exit(1);
  }
}

start();
