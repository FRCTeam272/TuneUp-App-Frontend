// gatsby-browser.js
import React from 'react';
import ErrorBoundary from './src/components/ErrorBoundary';

// Import global CSS
import './src/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Wrap the root element with ErrorBoundary
export const wrapRootElement = ({ element }) => (
  <ErrorBoundary>{element}</ErrorBoundary>
);

// Handle client-side routing errors
export const onClientEntry = () => {
  // Ensure localStorage is available
  if (typeof window !== 'undefined') {
    // Any client-side initialization can go here
    console.log('Client-side entry initialized');
  }
};