# 👗 FASHION STORE - Интернет-магазин одежды

Полноценный веб-проект интернет-магазина одежды с front-end и back-end.

## 🚀 Возможности

### Back-end (Node.js + Express)
- ✅ REST API для товаров, корзины, заказов
- ✅ Авторизация пользователей (JWT)
- ✅ JSON файловая база данных
- ✅ Генерация демо-данных

### Front-end (HTML + CSS + JavaScript)
- ✅ Адаптивный дизайн
- ✅ Каталог товаров с фильтрацией
- ✅ Поиск товаров
- ✅ Корзина покупок
- ✅ Оформление заказа
- ✅ Регистрация/вход пользователей
- ✅ Модальные окна

## 📦 Установка

```bash
# Клонировать репозиторий
git clone https://github.com/Yaroslav325/CODEX1.git
cd CODEX1

# Установить зависимости
npm install

# Запустить сервер
npm start
```

## 🌐 Использование

После запуска откройте в браузере:
```
http://localhost:3000
```

## 📁 Структура проекта

```
CODEX1/
├── package.json          # Зависимости проекта
├── server/
│   ├── index.js          # Главный файл сервера
│   ├── routes/
│   │   ├── products.js   # API товаров
│   │   ├── cart.js       # API корзины
│   │   ├── orders.js     # API заказов
│   │   └── auth.js       # API авторизации
│   └── models/
│       └── database.js   # Модели и БД
├── public/
│   ├── index.html        # Главная страница
│   ├── css/
│   │   └── style.css     # Стили
│   └── js/
│       └── app.js        # JavaScript
└── data/                 # SQLite база данных (создаётся автоматически)
```

## 🛠️ API Endpoints

### Товары
- `GET /api/products` - Получить все товары
- `GET /api/products/:id` - Получить товар по ID
- `GET /api/products/meta/categories` - Получить категории

### Корзина
- `GET /api/cart/:sessionId` - Получить корзину
- `POST /api/cart/add` - Добавить товар
- `PUT /api/cart/update/:itemId` - Обновить количество
- `DELETE /api/cart/remove/:itemId` - Удалить товар

### Заказы
- `POST /api/orders` - Создать заказ
- `GET /api/orders/:orderId` - Получить заказ

### Авторизация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

## 💡 Технологии

- **Backend:** Node.js, Express.js
- **Database:** JSON file storage
- **Auth:** JWT, bcrypt
- **Frontend:** HTML5, CSS3, Vanilla JavaScript

## 📄 Лицензия

MIT
