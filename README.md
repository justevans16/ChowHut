# Chow Hut Restaurant | Order & Booking System

A full-stack restaurant web application for takeout orders, table reservations, live tracking, and admin menu management.

## 📂 Project Structure

```
CHOW HUT/
├── index.html           # Homepage with hero carousel and hot picks
├── takeout.html         # Ordering page with menu carousel and free-text orders
├── booking.html         # Table reservation form with live tracking UI
├── payment.html         # Secure payment info page with countdown timer
├── adminpanel.html      # Admin dashboard for menu availability toggle
├── script.js            # All client-side logic (orders, notifications, cart, admin auth)
├── style.css            # Responsive styling (mobile-first, 3 breakpoints)
├── images/              # Meal photos (must be added locally)
├── .gitignore           # Git exclusions
└── README.md            # This file
```

## 🚀 Publish to GitHub Pages

### 1. Prepare the Repository
- Ensure all files are in the project root (no nested folders except `images/`)
- Verify all asset paths are relative (e.g., `images/logo.PNG`, `style.css`)
- Commit all changes locally with `git add .` and `git commit -m "Initial commit"`

### 2. Create GitHub Repository
- Create a new repository on GitHub (public)
- Name: `chowhut` (or any name)
- Do **not** initialize with README, .gitignore, or license (we already have them)

### 3. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/chowhut.git
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages
- Go to repository **Settings** → **Pages**
- Select **Source**: `main` branch, `/root` folder
- Click **Save**
- Your site will be live at: `https://YOUR_USERNAME.github.io/chowhut/`

### 5. Verify Live Site
- Allow 1-2 minutes for deployment
- Open the GitHub Pages URL above
- All images, styles, and scripts should load correctly

## 📋 Core Features

### Pages

| Page | Purpose | Key Components |
|------|---------|---|
| **index.html** | Homepage + marketing | Hero carousel, hot picks carousel, about section |
| **takeout.html** | Order placement | Menu carousel, free-text order form, cart badge |
| **booking.html** | Table reservation | Form fields (name, email, phone, date, guests), live tracking map |
| **payment.html** | Payment details | Order summary, bank details, 5-min countdown timer |
| **adminpanel.html** | Menu management | Toggle meal availability by category, auto-saves to localStorage |

### JavaScript Logic (script.js)

#### Data
- **`menuData`**: Structured menu by category (Main Meals, Soups, Proteins, etc.)
  - Fields: `mealName`, `price`, `available`, `image` (relative path)
- **`hotPicksData`**: Pre-made meal combos with calculated discounts
  - Fields: `name`, `items[]`, `basePrice`, `calculatedPrice`, `image`
- **`adminCreds`**: Hardcoded admin auth (email, tag, password)

#### Core Functions
- `displayMenuCarousel(containerId)` – renders available menu items in a scrollable carousel
- `scrollCarousel(direction)` – scrolls any carousel (#hot-menu-carousel, #takeout-menu, #booking-menu-display)
- `orderNotificationSystem` – manages order notifications (add, display, delete, detail view)
- `updateCartCount()` – updates notification badge with cart item count
- `orderHotPick(name, price, calc)` – saves order to localStorage and redirects to payment.html
- `handlePaymentConfirmation()` – confirms payment and redirects to takeout.html
- `submitTextOrder()` – submits free-text order from takeout page
- `toggleItemAvailability(category, index)` – admin toggles meal on/off

#### Storage
- **`orderNotifications`** – JSON array of order alerts
- **`latestOrder`** – most recent order object
- **`cart`** – array of cart items
- **`menuAvailability`** – JSON map of disabled menu items
- **`adminLogged`** – flag set on admin login

### CSS Styling (style.css)

- **Color scheme**: Primary (`#bd720f`), Gold accent (`#7c6b35`), Green (`#0c972a`)
- **Responsive breakpoints**:
  - Desktop: ≥ 768px
  - Tablet: 480px – 767px
  - Mobile: < 480px
- **Components**:
  - Navbar (fixed, 90px height)
  - Carousels (scroll-snap, smooth scrolling)
  - Notification panel (slide-in from right)
  - Modal (notification detail view)
  - Forms (grid-based, accessible tab flow)
  - Footer (3-column: social links, info links, copyright)

## 🔧 Local Development

### Without a Server
1. Open `index.html` directly in a browser
2. All relative paths will resolve correctly
3. LocalStorage persists across page refreshes

### With a Local Server (Recommended)
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server
```
Then navigate to `http://localhost:8000` or `http://localhost:8080`

## 🛠 Common Tasks

### Add a New Meal
1. Add entry to `menuData` in `script.js`:
   ```javascript
   {mealName: "New Meal", price: "₦1,500", available: true, image: 'images/new-meal.png'}
   ```
2. Save a meal photo to `images/new-meal.png`
3. Refresh the page—it will appear in carousels and menus

### Change Admin Credentials
1. Edit `adminCreds` in `script.js`:
   ```javascript
   const adminCreds = {
       email: 'newemail@domain.com',
       tag: 'NewTag',
       password: 'NewPassword123'
   };
   ```
2. Save and test at `/adminpanel.html`

### Customize Colors
1. Update CSS variables in `style.css` `:root` block:
   ```css
   :root {
       --primary-color: #new-color;
       --gold-accent: #new-gold;
       --green: #new-green;
   }
   ```

## 📱 Responsive Design

- **Mobile (< 480px)**: Single-column layout, smaller carousels, touch-friendly buttons
- **Tablet (480–767px)**: Two-column grids, optimized spacing
- **Desktop (≥ 768px)**: Multi-column grids, full-width carousels

All elements tested and styled for smooth experience across devices.

## 🚨 Known Limitations

- **No backend**: All data is client-side (localStorage). Orders are not persisted to a server.
- **Admin panel**: Credentials are hardcoded in `script.js` (for demo only).
- **Images required**: Carousel and menu items expect images in `images/` folder; missing images show placeholders.
- **Payment**: Payment page displays bank details only; no actual payment processing.

## 💾 Browser Compatibility

- Chrome/Edge ≥ 80
- Firefox ≥ 75
- Safari ≥ 12
- Mobile browsers (Chrome Android, Safari iOS)

## 📝 Notes

- All paths are **relative** to ensure portability across environments
- Footer is synced across all pages (`index.html`, `takeout.html`, `booking.html`, `payment.html`)
- Notification system uses localStorage and auto-updates badge counts
- Admin panel changes are instant and don't require page reload
- Carousels use CSS scroll-snap for smooth, predictable scrolling
