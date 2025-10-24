/**
 * Standalone API Server for Merchant Dashboard
 * This server provides API endpoints to fetch measurement data without requiring Shopify CLI
 */

import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';
import { parse } from 'url';

const prisma = new PrismaClient();
const PORT = 3001; // Use different port to avoid conflicts

// Helper to send JSON response
function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Handle measurements endpoint
async function handleMeasurements(query) {
  try {
    const where = {};
    
    if (query.shop) {
      where.shop = query.shop;
    }
    
    // Date filters
    if (query.dateFrom || query.dateTo || query.month || query.year) {
      const dateFilter = {};
      
      // Custom date range
      if (query.dateFrom) {
        dateFilter.gte = new Date(query.dateFrom);
      }
      
      if (query.dateTo) {
        const toDate = new Date(query.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        dateFilter.lte = toDate;
      }
      
      // Month and year filters (override date range if specified)
      if (query.year && query.month) {
        const startDate = new Date(parseInt(query.year), parseInt(query.month) - 1, 1);
        const endDate = new Date(parseInt(query.year), parseInt(query.month), 0, 23, 59, 59, 999);
        dateFilter.gte = startDate;
        dateFilter.lte = endDate;
      } else if (query.year) {
        const startDate = new Date(parseInt(query.year), 0, 1);
        const endDate = new Date(parseInt(query.year), 11, 31, 23, 59, 59, 999);
        dateFilter.gte = startDate;
        dateFilter.lte = endDate;
      } else if (query.month) {
        // Current year, specific month
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, parseInt(query.month) - 1, 1);
        const endDate = new Date(currentYear, parseInt(query.month), 0, 23, 59, 59, 999);
        dateFilter.gte = startDate;
        dateFilter.lte = endDate;
      }
      
      if (Object.keys(dateFilter).length > 0) {
        where.date = dateFilter;
      }
    }
    
    // Size filter
    if (query.size) {
      where.recommendedSize = query.size;
    }
    
    // Fetch submissions
    const submissions = await prisma.submission.findMany({
      where,
      orderBy: { date: 'desc' }
    });
    
    // Format data
    const formattedData = submissions.map(s => ({
      id: s.id,
      date: s.date.toISOString().split('T')[0],
      name: s.customerName || 'Anonymous',
      email: '',
      bust: s.bust,
      waist: s.waist,
      hip: s.hip,
      size: s.recommendedSize,
      orderId: s.orderId || 'N/A',
      productId: s.productId || '',
      shop: s.shop
    }));
    
    // Calculate analytics
    const sizeDistribution = {};
    const sizeAverages = {};
    
    submissions.forEach(s => {
      const size = s.recommendedSize;
      sizeDistribution[size] = (sizeDistribution[size] || 0) + 1;
      
      if (!sizeAverages[size]) {
        sizeAverages[size] = { bust: [], waist: [], hip: [], count: 0 };
      }
      sizeAverages[size].bust.push(s.bust);
      sizeAverages[size].waist.push(s.waist);
      sizeAverages[size].hip.push(s.hip);
      sizeAverages[size].count++;
    });
    
    // Calculate averages
    const analytics = Object.entries(sizeAverages).map(([size, data]) => ({
      size,
      count: data.count,
      percentage: ((data.count / submissions.length) * 100).toFixed(1),
      avgBust: (data.bust.reduce((a, b) => a + b, 0) / data.count).toFixed(1),
      avgWaist: (data.waist.reduce((a, b) => a + b, 0) / data.count).toFixed(1),
      avgHip: (data.hip.reduce((a, b) => a + b, 0) / data.count).toFixed(1)
    }));
    
    return {
      success: true,
      data: formattedData,
      analytics: {
        totalOrders: submissions.length,
        uniqueCustomers: new Set(submissions.map(s => s.customerName)).size,
        sizeDistribution,
        sizeAnalytics: analytics,
        mostPopularSize: analytics.length > 0 
          ? analytics.reduce((prev, current) => (prev.count > current.count) ? prev : current).size 
          : 'N/A'
      }
    };
  } catch (error) {
    console.error('Error fetching measurements:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      analytics: null
    };
  }
}

// Handle size charts endpoint
async function handleSizeCharts(query) {
  try {
    const where = {};
    if (query.shop) {
      where.shop = query.shop;
    }
    
    const sizeCharts = await prisma.sizeChart.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });
    
    const formattedCharts = sizeCharts.map(chart => ({
      id: chart.id,
      shop: chart.shop,
      title: chart.title,
      data: JSON.parse(chart.chartData),
      createdAt: chart.createdAt.toISOString(),
      updatedAt: chart.updatedAt.toISOString()
    }));
    
    return {
      success: true,
      data: formattedCharts
    };
  } catch (error) {
    console.error('Error fetching size charts:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

// Handle saving measurement data
async function saveMeasurement(req) {
  try {
    const body = await readBody(req);
    const data = JSON.parse(body);
    
    const { 
      bust, 
      waist, 
      hip, 
      recommendedSize, 
      customerName, 
      productId, 
      orderId, 
      shop 
    } = data;

    // Validate required fields
    if (!bust || !waist || !hip) {
      return {
        success: false,
        error: 'Missing required measurements'
      };
    }

    // Save to database
    const submission = await prisma.submission.create({
      data: {
        shop: shop || 'idealfit-2.myshopify.com',
        customerName: customerName || 'Anonymous',
        productId: productId?.toString() || null,
        bust: parseFloat(bust),
        waist: parseFloat(waist),
        hip: parseFloat(hip),
        recommendedSize: recommendedSize || 'N/A',
        orderId: orderId || null,
        date: new Date()
      }
    });

    return {
      success: true,
      message: 'Measurement saved successfully',
      data: submission
    };
  } catch (error) {
    console.error('Error saving measurement:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handle saving size chart data
async function saveSizeChart(req) {
  try {
    const body = await readBody(req);
    const data = JSON.parse(body);
    
    const { 
      title, 
      chartData, 
      shop 
    } = data;

    // Validate required fields
    if (!chartData || !Array.isArray(chartData)) {
      return {
        success: false,
        error: 'Invalid chart data'
      };
    }

    // Save to database
    const sizeChart = await prisma.sizeChart.create({
      data: {
        shop: shop || 'idealfit-2.myshopify.com',
        title: title || 'Default Size Chart',
        chartData: JSON.stringify(chartData)
      }
    });

    return {
      success: true,
      message: 'Size chart saved successfully',
      data: sizeChart
    };
  } catch (error) {
    console.error('Error saving size chart:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handle order webhook
async function handleOrderWebhook(req) {
  try {
    const body = await readBody(req);
    const order = JSON.parse(body);
    
    console.log('📦 Processing order:', order.id || order.name);
    
    const customer = order.customer;
    const lineItems = order.line_items || [];
    const attributes = order.attributes || [];
    
    // Check if this order has measurement data
    let measurementData = null;
    
    // Look for measurement attributes
    attributes.forEach(attr => {
      if (attr.name && attr.name.startsWith('_measurement_')) {
        if (!measurementData) measurementData = {};
        
        if (attr.name === '_measurement_bust') {
          measurementData.bust = parseFloat(attr.value.replace('"', ''));
        } else if (attr.name === '_measurement_waist') {
          measurementData.waist = parseFloat(attr.value.replace('"', ''));
        } else if (attr.name === '_measurement_hip') {
          measurementData.hip = parseFloat(attr.value.replace('"', ''));
        } else if (attr.name === '_recommended_size') {
          measurementData.recommendedSize = attr.value;
        }
      }
    });
    
    // If we found measurement data, save it to database
    if (measurementData && measurementData.bust && measurementData.waist && measurementData.hip) {
      const customerName = customer ? 
        `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 
        customer.email || 
        'Anonymous' : 'Anonymous';
      
      const submission = await prisma.submission.create({
        data: {
          shop: order.shop_domain || 'idealfit-2.myshopify.com',
          customerName: customerName,
          productId: lineItems[0]?.product_id?.toString() || null,
          bust: measurementData.bust,
          waist: measurementData.waist,
          hip: measurementData.hip,
          recommendedSize: measurementData.recommendedSize || 'N/A',
          orderId: order.name || order.id?.toString() || null,
          date: new Date(order.created_at || new Date())
        }
      });
      
      console.log('✅ Order measurement saved:', {
        id: submission.id,
        customer: customerName,
        orderId: order.name
      });
      
      return {
        success: true,
        message: 'Order measurement saved',
        data: submission
      };
    } else {
      console.log('ℹ️ No measurement data in order');
      return {
        success: true,
        message: 'No measurement data in order'
      };
    }
  } catch (error) {
    console.error('Error processing order webhook:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handle adding test data
async function addTestData(query) {
  try {
    const shop = query.shop || 'idealfit-2.myshopify.com';
    
    // Test data
    const testData = [
      {
        shop: shop,
        customerName: 'John Doe',
        productId: '12345',
        bust: 36,
        waist: 28,
        hip: 38,
        recommendedSize: 'L',
        orderId: '#1001',
        date: new Date('2025-10-09')
      },
      {
        shop: shop,
        customerName: 'Jane Smith',
        productId: '12346',
        bust: 34,
        waist: 26,
        hip: 36,
        recommendedSize: 'M',
        orderId: '#1002',
        date: new Date('2025-10-09')
      },
      {
        shop: shop,
        customerName: 'Mike Johnson',
        productId: '12347',
        bust: 38,
        waist: 30,
        hip: 40,
        recommendedSize: 'XL',
        orderId: '#1003',
        date: new Date('2025-10-08')
      },
      {
        shop: shop,
        customerName: 'Sarah Wilson',
        productId: '12348',
        bust: 32,
        waist: 24,
        hip: 34,
        recommendedSize: 'S',
        orderId: '#1004',
        date: new Date('2025-10-08')
      },
      {
        shop: shop,
        customerName: 'Emily Davis',
        productId: '12349',
        bust: 34,
        waist: 29,
        hip: 39,
        recommendedSize: 'M',
        orderId: '#1005',
        date: new Date('2025-10-07')
      }
    ];

    // Clear existing test data first
    await prisma.submission.deleteMany({
      where: { shop: shop }
    });

    // Add test data
    const created = await Promise.all(
      testData.map(data => prisma.submission.create({ data }))
    );

    return {
      success: true,
      message: `Added ${created.length} test measurements`,
      count: created.length,
      data: created
    };
  } catch (error) {
    console.error('Error adding test data:', error);
    return {
      success: false,
      error: error.message,
      count: 0
    };
  }
}

// Helper to read request body
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

// Create HTTP server
const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }
  
  // Route handling
  if (pathname === '/api/measurements' && req.method === 'GET') {
    console.log('📊 Fetching measurements...');
    const result = await handleMeasurements(query);
    console.log(`✅ Found ${result.data ? result.data.length : 0} measurements`);
    sendJSON(res, result);
  } 
  else if (pathname === '/api/sizecharts' && req.method === 'GET') {
    console.log('📏 Fetching size charts...');
    const result = await handleSizeCharts(query);
    console.log(`✅ Found ${result.data ? result.data.length : 0} size charts`);
    sendJSON(res, result);
  }
  else if (pathname === '/api/add-test-data' && (req.method === 'GET' || req.method === 'POST')) {
    console.log('🧪 Adding test measurement data...');
    const result = await addTestData(query);
    console.log(`✅ Added ${result.count || 0} test measurements`);
    sendJSON(res, result);
  }
  else if (pathname === '/api/save-measurement' && req.method === 'POST') {
    console.log('💾 Saving measurement data...');
    const result = await saveMeasurement(req);
    console.log(`✅ Measurement saved: ${result.success ? 'Success' : 'Failed'}`);
    sendJSON(res, result);
  }
  else if (pathname === '/api/save-sizechart' && req.method === 'POST') {
    console.log('📏 Saving size chart data...');
    const result = await saveSizeChart(req);
    console.log(`✅ Size chart saved: ${result.success ? 'Success' : 'Failed'}`);
    sendJSON(res, result);
  }
  else if (pathname === '/webhooks/orders/create' && req.method === 'POST') {
    console.log('📦 Order webhook received...');
    const result = await handleOrderWebhook(req);
    console.log(`✅ Order processed: ${result.success ? 'Success' : 'Failed'}`);
    sendJSON(res, result);
  }
  else if (pathname === '/api/health') {
    sendJSON(res, { status: 'ok', message: 'Dashboard API Server is running!' });
  }
  else {
    sendJSON(res, { error: 'Not found' }, 404);
  }
});

// Start server
server.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎯 IdealFit Dashboard API Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log('');
  console.log('📡 Available endpoints:');
  console.log(`   • http://localhost:${PORT}/api/measurements`);
  console.log(`   • http://localhost:${PORT}/api/sizecharts`);
  console.log(`   • http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('💡 To use with dashboard:');
  console.log('   1. Open merchant-master-dashboard.html');
  console.log('   2. Open browser console (F12)');
  console.log(`   3. Run: localStorage.setItem('idealfit_api_url', 'http://localhost:${PORT}')`);
  console.log('   4. Connect your shop in dashboard');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});

// Handle shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

