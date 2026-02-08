const express = require('express');
const router = express.Router();
const { getDb } = require('../models/database');

// Get all products
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const { category, search, sort } = req.query;
        
        let products = db.products.filter(p => p.stock > 0);
        
        if (category && category !== 'все') {
            products = products.filter(p => p.category === category);
        }
        
        if (search) {
            const searchLower = search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchLower) || 
                p.description.toLowerCase().includes(searchLower)
            );
        }
        
        if (sort === 'price_asc') {
            products.sort((a, b) => a.price - b.price);
        } else if (sort === 'price_desc') {
            products.sort((a, b) => b.price - a.price);
        } else if (sort === 'name') {
            products.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Ошибка при получении товаров' });
    }
});

// Get single product
router.get('/:id', (req, res) => {
    try {
        const db = getDb();
        const product = db.products.find(p => p.id === req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Ошибка при получении товара' });
    }
});

// Get categories
router.get('/meta/categories', (req, res) => {
    try {
        const db = getDb();
        const categories = [...new Set(db.products.map(p => p.category))];
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении категорий' });
    }
});

module.exports = router;
