# Merchant Dashboard - Real-Time Data Setup Guide

## 🎯 Overview

Your merchant dashboard can now fetch **real-time data** from your Shopify app's database. This guide will help you connect it.

## 📋 Prerequisites

- Shopify app must be running (development server)
- Customer measurements stored in database (`Submission` table)

## 🚀 Quick Start

### Step 1: Start Your Shopify App

Open a terminal and run:

```bash
cd "D:\ideal fit\ideal-fit"
npm run dev
```

**Expected output:**
```
> dev
> shopify app dev

Your app is running on http://localhost:3000
```

**Important:** Keep this terminal running! The dashboard needs the app to be running to fetch data.

### Step 2: Open the Merchant Dashboard

In a **separate terminal** or just double-click:

```bash
cd "D:\ideal fit\ideal-fit"
start merchant-master-dashboard.html
```

Or simply double-click `merchant-master-dashboard.html` in File Explorer.

### Step 3: Login to Dashboard

- Use any email/password (demo mode)
- Click "Sign In"

### Step 4: Configure Your Shop

1. Click the **⚙️ Settings** button (top right)
2. Click the **🔗 Integration** tab
3. Enter your Shopify store URL:
   - Example: `mystore.myshopify.com`
   - Or: `https://mystore.myshopify.com`
4. Click **🔗 Connect to Shopify**

### Step 5: Verify Connection

If successful, you'll see:
```
✅ Connected Successfully!
Store: mystore.myshopify.com
Status: Active
Data Found: X measurements
```

Your dashboard will automatically reload with real data!

## 📊 What Data Gets Displayed?

Once connected, the dashboard shows:

### Analytics Tab
- **Total Orders**: Number of customer measurement submissions
- **Unique Customers**: Count of distinct customer names
- **Most Popular Size**: The size recommended most often
- **Size Distribution Chart**: Visual breakdown of size recommendations
- **Size Comparison Table**: Detailed analytics per size with averages

### Customer Database Tab
- All customer measurements from your database
- Filter by date, month, year, or size
- Export to Excel/CSV

### Size Chart Tab
- Your configured size charts
- Ability to edit and save changes

### Billing Tab
- Automatic calculation based on real order count
- Phase determination (Starter/Professional/Enterprise)
- Current month billing summary

## 🔧 Troubleshooting

### "Cannot connect to API" Error

**Cause:** Shopify app is not running

**Solution:**
```bash
cd "D:\ideal fit\ideal-fit"
npm run dev
```

Wait for "Your app is running on http://localhost:3000" then try connecting again.

### "No measurement data found"

**Cause:** No customer submissions in database yet

**Solution:**
1. Make sure your theme extension is installed
2. Customers need to submit measurements on product pages
3. Check database: `D:\ideal fit\ideal-fit\prisma\dev.sqlite`

### Wrong API URL

By default, the dashboard connects to `http://localhost:3000`.

To change this:
1. Open browser console (F12)
2. Run: `localStorage.setItem('idealfit_api_url', 'https://your-app-url.com')`
3. Reload dashboard

### Data Not Updating

1. Click **⚙️ Settings**
2. Click **🔗 Integration**
3. Click **❌ Disconnect**
4. Click **🔗 Connect to Shopify** again

This will force a data refresh.

## 💡 Tips

### Auto-Refresh

The dashboard doesn't auto-refresh data. To see latest data:
1. Open Settings → Integration
2. Click "Connect to Shopify" again
3. Or simply refresh your browser page

### Multiple Shops

The dashboard can connect to different shops:
1. Disconnect current shop
2. Enter new shop domain
3. Connect

Each shop's data is stored separately in the database by `shop` field.

### Development vs Production

**Development (localhost:3000):**
- Use this during development
- Dashboard connects to local dev server

**Production:**
- Change API URL: `localStorage.setItem('idealfit_api_url', 'https://your-production-url.com')`
- Dashboard connects to deployed app

## 🗄️ Database Schema

Customer measurements are stored in `Submission` table:

```prisma
model Submission {
  id              String   @id @default(uuid())
  shop            String
  date            DateTime @default(now())
  customerName    String?
  productId       String?
  bust            Float
  waist           Float
  hip             Float
  recommendedSize String
  orderId         String?
  createdAt       DateTime @default(now())
}
```

## 📡 API Endpoints

The dashboard uses these API endpoints:

### GET `/api/measurements`
Returns all customer measurements with analytics

**Query Parameters:**
- `shop`: Filter by shop domain
- `month`: Filter by month (0-11)
- `year`: Filter by year (2024, 2025, etc.)
- `size`: Filter by size (XS, S, M, L, XL, XXL)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "date": "2025-10-09",
      "name": "John Doe",
      "bust": 36,
      "waist": 28,
      "hip": 38,
      "size": "L",
      "orderId": "#1001",
      "shop": "mystore.myshopify.com"
    }
  ],
  "analytics": {
    "totalOrders": 156,
    "uniqueCustomers": 134,
    "mostPopularSize": "M",
    "sizeDistribution": { "S": 28, "M": 45, "L": 38 },
    "sizeAnalytics": [...]
  }
}
```

### GET `/api/sizecharts`
Returns size charts for the shop

**Query Parameters:**
- `shop`: Shop domain

## 🎓 Next Steps

1. ✅ Start your app (`npm run dev`)
2. ✅ Open dashboard
3. ✅ Connect your shop
4. ✅ View real-time data

## ❓ Need Help?

Check the browser console (F12) for detailed error messages. The dashboard logs all API calls and responses.








