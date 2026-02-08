const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../models/database');
const { v4: uuidv4 } = require('uuid');

// Create order
router.post('/', (req, res) => {
    try {
        const db = getDb();
        const { sessionId, customerName, customerEmail, customerPhone, deliveryAddress } = req.body;
        
        if (!sessionId || !customerName || !customerEmail || !deliveryAddress) {
            return res.status(400).json({ error: 'Заполните все обязательные поля' });
        }
        
        // Get cart items
        const cartItems = db.cart_items.filter(ci => ci.session_id === sessionId);
        
        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Корзина пуста' });
        }
        
        // Enrich cart items with product info
        const enrichedItems = cartItems.map(ci => {
            const product = db.products.find(p => p.id === ci.product_id);
            return {
                ...ci,
                name: product?.name || `Товар #${ci.product_id.slice(0, 8)}`,
                price: product?.price || 0
            };
        });
        
        const total = enrichedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderId = uuidv4();
        
        // Create order
        db.orders.push({
            id: orderId,
            session_id: sessionId,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone || '',
            delivery_address: deliveryAddress,
            items: enrichedItems,
            total,
            status: 'pending',
            created_at: new Date().toISOString()
        });
        
        // Clear cart
        db.cart_items = db.cart_items.filter(ci => ci.session_id !== sessionId);
        
        saveDb();
        
        res.json({ 
            success: true, 
            orderId,
            message: 'Заказ успешно создан',
            total
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Ошибка при создании заказа' });
    }
});

// Get user orders by session ID
router.get('/user/:sessionId', (req, res) => {
    try {
        const db = getDb();
        const orders = db.orders.filter(o => o.session_id === req.params.sessionId);
        
        // Sort by date descending (newest first)
        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'Ошибка при получении заказов' });
    }
});

// Get order by ID
router.get('/:orderId', (req, res) => {
    try {
        const db = getDb();
        const order = db.orders.find(o => o.id === req.params.orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Ошибка при получении заказа' });
    }
});

module.exports = router;
