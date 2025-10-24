# 🚀 Render Deployment Guide - IdealFit Shopify App

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Node.js**: Version 18+ required

## 🔧 Environment Variables

These will be set automatically via `render.yaml`:
- `NODE_ENV=production`
- `SHOPIFY_ACCESS_TOKEN=your-shopify-access-token-here`
- `SHOPIFY_STORE_DOMAIN=idealfit-2.myshopify.com`

## 📦 Deployment Steps

### Step 1: Push to GitHub
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit - IdealFit Shopify App"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/ideal-fit-app.git
git push -u origin main
```

### Step 2: Connect to Render
1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `ideal-fit-app` repository

### Step 3: Configure Service
- **Name**: `ideal-fit-app`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free`

### Step 4: Deploy
1. Click "Create Web Service"
2. Render will automatically deploy your app
3. Wait for deployment to complete (2-3 minutes)

## 🌐 Post-Deployment URLs

After deployment, you'll get URLs like:
- **Main App**: `https://ideal-fit-app.onrender.com`
- **API**: `https://ideal-fit-app.onrender.com/api/shopify-rest-customers`
- **Dashboard**: `https://ideal-fit-app.onrender.com/merchant-master-dashboard-enhanced.html`
- **Health Check**: `https://ideal-fit-app.onrender.com/api/test`

## 🔄 Update Shopify App Configuration

Update `shopify.app.toml`:

```toml
application_url = "https://ideal-fit-app.onrender.com"
redirect_urls = ["https://ideal-fit-app.onrender.com/auth/callback"]
```

Then redeploy to Shopify:
```bash
shopify app deploy --force
```

## ✅ Testing Production Deployment

1. **Test Health Check**: Visit `/api/test` endpoint
2. **Test Dashboard**: Visit `/merchant-master-dashboard-enhanced.html`
3. **Test API**: Check API endpoints are working
4. **Test Shopify Integration**: Verify data loads correctly

## 🐛 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `package.json`

2. **Environment Variables**
   - Check Render dashboard → Environment
   - Verify variables are set correctly

3. **API Endpoints Not Working**
   - Check server logs in Render dashboard
   - Verify server.js is configured correctly

4. **Static Files Not Loading**
   - Ensure HTML files are in the root directory
   - Check file paths in the dashboard

## 📊 Monitoring

- **Render Dashboard**: Monitor deployments and logs
- **Health Check**: `/api/test` endpoint for status
- **Logs**: Real-time logs in Render dashboard

## 🔄 Updates

To update the deployment:
```bash
# Make changes to your code
git add .
git commit -m "Update app"
git push origin main
# Render will automatically redeploy
```

## 🎯 Production Checklist

- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables set
- [ ] Health check working
- [ ] API endpoints working
- [ ] Dashboard loads correctly
- [ ] Shopify data integration working
- [ ] Size chart functionality working
- [ ] Shopify app URLs updated
- [ ] SSL certificate active (automatic with Render)

## 💰 Pricing

- **Free Tier**: 750 hours/month
- **Sleep**: App sleeps after 15 minutes of inactivity
- **Wake Time**: ~30 seconds to wake from sleep

## 📞 Support

If you encounter issues:
1. Check Render dashboard logs
2. Verify environment variables
3. Test API endpoints directly
4. Check GitHub repository connection

## 🚀 Quick Start Commands

```bash
# 1. Initialize git
git init
git add .
git commit -m "Initial commit"

# 2. Create GitHub repo and push
# (Do this manually on GitHub)

# 3. Connect to Render
# (Do this manually on Render dashboard)

# 4. Test deployment
curl https://your-app-name.onrender.com/api/test
```