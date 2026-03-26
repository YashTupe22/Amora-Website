/* =============================================
   AMORA CAFE — DASHBOARD SCRIPT
   Real-time Order Management with Socket.io
   ============================================= */

(function() {
    'use strict';

    // Configuration
    const API_BASE = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001/api' 
        : `${window.location.protocol}//${window.location.hostname}/api`;
    
    const SOCKET_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : `${window.location.protocol}//${window.location.hostname}`;

    let socket = null;
    let orders = [];

    // ==========================================
    // INITIALIZATION
    // ==========================================
    async function init() {
        updateClock();
        setInterval(updateClock, 1000);
        
        await loadOrders();
        initializeSocket();
        bindEvents();
    }

    // ==========================================
    // LOAD ORDERS FROM API
    // ==========================================
    async function loadOrders() {
        try {
            const response = await fetch(`${API_BASE}/orders`);
            if (!response.ok) throw new Error('Failed to fetch orders');
            
            const data = await response.json();
            orders = data.orders || [];
            renderOrders();
            updateStats();
        } catch (error) {
            console.error('Error loading orders:', error);
            showError('Failed to load orders. Please refresh the page.');
        }
    }

    // ==========================================
    // SOCKET.IO REAL-TIME SYNC
    // ==========================================
    function initializeSocket() {
        // Load Socket.io library if not already loaded
        if (typeof io === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.6.1/socket.io.min.js';
            script.onload = connectSocket;
            document.head.appendChild(script);
        } else {
            connectSocket();
        }
    }

    function connectSocket() {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('✅ Connected to server');
            updateConnectionStatus(true);
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from server');
            updateConnectionStatus(false);
        });

        // New order received
        socket.on('order:new', (order) => {
            console.log('📦 New order received:', order);
            orders.unshift(order);
            renderOrders();
            updateStats();
            playNotificationSound();
        });

        // Order updated
        socket.on('order:updated', (updatedOrder) => {
            console.log('🔄 Order updated:', updatedOrder);
            const index = orders.findIndex(o => o.id === updatedOrder.id);
            if (index !== -1) {
                orders[index] = updatedOrder;
                renderOrders();
                updateStats();
            }
        });

        // Order deleted
        socket.on('order:deleted', (orderId) => {
            console.log('🗑️ Order deleted:', orderId);
            orders = orders.filter(o => o.id !== orderId);
            renderOrders();
            updateStats();
        });

        // All orders cleared
        socket.on('orders:cleared', () => {
            console.log('🧹 All orders cleared');
            orders = [];
            renderOrders();
            updateStats();
        });
    }

    function updateConnectionStatus(connected) {
        const badge = document.querySelector('.live-badge');
        if (badge) {
            badge.style.opacity = connected ? '1' : '0.5';
        }
    }

    function playNotificationSound() {
        // Simple notification beep (can be replaced with actual sound file)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    // ==========================================
    // UPDATE CLOCK
    // ==========================================
    function updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN', { 
            hour12: true, 
            hour: '2-digit', 
            minute: '2-digit'
        });
        const dateStr = now.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        const clockEl = document.querySelector('.header-time');
        if (clockEl) {
            clockEl.textContent = `${timeStr} • ${dateStr}`;
        }
    }

    // ==========================================
    // RENDER ORDERS
    // ==========================================
    function renderOrders() {
        const container = document.getElementById('orders-grid');
        if (!container) return;

        const filteredOrders = getFilteredOrders();

        if (filteredOrders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <h3>No Orders Yet</h3>
                    <p>New orders will appear here in real-time</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredOrders.map(order => `
            <div class="order-card" data-id="${order.id}">
                <div class="order-card-header">
                    <div>
                        <div class="order-number">${order.orderNum}</div>
                        <div class="order-time">${formatTime(order.placedAt)}</div>
                    </div>
                    <span class="order-status-badge status-${order.status}">${formatStatus(order.status)}</span>
                </div>
                
                ${order.customer ? `
                    <div class="order-customer">
                        <div class="customer-info">
                            <strong>👤 ${order.customer.name}</strong>
                            <span class="customer-phone">📱 ${order.customer.phone}</span>
                            ${order.customer.email ? `<span class="customer-email">📧 ${order.customer.email}</span>` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item-row">
                            <div>
                                <span class="order-item-name">${item.name}</span>
                                <span class="order-item-qty">×${item.qty}</span>
                            </div>
                            <span class="order-item-price">₹${item.price * item.qty}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${order.deliveryBoy && (order.deliveryBoy.name || order.deliveryBoy.phone) ? `
                    <div class="delivery-boy-info">
                        <strong>🚚 Delivery Boy:</strong>
                        <div class="delivery-details">
                            ${order.deliveryBoy.name ? `<span class="delivery-name">${order.deliveryBoy.name}</span>` : ''}
                            ${order.deliveryBoy.phone ? `<span class="delivery-phone">📱 ${order.deliveryBoy.phone}</span>` : ''}
                            ${order.deliveryBoy.assignedAt ? `<span class="delivery-assigned">Assigned: ${formatTime(order.deliveryBoy.assignedAt)}</span>` : ''}
                        </div>
                    </div>
                ` : ''}
                
                ${order.address ? `
                    <div class="order-address">
                        <strong>📍 Delivery:</strong> Flat ${order.address.flatNumber}, ${order.address.wingName}
                        ${order.address.deliveryNotes ? `<div class="delivery-notes">📝 ${order.address.deliveryNotes}</div>` : ''}
                    </div>
                ` : ''}
                
                <div class="order-card-footer">
                    <div class="order-total"><span>Total</span> ₹${order.total}</div>
                    <div class="action-btns">
                        ${getActionButtons(order)}
                    </div>
                </div>
                
                <div class="order-controls">
                    <div class="status-controls">
                        <label>Status:</label>
                        <select class="status-select" data-order-id="${order.id}" onchange="updateOrderStatus('${order.id}', this.value)">
                            <option value="new" ${order.status === 'new' ? 'selected' : ''}>New</option>
                            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                            <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                    <div class="delivery-controls">
                        <button class="assign-delivery-btn" onclick="openDeliveryModal('${order.id}', '${order.orderNum}')">
                            ${order.deliveryBoy && (order.deliveryBoy.name || order.deliveryBoy.phone) ? '✏️ Edit Delivery Boy' : '➕ Assign Delivery Boy'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function getActionButtons(order) {
        switch(order.status) {
            case 'new':
                return `
                    <button class="action-btn btn-prepare" onclick="Dashboard.updateOrderStatus('${order.id}', 'preparing')">Prepare</button>
                    <button class="action-btn btn-cancel" onclick="Dashboard.updateOrderStatus('${order.id}', 'cancelled')">Cancel</button>
                `;
            case 'preparing':
                return `
                    <button class="action-btn btn-ready" onclick="Dashboard.updateOrderStatus('${order.id}', 'ready')">Ready</button>
                    <button class="action-btn btn-cancel" onclick="Dashboard.updateOrderStatus('${order.id}', 'cancelled')">Cancel</button>
                `;
            case 'ready':
                return `
                    <button class="action-btn btn-deliver" onclick="Dashboard.updateOrderStatus('${order.id}', 'delivered')">Delivered</button>
                `;
            case 'delivered':
            case 'cancelled':
                return `<small style="color:var(--dim);">Completed</small>`;
            default:
                return '';
        }
    }

    function formatStatus(status) {
        const statusMap = {
            'new': 'New Order',
            'preparing': 'Preparing',
            'ready': 'Ready',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    }

    function formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        return date.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }

    // ==========================================
    // UPDATE ORDER STATUS
    // ==========================================
    async function updateOrderStatus(orderId, newStatus) {
        try {
            const response = await fetch(`${API_BASE}/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update order');

            const data = await response.json();
            console.log('Order updated:', data);
        } catch (error) {
            console.error('Error updating order:', error);
            showError('Failed to update order status');
        }
    }

    // ==========================================
    // FILTER ORDERS
    // ==========================================
    function getFilteredOrders() {
        const filterSelect = document.getElementById('status-filter');
        const filter = filterSelect?.value || 'all';
        
        if (filter === 'all') return orders;
        return orders.filter(order => order.status === filter);
    }

    // ==========================================
    // UPDATE STATS
    // ==========================================
    function updateStats() {
        const totalEl = document.getElementById('stat-total');
        const pendingEl = document.getElementById('stat-pending');
        const completedEl = document.getElementById('stat-completed');

        if (totalEl) totalEl.textContent = orders.length;
        if (pendingEl) {
            const pending = orders.filter(o => ['new', 'preparing', 'ready'].includes(o.status)).length;
            pendingEl.textContent = pending;
        }
        if (completedEl) {
            const completed = orders.filter(o => o.status === 'delivered').length;
            completedEl.textContent = completed;
        }
    }

    // ==========================================
    // EVENT BINDINGS
    // ==========================================
    function bindEvents() {
        const filterSelect = document.getElementById('status-filter');
        const refreshBtn = document.getElementById('refresh-btn');
        const clearBtn = document.getElementById('clear-all-btn');

        if (filterSelect) {
            filterSelect.addEventListener('change', renderOrders);
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadOrders);
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', clearAllOrders);
        }
    }

    // ==========================================
    // CLEAR ALL ORDERS
    // ==========================================
    async function clearAllOrders() {
        if (!confirm('Are you sure you want to clear all orders? This cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/orders`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to clear orders');

            console.log('All orders cleared');
        } catch (error) {
            console.error('Error clearing orders:', error);
            showError('Failed to clear orders');
        }
    }

    // ==========================================
    // ERROR HANDLING
    // ==========================================
    function showError(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #C0514A;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==========================================
    // DELIVERY BOY MANAGEMENT
    // ==========================================
    function openDeliveryModal(orderId, orderNum) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const modalHtml = `
            <div class="delivery-modal-overlay" id="delivery-modal">
                <div class="delivery-modal">
                    <div class="delivery-modal-header">
                        <h3>Assign Delivery Boy - Order ${orderNum}</h3>
                        <button class="modal-close" onclick="closeDeliveryModal()">×</button>
                    </div>
                    <form class="delivery-form" onsubmit="assignDeliveryBoy(event, '${orderId}')">
                        <div class="form-group">
                            <label for="delivery-name">Delivery Boy Name:</label>
                            <input type="text" id="delivery-name" name="name" 
                                   value="${order.deliveryBoy?.name || ''}" 
                                   placeholder="Enter delivery boy name" required>
                        </div>
                        <div class="form-group">
                            <label for="delivery-phone">Phone Number:</label>
                            <input type="tel" id="delivery-phone" name="phone" 
                                   value="${order.deliveryBoy?.phone || ''}" 
                                   placeholder="+91 98765 43210" required>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closeDeliveryModal()">Cancel</button>
                            <button type="submit" class="btn-primary">Assign Delivery Boy</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Add CSS for modal if not exists
        if (!document.getElementById('delivery-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'delivery-modal-styles';
            styles.textContent = `
                .delivery-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                .delivery-modal {
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 400px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }
                .delivery-modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .delivery-modal-header h3 {
                    margin: 0;
                    color: var(--forest);
                    font-size: 1.1rem;
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--muted);
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .delivery-form {
                    padding: 20px;
                }
                .form-group {
                    margin-bottom: 16px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 6px;
                    color: var(--forest);
                    font-weight: 500;
                    font-size: 0.9rem;
                }
                .form-group input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 2px solid #ddd;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    transition: border-color 0.3s;
                }
                .form-group input:focus {
                    outline: none;
                    border-color: var(--sage);
                }
                .form-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 24px;
                }
                .btn-primary, .btn-secondary {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .btn-primary {
                    background: var(--forest);
                    color: white;
                }
                .btn-primary:hover {
                    background: var(--sage);
                }
                .btn-secondary {
                    background: #f0f0f0;
                    color: var(--text);
                }
                .btn-secondary:hover {
                    background: #e0e0e0;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    function closeDeliveryModal() {
        const modal = document.getElementById('delivery-modal');
        if (modal) {
            modal.remove();
        }
    }

    async function assignDeliveryBoy(event, orderId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const deliveryBoy = {
            name: formData.get('name').trim(),
            phone: formData.get('phone').trim()
        };

        try {
            const response = await fetch(`${API_BASE}/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ deliveryBoy })
            });

            if (!response.ok) throw new Error('Failed to assign delivery boy');

            const data = await response.json();
            console.log('Delivery boy assigned:', data);
            closeDeliveryModal();
            
            // Show success message
            showSuccess(`Delivery boy ${deliveryBoy.name} assigned successfully!`);
            
        } catch (error) {
            console.error('Error assigning delivery boy:', error);
            showError('Failed to assign delivery boy');
        }
    }

    function showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--green);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==========================================
    // EXPOSE GLOBAL API
    // ==========================================
    window.Dashboard = {
        updateOrderStatus,
        loadOrders,
        clearAllOrders
    };

    // Make functions globally available for inline event handlers
    window.updateOrderStatus = updateOrderStatus;
    window.openDeliveryModal = openDeliveryModal;
    window.closeDeliveryModal = closeDeliveryModal;
    window.assignDeliveryBoy = assignDeliveryBoy;

    // ==========================================
    // RUN ON LOAD
    // ==========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
