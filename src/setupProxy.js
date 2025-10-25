const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        // Log request for debugging
        console.log(`[Proxy] ${req.method} ${req.path}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log response for debugging
        console.log(`[Proxy] Response status: ${proxyRes.statusCode}`);
      },
      onError: (err, req, res) => {
        console.error('[Proxy Error]', err.message);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Proxy error: ' + err.message);
      }
    })
  );
};
