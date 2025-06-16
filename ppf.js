// DOM Elements
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const body = document.body;
const cartBtn = document.querySelector('.cart');
const wishlistBtn = document.querySelector('.wishlist');
const cartSidebar = document.getElementById('cart-sidebar');
const wishlistSidebar = document.getElementById('wishlist-sidebar');
const closeCart = document.getElementById('close-cart');
const closeWishlist = document.getElementById('close-wishlist');
const cartItemsContainer = document.getElementById('cart-items');
const wishlistItemsContainer = document.getElementById('wishlist-items');
const cartCount = document.querySelector('.cart-count');
const wishlistCount = document.querySelector('.wishlist-count');
const cartTotal = document.getElementById('cart-total');
const productGrid = document.getElementById('product-grid');
const sortSelect = document.getElementById('sort');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const accountBtn = document.querySelector('.account');
const loginModal = document.getElementById('login-modal');
const closeModal = document.querySelector('.close-modal');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const colorOptions = document.querySelectorAll('.color-option');
const findStyleBtn = document.getElementById('find-style-btn');
const categoryCards = document.querySelectorAll('.category-card');
const navLinks = document.querySelectorAll('.nav-links li a[data-category]');



// State
let cart = [];
let wishlist = [];
let filteredProducts = [...products];
let selectedColorStyle = null;
const PRODUCTS_PER_PAGE = 50;
let currentPage = 1;
let showAllProducts = false;

// Initialize
function init() {
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    } catch (e) {
        console.error('Error loading cart/wishlist from localStorage:', e);
        cart = [];
        wishlist = [];
    }

    showAllProducts = true;
    filteredProducts = [...products.slice(0, 52)];
    renderProducts(filteredProducts);

    updateCartCount();
    updateWishlistCount();

    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const searchQuery = urlParams.get('search');

    if (category) {
        showAllProducts = false;
        filterProductsByCategory(category);
        document.title = `${category.charAt(0).toUpperCase() + category.slice(1)} | FurnishX`;
    }

    if (searchQuery) {
        searchInput.value = searchQuery;
        showAllProducts = false;
        searchProducts(searchQuery);
    }
}

// Theme Toggle
function setupThemeToggle() {
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);
        themeIcon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        localStorage.setItem('theme', newTheme);
    });

    // Check for saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    themeIcon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Cart and Wishlist Sidebars
function setupSidebars() {
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        renderCartItems();
    });

    wishlistBtn.addEventListener('click', () => {
        wishlistSidebar.classList.add('active');
        renderWishlistItems();
    });

    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
    });

    closeWishlist.addEventListener('click', () => {
        wishlistSidebar.classList.remove('active');
    });

    // Close sidebars when clicking outside
    document.addEventListener('click', (e) => {
        if (!cartSidebar.contains(e.target) && !cartBtn.contains(e.target)) {
            cartSidebar.classList.remove('active');
        }
        if (!wishlistSidebar.contains(e.target) && !wishlistBtn.contains(e.target)) {
            wishlistSidebar.classList.remove('active');
        }
    });
}

// Login Modal 
function setupLoginModal() {
    const loginBtn = document.querySelector('.login-link');
    const loginSidebar = document.getElementById('login-sidebar');
    const closeLogin = document.getElementById('close-login');

    let overlay = document.getElementById('login-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'login-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '9998';
        overlay.style.display = 'none';
        document.body.appendChild(overlay);
    }

    if (!loginBtn || !loginSidebar || !closeLogin) return;

    loginBtn.addEventListener('click', () => {
        loginSidebar.classList.add('popup');
        overlay.style.display = 'block';
    });

    closeLogin.addEventListener('click', () => {
        loginSidebar.classList.remove('popup');
        overlay.style.display = 'none';
    });

    overlay.addEventListener('click', () => {
        loginSidebar.classList.remove('popup');
        overlay.style.display = 'none';
    });
}

// Color Style Finder
function setupColorStyleFinder() {
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            selectedColorStyle = option.getAttribute('data-color');
        });
    });

    findStyleBtn.addEventListener('click', () => {
        if (!selectedColorStyle) {
            alert('Please select a color style first');
            return;
        }
        
        const colorStyles = {
            neutral: ['white', 'beige', 'gray', 'black'],
            warm: ['red', 'orange', 'yellow', 'brown'],
            cool: ['blue', 'green', 'purple'],
            bold: ['red', 'blue', 'yellow', 'pink'],
            earthy: ['brown', 'green', 'beige']
        };
        
        const filtered = products.filter(product => 
            colorStyles[selectedColorStyle].some(color => 
                product.colors && product.colors.includes(color)
            )
        );
        
        renderProducts(filtered);
        window.scrollTo({ top: productGrid.offsetTop - 100, behavior: 'smooth' });
    });
}

// Product Rendering
function renderProducts(productsToRender) {
    if (!productGrid) return;

    productGrid.innerHTML = '';

    let visibleProducts = productsToRender;

    if (!showAllProducts) {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const end = start + PRODUCTS_PER_PAGE;
        visibleProducts = productsToRender.slice(start, end);
    }

    if (!visibleProducts || visibleProducts.length === 0) {
        productGrid.innerHTML = '<p class="no-products">No products found matching your criteria.</p>';
        return;
    }

    visibleProducts.forEach(product => {
        const isInCart = cart.some(item => item.id === product.id);
        const isInWishlist = wishlist.some(item => item.id === product.id);

        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">₹${product.price.toLocaleString('en-IN')}
                    ${product.originalPrice ? `<span>₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                </div>
                <div class="product-rating">
                    ${Array(Math.floor(product.rating)).fill('<i class="fas fa-star"></i>').join('')}
                    ${product.rating % 1 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                    <span>(${product.reviews})</span>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}" ${isInCart ? 'disabled' : ''}>
                        ${isInCart ? 'Added to Cart' : 'Add to Cart'}
                    </button>
                    <button class="add-to-wishlist" data-id="${product.id}" ${isInWishlist ? 'style="color: var(--primary-color); border-color: var(--primary-color);"' : ''}>
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;

        productGrid.appendChild(productCard);
    });

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', addToCart);
    });

    document.querySelectorAll('.add-to-wishlist').forEach(btn => {
        btn.addEventListener('click', addToWishlist);
    });

    if (!showAllProducts) {
        setupPaginationControls(productsToRender);
    } else {
        const existingPagination = document.querySelector('.pagination-controls');
        if (existingPagination) existingPagination.remove();
    }
}

function setupPaginationControls(productList) {
    let existingPagination = document.querySelector('.pagination-controls');
    if (existingPagination) existingPagination.remove();

    const totalPages = Math.ceil(productList.length / PRODUCTS_PER_PAGE);
    if (totalPages <= 1) return;

    const pagination = document.createElement('div');
    pagination.className = 'pagination-controls';
    pagination.innerHTML = `
        <button id="prev-page-btn" ${currentPage === 1 ? 'disabled' : ''}>&laquo; Prev</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button id="next-page-btn" ${currentPage === totalPages ? 'disabled' : ''}>Next &raquo;</button>
    `;
    productGrid.insertAdjacentElement('afterend', pagination);

    document.getElementById('prev-page-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderProducts(filteredProducts);
        }
    });

    document.getElementById('next-page-btn').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts(filteredProducts);
        }
    });
}

// Cart Functions
function addToCart(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    if (!cart.some(item => item.id === productId)) {
        cart.push({ ...product, quantity: 1 });
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving to cart:', error);
        }
        updateCartCount();
        e.target.textContent = 'Added to Cart';
        e.target.disabled = true;
        
        showNotification(`${product.name} added to cart`);
    }
    
    renderCartItems();
}

function removeFromCart(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    cart = cart.filter(item => item.id !== productId);
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
    updateCartCount();
    renderCartItems();
    renderProducts(filteredProducts);
    
    const product = products.find(p => p.id === productId);
    if (product) {
        showNotification(`${product.name} removed from cart`);
    }
}

function renderCartItems() {
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (cartTotal) cartTotal.textContent = '₹0';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * (item.quantity || 1);
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4 class="cart-item-title">${item.name}</h4>
                <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                    <span>${item.quantity || 1}</span>
                    <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    if (cartTotal) cartTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', removeFromCart);
    });
    
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', updateQuantity);
    });
}

function updateQuantity(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const action = e.target.getAttribute('data-action');
    
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;
    
    if (action === 'increase') {
        cart[itemIndex].quantity = (cart[itemIndex].quantity || 1) + 1;
    } else if (action === 'decrease' && (cart[itemIndex].quantity || 1) > 1) {
        cart[itemIndex].quantity = (cart[itemIndex].quantity || 1) - 1;
    }
    
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
    renderCartItems();
    updateCartCount();
}

function updateCartCount() {
    if (!cartCount) return;
    const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    cartCount.textContent = count;
}

// Wishlist Functions
function addToWishlist(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    if (!wishlist.some(item => item.id === productId)) {
        wishlist.push(product);
        try {
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        } catch (error) {
            console.error('Error saving to wishlist:', error);
        }
        updateWishlistCount();
        e.target.innerHTML = '<i class="fas fa-heart" style="color: var(--primary-color);"></i>';
        e.target.style.color = 'var(--primary-color)';
        e.target.style.borderColor = 'var(--primary-color)';
        
        showNotification(`${product.name} added to wishlist`);
    } else {
        wishlist = wishlist.filter(item => item.id !== productId);
        try {
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
        updateWishlistCount();
        e.target.innerHTML = '<i class="fas fa-heart"></i>';
        e.target.style.color = '';
        e.target.style.borderColor = '';
        
        showNotification(`${product.name} removed from wishlist`);
    }
    
    renderWishlistItems();
}

function removeFromWishlist(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    wishlist = wishlist.filter(item => item.id !== productId);
    try {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (error) {
        console.error('Error removing from wishlist:', error);
    }
    updateWishlistCount();
    renderWishlistItems();
    renderProducts(filteredProducts);
    
    const product = products.find(p => p.id === productId);
    if (product) {
        showNotification(`${product.name} removed from wishlist`);
    }
}

function renderWishlistItems() {
    if (!wishlistItemsContainer) return;
    
    wishlistItemsContainer.innerHTML = '';
    
    if (wishlist.length === 0) {
        wishlistItemsContainer.innerHTML = '<p class="empty-wishlist">Your wishlist is empty</p>';
        return;
    }
    
    wishlist.forEach(item => {
        const wishlistItem = document.createElement('div');
        wishlistItem.className = 'wishlist-item';
        wishlistItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="wishlist-item-info">
                <h4 class="wishlist-item-title">${item.name}</h4>
                <div class="wishlist-item-price">₹${item.price.toLocaleString('en-IN')}</div>
                <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
        `;
        
        wishlistItemsContainer.appendChild(wishlistItem);
    });
    
    document.querySelectorAll('.wishlist-item .remove-item').forEach(btn => {
        btn.addEventListener('click', removeFromWishlist);
    });
}

function updateWishlistCount() {
    if (!wishlistCount) return;
    wishlistCount.textContent = wishlist.length;
}

// Sorting
function setupSorting() {
    if (!sortSelect) return;

    sortSelect.addEventListener('change', () => {
        const value = sortSelect.value;
        let sortedProducts = [...filteredProducts];

        switch (value) {
            case 'price-low':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                sortedProducts.sort((a, b) => b.rating - a.rating);
                break;
            default:
                break;
        }

        renderProducts(sortedProducts);
    });

    if (sortSelect.value) {
        sortSelect.dispatchEvent(new Event('change'));
    }
}

// Search
function setupSearch() {
    if (!searchBtn || !searchInput) return;

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        console.log("Search triggered for:", searchInput.value);
        if (query) {
            console.log("Calling searchProducts with query:", query);
            searchProducts(query);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                console.log("Enter pressed, calling searchProducts with query:", query);
                searchProducts(query);
            }
        }
    });

    // Live search filtering as the user types
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            searchProducts(query);
        } else {
            renderProducts(products.slice(0, 50)); 
        }
    });
}

function searchProducts(query) {
    const lowerCaseQuery = query.toLowerCase();
    const productCategories = [...new Set(products.map(p => p.category.toLowerCase()))];

    if (productCategories.includes(lowerCaseQuery)) {
        window.location.href = `products.html?category=${lowerCaseQuery}`;
    } else {
        const messageEl = document.getElementById("search-message");
        if (messageEl) {
            messageEl.textContent = "No matching category found. Please try a different keyword.";
        } else {
            alert("No matching category found. Please try a different keyword.");
        }
    }
}

// Category Filtering
function setupCategoryFiltering() {
    categoryCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const category = card.getAttribute('data-category');
            window.location.href = `products.html?category=${category}`;
        });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            window.location.href = `products.html?category=${category}`;
        });
    });
}

function filterProductsByCategory(category) {
    const filtered = products.filter(product =>
        product.category.toLowerCase() === category.toLowerCase()
    );
    filteredProducts = filtered;
    renderProducts(filtered);
}

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Setup all event listeners
function setupEventListeners() {
    setupThemeToggle();
    setupSidebars();
    setupLoginModal();
    setupColorStyleFinder();
    setupSorting();
    setupSearch();
    setupCategoryFiltering();
    setupPriceFilter();
    // Home button event listener
    const homeLink = document.getElementById("home-link");
    if (homeLink) {
        homeLink.addEventListener("click", (e) => {
            e.preventDefault();
            showAllProducts = true;
            currentPage = 1;
            filteredProducts = [...products];
            renderProducts(filteredProducts);
        });
    }
}

// Live Price Filter Setup
function setupPriceFilter() {
    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-slider-val');
    const resetBtn = document.getElementById('reset-price-filter');

    if (!priceSlider || !priceValue || !resetBtn) return;

    priceSlider.addEventListener('input', () => {
        const max = parseInt(priceSlider.value);
        priceValue.textContent = max;
        filteredProducts = products.filter(p => p.price <= max);
        currentPage = 1;
        renderProducts(filteredProducts);
    });

    resetBtn.addEventListener('click', () => {
        priceSlider.value = 100000;
        priceValue.textContent = 100000;
        filteredProducts = [...products];
        currentPage = 1;
        renderProducts(filteredProducts);
    });

    priceValue.textContent = priceSlider.value;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    init();
    
    const logoContainer = document.querySelector('.logo');
    if (logoContainer && !logoContainer.querySelector('img')) {
        logoContainer.innerHTML = `<img src="logo.svg" alt="FurnishX Logo">`;
    }
});
