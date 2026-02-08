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
    orders: [],
    wishlist: [],
    promocodes: [
        { code: 'WELCOME10', discount: 10, type: 'percent', active: true },
        { code: 'SALE500', discount: 500, type: 'fixed', active: true },
        { code: 'VIP20', discount: 20, type: 'percent', active: true }
    ]
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
            description: 'Базовая хлопковая футболка премиум качества. Идеально подходит для повседневной носки. 100% органический хлопок.',
            price: 1990,
            oldPrice: null,
            category: 'футболки',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            colors: ['белый', 'чёрный', 'серый'],
            stock: 50,
            rating: 4.8,
            reviewCount: 124,
            badge: 'bestseller',
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Джинсы Slim Fit',
            description: 'Стильные джинсы зауженного кроя из качественного денима. Идеальная посадка и комфорт.',
            price: 3990,
            oldPrice: 4990,
            category: 'джинсы',
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
            sizes: ['28', '30', '32', '34', '36'],
            colors: ['синий', 'чёрный', 'голубой'],
            stock: 35,
            rating: 4.6,
            reviewCount: 89,
            badge: 'sale',
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Худи с капюшоном Oversize',
            description: 'Тёплое худи оверсайз из мягкого флиса. Комфорт на каждый день. Флис 320 г/м².',
            price: 3990,
            oldPrice: null,
            category: 'худи',
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['чёрный', 'серый', 'бежевый', 'хаки'],
            stock: 40,
            rating: 4.9,
            reviewCount: 256,
            badge: 'bestseller',
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Платье миди элегантное',
            description: 'Элегантное платье длины миди. Подходит для офиса и особых случаев. Эластичная ткань.',
            price: 4490,
            oldPrice: 5990,
            category: 'платья',
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
            sizes: ['XS', 'S', 'M', 'L'],
            colors: ['чёрный', 'бордовый', 'синий'],
            stock: 25,
            rating: 4.7,
            reviewCount: 67,
            badge: 'sale',
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Кожаная куртка Classic',
            description: 'Классическая куртка из натуральной кожи. Стиль, проверенный временем. Подкладка из шёлка.',
            price: 14990,
            oldPrice: null,
            category: 'куртки',
            image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['чёрный', 'коричневый'],
            stock: 15,
            rating: 4.9,
            reviewCount: 43,
            badge: 'premium',
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Спортивные брюки Comfort',
            description: 'Удобные спортивные брюки с эластичным поясом. Идеально для тренировок и отдыха.',
            price: 2990,
            oldPrice: null,
            category: 'брюки',
            image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['чёрный', 'серый', 'синий'],
            stock: 45,
            rating: 4.5,
            reviewCount: 98,
            badge: null,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Рубашка в клетку Casual',
            description: 'Классическая рубашка в клетку из мягкого хлопка. Универсальный стиль на каждый день.',
            price: 2490,
            oldPrice: null,
            category: 'рубашки',
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['красный', 'синий', 'зелёный'],
            stock: 30,
            rating: 4.4,
            reviewCount: 56,
            badge: null,
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Свитер крупной вязки Premium',
            description: 'Тёплый свитер из мериносовой шерсти. Уютно и стильно. Ручная работа.',
            price: 4490,
            oldPrice: null,
            category: 'свитера',
            image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['белый', 'бежевый', 'серый', 'розовый'],
            stock: 20,
            rating: 4.8,
            reviewCount: 34,
            badge: 'new',
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Пуховик зимний Warm',
            description: 'Тёплый пуховик для холодной зимы. Натуральный пух, водоотталкивающая ткань.',
            price: 12990,
            oldPrice: 15990,
            category: 'куртки',
            image: 'https://images.unsplash.com/photo-1544923246-77307dd628b0?w=400',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['чёрный', 'синий', 'бежевый'],
            stock: 18,
            rating: 4.7,
            reviewCount: 78,
            badge: 'sale',
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Кроссовки Urban Style',
            description: 'Стильные городские кроссовки. Удобная подошва, дышащий материал.',
            price: 5990,
            oldPrice: null,
            category: 'обувь',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
            sizes: ['38', '39', '40', '41', '42', '43', '44'],
            colors: ['белый', 'чёрный', 'красный'],
            stock: 60,
            rating: 4.6,
            reviewCount: 145,
            badge: 'new',
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Шарф кашемировый',
            description: 'Мягкий шарф из 100% кашемира. Тепло и элегантность в каждой детали.',
            price: 3490,
            oldPrice: null,
            category: 'аксессуары',
            image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400',
            sizes: ['one size'],
            colors: ['серый', 'бежевый', 'бордовый', 'синий'],
            stock: 35,
            rating: 4.9,
            reviewCount: 28,
            badge: 'premium',
            created_at: new Date().toISOString()
        },
        {
            id: uuidv4(),
            name: 'Сумка кожаная Tote',
            description: 'Вместительная сумка из натуральной кожи. Классический дизайн на каждый день.',
            price: 7990,
            oldPrice: 9990,
            category: 'аксессуары',
            image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
            sizes: ['one size'],
            colors: ['чёрный', 'коричневый', 'бежевый'],
            stock: 22,
            rating: 4.8,
            reviewCount: 62,
            badge: 'sale',
            created_at: new Date().toISOString()
        }
    ];
    
    db.products = products;
    saveDb();
    console.log(`📦 Добавлено ${products.length} товаров`);
}

module.exports = { getDb, saveDb, initDatabase };
