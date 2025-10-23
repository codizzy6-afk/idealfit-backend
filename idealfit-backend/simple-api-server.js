const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hello World from IdealFit!',
    status: 'working',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

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

// Shopify Data Endpoints for Dashboards
app.get('/api/shopify/orders', (req, res) => {
  // Mock Shopify orders data
  const orders = [
    {
      id: '1001',
      customer: 'Sarah Johnson',
      merchant: 'Fashion Store',
      measurements: { bust: 36, waist: 28, hip: 38 },
      recommendedSize: 'M',
      orderDate: '2025-01-23',
      status: 'completed',
      amount: 89.99,
      unit: 'inches'
    },
    {
      id: '1002',
      customer: 'Emily Davis',
      merchant: 'Style Boutique',
      measurements: { bust: 40, waist: 32, hip: 42 },
      recommendedSize: 'XL',
      orderDate: '2025-01-22',
      status: 'processing',
      amount: 129.99,
      unit: 'inches'
    },
    {
      id: '1003',
      customer: 'Maria Garcia',
      merchant: 'Fashion Store',
      measurements: { bust: 34, waist: 26, hip: 36 },
      recommendedSize: 'S',
      orderDate: '2025-01-21',
      status: 'completed',
      amount: 79.99,
      unit: 'inches'
    }
  ];
  res.json(orders);
});

app.get('/api/shopify/customers', (req, res) => {
  const customers = [
    {
      id: 'C001',
      name: 'Sarah Johnson',
      email: 'sarah@email.com',
      totalOrders: 3,
      avgOrderValue: 89.99,
      lastOrder: '2025-01-23',
      measurements: { bust: 36, waist: 28, hip: 38 },
      preferredSize: 'M'
    },
    {
      id: 'C002',
      name: 'Emily Davis',
      email: 'emily@email.com',
      totalOrders: 1,
      avgOrderValue: 129.99,
      lastOrder: '2025-01-22',
      measurements: { bust: 40, waist: 32, hip: 42 },
      preferredSize: 'XL'
    },
    {
      id: 'C003',
      name: 'Maria Garcia',
      email: 'maria@email.com',
      totalOrders: 2,
      avgOrderValue: 79.99,
      lastOrder: '2025-01-21',
      measurements: { bust: 34, waist: 26, hip: 36 },
      preferredSize: 'S'
    }
  ];
  res.json(customers);
});

app.get('/api/shopify/merchants', (req, res) => {
  const merchants = [
    {
      id: 'M001',
      name: 'Fashion Store',
      email: 'merchant@fashionstore.com',
      totalOrders: 15,
      revenue: 1349.85,
      status: 'active',
      joinDate: '2025-01-15',
      avgOrderValue: 89.99
    },
    {
      id: 'M002',
      name: 'Style Boutique',
      email: 'merchant@styleboutique.com',
      totalOrders: 8,
      revenue: 1039.92,
      status: 'active',
      joinDate: '2025-01-10',
      avgOrderValue: 129.99
    }
  ];
  res.json(merchants);
});

app.get('/api/shopify/analytics', (req, res) => {
  const analytics = {
    totalOrders: 23,
    totalRevenue: 2389.77,
    totalCustomers: 18,
    totalMerchants: 2,
    avgOrderValue: 103.90,
    conversionRate: 12.5,
    monthlyGrowth: 15.3,
    topSizes: ['M', 'L', 'XL', 'S', 'XXL'],
    topMerchants: ['Fashion Store', 'Style Boutique'],
    recentActivity: [
      { type: 'order', message: 'New order from Sarah Johnson', time: '2 hours ago' },
      { type: 'merchant', message: 'Fashion Store completed 5 orders', time: '4 hours ago' },
      { type: 'customer', message: 'Emily Davis placed her first order', time: '1 day ago' }
    ]
  };
  res.json(analytics);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
