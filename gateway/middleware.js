const jwt = require('jsonwebtoken');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const validateJWT = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Check if token is in blacklist
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token revoked' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Inject user info into headers so microservices can use it
    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-role'] = decoded.role_id;
    
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { validateJWT };
