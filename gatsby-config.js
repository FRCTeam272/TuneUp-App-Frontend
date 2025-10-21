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
    siteUrl: "http://localhost:8000"
  },
  flags: {
    DEV_SSR: true // Enable SSR in development
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