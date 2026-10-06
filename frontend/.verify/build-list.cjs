/**
 * 只重打 `drive-list.cjs`。
 *
 * `build.cjs` 一次打三份（drive／drive-real／drive-list），单独改左栏顺序时那两份
 * 是白编的 —— 而重打出来的 `.cjs` 里会带上**当前整棵树**（别人正在改的 `剧本.ts`
 * 之类），diff 里就多出不属于这一笔的内容。
 */
'use strict'
const esbuild = require('C:/Users/Atopes/AppData/Local/npm-cache/_npx/beb367dfa21eb3f5/node_modules/esbuild')
const path = require('path')
const 替换 = {
  react: './.verify/react.cjs',
  'react/jsx-runtime': './.verify/jsx.cjs',
  'react/jsx-dev-runtime': './.verify/jsx.cjs',
  './components/chat/ChatPanel': './.verify/stub-ChatPanel.cjs',
  './components/IconRail': './.verify/stub-IconRail.cjs',
  './components/session/SessionPanel': './.verify/stub-SessionPanel.cjs',
  './components/plugin/PrimerPanel': './.verify/stub-PrimerPanel.cjs',
}
esbuild.build({
  entryPoints: ['.verify/drive-list.ts'],
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
}).then(() => console.log('打好了：drive-list.cjs')).catch(() => process.exit(1))
