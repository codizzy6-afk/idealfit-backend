# Add Missing Environment Variables to Render

## 🚨 Missing Variables Causing Error

You have:
- ✅ `SHOPIFY_API_SECRET` 
- ✅ `SHOPIFY_ACCESS_TOKEN`
- ✅ `SHOPIFY_STORE_DOMAIN`

**But you need:**
- ❌ `SHOPIFY_API_KEY` (MISSING!)
- ❌ `SCOPES` (MISSING!)
- ❌ `SHOPIFY_APP_URL` (MISSING!)

---

## ✅ Quick Fix

### Go to Render Dashboard → Environment Tab

### Add These Variables:

#### 1. SHOPIFY_API_KEY
```
Key: SHOPIFY_API_KEY
Value: df65d05c59fdde03db6cad23f63bb6e7
```

#### 2. SCOPES
```
Key: SCOPES
Value: write_products,read_products,read_orders,read_customers
```

#### 3. SHOPIFY_APP_URL
```
Key: SHOPIFY_APP_URL
Value: https://ideal-fit-app1.onrender.com
```

#### 4. DATABASE_URL
```
Key: DATABASE_URL
Value: file:./data/prod.sqlite
```

---

## 📋 Complete Environment Variables List

Add all of these to Render:

```
NODE_ENV = production

DATABASE_URL = file:./data/prod.sqlite

SHOPIFY_API_KEY = df65d05c59fdde03db6cad23f63bb6e7

SHOPIFY_API_SECRET = <YOUR_SECRET_HERE>

SCOPES = write_products,read_products,read_orders,read_customers

SHOPIFY_APP_URL = https://ideal-fit-app1.onrender.com

SHOPIFY_ACCESS_TOKEN = (already set)

RAZORPAY_KEY_ID = (already set)

RAZORPAY_KEY_SECRET = (already set)
```

---

## 🎯 Why These Are Critical

Your code checks for these:
```typescript
SHOPIFY_API_KEY: Required for OAuth
SHOPIFY_API_SECRET: Required for OAuth  
SCOPES: Required for API permissions
SHOPIFY_APP_URL: Required for redirects
DATABASE_URL: Required for database
```

**Without them, OAuth flow fails!**

---

## ✅ After Adding

1. Click **"Save Changes"** in Render
2. Service will **auto-redeploy** (2-3 minutes)
3. Try logging in again
4. Should work! ✅

---

## 🔍 Verify They're Set

After redeploy, check Render logs:

1. Go to **Logs** tab
2. Look for:
   ```
   Environment variables:
   SHOPIFY_API_KEY: SET
   SHOPIFY_API_SECRET: SET
   SHOPIFY_APP_URL: https://ideal-fit-app1.onrender.com
   SCOPES: write_products,read_products,read_orders,read_customers
   ```

If you see "NOT SET" → Variable is missing!

---

**TL;DR: Add SHOPIFY_API_KEY, SCOPES, SHOPIFY_APP_URL to Render environment. That will fix the OAuth error!** 🎯

