const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(
    createProxyMiddleware({
      pathFilter: "/api",
      target: "http://localhost:5001",
      changeOrigin: true,
    })
  );
};