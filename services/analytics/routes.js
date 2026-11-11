const express = require('express');
const { pool } = require('./db');
const redis = require('./redis');

const router = express.Router();

// Internal service URLs (inside Docker network)
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth:4001',
  catalog: process.env.CATALOG_SERVICE_URL || 'http://catalog:4002',
  orders: process.env.ORDERS_SERVICE_URL || 'http://orders:4003',
  payments: process.env.PAYMENTS_SERVICE_URL || 'http://payments:4004',
};

// Helper: fetch JSON from an internal service
async function fetchService(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`[Analytics] Error fetching ${url}:`, err.message);
    return null;
  }
}

// GET /analytics/dashboard — aggregates REAL data from other services
router.get('/dashboard', async (req, res) => {
  const cacheKey = 'cache:analytics:dashboard';
  
  try {
    // Check cache first (short TTL: 60s so data stays fresh)
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // --- Fetch real data from microservices ---
    
    // 1. Get all orders
    const allOrders = await fetchService(`${SERVICES.orders}/orders/all`) || [];
    
    // 2. Get all products from catalog
    const catalogData = await fetchService(`${SERVICES.catalog}/catalog/products`) || [];
    const products = Array.isArray(catalogData) ? catalogData : (catalogData.products || []);

    // 3. Get all payments
    const allPayments = await fetchService(`${SERVICES.payments}/payments/all`) || [];

    // --- Compute real metrics ---
    
    // Total revenue from paid orders
    const paidOrders = allOrders.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered');
    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
    const totalOrders = allOrders.length;
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    // New users count (we'll use orders to estimate unique users)
    const uniqueUsers = new Set(allOrders.map(o => o.user_id)).size;

    // Sales trends: group orders by date
    const salesByDate = {};
    allOrders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { date, revenue: 0, orders: 0 };
      }
      salesByDate[date].revenue += parseFloat(order.total || 0);
      salesByDate[date].orders += 1;
    });
    
    const salesTrends = Object.values(salesByDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // Last 7 days with data

    // Top products: use catalog products sorted by sales or just list them
    const topProducts = products
      .map(p => ({
        name: p.name,
        sold: p.stock ? (100 - p.stock) : 0, // estimate: initial stock was ~100
        revenue: p.price ? parseFloat(p.price) * (p.stock ? Math.max(0, 100 - p.stock) : 0) : 0,
        price: parseFloat(p.price || 0),
        stock: p.stock || 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent orders for the activity feed
    const recentOrders = allOrders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(o => ({
        id: o.id,
        total: parseFloat(o.total || 0),
        status: o.status,
        created_at: o.created_at,
        user_id: o.user_id
      }));

    // Payment methods breakdown
    const paymentMethods = {};
    allPayments.forEach(p => {
      const method = p.payment_method || 'unknown';
      if (!paymentMethods[method]) paymentMethods[method] = { count: 0, total: 0 };
      paymentMethods[method].count += 1;
      paymentMethods[method].total += parseFloat(p.amount || 0);
    });

    const dashboardData = {
      overview: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        activeUsers: uniqueUsers,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        totalProducts: products.length,
        paidOrders: paidOrders.length,
      },
      salesTrends: salesTrends.length > 0 ? salesTrends : [
        { date: new Date().toISOString().split('T')[0], revenue: 0, orders: 0 }
      ],
      topProducts,
      recentOrders,
      paymentMethods: Object.entries(paymentMethods).map(([method, data]) => ({
        method, ...data
      })),
      lastUpdated: new Date().toISOString()
    };
    
    // Cache for 60 seconds (short TTL for real-time feel)
    await redis.setex(cacheKey, 60, JSON.stringify(dashboardData));
    
    res.json(dashboardData);
  } catch (err) {
    console.error('[Analytics] Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /analytics/sales-trends
router.get('/sales-trends', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM daily_metrics ORDER BY date DESC LIMIT 30');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /analytics/top-products
router.get('/top-products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM product_performance ORDER BY total_revenue DESC LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
