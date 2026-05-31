// Toggle search panel
function toggleSearchPanel() {
    const searchDropdown = document.getElementById('search-dropdown');
    if (searchDropdown) {
        searchDropdown.classList.toggle('active');
        if (searchDropdown.classList.contains('active')) {
            document.getElementById('search-input')?.focus();
        }
    }
}

let heroSlideIndex = 0;

function setHeroSlide(index) {
    const slides = document.querySelectorAll('.hero .slide');
    if (!slides.length) return;
    heroSlideIndex = ((index % slides.length) + slides.length) % slides.length;
    slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === heroSlideIndex);
    });
}

function scrollHeroSlides(direction) {
    if (direction === 'left') {
        setHeroSlide(heroSlideIndex - 1);
    } else {
        setHeroSlide(heroSlideIndex + 1);
    }
}

// Attach search input listener
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', searchMeals);
    }

    // Set active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    const heroSlides = document.querySelectorAll('.hero .slide');
    if (heroSlides.length) {
        setHeroSlide(0);
        setInterval(() => scrollHeroSlides('right'), 7000);
    }
});

// Search meals functionality
function searchMeals(event) {
    const query = event.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');

    if (!resultsContainer) return;

    if (!query) {
        resultsContainer.innerHTML = '';
        return;
    }

    let results = [];

    // Search through all menu items
    for (const [category, items] of Object.entries(menuData)) {
        items.forEach(item => {
            if ((item.mealName || item.name || '').toLowerCase().includes(query)) {
                results.push({
                    ...item,
                    category: category
                });
            }
        });
    }

    // Display results
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div style="padding: 8px; color: #999; text-align: center; font-size: 0.9rem;">No meals found</div>';
    } else {
        resultsContainer.innerHTML = results.map(item => `
            <div class="search-result-item" onclick="window.location.href='takeout.html'">
                <div class="search-result-name">${item.mealName || item.name} <span style="font-weight: 400; color: #666; font-size: 0.85rem;">- ${item.category}</span></div>
                <div class="search-result-status ${item.available ? 'search-result-available' : 'search-result-unavailable'}" style="font-size: 0.8rem;">
                    ${item.available ? '✓ Available' : '✗ Out of Stock'}
                </div>
                <div style="font-weight: 600; color: var(--gold-accent); margin-top: 2px; font-size: 0.85rem;">${item.price}</div>
            </div>
        `).join('');
    }
}

// Close search dropdown when clicking outside
document.addEventListener('click', (event) => {
    const searchBtn = document.querySelector('.search-btn');
    const searchDropdown = document.getElementById('search-dropdown');
    if (searchDropdown && searchBtn &&
        !searchDropdown.contains(event.target) &&
        !searchBtn.contains(event.target)) {
        searchDropdown.classList.remove('active');
    }
});

// Order Notification System
const orderNotificationSystem = {
    notifications: JSON.parse(localStorage.getItem('orderNotifications')) || [],

    addOrderNotification(mealNames, totalPrice) {
        const notification = {
            id: Date.now(),
            title: '🛒 New Order Placed',
            message: `${Array.isArray(mealNames) ? mealNames.join(', ') : mealNames} - ${totalPrice}`,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'order'
        };
        this.notifications.unshift(notification);
        localStorage.setItem('orderNotifications', JSON.stringify(this.notifications));
        this.updateNotificationUI();
        return notification;
    },

    updateNotificationUI() {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;

        notificationList.innerHTML = '';

        if (this.notifications.length === 0) {
            const emptyDiv = document.getElementById('empty-notifications');
            if (emptyDiv) emptyDiv.style.display = 'block';
            return;
        }

        const emptyDiv = document.getElementById('empty-notifications');
        if (emptyDiv) emptyDiv.style.display = 'none';

        this.notifications.forEach(notif => {
            const li = document.createElement('li');
            li.className = `notification-item ${!notif.read ? 'unread' : ''}`;
            const date = new Date(notif.timestamp);
            const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

            li.innerHTML = `
                <div style="cursor: pointer; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;" onclick="orderNotificationSystem.showNotificationDetail(${notif.id})">
                    <div style="flex: 1;">
                        <strong>${notif.title}</strong>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9rem;">${notif.message}</p>
                        <div class="notification-item-time">${timeStr}</div>
                    </div>
                    <div style="padding-top: 2px;">
                        <i class="fas fa-chevron-right" style="color: #999; font-size: 0.8rem;"></i>
                    </div>
                </div>
            `;
            notificationList.appendChild(li);
        });
    },

    markAsRead(id) {
        const notif = this.notifications.find(n => n.id === id);
        if (notif) {
            notif.read = true;
            localStorage.setItem('orderNotifications', JSON.stringify(this.notifications));
            this.updateNotificationUI();
        }
    },

    deleteNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        localStorage.setItem('orderNotifications', JSON.stringify(this.notifications));
        this.updateNotificationUI();
        closeNotificationDetail();
    },

    showNotificationDetail(id) {
        const notif = this.notifications.find(n => n.id === id);
        if (notif) {
            let detail = document.getElementById('notification-detail');
            if (!detail) {
                detail = document.createElement('div');
                detail.id = 'notification-detail';
                detail.className = 'notification-detail-modal';
                document.body.appendChild(detail);
            }
            const date = new Date(notif.timestamp);
            const dateStr = date.toLocaleString();
            detail.innerHTML = `
                <div class="notification-detail-content">
                    <button class="notification-detail-close" onclick="closeNotificationDetail()">×</button>
                    <h2>${notif.title}</h2>
                    <div class="notification-detail-body">
                        <p><strong>Message:</strong></p>
                        <p style="background-color: #f5f5f5; padding: 12px; border-radius: 8px; border-left: 4px solid var(--primary-color);">${notif.message}</p>
                        <p><strong>Date & Time:</strong></p>
                        <p>${dateStr}</p>
                        <p><strong>Status:</strong> <span style="color: ${notif.read ? '#666' : 'var(--primary-color)'}; font-weight: 600;">${notif.read ? 'Read' : 'Unread'}</span></p>
                    </div>
                    <div class="notification-detail-actions">
                        <button class="notification-detail-btn delete-btn" onclick="orderNotificationSystem.deleteNotification(${notif.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <button class="notification-detail-btn close-btn" onclick="closeNotificationDetail()">Close</button>
                    </div>
                </div>
            `;
            detail.classList.add('active');
            this.markAsRead(id);
        }
    }
};

// Toggle notification panel
function toggleNotificationPanel() {
    const notificationPanel = document.getElementById('notification-panel');
    if (notificationPanel) {
        notificationPanel.classList.toggle('active');
        orderNotificationSystem.updateNotificationUI();
    }
}

function closeNotificationDetail() {
    const detail = document.getElementById('notification-detail');
    if (detail) {
        detail.classList.remove('active');
        setTimeout(() => {
            detail.innerHTML = '';
        }, 300);
    }
}

const notificationBtn = document.getElementById('notification-btn');
const notificationPanel = document.getElementById('notification-panel');

if (notificationBtn && notificationPanel) {
    notificationBtn.addEventListener('click', () => {
        toggleNotificationPanel();
    });
}

document.addEventListener('click', (event) => {
    if (notificationPanel && notificationPanel.classList.contains('active') &&
    !notificationPanel.contains(event.target) &&
    !notificationBtn.contains(event.target)) {
        notificationPanel.classList.remove('active');
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && notificationPanel && notificationPanel.classList.contains('active')) {
        notificationPanel.classList.remove('active');
    }
});

const menuData = {
    "Main Meals" : [
        {mealName: "Jollof Rice", price: "₦1,500", available: true,  image: 'images/jollof rice.png' },
        {mealName: "Fried Rice", price: "₦1,500", available: true, image: 'images/fried rice 1.png' },
        {mealName: "White Rice", price: "₦1,000", available: true, image: 'images/white rice.png' },
        {mealName: "White Rice and Egg Sauce", price: "₦1,500", available: true, image: 'images/white rice and egg sauce.png' },
        {mealName: "White Rice and Veggie Sauce", price: "₦1,500", available: true, image: 'images/white rice and veggie sauce.png' },
        {mealName: "Stir Fry Spaghetti", price: "₦1,500", available: true, image: 'images/stir fry spaghetti.png' },
    ],
    "Soups" : [
        {mealName: "Egusi Soup", price: "₦1,000", available: true, image: 'images/egusi soup.png' },
        {mealName: "Ogbono Soup", price: "₦1,000", available: true, image: 'images/ogbono soup.png' },
        {mealName: "Vegetable Soup", price: "₦1,500", available: true, image: 'images/vegetable soup.png' },
        {mealName: "Oha Soup", price: "₦1,000", available: true, image: 'images/oha soup.png' },
    ],
    "Swallows" : [
        {mealName: "Eba", price: "₦500", available: true, image: 'images/eba.png' },
        {mealName: "Fufu", price: "₦500", available: true, image: 'images/fufu.png' },
        {mealName: "Pounded yam", price: "₦700", available: true, image: 'images/pounded yam.png' },
        {mealName: "Semo", price: "₦600", available: true, image: 'images/semo.png' },
        {mealName: "Amala", price: "₦600", available: true, image: 'images/amala.png' },
    ],
    "Proteins": [
        {mealName: "Beef", price: "₦500", available: true, image: 'images/beef.png' },
        {mealName: "Goat Meat", price: "₦800", available: true, image: 'images/goat meat.png' },
        {mealName: "Egg", price: "₦300", available: true, image: 'images/egg.png' },
        {mealName: "Chicken", price: "₦1,000", available: true, image: 'images/chicken.png' },
        {mealName: "Turkey", price: "₦1,500", available: true, image: 'images/turkey.png' },
        {mealName: "Fish", price: "₦800", available: true, image: 'images/fish.png' },
    ],
    "Side Meals": [
        {mealName: "Coleslaw (big)", price: "₦600", available: true, image: 'images/coleslaw (big).png' },
        {mealName: "Coleslaw (small)", price: "₦300", available: true, image: 'images/coleslaw (small).png' },
        {mealName: "Fried Plantain (per portion)", price: "₦200", available: true, image: 'images/fried plantain (per portion).png' }
    ],
    "Snacks" : [
        {mealName: "Chicken pie", price: "₦1,500", available: true, image: 'images/chicken pie.png' },
        {mealName: "Meat pie", price: "₦1,000", available: true, image: 'images/meat pie.png' },
        {mealName: "Chicken and Chips with ketchup", price: "₦3,000", available: true, image: 'images/chicken and chips with ketchup.png' },
        {mealName: "Chicken and Chips", price: "₦2,500", available: true, image: 'images/chicken and chips.png' },
    ],
    "Drinks" : [
       {mealName: "Pet 50cl", price: "₦650", available: true, image: 'images/pet 50cl.png' },
       {mealName: "Pet 35cl", price: "₦350", available: true, image: 'images/pet 35cl.png' },
       {mealName: "Chivita Exotic", price: "₦1,600", available: true, image: 'images/Chi Exotic.png' }
    ],
    "Specials": [
        {mealName: "Thursday: Ewa Agoyin & Bread (7am-2pm)", price: "₦1,500", available: true, special: "thursday" },
        {mealName: "Weekend: Boiled Yam & Egg Sauce", price: "₦1,500", available: true, special: "weekend" },
        {mealName: "Catfish Peppersoup", price: "₦5,000", available: true, special: "weekend" }
    ]
};


// Cart management functions
function getCart() {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
}

function updateCartCount() {
    const cart = getCart();
    const badge = document.getElementById('notification-badge');
    if (badge) {
        if (cart.length > 0) {
            badge.textContent = cart.length;
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    }
}

function addToCart(item) {
    const cart = getCart();
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

const hotPicksData = [
    { name: "Double Combo", items: ["Jollof Rice", "Fried Rice", "Plantain", "Chicken", "Coleslaw (small)"], basePrice: 4200, image: 'images/double combo.png' },
    {name: "ODG Combo", items: ["Jollof Rice", "Fried Rice", "Turkey", "Coleslaw (big)", "Chivita Exotic"], basePrice: 5800, image: 'images/ODGCOMBO.png' },
    {name: "SnackTime", items: ["Chicken and Chips with ketchup", "Coke 50cl"], basePrice: 3800, image: 'images/SnackTime.png' },
    { name: "City-Villa", items: ["2 Wraps of Fufu", "Egusi", "Beef"], basePrice: 3500, image: 'images/city-villa.png' },
    { name: "Quick Office Lunch", items: ["Fried Rice", "2 pieces of Beef", "Fried Plantain (per portion)"], basePrice: 4200, image: 'images/quick office lunch.png' },
    { name: "Onye Eze", items: ["Oha Soup", "Pounded yam", "Fish", "2 pieces of Beef"], basePrice: 8000, image: 'images/Onye Eze.png' },
    { name: "Party Jollof Pack", items: ["Jollof Rice", "Coleslaw (big)", "Chicken", "Fanta 50cl"], basePrice: 9000, image: 'images/party-jollof-pack.png' },
    { name: "Weekend Breakfast", items: ["Ewa Agoyin & Bread", "Egg", "Coke 50cl"], basePrice: 3500, image: 'images/weekend-breakfast.png' },
    { name: "Hearty Swallow Meal", items: ["Egusi Soup", "Eba", "Goat Meat"], basePrice: 3000, image: 'images/hearty-swallow.png' },
    { name: "Spag Delight", items: ["Stir Fry Spaghetti", "Turkey", "Chivita Exotic"], basePrice: 7200, image: 'images/Spag delight.png' },
    { name: "Oganla", items: ["Ewedu, Gbegiri and Stew", "2 wraps of Amaa","Goat Meat and Assorted Meat"], basePrice: 5500, image: 'images/Oganla.png' },
    { name: "Chief's Feast", items: ["Vegetable Soup", "2 wraps ","Beef, Goat Meat and Ponmo"], basePrice: 4000, image: 'images/Chiefs Feast.png' },
];

// Calculate prices with 500 reduction and format
hotPicksData.forEach(item => {
    item.calculatedPrice = item.basePrice - 500;
    item.displayPrice = `₦${item.calculatedPrice.toLocaleString()}`;
    item.originalPrice = `₦${item.basePrice.toLocaleString()}`;
});

function orderHotPick(itemName, displayPrice, calculatedPrice) {
    const order = {
        type: 'hotPick',
        itemName: itemName,
        displayPrice: displayPrice,
        calculatedPrice: calculatedPrice,
        priceNumeric: calculatedPrice,
        createdAt: Date.now()
    };
    localStorage.setItem('latestOrder', JSON.stringify(order));
    window.location.href = 'payment.html';
}

const carousel = document.getElementById('hot-menu-carousel');
if (carousel) {
    carousel.innerHTML = hotPicksData.map(item => `
        <div class="carousel-item">
            <div class="meal-image" style="background-image: url('${item.image || "https://via.placeholder.com/280x180?text=" + encodeURIComponent(item.name)}')"></div>
            <div class="meal-info">
                <span class="meal-name">${item.name}</span>
                <span style="font-size: 0.85rem; color: #666; display: block; margin-bottom: 8px;">${item.items.join(", ")}</span>
                <span style="color: #999; text-decoration: line-through; font-size: 0.95rem; display: block; margin-bottom: 4px;">${item.originalPrice}</span>
                <span class="meal-price">${item.displayPrice}</span>
            </div>
            <button class="order-now-btn" onclick="orderHotPick('${item.name.replace(/'/g, "\\'")}'  , '${item.displayPrice}', ${item.calculatedPrice})">ORDER NOW</button>
        </div>`).join('');
}

// Carousel scroll function
function scrollCarousel(direction) {
    // Support multiple carousel containers: hot picks, takeout menu, booking menu
    const ids = ['hot-menu-carousel', 'takeout-menu', 'booking-menu-display'];
    let carousel = null;
    for (const id of ids) {
        const el = document.getElementById(id);
        if (el) { carousel = el; break; }
    }
    if (!carousel) return;

    const scrollAmount = 320; // Item width + gap
    if (direction === 'left') {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (direction === 'right') {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

// Auto-scroll carousel every 2.5 seconds (faster scrolling)
let scrollAmount = 0;
const step = 270;
if (carousel) {
    setInterval(() => {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (scrollAmount >= maxScroll) {
            scrollAmount = 0;
        } else {
            scrollAmount += step;
        }
        carousel.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }, 2500);
}

//Admin Credentials
const adminCreds = {
    email: 'admin@chowhut.com',
    tag: 'HutMaster',
    password: 'HutAdmin123'
};

//Admin authentication
function isAdminLogged() {
    return localStorage.getItem('adminLogged') === 'true';
}

function authenticateAdmin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById('admin-email')?.value?.trim();
    const tag = document.getElementById('admin-tag')?.value?.trim();
    const pw = document.getElementById('admin-password')?.value;
    const err = document.getElementById('admin-error');
    if (!email || !tag || !pw) {
        if (err) err.innerText = 'All fields are required.';
        return false;
    }
    if (email === adminCreds.email && tag === adminCreds.tag && pw === adminCreds.password) {
        localStorage.setItem('adminLogged', 'true');
        if (err) err.innerText = '';
        document.getElementById('admin-login')?.classList.add('hidden');
        document.getElementById('admin-controls')?.classList.remove('hidden');
        renderAdminPanel();
        return true;
    }
    if (err) err.innerText = 'Invalid credentials.';
    return false;
}

function logoutAdmin() {
    localStorage.removeItem('adminLogged');
    document.getElementById('admin-login')?.classList.remove('hidden');
    document.getElementById('admin-controls')?.classList.add('hidden');
    document.getElementById('admin-panel') && (document.getElementById('admin-panel').innerHTML = '');
}

function goToPayment() {
    const cart = getCart();
    if (!cart.length) {
        alert('Your cart is empty. Please add items to proceed.');
        return;
    }

    const name = document.getElementById('contact-name')?.value?.trim();
    const phone = document.getElementById('contact-phone')?.value?.trim();
    const email = document.getElementById('contact-email')?.value?.trim();
    if (!phone || !email) {
        alert('Please provide phone number and email for delivery.');
        return;
    }

    const order = { cart, contact: { name, phone, email }, createdAt: Date.now() };
    localStorage.setItem('latestOrder', JSON.stringify(order));

    // Add notification for hot picks or cart order
    const cartSummary = cart.map(item => item.mealName || item.name).join(', ');
    orderNotificationSystem.addOrderNotification(cartSummary, `${cart.length} item(s) - Hot Picks Order`);

    window.location.href = 'payment.html';
}

function loadAvailability() {
    const saved = localStorage.getItem('menuAvailability');
    if (saved) {
        const data = JSON.parse(saved);
        for (const [category, items] of Object.entries(menuData)) {
            items.forEach((item, idx) => {
                if (data[category] && data[category][idx] !== undefined) {
                    item.available = data[category][idx];
                }
            });
        }
    }
}

function saveAvailability() {
    const availability = {};
    for (const [category, items] of Object.entries(menuData)) {
        availability[category] = items.map(item => item.available);
    }
    localStorage.setItem('menuAvailability', JSON.stringify(availability));
}

function toggleItemAvailability(category, index) {
    menuData[category][index].available = !menuData[category][index].available;
    saveAvailability();
    renderAdminPanel();
}

function renderMenu() {
    const root = document.getElementById('menu-section') || document.getElementById('takeout-menu');
    if (!root) return;
    loadAvailability();
    root.innerHTML = "";
    const cart = getCart();
    for (const [category, items] of Object.entries(menuData)) {
        // If on takeout page, only show available items and prepare slides
        if (root.id === 'takeout-menu') {
            // build slide content (only available)
            const available = items.filter(it => it.available);
            let slide = `<div class="slide-item" data-category="${category}">`;
            slide += `<h2 class="category-title">${category}</h2><p class="category-sub">Sold per ${getUnitForCategory(category)}</p><div class="menu-grid">`;
            available.forEach((item) => {
                slide += `<div class="card">
                    <h3>${item.mealName || item.name}</h3>
                    <p class="price">${item.price}</p>
                </div>`;
            });
            slide += `</div></div>`;
            root.innerHTML += slide;
        } else {
            // index or other pages: show full menu including unavailable (mark visually)
            let section = `<h2 class="category-title">${category}</h2><p class="category-sub">Sold per ${getUnitForCategory(category)}</p><div class="menu-grid">`;
            items.forEach((item, idx) => {
                const unavailable = !item.available;
                section += `<div class="card ${unavailable ? 'unavailable' : ''}">
                    <h3>${item.mealName || item.name}</h3>
                    <p class="price">${item.price}</p>
                    ${unavailable ? '<div style="color:#c00;font-weight:700;margin-top:8px;">Unavailable</div>' : ''}
                </div>`;
            });
            root.innerHTML += section + `</div>`;
        }
    }

    // if takeout page, initialize slide behavior
    if (root.id === 'takeout-menu') {
        initTakeoutSlider();
    }
}

// Takeout slider functions
let takeoutSliderTimer = null;

function getUnitForCategory(category) {
    const units = {
        'Swallows': 'wrap',
        'Main Meals': 'scoop',
        'Soups': 'scoop',
        'Proteins': 'portion',
        'Side Meals': 'portion',
        'Snacks': 'portion',
        'Drinks': 'bottle',
        'Specials': 'plate'
    };
    return units[category] || 'portion';
}

function initTakeoutSlider() {
    const root = document.getElementById('takeout-menu');
    if (!root) return;
    const slides = Array.from(root.querySelectorAll('.slide-item'));
    slides.forEach(s => { s.style.position = 'absolute'; s.style.top = 0; s.style.right = '-100%'; s.style.width = '100%'; s.style.transition = 'transform 0.8s ease, right 0.8s ease'; });
    let cur = 0;
    function showIndex(i) {
        slides.forEach((s, idx) => {
            if (idx === i) {
                s.style.right = '0%';
                s.style.transform = 'translateX(0)';
            } else if (idx < i) {
                s.style.right = '100%';
                s.style.transform = 'translateX(-100%)';
            } else {
                s.style.right = '-100%';
                s.style.transform = 'translateX(100%)';
            }
        });
    }
    // initial
    if (slides.length) showIndex(0);
    // clear existing timer
    if (takeoutSliderTimer) clearInterval(takeoutSliderTimer);
    // show each slide for ~15s
    takeoutSliderTimer = setInterval(() => {
        cur = (cur + 1) % slides.length;
        showIndex(cur);
    }, 15000 + 800); // 15s stay + animation buffer
}

// Display menu as carousel for both takeout and booking pages
function displayMenuCarousel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    loadAvailability();
    
    // Determine which categories to show
    const categoriesToShow = ['Main Meals', 'Soups', 'Swallows', 'Proteins', 'Side Meals', 'Snacks', 'Drinks'];
    
    let items = [];
    
    for (const category of categoriesToShow) {
        const menuItems = menuData[category] || [];
        items = items.concat(menuItems.filter(item => item && item.mealName && item.available));
    }
    
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No meals available</p>';
        return;
    }
    
    let html = `<div class="menu-slider-track">`;
    
    items.forEach((item) => {
        const mealName = item.mealName;
        const price = item.price;
        const imageUrl = item.image || `https://via.placeholder.com/280x180?text=${encodeURIComponent(mealName)}`;

        html += `
            <div class="menu-slider-item">
                <div class="menu-item-image" style="background-image: url('${imageUrl}')"></div>
                <div class="menu-item-info">
                    <div class="menu-item-name">${mealName}</div>
                    <div class="menu-item-price">${price}</div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

// Display menu in booking page
function displayBookingMenu() {
    displayMenuCarousel('booking-menu-display');
}

function renderAdminPanel() {
    const admin = document.getElementById('admin-panel');
    if (!admin) return;
    loadAvailability();
    if (!isAdminLogged()) {
        admin.innerHTML = `<p style="color:#666;">Please login using the form above to access the admin menu management.</p>`;
        // ensure controls are hidden
        document.getElementById('admin-controls')?.classList.add('hidden');
        return;
    }
    admin.innerHTML = `<h2 style="color: var(--primary-color); margin-bottom: 20px;">Admin Panel - Menu Management</h2>`;
    document.getElementById('admin-controls')?.classList.remove('hidden');
    for (const [category, items] of Object.entries(menuData)) {
        let section = `<div class="admin-category">
            <div class="admin-category-title">${category}</div>
            <div class="admin-item-list">`;
        items.forEach((item, idx) => {
            const checked = item.available ? 'checked' : '';
            section += `<div class="admin-item">
                <input type="checkbox" ${checked} onchange="toggleItemAvailability('${category}', ${idx})">
                <label>${item.mealName}</label>
                <span class="admin-item-price">${item.price}</span>
            </div>`;
        });
        section += `</div></div>`;
        admin.innerHTML += section;
    }
}

// Carousel
let slideIdx = -1;
function runCarousel() {
    const slides = document.querySelectorAll('.slide');
    if(!slides.length) return;
    slides.forEach(s => s.classList.remove('active'));
    slideIdx = (slideIdx + 1) % slides.length;
    slides[slideIdx].classList.add('active');
}

// Map Tracking Logic
function startTracking() {
    const trackBox = document.getElementById('tracking-box');
    if (!trackBox) { window.location.href = "payment.html"; return; }
    trackBox.style.display = "block";
    
    let dist = (Math.random() * 8 + 2).toFixed(1);
    let eta = Math.round(dist * 4);
    const rider = document.getElementById('rider-icon');
    
    let pos = 10;
    const move = setInterval(() => {
        pos += 2;
        rider.style.top = pos + "%";
        rider.style.left = pos + "%";
        dist = (dist * 0.9).toFixed(1);
        eta = Math.round(dist * 4);
        
        document.getElementById('dist-display').innerText = dist + " km";
        document.getElementById('eta-display').innerText = eta + " mins";
        document.getElementById('tracking-status').innerText = dist < 0.5 ? "Arriving Now!" : "Rider en route...";
        
        if (pos >= 70) {
            clearInterval(move);
            document.getElementById('tracking-status') && (document.getElementById('tracking-status').innerText = 'Delivered');
            // show feedback prompt
            setTimeout(() => showFeedback(), 800);
        }
    }, 3000);
}

function paymentTimer() {
    const el = document.getElementById('timer');
    if(!el) return;
    let time = 300;
    setInterval(() => {
        let m = Math.floor(time/60), s = time%60;
        el.innerText = `${m}:${s<10?'0':''}${s}`;
        if(time > 0) time--;
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    renderAdminPanel();
    displayBookingMenu();

    // Display carousel menu for takeout page if present
    const takeoutMenu = document.getElementById('takeout-menu');
    if (takeoutMenu) {
        displayMenuCarousel('takeout-menu');
    }

    updateCartCount();
    // Set admin form visibility based on login state
    if (isAdminLogged()) {
        document.getElementById('admin-login')?.classList.add('hidden');
        document.getElementById('admin-controls')?.classList.remove('hidden');
    } else {
        document.getElementById('admin-login')?.classList.remove('hidden');
        document.getElementById('admin-controls')?.classList.add('hidden');
    }
    paymentTimer();
    runCarousel(); // Run once immediately
    setInterval(runCarousel, 4000);
    // If payment set a flag to start tracking, handle it here
    try {
        const shouldTrack = localStorage.getItem('showTracking') === 'true';
        if (shouldTrack) {
            localStorage.removeItem('showTracking');
            const trackBox = document.getElementById('tracking-box');
            if (trackBox) {
                startTracking();
            } else {
                // not on takeout page — navigate there so user sees live map
                window.location.href = 'takeout.html';
            }
        }
    } catch (e) { /* ignore storage errors */ }
});

// Submit free-text order from takeout page
function submitTextOrder() {
    const orderText = document.getElementById('order-text')?.value?.trim();
    const phone = document.getElementById('contact-phone')?.value?.trim();
    const email = document.getElementById('contact-email')?.value?.trim();
    const name = document.getElementById('contact-name')?.value?.trim();
    if (!orderText) { alert('Please type your order in the box.'); return; }
    if (!phone || !email) { alert('Please provide phone number and email for delivery.'); return; }

    const order = { text: orderText, contact: { name, phone, email }, createdAt: Date.now() };
    localStorage.setItem('latestOrder', JSON.stringify(order));

    // Add notification for custom order
    orderNotificationSystem.addOrderNotification(`Custom Order: ${orderText.substring(0, 50)}${orderText.length > 50 ? '...' : ''}`, 'Custom Order');

    window.location.href = 'payment.html';
}

// Typing icon handling for takeout textarea
function setupTypingIcon() {
    const ta = document.getElementById('order-text');
    const icon = document.getElementById('typing-icon');
    if (!ta || !icon) return;
    ta.addEventListener('focus', () => icon.classList.remove('hidden'));
    ta.addEventListener('blur', () => icon.classList.add('hidden'));
}

// run setup when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setupTypingIcon();
});
