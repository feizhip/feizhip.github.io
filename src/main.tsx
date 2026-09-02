import React from 'react'
import ReactDOM from 'react-dom/client'

// 样式：字体 → token → 全局（顺序不能反）
import '@/styles/fonts.css'
import '@/styles/tokens.css'
import '@/styles/globals.css'

import App from '@/App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
