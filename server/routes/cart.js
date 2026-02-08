const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../models/database');
const { v4: uuidv4 } = require('uuid');

// Get cart items
router.get('/:sessionId', (req, res) => {
    try {
        const db = getDb();
        const { sessionId } = req.params;
        
        const cartItems = db.cart_items.filter(ci => ci.session_id === sessionId);
        
        const items = cartItems.map(ci => {
            const product = db.products.find(p => p.id === ci.product_id);
            return {
                ...ci,
                name: product?.name || 'Товар не найден',
                price: product?.price || 0,
                image: product?.image || ''
            };
        });
        
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        res.json({ items, total });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Ошибка при получении корзины' });
    }
});

// Add to cart
router.post('/add', (req, res) => {
    try {
        const db = getDb();
        const { sessionId, productId, size, color, quantity = 1 } = req.body;
        
        if (!sessionId || !productId) {
            return res.status(400).json({ error: 'Необходимы sessionId и productId' });
        }
        
        // Check if item already in cart
        const existingIndex = db.cart_items.findIndex(ci => 
            ci.session_id === sessionId && 
            ci.product_id === productId && 
            ci.size === size && 
            ci.color === color
        );
        
        if (existingIndex !== -1) {
            db.cart_items[existingIndex].quantity += quantity;
        } else {
            db.cart_items.push({
                id: uuidv4(),
                session_id: sessionId,
                product_id: productId,
                size,
                color,
                quantity,
                created_at: new Date().toISOString()
            });
        }
        
        saveDb();
        res.json({ success: true, message: 'Товар добавлен в корзину' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Ошибка при добавлении в корзину' });
    }
});

// Update cart item quantity
router.put('/update/:itemId', (req, res) => {
    try {
        const db = getDb();
        const { itemId } = req.params;
        const { quantity } = req.body;
        
        const itemIndex = db.cart_items.findIndex(ci => ci.id === itemId);
        
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Товар не найден в корзине' });
        }
        
        if (quantity <= 0) {
            db.cart_items.splice(itemIndex, 1);
        } else {
            db.cart_items[itemIndex].quantity = quantity;
        }
        
        saveDb();
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ error: 'Ошибка при обновлении корзины' });
    }
});

// Remove from cart
router.delete('/remove/:itemId', (req, res) => {
    try {
        const db = getDb();
        const itemIndex = db.cart_items.findIndex(ci => ci.id === req.params.itemId);
        
        if (itemIndex !== -1) {
            db.cart_items.splice(itemIndex, 1);
            saveDb();
        }
        
        res.json({ success: true, message: 'Товар удалён из корзины' });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Ошибка при удалении из корзины' });
    }
});

// Clear cart
router.delete('/clear/:sessionId', (req, res) => {
    try {
        const db = getDb();
        db.cart_items = db.cart_items.filter(ci => ci.session_id !== req.params.sessionId);
        saveDb();
        res.json({ success: true, message: 'Корзина очищена' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'Ошибка при очистке корзины' });
    }
});

module.exports = router;
