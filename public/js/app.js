// ============================================
// FASHION STORE - Enhanced JavaScript
// ============================================

const API_URL = '/api';

// Session ID for cart
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('sessionId', sessionId);
}

// Auth token
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// State
let products = [];
let wishlist = [];
let cart = { items: [], total: 0 };
let selectedProduct = null;
let selectedSize = null;
let selectedColor = null;
let quantity = 1;
let appliedPromocode = null;
let discount = 0;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCategories();
    loadCart();
    loadWishlist();
    checkAuth();
    setupEventListeners();
    setupScrollEffects();
});

function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchProducts();
    });
    document.getElementById('searchBtn').addEventListener('click', searchProducts);
    
    // Filters
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('sortFilter').addEventListener('change', filterProducts);
    
    // Cart
    document.getElementById('cartBtn').addEventListener('click', () => openModal('cartModal'));
    
    // Wishlist
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            renderWishlist();
            openModal('wishlistModal');
        });
    }
    
    // Auth - open profile if logged in, otherwise auth modal
    document.getElementById('authBtn').addEventListener('click', () => {
        if (currentUser) {
            openProfile();
        } else {
            openModal('authModal');
        }
    });
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Checkout
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal.id);
        });
    });
}

function setupScrollEffects() {
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// PRODUCTS
// ============================================

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        products = await response.json();
        renderProducts(products);
        renderBestsellers();
        renderNewArrivals();
        renderSaleItems();
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Ошибка загрузки товаров', 'error');
    }
}

function renderBestsellers() {
    const bestsellers = products.filter(p => p.badge === 'bestseller').slice(0, 4);
    const grid = document.getElementById('bestsellersGrid');
    if (grid) grid.innerHTML = bestsellers.map(p => renderProductCard(p)).join('');
}

function renderNewArrivals() {
    const newItems = products.filter(p => p.badge === 'new').slice(0, 4);
    const grid = document.getElementById('newArrivalsGrid');
    if (grid) grid.innerHTML = newItems.map(p => renderProductCard(p)).join('');
}

function renderSaleItems() {
    const saleItems = products.filter(p => p.badge === 'sale' || p.oldPrice).slice(0, 4);
    const grid = document.getElementById('saleGrid');
    if (grid) grid.innerHTML = saleItems.map(p => renderProductCard(p)).join('');
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/products/meta/categories`);
        const categories = await response.json();
        
        // SVG icons for categories (modern, minimalist design)
        const categoryIcons = {
            'футболки': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/></svg>`,
            'джинсы': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h5l1 4v12H4V8l0-4z"/><path d="M20 4h-5l-1 4v12h6V8l0-4z"/><path d="M9 4h6v4c0 2-3 2-3 4v8"/></svg>`,
            'худи': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C9 2 7 4 7 4L3 7v5l2 1v8h14v-8l2-1V7l-4-3s-2-2-5-2z"/><circle cx="12" cy="8" r="2"/><path d="M7 4l5 4 5-4"/></svg>`,
            'платья': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2h8l-2 6h2l-4 14-4-14h2l-2-6z"/><path d="M6 8c-2 0-2 4 0 4"/><path d="M18 8c2 0 2 4 0 4"/></svg>`,
            'куртки': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 4l-4-2h-8L4 4l-2 4v12h6v-6h8v6h6V8l-2-4z"/><path d="M8 2l4 3 4-3"/><circle cx="12" cy="14" r="1"/></svg>`,
            'брюки': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2h12v6c0 2-2 2-2 4v10h-4v-8h-0v8H8V12c0-2-2-2-2-4V2z"/><line x1="6" y1="6" x2="18" y2="6"/></svg>`,
            'рубашки': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2L7 6l-4 2v12h18V8l-4-2-2-4H9z"/><path d="M9 2l3 4 3-4"/><line x1="12" y1="6" x2="12" y2="20"/><circle cx="12" cy="10" r="0.5" fill="currentColor"/><circle cx="12" cy="14" r="0.5" fill="currentColor"/></svg>`,
            'свитера': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2h8c0 2 2 2 2 4v4l2 2v8H4v-8l2-2V6c0-2 2-2 2-4z"/><path d="M8 2c0 2 4 4 8 0"/><path d="M4 12h4v8"/><path d="M20 12h-4v8"/></svg>`,
            'обувь': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16v4h16v-4c0-2-4-4-4-8 0-2 1-6-4-6S8 6 8 8c0 4-4 6-4 8z"/><line x1="4" y1="16" x2="20" y2="16"/></svg>`,
            'аксессуары': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="12" y1="10" x2="12" y2="14"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`
        };
        
        const grid = document.getElementById('categoriesGrid');
        grid.innerHTML = categories.map(cat => `
            <div class="category-card" onclick="selectCategory('${cat}')">
                <div class="category-icon">${categoryIcons[cat] || categoryIcons['аксессуары']}</div>
                <h3>${cat}</h3>
            </div>
        `).join('');
        
        // Populate filter dropdown
        const select = document.getElementById('categoryFilter');
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function renderProductCard(product) {
    const isInWishlist = wishlist.some(w => w.id === product.id);
    const discountPercent = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
    
    let badgeHtml = '';
    if (product.badge === 'new') {
        badgeHtml = '<span class="product-badge badge-new">Новинка</span>';
    } else if (product.badge === 'sale' || product.oldPrice) {
        badgeHtml = `<span class="product-badge badge-sale">-${discountPercent}%</span>`;
    } else if (product.badge === 'bestseller') {
        badgeHtml = '<span class="product-badge badge-bestseller">Хит</span>';
    } else if (product.badge === 'premium') {
        badgeHtml = '<span class="product-badge badge-premium">Premium</span>';
    }
    
    const ratingHtml = product.rating ? `
        <div class="product-rating">
            <span class="rating-stars">${'★'.repeat(Math.floor(product.rating))}</span>
            <span class="rating-count">(${product.reviewCount || 0})</span>
        </div>
    ` : '';
    
    return `
        <div class="product-card" onclick="openProduct('${product.id}')">
            ${badgeHtml}
            <div class="product-actions" onclick="event.stopPropagation()">
                <button class="product-action-btn ${isInWishlist ? 'wishlist-active' : ''}" 
                        onclick="toggleWishlist('${product.id}')" title="В избранное">
                    ${isInWishlist ? '❤️' : '🤍'}
                </button>
                <button class="product-action-btn" onclick="quickAddToCart('${product.id}')" title="В корзину">🛒</button>
            </div>
            <img class="product-image" src="${product.image}" alt="${product.name}" 
                 onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                ${ratingHtml}
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    ${formatPrice(product.price)} ₽
                    ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)} ₽</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

function renderProducts(productsToRender) {
    const grid = document.getElementById('productsGrid');
    
    if (productsToRender.length === 0) {
        grid.innerHTML = `
            <div class="cart-empty" style="grid-column: 1/-1;">
                <div class="cart-empty-icon">🔍</div>
                <p>Товары не найдены</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = productsToRender.map(p => renderProductCard(p)).join('');
}

function selectCategory(category) {
    document.getElementById('categoryFilter').value = category;
    filterProducts();
    document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}

async function filterProducts() {
    const category = document.getElementById('categoryFilter').value;
    const sort = document.getElementById('sortFilter').value;
    
    try {
        let url = `${API_URL}/products?`;
        if (category && category !== 'все') url += `category=${encodeURIComponent(category)}&`;
        if (sort) url += `sort=${sort}`;
        
        const response = await fetch(url);
        const filtered = await response.json();
        renderProducts(filtered);
    } catch (error) {
        console.error('Error filtering products:', error);
    }
}

async function searchProducts() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        loadProducts();
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/products?search=${encodeURIComponent(query)}`);
        const results = await response.json();
        renderProducts(results);
    } catch (error) {
        console.error('Error searching products:', error);
    }
}

function openProduct(productId) {
    selectedProduct = products.find(p => p.id === productId);
    if (!selectedProduct) return;
    
    selectedSize = null;
    selectedColor = null;
    quantity = 1;
    
    const detail = document.getElementById('productDetail');
    detail.innerHTML = `
        <img class="product-detail-image" src="${selectedProduct.image}" alt="${selectedProduct.name}"
             onerror="this.src='https://via.placeholder.com/600x400?text=No+Image'">
        <div class="product-detail-info">
            <div class="product-category">${selectedProduct.category}</div>
            <h2>${selectedProduct.name}</h2>
            <div class="product-detail-price">${formatPrice(selectedProduct.price)} ₽</div>
            <p class="product-detail-description">${selectedProduct.description}</p>
            
            ${selectedProduct.sizes.length > 0 ? `
                <div class="option-group">
                    <label>Размер:</label>
                    <div class="option-buttons">
                        ${selectedProduct.sizes.map(size => `
                            <button class="option-btn" onclick="selectSize('${size}', this)">${size}</button>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${selectedProduct.colors.length > 0 ? `
                <div class="option-group">
                    <label>Цвет:</label>
                    <div class="option-buttons">
                        ${selectedProduct.colors.map(color => `
                            <button class="option-btn" onclick="selectColor('${color}', this)">${color}</button>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="option-group">
                <label>Количество:</label>
                <div class="quantity-selector">
                    <button class="quantity-btn" onclick="changeQuantity(-1)">−</button>
                    <span class="quantity-value" id="quantityValue">1</span>
                    <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
                </div>
            </div>
            
            <button class="btn btn-primary btn-block" onclick="addToCart()">
                🛒 Добавить в корзину
            </button>
        </div>
    `;
    
    openModal('productModal');
}

function selectSize(size, btn) {
    selectedSize = size;
    btn.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function selectColor(color, btn) {
    selectedColor = color;
    btn.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function changeQuantity(delta) {
    quantity = Math.max(1, quantity + delta);
    document.getElementById('quantityValue').textContent = quantity;
}

// ============================================
// CART
// ============================================

async function loadCart() {
    try {
        const response = await fetch(`${API_URL}/cart/${sessionId}`);
        cart = await response.json();
        updateCartCount();
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function updateCartCount() {
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

async function addToCart() {
    if (!selectedProduct) return;
    
    if (selectedProduct.sizes.length > 0 && !selectedSize) {
        showToast('Выберите размер', 'error');
        return;
    }
    
    if (selectedProduct.colors.length > 0 && !selectedColor) {
        showToast('Выберите цвет', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId,
                productId: selectedProduct.id,
                size: selectedSize,
                color: selectedColor,
                quantity
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Товар добавлен в корзину', 'success');
            closeModal('productModal');
            loadCart();
        } else {
            showToast(result.error || 'Ошибка', 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Ошибка при добавлении в корзину', 'error');
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const promocodeSection = document.querySelector('.promocode-section');
    
    if (cart.items.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Корзина пуста</p>
            </div>
        `;
        document.getElementById('checkoutBtn').style.display = 'none';
        if (promocodeSection) promocodeSection.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.items.map(item => `
            <div class="cart-item">
                <img class="cart-item-image" src="${item.image}" alt="${item.name}"
                     onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-details">
                        ${item.size ? `Размер: ${item.size}` : ''} 
                        ${item.color ? `/ Цвет: ${item.color}` : ''}
                    </div>
                    <div class="cart-item-price">${formatPrice(item.price * item.quantity)} ₽</div>
                </div>
                <div class="cart-item-actions">
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">✕</button>
                    <div class="quantity-selector" style="margin: 0;">
                        <button class="quantity-btn" onclick="updateCartItem('${item.id}', ${item.quantity - 1})">−</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartItem('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
            </div>
        `).join('');
        document.getElementById('checkoutBtn').style.display = 'block';
        if (promocodeSection) promocodeSection.style.display = 'block';
    }
    
    updateCartTotals();
}

async function updateCartItem(itemId, quantity) {
    try {
        await fetch(`${API_URL}/cart/update/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });
        await loadCart();
        renderCart();
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

async function removeFromCart(itemId) {
    try {
        await fetch(`${API_URL}/cart/remove/${itemId}`, { method: 'DELETE' });
        await loadCart();
        renderCart();
        showToast('Товар удалён из корзины', 'success');
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

async function quickAddToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    try {
        const response = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId,
                productId,
                size: product.sizes?.[0] || null,
                color: product.colors?.[0] || null,
                quantity: 1
            })
        });
        
        if ((await response.json()).success) {
            showToast('Товар добавлен в корзину', 'success');
            loadCart();
        }
    } catch (error) {
        console.error('Error quick add:', error);
    }
}

// ============================================
// WISHLIST
// ============================================

async function loadWishlist() {
    try {
        const response = await fetch(`${API_URL}/wishlist/${sessionId}`);
        wishlist = await response.json();
        updateWishlistCount();
    } catch (error) {
        wishlist = [];
    }
}

function updateWishlistCount() {
    const el = document.getElementById('wishlistCount');
    if (el) el.textContent = wishlist.length;
}

async function toggleWishlist(productId) {
    const isInWishlist = wishlist.some(w => w.id === productId);
    
    try {
        if (isInWishlist) {
            await fetch(`${API_URL}/wishlist/remove/${sessionId}/${productId}`, { method: 'DELETE' });
            showToast('Удалено из избранного', 'success');
        } else {
            await fetch(`${API_URL}/wishlist/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, productId })
            });
            showToast('Добавлено в избранное', 'success');
        }
        await loadWishlist();
        renderProducts(products);
        renderBestsellers();
        renderNewArrivals();
        renderSaleItems();
    } catch (error) {
        showToast('Ошибка', 'error');
    }
}

function renderWishlist() {
    const container = document.getElementById('wishlistItems');
    if (!container) return;
    
    if (wishlist.length === 0) {
        container.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">❤️</div><p>Избранное пусто</p></div>`;
        return;
    }
    
    container.innerHTML = wishlist.map(item => `
        <div class="wishlist-item">
            <img class="wishlist-item-image" src="${item.image}" alt="${item.name}">
            <div class="wishlist-item-info">
                <div class="wishlist-item-name">${item.name}</div>
                <div class="wishlist-item-price">${formatPrice(item.price)} ₽</div>
            </div>
            <div class="wishlist-item-actions">
                <button class="btn btn-small btn-primary" onclick="quickAddToCart('${item.id}'); closeModal('wishlistModal');">🛒</button>
                <button class="btn btn-small btn-secondary" onclick="toggleWishlist('${item.id}'); renderWishlist();">✕</button>
            </div>
        </div>
    `).join('');
}

// ============================================
// PROMOCODES
// ============================================

async function applyPromocode() {
    const code = document.getElementById('promocodeInput').value.trim();
    const resultDiv = document.getElementById('promocodeResult');
    
    if (!code) {
        resultDiv.className = 'error';
        resultDiv.textContent = 'Введите промокод';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/promocodes/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, cartTotal: cart.total })
        });
        
        const result = await response.json();
        
        if (result.success) {
            appliedPromocode = result.code;
            discount = result.discount;
            resultDiv.className = 'success';
            resultDiv.textContent = result.message;
            updateCartTotals();
        } else {
            resultDiv.className = 'error';
            resultDiv.textContent = result.error;
        }
    } catch (error) {
        resultDiv.className = 'error';
        resultDiv.textContent = 'Ошибка проверки';
    }
}

function updateCartTotals() {
    const subtotal = cart.total;
    const total = subtotal - discount;
    
    const subtotalEl = document.getElementById('subtotalAmount');
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal) + ' ₽';
    document.getElementById('totalAmount').textContent = formatPrice(total);
    
    const discountRow = document.getElementById('discountRow');
    if (discountRow) {
        if (discount > 0) {
            discountRow.style.display = 'flex';
            document.getElementById('discountAmount').textContent = '-' + formatPrice(discount) + ' ₽';
        } else {
            discountRow.style.display = 'none';
        }
    }
}

function subscribeNewsletter(e) {
    e.preventDefault();
    showToast('Спасибо за подписку!', 'success');
    e.target.reset();
}

// ============================================
// CHECKOUT
// ============================================

function showCheckout() {
    if (cart.items.length === 0) return;
    
    document.getElementById('checkoutItemsCount').textContent = cart.items.length;
    document.getElementById('checkoutTotal').textContent = formatPrice(cart.total);
    
    closeModal('cartModal');
    openModal('checkoutModal');
}

async function handleCheckout(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        sessionId,
        customerName: formData.get('customerName'),
        customerEmail: formData.get('customerEmail'),
        customerPhone: formData.get('customerPhone'),
        deliveryAddress: formData.get('deliveryAddress')
    };
    
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeModal('checkoutModal');
            document.getElementById('orderNumber').textContent = result.orderId.slice(0, 8).toUpperCase();
            openModal('successModal');
            e.target.reset();
            await loadCart();
        } else {
            showToast(result.error || 'Ошибка оформления заказа', 'error');
        }
    } catch (error) {
        console.error('Error checkout:', error);
        showToast('Ошибка при оформлении заказа', 'error');
    }
}

// ============================================
// AUTH
// ============================================

function checkAuth() {
    // Try to restore user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateAuthUI();
        } catch (e) {
            localStorage.removeItem('currentUser');
        }
    }
    
    if (authToken) {
        fetchCurrentUser();
    }
}

function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    if (currentUser) {
        authBtn.innerHTML = `👤 ${currentUser.name}`;
    } else {
        authBtn.innerHTML = '👤 Войти';
    }
}

async function fetchCurrentUser() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            updateAuthUI();
        } else {
            logout();
        }
    } catch (error) {
        logout();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            authToken = result.token;
            localStorage.setItem('authToken', authToken);
            currentUser = result.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateAuthUI();
            closeModal('authModal');
            showToast('Добро пожаловать!', 'success');
            e.target.reset();
        } else {
            showToast(result.error || 'Ошибка входа', 'error');
        }
    } catch (error) {
        showToast('Ошибка при входе', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            authToken = result.token;
            localStorage.setItem('authToken', authToken);
            currentUser = result.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateAuthUI();
            closeModal('authModal');
            showToast('Регистрация успешна!', 'success');
            e.target.reset();
        } else {
            showToast(result.error || 'Ошибка регистрации', 'error');
        }
    } catch (error) {
        showToast('Ошибка при регистрации', 'error');
    }
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.auth-tab[onclick="switchAuthTab('${tab}')"]`).classList.add('active');
    
    if (tab === 'login') {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    } else {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    }
}

// ============================================
// PROFILE
// ============================================

function openProfile() {
    if (!currentUser) {
        openModal('authModal');
        return;
    }
    
    // Update profile info
    document.getElementById('profileName').textContent = currentUser.name || 'Мой профиль';
    document.getElementById('profileEmail').textContent = currentUser.email || '';
    
    // Load user data
    loadUserOrders();
    loadProfileWishlist();
    loadUserSettings();
    
    openModal('profileModal');
}

function switchProfileTab(tab, evt) {
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    if (evt && evt.target) {
        evt.target.classList.add('active');
    }
    
    document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
    
    if (tab === 'orders') {
        document.getElementById('profileOrders').classList.add('active');
    } else if (tab === 'wishlist') {
        document.getElementById('profileWishlist').classList.add('active');
        loadProfileWishlist();
    } else if (tab === 'settings') {
        document.getElementById('profileSettings').classList.add('active');
    }
}

async function loadUserOrders() {
    const container = document.getElementById('ordersList');
    
    try {
        const response = await fetch(`${API_URL}/orders/user/${sessionId}`);
        const orders = await response.json();
        
        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="orders-empty">
                    <div class="empty-icon">📦</div>
                    <p>У вас пока нет заказов</p>
                    <a href="#catalog" class="btn btn-primary" onclick="closeModal('profileModal')">Начать покупки</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = orders.map(order => {
            const statusClass = order.status === 'completed' ? 'completed' : 
                               order.status === 'cancelled' ? 'cancelled' : 'pending';
            const statusText = order.status === 'completed' ? 'Выполнен' :
                              order.status === 'cancelled' ? 'Отменён' : 'В обработке';
            const date = new Date(order.created_at).toLocaleDateString('ru-RU');
            const itemsCount = order.items?.length || 0;
            
            return `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-number">#${order.id.slice(0, 8).toUpperCase()}</span>
                        <span class="order-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="order-items">${itemsCount} товар(ов)</div>
                    <div class="order-footer">
                        <span class="order-date">${date}</span>
                        <span class="order-total">${formatPrice(order.total)} ₽</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = `
            <div class="orders-empty">
                <div class="empty-icon">📦</div>
                <p>У вас пока нет заказов</p>
            </div>
        `;
    }
}

function loadProfileWishlist() {
    const container = document.getElementById('profileWishlistGrid');
    
    if (!wishlist || wishlist.length === 0) {
        container.innerHTML = `
            <div class="orders-empty" style="grid-column: 1/-1;">
                <div class="empty-icon">❤️</div>
                <p>Избранное пусто</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = wishlist.map(item => `
        <div class="profile-wishlist-item" onclick="openProduct('${item.id}'); closeModal('profileModal');">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/140x100?text=No+Image'">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-price">${formatPrice(item.price)} ₽</div>
            </div>
        </div>
    `).join('');
}

function loadUserSettings() {
    if (currentUser) {
        document.getElementById('settingsName').value = currentUser.name || '';
        document.getElementById('settingsEmail').value = currentUser.email || '';
        document.getElementById('settingsPhone').value = currentUser.phone || '';
        document.getElementById('settingsAddress').value = currentUser.address || '';
    }
}

async function saveUserSettings(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address')
    };
    
    // In real app, save to server
    if (currentUser) {
        currentUser.name = data.name;
        currentUser.phone = data.phone;
        currentUser.address = data.address;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    showToast('Настройки сохранены', 'success');
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateAuthUI();
    closeModal('profileModal');
    showToast('Вы вышли из аккаунта', 'success');
}

// ============================================
// MODALS
// ============================================

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (modalId === 'cartModal') {
        renderCart();
    } else if (modalId === 'wishlistModal') {
        renderWishlist();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// UTILITIES
// ============================================

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price);
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Setup profile settings form
document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = document.getElementById('profileSettingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', saveUserSettings);
    }
});
