/**
 * @type {import('gatsby').GatsbyConfig}
 */

// Load environment-specific configuration
const path = require('path')

// Determine which environment file to use
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.GATSBY_ENV === 'development'
const envFile = isDevelopment ? '.env.dev' : '.env'

// Load the appropriate environment file
require("dotenv").config({
  path: path.resolve(process.cwd(), envFile)
})

console.log(`🌍 Loading environment from: ${envFile}`)
console.log(`🔗 Backend URL: ${process.env.GATSBY_BACKEND_URL}`)

module.exports = {
  siteMetadata: {
    title: "FLL Scoreboard",
    description: "FLL (First Lego League) Scoreboard Application",
    siteUrl: process.env.GATSBY_SITE_URL || "https://your-netlify-site.netlify.app"
  },
  flags: {
    DEV_SSR: isDevelopment // Only enable SSR in development
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
        icon: "static/favicon.png", // Main icon for PWA
        icons: [
          {
            src: "static/favicon.ico",
            sizes: "32x32",
            type: "image/x-icon",
          },
          {
            src: "static/favicon.png", 
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "static/logo512.png",
            sizes: "512x512", 
            type: "image/png",
          },
        ],
      },
    },
  ],
  // Development proxy configuration
  developMiddleware: app => {
    const { createProxyMiddleware } = require("http-proxy-middleware");
    
    // Add CORS headers middleware
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Proxy API requests to backend
    app.use(
      "/api",
      createProxyMiddleware({
        target: process.env.GATSBY_BACKEND_URL || "http://127.0.0.1:8001",
        changeOrigin: true,
        secure: false, // Allow self-signed certificates in development
        pathRewrite: {
          "^/api": "",
        },
        onProxyReq: (proxyReq, req, res) => {
          console.log(`🔄 Proxying ${req.method} ${req.url} → ${proxyReq.getHeader('host')}${proxyReq.path}`);
        }
      })
    );
  },
};