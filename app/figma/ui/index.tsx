import React from 'react'
import { createRoot } from 'react-dom/client'
import { Global, css } from '@emotion/react'
import App from "./App";

const container = document.getElementById('root')
const root = createRoot(container)

const globalCss = css`
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }
`

root.render(
  <React.StrictMode>
    <Global styles={globalCss} />
    <App />
  </React.StrictMode>
)