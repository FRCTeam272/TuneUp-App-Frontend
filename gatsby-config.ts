import path from "path"
import dotenv from "dotenv"
import type { GatsbyConfig } from "gatsby"
import type { Express, NextFunction, Request, Response } from "express"
import { createProxyMiddleware } from "http-proxy-middleware"

// Determine which environment file to use
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.GATSBY_ENV === 'development'
const envFile = isDevelopment ? '.env.dev' : '.env'

// Load the appropriate environment file
dotenv.config({
  path: path.resolve(process.cwd(), envFile)
})

console.log(`🌍 Loading environment from: ${envFile}`)
console.log(`🔗 Backend URL: ${process.env.GATSBY_BACKEND_URL}`)

const config: GatsbyConfig = {
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
  developMiddleware: (app: Express) => {
    // Add CORS headers middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
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
        onProxyReq: (proxyReq, req) => {
          console.log(`🔄 Proxying ${req.method} ${req.url} → ${proxyReq.getHeader('host')}${proxyReq.path}`);
        }
      })
    );
  },
};

export default config
