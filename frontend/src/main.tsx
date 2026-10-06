import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ReviewApp from './review/ReviewApp.tsx'

// 独立验收入口：不挂载 App 的接口 effects，不改正式会话/播放器链路。
const RootApp = import.meta.env.VITE_UI_REVIEW_MODE === 'five' ? ReviewApp : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)
