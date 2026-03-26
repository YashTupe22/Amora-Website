require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const server = http.createServer(app);

// In-memory storage for Vercel (since file system is ephemeral)
let memoryOrders = [];

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration
const PORT = process.env.PORT || 3001;
const ORDERS_FILE = process.env.VERCEL ? '/tmp/orders.json' : path.join(__dirname, 'data', 'orders.json');

// Utility: Read orders (file system or memory)
async function readOrders() {
    // Use in-memory storage on Vercel
    if (process.env.VERCEL) {
        console.log(`Reading from memory: ${memoryOrders.length} orders`);
        return memoryOrders;
    }
    
    // Use file system locally
    try {
        const data = await fs.readFile(ORDERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('Orders file not found, creating empty array');
            await writeOrders([]);
            return [];
        }
        console.error('Error reading orders file:', error);
        throw error;
    }
}

// Utility: Write orders (file system or memory)
async function writeOrders(orders) {
    // Use in-memory storage on Vercel
    if (process.env.VERCEL) {
        memoryOrders = [...orders];
        console.log(`Saved to memory: ${orders.length} orders`);
        return;
    }
    
    // Use file system locally
    try {
        const tempFile = ORDERS_FILE + '.tmp';
        await fs.writeFile(tempFile, JSON.stringify(orders, null, 2), 'utf8');
        await fs.rename(tempFile, ORDERS_FILE);
        console.log(`Successfully wrote ${orders.length} orders to file`);
    } catch (error) {
        console.error('Error writing orders file:', error);
        throw error;
    }
}

// API ROUTES
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        cafe: process.env.CAFE_NAME || 'L-Axis Building'
    });
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await readOrders();
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Error reading orders:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        console.log('Received order request:', req.body);
        const { items, total, distance, address, customer, userLocation } = req.body;
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.log('Invalid items:', items);
            return res.status(400).json({ success: false, error: 'Invalid items' });
        }
        if (!total || typeof total !== 'number') {
            console.log('Invalid total:', total);
            return res.status(400).json({ success: false, error: 'Invalid total' });
        }
        if (!customer || !customer.name || !customer.phone) {
            console.log('Invalid customer info:', customer);
            return res.status(400).json({ success: false, error: 'Customer name and phone required' });
        }
        if (!address || !address.flatNumber || !address.wingName) {
            console.log('Invalid address:', address);
            return res.status(400).json({ success: false, error: 'Address required' });
        }
        
        console.log('Validation passed, creating order...');
        const orders = await readOrders();
        const orderNum = 'A' + String(orders.length + 1).padStart(3, '0');
        const newOrder = {
            id: 'order-' + Date.now(),
            orderNum,
            status: 'new',
            items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
            total,
            distance: parseFloat(distance?.toFixed(1) || 0),
            customer: {
                name: customer.name.trim(),
                phone: customer.phone.trim(),
                email: customer.email?.trim() || null
            },
            address: { 
                flatNumber: address.flatNumber.trim(), 
                wingName: address.wingName.trim(),
                deliveryNotes: address.deliveryNotes?.trim() || null
            },
            userLocation: userLocation || null,
            placedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('Created order:', newOrder.orderNum);
        orders.unshift(newOrder);
        await writeOrders(orders);
        
        console.log('Broadcasting order to dashboard...');
        io.emit('order:new', newOrder);
        
        console.log('Order created successfully:', newOrder.orderNum);
        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error('Error creating order:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ success: false, error: `Failed to create order: ${error.message}` });
    }
});

app.patch('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['new', 'preparing', 'ready', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }
        const orders = await readOrders();
        const orderIndex = orders.findIndex(o => o.id === id);
        if (orderIndex === -1) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        await writeOrders(orders);
        io.emit('order:updated', orders[orderIndex]);
        res.json({ success: true, order: orders[orderIndex] });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ success: false, error: 'Failed to update order' });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const orders = await readOrders();
        const filteredOrders = orders.filter(o => o.id !== id);
        if (orders.length === filteredOrders.length) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        await writeOrders(filteredOrders);
        io.emit('order:deleted', id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ success: false, error: 'Failed to delete order' });
    }
});

app.delete('/api/orders', async (req, res) => {
    try {
        await writeOrders([]);
        io.emit('orders:cleared');
        res.json({ success: true });
    } catch (error) {
        console.error('Error clearing orders:', error);
        res.status(500).json({ success: false, error: 'Failed to clear orders' });
    }
});

// SOCKET.IO
io.on('connection', (socket) => {
    console.log('Dashboard connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Dashboard disconnected:', socket.id);
    });
});

// ERROR HANDLING
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' });
});

// START SERVER (Only in non-Vercel environment)
if (process.env.VERCEL !== '1') {
    server.listen(PORT, () => {
        console.log(`🚀 Amora Café Backend running on port ${PORT}`);
        console.log(`📍 Café Location: ${process.env.CAFE_NAME || 'L-Axis Building'}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

module.exports = app;
