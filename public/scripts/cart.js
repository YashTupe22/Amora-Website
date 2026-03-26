/* =============================================
   AMORA CAFE — CART & ORDERING SYSTEM
   with 3km Geolocation Delivery Check
   ============================================= */

const Cart = {
    items: [],
    
    // ==========================================
    // CAFE LOCATION — L-Axis Building, PCMC, Pune
    // ==========================================
    CAFE_LAT: 18.6298,   // L-Axis Building, PCMC, Pune
    CAFE_LNG: 73.7968,   // L-Axis Building
    MAX_DELIVERY_RADIUS_M: 100000,  // Maximum delivery radius in meters (100km for testing)

    // --- Init ---
    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.updateBadge();
        this.updateCartUI();
    },

    // --- Event Bindings ---
    bindEvents() {
        const cartToggle = document.getElementById('cart-toggle-btn');
        const cartClose = document.getElementById('cart-close');
        const cartOverlay = document.getElementById('cart-overlay');
        const checkoutBtn = document.getElementById('checkout-btn');
        const geoAllow = document.getElementById('geo-allow');
        const geoDeny = document.getElementById('geo-deny');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const addressCloseBtn = document.getElementById('address-close-btn');
        const addressSubmitBtn = document.getElementById('address-submit-btn');
        const addressForm = document.getElementById('address-form');

        if (cartToggle) cartToggle.addEventListener('click', () => this.toggleDrawer(true));
        if (cartClose) cartClose.addEventListener('click', () => this.toggleDrawer(false));
        if (cartOverlay) cartOverlay.addEventListener('click', () => this.toggleDrawer(false));
        if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.handleCheckout());
        if (geoAllow) geoAllow.addEventListener('click', () => this.requestGeoPermission());
        if (geoDeny) geoDeny.addEventListener('click', () => this.closeGeoModal());
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => this.closeModal());
        if (addressCloseBtn) addressCloseBtn.addEventListener('click', () => this.closeAddressModal());
        if (addressSubmitBtn) addressSubmitBtn.addEventListener('click', () => this.submitAddress());
        
        // Form submit handler
        if (addressForm) {
            addressForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAddress();
            });
        }
    },

    // --- Add Item ---
    addItem(item) {
        const existing = this.items.find(i => i.id === item.id);
        if (existing) {
            existing.qty += 1;
        } else {
            this.items.push({ ...item, qty: 1 });
        }
        this.saveToStorage();
        this.updateBadge();
        this.updateCartUI();
        this.showToast(`${item.name} added to cart`);
    },

    // --- Remove Item ---
    removeItem(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.saveToStorage();
        this.updateBadge();
        this.updateCartUI();
    },

    // --- Update Quantity ---
    updateQty(id, delta) {
        const item = this.items.find(i => i.id === id);
        if (!item) return;
        
        item.qty += delta;
        if (item.qty <= 0) {
            this.removeItem(id);
            return;
        }
        this.saveToStorage();
        this.updateCartUI();
    },

    // --- Get Total ---
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    },

    // --- Get Item Count ---
    getCount() {
        return this.items.reduce((sum, item) => sum + item.qty, 0);
    },

    // --- Toggle Drawer ---
    toggleDrawer(open) {
        const drawer = document.getElementById('cart-drawer');
        const overlay = document.getElementById('cart-overlay');
        
        if (open) {
            drawer.classList.add('active');
            overlay.classList.add('active');
            document.body.classList.add('no-scroll');
        } else {
            drawer.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    },

    // --- Update Badge ---
    updateBadge() {
        const badge = document.getElementById('cart-badge');
        const count = this.getCount();
        
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    },

    // --- Update Cart UI ---
    updateCartUI() {
        const container = document.getElementById('cart-items');
        const footer = document.getElementById('cart-footer');
        const totalPrice = document.getElementById('cart-total-price');
        
        if (this.items.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <p>Your cart is empty</p>
                    <span>Add items from the menu</span>
                </div>`;
            footer.classList.add('hidden');
            return;
        }

        footer.classList.remove('hidden');
        totalPrice.textContent = `₹${this.getTotal()}`;

        container.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="Cart.updateQty(${item.id}, -1)">−</button>
                        <span class="cart-item-qty">${item.qty}</span>
                        <button class="qty-btn" onclick="Cart.updateQty(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="Cart.removeItem(${item.id})">Remove</button>
            </div>
        `).join('');
    },

    // --- Handle Checkout ---
    handleCheckout() {
        if (this.items.length === 0) return;
        
        // Show geo permission modal
        const geoModal = document.getElementById('geo-modal');
        geoModal.classList.add('active');
        document.body.classList.add('no-scroll');
    },

    // --- Request Geolocation Permission ---
    requestGeoPermission() {
        this.closeGeoModal();

        if (!navigator.geolocation) {
            this.showModal('error', 'Location Not Supported', 'Your browser does not support geolocation. Please try using a different browser.');
            return;
        }

        // Show loading state
        this.showToast('Getting your location...');

        navigator.geolocation.getCurrentPosition(
            (position) => this.checkDeliveryRange(position),
            (error) => this.handleGeoError(error),
            { 
                enableHighAccuracy: true, 
                timeout: 10000, 
                maximumAge: 60000 
            }
        );
    },

    // --- Check if within L-Axis Building (strict 50m radius) ---
    checkDeliveryRange(position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distanceMeters = this.haversineDistanceMeters(userLat, userLng, this.CAFE_LAT, this.CAFE_LNG);
        
        // Store user location for order
        this.userLocation = { lat: userLat, lng: userLng };
        
        if (distanceMeters <= this.MAX_DELIVERY_RADIUS_M) {
            // Within L-Axis Building — show address input modal
            this.showAddressModal(distanceMeters);
        } else {
            // Outside L-Axis Building
            this.showModal(
                'error',
                'Orders Only from L-Axis Building',
                `Sorry, we only accept orders from within L-Axis Building. Your current location is approximately ${distanceMeters.toFixed(0)}m away. Please visit us or order from inside the building!`
            );
        }
    },

    // --- Haversine Formula (distance in meters) ---
    haversineDistanceMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    toRad(deg) {
        return deg * (Math.PI / 180);
    },

    // --- Show Address Input Modal ---
    showAddressModal(distance) {
        const addressModal = document.getElementById('address-modal');
        if (!addressModal) {
            console.error('Address modal not found');
            return;
        }
        
        // Store distance for later use
        this.deliveryDistance = distance;
        
        // Clear previous input
        document.getElementById('flat-number').value = '';
        document.getElementById('wing-name').value = '';
        
        // Show modal
        addressModal.classList.add('active');
        document.body.classList.add('no-scroll');
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('flat-number')?.focus();
        }, 100);
    },

    // --- Close Address Modal ---
    closeAddressModal() {
        const addressModal = document.getElementById('address-modal');
        if (addressModal) {
            addressModal.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    },

    // --- Submit Address and Place Order ---
    async submitAddress() {
        const flatNumber = document.getElementById('flat-number')?.value.trim();
        const wingName = document.getElementById('wing-name')?.value.trim();
        
        // Validation
        if (!flatNumber || !wingName) {
            this.showToast('Please enter both flat number and wing name');
            return;
        }
        
        // Close address modal
        this.closeAddressModal();
        
        // Show loading
        this.showToast('Placing your order...');
        
        // Place order with address
        await this.placeOrder(this.deliveryDistance, { flatNumber, wingName });
    },

    // --- Place Order (send to backend API + WhatsApp) ---
    async placeOrder(distance, address) {
        try {
            // Prepare order data
            const orderData = {
                items: this.items.map(i => ({
                    id: i.id,
                    name: i.name,
                    price: i.price,
                    qty: i.qty
                })),
                total: this.getTotal(),
                distance: parseFloat((distance / 1000).toFixed(2)), // Convert to km
                address: address,
                userLocation: this.userLocation
            };

            // Send to backend API
            const API_BASE = window.location.hostname === 'localhost' 
                ? 'http://localhost:3001/api' 
                : 'https://amora-cafe.vercel.app/api';
            
            const response = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to place order');
            }

            const result = await response.json();
            const order = result.order;

            // Build WhatsApp message
            const orderText = this.items.map(item =>
                `• ${item.name} ×${item.qty} — ₹${item.price * item.qty}`
            ).join('\n');

            const message = `🛒 *New Order ${order.orderNum} — Amora Café*\n\n${orderText}\n\n💰 *Total: ₹${this.getTotal()}*\n📍 L-Axis Building\n🏠 Flat ${address.flatNumber}, ${address.wingName}\n\nPlease confirm my order!`;
            const encoded = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/919876543210?text=${encoded}`;

            // Show success
            this.showModal(
                'success',
                `Order ${order.orderNum} Placed! 🎉`,
                'Your order has been confirmed and sent to our kitchen. We\'ll WhatsApp you shortly to confirm!'
            );

            // Clear cart
            this.items = [];
            this.saveToStorage();
            this.updateBadge();
            this.updateCartUI();
            this.toggleDrawer(false);

            // Open WhatsApp after small delay
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
            }, 1500);
        } catch (error) {
            console.error('Error placing order:', error);
            this.showModal(
                'error',
                'Order Failed',
                error.message || 'Failed to place order. Please try again or contact us directly.'
            );
        }
    },

    // --- Handle Geolocation Errors ---
    handleGeoError(error) {
        let message = '';
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message = 'Location access was denied. Please enable location access in your browser settings and try again.';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Your location could not be determined. Please make sure location services are turned on.';
                break;
            case error.TIMEOUT:
                message = 'Location request timed out. Please try again.';
                break;
            default:
                message = 'An unexpected error occurred while getting your location.';
        }
        this.showModal('error', 'Location Error', message);
    },

    // --- Close Geo Modal ---
    closeGeoModal() {
        const geoModal = document.getElementById('geo-modal');
        geoModal.classList.remove('active');
        if (!document.getElementById('cart-drawer').classList.contains('active')) {
            document.body.classList.remove('no-scroll');
        }
    },

    // --- Show/Close Generic Modal ---
    showModal(type, title, message) {
        const overlay = document.getElementById('modal-overlay');
        const icon = document.getElementById('modal-icon');
        const titleEl = document.getElementById('modal-title');
        const msgEl = document.getElementById('modal-message');

        icon.textContent = type === 'success' ? '✅' : '⚠️';
        titleEl.textContent = title;
        msgEl.textContent = message;

        overlay.classList.add('active');
        document.body.classList.add('no-scroll');
    },

    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('active');
        if (!document.getElementById('cart-drawer').classList.contains('active')) {
            document.body.classList.remove('no-scroll');
        }
    },

    // --- Toast Notification ---
    showToast(message) {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    },

    // --- Local Storage ---
    saveToStorage() {
        try {
            localStorage.setItem('amora_cart', JSON.stringify(this.items));
        } catch(e) { /* ignore */ }
    },

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('amora_cart');
            if (saved) {
                this.items = JSON.parse(saved);
            }
        } catch(e) {
            this.items = [];
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => Cart.init());
