# Shopify REST API Setup Guide

## Overview
This guide explains how to set up Shopify REST API integration to fetch real data from your Shopify store.

## Current Status
✅ **REST API endpoints implemented**
✅ **Fallback data system working**
⚠️ **Need Shopify access token for real data**

## Available Endpoints

### REST API Endpoints (Primary)
- `GET /api/shopify-rest-orders` - Fetch orders from Shopify
- `GET /api/shopify-rest-customers` - Fetch customers from Shopify
- `GET /api/shopify-rest-products` - Fetch products from Shopify
- `GET /api/shopify-rest-analytics` - Fetch analytics from Shopify

### Fallback Endpoints
- `GET /api/shopify-orders` - Proxy to Shopify app (fallback)
- `GET /api/shopify-customers` - Proxy to Shopify app (fallback)
- `GET /api/shopify-analytics` - Proxy to Shopify app (fallback)

### Local Data Endpoints
- `GET /api/orders` - Mock orders data
- `GET /api/customers` - Mock customers data
- `GET /api/analytics` - Mock analytics data

## How to Get Shopify Access Token

### Method 1: Using Shopify CLI (Recommended)
1. **Install Shopify CLI** (if not already installed):
   ```bash
   npm install -g @shopify/cli @shopify/theme
   ```

2. **Login to Shopify Partners**:
   ```bash
   shopify auth login
   ```

3. **Generate access token**:
   ```bash
   shopify app generate token
   ```

4. **Set environment variable**:
   ```bash
   export SHOPIFY_ACCESS_TOKEN="your-access-token-here"
   ```

### Method 2: Manual OAuth Flow
1. **Create OAuth URL**:
   ```
   https://idealfit-2.myshopify.com/admin/oauth/authorize?client_id=df65d05c59fdde03db6cad23f63bb6e7&scope=read_products,read_orders,read_customers&redirect_uri=http://localhost:3000/auth/callback&state=random-state
   ```

2. **Authorize the app** in your browser

3. **Exchange code for token**:
   ```bash
   curl -X POST https://idealfit-2.myshopify.com/admin/oauth/access_token \
     -H "Content-Type: application/json" \
     -d '{
       "client_id": "df65d05c59fdde03db6cad23f63bb6e7",
       "client_secret": "your-api-secret",
       "code": "authorization-code-from-callback"
     }'
   ```

### Method 3: Using Shopify Admin API
1. **Go to Shopify Admin** → Settings → Apps and sales channels
2. **Create private app** with required permissions:
   - `read_products`
   - `read_orders`
   - `read_customers`
3. **Copy the Admin API access token**

## Configuration

### Environment Variables
Create a `.env` file in the project root:
```env
SHOPIFY_ACCESS_TOKEN=your-access-token-here
SHOPIFY_API_SECRET=your-api-secret-here
SHOPIFY_SHOP=idealfit-2.myshopify.com
```

### Update server.js
The server.js file is already configured to use these environment variables:
```javascript
const SHOPIFY_CONFIG = {
  shop: 'idealfit-2.myshopify.com',
  apiKey: 'df65d05c59fdde03db6cad23f63bb6e7',
  apiSecret: process.env.SHOPIFY_API_SECRET || 'your-api-secret',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || 'your-access-token',
  apiVersion: '2025-10'
};
```

## Testing the Integration

### 1. Test REST API Endpoints
```bash
# Test analytics
curl "http://localhost:3001/api/shopify-rest-analytics?period=30d"

# Test customers
curl "http://localhost:3001/api/shopify-rest-customers?limit=50"

# Test orders
curl "http://localhost:3001/api/shopify-rest-orders?limit=50"

# Test products
curl "http://localhost:3001/api/shopify-rest-products?limit=50"
```

### 2. Check Dashboard
1. Open: `http://localhost:8080/merchant-master-dashboard-enhanced.html`
2. Check console logs for data source
3. Verify data is loading correctly

### 3. Expected Response Format
```json
{
  "success": true,
  "data": { ... },
  "fallback": false,
  "message": "Data fetched from Shopify REST API"
}
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if access token is valid
   - Verify token has required permissions
   - Ensure token is not expired

2. **403 Forbidden**
   - Check API permissions/scopes
   - Verify shop domain is correct
   - Ensure app is properly installed

3. **429 Rate Limited**
   - Implement rate limiting
   - Add retry logic with exponential backoff
   - Consider caching responses

4. **500 Internal Server Error**
   - Check server logs for detailed error
   - Verify API endpoint URLs
   - Ensure proper error handling

### Debug Mode
Enable debug logging by setting:
```javascript
const DEBUG = true;
```

## Next Steps

1. **Get access token** using one of the methods above
2. **Set environment variables**
3. **Test REST API endpoints**
4. **Verify dashboard integration**
5. **Implement caching** for better performance
6. **Add error monitoring** and logging

## Security Considerations

1. **Never commit access tokens** to version control
2. **Use environment variables** for sensitive data
3. **Implement proper authentication** for production
4. **Add rate limiting** to prevent abuse
5. **Use HTTPS** in production

## Performance Optimization

1. **Implement caching** for frequently accessed data
2. **Use pagination** for large datasets
3. **Add request deduplication**
4. **Implement background sync** for real-time updates
5. **Use webhooks** for data changes

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Shopify API documentation
3. Check server logs for detailed errors
4. Test endpoints individually to isolate issues
