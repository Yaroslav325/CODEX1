const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../models/database');
const { v4: uuidv4 } = require('uuid');

// Get wishlist
router.get('/:sessionId', (req, res) => {
    try {
        const db = getDb();
        const { sessionId } = req.params;
        
        const wishlistItems = db.wishlist.filter(w => w.session_id === sessionId);
        
        const items = wishlistItems.map(w => {
            const product = db.products.find(p => p.id === w.product_id);
            return product ? { ...product, wishlist_id: w.id } : null;
        }).filter(Boolean);
        
        res.json(items);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ error: 'Ошибка при получении избранного' });
    }
});

// Add to wishlist
router.post('/add', (req, res) => {
    try {
        const db = getDb();
        const { sessionId, productId } = req.body;
        
        if (!sessionId || !productId) {
            return res.status(400).json({ error: 'Необходимы sessionId и productId' });
        }
        
        // Check if already in wishlist
        const existing = db.wishlist.find(w => 
            w.session_id === sessionId && w.product_id === productId
        );
        
        if (existing) {
            return res.json({ success: true, message: 'Товар уже в избранном' });
        }
        
        db.wishlist.push({
            id: uuidv4(),
            session_id: sessionId,
            product_id: productId,
            created_at: new Date().toISOString()
        });
        
        saveDb();
        res.json({ success: true, message: 'Добавлено в избранное' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ error: 'Ошибка при добавлении в избранное' });
    }
});

// Remove from wishlist
router.delete('/remove/:sessionId/:productId', (req, res) => {
    try {
        const db = getDb();
        const { sessionId, productId } = req.params;
        
        const index = db.wishlist.findIndex(w => 
            w.session_id === sessionId && w.product_id === productId
        );
        
        if (index !== -1) {
            db.wishlist.splice(index, 1);
            saveDb();
        }
        
        res.json({ success: true, message: 'Удалено из избранного' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ error: 'Ошибка при удалении из избранного' });
    }
});

// Check if in wishlist
router.get('/check/:sessionId/:productId', (req, res) => {
    try {
        const db = getDb();
        const { sessionId, productId } = req.params;
        
        const exists = db.wishlist.some(w => 
            w.session_id === sessionId && w.product_id === productId
        );
        
        res.json({ inWishlist: exists });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка проверки избранного' });
    }
});

module.exports = router;
