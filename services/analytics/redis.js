const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  console.log('[Analytics Redis] Connected');
});

redis.on('error', (err) => {
  console.error('[Analytics Redis] Error:', err.message);
});

module.exports = redis;
