# Shopify Access Token Requirements

## Required Scopes/Permissions

Your Shopify access token needs the following permissions to read customer data:

### Minimum Required Scopes:
- `read_orders` - To read order data
- `read_customers` - To read customer data including:
  - Customer email
  - Customer first name
  - Customer last name
  - Customer phone
  - Customer addresses (address1, city, zip)

### How to Update Permissions:

1. **Go to Shopify Partners Dashboard**
   - Visit: https://partners.shopify.com
   - Login to your account

2. **Navigate to Your App**
   - Click on your app
   - Go to "App setup" or "Configuration"

3. **Update OAuth Scopes**
   - Find "OAuth scopes" or "API permissions"
   - Add these scopes:
     - `read_orders`
     - `read_customers`
   - Save changes

4. **Regenerate Access Token**
   - After updating scopes, you may need to regenerate the access token
   - Or reinstall the app on your development store

5. **Update Render Environment Variable**
   - Go to https://dashboard.render.com
   - Select your service
   - Go to "Environment"
   - Update `SHOPIFY_ACCESS_TOKEN` with the new token
   - Save and redeploy

## Current Issue

The current access token does NOT have permissions to read:
- Customer email
- Customer first_name/last_name
- Customer phone
- Customer address1, city, zip

These fields are being blocked by Shopify's PII (Personally Identifiable Information) restrictions.

## Alternative Solution

If you cannot get the required permissions, the only customer data we can access is:
- Customer ID
- Province/State
- Country

All other fields will be empty or "No data".
