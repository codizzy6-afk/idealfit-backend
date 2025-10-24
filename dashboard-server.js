/**
 * Simple HTTP Server for Dashboard
 * Serves the merchant dashboard to avoid CORS issues
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8080;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Get file path
  let filePath = req.url === '/' ? '/merchant-master-dashboard.html' : req.url;
  filePath = join(__dirname, filePath);
  
  // Security check - prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  // Check if file exists
  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  
  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    console.error('Error serving file:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎯 IdealFit Dashboard Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log('');
  console.log('📊 Access your dashboard at:');
  console.log(`   http://localhost:${PORT}/merchant-master-dashboard.html`);
  console.log('');
  console.log('💡 This avoids CORS issues when connecting to the API');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down dashboard server...');
  server.close(() => {
    process.exit(0);
  });
});







