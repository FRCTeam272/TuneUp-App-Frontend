/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: "FLL Scoreboard",
    description: "FLL (First Lego League) Scoreboard Application",
    siteUrl: "http://localhost:8000"
  },
  plugins: [
    "gatsby-plugin-styled-components",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "FLL Scoreboard",
        short_name: "FLL Scoreboard",
        start_url: "/",
        background_color: "#ffffff",
        theme_color: "#000000",
        display: "minimal-ui",
        icon: "static/logo192.png",
      },
    },
  ],
  // Development proxy configuration
  developMiddleware: app => {
    const { createProxyMiddleware } = require("http-proxy-middleware");
    app.use(
      "/api",
      createProxyMiddleware({
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      })
    );
  },
};