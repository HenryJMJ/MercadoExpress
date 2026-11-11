const jwt = require('jsonwebtoken');
const redis = require('./redis');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token revoked' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Ensure active session exists (optional strict check)
    // const activeToken = await redis.get(`session:${decoded.id}`);
    // if (!activeToken || activeToken !== token) {
    //   return res.status(401).json({ error: 'Session expired or overridden' });
    // }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // role_id: 1=Cliente, 2=Operador, 3=Vendedor, 4=Contador, 5=Admin
    if (!req.user || !allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
