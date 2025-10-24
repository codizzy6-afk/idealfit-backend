import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8081;
const MERCHANT_API_URL = 'http://localhost:3001';

const server = createServer((req, res) => {
  try {
    // Handle API requests
    if (req.url.startsWith('/api/')) {
      handleApiRequest(req, res);
      return;
    }

    // Remove query parameters from URL
    const urlPath = req.url.split('?')[0];
    
    // Handle JavaScript files
    if (urlPath.endsWith('.js')) {
      const filePath = join(__dirname, urlPath);
      const data = readFileSync(filePath);
      res.writeHead(200, { 
        'Content-Type': 'application/javascript',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(data);
      return;
    }

    let fileName = 'company-auth.html'; // Default to auth page
    
    // Route handling
    if (urlPath.includes('company-admin-dashboard.html')) {
      fileName = 'company-admin-dashboard.html';
    } else if (urlPath.includes('company-auth.html') || urlPath === '/') {
      fileName = 'company-auth.html';
    }
    
    const filePath = join(__dirname, fileName);
    const data = readFileSync(filePath);
    
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error loading page: ' + err.message);
  }
});

// Handle API requests by proxying to merchant dashboard API
async function handleApiRequest(req, res) {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const apiPath = url.pathname;
    const queryString = url.search;
    
    // Forward the request to the merchant dashboard API
    const apiUrl = `${MERCHANT_API_URL}${apiPath}${queryString}`;
    
    console.log(`🔄 Proxying API request: ${req.method} ${apiUrl}`);
    
    // Use Node.js built-in fetch (available in Node 18+)
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
    const data = await response.text();
    
    res.writeHead(response.status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    res.end(data);
    console.log(`✅ API response: ${response.status} ${apiPath}`);
    
  } catch (error) {
    console.error('❌ API Error:', error);
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Failed to fetch data from merchant API',
      details: error.message 
    }));
  }
}

server.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🏢 IdealFit Company Admin Dashboard');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log(`📊 Access dashboard at:`);
  console.log(`   http://localhost:${PORT}/company-admin-dashboard.html`);
  console.log('');
  console.log('💡 Features:');
  console.log('   • Manage all merchants');
  console.log('   • Approve new enrollments');
  console.log('   • Track revenue & payments');
  console.log('   • Platform analytics');
  console.log('   • Enable/disable merchant accounts');
  console.log('   • Integrated with merchant dashboard API');
  console.log('');
  console.log('🔗 API Integration:');
  console.log(`   • Proxying to merchant API: ${MERCHANT_API_URL}`);
  console.log('   • Real-time data synchronization');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});
