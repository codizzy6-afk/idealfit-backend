# Check Environment Variables in Render

## 🚨 Critical Fix for "accounts.shopify.com refused to connect"

The `render.yaml` has `sync: false` which means these variables need to be **manually added** in Render dashboard:

```
SHOPIFY_API_SECRET
SHOPIFY_ACCESS_TOKEN
SHOPIFY_STORE
```

---

## ✅ How to Fix Now

### Step 1: Go to Render Dashboard
1. Visit https://dashboard.render.com
2. Click on your service: **ideal-fit-app1**
3. Click **"Environment"** tab (left sidebar)

### Step 2: Add Missing Variables

Look for these variables and **add them if missing**:

```bash
SHOPIFY_API_KEY=df65d05c59fdde03db6cad23f63bb6e7
SHOPIFY_API_SECRET=<YOUR_SECRET_HERE>  # ⚠️ MUST BE ADDED!
SHOPIFY_APP_URL=https://ideal-fit-app1.onrender.com
DATABASE_URL=file:./data/prod.sqlite
SCOPES=write_products,read_products,read_orders,read_customers
NODE_ENV=production
```

### Step 3: Get Your API Secret

1. Go to https://partners.shopify.com
2. Your app → **App setup**
3. Scroll to **"Client credentials"**
4. Click **"Reveal"** next to API secret
5. Copy it

### Step 4: Add to Render

1. In Render Environment tab
2. Click **"Add Environment Variable"**
3. Key: `SHOPIFY_API_SECRET`
4. Value: Paste your secret
5. Click **"Save Changes"**

Render will **automatically redeploy** your service.

---

## 🔍 Current Status

Check which variables are set:

**Should be there:**
- ✅ `SHOPIFY_API_KEY`
- ✅ `SHOPIFY_APP_URL`
- ✅ `DATABASE_URL`
- ✅ `SCOPES`
- ✅ `NODE_ENV`

**Probably missing (causes the error):**
- ❌ `SHOPIFY_API_SECRET` ← **THIS ONE!**

**Optional (not needed yet):**
- `SHOPIFY_ACCESS_TOKEN` (set by OAuth)
- `SHOPIFY_STORE` (set by OAuth)

---

## ✅ After Adding SHOPIFY_API_SECRET

1. Wait for Render to redeploy (2-3 minutes)
2. Clear browser cache
3. Try logging in again
4. Should work! ✅

---

## 🎯 Quick Test

After adding the variable:

1. Visit: https://ideal-fit-app1.onrender.com
2. You should see the login form or dashboard
3. If you see an error, check Render logs

---

## 📞 Still Not Working?

Check Render logs for specific errors:

1. Render dashboard → Your service → **Logs** tab
2. Look for:
   - `SHOPIFY_API_SECRET is not defined`
   - `Missing environment variable`
   - OAuth errors

Share the error and I'll help debug!

---

**TL;DR: Add `SHOPIFY_API_SECRET` to Render environment variables. That's 99% the issue!** 🎯

