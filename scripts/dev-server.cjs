// Local development server that mirrors the Vercel deployment.
//
// `npx serve` cannot proxy, and enka.network sends no CORS headers, so the
// Enka import button would always fail locally without this. Production uses
// the /api/enka/:uid rewrite in vercel.json instead.
//
// Usage: npm run dev:proxy   (or node scripts/dev-server.cjs)
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT) || 5173;
const ENKA_ORIGIN = 'https://enka.network';
const ENKA_PATH = /^\/api\/enka\/(\d{1,12})\/?$/;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

async function proxyEnka(uid, res) {
  try {
    const upstream = await fetch(`${ENKA_ORIGIN}/api/hsr/uid/${uid}`, {
      headers: { 'User-Agent': 'GaCy-Srtool-dev' }
    });
    const body = await upstream.text();
    res.writeHead(upstream.status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end(body);
  } catch (err) {
    sendJson(res, 502, { error: 'enka_proxy_failed', message: err.message });
  }
}

function serveStatic(pathname, res) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep) && target !== path.join(root, 'index.html')) {
    sendJson(res, 403, { error: 'forbidden' });
    return;
  }

  fs.stat(target, (err, stats) => {
    if (err || !stats.isFile()) {
      sendJson(res, 404, { error: 'not_found', path: relative });
      return;
    }
    const type = MIME_TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    fs.createReadStream(target).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const enkaMatch = requestUrl.pathname.match(ENKA_PATH);
  if (enkaMatch) {
    proxyEnka(enkaMatch[1], res);
    return;
  }
  if (requestUrl.pathname.startsWith('/api/')) {
    sendJson(res, 404, { error: 'not_found', path: requestUrl.pathname });
    return;
  }
  serveStatic(requestUrl.pathname, res);
});

server.listen(port, () => {
  console.log(`GaCy-Srtool dev server: http://localhost:${port}`);
  console.log(`Enka proxy:            http://localhost:${port}/api/enka/<uid>`);
});
