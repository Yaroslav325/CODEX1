const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, '../../data');
const dbPath = path.join(dataDir, 'store.json');

// In-memory database
let db = {
    users: [],
    products: [],
    cart_items: [],
    orders: []
};

function getDb() {
    return db;
}

function saveDb() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function loadDb() {
    if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf8');
        db = JSON.parse(data);
    }
}

function initDatabase() {
    // Create data directory
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Load existing data or create fresh
    loadDb();
    
    // Seed products if empty
    if (db.products.length === 0) {
        seedProducts();
    }
    
    console.log('✅ База данных инициализирована');
}

function seedProducts() {
    const products = [
        {
            id: uuidv4(),
            name: 'Классическая белая футболка',
            description: 'Базовая хлопковая футболка премиум качества. Идеально подходит для повседневной носки.',
            price: 1990,
            category: 'футболки',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            colors: ['белый', 'чёрный', 'серый'],
            stock: 50,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Джинсы Slim Fit',
            description: 'Стильные джинсы зауженного кроя из качественного денима.',
            price: 4990,
            category: 'джинсы',
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
            sizes: ['28', '30', '32', '34', '36'],
            colors: ['синий', 'чёрный', 'голубой'],
            stock: 35,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Худи с капюшоном',
            description: 'Тёплое худи оверсайз из мягкого флиса. Комфорт на каждый день.',
            price: 3990,
            category: 'худи',
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['чёрный', 'серый', 'бежевый', 'хаки'],
            stock: 40,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Платье миди',
            description: 'Элегантное платье длины миди. Подходит для офиса и особых случаев.',
            price: 5990,
            category: 'платья',
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
            sizes: ['XS', 'S', 'M', 'L'],
            colors: ['чёрный', 'бордовый', 'синий'],
            stock: 25,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Кожаная куртка',
            description: 'Классическая куртка из натуральной кожи. Стиль, проверенный временем.',
            price: 14990,
            category: 'куртки',
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['чёрный', 'коричневый'],
            stock: 15,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Спортивные брюки',
            description: 'Удобные спортивные брюки с эластичным поясом. Идеально для тренировок и отдыха.',
            price: 2990,
            category: 'брюки',
            image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['чёрный', 'серый', 'синий'],
            stock: 45,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Рубашка в клетку',
            description: 'Классическая рубашка в клетку из мягкого хлопка. Универсальный стиль.',
            price: 2490,
            category: 'рубашки',
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['красный', 'синий', 'зелёный'],
            stock: 30,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Свитер крупной вязки',
            description: 'Тёплый свитер из мериносовой шерсти. Уютно и стильно.',
            price: 4490,
            category: 'свитера',
            image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['белый', 'бежевый', 'серый', 'розовый'],
            stock: 20,
            created_at: new Date().toISOString()
        }
    ];
    
    db.products = products;
    saveDb();
    console.log(`📦 Добавлено ${products.length} товаров`);
}

module.exports = { getDb, saveDb, initDatabase };
