# 🚀 Get Real Shopify Customer Data - Step by Step Guide

## **Problem Solved**
You're getting `401 Unauthorized` errors because the app needs a valid Shopify access token to fetch real customer data.

## **Quick Solution**

### **Step 1: Open OAuth Setup Page**
1. Open your browser and go to: `http://localhost:8080/shopify-oauth-setup.html`
2. This page will guide you through the entire OAuth process

### **Step 2: Complete OAuth Flow**
1. **Click "Get Authorization URL"** - This generates the Shopify authorization URL
2. **Click "Authorize App in Shopify"** - This opens Shopify where you'll log in
3. **Log in to your Shopify store** - Use your store credentials
4. **Authorize the app** - Grant the required permissions
5. **Copy the authorization code** - From the callback page
6. **Paste the code** - In the setup page and click "Exchange for Access Token"
7. **Copy the access token** - You'll get a real Shopify access token

### **Step 3: Set Environment Variable**
1. **Copy the access token** from the setup page
2. **Open a new terminal** and run:
   ```bash
   export SHOPIFY_ACCESS_TOKEN="your-access-token-here"
   ```
3. **Restart the server**:
   ```bash
   cd "d:\ideal fit\ideal-fit"
   node server.js
   ```

### **Step 4: Test Real Data**
1. **Test the endpoints** using the setup page
2. **Open the merchant dashboard**: `http://localhost:8080/merchant-master-dashboard-enhanced.html`
3. **Check the console** - You should see "✅ Using Shopify REST API analytics data"
4. **Verify customer data** - Real Shopify customers should appear

## **Alternative: Manual OAuth Flow**

If you prefer to do it manually:

### **Step 1: Get Authorization URL**
```bash
curl "http://localhost:3001/auth/shopify"
```

### **Step 2: Authorize in Shopify**
1. Copy the `authUrl` from the response
2. Open it in your browser
3. Log in to Shopify and authorize the app
4. Copy the authorization code from the callback URL

### **Step 3: Exchange Code for Token**
```bash
curl -X POST http://localhost:3001/auth/exchange \
  -H "Content-Type: application/json" \
  -d '{"code": "your-authorization-code"}'
```

### **Step 4: Set Environment Variable**
```bash
export SHOPIFY_ACCESS_TOKEN="your-access-token"
node server.js
```

## **What You'll Get**

Once you have a valid access token:

### **Real Customer Data**
- ✅ **Real customer names** from your Shopify store
- ✅ **Real email addresses** and phone numbers
- ✅ **Real order history** and purchase data
- ✅ **Real customer statistics** and analytics

### **Real Analytics Data**
- ✅ **Actual order counts** from your store
- ✅ **Real revenue data** and sales metrics
- ✅ **Live customer insights** and trends
- ✅ **Actual size distribution** from real orders

### **Dashboard Features**
- ✅ **Live data updates** from your Shopify store
- ✅ **Real customer database** with actual customers
- ✅ **Accurate analytics** based on real sales data
- ✅ **Size recommendations** from real customer measurements

## **Troubleshooting**

### **Common Issues**

1. **"401 Unauthorized"**
   - **Solution**: Complete the OAuth flow to get a valid access token

2. **"Access token needs to be set"**
   - **Solution**: Set the `SHOPIFY_ACCESS_TOKEN` environment variable

3. **"Using fallback data"**
   - **Solution**: The access token is invalid or expired, get a new one

4. **"Shopify API error: 403"**
   - **Solution**: The app doesn't have the required permissions, re-authorize

### **Check Status**
```bash
curl "http://localhost:3001/auth/status"
```

### **Test Endpoints**
```bash
# Test customers
curl "http://localhost:3001/api/shopify-rest-customers?limit=5"

# Test analytics
curl "http://localhost:3001/api/shopify-rest-analytics?period=30d"
```

## **Expected Results**

### **Before OAuth (Fallback Data)**
```json
{
  "success": true,
  "data": [...],
  "fallback": true,
  "message": "Using fallback data - Shopify REST API unavailable"
}
```

### **After OAuth (Real Data)**
```json
{
  "success": true,
  "data": [...],
  "fallback": false,
  "message": "Data fetched from Shopify REST API"
}
```

## **Next Steps**

1. **Complete OAuth flow** using the setup page
2. **Set environment variable** with the access token
3. **Restart server** to apply changes
4. **Test endpoints** to verify real data
5. **Open dashboard** to see live customer data
6. **Verify analytics** show real store metrics

## **Security Notes**

- **Never commit access tokens** to version control
- **Use environment variables** for sensitive data
- **Rotate tokens regularly** for security
- **Monitor API usage** to avoid rate limits

## **Support**

If you encounter issues:
1. Check the OAuth setup page for detailed error messages
2. Verify the access token is valid using `/auth/status`
3. Test endpoints individually to isolate problems
4. Check server logs for detailed error information

---

**🎉 Once you complete this process, you'll have real Shopify customer data flowing into your IdealFit dashboard!**
