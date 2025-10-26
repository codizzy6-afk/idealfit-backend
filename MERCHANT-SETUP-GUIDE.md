# Merchant Setup Guide

## Overview

This guide explains how to set up merchant accounts when customers install your IdealFit app from the Shopify App Store.

## Workflow

1. **Merchant Installs Your App** from the Shopify App Store
2. **You Create Their Account** using the merchant creation script
3. **You Send Credentials** to the merchant via email
4. **Merchant Logs In** and accesses their dashboard

## Step-by-Step Setup

### Step 1: Get Merchant Information

When a merchant installs your app, collect:
- **Shop Domain**: e.g., `mystore.myshopify.com`
- **Merchant Email**: Their contact email
- **Merchant Name**: (Optional, for personalization)

### Step 2: Create the Merchant Account

Run the merchant creation script with their information:

```bash
node scripts/create-merchant.js "shop.myshopify.com" "merchant_username" "SecurePassword123!" "merchant@example.com"
```

**Example:**
```bash
node scripts/create-merchant.js "boutique-fashion.myshopify.com" "boutique_admin" "MySecurePass2024!" "admin@boutiquefashion.com"
```

**Important Notes:**
- Choose a **unique username** for each merchant
- Use a **strong, randomly generated password**
- The shop domain should match their actual Shopify store URL

### Step 3: Save and Send Credentials

The script will output:

```
✅ Merchant created successfully!

Credentials:
  Shop Domain: boutique-fashion.myshopify.com
  Username: boutique_admin
  Password: MySecurePass2024! (hidden)
  Email: admin@boutiquefashion.com
  ID: clxabc123xyz

📧 Send these credentials to the merchant to access their dashboard.
```

**Copy these credentials** (you won't be able to see the password again).

### Step 4: Configure Shopify Access Token

For each merchant, you need to configure their Shopify access token in your environment:

**Option A: Single Token (One Store)**
If you're only managing one store, you can add the token to `render.yaml`:

```yaml
envVars:
  - key: SHOPIFY_ACCESS_TOKEN
    sync: false  # Set this in Render dashboard
  - key: SHOPIFY_STORE
    sync: false  # Set this in Render dashboard
```

**Option B: Multi-Token (Multiple Stores)**
For multiple stores, you'll need to:
1. Store tokens in your database (add a `shopifyAccessToken` field to the `Merchant` model)
2. Update the API endpoints to fetch the token based on the logged-in merchant
3. Set `SHOPIFY_ACCESS_TOKEN` in Render for the primary/default store

### Step 5: Send Welcome Email to Merchant

Send an email to the merchant with:

**Subject:** Welcome to IdealFit - Your Dashboard Access

**Body:**
```
Dear [Merchant Name],

Welcome to IdealFit! Your account has been successfully set up.

Your dashboard login credentials:

Username: [username]
Password: [password]
Login URL: https://ideal-fit-app1.onrender.com/login.html

(You can change your password in the Settings section after logging in)

What you can do in your dashboard:
- View analytics on size recommendations
- Manage customer measurements
- Customize your size chart
- Track monthly billing

If you have any questions, please contact support.

Best regards,
The IdealFit Team
```

### Step 6: Merchant Logs In

The merchant can now:
1. Go to `https://ideal-fit-app1.onrender.com/login.html`
2. Enter their username and password
3. Access their dashboard

## Multiple Merchants

For multiple merchants, repeat steps 2-5 for each one. Each merchant needs:
- A unique username
- A unique shop domain
- Their own credentials

## Security Best Practices

1. **Generate Strong Passwords**: Use a password generator (20+ characters, mixed case, numbers, symbols)
2. **Store Safely**: Save credentials in a secure password manager
3. **Email Security**: Send credentials via encrypted email or use a secure link
4. **Reset Option**: Implement a password reset flow for merchants
5. **Monitor Access**: Log all login attempts for security auditing

## Password Reset (Future Enhancement)

To implement password reset:
1. Add a "Forgot Password" link in the login page
2. Generate a secure reset token
3. Send reset link to merchant's email
4. Allow them to set a new password

## Troubleshooting

### "Merchant with username already exists"
- The username is taken
- Try a different username (e.g., add a number or underscore)

### Merchant can't log in
- Verify the username and password are correct
- Check if the merchant account exists in the database
- Try creating a new password for them

### Merchant sees wrong data
- Verify `SHOPIFY_STORE` environment variable matches their shop domain
- Check that their Shopify access token is configured correctly
- Ensure they're using the correct credentials

## Example: Complete Workflow

```bash
# 1. Customer installs your app
# Shop: "fashion-boutique.myshopify.com"
# Email: "owner@fashionboutique.com"

# 2. Create their account
node scripts/create-merchant.js "fashion-boutique.myshopify.com" "fashion_boutique_owner" "F@sh10n2024!" "owner@fashionboutique.com"

# Output:
✅ Merchant created successfully!
Credentials:
  Shop Domain: fashion-boutique.myshopify.com
  Username: fashion_boutique_owner
  Password: F@sh10n2024!
  Email: owner@fashionboutique.com
  ID: clxabc123xyz

# 3. Send email with credentials
# Subject: Welcome to IdealFit - Your Dashboard Access
# Body: [credentials above]

# 4. Merchant logs in and accesses dashboard
```

## Next Steps

After setting up merchant accounts:
1. Monitor dashboard usage
2. Support merchants with any questions
3. Track billing and usage
4. Gather feedback for improvements
