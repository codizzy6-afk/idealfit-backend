module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Root endpoint
  if (req.url === '/' || req.url === '') {
    return res.status(200).json({
      message: 'IdealFit API Server',
      status: 'running',
      version: '1.0.0',
      success: true
    });
  }

  // Health check
  if (req.url === '/api/health') {
    return res.status(200).json({
      status: 'healthy',
      message: 'API is working!',
      timestamp: new Date().toISOString()
    });
  }

  // Size recommendation
  if (req.url === '/api/recommend-size' && req.method === 'POST') {
    const { bust, waist, hip, unit = 'inches' } = req.body || {};
    
    if (!bust || !waist || !hip) {
      return res.status(400).json({
        error: 'Missing measurements'
      });
    }

    // Simple size chart
    const sizeChart = [
      { size: 'XS', bust: 32, waist: 24, hips: 34 },
      { size: 'S', bust: 34, waist: 26, hips: 36 },
      { size: 'M', bust: 36, waist: 28, hips: 38 },
      { size: 'L', bust: 38, waist: 30, hips: 40 },
      { size: 'XL', bust: 40, waist: 32, hips: 42 },
      { size: 'XXL', bust: 42, waist: 34, hips: 44 }
    ];

    // Convert to inches if needed
    const inchesToCm = (inches) => inches * 2.54;
    const cmToInches = (cm) => cm / 2.54;
    
    const bustInches = unit === 'cm' ? cmToInches(bust) : bust;
    const waistInches = unit === 'cm' ? cmToInches(waist) : waist;
    const hipInches = unit === 'cm' ? cmToInches(hip) : hip;

    // Find size
    let recommendedSize = 'XXL';
    for (const size of sizeChart) {
      if (bustInches <= size.bust && waistInches <= size.waist && hipInches <= size.hips) {
        recommendedSize = size.size;
        break;
      }
    }

    return res.json({
      recommendedSize,
      measurements: { bust: bustInches, waist: waistInches, hip: hipInches },
      unit: 'inches'
    });
  }

  // Unit conversion
  if (req.url === '/api/convert-units' && req.method === 'POST') {
    const { value, fromUnit, toUnit } = req.body || {};
    
    if (typeof value === 'undefined' || !fromUnit || !toUnit) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const inchesToCm = (inches) => inches * 2.54;
    const cmToInches = (cm) => cm / 2.54;

    let convertedValue = value;
    if (fromUnit === 'inches' && toUnit === 'cm') {
      convertedValue = inchesToCm(value);
    } else if (fromUnit === 'cm' && toUnit === 'inches') {
      convertedValue = cmToInches(value);
    }

    return res.json({
      originalValue: value,
      originalUnit: fromUnit,
      convertedValue: parseFloat(convertedValue.toFixed(2)),
      convertedUnit: toUnit
    });
  }

  // 404 for everything else
  res.status(404).json({
    error: 'Not found',
    url: req.url,
    method: req.method,
    availableEndpoints: ['/', '/api/health', '/api/recommend-size', '/api/convert-units']
  });
};
