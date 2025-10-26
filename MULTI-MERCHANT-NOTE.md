# Multi-Merchant Setup

## Current Implementation

Currently, all merchants share the **same Shopify store data** because:

1. The Shopify access token is set globally in Render environment variables (`SHOPIFY_ACCESS_TOKEN` and `SHOPIFY_STORE`)
2. All merchants log into the same dashboard, which fetches from the same store

## How It Works Now

- All merchants log in with their unique username/password
- But they all see the **same data** from `idealfit-2.myshopify.com`
- This works if you're managing **one store** with multiple users

## To Support Multiple Merchants with Different Stores

You need to implement **per-merchant Shopify tokens**:

### Step 1: Update Database Schema

Add `shopifyAccessToken` field to the `Merchant` model:

```prisma
model Merchant {
  id                String   @id @default(cuid())
  shopDomain        String   @unique
  username          String   @unique
  passwordHash      String
  email             String?
  shopifyAccessToken String  // NEW: Each merchant's unique token
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### Step 2: Update Merchant Creation

When creating a merchant, also store their Shopify access token:

```bash
node scripts/create-merchant.js \
  "shop.myshopify.com" \
  "username" \
  "password" \
  "email" \
  "shpat_their_unique_token"  # NEW: Their Shopify token
```

### Step 3: Update API Endpoints

Modify `api.public-orders.tsx`, `api.analytics.tsx`, and `api.billing.tsx` to:

1. Get the logged-in merchant from the session
2. Use their specific `shopifyAccessToken` instead of the global one
3. Fetch data from their specific store

### Step 4: Update Authentication

After login, store the merchant's token in localStorage and use it for all API calls.

## Quick Setup for Single Store (Current)

If you only need **one store** with multiple users:

1. Create merchant accounts with the same `shopDomain` (your store)
2. Use the same global Shopify token in Render
3. All merchants see the same data (works for team access)

## Example

```bash
# Create admin user
node scripts/create-merchant.js "idealfit-2.myshopify.com" "admin" "AdminPass123!" "admin@example.com"

# Create staff user
node scripts/create-merchant.js "idealfit-2.myshopify.com" "staff" "StaffPass123!" "staff@example.com"

# Both users log in and see the same data from idealfit-2.myshopify.com
```

## Current Status

✅ **Single Store + Multiple Users** - Works (all users see the same store data)
❌ **Multiple Stores** - Needs implementation (each merchant needs their own token)
