const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  } else if (reqPath === '/sigra' || reqPath === '/sigra/') {
    reqPath = '/sigra.html';
  } else if (reqPath === '/sigra/menu' || reqPath === '/sigra/menu/' || reqPath === '/sigra-menu' || reqPath === '/sigra-menu/') {
    reqPath = '/sigra-menu.html';
  } else if (reqPath === '/bhojuveer' || reqPath === '/bhojuveer/') {
    reqPath = '/bhojuveer.html';
  } else if (reqPath === '/bhojuveer/menu' || reqPath === '/bhojuveer/menu/' || reqPath === '/bhojuveer-menu' || reqPath === '/bhojuveer-menu/') {
    reqPath = '/bhojuveer-menu.html';
  }

  // Prevent directory traversal
  const safePath = path.normalize(path.join(BASE_DIR, reqPath));
  if (!safePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  Behind Yellow Doors Diner is LIVE!`);
  console.log(`  Local URL: http://localhost:${PORT}`);
  console.log(`========================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = PORT + 1;
    console.log(`Port ${PORT} in use, trying ${fallbackPort}...`);
    server.listen(fallbackPort, '0.0.0.0');
  } else {
    console.error('Server error:', err);
  }
});

