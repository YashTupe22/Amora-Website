# Amora Café — Complete Website & Ordering System

A production-ready café website with real-time order management, strict geofencing, and backend API integration.

## 🌟 Features

### Customer-Facing Features
- **Modern UI/UX**: Elegant, responsive design with smooth animations
- **Interactive Menu**: Categorized menu with veg/non-veg indicators
- **Shopping Cart**: Real-time cart with quantity management
- **Strict Geofencing**: Orders only accepted from L-Axis Building (50m radius)
- **Address Collection**: Flat number and wing name required for delivery
- **WhatsApp Integration**: Automatic order notification via WhatsApp
- **Real-time Updates**: Instant order status updates

### Admin Dashboard Features
- **Live Order Management**: Real-time order dashboard with Socket.io
- **Order Status Workflow**: New → Preparing → Ready → Delivered
- **Statistics**: Real-time stats for total, pending, and completed orders
- **Filter & Sort**: Filter by status, sort by time or value
- **Order Details**: View full order info including address and items

### Technical Features
- **Backend API**: Express.js server with REST endpoints
- **Real-time Sync**: Socket.io for bidirectional communication
- **Data Persistence**: JSON file storage with atomic writes
- **Vercel Ready**: Full deployment configuration for Vercel
- **Production Optimized**: Error handling, validation, CORS configured

## 📁 Project Structure

```
website for amora cafe/
├── backend/
│   ├── server.js           # Express server with Socket.io
│   ├── package.json        # Backend dependencies
│   ├── .env.example        # Environment variables template
│   └── data/
│       └── orders.json     # Order storage (auto-generated)
├── scripts/
│   ├── cart.js            # Cart & ordering logic with API integration
│   ├── dashboard.js       # Dashboard with real-time updates
│   └── booking.js         # Table booking functionality
├── data/
│   └── menu.json          # Menu items
├── styles/
│   ├── navbar.css         # Navigation styles
│   └── menu.css           # Menu section styles
├── Images/                # Product images
├── sections/              # Additional content sections
├── index.html            # Main website
├── order-dashboard.html  # Admin dashboard
├── style.css             # Global styles
├── script.js             # Main frontend logic
├── vercel.json           # Vercel deployment config
├── package.json          # Root package.json
├── .gitignore           # Git ignore rules
└── .vercelignore        # Vercel ignore rules
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Local Development

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on http://localhost:3001

4. **Start Frontend**
   Open `index.html` in your browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 5173
   
   # Using Node (http-server)
   npx http-server -p 5173
   ```
   Frontend runs on http://localhost:5173

5. **Open Dashboard**
   Navigate to http://localhost:5173/order-dashboard.html

## 📡 API Documentation

### Base URL
- Development: `http://localhost:3001/api`
- Production: `https://amora-cafe.vercel.app/api`

### Endpoints

#### GET /api/health
Health check endpoint
```json
{
  "status": "ok",
  "timestamp": "2026-03-26T12:00:00.000Z",
  "cafe": "L-Axis Building"
}
```

#### GET /api/orders
Get all orders
```json
{
  "success": true,
  "orders": [...]
}
```

#### POST /api/orders
Create new order
**Request Body:**
```json
{
  "items": [
    { "id": 1, "name": "Caramel Latte", "price": 225, "qty": 2 }
  ],
  "total": 450,
  "distance": 0.05,
  "address": {
    "flatNumber": "101",
    "wingName": "Wing A"
  },
  "userLocation": {
    "lat": 18.6298,
    "lng": 73.7968
  }
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order-1234567890",
    "orderNum": "A001",
    "status": "new",
    ...
  }
}
```

#### PATCH /api/orders/:id
Update order status
**Request Body:**
```json
{
  "status": "preparing"
}
```
**Valid statuses:** `new`, `preparing`, `ready`, `delivered`, `cancelled`

#### DELETE /api/orders/:id
Delete specific order

#### DELETE /api/orders
Clear all orders (admin only)

## 🔌 WebSocket Events

### Client → Server
None required (server broadcasts to all)

### Server → Client

#### `order:new`
Emitted when a new order is created
```javascript
socket.on('order:new', (order) => {
  // Handle new order
});
```

#### `order:updated`
Emitted when an order status changes
```javascript
socket.on('order:updated', (order) => {
  // Handle order update
});
```

#### `order:deleted`
Emitted when an order is deleted
```javascript
socket.on('order:deleted', (orderId) => {
  // Handle order deletion
});
```

#### `orders:cleared`
Emitted when all orders are cleared
```javascript
socket.on('orders:cleared', () => {
  // Handle clear all
});
```

## 🌍 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Café Location (L-Axis Building, PCMC, Pune)
CAFE_LAT=18.6298
CAFE_LNG=73.7968
CAFE_NAME=L-Axis Building

# Delivery Settings
MAX_DELIVERY_RADIUS_METERS=50

# WhatsApp Integration
WHATSAPP_NUMBER=91866918164

# CORS Settings (comma-separated allowed origins)
ALLOWED_ORIGINS=http://localhost:5173,https://amora-cafe.vercel.app
```

## 🚢 Deployment to Vercel

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel
```

### Step 4: Configure Environment Variables
In Vercel dashboard, add all environment variables from `.env.example`

### Step 5: Production Deployment
```bash
vercel --prod
```

## 🔒 Security Features

- **CORS Protection**: Configured allowed origins
- **Input Validation**: All API inputs validated
- **Error Handling**: Comprehensive error handling throughout
- **Location Verification**: Strict 50m geofencing for L-Axis Building
- **Address Validation**: Required flat number and wing name

## 🧪 Testing

### Test Order Flow
1. Open website at `http://localhost:5173`
2. Browse menu and add items to cart
3. Click checkout
4. Allow location (must be within 50m of L-Axis Building for production)
5. Enter flat number and wing name
6. Confirm order
7. Check dashboard at `http://localhost:5173/order-dashboard.html`
8. Update order status through workflow

### Test Real-time Sync
1. Open dashboard in one browser
2. Place order from another browser/tab
3. See order appear in dashboard instantly
4. Update status and see changes propagate

## 📱 Mobile Responsiveness

The website is fully responsive and optimized for:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🎨 Customization

### Update Menu Items
Edit `data/menu.json` with your menu items:
```json
{
  "id": 1,
  "name": "Item Name",
  "description": "Item description",
  "price": 299,
  "category": "coffee",
  "image": "Images/item.jpg",
  "isVeg": true,
  "isSpecial": false
}
```

### Update Café Location
Edit `CAFE_LAT` and `CAFE_LNG` in `.env` to your actual location

### Update WhatsApp Number
Edit `WHATSAPP_NUMBER` in `.env` with your business number

### Modify Geofence Radius
Edit `MAX_DELIVERY_RADIUS_METERS` in `.env` (default: 50m)

## 🐛 Troubleshooting

### Orders not syncing
- Check if backend server is running
- Verify Socket.io connection in browser console
- Check CORS settings in `.env`

### Location not working
- Ensure HTTPS (required for geolocation API)
- Check browser location permissions
- Verify `CAFE_LAT` and `CAFE_LNG` coordinates

### API errors
- Check backend logs
- Verify environment variables are set
- Ensure `data/` directory exists in backend

## 📝 License

MIT License - Feel free to use for your café!

## 👨‍💻 Support

For issues or questions, please check:
1. Environment variables are correctly set
2. Backend server is running
3. Browser console for errors
4. Network tab for API calls

## 🎯 Production Checklist

- [ ] Update `WHATSAPP_NUMBER` in `.env`
- [ ] Set actual `CAFE_LAT` and `CAFE_LNG` coordinates
- [ ] Add real menu items in `data/menu.json`
- [ ] Replace placeholder images with actual food photos
- [ ] Update `ALLOWED_ORIGINS` with production domain
- [ ] Test geofencing at actual location
- [ ] Verify real-time sync works
- [ ] Test on mobile devices
- [ ] Set up SSL certificate (Vercel handles this automatically)
- [ ] Configure backup strategy for `orders.json`

## 🚀 Future Enhancements

- Payment gateway integration
- Order history for customers
- Email notifications
- SMS notifications
- Analytics dashboard
- Customer reviews
- Loyalty program
- Push notifications

---

**Built with ❤️ for Amora Café**
# Amora-Website
