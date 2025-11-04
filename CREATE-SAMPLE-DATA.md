# Create Sample Data for Company Admin Dashboard

This script creates sample merchants, submissions, and invoices to test the Company Admin Dashboard.

## What it creates:

- **5 Sample Merchants** with different shop domains
- **25 Sample Submissions** with realistic measurements
- **30 Sample Invoices** (6 months × 5 merchants) with various statuses

## How to run:

### Option 1: Run locally (if you have local database)
```bash
cd ideal-fit
node scripts/create-sample-data.js
```

### Option 2: Run on Render (via SSH/Render Shell)
```bash
# Connect to your Render service via SSH
# Then run:
cd ideal-fit
node scripts/create-sample-data.js
```

## Sample Data Details:

### Merchants Created:
- fashion-store.myshopify.com
- boutique-shop.myshopify.com
- style-co.myshopify.com
- trendy-wear.myshopify.com
- elite-fashion.myshopify.com

**All passwords:** `password123`

### Submissions:
- 25 random submissions across all merchants
- Realistic measurements based on size recommendations
- Dates spread over the last 3 months

### Invoices:
- 6 months of invoices per merchant
- Mix of pending, paid, and overdue statuses
- Realistic order counts and pricing

## Notes:

- The script will skip creating duplicates if data already exists
- All sample data is safe to delete if needed
- You can run the script multiple times safely

## After running:

1. Visit the Company Admin Dashboard: `https://ideal-fit-app1.onrender.com/admin/dashboard`
2. Login with: `admin@idealfit.com` / `admin123`
3. You should now see:
   - **Overview**: Stats showing 5 merchants, 25 submissions, 30 invoices
   - **Merchants**: List of 5 sample merchants
   - **Submissions**: List of 25 customer submissions
   - **Billing**: List of invoices with various statuses

