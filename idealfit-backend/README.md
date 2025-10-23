# 🚀 IdealFit Backend API

## 🌟 **Features**
- ✅ Size Recommendation Engine
- ✅ Unit Conversion (IN/CM)
- ✅ Global Support
- ✅ India Inches Default
- ✅ Option 3: Comfort Fit Algorithm

## 🚀 **API Endpoints**

### Size Recommendation
```
POST /api/recommend-size
{
  "bust": 36,
  "waist": 30,
  "hip": 40,
  "unit": "inches"
}
```

### Unit Conversion
```
POST /api/convert-units
{
  "value": 36,
  "fromUnit": "inches",
  "toUnit": "cm"
}
```

### Health Check
```
GET /api/health
```

## 🌐 **Deployment**
- **Platform:** Vercel
- **Domain:** Free subdomain
- **SSL:** Automatic HTTPS
- **Cost:** $0/month

## 📊 **Size Chart**
- XS: Bust 30", Waist 25", Hip 35"
- S: Bust 32", Waist 27", Hip 37"
- M: Bust 34", Waist 29", Hip 39"
- L: Bust 36", Waist 31", Hip 41"
- XL: Bust 38", Waist 33", Hip 43"
- XXL: Bust 40", Waist 35", Hip 45"

## 🎯 **Algorithm**
Uses "Option 3: Comfort Fit" - finds the first size where ALL measurements fit comfortably.

---
**Built for IdealFit Shopify App** 🛍️
