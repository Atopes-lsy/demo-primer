/**
 * `react/jsx-runtime` 的替身：只造一棵普通的对象树，不接 DOM。
 * 树由 `.verify/drive.ts` 自己走 —— 走的时候顺手把桩组件的 props 抄下来，
 * 那几个 props 里就有要点的回调（`onUseScript`／`onSend`）。
 */
'use strict'

const Fragment = Symbol('Fragment')
const jsx = (type, props) => ({ $$元素: true, type, props: props ?? {} })
module.exports = { Fragment, jsx, jsxs: jsx, jsxDEV: jsx }
