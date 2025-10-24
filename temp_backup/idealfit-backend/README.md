# IdealFit Backend API - WORKING VERSION

This repository contains the backend API for the IdealFit Shopify app.

## 🚀 Quick Test URLs

After deployment, test these endpoints:

1. **Root:** `https://your-url.vercel.app/`
2. **Health:** `https://your-url.vercel.app/api/health`
3. **Size Recommendation:** `https://your-url.vercel.app/api/recommend-size`

## 📋 API Endpoints

### GET `/`
Returns API information and available endpoints.

### GET `/api/health`
Health check endpoint.

### POST `/api/recommend-size`
Receives customer measurements and returns a recommended size.

**Request Body:**
```json
{
  "bust": 36,
  "waist": 28,
  "hip": 38,
  "unit": "inches"
}
```

**Response:**
```json
{
  "recommendedSize": "M",
  "measurements": {
    "bust": 36,
    "waist": 28,
    "hip": 38,
    "unit": "inches"
  },
  "algorithm": "comfort-fit"
}
```

### POST `/api/convert-units`
Converts measurement values between inches and centimeters.

**Request Body:**
```json
{
  "value": 36,
  "fromUnit": "inches",
  "toUnit": "cm"
}
```

**Response:**
```json
{
  "originalValue": 36,
  "originalUnit": "inches",
  "convertedValue": 91.44,
  "convertedUnit": "cm"
}
```

## 🔧 Deployment

This API is designed to be deployed on Vercel.

### Manual Deployment Steps:

1. **Create a Vercel Account:** Go to [vercel.com](https://vercel.com) and sign up (e.g., with GitHub).
2. **Create a New Project:** From your Vercel dashboard, click "New Project".
3. **Import Git Repository:** Connect your GitHub account and import this `idealfit-backend` repository.
4. **Configure Project:** Vercel should automatically detect the Node.js project and the `vercel.json` configuration.
5. **Deploy:** Click "Deploy". Vercel will build and deploy your API, providing you with a unique URL (e.g., `https://idealfit-xyz.vercel.app`).

## 🏠 Local Development

To run this API locally:

1. **Clone the repository:**
   ```bash
   git clone [repository-url]
   ```

2. **Navigate to the directory:**
   ```bash
   cd idealfit-backend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

The API will be running on `http://localhost:3000`.

## 🌍 Global Features

- **Unit Conversion:** Automatic inches/cm conversion
- **Country Detection:** Auto-detects user's country for default units
- **India Support:** Inches as default for Indian users
- **Comfort Fit Algorithm:** Recommends the smallest size that fits comfortably

## 🔧 Troubleshooting

If you get 404 errors:
1. Make sure `vercel.json` is in the root directory
2. Make sure `api/index.js` uses `module.exports = app`
3. Check Vercel deployment logs for errors
4. Ensure all dependencies are in `package.json`