const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./models/database');

// Import routes
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const wishlistRoutes = require('./routes/wishlist');
const promocodesRoutes = require('./routes/promocodes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/promocodes', promocodesRoutes);

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize database and start server
initDatabase();

app.listen(PORT, () => {
    console.log(`🛍️  Магазин одежды запущен на http://localhost:${PORT}`);
    console.log(`📦 API доступен на http://localhost:${PORT}/api`);
});

module.exports = app;
