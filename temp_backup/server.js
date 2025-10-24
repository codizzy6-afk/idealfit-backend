const express = require('express');
const app = express();

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World from IdealFit!',
    status: 'working',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Size recommendation
app.post('/api/recommend-size', (req, res) => {
  const { bust, waist, hip, unit = 'inches' } = req.body;
  
  if (!bust || !waist || !hip) {
    return res.status(400).json({
      error: 'Missing measurements'
    });
  }

  const sizeChart = [
    { size: 'XS', bust: 32, waist: 24, hips: 34 },
    { size: 'S', bust: 34, waist: 26, hips: 36 },
    { size: 'M', bust: 36, waist: 28, hips: 38 },
    { size: 'L', bust: 38, waist: 30, hips: 40 },
    { size: 'XL', bust: 40, waist: 32, hips: 42 },
    { size: 'XXL', bust: 42, waist: 34, hips: 44 }
  ];

  const inchesToCm = (inches) => inches * 2.54;
  const cmToInches = (cm) => cm / 2.54;
  
  const bustInches = unit === 'cm' ? cmToInches(bust) : bust;
  const waistInches = unit === 'cm' ? cmToInches(waist) : waist;
  const hipInches = unit === 'cm' ? cmToInches(hip) : hip;

  let recommendedSize = 'XXL';
  for (const size of sizeChart) {
    if (bustInches <= size.bust && waistInches <= size.waist && hipInches <= size.hips) {
      recommendedSize = size.size;
      break;
    }
  }

  res.json({
    recommendedSize,
    measurements: { bust: bustInches, waist: waistInches, hip: hipInches },
    unit: 'inches'
  });
});

// Unit conversion
app.post('/api/convert-units', (req, res) => {
  const { value, fromUnit, toUnit } = req.body;
  
  if (typeof value === 'undefined' || !fromUnit || !toUnit) {
    return res.status(400).json({ 
      error: 'Missing parameters',
      required: ['value', 'fromUnit', 'toUnit']
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});