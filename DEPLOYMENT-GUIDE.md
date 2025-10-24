# 🚀 Vercel Deployment Guide - IdealFit Shopify App

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```
3. **Node.js**: Version 18+ required

## 🔧 Environment Variables

Set these in Vercel dashboard or via CLI:

```bash
# Shopify Access Token
SHOPIFY_ACCESS_TOKEN=your-shopify-access-token-here

# Shopify Store Domain
SHOPIFY_STORE_DOMAIN=idealfit-2.myshopify.com

# Environment
NODE_ENV=production
```

## 📦 Deployment Steps

### Step 1: Login to Vercel
```bash
vercel login
```

### Step 2: Deploy from Project Directory
```bash
cd "d:\ideal fit\ideal-fit"
vercel --prod
```

### Step 3: Set Environment Variables
```bash
vercel env add SHOPIFY_ACCESS_TOKEN
# Enter: your-shopify-access-token-here

vercel env add SHOPIFY_STORE_DOMAIN
# Enter: idealfit-2.myshopify.com

vercel env add NODE_ENV
# Enter: production
```

### Step 4: Redeploy with Environment Variables
```bash
vercel --prod
```

## 🌐 Post-Deployment URLs

After deployment, you'll get URLs like:
- **Dashboard**: `https://your-app-name.vercel.app/merchant-master-dashboard-enhanced.html`
- **API**: `https://your-app-name.vercel.app/api/shopify-rest-customers`
- **Company Admin**: `https://your-app-name.vercel.app/company-admin-dashboard.html`

## 🔄 Update Shopify App Configuration

Update `shopify.app.toml`:

```toml
application_url = "https://your-app-name.vercel.app"
redirect_urls = ["https://your-app-name.vercel.app/auth/callback"]
```

Then redeploy to Shopify:
```bash
shopify app deploy --force
```

## ✅ Testing Production Deployment

1. **Test Dashboard**: Visit your Vercel URL
2. **Test API**: Check API endpoints are working
3. **Test Shopify Integration**: Verify data loads correctly
4. **Test Size Chart**: Ensure size recommendations work

## 🐛 Troubleshooting

### Common Issues:

1. **Environment Variables Not Set**
   - Check Vercel dashboard → Settings → Environment Variables
   - Redeploy after adding variables

2. **API Endpoints Not Working**
   - Check server logs in Vercel dashboard
   - Verify environment variables are set

3. **CORS Issues**
   - Already handled in server.js with CORS middleware

4. **Static Files Not Loading**
   - Check vercel.json routes configuration
   - Ensure files are in correct directories

## 📊 Monitoring

- **Vercel Dashboard**: Monitor deployments and logs
- **Analytics**: Track usage and performance
- **Functions**: Monitor serverless function execution

## 🔄 Updates

To update the deployment:
```bash
# Make changes to your code
git add .
git commit -m "Update app"
vercel --prod
```

## 🎯 Production Checklist

- [ ] Environment variables set
- [ ] API endpoints working
- [ ] Dashboard loads correctly
- [ ] Shopify data integration working
- [ ] Size chart functionality working
- [ ] Shopify app URLs updated
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Custom domain configured (optional)

## 📞 Support

If you encounter issues:
1. Check Vercel dashboard logs
2. Verify environment variables
3. Test API endpoints directly
4. Check Shopify app configuration