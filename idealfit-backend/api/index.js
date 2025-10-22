const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'IdealFit API is running!',
    timestamp: new Date().toISOString()
  });
});

// Size recommendation endpoint
app.post('/api/recommend-size', (req, res) => {
  const { bust, waist, hip, unit = 'inches' } = req.body;

  if (!bust || !waist || !hip) {
    return res.status(400).json({
      error: 'Missing measurement data. Please provide bust, waist, and hip measurements.'
    });
  }

  // Conversion functions
  const inchesToCm = (inches) => inches * 2.54;
  const cmToInches = (cm) => cm / 2.54;

  // Convert incoming measurements to inches for consistent comparison
  const convertedBust = unit === 'cm' ? cmToInches(bust) : bust;
  const convertedWaist = unit === 'cm' ? cmToInches(waist) : waist;
  const convertedHip = unit === 'cm' ? cmToInches(hip) : hip;

  // Default size chart (in inches)
  const sizeChart = [
    { size: 'XS', bust: 32, waist: 24, hips: 34 },
    { size: 'S', bust: 34, waist: 26, hips: 36 },
    { size: 'M', bust: 36, waist: 28, hips: 38 },
    { size: 'L', bust: 38, waist: 30, hips: 40 },
    { size: 'XL', bust: 40, waist: 32, hips: 42 },
    { size: 'XXL', bust: 42, waist: 34, hips: 44 }
  ];

  // Find recommended size using comfort fit algorithm
  let recommendedSize = 'XXL'; // Default to largest size

  for (const sizeEntry of sizeChart) {
    if (convertedBust <= sizeEntry.bust &&
        convertedWaist <= sizeEntry.waist &&
        convertedHip <= sizeEntry.hips) {
      recommendedSize = sizeEntry.size;
      break;
    }
  }

  res.json({
    recommendedSize,
    measurements: {
      bust: convertedBust,
      waist: convertedWaist,
      hip: convertedHip,
      unit: 'inches'
    },
    algorithm: 'comfort-fit'
  });
});

// Unit conversion endpoint
app.post('/api/convert-units', (req, res) => {
  const { value, fromUnit, toUnit } = req.body;

  if (typeof value === 'undefined' || !fromUnit || !toUnit) {
    return res.status(400).json({
      error: 'Missing value, fromUnit, or toUnit.'
    });
  }

  const inchesToCm = (inches) => inches * 2.54;
  const cmToInches = (cm) => cm / 2.54;

  let convertedValue = value;
  if (fromUnit === 'inches' && toUnit === 'cm') {
    convertedValue = inchesToCm(value);
  } else if (fromUnit === 'cm' && toUnit === 'inches') {
    convertedValue = cmToInches(value);
  }

  res.json({
    originalValue: value,
    originalUnit: fromUnit,
    convertedValue: parseFloat(convertedValue.toFixed(2)),
    convertedUnit: toUnit
  });
});

// Export for Vercel
module.exports = app;
