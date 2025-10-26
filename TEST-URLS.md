# Test URLs and Troubleshooting

## Available URLs

### 1. Login Page
**URL:** `https://ideal-fit-app1.onrender.com/login.html`

**Expected:** Login form with username, password fields

**Troubleshooting if you see dashboard:**
- Clear browser localStorage: Press F12 → Console → Type: `localStorage.clear()`
- Refresh the page

### 2. Create Merchant Account
**URL:** `https://ideal-fit-app1.onrender.com/create-merchant.html`

**Expected:** Registration form

**Usage:**
1. Shop Domain: `idealfit-2.myshopify.com`
2. Username: `yourusername`
3. Password: `YourPassword123!`
4. Email: `your@email.com`
5. Click "Create Account"

### 3. Test Page
**URL:** `https://ideal-fit-app1.onrender.com/test.html`

**Expected:** Page showing "Static Files Are Working!"

### 4. Dashboard
**URL:** `https://ideal-fit-app1.onrender.com/merchant-dashboard-fixed.html`

**Note:** This requires login first

## Quick Test Steps

1. **Clear localStorage:**
   ```javascript
   localStorage.clear()
   ```

2. **Go to login page:**
   ```
   https://ideal-fit-app1.onrender.com/login.html
   ```

3. **Login as Guest (temporary):**
   - Click "Continue as Guest"
   - This should show the dashboard

4. **Or create an account:**
   - Go to `https://ideal-fit-app1.onrender.com/create-merchant.html`
   - Fill in the form
   - Then login at `https://ideal-fit-app1.onrender.com/login.html`

## Current Status

- ✅ Login page is working
- ⚠️ Static HTML routes may not be deployed yet (wait 2-3 minutes)
- ✅ Guest login works
- ✅ Dashboard loads data from Shopify

## If Pages Still Show 404

Wait 3-5 minutes for Render to redeploy, then try again.

## If Still Not Working

1. Check the URL is exactly as shown above
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try in incognito/private window
4. Check Render dashboard for deployment status
