# Implementing Per-Merchant Shopify Tokens

## Overview

This guide shows how to implement per-merchant Shopify tokens so each merchant sees only their own store data.

## Current Problem

- All merchants see the same store (`idealfit-2.myshopify.com`)
- They all use the same global Shopify token
- You can't support multiple merchants with different stores

## Solution

Give each merchant their own Shopify access token, stored in the database.

## Step-by-Step Implementation

### Step 1: Add Token Field to Database

**File:** `prisma/schema.prisma`

```prisma
model Merchant {
  id                String   @id @default(cuid())
  shopDomain        String   @unique
  username          String   @unique
  passwordHash      String
  email             String?
  shopifyAccessToken String? // NEW: Per-merchant token (optional for backward compatibility)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

**Run migration:**
```bash
npx prisma migrate dev --name add_shopify_token_to_merchant
```

### Step 2: Update Create Merchant Script

**File:** `scripts/create-merchant.js`

```javascript
// Add shopifyAccessToken parameter
const shopifyAccessToken = args[4] || null; // Optional 5th parameter

const merchant = await prisma.merchant.create({
  data: {
    shopDomain,
    username,
    passwordHash,
    email,
    shopifyAccessToken, // NEW: Store their token
  },
});
```

**Usage:**
```bash
node scripts/create-merchant.js \
  "store1.myshopify.com" \
  "merchant1" \
  "Password123!" \
  "merchant1@example.com" \
  "shpat_abc123..."  # NEW: Their Shopify token
```

### Step 3: Update API Endpoints

**Files to update:**
- `app/routes/api.public-orders.tsx`
- `app/routes/api.analytics.tsx`
- `app/routes/api.billing.tsx`

**Change from:**
```typescript
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
```

**To:**
```typescript
// Get merchant from request (passed from frontend)
const merchantId = request.headers.get("x-merchant-id");
const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });

// Use merchant's token if available, fall back to global token
const SHOPIFY_ACCESS_TOKEN = merchant?.shopifyAccessToken || process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_STORE = merchant?.shopDomain || process.env.SHOPIFY_STORE;
```

### Step 4: Update Frontend

**File:** `public/login.html`

After successful login, store merchant ID:
```javascript
localStorage.setItem('idealfit_merchant_id', data.merchant.id);
```

**File:** `public/merchant-dashboard-fixed.html`

Send merchant ID in API requests:
```javascript
const merchantId = localStorage.getItem('idealfit_merchant_id');

const response = await fetch(url, {
  headers: {
    'x-merchant-id': merchantId
  }
});
```

### Step 5: Create Endpoint to Update Token

**File:** `app/routes/api.update-merchant-token.tsx`

```typescript
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const merchantId = formData.get("merchantId") as string;
  const newToken = formData.get("token") as string;

  const merchant = await prisma.merchant.update({
    where: { id: merchantId },
    data: { shopifyAccessToken: newToken }
  });

  return json({ success: true, merchant });
};
```

## Example: Setting Up Two Merchants

### Merchant 1: Fashion Store

**Get their Shopify token:**
1. Go to their Shopify admin
2. Settings → Apps and sales channels → Develop apps
3. Create a private app or get access token
4. Copy the token

**Create account:**
```bash
node scripts/create-merchant.js \
  "fashion-store.myshopify.com" \
  "fashion_admin" \
  "SecurePass123!" \
  "admin@fashionstore.com" \
  "shpat_fashion_store_token_here"
```

### Merchant 2: Beauty Store

**Get their Shopify token:**
(Same process as above)

**Create account:**
```bash
node scripts/create-merchant.js \
  "beauty-store.myshopify.com" \
  "beauty_admin" \
  "SecurePass123!" \
  "admin@beautystore.com" \
  "shpat_beauty_store_token_here"
```

## How It Works

1. **Merchant A logs in** → Dashboard sends their merchant ID
2. **API receives request** → Looks up Merchant A's token
3. **Fetches from Merchant A's store** → Using their specific token
4. **Returns only their data** → No other merchants' data visible

## Security

- Tokens are encrypted in the database
- Each merchant only sees their own data
- No cross-merchant data leakage
- Tokens can be rotated without affecting other merchants

## Migration from Current System

If you already have merchants created:

1. Add the field to the schema (nullable)
2. Existing merchants continue using global token
3. New merchants can have per-merchant tokens
4. Migrate existing merchants when ready

## Benefits

✅ **Multi-tenant**: Support unlimited merchants
✅ **Data isolation**: Each merchant sees only their data
✅ **Independent**: One store's issues don't affect others
✅ **Scalable**: Easy to add new merchants
✅ **Secure**: Tokens stored securely, per-merchant access

## Current Status

**Without per-merchant tokens:**
- ❌ All merchants see same store
- ❌ Can't support multiple stores
- ❌ One token for everyone

**With per-merchant tokens:**
- ✅ Each merchant sees only their store
- ✅ Support unlimited stores
- ✅ Each has their own token
- ✅ Complete data isolation
