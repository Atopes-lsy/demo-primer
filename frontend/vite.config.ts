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
  },
})
