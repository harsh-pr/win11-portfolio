const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
  // 1. Proxy handler to allow embedding external projects without X-Frame-Options or CSP blocking
  if (req.url.startsWith('/proxy?url=')) {
    const rawTarget = req.url.slice('/proxy?url='.length);
    let targetUrl;
    try {
      targetUrl = decodeURIComponent(rawTarget);
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('Invalid URL parameter');
    }

    try {
      const parsedUrl = new URL(targetUrl);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: req.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
          'Accept': req.headers['accept'] || '*/*',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      };

      const proxyReq = client.request(options, (proxyRes) => {
        // Handle HTTP 301/302 Redirects
        if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
          let redirectTarget = proxyRes.headers.location;
          if (!redirectTarget.startsWith('http')) {
            redirectTarget = new URL(redirectTarget, targetUrl).toString();
          }
          res.writeHead(302, { 'Location': `/proxy?url=${encodeURIComponent(redirectTarget)}` });
          return res.end();
        }

        const headers = { ...proxyRes.headers };
        // Strip framing restrictions so Edge iframe renders smoothly
        delete headers['x-frame-options'];
        delete headers['content-security-policy'];
        delete headers['content-security-policy-report-only'];
        headers['access-control-allow-origin'] = '*';

        const contentType = headers['content-type'] || '';

        // Inject <base> tag into HTML responses so relative assets resolve to host
        if (contentType.includes('text/html')) {
          const chunks = [];
          proxyRes.on('data', chunk => chunks.push(chunk));
          proxyRes.on('end', () => {
            let html = Buffer.concat(chunks).toString('utf-8');
            // Remove meta CSP tags that prevent embedding
            html = html.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '');
            // Inject <base href="...">
            const baseTag = `<base href="${parsedUrl.origin}/">`;
            if (html.includes('<head>')) {
              html = html.replace('<head>', `<head>\n  ${baseTag}`);
            } else if (html.includes('<head ')) {
              html = html.replace(/<head[^>]*>/, `$& \n  ${baseTag}`);
            } else {
              html = baseTag + html;
            }

            delete headers['content-length'];
            headers['content-length'] = Buffer.byteLength(html);
            res.writeHead(proxyRes.statusCode || 200, headers);
            res.end(html);
          });
        } else {
          res.writeHead(proxyRes.statusCode || 200, headers);
          proxyRes.pipe(res);
        }
      });

      proxyReq.on('error', (err) => {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Proxy Gateway Error: ${err.message}`);
      });

      if (req.method === 'POST' || req.method === 'PUT') {
        req.pipe(proxyReq);
      } else {
        proxyReq.end();
      }
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end(`Server Error: ${err.message}`);
    }
  }

  // 2. Static file server
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Windows 11 Portfolio running at http://localhost:${PORT}`);
});
