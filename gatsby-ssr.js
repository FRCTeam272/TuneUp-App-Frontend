import React from "react"
import ErrorBoundary from './src/components/ErrorBoundary';

// Wrap the root element with ErrorBoundary for SSR
export const wrapRootElement = ({ element }) => (
  <ErrorBoundary>{element}</ErrorBoundary>
);

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <meta
      key="viewport"
      name="viewport"
      content="width=device-width, initial-scale=1.0, shrink-to-fit=no, viewport-fit=cover"
    />,
    <meta
      key="mobile-web-app-capable"
      name="mobile-web-app-capable"
      content="yes"
    />,
    <meta
      key="apple-mobile-web-app-capable"
      name="apple-mobile-web-app-capable"
      content="yes"
    />,
    <meta
      key="apple-mobile-web-app-status-bar-style"
      name="apple-mobile-web-app-status-bar-style"
      content="default"
    />,
    <link
      key="favicon-ico"
      rel="icon"
      type="image/x-icon"
      href="/favicon.ico"
    />,
    <link
      key="favicon-32"
      rel="icon"
      type="image/png"
      sizes="32x32"
      href="/favicon-32x32.png"
    />,
    <link
      key="favicon-192"
      rel="icon"
      type="image/png"
      sizes="192x192"
      href="/favicon.png"
    />,
  ])
}