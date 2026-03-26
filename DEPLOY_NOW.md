# 🔴 URGENT: Vercel Deployment Steps

## The Issue
Your Vercel deployment is showing 404 because of configuration issues. I've just pushed fixes to GitHub.

## ✅ What I Fixed (Just Now)
1. ✅ Added dependencies to root `package.json` 
2. ✅ Simplified `vercel.json` routing
3. ✅ Set correct main entry point
4. ✅ Added `vercel-build` script
5. ✅ Pushed to GitHub (commit: 01e59cf)

## 🚀 DEPLOY NOW - Follow These Steps

### Option 1: Redeploy from Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Find your project "Amora-Website"
3. Click on it
4. Go to "Deployments" tab
5. Click the 3 dots (•••) on the latest deployment
6. Click "Redeploy"
7. Make sure "Use existing Build Cache" is **UNCHECKED**
8. Click "Redeploy"

### Option 2: Trigger New Deployment

1. Go to https://vercel.com/dashboard
2. Find your project
3. Go to "Settings" → "Git"
4. Make sure it's connected to `YashTupe22/Amora-Website`
5. Go back to "Deployments"
6. It should auto-deploy the latest commit

### Option 3: Force Deploy via CLI

```bash
# From your project folder
cd "C:\Users\Yash\Downloads\website for amora cafe\website for amora cafe"

# Force a new deployment
vercel --prod --force
```

## ⚙️ IMPORTANT: Environment Variables

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

```
PORT=3001
NODE_ENV=production
CAFE_LAT=18.6298
CAFE_LNG=73.7968
CAFE_NAME=L-Axis Building
MAX_DELIVERY_RADIUS_METERS=50
WHATSAPP_NUMBER=919876543210
ALLOWED_ORIGINS=https://your-actual-domain.vercel.app
```

**⚠️ Replace `https://your-actual-domain.vercel.app` with your actual Vercel URL!**

For example, if your URL is `amora-website-fqj8q1vsg-yashtupe22s-projects.vercel.app`, use that.

Or better yet, use: `*` (allows all origins) for now, then restrict later.

## 🧪 After Deployment - Test These URLs

Replace `your-domain.vercel.app` with your actual Vercel domain:

1. **Homepage:**  
   `https://your-domain.vercel.app/`  
   Should show: Amora Café website

2. **Health Check:**  
   `https://your-domain.vercel.app/api/health`  
   Should show: `{"status":"ok","timestamp":"...","cafe":"L-Axis Building"}`

3. **Dashboard:**  
   `https://your-domain.vercel.app/order-dashboard`  
   Should show: Order dashboard

## 🔍 Troubleshooting

### Still Getting 404?

1. **Check Build Logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on the latest deployment
   - Check "Build Logs" tab for errors

2. **Check Function Logs:**
   - Click on "Functions" tab
   - Look for any errors in `/api/index.js`

3. **Verify Files Deployed:**
   - In Deployment details
   - Look at "Source" tab
   - Make sure `index.html`, `api/index.js` exist

### API Not Working?

1. Check environment variables are set
2. Check `ALLOWED_ORIGINS` includes your Vercel domain
3. Look at Function logs for errors

### Build Failed?

If build fails with npm errors:
1. Vercel needs dependencies in root `package.json` ✅ (I just added this)
2. Make sure `vercel-build` script exists ✅ (I just added this)

## 📞 Quick Fix Commands

If you have Vercel CLI installed:

```bash
# Check deployment status
vercel ls

# Force redeploy
vercel --prod --force

# Check logs
vercel logs
```

## ✅ Success Checklist

- [ ] Pushed latest changes to GitHub (Done: commit 01e59cf)
- [ ] Redeployed on Vercel (DO THIS NOW)
- [ ] Environment variables are set
- [ ] ALLOWED_ORIGINS includes your domain
- [ ] Tested homepage loads
- [ ] Tested /api/health works
- [ ] Tested dashboard loads

## 🎯 Expected Result

After redeployment:
- Homepage should load perfectly
- Menu should display
- Cart should work
- API endpoints should respond
- Dashboard should load

**DO THE REDEPLOY NOW AND LET ME KNOW THE RESULT!**
