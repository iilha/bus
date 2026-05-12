#!/usr/bin/env node
/**
 * Local proxy server for development
 * Proxies /events to https://api.octile.eu.cc/events to avoid CORS issues
 *
 * Usage: node proxy-server.js
 * Then access: http://localhost:8003
 */

const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8003;
const TARGET_API = 'https://api.octile.eu.cc';

// Create proxy instance
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  secure: true
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('❌ Proxy error:', err.message);
  if (!res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
  }
  res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
});

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);

  // Proxy /events and /health to API
  if (parsedUrl.pathname === '/events' || parsedUrl.pathname === '/health') {
    console.log(`🔄 Proxying: ${req.method} ${parsedUrl.pathname} → ${TARGET_API}${parsedUrl.pathname}`);
    proxy.web(req, res, { target: TARGET_API });
    return;
  }

  // Serve static files from current directory
  let filePath = path.join(__dirname, parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('404 Not Found');
    return;
  }

  // Determine content type
  const ext = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp'
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';

  // Serve file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('500 Internal Server Error');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`
✅ Dev proxy server running!

   Local:   http://localhost:${PORT}

📡 API Proxy:
   /events  → ${TARGET_API}/events
   /health  → ${TARGET_API}/health

🎯 All other requests serve static files from current directory
  `);
});
