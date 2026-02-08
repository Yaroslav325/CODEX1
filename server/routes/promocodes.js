const express = require('express');
const router = express.Router();
const { getDb } = require('../models/database');

// Validate promocode
router.post('/validate', (req, res) => {
    try {
        const db = getDb();
        const { code, cartTotal } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Введите промокод' });
        }
        
        const promocode = db.promocodes.find(p => 
            p.code.toLowerCase() === code.toLowerCase() && p.active
        );
        
        if (!promocode) {
            return res.status(400).json({ error: 'Недействительный промокод' });
        }
        
        let discount = 0;
        let discountText = '';
        
        if (promocode.type === 'percent') {
            discount = Math.round((cartTotal * promocode.discount) / 100);
            discountText = `${promocode.discount}%`;
        } else {
            discount = promocode.discount;
            discountText = `${promocode.discount} ₽`;
        }
        
        res.json({
            success: true,
            code: promocode.code,
            discount,
            discountText,
            message: `Скидка ${discountText} применена!`
        });
    } catch (error) {
        console.error('Error validating promocode:', error);
        res.status(500).json({ error: 'Ошибка при проверке промокода' });
    }
});

// Get all active promocodes (for admin/demo)
router.get('/list', (req, res) => {
    try {
        const db = getDb();
        const codes = db.promocodes.filter(p => p.active).map(p => ({
            code: p.code,
            discount: p.type === 'percent' ? `${p.discount}%` : `${p.discount} ₽`
        }));
        res.json(codes);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения промокодов' });
    }
});

module.exports = router;
