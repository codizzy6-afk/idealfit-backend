# Fix: "accounts.shopify.com refused to connect" Error

## 🐛 Problem

When logging into the Shopify app, you see:
```
accounts.shopify.com refused to connect
```

This happens when there's an OAuth redirect issue or iframe blocking.

---

## 🔍 Root Cause

This error occurs because:
1. App is trying to embed Shopify's accounts page in an iframe
2. Shopify blocks iframe embedding for security
3. OAuth flow redirects incorrectly

---

## ✅ Solutions

### Solution 1: Check Your App Settings (Most Likely Fix)

#### 1.1: Verify App URL in Shopify Partners
1. Go to https://partners.shopify.com
2. Click your app: **"IdealFit - Size Recommendation"**
3. Go to **"App setup"**
4. Check **"App URL":**
   - Should be: `https://ideal-fit-app1.onrender.com`
   - Should NOT include path

5. Check **"Allowed redirection URL(s)":**
   - Should include: `https://ideal-fit-app1.onrender.com/auth/callback`

#### 1.2: Check Embedded App Settings
1. In App setup, scroll to **"App bridge"**
2. Make sure **"Embed this app in the Shopify admin"** is checked
3. Save

#### 1.3: Check API Credentials
1. In App setup → **"Client credentials"**
2. Verify:
   - API key matches `shopify.app.toml`
   - API secret is set in Render environment variables

---

### Solution 2: Update Environment Variables

Make sure Render has all required variables:

```bash
SHOPIFY_API_KEY=df65d05c59fdde03db6cad23f63bb6e7
SHOPIFY_API_SECRET=<your_secret>
SHOPIFY_APP_URL=https://ideal-fit-app1.onrender.com
```

**To add in Render:**
1. Go to Render dashboard
2. Your web service → **Environment** tab
3. Add/verify these variables
4. Click **"Save Changes"**
5. Service will restart

---

### Solution 3: Test OAuth Flow Directly

Try installing the app fresh:

1. **Uninstall the app** from your test store
2. **Reinstall** the app from your app listing
3. This triggers a fresh OAuth flow

Should work correctly now.

---

### Solution 4: Check Browser Console

Open browser developer tools (F12):
1. Go to Network tab
2. Try to log in
3. Look for failed requests
4. Check for CORS or iframe errors

Common errors:
- `X-Frame-Options: DENY` → Iframe blocking
- `CORS error` → Cross-origin issue
- `401 Unauthorized` → Auth credentials wrong

---

### Solution 5: Verify shopify.app.toml

Make sure your config matches:

```toml
embedded = true  # Should be true for embedded apps
application_url = "https://ideal-fit-app1.onrender.com"
redirect_urls = [ "https://ideal-fit-app1.onrender.com/auth/callback" ]
```

---

### Solution 6: Hard Refresh

Sometimes it's just a cached issue:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Try logging in again

---

## 🔧 Quick Fix Checklist

Run through these in order:

- [ ] App URL in Partners matches production URL
- [ ] Environment variables set in Render
- [ ] Reinstalled app in test store
- [ ] Cleared browser cache
- [ ] Checked browser console for errors
- [ ] Verified `shopify.app.toml` config

---

## 🚨 Still Not Working?

### Try This Debug Flow:

1. **Create new test store** (if current one is broken)
2. **Install your app** from scratch
3. **Check OAuth callback** is working

### Check Render Logs:

1. Go to Render dashboard
2. Web service → **Logs** tab
3. Look for OAuth errors during login
4. Share error message for debugging

---

## 📝 Common Scenarios

### Scenario 1: First Time Installing
**Error:** Can't connect to accounts.shopify.com

**Fix:** This is normal during OAuth flow. Let it redirect.

### Scenario 2: Already Installed
**Error:** Keeps hitting accounts.shopify.com error

**Fix:** Uninstall → Reinstall the app

### Scenario 3: Recent Deployment
**Error:** Started after code push

**Fix:** Verify environment variables are set

### Scenario 4: Wrong URL
**Error:** All the time

**Fix:** Update App URL in Partners dashboard

---

## ✅ Working Flow Should Be

```
1. Merchant clicks "Install app" in Shopify admin
2. Redirects to: https://ideal-fit-app1.onrender.com/auth
3. Redirects to: Shopify OAuth (accounts.shopify.com)
4. Merchant approves
5. Redirects back to: https://ideal-fit-app1.onrender.com/auth/callback
6. Your app handles the token
7. Redirects to: /app (your dashboard)
8. ✅ DONE!
```

If step 3 fails, you'll see "refused to connect" error.

---

## 🎯 Most Likely Cause

**95% chance:** Missing `SHOPIFY_API_SECRET` in Render environment variables.

**Fix:** Add it in Render dashboard → Environment → Add Variable

---

## 📞 Still Stuck?

Share:
1. Browser console errors (F12 → Console)
2. Render logs (Render dashboard → Logs)
3. Screenshot of error
4. When it started happening

Then I can help debug further!

---

## 🔗 Helpful Links

- Shopify OAuth docs: https://shopify.dev/docs/apps/auth/oauth
- App Bridge docs: https://shopify.dev/docs/apps/tools/app-bridge
- Your app settings: https://partners.shopify.com

---

**TL;DR:** Check environment variables in Render, especially `SHOPIFY_API_SECRET`. Most common fix!

