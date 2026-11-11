const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS — allow frontend on :5173
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
  credentials: true,
}));

// ⚠️ DO NOT use express.json() here!
// The proxy needs the raw body stream intact.

// --- Service URLs from environment ---
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth:4001',
  catalog: process.env.CATALOG_SERVICE_URL || 'http://catalog:4002',
  orders: process.env.ORDERS_SERVICE_URL || 'http://orders:4003',
  payments: process.env.PAYMENTS_SERVICE_URL || 'http://payments:4004',
  tracking: process.env.TRACKING_SERVICE_URL || 'http://tracking:4005',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://analytics:4006',
};

// --- Gateway Health Check ---
app.get('/health', (req, res) => {
  res.json({
    service: 'gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    upstreams: Object.keys(services),
  });
});

const { validateJWT } = require('./middleware');

// --- Proxy Configuration ---
// We use pathRewrite to prepend the prefix back, because app.use('/prefix')
// strips it before forwarding to the proxy target.
const createServiceProxy = (prefix, target) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => `${prefix}${path}`,
    timeout: 30000,
    proxyTimeout: 30000,
    on: {
      error: (err, req, res) => {
        console.error(`[Gateway] Proxy error for ${req.url}:`, err.message);
        if (!res.headersSent) {
          res.status(502).json({
            error: 'Bad Gateway',
            message: `Service unavailable: ${err.message}`,
          });
        }
      }
    }
  });
};

// Route: /auth/* → Auth Service (public, handles its own auth)
app.use('/auth', createServiceProxy('/auth', services.auth));

// Route: /catalog/* → Catalog Service (mostly public)
app.use('/catalog', createServiceProxy('/catalog', services.catalog));

// Route: /orders/* → Orders Service (protected)
app.use('/orders', validateJWT, createServiceProxy('/orders', services.orders));

// Route: /payments/* → Payments Service (protected)
app.use('/payments', validateJWT, createServiceProxy('/payments', services.payments));

// Route: /tracking/* → Tracking Service
app.use('/tracking', createServiceProxy('/tracking', services.tracking));

// Route: /analytics/* → Analytics Service (protected, admin)
app.use('/analytics', validateJWT, createServiceProxy('/analytics', services.analytics));

// --- 404 Fallback ---
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found. Available prefixes: /auth, /catalog, /orders, /payments, /tracking, /analytics`,
  });
});

app.listen(PORT, () => {
  console.log(`[API Gateway] Running on port ${PORT}`);
  console.log(`[API Gateway] Routing:`);
  Object.entries(services).forEach(([name, url]) => {
    console.log(`  /${name}/* → ${url}`);
  });
});
