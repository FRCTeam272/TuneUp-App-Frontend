import React from "react"

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
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