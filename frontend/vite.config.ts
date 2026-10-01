import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // 仓库根的 data/ 是前后端共用的知识数据。口径表放两份迟早漂移 ——
      // 闸门 G1（后端）和输入框确认条（前端）必须读同一份。
      '@data': fileURLToPath(new URL('../data', import.meta.url)),
    },
  },
  server: {
    fs: { allow: ['..'] },
    /**
     * 后端在 `:8000`，前端在 `:5173` —— **不同源**。
     *
     * 不配这一段的话 `fetch('/api/判定')` 打的是 Vite 自己，拿回来一个 404 的
     * HTML（Vite 对认不出的路径回落到 `index.html`）。症状是 `response.json()`
     * 抛 `Unexpected token '<'`，而路径、方法、请求体看着全对 —— 排查会一路
     * 往判定逻辑上走。`开发步骤.md` 步骤 1 存在的唯一理由就是提前撞上这个坑。
     *
     * 代理而不是 CORS：CORS 要在后端挂中间件、放行来源，那是**生产的配置**，
     * 而这里只是开发时两个端口的事。生产同源部署，这一整块用不上。
     */
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/healthz': 'http://127.0.0.1:8000',
    },
  },
})
