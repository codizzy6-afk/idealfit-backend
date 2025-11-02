# Complete Setup Guide: Render + PostgreSQL + Custom Domain

## 🎯 The Perfect Production Setup

```
Your App → Render Hobby → PostgreSQL → Custom Domain
✅ Professional   ✅ Persistent  ✅ Your Brand
```

---

## 📋 Step-by-Step Setup

### Step 1: Upgrade Render Services

#### 1.1: Upgrade Web Service to Hobby
1. Go to Render Dashboard
2. Click on your web service
3. Go to Settings → Plan
4. Select "Hobby" plan ($7/month)
5. Click "Update Plan"
6. ✅ **DONE!**

#### 1.2: Create PostgreSQL Database
1. In Render Dashboard, click "New" → "PostgreSQL"
2. Fill in:
   - **Name:** `idealfit-db`
   - **Database:** `idealfit_production`
   - **User:** `idealfit_user`
   - **Region:** Choose closest to you
   - **Plan:** Starter ($7/month)
3. Click "Create Database"
4. ✅ **DONE!**

#### 1.3: Get Database Connection String
1. Click on your new PostgreSQL database
2. Go to "Connections" tab
3. Copy the "Internal Database URL"
   - Looks like: `postgresql://user:pass@host:5432/dbname`
4. ⚠️ **KEEP THIS SECRET!**

---

### Step 2: Update Your App Configuration

#### 2.1: Update Prisma Schema
Edit `ideal-fit/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

#### 2.2: Create Migration
Run locally first to test:

```bash
cd "D:\ideal fit\ideal-fit"
npx prisma migrate dev --name migrate_to_postgresql
```

#### 2.3: Update render.yaml
Edit `ideal-fit/render.yaml`:

```yaml
services:
  - type: web
    name: ideal-fit-app1
    env: node
    plan: hobby  # Changed from free
    rootDir: ideal-fit
    buildCommand: echo "=== BUILD COMMAND START ===" && pwd && ls -la && npm install && mkdir -p data && npm run setup && npm run build && echo "=== BUILD COMPLETE ===" && ls -la && find . -name "build" -type d
    startCommand: node build/server/index.js
    envVars:
      - key: NODE_ENV
        value: production
      # Remove SQLite URL:
      # - key: DATABASE_URL
      #   value: file:./data/prod.sqlite
      # Use PostgreSQL instead:
      - key: DATABASE_URL
        value: ${idealfit-db.DATABASE_URL}  # Reference your PostgreSQL DB
      - key: SHOPIFY_API_KEY
        value: df65d05c59fdde03db6cad23f63bb6e7
      - key: SCOPES
        value: write_products,read_products,read_orders,read_customers
      - key: SHOPIFY_APP_URL
        value: https://idealfit.com  # Your custom domain!
      - key: SHOPIFY_API_SECRET
        sync: false
      - key: SHOPIFY_ACCESS_TOKEN
        sync: false
      - key: SHOPIFY_STORE
        sync: false
    healthCheckPath: /
```

#### 2.4: Commit Changes
```bash
git add .
git commit -m "Migrate to PostgreSQL and custom domain"
git push
```

---

### Step 3: Buy and Configure Custom Domain

#### 3.1: Buy Domain
**Recommend:** Cloudflare (cheapest)

1. Go to https://www.cloudflare.com/products/registrar/
2. Search for `idealfit.com`
3. Buy (~$8-10/year)
4. ✅ **DONE!**

**Alternatives:**
- Namecheap (~$12/year)
- Google Domains (~$12/year)

#### 3.2: Connect Domain to Render
1. In Render Dashboard → Your Web Service
2. Go to Settings → Custom Domains
3. Click "Add Custom Domain"
4. Enter: `idealfit.com`
5. Click "Save"

Render shows you DNS records like:
```
Type: CNAME
Name: @
Value: ideal-fit-app1.onrender.com

Type: A
Name: @
Value: 76.76.21.21
```

#### 3.3: Add DNS Records to Domain
1. Go to Cloudflare (or your registrar)
2. DNS → Manage DNS
3. Add CNAME record:
   - Type: CNAME
   - Name: @
   - Target: `ideal-fit-app1.onrender.com`
   - Proxy: OFF (gray cloud)
4. Add A record:
   - Type: A
   - Name: @
   - Content: `76.76.21.21`
   - Proxy: OFF
5. ✅ **DONE!**

**Wait 5-10 minutes** for DNS propagation.

---

### Step 4: Update Shopify App

#### 4.1: Update App URL in Shopify Partners
1. Go to https://partners.shopify.com
2. Your App → App Setup
3. Update URLs:
   - **App URL:** `https://idealfit.com`
   - **Allowed redirection URL(s):** `https://idealfit.com/auth/callback`
4. Save

#### 4.2: Update Render Environment Variable
1. In Render Dashboard → Your Web Service
2. Environment → Edit
3. Update:
   - `SHOPIFY_APP_URL` → `https://idealfit.com`
4. Save

---

### Step 5: Test Everything

#### 5.1: Test Database
```bash
# SSH into Render and check:
psql $DATABASE_URL
\dt  # Should show your tables
\q
```

#### 5.2: Test Custom Domain
Visit: `https://idealfit.com`
Should load your app!

#### 5.3: Test Full Flow
1. Visit: `https://idealfit.com`
2. Try login
3. Create size chart
4. Reload → Data persists! ✅

---

## ✅ Checklist

### Before App Store Submission:
- [ ] Render Hobby plan ($7/month web)
- [ ] PostgreSQL database ($7/month)
- [ ] Custom domain purchased
- [ ] Domain connected to Render
- [ ] DNS records configured
- [ ] HTTPS working (automatic)
- [ ] Prisma schema updated to PostgreSQL
- [ ] Database migrations ran
- [ ] Shopify app URL updated
- [ ] App tested on production
- [ ] Data persists across restarts ✅

---

## 💰 Total Cost

```
Render Web Service (Hobby):     $7/month
PostgreSQL Database:            $7/month
Custom Domain (idealfit.com):   ~$10/year
─────────────────────────────────────────
TOTAL:                          ~$15/month
                                ~$180/year
```

**vs Current Free Tier:**
- Free tier: $0/month but data deletes ❌
- Production: $15/month but data persists ✅

---

## 🚀 Benefits of This Setup

### ✅ Professional
- Custom domain looks polished
- App store approved
- Merchant trust

### ✅ Persistent
- PostgreSQL stores data
- Survives redeploys
- Backup included

### ✅ Scalable
- Auto-scaling on Render
- Handles traffic spikes
- 500GB bandwidth included

### ✅ Production-Ready
- HTTPS/SSL included
- Team collaboration
- Preview environments
- Chat support

---

## ⚠️ Important Notes

### Database Backups
Render PostgreSQL includes **daily backups** automatically!

### Environment Variables
**Never commit secrets** to Git:
- ✅ Safe in Render dashboard
- ❌ Don't add to code

### Migration Strategy
1. Test PostgreSQL migration **locally first**
2. Then deploy to Render
3. Render runs `npm run setup` which includes migrations

### Rollback Plan
If something breaks:
1. Revert Git commit
2. Redeploy
3. Or use Render's "Manual Deploy" → pick previous version

---

## 🆘 Troubleshooting

### Problem: Domain not working
**Fix:** Wait 10 minutes, check DNS records, clear browser cache

### Problem: Database connection failed
**Fix:** Check environment variable `DATABASE_URL` in Render dashboard

### Problem: 502 Bad Gateway
**Fix:** Check build logs, ensure migrations ran successfully

### Problem: Data not persisting
**Fix:** Verify PostgreSQL is connected, not SQLite

---

## 📞 Need Help?

Common issues:
1. DNS not propagating → Wait longer
2. Database connection → Check env vars
3. Build failing → Check logs
4. Domain not HTTPS → Wait for SSL (automatic)

---

## ✅ Ready?

Your production setup:
```
✅ Render Hobby ($7/month)
✅ PostgreSQL ($7/month)
✅ idealfit.com ($10/year)
────────────────────────
🎯 Production-ready for $15/month!
```

**Next:** Deploy and submit to Shopify App Store! 🚀

---

## 🎉 What You've Achieved

- ✅ Professional hosting
- ✅ Persistent database
- ✅ Custom domain
- ✅ App store ready
- ✅ Production-ready

**You're ready to launch and accept paying customers!** 🎊

