# Merchant Authentication System

## Overview

The merchant authentication system allows you to create separate login credentials for each merchant who installs your Shopify app. This enables standalone merchant dashboards that can be accessed without going through Shopify's OAuth flow.

## How It Works

1. **When a merchant installs your app**, you create their credentials using the `create-merchant` script
2. **You send the credentials** to the merchant via email
3. **The merchant logs in** to their dashboard using their username and password
4. **The dashboard fetches data** from your Shopify store using the store's access token

## Creating Merchant Accounts

### Step 1: Create the Merchant Account

Run the following command to create a new merchant account:

```bash
node scripts/create-merchant.js <shopDomain> <username> <password> [email]
```

**Example:**
```bash
node scripts/create-merchant.js "idealfit-2.myshopify.com" "merchant1" "SecurePass123!" "merchant@example.com"
```

**Parameters:**
- `shopDomain` - The Shopify store domain (e.g., "idealfit-2.myshopify.com")
- `username` - The login username for the merchant
- `password` - The login password for the merchant
- `email` (optional) - The merchant's email address

### Step 2: Send Credentials to Merchant

After creating the account, you'll see output like this:

```
✅ Merchant created successfully!

Credentials:
  Shop Domain: idealfit-2.myshopify.com
  Username: merchant1
  Password: SecurePass123! (hidden)
  Email: merchant@example.com
  ID: clxabc123xyz

📧 Send these credentials to the merchant to access their dashboard.
```

Send these credentials to the merchant via email.

### Step 3: Merchant Logs In

The merchant can now:
1. Open the standalone dashboard URL
2. Enter their username and password
3. Access their analytics, customers, size chart, and billing

## API Endpoints

### Register New Merchant (Admin Only)

```http
POST /api/merchant-auth
Content-Type: application/x-www-form-urlencoded

action=register&shopDomain=idealfit-2.myshopify.com&username=merchant1&password=SecurePass123!&email=merchant@example.com
```

### Login

```http
POST /api/merchant-auth
Content-Type: application/x-www-form-urlencoded

action=login&username=merchant1&password=SecurePass123!
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "merchant": {
    "id": "clxabc123xyz",
    "shopDomain": "idealfit-2.myshopify.com",
    "username": "merchant1",
    "email": "merchant@example.com"
  }
}
```

## Security Notes

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **No Plain Text**: Passwords are never stored or returned in plain text
3. **HTTPS Required**: Always use HTTPS in production to encrypt credentials in transit
4. **Token Management**: Merchants need valid Shopify access tokens to access their store data

## Database Schema

The `Merchant` table stores:

```typescript
{
  id: string           // Unique ID (cuid)
  shopDomain: string   // Shopify store domain (unique)
  username: string     // Login username (unique)
  passwordHash: string // Bcrypt hashed password
  email?: string       // Optional email
  createdAt: DateTime  // Account creation timestamp
  updatedAt: DateTime  // Last update timestamp
}
```

## Troubleshooting

### "Merchant with username already exists"
- The username is already taken
- Use a different username or check if the merchant already has an account

### "Invalid credentials" on login
- Verify the username and password are correct
- Check if the merchant account exists in the database

### Merchant can't access their data
- Verify the Shopify access token is configured for their store
- Check that the `SHOPIFY_STORE` environment variable matches their shop domain

## Next Steps

1. Create merchant accounts for each store using the script
2. Send credentials to merchants via email
3. Merchants can now log in and access their dashboard
4. Monitor merchant usage through your dashboard analytics
