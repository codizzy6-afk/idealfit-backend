const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'IdealFit API Server',
    status: 'running',
    version: '1.0.0',
    features: [
      'Size Recommendation',
      'Unit Conversion (IN/CM)',
      'Global Support',
      'India Inches Default'
    ],
    endpoints: {
      'size-recommendation': '/api/recommend-size',
      'unit-conversion': '/api/convert-units',
      'health-check': '/api/health'
    }
  });
});

// Size recommendation endpoint
app.post('/api/recommend-size', (req, res) => {
  const { bust, waist, hip, unit = 'inches' } = req.body;
  
  // Convert to inches if needed
  let bustInches = bust;
  let waistInches = waist;
  let hipInches = hip;
  
  if (unit === 'cm') {
    bustInches = bust / 2.54;
    waistInches = waist / 2.54;
    hipInches = hip / 2.54;
  }
  
  // Standard women's size chart (in inches)
  const sizeChart = [
    { size: 'XS', bust: 30, waist: 25, hip: 35 },
    { size: 'S', bust: 32, waist: 27, hip: 37 },
    { size: 'M', bust: 34, waist: 29, hip: 39 },
    { size: 'L', bust: 36, waist: 31, hip: 41 },
    { size: 'XL', bust: 38, waist: 33, hip: 43 },
    { size: 'XXL', bust: 40, waist: 35, hip: 45 }
  ];
  
  // Option 3: Comfort Fit algorithm
  let recommendedSize = 'N/A';
  
  for (let i = 0; i < sizeChart.length; i++) {
    const size = sizeChart[i];
    const bustFits = bustInches <= size.bust;
    const waistFits = waistInches <= size.waist;
    const hipsFits = hipInches <= size.hip;
    
    if (bustFits && waistFits && hipsFits) {
      recommendedSize = size.size;
      break;
    }
  }
  
  // If no size fits, return largest
  if (recommendedSize === 'N/A') {
    recommendedSize = sizeChart[sizeChart.length - 1].size;
  }
  
  res.json({
    success: true,
    recommendedSize,
    measurements: {
      bust: unit === 'inches' ? bust : (bust / 2.54).toFixed(1),
      waist: unit === 'inches' ? waist : (waist / 2.54).toFixed(1),
      hip: unit === 'inches' ? hip : (hip / 2.54).toFixed(1),
      unit: unit === 'inches' ? 'inches' : 'cm'
    },
    algorithm: 'Option 3: Comfort Fit'
  });
});

// Unit conversion endpoint
app.post('/api/convert-units', (req, res) => {
  const { value, fromUnit, toUnit } = req.body;
  
  if (fromUnit === toUnit) {
    return res.json({ success: true, convertedValue: value });
  }
  
  let convertedValue;
  if (fromUnit === 'inches' && toUnit === 'cm') {
    convertedValue = value * 2.54;
  } else if (fromUnit === 'cm' && toUnit === 'inches') {
    convertedValue = value / 2.54;
  } else {
    return res.status(400).json({ success: false, error: 'Invalid unit conversion' });
  }
  
  res.json({
    success: true,
    originalValue: value,
    convertedValue: Math.round(convertedValue * 10) / 10,
    fromUnit,
    toUnit
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 IdealFit API Server running on port ${PORT}`);
    console.log(`📊 Features: Size Recommendation, Unit Conversion, Global Support`);
  });
}

module.exports = app;

