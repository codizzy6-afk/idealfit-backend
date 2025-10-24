import express from 'express';
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'IdealFit API Server',
    status: 'working',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/test - Health check',
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

// Serve static files
app.use(express.static('.'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎯 IdealFit API Server running on port ${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET  /api/test`);
  console.log(`   GET  /api/shopify-rest-customers`);
  console.log(`   GET  /api/shopify-rest-orders`);
  console.log(`   GET  /merchant-master-dashboard-enhanced.html`);
  console.log(`   GET  /company-admin-dashboard.html`);
});
