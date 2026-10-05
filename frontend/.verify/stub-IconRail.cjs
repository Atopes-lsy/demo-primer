/** IconRail 的桩：不渲染，只等驱动把 props 抄走（见 drive.ts）。
 *
 * 直接导出函数本身，不要包成 `{__esModule: true, default: f}`：esbuild 的
 * `__toESM(mod, 1)` 会无条件把 `default` 指成整个模块对象，元素树上那一格的
 * `type` 就成了普通对象，`__名` 认不出来。 */
'use strict'
const f = () => null
f.__名 = 'IconRail'
module.exports = f
