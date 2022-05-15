import React from 'react'
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <div>
      hoge
    </div>
  </React.StrictMode>
)