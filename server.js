import express from 'express';
// import { generateOAuthURL, exchangeCodeForToken, SHOPIFY_OAUTH_CONFIG } from './shopify-oauth.js';
const app = express();

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Store orders and customers in memory (in production, use a database)
let orders = [
  {
    id: '6156246286380',
    orderNumber: '#1001',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@email.com',
    customerPhone: '+1-555-0123',
    customerAddress: '123 Main Street, New York, NY, USA',
    orderDate: '2025-10-23',
    status: 'fulfilled',
    total: 89.99,
    measurements: {
      bust: 37,
      waist: 30,
      hip: 35,
      unit: 'inches',
      recommendedSize: 'L'
    },
    items: [
      {
        productId: '8033243299884',
        productTitle: 'Premium Dress',
        variantTitle: 'Large',
        quantity: 1,
        price: 89.99
      }
    ]
  },
  {
    id: '6156246286381',
    orderNumber: '#1002',
    customerName: 'Emily Davis',
    customerEmail: 'emily.davis@email.com',
    customerPhone: '+1-555-0456',
    customerAddress: '456 Oak Avenue, Los Angeles, CA, USA',
    orderDate: '2025-10-23',
    status: 'pending',
    total: 129.99,
    measurements: {
      bust: 35,
      waist: 25,
      hip: 35,
      unit: 'inches',
      recommendedSize: 'M'
    },
    items: [
      {
        productId: '8033243299885',
        productTitle: 'Elegant Blouse',
        variantTitle: 'Medium',
        quantity: 1,
        price: 129.99
      }
    ]
  },
  {
    id: '6156246286382',
    orderNumber: '#1003',
    customerName: 'Jessica Wilson',
    customerEmail: 'jessica.wilson@email.com',
    customerPhone: '+1-555-0789',
    customerAddress: '789 Pine Street, Chicago, IL, USA',
    orderDate: '2025-10-22',
    status: 'fulfilled',
    total: 79.99,
    measurements: {
      bust: 33,
      waist: 20,
      hip: 31,
      unit: 'inches',
      recommendedSize: 'S'
    },
    items: [
      {
        productId: '8033243299886',
        productTitle: 'Casual Top',
        variantTitle: 'Small',
        quantity: 1,
        price: 79.99
      }
    ]
  }
];

let customers = [
  {
    id: 'cus_001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0123',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    totalOrders: 3,
    totalSpent: 269.97,
    lastOrderDate: '2025-10-23',
    measurements: {
      bust: 37,
      waist: 30,
      hip: 35,
      unit: 'inches',
      recommendedSize: 'L'
    },
    createdAt: '2025-10-20'
  },
  {
    id: 'cus_002',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1-555-0456',
    address: '456 Oak Avenue',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    totalOrders: 2,
    totalSpent: 199.98,
    lastOrderDate: '2025-10-23',
    measurements: {
      bust: 35,
      waist: 25,
      hip: 35,
      unit: 'inches',
      recommendedSize: 'M'
    },
    createdAt: '2025-10-21'
  },
  {
    id: 'cus_003',
    name: 'Jessica Wilson',
    email: 'jessica.wilson@email.com',
    phone: '+1-555-0789',
    address: '789 Pine Street',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    totalOrders: 1,
    totalSpent: 79.99,
    lastOrderDate: '2025-10-22',
    measurements: {
      bust: 33,
      waist: 20,
      hip: 31,
      unit: 'inches',
      recommendedSize: 'S'
    },
    createdAt: '2025-10-22'
  }
];

// Store size charts in memory (in production, use a database)
let sizeCharts = [
  {
    id: 1,
    shop: 'idealfit-2.myshopify.com',
    sizeChart: [
      { size: 'XS', bust: 30, waist: 25, hip: 35 },
      { size: 'S', bust: 32, waist: 27, hip: 37 },
      { size: 'M', bust: 34, waist: 29, hip: 39 },
      { size: 'L', bust: 36, waist: 31, hip: 41 },
      { size: 'XL', bust: 38, waist: 33, hip: 43 },
      { size: 'XXL', bust: 40, waist: 35, hip: 45 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Shopify OAuth endpoints
app.get('/auth/shopify', (req, res) => {
  try {
    const { url, state } = generateOAuthURL();
    
    // Store state in session (in production, use proper session storage)
    console.log('🔐 OAuth state:', state);
    
    res.json({
      success: true,
      authUrl: url,
      message: 'Visit this URL to authorize the app',
      instructions: [
        '1. Click the authUrl to open Shopify authorization',
        '2. Log in to your Shopify store',
        '3. Authorize the app permissions',
        '4. Copy the authorization code from the callback URL',
        '5. Use POST /auth/exchange with the code'
      ]
    });
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate OAuth URL',
      message: error.message
    });
  }
});

app.post('/auth/exchange', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required'
      });
    }
    
    console.log('🔄 Exchanging authorization code for access token...');
    const tokenData = await exchangeCodeForToken(code, state);
    
    console.log('✅ Access token obtained successfully');
    
    res.json({
      success: true,
      message: 'Access token obtained successfully',
      accessToken: tokenData.access_token,
      scope: tokenData.scope,
      instructions: [
        '1. Set environment variable: SHOPIFY_ACCESS_TOKEN=' + tokenData.access_token,
        '2. Restart the server: node server.js',
        '3. Test endpoints to verify real Shopify data',
        '4. Check dashboard for live customer data'
      ]
    });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to exchange authorization code',
      message: error.message
    });
  }
});

app.get('/auth/callback', (req, res) => {
  const { code, state, shop } = req.query;
  
  if (!code) {
    return res.status(400).send(`
      <html>
        <body>
          <h1>Authorization Failed</h1>
          <p>No authorization code received from Shopify.</p>
          <p>Please try the OAuth flow again.</p>
          <a href="/auth/shopify">Try Again</a>
        </body>
      </html>
    `);
  }
  
  // In a real app, you'd redirect to your frontend with the code
  // For now, we'll show instructions
  res.send(`
    <html>
      <body>
        <h1>Authorization Successful!</h1>
        <p>Authorization code received: <code>${code}</code></p>
        <p>State: <code>${state}</code></p>
        <p>Shop: <code>${shop}</code></p>
        
        <h2>Next Steps:</h2>
        <ol>
          <li>Copy the authorization code above</li>
          <li>Send a POST request to <code>/auth/exchange</code> with the code</li>
          <li>Or use this curl command:</li>
        </ol>
        
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">
curl -X POST http://localhost:3001/auth/exchange \\
  -H "Content-Type: application/json" \\
  -d '{"code": "${code}", "state": "${state}"}'
        </pre>
        
        <p><a href="/auth/shopify">Start Over</a></p>
      </body>
    </html>
  `);
});

// Test endpoint to check current access token status
app.get('/auth/status', (req, res) => {
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || SHOPIFY_CONFIG.accessToken;
  
  res.json({
    success: true,
    hasAccessToken: accessToken && accessToken !== 'your-access-token',
    accessTokenSet: !!process.env.SHOPIFY_ACCESS_TOKEN,
    message: accessToken && accessToken !== 'your-access-token' 
      ? 'Access token is configured' 
      : 'Access token needs to be set',
    instructions: accessToken && accessToken !== 'your-access-token' 
      ? ['Access token is ready', 'Test endpoints to verify Shopify data']
      : [
          '1. Visit /auth/shopify to get authorization URL',
          '2. Complete OAuth flow',
          '3. Exchange code for access token',
          '4. Set SHOPIFY_ACCESS_TOKEN environment variable'
        ]
  });
});

// Health check endpoint for Render
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'IdealFit API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    shopifyToken: process.env.SHOPIFY_ACCESS_TOKEN ? 'Configured' : 'Not configured'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'IdealFit API Server',
    status: 'working',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/health',
      'GET /auth/shopify',
      'POST /auth/exchange',
      'GET /auth/callback',
      'GET /auth/status',
      'GET /api/sizecharts',
      'POST /api/sizecharts',
      'PUT /api/sizecharts/:id',
      'POST /api/save-measurement',
      'POST /api/recommend-size',
      'GET /api/orders',
      'GET /api/customers',
      'GET /api/analytics',
      'GET /api/shopify-orders',
      'GET /api/shopify-customers',
      'GET /api/shopify-products',
      'GET /api/shopify-analytics',
      'GET /api/shopify-rest-orders',
      'GET /api/shopify-rest-customers',
      'GET /api/shopify-rest-products',
      'GET /api/shopify-rest-analytics',
      'POST /api/convert-units'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'IdealFit API is working!',
    timestamp: new Date().toISOString()
  });
});

// Get size charts
app.get('/api/sizecharts', (req, res) => {
  const { shop } = req.query;
  
  let charts = sizeCharts;
  if (shop) {
    charts = sizeCharts.filter(chart => chart.shop === shop);
  }
  
  res.json({
    success: true,
    data: charts,
    count: charts.length
  });
});

// Create/Update size chart
app.post('/api/sizecharts', (req, res) => {
  const { shop, sizeChart } = req.body;
  
  if (!shop || !sizeChart) {
    return res.status(400).json({
      success: false,
      error: 'Missing shop or sizeChart data'
    });
  }
  
  // Check if size chart already exists for this shop
  const existingIndex = sizeCharts.findIndex(chart => chart.shop === shop);
  
  if (existingIndex >= 0) {
    // Update existing
    sizeCharts[existingIndex] = {
      ...sizeCharts[existingIndex],
      sizeChart,
      updatedAt: new Date().toISOString()
    };
  } else {
    // Create new
    const newChart = {
      id: sizeCharts.length + 1,
      shop,
      sizeChart,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    sizeCharts.push(newChart);
  }
  
  res.json({
    success: true,
    message: 'Size chart saved successfully',
    data: sizeCharts.find(chart => chart.shop === shop)
  });
});

// Update specific size chart
app.put('/api/sizecharts/:id', (req, res) => {
  const { id } = req.params;
  const { sizeChart } = req.body;
  
  const chartIndex = sizeCharts.findIndex(chart => chart.id === parseInt(id));
  
  if (chartIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Size chart not found'
    });
  }
  
  sizeCharts[chartIndex] = {
    ...sizeCharts[chartIndex],
    sizeChart,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Size chart updated successfully',
    data: sizeCharts[chartIndex]
  });
});

// Save customer measurement
app.post('/api/save-measurement', (req, res) => {
  const { bust, waist, hip, unit = 'inches', customerName, productId, shop } = req.body;
  
  if (!bust || !waist || !hip) {
    return res.status(400).json({
      success: false,
      error: 'Missing measurements'
    });
  }
  
  // Get size chart for the shop
  const shopChart = sizeCharts.find(chart => chart.shop === shop);
  const sizeChart = shopChart ? shopChart.sizeChart : [
    { size: 'XS', bust: 30, waist: 25, hip: 35 },
    { size: 'S', bust: 32, waist: 27, hip: 37 },
    { size: 'M', bust: 34, waist: 29, hip: 39 },
    { size: 'L', bust: 36, waist: 31, hip: 41 },
    { size: 'XL', bust: 38, waist: 33, hip: 43 },
    { size: 'XXL', bust: 40, waist: 35, hip: 45 }
  ];
  
  // Convert measurements to inches for comparison
  const inchesToCm = (inches) => inches * 2.54;
  const cmToInches = (cm) => cm / 2.54;
  
  const bustInches = unit === 'cm' ? cmToInches(bust) : bust;
  const waistInches = unit === 'cm' ? cmToInches(waist) : waist;
  const hipInches = unit === 'cm' ? cmToInches(hip) : hip;
  
  // Find recommended size
  let recommendedSize = 'XXL'; // Default to largest
  for (const size of sizeChart) {
    if (bustInches <= size.bust && waistInches <= size.waist && hipInches <= size.hip) {
      recommendedSize = size.size;
      break;
    }
  }
  
  // In a real application, save to database
  console.log('📏 Measurement saved:', {
    customerName,
    productId,
    shop,
    measurements: { bust: bustInches, waist: waistInches, hip: hipInches },
    unit: 'inches',
    recommendedSize
  });
  
  res.json({
    success: true,
    recommendedSize,
    measurements: { bust: bustInches, waist: waistInches, hip: hipInches },
    unit: 'inches',
    message: 'Measurement saved successfully'
  });
});

// Size recommendation endpoint (legacy)
app.post('/api/recommend-size', (req, res) => {
  const { bust, waist, hip, unit = 'inches' } = req.body;
  
  if (!bust || !waist || !hip) {
    return res.status(400).json({
      error: 'Missing measurements'
    });
  }

  const sizeChart = [
    { size: 'XS', bust: 30, waist: 25, hip: 35 },
    { size: 'S', bust: 32, waist: 27, hip: 37 },
    { size: 'M', bust: 34, waist: 29, hip: 39 },
    { size: 'L', bust: 36, waist: 31, hip: 41 },
    { size: 'XL', bust: 38, waist: 33, hip: 43 },
    { size: 'XXL', bust: 40, waist: 35, hip: 45 }
  ];

  const inchesToCm = (inches) => inches * 2.54;
  const cmToInches = (cm) => cm / 2.54;
  
  const bustInches = unit === 'cm' ? cmToInches(bust) : bust;
  const waistInches = unit === 'cm' ? cmToInches(waist) : waist;
  const hipInches = unit === 'cm' ? cmToInches(hip) : hip;

  let recommendedSize = 'XXL';
  for (const size of sizeChart) {
    if (bustInches <= size.bust && waistInches <= size.waist && hipInches <= size.hip) {
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

// Get Shopify orders (proxied to Shopify app)
app.get('/api/shopify-orders', async (req, res) => {
  try {
    const { limit = 50, status, financial_status, fulfillment_status } = req.query;
    
    // Proxy to Shopify app
    const shopifyAppUrl = 'http://localhost:3000/api/shopify-orders';
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit);
    if (status) queryParams.append('status', status);
    if (financial_status) queryParams.append('financial_status', financial_status);
    if (fulfillment_status) queryParams.append('fulfillment_status', fulfillment_status);
    
    const response = await fetch(`${shopifyAppUrl}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '',
        'Cookie': req.headers.cookie || ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Error proxying Shopify orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Shopify orders',
      data: []
    });
  }
});

// Get Shopify customers (proxied to Shopify app)
app.get('/api/shopify-customers', async (req, res) => {
  try {
    const { limit = 50, search } = req.query;
    
    // Proxy to Shopify app
    const shopifyAppUrl = 'http://localhost:3000/api/shopify-customers';
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    
    const response = await fetch(`${shopifyAppUrl}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '',
        'Cookie': req.headers.cookie || ''
      }
    });
    
    if (!response.ok) {
      // Shopify app not available, return fallback data
      console.log('⚠️ Shopify app not available, returning fallback customer data');
      return res.json({
        success: true,
        data: customers,
        fallback: true,
        message: 'Using fallback data - Shopify app not available'
      });
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    // Shopify app not available, return fallback data
    console.log('⚠️ Shopify app not available, returning fallback customer data');
    res.json({
      success: true,
      data: customers,
      fallback: true,
      message: 'Using fallback data - Shopify app not available'
    });
  }
});

// Get Shopify products (proxied to Shopify app)
app.get('/api/shopify-products', async (req, res) => {
  try {
    const { limit = 50, search, product_type, vendor } = req.query;
    
    // Proxy to Shopify app
    const shopifyAppUrl = 'http://localhost:3000/api/shopify-products';
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (product_type) queryParams.append('product_type', product_type);
    if (vendor) queryParams.append('vendor', vendor);
    
    const response = await fetch(`${shopifyAppUrl}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '',
        'Cookie': req.headers.cookie || ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('Error proxying Shopify products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Shopify products',
      data: []
    });
  }
});

// Shopify REST API configuration
const SHOPIFY_CONFIG = {
  shop: 'idealfit-2.myshopify.com',
  apiKey: 'df65d05c59fdde03db6cad23f63bb6e7',
  apiSecret: process.env.SHOPIFY_API_SECRET || 'your-api-secret',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || 'your-access-token', // This would be obtained through OAuth
  apiVersion: '2025-10'
};

// Helper function to make Shopify REST API calls
async function shopifyApiCall(endpoint, options = {}) {
  const url = `https://${SHOPIFY_CONFIG.shop}/admin/api/${SHOPIFY_CONFIG.apiVersion}/${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_CONFIG.accessToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  const requestOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Shopify API call failed for ${endpoint}:`, error.message);
    throw error;
  }
}

// Calculate size distribution from orders
function calculateSizeDistribution(orders) {
  const sizeDistribution = {};
  orders.forEach(order => {
    const size = order.measurements.recommendedSize;
    sizeDistribution[size] = (sizeDistribution[size] || 0) + 1;
  });
  return sizeDistribution;
}

// Get Shopify orders via REST API
app.get('/api/shopify-rest-orders', async (req, res) => {
  try {
    const { limit = 50, status, financial_status, fulfillment_status } = req.query;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);
    if (status) queryParams.append('status', status);
    if (financial_status) queryParams.append('financial_status', financial_status);
    if (fulfillment_status) queryParams.append('fulfillment_status', fulfillment_status);
    
    const endpoint = `orders.json?${queryParams}`;
    const data = await shopifyApiCall(endpoint);
    
    // Transform Shopify data to our format
    const orders = data.orders.map(order => {
      // Extract measurement data from note_attributes
      const measurements = {};
      const recommendedSize = null;
      
      if (order.note_attributes) {
        order.note_attributes.forEach(attr => {
          if (attr.name === '_measurement_bust') measurements.bust = parseFloat(attr.value);
          if (attr.name === '_measurement_waist') measurements.waist = parseFloat(attr.value);
          if (attr.name === '_measurement_hip') measurements.hip = parseFloat(attr.value);
          if (attr.name === '_recommended_size') measurements.recommendedSize = attr.value;
          if (attr.name === '_measurement_unit') measurements.unit = attr.value;
        });
      }
      
      return {
        id: order.id.toString(),
        orderNumber: order.name,
        orderName: order.name,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        totalPrice: parseFloat(order.total_price),
        currency: order.currency,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        measurements: measurements,
        customer: order.customer ? {
          id: order.customer.id.toString(),
          firstName: order.customer.first_name || `Customer ${order.customer.id}`,
          lastName: order.customer.last_name || '',
          email: order.customer.email || `customer${order.customer.id}@shopify.com`,
          phone: order.customer.phone || 'N/A',
          address: order.customer.default_address ? {
            address1: order.customer.default_address.address1,
            address2: order.customer.default_address.address2,
            city: order.customer.default_address.city,
            province: order.customer.default_address.province,
            country: order.customer.default_address.country,
            zip: order.customer.default_address.zip
          } : null
        } : null,
      shippingAddress: order.shipping_address ? {
        firstName: order.shipping_address.first_name,
        lastName: order.shipping_address.last_name,
        phone: order.shipping_address.phone,
        address1: order.shipping_address.address1,
        address2: order.shipping_address.address2,
        city: order.shipping_address.city,
        province: order.shipping_address.province,
        country: order.shipping_address.country,
        zip: order.shipping_address.zip
      } : null,
      billingAddress: order.billing_address ? {
        firstName: order.billing_address.first_name,
        lastName: order.billing_address.last_name,
        phone: order.billing_address.phone,
        address1: order.billing_address.address1,
        address2: order.billing_address.address2,
        city: order.billing_address.city,
        province: order.billing_address.province,
        country: order.billing_address.country,
        zip: order.billing_address.zip
      } : null,
        lineItems: order.line_items.map(item => ({
          id: item.id.toString(),
          title: item.title,
          variantTitle: item.variant_title,
          quantity: item.quantity,
          price: parseFloat(item.price),
          currency: order.currency,
          product: {
            id: item.product_id.toString(),
            title: item.name
          }
        }))
      };
    });
    
    res.json({
      success: true,
      data: orders,
      total: orders.length,
      fallback: false,
      message: 'Data fetched from Shopify REST API'
    });
    
  } catch (error) {
    console.error('Error fetching Shopify orders via REST API:', error);
    // Return fallback data
    res.json({
      success: true,
      data: orders,
      fallback: true,
      message: 'Using fallback data - Shopify REST API unavailable'
    });
  }
});

// Get Shopify customers via REST API
app.get('/api/shopify-rest-customers', async (req, res) => {
  try {
    const { limit = 50, search } = req.query;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);
    if (search) {
      queryParams.append('query', search);
    }
    
    const endpoint = `customers.json?${queryParams}`;
    const data = await shopifyApiCall(endpoint);
    
    // Transform Shopify data to our format
    const customers = data.customers.map(customer => {
      // Calculate customer statistics (we'll need to fetch orders separately for accurate stats)
      const totalOrders = customer.orders_count || 0;
      const totalSpent = parseFloat(customer.total_spent || 0);
      const lastOrderDate = customer.last_order_date;
      
      return {
        id: customer.id.toString(),
        firstName: customer.first_name || `Customer ${customer.id}`,
        lastName: customer.last_name || '',
        email: customer.email || `customer${customer.id}@shopify.com`,
        phone: customer.phone || 'N/A',
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
        defaultAddress: customer.default_address ? {
          address1: customer.default_address.address1,
          address2: customer.default_address.address2,
          city: customer.default_address.city,
          province: customer.default_address.province,
          country: customer.default_address.country,
          zip: customer.default_address.zip
        } : null,
        addresses: customer.addresses ? customer.addresses.map(addr => ({
          id: addr.id.toString(),
          address1: addr.address1,
          address2: addr.address2,
          city: addr.city,
          province: addr.province,
          country: addr.country,
          zip: addr.zip,
          firstName: addr.first_name,
          lastName: addr.last_name,
          phone: addr.phone
        })) : [],
        orders: [], // Will be populated separately if needed
        statistics: {
          totalOrders,
          totalSpent,
          lastOrderDate,
          averageOrderValue: totalOrders > 0 ? parseFloat((totalSpent / totalOrders).toFixed(2)) : 0
        }
      };
    });
    
    res.json({
      success: true,
      data: customers,
      total: customers.length,
      fallback: false,
      message: 'Data fetched from Shopify REST API'
    });
    
  } catch (error) {
    console.error('Error fetching Shopify customers via REST API:', error);
    // Return fallback data
    res.json({
      success: true,
      data: customers,
      fallback: true,
      message: 'Using fallback data - Shopify REST API unavailable'
    });
  }
});

// Get Shopify products via REST API
app.get('/api/shopify-rest-products', async (req, res) => {
  try {
    const { limit = 50, search, product_type, vendor } = req.query;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);
    if (search) queryParams.append('title', search);
    if (product_type) queryParams.append('product_type', product_type);
    if (vendor) queryParams.append('vendor', vendor);
    
    const endpoint = `products.json?${queryParams}`;
    const data = await shopifyApiCall(endpoint);
    
    // Transform Shopify data to our format
    const products = data.products.map(product => ({
      id: product.id.toString(),
      title: product.title,
      handle: product.handle,
      description: product.body_html,
      productType: product.product_type,
      vendor: product.vendor,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      status: product.status,
      totalInventory: product.variants.reduce((sum, variant) => sum + (variant.inventory_quantity || 0), 0),
      variants: product.variants.map(variant => ({
        id: variant.id.toString(),
        title: variant.title,
        sku: variant.sku,
        price: parseFloat(variant.price),
        compareAtPrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
        inventoryQuantity: variant.inventory_quantity || 0,
        weight: variant.weight,
        weightUnit: variant.weight_unit,
        availableForSale: variant.available,
        selectedOptions: variant.option1 ? [
          { name: 'Option 1', value: variant.option1 },
          { name: 'Option 2', value: variant.option2 },
          { name: 'Option 3', value: variant.option3 }
        ].filter(opt => opt.value) : [],
        image: variant.image_id ? {
          url: product.images.find(img => img.id === variant.image_id)?.src,
          altText: product.images.find(img => img.id === variant.image_id)?.alt
        } : null
      })),
      images: product.images.map(image => ({
        id: image.id.toString(),
        url: image.src,
        altText: image.alt,
        width: image.width,
        height: image.height
      })),
      options: product.options.map(option => ({
        id: option.id.toString(),
        name: option.name,
        values: option.values
      })),
      tags: product.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      seo: {
        title: product.title,
        description: product.body_html.replace(/<[^>]*>/g, '').substring(0, 160)
      }
    }));
    
    res.json({
      success: true,
      data: products,
      total: products.length,
      fallback: false,
      message: 'Data fetched from Shopify REST API'
    });
    
  } catch (error) {
    console.error('Error fetching Shopify products via REST API:', error);
    // Return fallback data
    res.json({
      success: true,
      data: [],
      fallback: true,
      message: 'Using fallback data - Shopify REST API unavailable'
    });
  }
});

// Get Shopify analytics via REST API
app.get('/api/shopify-rest-analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    const startDateISO = startDate.toISOString();
    
    // Fetch orders for the period
    const ordersEndpoint = `orders.json?created_at_min=${startDateISO}&limit=250`;
    const ordersData = await shopifyApiCall(ordersEndpoint);
    
    // Fetch customers
    const customersEndpoint = `customers.json?limit=250`;
    const customersData = await shopifyApiCall(customersEndpoint);
    
    // Fetch products (with error handling)
    let productsData = { products: [] };
    try {
      const productsEndpoint = `products.json?limit=250`;
      productsData = await shopifyApiCall(productsEndpoint);
    } catch (error) {
      console.log('Products API not accessible, using empty products data');
    }
    
    // Process orders data
    const orders = ordersData.orders;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
    
    // Process customers data
    const customers = customersData.customers;
    const uniqueCustomers = customers.length;
    
    // Calculate customer statistics
    const customerStats = customers.map(customer => ({
      id: customer.id.toString(),
      name: `${customer.first_name || `Customer ${customer.id}`} ${customer.last_name || ''}`.trim(),
      email: customer.email || `customer${customer.id}@shopify.com`,
      totalOrders: customer.orders_count || 0,
      totalSpent: parseFloat(customer.total_spent || 0),
      averageOrderValue: customer.orders_count > 0 ? parseFloat((customer.total_spent / customer.orders_count).toFixed(2)) : 0
    }));
    
    // Process products data
    const products = productsData.products;
    const totalProducts = products.length;
    const totalInventory = products.reduce((sum, product) => {
      return sum + product.variants.reduce((variantSum, variant) => variantSum + (variant.inventory_quantity || 0), 0);
    }, 0);
    
    // Calculate size distribution from orders using measurement data
    const sizeDistribution = {};
    const measurementData = {};
    
    orders.forEach(order => {
      // Extract measurement data from note_attributes
      if (order.note_attributes) {
        let bust = null, waist = null, hip = null, recommendedSize = null;
        
        order.note_attributes.forEach(attr => {
          if (attr.name === '_measurement_bust') bust = parseFloat(attr.value);
          if (attr.name === '_measurement_waist') waist = parseFloat(attr.value);
          if (attr.name === '_measurement_hip') hip = parseFloat(attr.value);
          if (attr.name === '_recommended_size') recommendedSize = attr.value;
        });
        
        if (recommendedSize) {
          sizeDistribution[recommendedSize] = (sizeDistribution[recommendedSize] || 0) + 1;
          
          // Store measurement data for averaging
          if (!measurementData[recommendedSize]) {
            measurementData[recommendedSize] = { bust: [], waist: [], hip: [] };
          }
          
          if (bust) measurementData[recommendedSize].bust.push(bust);
          if (waist) measurementData[recommendedSize].waist.push(waist);
          if (hip) measurementData[recommendedSize].hip.push(hip);
        }
      }
    });
    
    // Convert size distribution to array format with real measurement averages
    const sizeDistributionArray = Object.keys(sizeDistribution).map(size => {
      const measurements = measurementData[size] || { bust: [], waist: [], hip: [] };
      const avgBust = measurements.bust.length > 0 ? 
        (measurements.bust.reduce((sum, val) => sum + val, 0) / measurements.bust.length).toFixed(1) : '0.0';
      const avgWaist = measurements.waist.length > 0 ? 
        (measurements.waist.reduce((sum, val) => sum + val, 0) / measurements.waist.length).toFixed(1) : '0.0';
      const avgHip = measurements.hip.length > 0 ? 
        (measurements.hip.reduce((sum, val) => sum + val, 0) / measurements.hip.length).toFixed(1) : '0.0';
      
      return {
        size,
        recommendations: sizeDistribution[size],
        percentage: totalOrders > 0 ? ((sizeDistribution[size] / totalOrders) * 100).toFixed(1) : '0.0',
        avgBust,
        avgWaist,
        avgHip,
        priority: sizeDistribution[size] > 2 ? 'HIGH' : 'MEDIUM'
      };
    }).sort((a, b) => b.recommendations - a.recommendations);
    
    // Calculate status distribution
    const statusDistribution = {};
    orders.forEach(order => {
      statusDistribution[order.fulfillment_status] = (statusDistribution[order.fulfillment_status] || 0) + 1;
    });
    
    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= sevenDaysAgo;
    });
    
    const recentRevenue = recentOrders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
    
    // Top customers by total spent
    const topCustomers = customerStats
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
    
    // Top products by inventory
    const topProducts = products
      .sort((a, b) => {
        const aInventory = a.variants.reduce((sum, variant) => sum + (variant.inventory_quantity || 0), 0);
        const bInventory = b.variants.reduce((sum, variant) => sum + (variant.inventory_quantity || 0), 0);
        return bInventory - aInventory;
      })
      .slice(0, 5)
      .map(product => ({
        id: product.id.toString(),
        title: product.title,
        productType: product.product_type,
        vendor: product.vendor,
        totalInventory: product.variants.reduce((sum, variant) => sum + (variant.inventory_quantity || 0), 0)
      }));
    
    res.json({
      success: true,
      data: {
        summary: {
          totalOrders,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          uniqueCustomers,
          averageOrderValue: totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0,
          totalProducts,
          totalInventory
        },
        sizeDistribution: sizeDistributionArray,
        sizeDistributionObject: sizeDistribution,
        statusDistribution,
        recentActivity: {
          orders: recentOrders.length,
          revenue: parseFloat(recentRevenue.toFixed(2))
        },
        topCustomers,
        topProducts,
        period,
        dateRange: {
          start: startDateISO,
          end: now.toISOString()
        }
      },
      fallback: false,
      message: 'Data fetched from Shopify REST API'
    });
    
  } catch (error) {
    console.error('Error fetching Shopify analytics via REST API:', error);
    // Return fallback data
    const sizeDistribution = calculateSizeDistribution(orders);
    res.json({
      success: true,
      data: {
        summary: {
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
          uniqueCustomers: customers.length,
          averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0
        },
        sizeDistribution: Object.keys(sizeDistribution).map(size => ({
          size,
          recommendations: sizeDistribution[size],
          percentage: ((sizeDistribution[size] / orders.length) * 100).toFixed(1),
          avgBust: '34.0',
          avgWaist: '28.0',
          avgHip: '36.0',
          priority: sizeDistribution[size] > 2 ? 'HIGH' : 'MEDIUM'
        })),
        topCustomers: customers.slice(0, 5).map(customer => ({
          name: customer.name,
          email: customer.email,
          totalSpent: customer.totalSpent,
          totalOrders: customer.totalOrders
        })),
        recentActivity: {
          orders: orders.length,
          revenue: orders.reduce((sum, order) => sum + order.total, 0)
        }
      },
      fallback: true,
      message: 'Using fallback data - Shopify REST API unavailable'
    });
  }
});

// Get Shopify analytics (proxied to Shopify app)
app.get('/api/shopify-analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Proxy to Shopify app
    const shopifyAppUrl = 'http://localhost:3000/api/shopify-analytics';
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period);
    
    const response = await fetch(`${shopifyAppUrl}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '',
        'Cookie': req.headers.cookie || ''
      }
    });
    
    if (!response.ok) {
      // Shopify app not available, return fallback analytics data
      console.log('⚠️ Shopify app not available, returning fallback analytics data');
      const sizeDistribution = calculateSizeDistribution(orders);
      return res.json({
        success: true,
        data: {
          summary: {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
            uniqueCustomers: customers.length,
            averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0
          },
          sizeDistribution: Object.keys(sizeDistribution).map(size => ({
            size,
            recommendations: sizeDistribution[size],
            percentage: ((sizeDistribution[size] / orders.length) * 100).toFixed(1),
            avgBust: '34.0',
            avgWaist: '28.0',
            avgHip: '36.0',
            priority: sizeDistribution[size] > 2 ? 'HIGH' : 'MEDIUM'
          })),
          topCustomers: customers.slice(0, 5).map(customer => ({
            name: customer.name,
            email: customer.email,
            totalSpent: customer.totalSpent,
            totalOrders: customer.totalOrders
          })),
          recentActivity: {
            orders: orders.length,
            revenue: orders.reduce((sum, order) => sum + order.total, 0)
          }
        },
        fallback: true,
        message: 'Using fallback data - Shopify app not available'
      });
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    // Shopify app not available, return fallback analytics data
    console.log('⚠️ Shopify app not available, returning fallback analytics data');
    const sizeDistribution = calculateSizeDistribution(orders);
    res.json({
      success: true,
      data: {
        summary: {
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
          uniqueCustomers: customers.length,
          averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0
        },
        sizeDistribution: Object.keys(sizeDistribution).map(size => ({
          size,
          recommendations: sizeDistribution[size],
          percentage: ((sizeDistribution[size] / orders.length) * 100).toFixed(1),
          avgBust: '34.0',
          avgWaist: '28.0',
          avgHip: '36.0',
          priority: sizeDistribution[size] > 2 ? 'HIGH' : 'MEDIUM'
        })),
        topCustomers: customers.slice(0, 5).map(customer => ({
          name: customer.name,
          email: customer.email,
          totalSpent: customer.totalSpent,
          totalOrders: customer.totalOrders
        })),
        recentActivity: {
          orders: orders.length,
          revenue: orders.reduce((sum, order) => sum + order.total, 0)
        }
      },
      fallback: true,
      message: 'Using fallback data - Shopify app not available'
    });
  }
});

// Get orders
app.get('/api/orders', (req, res) => {
  const { shop, status, limit = 50, offset = 0 } = req.query;
  
  let filteredOrders = orders;
  
  // Filter by status if provided
  if (status) {
    filteredOrders = orders.filter(order => order.status === status);
  }
  
  // Apply pagination
  const paginatedOrders = filteredOrders.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  
  res.json({
    success: true,
    data: paginatedOrders,
    total: filteredOrders.length,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

// Get customers
app.get('/api/customers', (req, res) => {
  const { shop, limit = 50, offset = 0, search } = req.query;
  
  let filteredCustomers = customers;
  
  // Filter by search term if provided
  if (search) {
    const searchLower = search.toLowerCase();
    filteredCustomers = customers.filter(customer => 
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.city.toLowerCase().includes(searchLower)
    );
  }
  
  // Apply pagination
  const paginatedCustomers = filteredCustomers.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  
  res.json({
    success: true,
    data: paginatedCustomers,
    total: filteredCustomers.length,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

// Get analytics data
app.get('/api/analytics', (req, res) => {
  const { shop, period = '30d' } = req.query;
  
  // Calculate analytics from orders and customers
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const uniqueCustomers = customers.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Size distribution from orders
  const sizeDistribution = calculateSizeDistribution(orders);
  
  // Convert sizeDistribution object to array format for dashboard compatibility
  const sizeDistributionArray = Object.keys(sizeDistribution).map(size => ({
    size,
    recommendations: sizeDistribution[size],
    percentage: 0, // Will be calculated
    avgBust: '34.0', // Default values
    avgWaist: '28.0',
    avgHip: '36.0',
    priority: sizeDistribution[size] > 2 ? 'HIGH' : 'MEDIUM'
  }));
  
  // Calculate percentages
  const totalRecommendations = sizeDistributionArray.reduce((sum, item) => sum + item.recommendations, 0);
  sizeDistributionArray.forEach(item => {
    item.percentage = totalRecommendations > 0 ? ((item.recommendations / totalRecommendations) * 100).toFixed(1) : '0.0';
  });
  
  // Sort by recommendations
  sizeDistributionArray.sort((a, b) => b.recommendations - a.recommendations);
  
  // Status distribution
  const statusDistribution = {};
  orders.forEach(order => {
    statusDistribution[order.status] = (statusDistribution[order.status] || 0) + 1;
  });
  
  // Recent activity (last 7 days)
  const recentOrders = orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return orderDate >= sevenDaysAgo;
  });
  
  res.json({
    success: true,
    data: {
      summary: {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        uniqueCustomers,
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2))
      },
      sizeDistribution: sizeDistributionArray, // Array format for dashboard
      sizeDistributionObject: sizeDistribution, // Object format for compatibility
      statusDistribution,
      recentActivity: {
        orders: recentOrders.length,
        revenue: recentOrders.reduce((sum, order) => sum + order.total, 0)
      },
      topCustomers: customers
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5)
        .map(customer => ({
          name: customer.name,
          email: customer.email,
          totalSpent: customer.totalSpent,
          totalOrders: customer.totalOrders
        }))
    }
  });
});

// Unit conversion endpoint
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎯 IdealFit API Server running on port ${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /auth/shopify`);
  console.log(`   POST /auth/exchange`);
  console.log(`   GET  /auth/callback`);
  console.log(`   GET  /auth/status`);
  console.log(`   GET  /api/sizecharts`);
  console.log(`   POST /api/sizecharts`);
  console.log(`   PUT  /api/sizecharts/:id`);
  console.log(`   POST /api/save-measurement`);
  console.log(`   POST /api/recommend-size`);
  console.log(`   GET  /api/orders`);
  console.log(`   GET  /api/customers`);
  console.log(`   GET  /api/analytics`);
  console.log(`   GET  /api/shopify-orders`);
  console.log(`   GET  /api/shopify-customers`);
  console.log(`   GET  /api/shopify-products`);
  console.log(`   GET  /api/shopify-analytics`);
  console.log(`   GET  /api/shopify-rest-orders`);
  console.log(`   GET  /api/shopify-rest-customers`);
  console.log(`   GET  /api/shopify-rest-products`);
  console.log(`   GET  /api/shopify-rest-analytics`);
  console.log(`   POST /api/convert-units`);
});
