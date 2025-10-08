const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ['/api', '/auth', '/favicon.ico', '/logo192.png'],
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      logLevel: 'debug',
      pathRewrite: {
        '^/api': '/api',
        '^/auth': '/api/auth' // Rewrite /auth to /api/auth
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Something went wrong. Please try again later.');
      },
    })
  );
};
