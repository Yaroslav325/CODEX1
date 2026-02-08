const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../models/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'clothing-store-secret-key-2024';

// Register
router.post('/register', async (req, res) => {
    try {
        const db = getDb();
        const { email, password, name, phone } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, пароль и имя обязательны' });
        }
        
        // Check if user exists
        const existing = db.users.find(u => u.email === email);
        if (existing) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        
        db.users.push({
            id: userId,
            email,
            password: hashedPassword,
            name,
            phone: phone || '',
            address: '',
            created_at: new Date().toISOString()
        });
        
        saveDb();
        
        const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ 
            success: true, 
            token,
            user: { id: userId, email, name }
        });
    } catch (error) {
        console.error('Error registering:', error);
        res.status(500).json({ error: 'Ошибка при регистрации' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const db = getDb();
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email и пароль обязательны' });
        }
        
        const user = db.users.find(u => u.email === email);
        
        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ 
            success: true, 
            token,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Ошибка при входе' });
    }
});

// Get current user
router.get('/me', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const db = getDb();
        const user = db.users.find(u => u.id === decoded.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            address: user.address
        });
    } catch (error) {
        res.status(401).json({ error: 'Недействительный токен' });
    }
});

module.exports = router;
