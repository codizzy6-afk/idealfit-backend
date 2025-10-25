import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
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

// Shopify OAuth callback endpoint
app.get('/auth/callback', (req, res) => {
  const { code, state, shop } = req.query;
  
  console.log('OAuth callback received:', { code, state, shop });
  
  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Missing authorization code',
      message: 'Authorization code is required'
    });
  }
  
  res.json({
    success: true,
    code: code,
    state: state,
    shop: shop,
    message: 'OAuth callback received successfully. Use this code to exchange for access token.'
  });
});

// Shopify OAuth status endpoint
app.get('/auth/status', (req, res) => {
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  
  res.json({
    success: true,
    hasToken: !!accessToken,
    tokenConfigured: accessToken ? 'Yes' : 'No',
    message: accessToken ? 'Access token is configured' : 'Access token not configured'
  });
});

// Persistent storage for size charts (file-based)
const DATA_FILE = path.join(process.cwd(), 'sizechart-data.json');

// Load size charts from file or use default
function loadSizeCharts() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading size charts from file:', error);
  }
  
  // Default size chart
  return [
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
}

// Save size charts to file
function saveSizeCharts(charts) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(charts, null, 2));
    console.log('✅ Size charts saved to file');
  } catch (error) {
    console.error('Error saving size charts to file:', error);
  }
}

let sizeCharts = loadSizeCharts();
console.log('📦 Loaded size charts from file:', sizeCharts.length);

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
  
  // Save to file for persistence
  saveSizeCharts(sizeCharts);
  
  res.json({
    success: true,
    message: 'Size chart saved successfully',
    data: sizeCharts.find(chart => chart.shop === shop)
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
    measurements: {
      bust: bustInches,
      waist: waistInches,
      hip: hipInches,
      unit: 'inches'
    },
    message: 'Measurement saved successfully'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'IdealFit API Server',
    status: 'working',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/test - Health check',
      'GET /auth/callback - Shopify OAuth callback',
      'GET /auth/status - OAuth status check',
      'GET /api/sizecharts - Get size charts',
      'POST /api/sizecharts - Save size chart',
      'POST /api/save-measurement - Save customer measurement',
      'GET /api/shopify-rest-customers - Shopify customers',
      'GET /api/shopify-rest-orders - Shopify orders',
      'GET /api/shopify-rest-analytics - Shopify analytics'
    ]
  });
});

// Shopify REST API Configuration
const SHOPIFY_CONFIG = {
  shop: 'idealfit-2.myshopify.com',
  apiKey: 'df65d05c59fdde03db6cad23f63bb6e7',
  apiSecret: process.env.SHOPIFY_API_SECRET || 'your-api-secret',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || 'your-access-token',
  apiVersion: '2025-10'
};

// Helper function to make Shopify API calls
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
      return {
        id: customer.id.toString(),
        firstName: customer.first_name || `Customer ${customer.id}`,
        lastName: customer.last_name || '',
        email: customer.email || `customer${customer.id}@shopify.com`,
        phone: customer.phone || 'N/A',
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
        statistics: {
          totalOrders: customer.orders_count || 0,
          totalSpent: parseFloat(customer.total_spent || 0),
          averageOrderValue: customer.orders_count > 0 ? parseFloat((customer.total_spent / customer.orders_count).toFixed(2)) : 0
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
      data: [],
      fallback: true,
      message: 'Using fallback data - Shopify REST API unavailable'
    });
  }
});

// Get Shopify orders via REST API
app.get('/api/shopify-rest-orders', async (req, res) => {
  try {
    const { limit = 50, status } = req.query;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);
    if (status) {
      queryParams.append('status', status);
    }
    
    const endpoint = `orders.json?${queryParams}`;
    const data = await shopifyApiCall(endpoint);
    
    // Transform Shopify data to our format
    const orders = data.orders.map(order => {
      const measurements = {};
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
        orderNumber: `#${order.order_number}`,
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
          address1: order.shipping_address.address1,
          address2: order.shipping_address.address2,
          city: order.shipping_address.city,
          province: order.shipping_address.province,
          country: order.shipping_address.country,
          zip: order.shipping_address.zip
        } : null,
        billingAddress: order.billing_address ? {
          address1: order.billing_address.address1,
          address2: order.billing_address.address2,
          city: order.billing_address.city,
          province: order.billing_address.province,
          country: order.billing_address.country,
          zip: order.billing_address.zip
        } : null,
        lineItems: order.line_items ? order.line_items.map(item => ({
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
        })) : []
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
    res.json({
      success: true,
      data: {
        summary: {
          totalOrders: 0,
          totalRevenue: 0,
          uniqueCustomers: 0,
          averageOrderValue: 0,
          totalProducts: 0,
          totalInventory: 0
        },
        sizeDistribution: [],
        sizeDistributionObject: {},
        statusDistribution: {},
        recentActivity: {
          orders: 0,
          revenue: 0
        },
        topCustomers: [],
        topProducts: [],
        period: req.query.period || '30d',
        dateRange: {
          start: new Date().toISOString(),
          end: new Date().toISOString()
        }
      },
      fallback: true,
      message: 'Using fallback data due to API error'
    });
  }
});

// Serve static files
app.use(express.static('.'));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🎯 IdealFit API Server running on port ${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET  /api/test`);
  console.log(`   GET  /api/shopify-rest-customers`);
  console.log(`   GET  /api/shopify-rest-orders`);
  console.log(`   GET  /merchant-master-dashboard-enhanced.html`);
  console.log(`   GET  /company-admin-dashboard.html`);
});
