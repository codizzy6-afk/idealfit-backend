# 🚀 Manual OAuth Flow - Get Real Shopify Data

## **Problem Identified**
The OAuth URL is returning `400 Bad Request` because:
1. The Shopify Partners app isn't properly configured
2. The client secret is missing or incorrect
3. The redirect URI doesn't match what's registered

## **Solution: Manual OAuth Flow**

### **Step 1: Create Shopify Private App**

1. **Go to your Shopify Admin**: `https://idealfit-2.myshopify.com/admin`
2. **Navigate to**: Settings → Apps and sales channels
3. **Click**: "Develop apps" → "Create an app"
4. **App Name**: "IdealFit API"
5. **App URL**: `http://localhost:3001`
6. **Allowed redirection URL(s)**: `http://localhost:3001/auth/callback`

### **Step 2: Configure API Access**

1. **In your app settings**, go to "Configuration"
2. **Enable the following scopes**:
   - `read_products`
   - `read_orders` 
   - `read_customers`
   - `write_customers`
3. **Save the configuration**

### **Step 3: Get Admin API Access Token**

1. **Go to**: "API credentials" tab
2. **Click**: "Install app" 
3. **Copy the Admin API access token**
4. **This is your access token!**

### **Step 4: Set Environment Variable**

```bash
export SHOPIFY_ACCESS_TOKEN="your-admin-api-access-token"
```

### **Step 5: Restart Server**

```bash
cd "d:\ideal fit\ideal-fit"
node server.js
```

### **Step 6: Test Real Data**

```bash
# Test customers
curl "http://localhost:3001/api/shopify-rest-customers?limit=5"

# Test analytics  
curl "http://localhost:3001/api/shopify-rest-analytics?period=30d"
```

## **Alternative: Use Existing App**

If you already have a Shopify app:

### **Step 1: Get Access Token from Existing App**

1. **Go to**: Shopify Partners Dashboard
2. **Find your app**: "IdealFit" or similar
3. **Go to**: App setup → App URLs
4. **Copy the Admin API access token**

### **Step 2: Set Environment Variable**

```bash
export SHOPIFY_ACCESS_TOKEN="your-existing-access-token"
```

### **Step 3: Restart and Test**

```bash
node server.js
curl "http://localhost:3001/api/shopify-rest-customers?limit=5"
```

## **Quick Test Commands**

```bash
# Check current status
curl "http://localhost:3001/auth/status"

# Test with fallback data
curl "http://localhost:3001/api/shopify-rest-customers?limit=5"

# Open dashboard
start http://localhost:8080/merchant-master-dashboard-enhanced.html
```

## **Expected Results**

### **Before Access Token (Current)**
```json
{
  "success": true,
  "data": [...],
  "fallback": true,
  "message": "Using fallback data - Shopify REST API unavailable"
}
```

### **After Access Token (Real Data)**
```json
{
  "success": true,
  "data": [...],
  "fallback": false,
  "message": "Data fetched from Shopify REST API"
}
```

## **Troubleshooting**

### **If Still Getting 401 Unauthorized**
- Verify the access token is correct
- Check if the token has the required scopes
- Ensure the token hasn't expired

### **If Getting 403 Forbidden**
- The token doesn't have the required permissions
- Re-install the app with correct scopes

### **If Getting 429 Rate Limited**
- Shopify API has rate limits
- Wait a few minutes and try again

## **What You'll Get**

### **Real Customer Data**
- ✅ Actual customer names from your store
- ✅ Real email addresses and phone numbers
- ✅ Live order history and purchase data
- ✅ Current customer statistics

### **Real Analytics**
- ✅ Actual order counts from your store
- ✅ Real revenue data and sales metrics
- ✅ Live customer insights and trends
- ✅ Actual size distribution from real orders

### **Live Dashboard**
- ✅ Real-time data updates from Shopify
- ✅ Actual customer database
- ✅ Accurate analytics based on real sales
- ✅ Size recommendations from real measurements

---

**🎯 Create a Shopify Private App to get real customer data!**
