'use strict'
const esbuild = require('C:/Users/Atopes/AppData/Local/npm-cache/_npx/beb367dfa21eb3f5/node_modules/esbuild')
const path = require('path')
const 替换 = {
  react: './.verify/react.cjs',
  'react/jsx-runtime': './.verify/jsx.cjs',
  'lucide-react': './.verify/stub-lucide.cjs',
  'react/jsx-dev-runtime': './.verify/jsx.cjs',
  './components/chat/ChatPanel': './.verify/stub-ChatPanel.cjs',
  './components/IconRail': './.verify/stub-IconRail.cjs',
  './components/session/SessionPanel': './.verify/stub-SessionPanel.cjs',
  './components/plugin/PrimerPanel': './.verify/stub-PrimerPanel.cjs',
}
esbuild.build({
  entryPoints: ['.verify/drive-live.ts'],
  bundle: true, format: 'cjs', platform: 'node', jsx: 'automatic',
  outdir: '.verify', outExtension: { '.js': '.cjs' }, logLevel: 'warning',
  plugins: [{ name: '换成替身', setup(build) {
    const 表 = new Map(Object.entries(替换))
    build.onResolve({ filter: /.*/ }, (参数) => {
      if (参数.kind === 'entry-point') return null
      if (表.has(参数.path)) return { path: path.resolve(__dirname, '..', 表.get(参数.path)) }
      return null
    })
  }}],
}).then(() => console.log('打好了：drive-live.cjs')).catch(() => process.exit(1))
