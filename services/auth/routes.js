const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('./db');
const redis = require('./redis');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Helper for generating JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role_id: user.role_id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, full_name, phone } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, phone) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role_id',
      [email, password_hash, full_name, phone]
    );

    const user = result.rows[0];
    const token = generateToken(user);
    
    // Store session in Redis
    await redis.setex(`session:${user.id}`, 86400, token); // 24h

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    
    // Store session in Redis
    await redis.setex(`session:${user.id}`, 86400, token); // 24h

    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(400).json({ error: 'No token provided' });

  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.id) {
       await redis.del(`session:${decoded.id}`);
       // Add to blacklist until expiry
       const expiry = decoded.exp - Math.floor(Date.now() / 1000);
       if (expiry > 0) {
          await redis.setex(`blacklist:${token}`, expiry, 'revoked');
       }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /auth/profile
router.put('/profile', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { full_name, phone } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ error: 'El nombre completo es obligatorio' });
    }

    const result = await pool.query(
      'UPDATE users SET full_name = $1, phone = $2 WHERE id = $3 RETURNING id, email, full_name, phone, role_id, created_at',
      [full_name.trim(), phone ? phone.trim() : null, decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Perfil actualizado exitosamente', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /auth/change-password
router.put('/change-password', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Debes proporcionar la contraseña actual y la nueva' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(new_password, salt);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, decoded.id]);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
