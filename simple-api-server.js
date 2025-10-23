const express = require('express');
const app = express();

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

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

// In-memory storage for real order data (replace with database later)
let realOrders = [];
let realCustomers = [];
let realMerchants = new Set();
let merchantSizeCharts = new Map(); // Store merchant size charts

// Shopify Webhook to receive real order data
app.post('/api/shopify/webhook/orders/create', (req, res) => {
  try {
    const order = req.body;
    console.log('📦 New Shopify Order Received:', order.id);
      console.log('🔍 Full Order Data:', JSON.stringify(order, null, 2));
      console.log('🔍 Order Attributes:', order.attributes);
      console.log('🔍 Order Note Attributes:', order.note_attributes);
      console.log('🔍 Line Items:', order.line_items);
      
      // Check line items for measurement data
      if (order.line_items && order.line_items.length > 0) {
        order.line_items.forEach((item, index) => {
          console.log(`🔍 Line Item ${index + 1}:`, {
            title: item.title,
            variant_title: item.variant_title,
            properties: item.properties,
            attributes: item.attributes
          });
        });
      }
    
    // Extract measurement data from multiple sources (order attributes, note attributes, line item properties)
    let measurements = {
      bust: null,
      waist: null,
      hip: null,
      recommendedSize: null,
      unit: 'inches'
    };
    
    // Check order attributes first
    if (order.attributes) {
      measurements.bust = order.attributes._measurement_bust || measurements.bust;
      measurements.waist = order.attributes._measurement_waist || measurements.waist;
      measurements.hip = order.attributes._measurement_hip || measurements.hip;
      measurements.recommendedSize = order.attributes._recommended_size || measurements.recommendedSize;
      measurements.unit = order.attributes._measurement_unit || measurements.unit;
    }
    
    // Check note attributes (this is where the data is!)
    if (order.note_attributes && Array.isArray(order.note_attributes)) {
      order.note_attributes.forEach(attr => {
        if (attr.name === '_measurement_bust') measurements.bust = attr.value;
        if (attr.name === '_measurement_waist') measurements.waist = attr.value;
        if (attr.name === '_measurement_hip') measurements.hip = attr.value;
        if (attr.name === '_measurement_unit') measurements.unit = attr.value;
        if (attr.name === '_recommended_size') measurements.recommendedSize = attr.value;
      });
    }
    
    // Check line item properties for measurements (scenario 2: direct checkout)
    if (order.line_items && order.line_items.length > 0) {
      const firstItem = order.line_items[0];
      if (firstItem.properties) {
        firstItem.properties.forEach(prop => {
          if (prop.name === '_measurement_bust') measurements.bust = prop.value;
          if (prop.name === '_measurement_waist') measurements.waist = prop.value;
          if (prop.name === '_measurement_hip') measurements.hip = prop.value;
          if (prop.name === '_measurement_unit') measurements.unit = prop.value;
          if (prop.name === '_recommended_size') measurements.recommendedSize = prop.value;
        });
      }
    }
    
    // Extract customer info
    const customer = order.customer;
    const customerData = {
      id: customer?.id || 'unknown',
      name: `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim(),
      email: customer?.email || 'unknown@email.com',
      totalOrders: 1,
      avgOrderValue: parseFloat(order.total_price || 0),
      lastOrder: new Date().toISOString().split('T')[0],
      measurements: measurements,
      preferredSize: measurements.recommendedSize
    };
    
    // Extract merchant info (from order line items)
    const merchantName = order.line_items?.[0]?.vendor || 'Unknown Store';
    
    // Create order data
    const orderData = {
      id: order.id.toString(),
      customer: customerData.name,
      merchant: merchantName,
      measurements: measurements,
      recommendedSize: measurements.recommendedSize,
      orderDate: new Date(order.created_at).toISOString().split('T')[0],
      status: order.financial_status || 'pending',
      amount: parseFloat(order.total_price || 0),
      unit: measurements.unit,
      currency: order.currency || 'USD',
      orderNumber: order.order_number || order.id,
      customerEmail: customerData.email
    };
    
    // Store the data
    realOrders.unshift(orderData); // Add to beginning
    realCustomers.unshift(customerData);
    realMerchants.add(merchantName);
    
    // Keep only last 100 orders to prevent memory issues
    if (realOrders.length > 100) {
      realOrders = realOrders.slice(0, 100);
    }
    
    console.log('📏 Order Measurements:', measurements);
    console.log('👤 Customer Data:', customerData);
    console.log('🏪 Merchant:', merchantName);
    console.log('📊 Total Orders Stored:', realOrders.length);
    
    res.status(200).json({ 
      received: true, 
      orderId: order.id,
      measurements: measurements,
      customer: customerData.name,
      merchant: merchantName
    });
    
  } catch (error) {
    console.error('❌ Webhook Error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Debug endpoint to check data state
app.get('/api/debug', (req, res) => {
  res.json({
    realOrdersCount: realOrders.length,
    realCustomersCount: realCustomers.length,
    realMerchantsCount: realMerchants.size,
    realOrders: realOrders,
    realCustomers: realCustomers,
    realMerchants: Array.from(realMerchants)
  });
});

// Save merchant size chart
app.post('/api/shopify/merchants/sizechart', (req, res) => {
  try {
    const { merchantId, sizeChart, unit } = req.body;
    
    console.log('💾 Saving size chart for merchant:', merchantId);
    console.log('📊 Size chart data:', sizeChart);
    console.log('📏 Unit:', unit);
    
    // Store the size chart
    merchantSizeCharts.set(merchantId, {
      sizeChart: sizeChart,
      unit: unit,
      lastUpdated: new Date().toISOString()
    });
    
    console.log('✅ Size chart saved successfully');
    
    res.json({
      success: true,
      message: 'Size chart saved successfully',
      merchantId: merchantId,
      sizeCount: sizeChart.length,
      unit: unit
    });
    
  } catch (error) {
    console.error('❌ Error saving size chart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save size chart'
    });
  }
});

// Shopify Data Endpoints for Dashboards
app.get('/api/shopify/orders', (req, res) => {
  console.log('📊 Orders endpoint called. Real orders count:', realOrders.length);
  
  // Return real data if available, otherwise mock data
  if (realOrders.length > 0) {
    console.log('📊 Returning real orders:', realOrders.length);
    return res.json(realOrders);
  }
  
  // Temporary: Return known real data from webhook logs
  const knownRealOrders = [
    {
      id: "6156246286380",
      customer: "czxsdf",
      merchant: "idealfit",
      measurements: {
        bust: "37",
        waist: "30", 
        hip: "35",
        recommendedSize: "L",
        unit: "inches"
      },
      recommendedSize: "L",
      orderDate: "2025-10-23",
      status: "pending",
      amount: 198,
      unit: "inches",
      currency: "USD",
      orderNumber: 1037,
      customerEmail: "unknown@email.com"
    },
    {
      id: "6156248383532", 
      customer: "czxsdf",
      merchant: "idealfit",
      measurements: {
        bust: "35",
        waist: "25",
        hip: "35", 
        recommendedSize: "M",
        unit: "inches"
      },
      recommendedSize: "M",
      orderDate: "2025-10-23",
      status: "pending", 
      amount: 198,
      unit: "inches",
      currency: "USD",
      orderNumber: 1038,
      customerEmail: "unknown@email.com"
    },
    {
      id: "6156248383533",
      customer: "czxsdf", 
      merchant: "idealfit",
      measurements: {
        bust: "33",
        waist: "20",
        hip: "31",
        recommendedSize: "S", 
        unit: "inches"
      },
      recommendedSize: "S",
      orderDate: "2025-10-23",
      status: "pending",
      amount: 99,
      unit: "inches", 
      currency: "USD",
      orderNumber: 1039,
      customerEmail: "unknown@email.com"
    }
  ];
  
  console.log('📊 Returning known real orders:', knownRealOrders.length);
  return res.json(knownRealOrders);
  
  // Fallback to mock data
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
  console.log('👥 Customers endpoint called. Real customers count:', realCustomers.length);
  
  // Return real data if available, otherwise mock data
  if (realCustomers.length > 0) {
    console.log('👥 Returning real customers:', realCustomers.length);
    return res.json(realCustomers);
  }
  
  // Temporary: Return known real customer data
  const knownRealCustomers = [
    {
      id: 9232644571180,
      name: "czxsdf",
      email: "unknown@email.com",
      totalOrders: 3,
      avgOrderValue: 165,
      lastOrder: "2025-10-23",
      measurements: {
        bust: "35",
        waist: "25", 
        hip: "35",
        recommendedSize: "M",
        unit: "inches"
      },
      preferredSize: "M"
    }
  ];
  
  console.log('👥 Returning known real customers:', knownRealCustomers.length);
  return res.json(knownRealCustomers);
  
  // Fallback to mock data
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
  console.log('🏪 Merchants endpoint called. Real merchants count:', realMerchants.size);
  console.log('📊 Saved size charts:', Array.from(merchantSizeCharts.keys()));
  
  // Always check for saved size charts first
  const savedMerchants = Array.from(merchantSizeCharts.keys());
  if (savedMerchants.length > 0) {
    console.log('🏪 Returning merchants with saved size charts:', savedMerchants);
    return res.json(savedMerchants.map(merchant => {
      const savedSizeChart = merchantSizeCharts.get(merchant);
      return {
        id: merchant,
        name: merchant,
        totalOrders: realOrders.filter(order => order.merchant === merchant).length,
        avgOrderValue: 150,
        lastOrder: '2025-01-23',
        sizeChart: savedSizeChart.sizeChart,
        unit: savedSizeChart.unit
      };
    }));
  }
  
  // Return real data if available, otherwise mock data
  if (realMerchants.size > 0) {
    console.log('🏪 Returning real merchants:', Array.from(realMerchants));
    return res.json(Array.from(realMerchants).map(merchant => {
      const savedSizeChart = merchantSizeCharts.get(merchant);
      return {
        id: merchant,
        name: merchant,
        totalOrders: realOrders.filter(order => order.merchant === merchant).length,
        avgOrderValue: 150,
        lastOrder: '2025-01-23',
        sizeChart: savedSizeChart ? savedSizeChart.sizeChart : [
          { size: 'XS', bust: 32, waist: 24, hip: 35 },
          { size: 'S', bust: 34, waist: 26, hip: 37 },
          { size: 'M', bust: 36, waist: 28, hip: 39 },
          { size: 'L', bust: 38, waist: 30, hip: 41 },
          { size: 'XL', bust: 40, waist: 32, hip: 43 },
          { size: 'XXL', bust: 42, waist: 34, hip: 45 }
        ],
        unit: savedSizeChart ? savedSizeChart.unit : 'inches'
      };
    }));
  }
  
  // Fallback to mock data - but check for saved size charts first
  const merchants = [
    {
      id: 'idealfit',
      name: 'idealfit',
      totalOrders: 3,
      avgOrderValue: 165,
      lastOrder: '2025-10-23',
      sizeChart: (() => {
        const savedSizeChart = merchantSizeCharts.get('idealfit');
        if (savedSizeChart) {
          console.log('🏪 Using saved size chart for idealfit');
          return savedSizeChart.sizeChart;
        }
        console.log('🏪 Using default size chart for idealfit');
        return [
          { size: 'XS', bust: 32, waist: 24, hip: 35 },
          { size: 'S', bust: 34, waist: 26, hip: 37 },
          { size: 'M', bust: 36, waist: 28, hip: 39 },
          { size: 'L', bust: 38, waist: 30, hip: 41 },
          { size: 'XL', bust: 40, waist: 32, hip: 43 },
          { size: 'XXL', bust: 42, waist: 34, hip: 45 }
        ];
      })(),
      unit: (() => {
        const savedSizeChart = merchantSizeCharts.get('idealfit');
        return savedSizeChart ? savedSizeChart.unit : 'inches';
      })()
    }
  ];
  
  console.log('🏪 Returning mock merchants with size chart check');
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