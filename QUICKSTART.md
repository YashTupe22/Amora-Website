# 🚀 Quick Start Guide - Amora Café

## Local Development Setup (5 minutes)

### 1. Start Backend Server
```bash
# Open terminal in project root
cd "website for amora cafe\backend"
npm start
```
✅ Backend running on http://localhost:3001

### 2. Start Frontend
```bash
# Open new terminal in project root
python -m http.server 5173
# OR use any local server
```
✅ Website running on http://localhost:5173

### 3. Test the System
1. **Open Website**: http://localhost:5173
2. **Add items to cart** from menu
3. **Click Checkout**
4. **Allow location** (will fail if not at L-Axis Building - this is expected!)
5. **For testing**: Temporarily change `MAX_DELIVERY_RADIUS_M` to a larger value like 5000 in `scripts/cart.js`

6. **Open Dashboard**: http://localhost:5173/order-dashboard.html
7. **See orders appear** in real-time!

## Production Deployment to Vercel

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

### Option 2: GitHub Integration
1. Push code to GitHub repository
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repository
5. Configure environment variables (copy from backend/.env.example)
6. Deploy!

## Important: Environment Variables on Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```
PORT=3001
NODE_ENV=production
CAFE_LAT=18.6298
CAFE_LNG=73.7968
CAFE_NAME=L-Axis Building
MAX_DELIVERY_RADIUS_METERS=50
WHATSAPP_NUMBER=919876543210
ALLOWED_ORIGINS=https://your-domain.vercel.app
```

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend loads properly
- [ ] Menu items display correctly
- [ ] Cart functionality works
- [ ] Location check works (or fails appropriately)
- [ ] Address modal appears after location approval
- [ ] Order submits successfully
- [ ] Dashboard receives order in real-time
- [ ] Order status updates work
- [ ] WhatsApp notification link works

## Common Issues & Solutions

### ❌ "Location check fails"
- **Normal** if not at L-Axis Building
- For testing, increase radius in cart.js or use actual coordinates

### ❌ "Backend won't start"
- Check if port 3001 is available
- Verify `.env` file exists in backend folder
- Run `npm install` in backend folder

### ❌ "Orders not syncing"
- Check backend server is running
- Open browser console for errors
- Verify Socket.io connection

### ❌ "API calls fail"
- Check CORS settings in backend/.env
- Verify API_BASE URL in cart.js and dashboard.js matches your backend

## File Structure Quick Reference

```
Root/
├── backend/           ← Express server + Socket.io
├── scripts/           ← Frontend logic (cart, dashboard)
├── data/              ← Menu JSON
├── index.html         ← Main website
├── order-dashboard.html ← Admin dashboard
└── README.md          ← Full documentation
```

## Next Steps

1. ✅ **Update menu**: Edit `data/menu.json`
2. ✅ **Add real images**: Replace images in `Images/` folder
3. ✅ **Set real location**: Update coordinates in `backend/.env`
4. ✅ **Update WhatsApp**: Change number in `backend/.env`
5. ✅ **Test at location**: Verify geofencing works at L-Axis Building
6. ✅ **Deploy**: Push to Vercel for production

## Support

- 📖 Full documentation: See README.md
- 🐛 Issues: Check browser console and backend logs
- 💬 Questions: Review API documentation in README.md

---

**Ready to go? Start with step 1 above! 🎉**
