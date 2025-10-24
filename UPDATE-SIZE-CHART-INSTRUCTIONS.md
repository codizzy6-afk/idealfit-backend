# 🎯 How to Update Size Chart in Your Store

## Current Issue
The theme extension uses a hardcoded size chart. To update it, you need to manually edit the file.

---

## ✅ Quick Solution

### Step 1: Edit the Size Chart File

Open this file in VS Code:
```
extensions/ideal-fit/snippets/dynamic-size-chart.liquid
```

### Step 2: Update Lines 8-15

Replace the size chart array with your custom values.

**Example - Your Custom Size Chart:**
```javascript
window.IDEALFIT_SIZE_CHART = [
  { size: 'XS', bust: 30, waist: 25, hip: 35 },
  { size: 'S', bust: 32, waist: 27, hip: 37 },
  { size: 'M', bust: 34, waist: 29, hip: 39 },
  { size: 'L', bust: 36, waist: 31, hip: 41 },
  { size: 'XL', bust: 38, waist: 33, hip: 43 },
  { size: 'XXL', bust: 40, waist: 35, hip: 45 }
];
```

### Step 3: Save the File

The Shopify dev server will automatically reload and update your store!

---

## 🎯 Using the Merchant Dashboard

### Step 1: Edit Size Chart in Dashboard
1. Open: `http://localhost:8080/merchant-master-dashboard.html`
2. Go to **Size Chart Management** tab
3. Edit the measurements as needed
4. Click **"Save Size Chart"**

### Step 2: Copy the Generated Code
The dashboard will:
- ✅ Generate the code for you
- ✅ Copy it to your clipboard
- ✅ Show you exactly where to paste it

### Step 3: Paste in Theme Extension
1. Open: `extensions/ideal-fit/snippets/dynamic-size-chart.liquid`
2. Replace lines 8-15 with the copied code
3. Save the file
4. Done! ✅

---

## 📊 Current Size Chart

**Default (Currently Active):**
- XS: Bust 30", Waist 25", Hip 35"
- S: Bust 32", Waist 27", Hip 37"
- M: Bust 34", Waist 29", Hip 39"
- L: Bust 36", Waist 31", Hip 41"
- XL: Bust 38", Waist 33", Hip 43"
- XXL: Bust 40", Waist 35", Hip 45"

---

## 🔄 Why Manual Update?

Shopify theme extensions **cannot make API calls to localhost** from the storefront for security reasons.

**Options:**
1. **Manual Update** (Current): Edit the file when you change sizes
2. **Shopify Metafields** (Advanced): Store size chart in Shopify and fetch it
3. **App Proxy** (Complex): Route requests through your app server

For now, manual update is the simplest and most reliable method!

---

## 💡 Pro Tip

Keep your merchant dashboard open and use it to:
- ✅ View customer measurements
- ✅ Track size analytics
- ✅ Generate size chart code
- ✅ Export customer data

Then copy the generated code to your theme extension whenever you update sizes!

---

**The current size chart (XXL = Bust 40") is already correct for your measurements!** ✅







