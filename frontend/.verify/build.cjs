/**
 * 把 `drive.ts` 打成一个能在 node 里跑的包。**临时装置，跑完就删。**
 *
 * 为什么不用 `--alias:`：esbuild 的 alias 只认包名，`./components/ChatPanel`
 * 这种相对路径它直接拒（`Invalid alias name`）。命令行里也没有「替换某个相对
 * 导入」的开关，所以走 JS API 写个小插件。
 *
 * `jsx: 'automatic'` 要显式给：仓库那份 `jsx` 设置写在 `tsconfig.app.json` 里，
 * 而根 tsconfig 只有 references、没有 compilerOptions，esbuild 读不到，会按经典
 * runtime 编成 `React.createElement` —— 那还得给假 react 补一个 createElement。
 */
'use strict'

const esbuild = require('C:/Users/Atopes/AppData/Local/npm-cache/_npx/beb367dfa21eb3f5/node_modules/esbuild')
const path = require('path')

/** 导入路径（相对 src/，或包名）→ 替身文件。 */
const 替换 = {
  react: './.verify/react.cjs',
  'react/jsx-runtime': './.verify/jsx.cjs',
  'react/jsx-dev-runtime': './.verify/jsx.cjs',
  './components/chat/ChatPanel': './.verify/stub-ChatPanel.cjs',
  './components/IconRail': './.verify/stub-IconRail.cjs',
  './components/session/SessionPanel': './.verify/stub-SessionPanel.cjs',
  './components/plugin/PrimerPanel': './.verify/stub-PrimerPanel.cjs',
}

esbuild
  .build({
    entryPoints: ['.verify/drive.ts', '.verify/drive-real.ts', '.verify/drive-list.ts'],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    jsx: 'automatic',
    outdir: '.verify',
    outExtension: { '.js': '.cjs' },
    logLevel: 'warning',
    plugins: [
      {
        name: '换成替身',
        setup(build) {
          const 表 = new Map(Object.entries(替换))
          build.onResolve({ filter: /.*/ }, (参数) => {
            if (参数.kind === 'entry-point') return null
            const 命 = 参数.path
            if (表.has(命)) return { path: path.resolve(__dirname, '..', 表.get(命)) }
            return null
          })
        },
      },
    ],
  })
  .then(() => console.log('打好了：.verify/*.cjs'))
  .catch(() => process.exit(1))
