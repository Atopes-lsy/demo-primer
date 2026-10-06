var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// .verify/react.cjs
var require_react = __commonJS({
  ".verify/react.cjs"(exports2, module2) {
    "use strict";
    var \u69FD\u4F4D = [];
    var \u6E38\u6807 = 0;
    var \u5F85\u8DD1 = [];
    var \u810F = false;
    var \u9700\u8981\u9996\u8F6E = true;
    function useState3(\u521D\u503C) {
      const i = \u6E38\u6807++;
      const \u69FD = \u69FD\u4F4D[i] ?? (\u69FD\u4F4D[i] = { \u503C: typeof \u521D\u503C === "function" ? \u521D\u503C() : \u521D\u503C });
      const \u8BBE = (\u65B0) => {
        const \u503C = typeof \u65B0 === "function" ? \u65B0(\u69FD.\u503C) : \u65B0;
        if (Object.is(\u503C, \u69FD.\u503C)) return;
        \u69FD.\u503C = \u503C;
        \u810F = true;
      };
      return [\u69FD.\u503C, \u8BBE];
    }
    function useRef2(\u521D\u503C) {
      const i = \u6E38\u6807++;
      return \u69FD\u4F4D[i] ?? (\u69FD\u4F4D[i] = { current: \u521D\u503C });
    }
    function \u4F9D\u8D56\u6CA1\u53D8(a, b) {
      if (!a || !b || a.length !== b.length) return false;
      return a.every((x, i) => Object.is(x, b[i]));
    }
    function useMemo2(\u7B97, \u4F9D\u8D56) {
      const i = \u6E38\u6807++;
      const \u69FD = \u69FD\u4F4D[i];
      if (\u69FD && \u4F9D\u8D56\u6CA1\u53D8(\u69FD.\u4F9D\u8D56, \u4F9D\u8D56)) return \u69FD.\u503C;
      const \u503C = \u7B97();
      \u69FD\u4F4D[i] = { \u503C, \u4F9D\u8D56 };
      return \u503C;
    }
    function useCallback3(\u51FD\u6570, \u4F9D\u8D56) {
      return useMemo2(() => \u51FD\u6570, \u4F9D\u8D56);
    }
    function useEffect3(\u51FD\u6570, \u4F9D\u8D56) {
      const i = \u6E38\u6807++;
      const \u69FD = \u69FD\u4F4D[i] ?? (\u69FD\u4F4D[i] = {});
      \u69FD.\u51FD\u6570 = \u51FD\u6570;
      if (!\u4F9D\u8D56\u6CA1\u53D8(\u69FD.\u5DF2\u8DD1\u4F9D\u8D56, \u4F9D\u8D56)) \u5F85\u8DD1.push(\u69FD);
      \u69FD.\u4F9D\u8D56 = \u4F9D\u8D56;
    }
    function \u6536\u5C3E2() {
      for (const \u69FD of \u69FD\u4F4D) {
        if (\u69FD && \u69FD.\u6E05\u573A) {
          \u69FD.\u6E05\u573A();
          \u69FD.\u6E05\u573A = void 0;
          \u69FD.\u5DF2\u8DD1\u4F9D\u8D56 = void 0;
        }
      }
    }
    var \u4E0A\u6B21\u6811;
    function \u6E32\u67D3(\u7EC4\u4EF6) {
      \u6E38\u6807 = 0;
      \u5F85\u8DD1.length = 0;
      \u4E0A\u6B21\u6811 = \u7EC4\u4EF6();
      \u69FD\u4F4D.length = \u6E38\u6807;
      for (const \u69FD of \u5F85\u8DD1) {
        if (\u69FD.\u6E05\u573A) \u69FD.\u6E05\u573A();
        \u69FD.\u6E05\u573A = \u69FD.\u51FD\u6570();
        \u69FD.\u5DF2\u8DD1\u4F9D\u8D56 = \u69FD.\u4F9D\u8D56;
      }
      return \u4E0A\u6B21\u6811;
    }
    function \u51B2\u52372(\u7EC4\u4EF6, \u4E0A\u9650 = 80) {
      let \u6B21 = 0;
      while (\u9700\u8981\u9996\u8F6E || \u810F) {
        \u9700\u8981\u9996\u8F6E = false;
        \u810F = false;
        \u6E32\u67D3(\u7EC4\u4EF6);
        if (++\u6B21 > \u4E0A\u9650) throw new Error("\u6E32\u67D3\u4E0D\u6536\u655B\uFF08\u8D85\u8FC7 " + \u4E0A\u9650 + " \u8F6E\uFF09");
      }
      return \u4E0A\u6B21\u6811;
    }
    module2.exports = {
      useState: useState3,
      useRef: useRef2,
      useMemo: useMemo2,
      useCallback: useCallback3,
      useEffect: useEffect3,
      __\u9A71\u52A8: { \u51B2\u5237: \u51B2\u52372, \u6536\u5C3E: \u6536\u5C3E2 }
    };
  }
});

// .verify/stub-ChatPanel.cjs
var require_stub_ChatPanel = __commonJS({
  ".verify/stub-ChatPanel.cjs"(exports2, module2) {
    "use strict";
    var f = () => null;
    f.__\u540D = "ChatPanel";
    module2.exports = f;
  }
});

// .verify/stub-IconRail.cjs
var require_stub_IconRail = __commonJS({
  ".verify/stub-IconRail.cjs"(exports2, module2) {
    "use strict";
    var f = () => null;
    f.__\u540D = "IconRail";
    module2.exports = f;
  }
});

// .verify/stub-PrimerPanel.cjs
var require_stub_PrimerPanel = __commonJS({
  ".verify/stub-PrimerPanel.cjs"(exports2, module2) {
    "use strict";
    var f = () => null;
    f.__\u540D = "PrimerPanel";
    module2.exports = f;
  }
});

// .verify/stub-SessionPanel.cjs
var require_stub_SessionPanel = __commonJS({
  ".verify/stub-SessionPanel.cjs"(exports2, module2) {
    "use strict";
    var f = () => null;
    f.__\u540D = "SessionPanel";
    module2.exports = f;
  }
});

// .verify/jsx.cjs
var require_jsx = __commonJS({
  ".verify/jsx.cjs"(exports2, module2) {
    "use strict";
    var Fragment = /* @__PURE__ */ Symbol("Fragment");
    var jsx2 = (type, props) => ({ $$\u5143\u7D20: true, type, props: props ?? {} });
    module2.exports = { Fragment, jsx: jsx2, jsxs: jsx2, jsxDEV: jsx2 };
  }
});

// src/App.tsx
var import_react2 = __toESM(require_react(), 1);
var import_ChatPanel = __toESM(require_stub_ChatPanel(), 1);
var import_IconRail = __toESM(require_stub_IconRail(), 1);
var import_PrimerPanel = __toESM(require_stub_PrimerPanel(), 1);
var import_SessionPanel = __toESM(require_stub_SessionPanel(), 1);

// src/data/重复会话.ts
var \u91CD\u590D\u4F1A\u8BDD = /* @__PURE__ */ new Set([
  // 假货质疑两遍 → 客服两遍都在「扫码验真」
  "S00008",
  // '不会是假的吧'              ／ '那为啥味道不一样啊'
  "S00109",
  // '你们这是正品吗?!'          ／ '那为啥味道不一样啊'
  // 丢件：'今天必须给我处理方案' 说两遍 → 客服两遍都在「已登记工单／今天给您方案」
  "S00009",
  // '别让我等太久，今天必须给我处理方案' ／ '最好今天就有结果，急'
  "S00051",
  // 同模板（'行，那我等你们回复，最好今天就有结果啊'）
  "S00079",
  // 同模板（这个窗口后半还有一段"过敏登记"，跟这一条无关）
  // 物流停滞：催两遍 → 客服两遍都在「已加急／若补发走顺丰」
  "S00061",
  // '等你们核实又要好几天，我这是着急用的！' ／ '最晚后天必须给我说法'
  "S00063",
  // 同模板（'呀' ／ '谢谢' 换了口癖）
  "S00093",
  // 同模板（第二句前多一句'上次也是这样等来等去最后说丢了'）
  // 催发货：催两遍 → 客服那两句几乎逐字相同（「已为您加急标记…发出后物流单号会同步给您」）
  "S00080",
  // '帮我催催吧，别家都到货了' ／ '那说好了48小时哈，再不发我可要申请退款了！'
  "S00086",
  // 同模板（'emmm，那说好了48小时哈…'）
  // 少件：催处理两遍 → 客服两遍都在「在处理／今天补发」
  "S00006",
  // '图发你了，麻烦快点处理，等着用的' ／ '尽快快哈，别让我催'
  "S00161",
  // 同模板（'好，尽快哈，别让我催啊'）
  "S00232",
  // '少发我一个面膜' ／ '我不管什么出库记录，少了就是少了'
  // 空包裹＋仅退款，说了**三遍** → 客服三遍都在「按流程核实／麻烦您提供照片」
  "S00024",
  // '我要仅退款，不退货啊' ／ '麻利点退呀' ／ '我平台申请仅退款'
  "S00040",
  // 同模板（'拍什么拍，我说空的就是空的'）
  "S00099",
  // 同模板（这个窗口里还叠着一段"退款没到账"问了两遍，见 S00032 那条）
  // 「我这种能不能用」问两遍 → 客服两遍都是「适合您、可以放心使用」
  "S00022",
  // '里面有酒精和香精吗？我是敏感肌' ／ '成分表能发我看下吗！'
  "S00083",
  // 同模板（换卸妆水）
  "S00303",
  // 段一：'喷雾敏感肌能用吗？'    ／ '我一换季就泛红的能用吧？'
  // 孕妇能用吗，问两遍 —— 客服只答了一次（中间那句是"您好，欢迎光临…"开场白）
  "S00134",
  // '护发精油孕妇能用吗？' ／ '成分有没孕妇不能用的，维A酸水杨酸那些'
  "S00474",
  // 同模板（换洁面乳；买家第一句就问，客服先回的是欢迎语）
  // S00303 的**段二**也是这一套（'护发精油孕妇能用吗？' ／ '成分有没孕妇不能用的'）
  // —— 它已经在上面收着了，两段都踩，不重复写一遍。
  // 用着不舒服想退，说两遍 → 客服是先问诊、再同意退（两句客服话不同，收的是买家侧）
  "S00285",
  // '不严重但不想用了，能退不' ／ '停用就好了，所以想退，别浪费'
  "S00068",
  // '不严重但不想用了，能退不' ／ '停了就没事了，就是不适合我，退货吧啊'
  // 凑单满减问两遍 → 客服两遍都在「这样买就划算」
  "S00013",
  // '购物车加到259了还差多少能用券' ／ '凑单买个唇釉能到满减门槛不'
  // 直播赠品：'主播说话不算数？！' ／ '直播回放还在呢，别想赖，赶紧给我补'
  "S00103",
  // 客服两遍：'马上为您查询' ／ '核实到确有该福利…登记补发'
  "S00130",
  // 同模板（换赠品件）
  "S00132",
  // 同模板
  // 退款没到账，问两遍 → 客服两遍都在「帮您追」
  "S00032",
  // '退款到底去哪了，别踢皮球让我找银行' ／ '到底啥时候到呀'
  // ══════════════════════════════════════════════════════════
  // 下面这一条**不是**「同一件事说了两遍」，判据不是上面那一条
  // ══════════════════════════════════════════════════════════
  //
  // 2026-10-06 用户拍板挪的，原话：「把郭a\*\*放在最下面」。
  //
  // `S00381` 郭a\*\* 和 `S00362` 姚b\*\* 是**同一套模板换个人名**：末段那三句
  // 一字不差（「我的退货你们仓库都签收了，但售后单关闭了钱退不…」／
  // 「发你了，谢谢谢谢」／「好的好的，谢谢你，帮大忙了」），前半段各自是
  // 运费报销和赠品补发。用户当天报的正是这件事：
  //
  //   > 郭\*\*和姚\*\*客户发了一样的话，检查结果却不一样解决该问题
  //
  // **两条长得一样的窗口并排露在镜头前，读起来就像同一条放了两遍。**
  // 挪的是**前一条**（郭a\*\* 本来在第 1 位、姚b\*\* 在第 3 位），
  // 两边不是重复会话档案，所以单列在这儿、不并进上面那张表 ——
  // 将来重审上面那张表时，别拿这一条当判据。
  "S00381"
]);

// src/data/msg.ts
var \u5E97\u94FA = "\u6D4B\u8BD5\u7F8E\u5986\u65D7\u8230\u5E97";
function \u9020\u6D88\u606F(s, \u5E8F\u53F7, \u53D1\u9001\u65F6\u95F4, \u89D2\u8272, message_text, over = {}) {
  return {
    \u4F1A\u8BDDID: s.\u4F1A\u8BDDID,
    \u6D88\u606F\u5E8F\u53F7: \u5E8F\u53F7,
    message_id: `${s.\u4F1A\u8BDDID}-${\u5E8F\u53F7}`,
    \u53D1\u9001\u65F6\u95F4,
    \u89D2\u8272,
    \u4E70\u5BB6\u6635\u79F0: s.\u4E70\u5BB6\u6635\u79F0,
    \u53D1\u9001\u65B9: \u89D2\u8272 === "\u4E70\u5BB6" ? s.\u4E70\u5BB6\u6635\u79F0 : \u89D2\u8272 === "AI" ? "Primer" : `${\u5E97\u94FA}:\u6D4B\u8BD5\u5BA2\u670D`,
    \u5E97\u94FA,
    scene_major: "",
    scene_minor: "",
    is_target_buyer_message: \u89D2\u8272 === "\u4E70\u5BB6",
    message_text,
    \u5185\u5BB9\u7C7B\u578B: "\u6587\u672C",
    chat_content: JSON.stringify([{ index: 0, content: message_text }]),
    category: "service",
    image_path: "",
    \u5173\u8054\u8BA2\u5355\u53F7: "",
    \u5173\u8054\u5DE5\u5355\u53F7: "",
    ...over
  };
}

// src/data/剧本.ts
function \u505C\u683C(\u5267\u672C) {
  return new Map(
    \u5267\u672C?.\u4E8B\u4EF6.flatMap((e, i) => e.\u7B49\u70B9\u51FB ? [[i + 1, e.\u7B49\u70B9\u51FB]] : []) ?? []
  );
}
function \u5F53\u524D\u5224\u5B9A\u8F6E\u6B21(\u5267\u672C, \u5DF2\u64AD\u683C\u6570) {
  const \u4E8B\u4EF6 = \u5267\u672C?.\u4E8B\u4EF6 ?? [];
  for (let i = Math.min(\u5DF2\u64AD\u683C\u6570, \u4E8B\u4EF6.length) - 1; i >= 0; i--) {
    const \u8F6E = \u4E8B\u4EF6[i].\u5224\u5B9A\u8F6E\u6B21;
    if (\u8F6E !== void 0) return \u8F6E;
  }
  return void 0;
}
function \u6F14\u5230(\u6D3B, \u5267\u672C, \u5DF2\u6F14\u6B65\u6570, \u73B0\u573A = []) {
  let \u4F1A\u8BDD = { ...\u6D3B, \u6D88\u606F: [] };
  const \u4E8B\u4EF6 = \u5267\u672C?.\u4E8B\u4EF6 ?? [];
  const \u6F14\u5230\u7B2C = Math.max(0, Math.min(\u5DF2\u6F14\u6B65\u6570, \u4E8B\u4EF6.length));
  for (let i = 0; i < \u6F14\u5230\u7B2C; i++) {
    const e = \u4E8B\u4EF6[i];
    const \u8FD9\u4E00\u6B65\u53D1\u7684 = \u73B0\u573A.filter((\u73B0) => \u73B0.\u6B65 === i + 1).map((\u73B0) => \u73B0.\u6D88\u606F);
    \u4F1A\u8BDD = {
      ...\u4F1A\u8BDD,
      ...e.\u6539\u52A8,
      \u6D88\u606F: [...\u4F1A\u8BDD.\u6D88\u606F, ...e.\u6D88\u606F ?? [], ...\u8FD9\u4E00\u6B65\u53D1\u7684]
    };
  }
  return { ...\u4F1A\u8BDD, \u6D88\u606F: [...\u4F1A\u8BDD.\u6D88\u606F, ...\u6D3B.\u6D88\u606F] };
}
function \u4E0B\u4E00\u4E2A\u6D88\u606F\u5E8F\u53F7(\u5267\u672C, \u5DF2\u53D1\u7684\u73B0\u573A = []) {
  const \u5360\u7684 = /* @__PURE__ */ new Set();
  for (const e of \u5267\u672C?.\u4E8B\u4EF6 ?? []) {
    for (const m of [...e.\u6D88\u606F ?? [], ...e.\u5F85\u53D1 ?? []]) \u5360\u7684.add(m.\u6D88\u606F\u5E8F\u53F7);
  }
  for (const \u73B0 of \u5DF2\u53D1\u7684\u73B0\u573A) \u5360\u7684.add(\u73B0.\u6D88\u606F.\u6D88\u606F\u5E8F\u53F7);
  let \u53F7 = 1;
  while (\u5360\u7684.has(\u53F7)) \u53F7++;
  return \u53F7;
}
var \u6F14\u793A\u4ECA\u5929 = "2026-09-29";
var \u6F14\u793A\u6B64\u523B = "2026-09-29T10:06:00";
var \u627F\u8BFA\u65E5 = "9/25";
var \u627F\u8BFA\u8BDD\u672F = "48 \u5C0F\u65F6\u5185\u53D1\u51FA";
var \u65F6\u9650 = "9/27 24:00";
var \u903E\u671F = "\u5DF2\u903E\u671F 2 \u5929";
function \u7B54\u5E94\u8FC7\u4EC0\u4E48() {
  return { \u6807\u7B7E: "\u7B54\u5E94\u8FC7\u4EC0\u4E48", \u503C: `${\u627F\u8BFA\u65E5} \u627F\u8BFA\u300C${\u627F\u8BFA\u8BDD\u672F}\u300D`, \u5907\u6CE8: `\u65F6\u9650\uFF1A${\u65F6\u9650}` };
}
function \u529E\u8FC7\u4EC0\u4E48(\u5DE5\u5355\u53F7) {
  return { \u6807\u7B7E: "\u529E\u8FC7\u4EC0\u4E48", \u503C: `${\u627F\u8BFA\u65E5} \u5DF2\u767B\u8BB0\u8865\u53D1 \xB7 \u672A\u53D1\u51FA`, \u5907\u6CE8: `\u5DE5\u5355 ${\u5DE5\u5355\u53F7}` };
}
function \u8FD9\u662F\u8C01\u884C(\u503C) {
  return { \u6807\u7B7E: "\u8FD9\u662F\u8C01", \u503C };
}
function \u8FD9\u5355\u884C(\u8BA2\u5355\u53F7, \u5B9E\u4ED8, \u72B6\u6001) {
  return { \u6807\u7B7E: "\u8FD9\u5355", \u503C: `${\u8BA2\u5355\u53F7} \xB7 \xA5${\u5B9E\u4ED8} \xB7 ${\u72B6\u6001}` };
}
var \u7EBF\u4E00 = { \u4F1A\u8BDDID: "S_DEMO_A", \u4E70\u5BB6\u6635\u79F0: "\u5C0F\u9E7F" };
var \u7EBF\u4E00\u8BA2\u5355\u53F7 = "20260925001";
var \u7EBF\u4E00\u5DE5\u5355\u53F7 = "BF20260925001";
var \u7EBF\u4E00\u4F9D\u636E = [
  { \u5E8F\u53F7: "\u2461", \u51FA\u5904: "\u53E3\u5F84\u8868 K01\u300C\u5B55\u671F/\u54FA\u4E73\u671F\u4F7F\u7528\u300D", \u6458\u8981: "\u4E0D\u5F97\u8BF4\u300C\u5B55\u5987\u53EF\u4EE5\u7528\u300D\uFF0C\u987B\u5EFA\u8BAE\u54A8\u8BE2\u533B\u751F", \u7528\u4E0A: true },
  { \u5E8F\u53F7: "\u2460", \u51FA\u5904: "\u5546\u54C1\u5C5E\u6027\u8868 \xB7 \u6210\u5206\u680F", \u6458\u8981: "\u4E0D\u542B\u4E59\u9187\u3001\u7EF4A\u7C7B\u3001\u6C34\u6768\u9178\u3001\u5BF9\u82EF\u4E8C\u915A\u3001\u4E8C\u82EF\u916E-3", \u7528\u4E0A: true },
  { \u5E8F\u53F7: "\u2465", \u51FA\u5904: `\u8865\u53D1\u6362\u8D27\u5DE5\u5355 ${\u7EBF\u4E00\u5DE5\u5355\u53F7}`, \u6458\u8981: "9/25 \u5DF2\u767B\u8BB0\u8865\u53D1\uFF0C\u4ED3\u5E93\u8FD8\u6CA1\u53D1\u51FA", \u7528\u4E0A: true },
  { \u5E8F\u53F7: "\u2462", \u51FA\u5904: "\u5148\u4F8B\u5E93", \u6458\u8981: "\u5386\u53F2\u540C\u7C7B\u4F1A\u8BDD\u7684\u53E5\u5F0F", \u7528\u4E0A: false },
  { \u5E8F\u53F7: "\u2463", \u51FA\u5904: "\u8BA2\u5355\uFF0F\u7269\u6D41\uFF0F\u552E\u540E\u8868", \u6458\u8981: "\u8BA2\u5355\u4E0E\u7269\u6D41\u8BB0\u5F55", \u7528\u4E0A: false },
  { \u5E8F\u53F7: "\u2464", \u51FA\u5904: "\u4E0D\u826F\u53CD\u5E94\uFF0F\u6295\u8BC9\u8BB0\u5F55", \u6458\u8981: "\u8FD9\u4F4D\u987E\u5BA2\u6CA1\u6709\u8BB0\u5F55", \u7528\u4E0A: false }
];
var \u7EBF\u4E00\u4F1A\u8BDD = {
  ...\u7EBF\u4E00,
  \u5E97\u94FA: "\u6D4B\u8BD5\u7F8E\u5986\u65D7\u8230\u5E97",
  stage: "\u6B63\u5728\u63A5\u5F85",
  // 第 0 步时列表里显示的提示。演到第 1 步就被剧本的摘要盖掉。
  \u6458\u8981: "\u6F14\u793A\u7EBF\u4E00 \xB7 \u9876\u90E8\u64AD\u653E\u5668\u63A7\u5236\u8FDB\u5EA6",
  \u6700\u8FD1\u65F6\u95F4: "09-29 10:02",
  \u8BA2\u5355: {
    \u8BA2\u5355\u53F7: \u7EBF\u4E00\u8BA2\u5355\u53F7,
    \u4F1A\u8BDDID: \u7EBF\u4E00.\u4F1A\u8BDDID,
    \u4E70\u5BB6\u6635\u79F0: \u7EBF\u4E00.\u4E70\u5BB6\u6635\u79F0,
    \u5E97\u94FA: "\u6D4B\u8BD5\u7F8E\u5986\u65D7\u8230\u5E97",
    \u5546\u54C1\u8D27\u53F7: "XL10302",
    \u5546\u54C1\u540D\u79F0: "\u6D4B\u8BD5\u4FEE\u62A4\u7CBE\u534E\u6DB230ml",
    \u6570\u91CF: 1,
    "\u5355\u4EF7(\u5143)": 459,
    "\u5B9E\u4ED8\u91D1\u989D(\u5143)": 459,
    \u8BA2\u5355\u72B6\u6001: "\u5DF2\u7B7E\u6536",
    \u4E0B\u5355\u65F6\u95F4: "2026-09-25 10:02:04",
    \u4ED8\u6B3E\u65F6\u95F4: "2026-09-25 10:04:33",
    \u53D1\u8D27\u65F6\u95F4: "",
    \u5FEB\u9012\u516C\u53F8: "\u5706\u901A\u901F\u9012",
    \u7269\u6D41\u5355\u53F7: "",
    \u6536\u8D27\u7701: "\u5E7F\u4E1C\u7701",
    \u6536\u8D27\u5E02: "\u6DF1\u5733\u5E02",
    \u8D60\u54C1: "XLG5004 \u6D4B\u8BD5B5\u9762\u819C\u4F53\u9A8C\u88C52\u7247\u3000\u5E94\u53D1\u672A\u53D1",
    \u4E70\u5BB6\u7559\u8A00: ""
  },
  \u5DE5\u5355: {
    kind: "\u8865\u53D1\u6362\u8D27",
    ticket: {
      \u5DE5\u5355\u53F7: \u7EBF\u4E00\u5DE5\u5355\u53F7,
      \u4F1A\u8BDDID: \u7EBF\u4E00.\u4F1A\u8BDDID,
      \u5173\u8054\u8BA2\u5355\u53F7: \u7EBF\u4E00\u8BA2\u5355\u53F7,
      \u4E70\u5BB6\u6635\u79F0: \u7EBF\u4E00.\u4E70\u5BB6\u6635\u79F0,
      \u5E97\u94FA: "\u6D4B\u8BD5\u7F8E\u5986\u65D7\u8230\u5E97",
      \u5DE5\u5355\u7C7B\u578B: "\u6F0F\u53D1\u8D60\u54C1",
      \u552E\u540E\u539F\u56E0: "\u8D60\u54C1\u672A\u968F\u5355\u53D1\u51FA",
      \u53D1\u51FA\u5546\u54C1\u8D27\u53F7: "XLG5004",
      \u53D1\u51FA\u5546\u54C1\u540D\u79F0: "\u6D4B\u8BD5B5\u9762\u819C\u4F53\u9A8C\u88C52\u7247",
      \u6570\u91CF: 1,
      \u539F\u8BA2\u5355\u7269\u6D41\u5355\u53F7: "",
      // 空 = 还没发出。第六步「逾期浮出来」说的就是这件事。
      \u8865\u53D1\u7269\u6D41\u5355\u53F7: "",
      \u5FEB\u9012\u516C\u53F8: "\u5706\u901A\u901F\u9012",
      \u53D1\u8D27\u4ED3\u5E93: "\u6DF1\u5733\u4ED3",
      \u5BA2\u8BC9\u52A0\u6025: "",
      \u5DE5\u5355\u72B6\u6001: "\u5F85\u53D1\u8D27",
      \u5904\u7406\u4EBA: "",
      \u521B\u5EFA\u65F6\u95F4: "2026-09-25 15:20:08",
      \u5B8C\u6210\u65F6\u95F4: ""
    }
  },
  \u6D88\u606F: [],
  \u987E\u5BA2\u60C5\u51B5: []
};
var \u7EBF\u4E00\u5267\u672C = {
  \u4F1A\u8BDDID: \u7EBF\u4E00.\u4F1A\u8BDDID,
  \u4E8B\u4EF6: [
    // ── 第一步：顾客 A 进线。一句话，两个问题 ──
    {
      \u6807\u9898: "\u987E\u5BA2 A \u8FDB\u7EBF",
      \u5224\u5B9A\u8F6E\u6B21: 1,
      \u5907\u6CE8: "\u7B2C\u4E00\u53E5\u91CC\u5C31\u6709\u4E24\u4EF6\u4E8B\uFF1A\u542B\u4E0D\u542B\u4E59\u9187\u3001\u6000\u5B55\u80FD\u4E0D\u80FD\u7528",
      \u6D88\u606F: [
        \u9020\u6D88\u606F(\u7EBF\u4E00, 1, "2026-09-29 10:02:12", "\u4E70\u5BB6", "\u4F60\u597D\uFF0C\u8FD9\u4E2A\u7CBE\u534E\u91CC\u6709\u4E59\u9187\u5417\uFF0C\u6211\u6000\u5B55\u4E86\u80FD\u7528\u5417", {
          scene_major: "\u4EA7\u54C1\u54A8\u8BE2",
          scene_minor: "\u6210\u5206\u5B89\u5168",
          \u5173\u8054\u8BA2\u5355\u53F7: \u7EBF\u4E00\u8BA2\u5355\u53F7
        })
      ],
      \u6539\u52A8: {
        \u6458\u8981: "\u4F60\u597D\uFF0C\u8FD9\u4E2A\u7CBE\u534E\u91CC\u6709\u4E59\u9187\u5417\uFF0C\u6211\u6000\u5B55\u4E86\u80FD\u7528\u5417",
        \u6700\u8FD1\u65F6\u95F4: "09-29 10:02",
        \u987E\u5BA2\u60C5\u51B5: [
          // 「查历史中…」是**演示用的中间态**，不是产品会给的值。
          // 第 2 步要演「系统翻了她上一次来的记录」，就得先有一个旧值给它换掉
          // （动效清单第 2 条：文字换值）。真实的装配是同步的，一次到位。
          \u8FD9\u662F\u8C01\u884C("\u67E5\u5386\u53F2\u4E2D\u2026"),
          { \u6807\u7B7E: "\u8FD9\u6B21\u8981\u4EC0\u4E48", \u503C: "\u7CBE\u534E\u542B\u4E0D\u542B\u4E59\u9187 \uFF0B \u6000\u5B55\u80FD\u4E0D\u80FD\u7528" },
          \u8FD9\u5355\u884C(\u7EBF\u4E00\u8BA2\u5355\u53F7, 459, "\u5DF2\u7B7E\u6536")
        ]
      }
    },
    // ── 第二步：系统翻出上一次的记录。**这一步没有消息** ──
    //
    // 这一拍是整份剧本第一次「右栏变了、聊天区没变」。播放器按步走才演得出它，
    // 按条走的话这一步会被整拍跳过（已经播了 1 条，`条到步(1)` 直接给到第 2 步
    // 之外的位置）。
    //
    // ⚠️ **这一格 2026-10-04 停过一天，2026-10-05 拆了。** 那天把 S7「她改话术」
    // 那一串（客服自己敲一句带禁语的话 → 被拦 → ［一键替换］）挪到了这儿，于是
    // **第一停落在卡片之前**：演示的人按下播放，右栏刚翻出老记录，屏幕上就写着
    // 「⏸ 等你点［发送］」—— 而聊天区一张卡都没有，可发的东西根本还不存在。
    // 演示的第一拍该是「识别完这次要什么 → 出现卡片 → 停下」，所以那一串挪回
    // 「这条得你来发」那一格（那本来就是它的位置 —— 当时叫第五格），这一格恢复成
    // **不停**。
    //
    // 那一串为什么不能留在这儿：它要改的是**卡给的那句话术**，而卡要到第三格才
    // 上屏 —— 卡还没有，客服改什么。
    {
      \u6807\u9898: "\u7CFB\u7EDF\u7FFB\u51FA\u4E0A\u4E00\u6B21\u7684\u8BB0\u5F55",
      \u5224\u5B9A\u8F6E\u6B21: 1,
      \u5907\u6CE8: `\u300C\u8FD9\u662F\u8C01\u300D\u81EA\u5DF1\u53D8\u503C \u2014\u2014 \u8001\u5BA2\uFF0C\u4E0A\u6B21 ${\u627F\u8BFA\u65E5}\uFF1B\u7B54\u5E94\u8FC7\u4EC0\u4E48\u3001\u529E\u8FC7\u4EC0\u4E48\u4E00\u5E76\u7FFB\u51FA\u6765`,
      \u6539\u52A8: {
        \u987E\u5BA2\u60C5\u51B5: [
          { \u6807\u7B7E: "\u8FD9\u662F\u8C01", \u503C: "\u8001\u5BA2 \xB7 \u590D\u8D2D 1 \u6B21", \u5907\u6CE8: `\u4E0A\u6B21 ${\u627F\u8BFA\u65E5} \xB7 \u8D60\u54C1\u8865\u53D1\u767B\u8BB0` },
          { \u6807\u7B7E: "\u8FD9\u6B21\u8981\u4EC0\u4E48", \u503C: "\u7CBE\u534E\u542B\u4E0D\u542B\u4E59\u9187 \uFF0B \u6000\u5B55\u80FD\u4E0D\u80FD\u7528" },
          \u7B54\u5E94\u8FC7\u4EC0\u4E48(),
          \u529E\u8FC7\u4EC0\u4E48(\u7EBF\u4E00\u5DE5\u5355\u53F7),
          \u8FD9\u5355\u884C(\u7EBF\u4E00\u8BA2\u5355\u53F7, 459, "\u5DF2\u7B7E\u6536")
        ]
      }
    },
    // ── 第三步：六源扫描 → 依据块生成 ＋ AI 直发那条跟着一起上屏 ──
    //
    // 主卡在这里出现，依据块跟着一起（依据挂在 `建议` 上，见 `Advice`）。
    // 规格 §1.4 的三段式要求：命中的逐条列，未命中的也列 —— 六源是封闭集合，
    // 「六个来源我都查过了」这句话才说得出。这一拍是 3 命中 / 3 无记录。
    //
    // **AI 直发那句也挂在这一格（2026-10-05 并进来的）。**
    // 顾客那一句话里两件事：答得了的那条（不含乙醇）系统当场答掉，答不了的
    // （孕期，涉个体差异）留在卡上等人 —— 分镜表 S6 演的就是这个「裂开」，
    // 而 S6 在 S7（她改话术）**之前**。它原先自己占一格（第四步「含乙醇就地
    // 答了」），可这一格是停格，整轮的活儿都在这儿做完（［采用］→ 补禁语 →
    // 被拦 →［一键替换］→［发送］）—— 客服那句一发出去、时间线就松开，AI 直发
    // 那条反而**后**到，屏幕上成了「客服先答完、AI 再补一句」，而它的时间戳
    // 还更早。并进来之后：停在这一格时它已经在屏幕上，客服才动。
    //
    // **卡一上屏就停（2026-10-04 加）。** 加之前，整条线只有「这条得你来发」那一格
    // 有个停格（「等你发」那一下），而主卡是**这一格**就出来的 —— 中间隔着 AI 直发
    // 那一格（当时它自己占一格）：演示的人看着卡露脸，一个字没点，三秒后聊天区
    // 自己冒出一条以他名义的话（就是那条 `AI` 绿气泡）。现在卡一出来就停住。
    // 三张主卡各有一个这样的停格 —— 这一格、
    // 第六格（一键报备）、线二第一格（立即转交），后两处本来就停在卡出现的那一格上。
    //
    // ── 这一格等的是［发送］：一整轮的活儿都在这一个停格里做完（2026-10-05）──
    //
    // 顺序是：［采用］（把话术搬进输入框）→ 末尾补一句禁语 → 拦截条 → ［一键替换］
    // →［发送］。**发送才是这一格在等的那一下**，也是时间线松开的那一下。
    //
    // 为什么四件事挤在一个停格里、不再往第四格分一个：**一轮只停一次。**
    // 2026-10-05 试过「第三格等［采用］、第四格等［发送］」，跑出来是这样的 ——
    // 演示的人点［采用］，时间线走了；屏幕上卡还在（卡不撤）、输入框里躺着话术，
    // 看着就像**客服已经说完了**，可到第四格又停一次，提示行还念「等你点［发送］」，
    // 备注里又写着［采用］。同一个按钮点两遍、同一个动作等两回（用户原话，按当时
    // 的格号说的：「为什么第五步有重复的暂停重复的采用」）。
    //
    // 一条规矩收口：**卡上屏 → 停下 → 客服把它做完 → 顾客说下一句。**
    // 中间不再插第二个停格（第四格因此成了纯过场，见那一步的注释）。
    //
    // ⚠️ 别把这一格写成［采用］：那颗按钮只把话搬进输入框，搬运完时间线**不动**
    // （`App.handleUseScript` 不放行，这正是 S7 要的 —— 客服正要在那句原文上补
    // 禁语，时间线这时候跑掉，拦截那一下就没得演了）。提示行会念成
    // 「等你点［采用］」，演示的人按下去什么也不会发生。
    //
    // ── S7 那一串怎么演（这一段是给演示的人看的）────────────────
    //
    // 点［采用］，话术进输入框；**在末尾补一句「这款绝对不刺激，您可以放心。」**
    // —— 拦截条自己就弹出来了：它不是发送时才查，是每次渲染拿草稿跑一遍
    // `查禁语`（见 `ChatPanel`），打到一半命中就出。点［一键替换］换成合规说法，
    // 再点［发送］，这一拍才算走完（发送那一下也把时间线松开）。
    //
    // **补的那句得照这个形状写**，不能随口说一句带「绝对」的话 —— 三件事：
    //   · 「绝对」两个字本身拦不住。表里 K09 的禁语是「绝对最低价」那三条，
    //     分镜表字幕写的「命中禁语『绝对』（口径表 K09）」是**写松了**，别照着
    //     它演，照着演的结果是拦截条根本不出现；
    //   · 真正拦得住的是 K10「绝对不刺激」（成分安全，严重度「高」）。它给的
    //     合规说法是「成分温和，但每个人肤质不同，建议先局部试用」；
    //   · ［一键替换］是**裸字符串替换**（`draft.replace(禁语, 建议)`，见
    //     `ChatPanel`），所以补的那句要给它留好位置。「这款绝对不刺激，您可以
    //     放心。」换完接得上；换成「这款绝对不刺激哦」就会换出一个孤零零的「哦」。
    //
    // ［仍然发送］留着不动 —— 分镜表 S7 要的是「提醒她，但不拦」，那条退路就是
    // 「不拦」本身，删了这句话就不成立了。
    //
    // 真窗口那一路（`App.真窗口停`）认的是同一件事（「这一轮真发出去过一句话」），
    // 只是那边没有剧本、没有格号，判据得按消息流现算。
    {
      \u6807\u9898: "\u516D\u6E90\u4F9D\u6B21\u67E5\u8FC7",
      \u5224\u5B9A\u8F6E\u6B21: 1,
      // 那句「亲，这款不含乙醇哦～」是第 1 轮的 AI直发，`已代发` 里就它一条。
      \u8BDD\u672F\u6765\u6E90: { 2: { \u8F6E\u6B21: 1, \u53D6: "\u5DF2\u4EE3\u53D1" } },
      \u5907\u6CE8: "\u547D\u4E2D 3 \u6E90\uFF08\u6210\u5206\u8868 \xB7 \u53E3\u5F84\u8868 \xB7 \u8865\u53D1\u5DE5\u5355\uFF09\uFF0C\u53E6 3 \u6E90\u65E0\u8BB0\u5F55 \u2014\u2014 \u4E00\u5E76\u5217\u51FA\u4EE5\u793A\u65E0\u9057\u6F0F\uFF1BAI \u76F4\u53D1\u90A3\u53E5\u4E5F\u5728\u8FD9\u513F\u4E0A\u5C4F\uFF1B\uFF3B\u91C7\u7528\uFF3D\u2192 \u672B\u5C3E\u8865\u300C\u8FD9\u6B3E\u7EDD\u5BF9\u4E0D\u523A\u6FC0\uFF0C\u60A8\u53EF\u4EE5\u653E\u5FC3\u3002\u300D\u2192 \u62E6\u622A\u6761 \u2192\uFF3B\u4E00\u952E\u66FF\u6362\uFF3D\u2192\uFF3B\u53D1\u9001\uFF3D",
      \u7B49\u70B9\u51FB: "\u53D1\u9001",
      // **它说话只答含乙醇，一个字都不碰孕期。** 口径表 K01 的「可以说」是两句：
      // 「不含已知孕期慎用成分」＋「建议给产检医生确认」。AI 要是把前半句先说了，
      // 那句边界句就没了落点 —— 而恰恰是「缺边界句」才要客服发话术（主卡那句
      // 「涉个体差异」立的就是这个）。所以孕期那半句整个留给主卡。
      \u6D88\u606F: [
        \u9020\u6D88\u606F(
          \u7EBF\u4E00,
          2,
          "2026-09-29 10:02:40",
          "AI",
          "\u4EB2\uFF0C\u8FD9\u6B3E\u4E0D\u542B\u4E59\u9187\u54E6\uFF5E",
          {
            scene_major: "\u4EA7\u54C1\u54A8\u8BE2",
            scene_minor: "\u6210\u5206\u5B89\u5168",
            \u7F72\u540D: "Primer \u81EA\u52A8\u53D1\u9001 \xB7 \u4F9D\u636E\u300C\u53E3\u5F84\u8868 K10\u300D",
            \u5173\u8054\u8BA2\u5355\u53F7: \u7EBF\u4E00\u8BA2\u5355\u53F7
          }
        )
      ],
      \u6539\u52A8: {
        \u5EFA\u8BAE: {
          \u5F62\u6001: "\u9700\u8981\u8BDD\u672F",
          \u5224\u65AD: "\u8FD9\u6B21\u9700\u8981\u300C\u8BDD\u672F\u300D",
          \u6807\u9898: "\u270D\uFE0F \u8FD9\u6761\u5F97\u4F60\u6765\u53D1 \xB7 \u6D89\u4E2A\u4F53\u5DEE\u5F02",
          \u8BF4\u660E: ["\u987E\u5BA2\u63D0\u5230\u6000\u5B55\uFF0C\u5C5E\u4E8E\u4E2A\u4F53\u5DEE\u5F02\uFF1B", "\u8BDD\u672F\u5DF2\u5E26\u8FB9\u754C\u53E5\uFF0C\u4F60\u786E\u8BA4\u540E\u53D1\u9001"],
          \u8BDD\u672F: "\u611F\u8C22\u60A8\u544A\u8BC9\u6211\u4EEC\u3002\u8FD9\u6B3E\u4EA7\u54C1\u7684\u6210\u5206\u91CC\u6CA1\u6709\u5DF2\u77E5\u7684\u5B55\u671F\u614E\u7528\u6210\u5206\uFF1B\u5982\u679C\u60A8\u6BD4\u8F83\u8C28\u614E\uFF0C\u4E5F\u5EFA\u8BAE\u628A\u6210\u5206\u8868\u7ED9\u4EA7\u68C0\u533B\u751F\u770B\u4E00\u4E0B\uFF0C\u4F1A\u66F4\u5B89\u5FC3\u3002",
          \u4F9D\u636E: \u7EBF\u4E00\u4F9D\u636E,
          \u5DF2\u4EE3\u53D1: [
            {
              \u5185\u5BB9: "\u4EB2\uFF0C\u8FD9\u6B3E\u4E0D\u542B\u4E59\u9187\u54E6\uFF5E",
              \u7F72\u540D: "Primer \u81EA\u52A8\u53D1\u9001 \xB7 \u4F9D\u636E\u300C\u53E3\u5F84\u8868 K10\u300D",
              \u4F9D\u636E: [
                { \u5E8F\u53F7: "\u2460", \u51FA\u5904: "\u5546\u54C1\u5C5E\u6027\u8868 \xB7 \u6210\u5206\u680F", \u6458\u8981: "\u4E0D\u542B\u4E59\u9187", \u7528\u4E0A: true },
                { \u5E8F\u53F7: "\u2461", \u51FA\u5904: "\u53E3\u5F84\u8868 K10\u300C\u6210\u5206\u5B89\u5168(\u9152\u7CBE/\u9999\u7CBE)\u300D", \u6458\u8981: "\u4E0D\u5F97\u8BF4\u300C\u653E\u5FC3\u4F7F\u7528\u300D\u300C\u6240\u6709\u80A4\u8D28\u90FD\u80FD\u7528\u300D", \u7528\u4E0A: true }
              ]
            }
          ]
        },
        \u672C\u8F6E\u5904\u7F6E: [
          {
            id: "S_DEMO_A-1-2",
            \u8F6E\u6B21: 1,
            \u4E3B\u5F20: "\u542B\u4E59\u9187",
            \u8F93\u51FA: "AI\u76F4\u53D1",
            \u8BF4\u660E: "\u4F9D\u636E\uFF1A\u5546\u54C1\u5C5E\u6027\u8868\xB7\u6210\u5206\u680F",
            \u6D89\u53CA\u4E2A\u4F53\u5DEE\u5F02: false,
            \u9700\u8FB9\u754C\u53E5: false,
            \u5C42: "\u7B2C3\u5C42",
            \u6743\u9650\u53BB\u5411: "\u672A\u5217\u660E",
            \u4EA4\u63A5\u5206\u7C7B: ""
          },
          {
            id: "S_DEMO_A-1-1",
            \u8F6E\u6B21: 1,
            \u4E3B\u5F20: "\u5B55\u5987\u80FD\u5426\u7528",
            \u8F93\u51FA: "\u5BA2\u670D\u70B9\u53D1\u9001",
            \u8BF4\u660E: "\u6D89\u4E2A\u4F53\u5DEE\u5F02\uFF0C\u5FC5\u987B\u5E26\u8FB9\u754C\u53E5",
            \u6D89\u53CA\u4E2A\u4F53\u5DEE\u5F02: true,
            \u9700\u8FB9\u754C\u53E5: true,
            \u5C42: "\u7B2C3\u5C42",
            \u6743\u9650\u53BB\u5411: "\u672A\u5217\u660E",
            \u4EA4\u63A5\u5206\u7C7B: ""
          }
        ]
      }
    },
    // ── 第四步：轮到客服了。**纯过场 —— 没有消息、没有改动，也不停** ──
    //
    // 屏幕上该有的第三步就摆齐了（主卡、话术、依据、本轮处置、AI 直发那条都在）。
    // 这一步卖的只是**时间**：让演示的人有空说旁白⑥「只有需要她做决定的那一条，
    // 才会飞到她的面前」。S7（补禁语 → 被拦 → ［一键替换］→［发送］）**不在这儿
    // 演，在第三格那一停里演完** —— 理由见第三步的注释。
    //
    // ⚠️ **这一格 2026-10-05 之前是停格，别改回去。** 停着的时候是这样的：客服
    // 在第三格点了［采用］（卡不撤、输入框里躺着话术），AI 直发那条绿气泡又出去了，
    // 屏幕上看就是**客服这一轮已经说完话了**；结果到这一格又停一次，提示行念
    // 「等你点［发送］」，备注里还写着［采用］ —— 同一个按钮点两遍、同一个动作等
    // 两回（用户原话：「为什么第五步有重复的暂停重复的采用，前面客服已经说完话了，
    // 就该让客户说下一句」）。现在这一格一路让过去，下一格就是顾客那一句
    // 「对了，我上次那个赠品还没给我发呢」。
    //
    // **2026-10-05 又一动：AI 直发原先自己占一格（老第四步），已经并进第三步了。**
    // 当时的理由是别让「AI 自己答了」和「轮到你了」同时发生，可代价是顺序倒过来：
    // 客服在第三步那一停里把活做完，时间线松开才播得到 AI 直发 —— 屏幕上就是客服
    // 先答完、AI 再补一句，而它那条的时间戳还更早（用户原话：「应该在我采用……
    // 前面就发出来」）。现在「系统一边自动发一边又要人按」由**停格本身**解决：
    // 卡和气泡一起上屏之后时间线就停住，人不按，什么都不会再冒出来。
    {
      \u6807\u9898: "\u8FD9\u6761\u5F97\u4F60\u6765\u53D1",
      \u5907\u6CE8: "\u8F6E\u5230\u5979\u4E86 \u2014\u2014 \u4E3B\u5361\u5728\u4E0A\u4E00\u683C\u5C31\u6446\u51FA\u6765\u4E86\uFF0C\u65C1\u767D\u2465\u7528\u8FD9\u4E00\u62CD"
    },
    // ── 第五步：顾客想起上次那件事 —— 她说完，「这次要什么」当场多一截 ──
    //
    // **分镜表 §四 那条「同一屏、同一时刻只动一个东西」，这一格是有意破的**
    // （2026-10-04 用户拍板）。原本这一格右栏纹丝不动，新值留到下一格「逾期
    // 浮出来」才上 —— 理由是「她说了」和「系统翻出记录」该是台下分开听的两句话。
    // 实测下来那条读不过来：观众看见她打完字，右栏没动静，只会当成**漏了**，
    // 而不是读成「下一拍才翻记录」。
    //
    // 破的只有**这一行**：她说完，这一行当场添「＋ 赠品补发」。整卡其余部分
    // （这是谁／答应过什么／办过什么／主卡）仍旧纹丝不动 —— 系统真去翻记录、
    // 对上逾期，还是下一格的事，那一格才是主卡从「需要话术」翻成 ③ 报备的地方。
    //
    // 「＋ 赠品补发」这三个字的出处就剩这一格了（原先在下一格，注释写的「下一格
    // 里多出来的那截才有出处」现在指的这一格）。第 6 格一落 `判定轮次: 2`，
    // 接口就会拿第 2 轮的买家原话往上盖 —— `判定.ts` 的 `剧本说了算的行`
    // 把这一行拦下来了，为什么拦写在那边。
    //
    // ── 那条安抚话术是 `31_界面文字清单_给思语.md` §3.1 第 4 条要的 ──
    //
    // 顾客报的是个**负面事实**（赠品没收到），系统第一反应是接住情绪，而且
    // **一个承诺都不给** —— 标记行写的就是「不含承诺，无需客服点」。这是有意的：
    // 东西还没发出去，任何时限都是空头支票（口径表 K05）。真要给时限，得等下一格
    // 那笔补发走完审批。
    //
    // **放在哪一格里是要选的，不是随便塞的。** 它和顾客那句同格落地，不进主卡、
    // 不占一拍 —— 它只是「系统先说了句人话」，没有改变任何状态。给它单独一格的话
    // 整条线要从八步变九步，三处 `等点击` 的格号跟着全挪，而屏幕上多出来的那一拍
    // 什么都不解释。
    {
      \u6807\u9898: "\u987E\u5BA2\u63D0\u8D77\u4E0A\u6B21\u7684\u8D60\u54C1",
      // 序号 5 那句安抚话术归**第 2 轮**：它接的正是顾客这一句「赠品还没发」。
      // 注意这一步没有 `判定轮次`（右栏那一行是剧本自己动的，不是接口端上来的，
      // 见上面那一段）—— 两者的差就是本表要自带 `轮次` 的原因，照着
      // `判定轮次` 推会配到第 1 轮那句讲乙醇的上去。
      \u8BDD\u672F\u6765\u6E90: { 5: { \u8F6E\u6B21: 2, \u53D6: "\u5DF2\u4EE3\u53D1" } },
      \u5907\u6CE8: "\u5979\u8FD9\u4E00\u53E5\u628A\u300C\u4E0A\u6B21\u90A3\u4EF6\u4E8B\u300D\u5E26\u4E86\u51FA\u6765 \u2014\u2014 AI \u5148\u63A5\u4F4F\u60C5\u7EEA\u3001\u4E0D\u7ED9\u627F\u8BFA\uFF1B\u300C\u8FD9\u6B21\u8981\u4EC0\u4E48\u300D\u5F53\u573A\u591A\u4E00\u622A\uFF0C\u5176\u4F59\u8FD8\u7B49\u4E0B\u4E00\u62CD",
      \u6D88\u606F: [
        \u9020\u6D88\u606F(\u7EBF\u4E00, 4, "2026-09-29 10:05:18", "\u4E70\u5BB6", "\u5BF9\u4E86\uFF0C\u6211\u4E0A\u6B21\u90A3\u4E2A\u8D60\u54C1\u8FD8\u6CA1\u7ED9\u6211\u53D1\u5462", {
          scene_major: "\u8865\u53D1\u6362\u8D27",
          scene_minor: "\u6F0F\u53D1\u8D60\u54C1",
          \u5173\u8054\u8BA2\u5355\u53F7: \u7EBF\u4E00\u8BA2\u5355\u53F7
        }),
        \u9020\u6D88\u606F(\u7EBF\u4E00, 5, "2026-09-29 10:05:26", "AI", "\u4EB2\u5B9E\u5728\u62B1\u6B49\u8BA9\u60A8\u4E45\u7B49\uFF0C\u8D60\u54C1\u7684\u4E8B\u6211\u7ACB\u523B\u5E2E\u60A8\u6838\u5B9E\uFF0C\u5C3D\u5FEB\u7B54\u590D\u60A8\uFF5E", {
          scene_major: "\u8865\u53D1\u6362\u8D27",
          scene_minor: "\u6F0F\u53D1\u8D60\u54C1",
          \u7F72\u540D: "Primer \u81EA\u52A8\u53D1\u9001 \xB7 \u5B89\u629A\u8BDD\u672F\uFF08\u4E0D\u542B\u627F\u8BFA\uFF0C\u65E0\u9700\u5BA2\u670D\u70B9\uFF09",
          \u5173\u8054\u8BA2\u5355\u53F7: \u7EBF\u4E00\u8BA2\u5355\u53F7
        })
      ],
      \u6539\u52A8: {
        // 只动这一行，其余四行照抄第 2 格那份快照 —— `改动` 里的数组是**整体
        // 替换**，少写一行就是把它从屏幕上抹掉。`答应过什么` 也照旧不带 `警示`：
        // 逾期是下一格的事，这里先带上，第 6 格那一拍就白演了。
        \u987E\u5BA2\u60C5\u51B5: [
          { \u6807\u7B7E: "\u8FD9\u662F\u8C01", \u503C: "\u8001\u5BA2 \xB7 \u590D\u8D2D 1 \u6B21", \u5907\u6CE8: `\u4E0A\u6B21 ${\u627F\u8BFA\u65E5} \xB7 \u8D60\u54C1\u8865\u53D1\u767B\u8BB0` },
          { \u6807\u7B7E: "\u8FD9\u6B21\u8981\u4EC0\u4E48", \u503C: "\u7CBE\u534E\u542B\u4E0D\u542B\u4E59\u9187 \uFF0B \u6000\u5B55\u80FD\u4E0D\u80FD\u7528 \uFF0B \u8D60\u54C1\u8865\u53D1" },
          \u7B54\u5E94\u8FC7\u4EC0\u4E48(),
          \u529E\u8FC7\u4EC0\u4E48(\u7EBF\u4E00\u5DE5\u5355\u53F7),
          \u8FD9\u5355\u884C(\u7EBF\u4E00\u8BA2\u5355\u53F7, 459, "\u5DF2\u7B7E\u6536")
        ]
      }
    },
    // ── 第六步：逾期浮出来，主卡从「需要话术」翻成 ③ 报备（琥珀）──
    //
    // 逾期本身是从**顾客情况第三行**（`时限`）比出来的 —— 那行写着 9/27 24:00，
    // 今天 9/29，两天。上一格她问了，这一格系统把记录翻出来对上：`警示` 也是
    // 在这里才回填的（类型注释里的三段式：装配产出 `时限`、硬触发读它算天数、
    // 回填写 `警示`）。
    //
    // 报备而不是转交：这单**补得上**（仓库催一下就能发）。转交是留给线二那种
    // 越界的情况的 —— 两条线在这儿分岔，分岔点就是「涉不涉风险／投诉」。
    {
      \u6807\u9898: "\u903E\u671F\u6D6E\u51FA\u6765 \xB7 \u8F6C \u2462 \u62A5\u5907",
      \u5224\u5B9A\u8F6E\u6B21: 2,
      \u5907\u6CE8: `\u5979\u95EE\u7684\u8D60\u54C1\uFF0C\u8BB0\u5F55\u5BF9\u4E0A\u4E86\uFF1A\u627F\u8BFA ${\u627F\u8BFA\u65E5}\u3001\u65F6\u9650 ${\u65F6\u9650}\uFF0C${\u903E\u671F} \u2014\u2014 \u56DE\u8BDD\u5F00\u5934\u5148\u8BA4\u8FD9\u4E2A\u8D26`,
      \u7B49\u70B9\u51FB: "\u4E00\u952E\u62A5\u5907",
      \u6539\u52A8: {
        // 五行整份快照，所以「这次要什么」在这儿又写了一遍 —— 它和上一格**同值**，
        // 这一格真正新的是 `答应过什么` 上那个 `警示`。值一个字没变，不代表这一行
        // 能动它就省着不写：数组是整体替换，漏掉哪一行就是把它从屏幕上抹掉。
        \u987E\u5BA2\u60C5\u51B5: [
          { \u6807\u7B7E: "\u8FD9\u662F\u8C01", \u503C: "\u8001\u5BA2 \xB7 \u590D\u8D2D 1 \u6B21", \u5907\u6CE8: `\u4E0A\u6B21 ${\u627F\u8BFA\u65E5} \xB7 \u8D60\u54C1\u8865\u53D1\u767B\u8BB0` },
          { \u6807\u7B7E: "\u8FD9\u6B21\u8981\u4EC0\u4E48", \u503C: "\u7CBE\u534E\u542B\u4E0D\u542B\u4E59\u9187 \uFF0B \u6000\u5B55\u80FD\u4E0D\u80FD\u7528 \uFF0B \u8D60\u54C1\u8865\u53D1" },
          { ...\u7B54\u5E94\u8FC7\u4EC0\u4E48(), \u8B66\u793A: \u903E\u671F },
          \u529E\u8FC7\u4EC0\u4E48(\u7EBF\u4E00\u5DE5\u5355\u53F7),
          \u8FD9\u5355\u884C(\u7EBF\u4E00\u8BA2\u5355\u53F7, 459, "\u5DF2\u7B7E\u6536")
        ],
        \u5EFA\u8BAE: {
          \u5F62\u6001: "\u9700\u8981\u6388\u6743",
          \u5224\u65AD: "\u8FD9\u6B21\u9700\u8981\u300C\u6388\u6743\u300D\uFF0C\u800C\u4E14\u5DF2\u7ECF\u903E\u671F",
          // 标题这一行 2026-10-05 跟着后端换了字：卡面是接口说了算的（`合建议`
          // 逐字段非空即盖），后端按「缘由」分句之后，③ 这条的理由是**承诺逾期**
          // 而不是「越过额度」，标题就从形态默认那句换成了这一句。
          // ⚠️ 底下 `说明` 这三行是**离线兜底**，屏幕上显示的一直是接口那两行 ——
          // 这个差别在这一版之前就有，不是这次改出来的。
          \u6807\u9898: "\u{1F512} \u7B54\u5E94\u8FC7\u7684\u4E8B\u6CA1\u505A\u5230\uFF0C\u8D70\u52A0\u6025\u5BA1\u6279",
          \u8BF4\u660E: [
            `${\u627F\u8BFA\u65E5} \u7684\u627F\u8BFA${\u903E\u671F}\uFF0C\u56DE\u8BDD\u5F00\u5934\u8981\u5148\u8BA4\u8FD9\u4E2A\u8D26\uFF1B`,
            "\u8865\u53D1\u5355\u767B\u8BB0\u4E86\u3001\u4ED3\u5E93\u8FD8\u6CA1\u53D1\u51FA \u2014\u2014 \u8981\u8D70\u5BA1\u6279\u624D\u80FD\u50AC\u53D1\uFF1B",
            "\u5BF9\u8BDD\u8FD8\u5728\u4F60\u624B\u91CC\uFF0C\u987E\u5BA2\u65E0\u611F\u77E5"
          ],
          \u4F9D\u636E: \u7EBF\u4E00\u4F9D\u636E,
          // 这一格是 `判定轮次: 2` —— 本轮以 AI 名义发出去的是**安抚话术**那一句
          // （上一格落地的那条），不是第 3 格那句「不含乙醇」。
          // 第 3 格那样写是对的（`判定轮次: 1`），照抄到这里就错了：这一屏是第二轮。
          //
          // 依据配的是**这条主张自己的** `判成.依据`。`判定._已代发` 的规矩：本轮
          // 以 AI 名义发的话 = 本轮 `AI直发`／`报备` 主张的成稿，按主张顺序配消息
          // 顺序，不反解、不挂上一轮的。这句走的是 `报备` 的 `安抚话术` 固定表。
          //
          // `出处` 用剧本自己的拼法，**别顺手和接口统一**：接口那边是
          // `f"{table} {row_id}"`（`证据._出处`，只拼接不美化，G3 要拿它回查
          // `table` / `row_id`），剧本这边是给人读的整句。两边从没对齐过，也不该对齐。
          \u5DF2\u4EE3\u53D1: [
            {
              \u5185\u5BB9: "\u4EB2\u5B9E\u5728\u62B1\u6B49\u8BA9\u60A8\u4E45\u7B49\uFF0C\u8D60\u54C1\u7684\u4E8B\u6211\u7ACB\u523B\u5E2E\u60A8\u6838\u5B9E\uFF0C\u5C3D\u5FEB\u7B54\u590D\u60A8\uFF5E",
              \u7F72\u540D: "Primer \u81EA\u52A8\u53D1\u9001 \xB7 \u5B89\u629A\u8BDD\u672F\uFF08\u4E0D\u542B\u627F\u8BFA\uFF0C\u65E0\u9700\u5BA2\u670D\u70B9\uFF09",
              \u4F9D\u636E: [
                { \u5E8F\u53F7: "\u2460", \u51FA\u5904: "\u5546\u54C1\u5C5E\u6027\u8868 \xB7 \u6210\u5206\u680F", \u6458\u8981: "\u6210\u5206\uFF0F\u529F\u6548\uFF0F\u80A4\u8D28\uFF0F\u7528\u6CD5", \u7528\u4E0A: true },
                { \u5E8F\u53F7: "\u2461", \u51FA\u5904: "\u53E3\u5F84\u8868 K05\u300C\u8D60\u54C1\u8865\u53D1\u627F\u8BFA\u300D", \u6458\u8981: "\u8FD8\u6CA1\u53D1\u51FA\uFF0C\u4E0D\u5F97\u518D\u627F\u8BFA\u65F6\u9650", \u7528\u4E0A: true },
                { \u5E8F\u53F7: "\u2463", \u51FA\u5904: "\u8BA2\u5355\uFF0F\u7269\u6D41\uFF0F\u552E\u540E\u8868", \u6458\u8981: `\u8BA2\u5355 ${\u7EBF\u4E00\u8BA2\u5355\u53F7} \xB7 \u8D60\u54C1\u5E94\u53D1\u672A\u53D1`, \u7528\u4E0A: true },
                { \u5E8F\u53F7: "\u2465", \u51FA\u5904: `\u8865\u53D1\u6362\u8D27\u5DE5\u5355 ${\u7EBF\u4E00\u5DE5\u5355\u53F7}`, \u6458\u8981: "9/25 \u5DF2\u767B\u8BB0\u8865\u53D1\uFF0C\u4ED3\u5E93\u8FD8\u6CA1\u53D1\u51FA", \u7528\u4E0A: true }
              ]
            }
          ]
        },
        \u672C\u8F6E\u5904\u7F6E: [
          {
            id: "S_DEMO_A-1-2",
            \u8F6E\u6B21: 1,
            \u4E3B\u5F20: "\u542B\u4E59\u9187",
            \u8F93\u51FA: "AI\u76F4\u53D1",
            \u8BF4\u660E: "\u4F9D\u636E\uFF1A\u5546\u54C1\u5C5E\u6027\u8868\xB7\u6210\u5206\u680F",
            \u6D89\u53CA\u4E2A\u4F53\u5DEE\u5F02: false,
            \u9700\u8FB9\u754C\u53E5: false,
            \u5C42: "\u7B2C3\u5C42",
            \u6743\u9650\u53BB\u5411: "\u672A\u5217\u660E",
            \u4EA4\u63A5\u5206\u7C7B: ""
          },
          {
            id: "S_DEMO_A-1-1",
            \u8F6E\u6B21: 1,
            \u4E3B\u5F20: "\u5B55\u5987\u80FD\u5426\u7528",
            \u8F93\u51FA: "\u5BA2\u670D\u70B9\u53D1\u9001",
            \u8BF4\u660E: "\u6D89\u4E2A\u4F53\u5DEE\u5F02\uFF0C\u5FC5\u987B\u5E26\u8FB9\u754C\u53E5",
            \u6D89\u53CA\u4E2A\u4F53\u5DEE\u5F02: true,
            \u9700\u8FB9\u754C\u53E5: true,
            \u5C42: "\u7B2C3\u5C42",
            \u6743\u9650\u53BB\u5411: "\u672A\u5217\u660E",
            \u4EA4\u63A5\u5206\u7C7B: ""
          },
          // ⚠️ **这一条的 `轮次` 是 2，不是 1。** 它是**第 2 轮**判出来的
          // （顾客第二句「我上次那个赠品还没给我发呢」），只是和上一轮那两条
          // 攒在同一屏上（`判定.合本轮处置` 的「为什么要跨轮攒」）。
          // 写 1 的后果不在这一屏：`App.兑现的` 按 `d.轮次 === 用哪个轮次()` 挑，
          // 挑不到就成了「这一轮没有报备主张」—— ［一键发送］点下去**不报留痕**，
          // 而屏幕上一切正常。id 跟着轮次走，和接口同形（`${会话ID}-${轮次}-${序号}`）。
          //
          // ⚠️ **`层` 是 `第2层`，`权限去向` 是 `报备` —— 不是 `硬触发` / 空串。**
          // 2026-10-01 工单 A §2.1 拍的是「H3 不短路，只提示」，所以逾期不再把
          // 整轮冻在硬触发层（那会把同一轮的「含乙醇 → AI直发」一起冻掉，
          // S6 那一幕就没了）。去向没丢：`permissions.E05 客服承诺逾期未做`
          // 接在第 2 层，`需触发=H3`，判出来就是 `报备`。
          // 这两格只在**接口没答上来**时上屏（`合本轮处置` 有命中就整条换接口的），
          // 所以它们错了平时看不出来 —— 兜底态才是它们唯一的出口。
          {
            id: "S_DEMO_A-2-1",
            \u8F6E\u6B21: 2,
            \u4E3B\u5F20: "\u8D60\u54C1\u6F0F\u53D1",
            \u8F93\u51FA: "\u62A5\u5907",
            \u8BF4\u660E: `H3 \u547D\u4E2D\uFF1A${\u627F\u8BFA\u65E5} \u7684\u627F\u8BFA${\u903E\u671F}`,
            \u6D89\u53CA\u4E2A\u4F53\u5DEE\u5F02: false,
            \u9700\u8FB9\u754C\u53E5: false,
            \u5C42: "\u7B2C2\u5C42",
            \u6743\u9650\u53BB\u5411: "\u62A5\u5907",
            \u4EA4\u63A5\u5206\u7C7B: ""
          }
        ]
      }
    },
    // ── 第七步：审批回来，等客服点发送。**这一步的话压在 `待发` 里** ──
    //
    // 这是**输出③「报备」走完一圈的那一下**（脚本 S11：审批回来 → 一键发送）。
    // 所以这句不写 `消息`，写 `待发` —— 演到这一步屏幕上只多一张「组长已批准」，
    // 客服按了［一键发送］，顾客才收到回复。压着才对：报备的全部意义就是「这句
    // 客服自己发不出去，得等一个授权」，一演到就自动发，那一圈就白走了。
    //
    // **这一步不写 `改动`。** `摘要` 和 `最近时间` 是左边列表那一行，得跟着消息
    // 一起出现；写在 `改动` 里的话，回复还没发出去，列表已经写着「已帮您走加急
    // 审批」了。两样都挪到真发的那一刻去做（见 `App` 的发送处理）。
    //
    // 话术按规格 §七 的**正常收尾**档：这一位不是投诉、也没越界，所以可以给
    // 时限。线二同样位置的那句就不给 —— 那是对比的一半。
    //
    // 这一句是 `31_界面文字清单_给思语.md` §四 第 4 条**点名改过的**，别改回去：
    // 原来写的是「已为您登记，专员会在 24 小时内回访跟进」——**「专员回访」是
    // ④转交的说法，③报备不能说**。报备的意思是「对话还在你手里，我替你去走个
    // 审批」；说专员会回访，等于告诉顾客这事儿不归我管了，和琥珀色主卡上那行
    // 「对话还在你手里」当场打架。
    //
    // 顺序还是**先道歉，再说清登记了什么**：这一单已经逾期两天，上来只报
    // 「已为您登记」等于没接住顾客等的那两天。道歉只认账、不解释原因（「仓库
    // 没发出」是内部的事，说给顾客听只是推责），最后才给时限和单号。
    {
      \u6807\u9898: "\u5BA1\u6279\u56DE\u6765 \xB7 \u7B49\u5BA2\u670D\u70B9\u53D1\u9001",
      // 待发的那句。取 `主卡.话术` 不取 `已代发`：报备那一轮的 `已代发`
      // 是**先于客服点发送自动发出去的安抚话术**（第 7 格已经有了），
      // 而这一句是授权回来、客服真按了［一键发送］才出去的正式答复 —— 两句
      // 不是一回事。
      //
      // ⚠️ 2026-10-06 起**这一格真读得到接口**了：后端给报备那轮填了
      // `主卡.话术`（`rules/收尾话术.py` 的固定表）。此前 `schemas.Advice`
      // 的文档串写着「报备时为 None」，这句因此**恒走下面那行兜底文字** ——
      // 演示的最后一句答复不归链路管，而屏幕上完全看不出来（两边逐字相同，
      // `合消息` 换不换都一个样）。
      //
      // 所以下面 `待发` 里那行文字**不再是它的唯一来源**，是**兜底**：
      // 接口没答上来（`各轮[2]` 缺、`主卡` 是 `null`、`话术` 是空串）时才用。
      // 两边**必须逐字一致** —— `收尾话术表["赠品"]` 和它是同一句，改一处
      // 就得改另一处，否则演示当天最后那句话术会当着观众的面变样。
      \u8BDD\u672F\u6765\u6E90: { 6: { \u8F6E\u6B21: 2, \u53D6: "\u4E3B\u5361\u8BDD\u672F" } },
      \u5907\u6CE8: "\u5148\u9053\u6B49\uFF0C\u518D\u8BF4\u6E05\u767B\u8BB0\u4E86\u4EC0\u4E48\u3001\u4E3A\u4EC0\u4E48\u8D85\u65F6\u8981\u8D70\u5BA1\u6279 \u2014\u2014 \u70B9\u4E86\uFF3B\u4E00\u952E\u53D1\u9001\uFF3D\u8FD9\u53E5\u624D\u51FA\u53BB",
      \u7B49\u70B9\u51FB: "\u4E00\u952E\u53D1\u9001",
      \u5F85\u53D1: [
        \u9020\u6D88\u606F(
          \u7EBF\u4E00,
          6,
          "2026-09-29 10:08:31",
          "\u5BA2\u670D",
          "\u62B1\u6B49\u8BA9\u60A8\u4E45\u7B49\u4E86\uFF0C\u8865\u53D1\u8FD9\u8FB9\u6211\u5DF2\u7ECF\u767B\u8BB0\u597D\uFF0C\u4ECA\u5929\u5B89\u6392\u53D1\u51FA\uFF0C48 \u5C0F\u65F6\u5185\u7ED9\u60A8\u5355\u53F7\u3002",
          {
            scene_major: "\u8865\u53D1\u6362\u8D27",
            scene_minor: "\u6F0F\u53D1\u8D60\u54C1",
            \u5173\u8054\u8BA2\u5355\u53F7: \u7EBF\u4E00\u8BA2\u5355\u53F7,
            \u5173\u8054\u5DE5\u5355\u53F7: \u7EBF\u4E00\u5DE5\u5355\u53F7
          }
        )
      ]
    },
    // ── 第八步：顾客道谢，会话入先例库。**这一步没有客服动作** ──
    //
    // `入库: true` 让顶栏的先例库计数从 56 跳到 57。规格 §八：**只有正常收尾
    // 且没越界才回写**。线二整份剧本里没有这个标记 —— 它转交出去了，没收尾。
    {
      \u6807\u9898: "\u987E\u5BA2\u9053\u8C22 \xB7 \u5165\u5148\u4F8B\u5E93",
      \u5907\u6CE8: "\u8FD9\u4E00\u6B21\u670D\u52A1\u7559\u4E86\u4E0B\u6765\uFF1A\u8131\u654F\u540E\u7684\u4F1A\u8BDD\u6210\u4E3A\u7B2C 57 \u6761\u5148\u4F8B",
      \u5165\u5E93: true,
      \u6D88\u606F: [
        \u9020\u6D88\u606F(\u7EBF\u4E00, 7, "2026-09-29 10:12:05", "\u4E70\u5BB6", "\u597D\u7684\uFF0C\u8C22\u8C22\u5566", {
          scene_major: "\u8865\u53D1\u6362\u8D27",
          scene_minor: "\u6F0F\u53D1\u8D60\u54C1",
          \u5173\u8054\u8BA2\u5355\u53F7: \u7EBF\u4E00\u8BA2\u5355\u53F7
        })
      ],
      \u6539\u52A8: {
        \u6458\u8981: "\u597D\u7684\uFF0C\u8C22\u8C22\u5566",
        \u6700\u8FD1\u65F6\u95F4: "09-29 10:12",
        // 收尾 = 这次联系结束（2026-10-04）。右栏顾客情况卡就靠它退出「初次会话」
        // 那一态 —— 对**这位**顾客没差别（他是老客，走不到那一态），但线一是
        // 演示「一次会话从进到出」的样板，结束这件事得在这儿说全。
        //
        // ⚠️ 副作用：`ChatPanel` 那个「老客／陌生人」徽标也读 `stage`，这一步
        // 会把它从「陌生人」翻成「老客」（实测）。翻过来是对的 —— 小鹿本来就是
        // 老客，徽标在末格之前一直说错 —— 但那是**另一个问题**，见 spec §五。
        stage: "\u5386\u53F2\u8054\u7CFB",
        \u987E\u5BA2\u60C5\u51B5: [
          { \u6807\u7B7E: "\u8FD9\u662F\u8C01", \u503C: "\u8001\u5BA2 \xB7 \u590D\u8D2D 1 \u6B21", \u5907\u6CE8: `\u4E0A\u6B21 ${\u627F\u8BFA\u65E5} \xB7 \u8D60\u54C1\u8865\u53D1\u767B\u8BB0` },
          { \u6807\u7B7E: "\u8FD9\u6B21\u8981\u4EC0\u4E48", \u503C: "\u5DF2\u6536\u5C3E \xB7 \u8865\u53D1\u5DF2\u767B\u8BB0\uFF0C\u5F85\u53D1\u51FA" },
          { ...\u7B54\u5E94\u8FC7\u4EC0\u4E48(), \u8B66\u793A: \u903E\u671F },
          \u529E\u8FC7\u4EC0\u4E48(\u7EBF\u4E00\u5DE5\u5355\u53F7),
          \u8FD9\u5355\u884C(\u7EBF\u4E00\u8BA2\u5355\u53F7, 459, "\u5DF2\u7B7E\u6536")
        ]
      }
    }
  ]
};
var \u7EBF\u4E8C = { \u4F1A\u8BDDID: "S_DEMO_B", \u4E70\u5BB6\u6635\u79F0: "\u963F\u6C85" };
var \u7EBF\u4E8C\u8BA2\u5355\u53F7 = "20260925002";
var \u7EBF\u4E8C\u5DE5\u5355\u53F7 = "BF20260925002";
var \u7EBF\u4E8C\u4F9D\u636E = [
  { \u5E8F\u53F7: "\u2461", \u51FA\u5904: "\u53E3\u5F84\u8868 K20\u300C\u6295\u8BC9\u4E0E\u5347\u7EA7\u300D", \u6458\u8981: "\u4E0D\u5F97\u8BF4\u300C\u968F\u4FBF\u6295\u8BC9\u300D\uFF0C\u987B\u7ACB\u5373\u5347\u7EA7", \u7528\u4E0A: true },
  { \u5E8F\u53F7: "\u2461", \u51FA\u5904: "\u53E3\u5F84\u8868 K05\u300C\u8D60\u54C1\u8865\u53D1\u627F\u8BFA\u300D", \u6458\u8981: "\u8FD8\u6CA1\u53D1\u51FA\uFF0C\u4E0D\u5F97\u518D\u627F\u8BFA\u65F6\u9650", \u7528\u4E0A: true },
  { \u5E8F\u53F7: "\u2465", \u51FA\u5904: `\u8865\u53D1\u6362\u8D27\u5DE5\u5355 ${\u7EBF\u4E8C\u5DE5\u5355\u53F7}`, \u6458\u8981: "9/25 \u5DF2\u767B\u8BB0\u8865\u53D1\uFF0C\u4ED3\u5E93\u8FD8\u6CA1\u53D1\u51FA", \u7528\u4E0A: true },
  { \u5E8F\u53F7: "\u2460", \u51FA\u5904: "\u5546\u54C1\u5C5E\u6027\u8868 \xB7 \u6210\u5206\u680F", \u6458\u8981: "\u6210\u5206\uFF0F\u529F\u6548\uFF0F\u80A4\u8D28\uFF0F\u7528\u6CD5", \u7528\u4E0A: false },
  { \u5E8F\u53F7: "\u2462", \u51FA\u5904: "\u5148\u4F8B\u5E93", \u6458\u8981: "\u5386\u53F2\u540C\u7C7B\u4F1A\u8BDD\u7684\u53E5\u5F0F", \u7528\u4E0A: false },
  { \u5E8F\u53F7: "\u2463", \u51FA\u5904: "\u8BA2\u5355\uFF0F\u7269\u6D41\uFF0F\u552E\u540E\u8868", \u6458\u8981: "\u8BA2\u5355\u4E0E\u7269\u6D41\u8BB0\u5F55", \u7528\u4E0A: false },
  { \u5E8F\u53F7: "\u2464", \u51FA\u5904: "\u4E0D\u826F\u53CD\u5E94\uFF0F\u6295\u8BC9\u8BB0\u5F55", \u6458\u8981: "\u65E0\u4E0D\u826F\u53CD\u5E94\u8BB0\u5F55", \u7528\u4E0A: false }
];
var \u7EBF\u4E8C\u4F1A\u8BDD = {
  ...\u7EBF\u4E8C,
  \u5E97\u94FA: "\u6D4B\u8BD5\u7F8E\u5986\u65D7\u8230\u5E97",
  stage: "\u6392\u961F\u4E2D",
  \u6458\u8981: "\u6F14\u793A\u7EBF\u4E8C \xB7 \u9876\u90E8\u64AD\u653E\u5668\u63A7\u5236\u8FDB\u5EA6",
  \u6700\u8FD1\u65F6\u95F4: "09-29 10:20",
  \u8BA2\u5355: {
    \u8BA2\u5355\u53F7: \u7EBF\u4E8C\u8BA2\u5355\u53F7,
    \u4F1A\u8BDDID: \u7EBF\u4E8C.\u4F1A\u8BDDID,
    \u4E70\u5BB6\u6635\u79F0: \u7EBF\u4E8C.\u4E70\u5BB6\u6635\u79F0,
    \u5E97\u94FA: "\u6D4B\u8BD5\u7F8E\u5986\u65D7\u8230\u5E97",
    \u5546\u54C1\u8D27\u53F7: "XL10501",
    \u5546\u54C1\u540D\u79F0: "\u6D4B\u8BD5\u8212\u7F13\u4FEE\u62A4\u9762\u971C50ml",
    \u6570\u91CF: 1,
    "\u5355\u4EF7(\u5143)": 369,
    "\u5B9E\u4ED8\u91D1\u989D(\u5143)": 369,
    \u8BA2\u5355\u72B6\u6001: "\u5DF2\u7B7E\u6536",
    \u4E0B\u5355\u65F6\u95F4: "2026-09-25 11:20:09",
    \u4ED8\u6B3E\u65F6\u95F4: "2026-09-25 11:22:41",
    \u53D1\u8D27\u65F6\u95F4: "",
    \u5FEB\u9012\u516C\u53F8: "\u4E2D\u901A\u5FEB\u9012",
    \u7269\u6D41\u5355\u53F7: "",
    \u6536\u8D27\u7701: "\u6D59\u6C5F\u7701",
    \u6536\u8D27\u5E02: "\u676D\u5DDE\u5E02",
    \u8D60\u54C1: "XLG5008 \u6D4B\u8BD5\u53D1\u819C\u4F53\u9A8C\u88C530ml\u3000\u5E94\u53D1\u672A\u53D1",
    \u4E70\u5BB6\u7559\u8A00: ""
  },
  \u5DE5\u5355: {
    kind: "\u8865\u53D1\u6362\u8D27",
    ticket: {
      \u5DE5\u5355\u53F7: \u7EBF\u4E8C\u5DE5\u5355\u53F7,
      \u4F1A\u8BDDID: \u7EBF\u4E8C.\u4F1A\u8BDDID,
      \u5173\u8054\u8BA2\u5355\u53F7: \u7EBF\u4E8C\u8BA2\u5355\u53F7,
      \u4E70\u5BB6\u6635\u79F0: \u7EBF\u4E8C.\u4E70\u5BB6\u6635\u79F0,
      \u5E97\u94FA: "\u6D4B\u8BD5\u7F8E\u5986\u65D7\u8230\u5E97",
      \u5DE5\u5355\u7C7B\u578B: "\u6F0F\u53D1\u8D60\u54C1",
      \u552E\u540E\u539F\u56E0: "\u8D60\u54C1\u672A\u968F\u5355\u53D1\u51FA",
      \u53D1\u51FA\u5546\u54C1\u8D27\u53F7: "XLG5008",
      \u53D1\u51FA\u5546\u54C1\u540D\u79F0: "\u6D4B\u8BD5\u53D1\u819C\u4F53\u9A8C\u88C530ml",
      \u6570\u91CF: 1,
      \u539F\u8BA2\u5355\u7269\u6D41\u5355\u53F7: "",
      \u8865\u53D1\u7269\u6D41\u5355\u53F7: "",
      \u5FEB\u9012\u516C\u53F8: "\u4E2D\u901A\u5FEB\u9012",
      \u53D1\u8D27\u4ED3\u5E93: "\u676D\u5DDE\u4ED3",
      \u5BA2\u8BC9\u52A0\u6025: "",
      \u5DE5\u5355\u72B6\u6001: "\u5F85\u53D1\u8D27",
      \u5904\u7406\u4EBA: "",
      \u521B\u5EFA\u65F6\u95F4: "2026-09-25 16:44:51",
      \u5B8C\u6210\u65F6\u95F4: ""
    }
  },
  \u6D88\u606F: [],
  \u987E\u5BA2\u60C5\u51B5: []
};
var \u7EBF\u4E8C\u5267\u672C = {
  \u4F1A\u8BDDID: \u7EBF\u4E8C.\u4F1A\u8BDDID,
  \u4E8B\u4EF6: [
    // ── 第一步：顾客 B 进线。和线一同一件事，多了「投诉」两个字 ──
    //
    // 这一步同时出「已逾期 2 天」和「H1 风险词命中：投诉」，主卡直接是红的。
    // 脚本 S14 那个「琥珀 → 红」的过渡是**镜头语言**（拿颜色对比线一），不是
    // 数据真的先琥珀后红 —— H1 和 H3 是从同一句话里同时判出来的，真按两拍演
    // 反而是错的（第一拍得假装没看见「投诉」）。
    {
      \u6807\u9898: "\u987E\u5BA2 B \u8FDB\u7EBF \xB7 \u6211\u8981\u6295\u8BC9",
      \u5224\u5B9A\u8F6E\u6B21: 1,
      \u5907\u6CE8: "H1 \u98CE\u9669\u8BCD\u547D\u4E2D\u300C\u6295\u8BC9\u300D\uFF0B \u903E\u671F\u672A\u53D1\u51FA \u2192 \u6574\u8F6E\u8F6C\u4EA4\uFF0CH3 \u90A3\u4E00\u6863\u88AB\u77ED\u8DEF\u6389",
      \u7B49\u70B9\u51FB: "\u7ACB\u5373\u8F6C\u4EA4",
      \u6D88\u606F: [
        \u9020\u6D88\u606F(
          \u7EBF\u4E8C,
          1,
          "2026-09-29 10:20:47",
          "\u4E70\u5BB6",
          "\u4E0A\u6B21\u8BF4\u597D\u7684\u8D60\u54C1\u5230\u73B0\u5728\u90FD\u6CA1\u5230\uFF0C\u4F60\u4EEC\u5230\u5E95\u7BA1\u4E0D\u7BA1\uFF1F\u6211\u8981\u6295\u8BC9",
          {
            scene_major: "\u8865\u53D1\u6362\u8D27",
            scene_minor: "\u6F0F\u53D1\u8D60\u54C1",
            \u5173\u8054\u8BA2\u5355\u53F7: \u7EBF\u4E8C\u8BA2\u5355\u53F7
          }
        )
      ],
      \u6539\u52A8: {
        \u6458\u8981: "\u4E0A\u6B21\u8BF4\u597D\u7684\u8D60\u54C1\u5230\u73B0\u5728\u90FD\u6CA1\u5230\uFF0C\u4F60\u4EEC\u5230\u5E95\u7BA1\u4E0D\u7BA1\uFF1F\u6211\u8981\u6295\u8BC9",
        \u6700\u8FD1\u65F6\u95F4: "09-29 10:20",
        \u987E\u5BA2\u60C5\u51B5: [
          { \u6807\u7B7E: "\u8FD9\u662F\u8C01", \u503C: "\u8001\u5BA2 \xB7 \u590D\u8D2D 1 \u6B21", \u5907\u6CE8: `\u4E0A\u6B21 ${\u627F\u8BFA\u65E5} \xB7 \u8D60\u54C1\u8865\u53D1\u767B\u8BB0` },
          { \u6807\u7B7E: "\u8FD9\u6B21\u8981\u4EC0\u4E48", \u503C: "\u8D60\u54C1\u672A\u53D1\u51FA\uFF0C\u8981\u6C42\u6295\u8BC9" },
          { ...\u7B54\u5E94\u8FC7\u4EC0\u4E48(), \u8B66\u793A: \u903E\u671F },
          \u529E\u8FC7\u4EC0\u4E48(\u7EBF\u4E8C\u5DE5\u5355\u53F7),
          \u8FD9\u5355\u884C(\u7EBF\u4E8C\u8BA2\u5355\u53F7, 369, "\u5DF2\u7B7E\u6536")
        ],
        \u5EFA\u8BAE: {
          \u5F62\u6001: "\u6709\u98CE\u9669",
          \u5224\u65AD: "\u8FD9\u6B21\u6709\u300C\u98CE\u9669\u300D\uFF0C\u9700\u8981\u8F6C\u4EA4",
          \u6807\u9898: "\u26A0 \u903E\u671F \uFF0B \u6295\u8BC9 \xB7 \u6574\u901A\u5BF9\u8BDD\u8F6C\u51FA",
          \u8BF4\u660E: [
            "H1 \u98CE\u9669\u8BCD\u547D\u4E2D\uFF1A\u6295\u8BC9\uFF1B",
            `${\u627F\u8BFA\u65E5} \u7684\u627F\u8BFA${\u903E\u671F}\uFF0C\u6D89\u98CE\u9669\u6863 \u2014\u2014 \u4E0D\u8BB8\u8BFA\u65F6\u9650\uFF1B`,
            "\u540C\u8F6E\u5176\u4F59\u4E3B\u5F20\u968F\u5BF9\u8BDD\u4E00\u5E76\u8F6C\u4EA4"
          ],
          \u98CE\u9669\u6807\u7B7E: `\u26A0 ${\u903E\u671F} \xB7 H1 \u98CE\u9669\u8BCD\u547D\u4E2D\uFF1A\u6295\u8BC9`,
          \u8BDD\u672F\u5EFA\u8BAE: "\u8BDD\u672F\u5EFA\u8BAE\uFF1A\u5148\u9053\u6B49\uFF0C\u8BF4\u660E\u5DF2\u5347\u7EA7\u7ED9\u4E13\u5458\u4F18\u5148\u5904\u7406\uFF1B**\u4E0D\u7ED9\u56DE\u8BBF\u65F6\u9650**",
          \u4F9D\u636E: \u7EBF\u4E8C\u4F9D\u636E
        },
        // 两条主张、两条都转交。`交接分类` 按后端 `H3交接分类` 的规则拿**主张
        // 原文**去匹配词表：「赠品漏发」含「漏发」→ 物流；「要求投诉」含
        // 「投诉」→ 公关（物流词表先查，不中才轮到公关）。
        //
        // 剧本脚本 S14 字幕上那个「分类：投诉 · 物流类」指的是**这一通该归哪个
        // 队列**，说的是其中一条。两条都留着、不合并 —— 合并就分不清专家该是
        // 物流还是公关了。
        //
        // **「漏发」是 2026-10-02 才补进物流词表的。** 这条主张原名「赠品未发货」，
        // 靠「发货」两个字中物流；按清单 §1.3 改名成「赠品漏发」之后，词表里一个
        // 词都不中，会**静默返回空串**。用词是有讲究的，改主张之前先拿
        // `H3交接分类` 跑一遍 —— 这一次就是这么查出词表缺词的。
        \u672C\u8F6E\u5904\u7F6E: [
          {
            id: "S_DEMO_B-1-1",
            \u8F6E\u6B21: 1,
            \u4E3B\u5F20: "\u8D60\u54C1\u6F0F\u53D1",
            \u8F93\u51FA: "\u8F6C\u4EA4",
            \u8BF4\u660E: "H3 \u547D\u4E2D \xB7 \u903E\u671F\u4E14\u6D89\u98CE\u9669",
            \u6D89\u53CA\u4E2A\u4F53\u5DEE\u5F02: false,
            \u9700\u8FB9\u754C\u53E5: false,
            \u5C42: "\u786C\u89E6\u53D1",
            \u6743\u9650\u53BB\u5411: "",
            \u4EA4\u63A5\u5206\u7C7B: "\u7269\u6D41"
          },
          {
            id: "S_DEMO_B-1-2",
            \u8F6E\u6B21: 1,
            \u4E3B\u5F20: "\u8981\u6C42\u6295\u8BC9",
            \u8F93\u51FA: "\u8F6C\u4EA4",
            \u8BF4\u660E: "H1 \u98CE\u9669\u8BCD\u547D\u4E2D \xB7 \u8981\u6C42\u4E3B\u7BA1",
            \u6D89\u53CA\u4E2A\u4F53\u5DEE\u5F02: false,
            \u9700\u8FB9\u754C\u53E5: false,
            \u5C42: "\u786C\u89E6\u53D1",
            \u6743\u9650\u53BB\u5411: "",
            \u4EA4\u63A5\u5206\u7C7B: "\u516C\u5173"
          }
        ]
      }
    },
    // ── 第二步：转交话术。**没有时限**，这是和线一那句的分界线 ──
    //
    // 规格 §七 的转交话术表：投诉／要求主管、承诺逾期涉风险 —— **刻意不给时限**；
    // 只有不良反应／过敏那一类才写「24 小时回访」。v1 的脚本在这儿写错过一次
    // （用了线一那句），v2 已改对。
    {
      \u6807\u9898: "\u4EA4\u63A5\u5305\u8F6C\u51FA \xB7 \u8F6C\u4EA4\u8BDD\u672F",
      // 转交那句话来自 `handover.转交话术表`（固定表），接口把它放在 `主卡.话术` 上。
      \u8BDD\u672F\u6765\u6E90: { 2: { \u8F6E\u6B21: 1, \u53D6: "\u4E3B\u5361\u8BDD\u672F" } },
      \u5907\u6CE8: "\u5148\u9053\u6B49 \uFF0B \u5347\u7EA7\uFF0C\u4E0D\u7ED9\u65F6\u9650 \u2014\u2014 \u8BF4\u4E86\u65F6\u9650\u800C\u4E13\u5458\u6CA1\u505A\u5230\uFF0C\u5C31\u662F\u628A\u6295\u8BC9\u5347\u7EA7\u6210\u4E8C\u6B21\u6295\u8BC9",
      \u6D88\u606F: [
        \u9020\u6D88\u606F(
          \u7EBF\u4E8C,
          2,
          "2026-09-29 10:22:03",
          "\u5BA2\u670D",
          "\u62B1\u6B49\u8BA9\u60A8\u7B49\u4E86\u8FD9\u4E48\u4E45\u3002\u8FD9\u8FB9\u5DF2\u7ECF\u628A\u60C5\u51B5\u5347\u7EA7\u7ED9\u4E13\u5458\uFF0C\u4F1A\u4F18\u5148\u5904\u7406\u3002",
          {
            scene_major: "\u8865\u53D1\u6362\u8D27",
            scene_minor: "\u6F0F\u53D1\u8D60\u54C1",
            \u5173\u8054\u8BA2\u5355\u53F7: \u7EBF\u4E8C\u8BA2\u5355\u53F7,
            \u5173\u8054\u5DE5\u5355\u53F7: \u7EBF\u4E8C\u5DE5\u5355\u53F7
          }
        )
      ],
      \u6539\u52A8: {
        \u6458\u8981: "\u62B1\u6B49\u8BA9\u60A8\u7B49\u4E86\u8FD9\u4E48\u4E45\u3002\u8FD9\u8FB9\u5DF2\u7ECF\u628A\u60C5\u51B5\u5347\u7EA7\u7ED9\u4E13\u5458\uFF0C\u4F1A\u4F18\u5148\u5904\u7406\u3002",
        \u6700\u8FD1\u65F6\u95F4: "09-29 10:22",
        // 转出去 = 这段接触在本工作台上到此为止（2026-10-04）。线一那边是
        // 「收尾」，这边是「交出去」，两条路都算结束 —— 结束不是「办完了」，
        // 是「不在我手上了」。
        //
        // 注意线二**没有** `入库: true`（规格 §八：只有正常收尾才回写先例库），
        // 转交不算收尾。所以这两个标记是不同的两件事，别看着像就并成一个。
        stage: "\u5386\u53F2\u8054\u7CFB",
        \u987E\u5BA2\u60C5\u51B5: [
          { \u6807\u7B7E: "\u8FD9\u662F\u8C01", \u503C: "\u8001\u5BA2 \xB7 \u590D\u8D2D 1 \u6B21", \u5907\u6CE8: `\u4E0A\u6B21 ${\u627F\u8BFA\u65E5} \xB7 \u8D60\u54C1\u8865\u53D1\u767B\u8BB0` },
          { \u6807\u7B7E: "\u8FD9\u6B21\u8981\u4EC0\u4E48", \u503C: "\u5DF2\u8F6C\u51FA \xB7 \u6295\u8BC9\u7C7B\uFF0C\u4EA4\u63A5\u7ED9\u4E13\u4EBA" },
          { ...\u7B54\u5E94\u8FC7\u4EC0\u4E48(), \u8B66\u793A: \u903E\u671F },
          \u529E\u8FC7\u4EC0\u4E48(\u7EBF\u4E8C\u5DE5\u5355\u53F7),
          \u8FD9\u5355\u884C(\u7EBF\u4E8C\u8BA2\u5355\u53F7, 369, "\u5DF2\u7B7E\u6536")
        ]
      }
    }
  ]
};
var \u5267\u672C\u8868 = {
  [\u7EBF\u4E00\u5267\u672C.\u4F1A\u8BDDID]: \u7EBF\u4E00\u5267\u672C,
  [\u7EBF\u4E8C\u5267\u672C.\u4F1A\u8BDDID]: \u7EBF\u4E8C\u5267\u672C
};
var \u5148\u4F8B\u5E93\u57FA\u6570 = 56;
function \u5DF2\u5165\u5E93\u6761\u6570(\u672C, \u5DF2\u64AD\u6B65\u6570) {
  if (!\u672C) return 0;
  return \u672C.\u4E8B\u4EF6.slice(0, \u5DF2\u64AD\u6B65\u6570).filter((e) => e.\u5165\u5E93).length;
}

// src/data/index.ts
var agent = {
  \u6635\u79F0: "\u6D4B\u8BD5\u5BA2\u670D",
  \u5E97\u94FA: "\u6D4B\u8BD5\u7F8E\u5986\u65D7\u8230\u5E97"
};
var shopMetrics = [
  { \u6807\u7B7E: "\u4ECA\u65E5\u63A5\u5F85", \u6570\u503C: "12" },
  { \u6807\u7B7E: "\u672A\u4E0B\u5355", \u6570\u503C: "3" },
  { \u6807\u7B7E: "\u672A\u4ED8\u6B3E", \u6570\u503C: "2" },
  { \u6807\u7B7E: "\u5DF2\u4ED8\u6B3E", \u6570\u503C: "7" },
  { \u6807\u7B7E: "\u6628\u65E5\u65FA\u65FA\u6EE1\u610F\u7387", \u6570\u503C: "98.2%" },
  { \u6807\u7B7E: "\u6628\u65E53\u5206\u949F\u54CD\u5E94\u7387", \u6570\u503C: "95.6%" },
  { \u6807\u7B7E: "\u6628\u65E5\u5E73\u5747\u54CD\u5E94\u65F6\u957F", \u6570\u503C: "21s" },
  { \u6807\u7B7E: "\u8BE2\u5355\u8F6C\u5316\u7387", \u6570\u503C: "42.1%", \u5F3A\u8C03: "up" }
];
function \u5148\u4F8B\u5E93\u6307\u6807(\u6761\u6570) {
  return { \u6807\u7B7E: "\u5148\u4F8B\u5E93", \u6570\u503C: String(\u6761\u6570) };
}
var sessions = [\u7EBF\u4E00\u4F1A\u8BDD, \u7EBF\u4E8C\u4F1A\u8BDD];
async function \u53D6\u4F1A\u8BDD\u5217\u8868() {
  try {
    const \u7B54 = await fetch("/api/\u4F1A\u8BDD\u5217\u8868", { signal: AbortSignal.timeout(1e4) });
    if (!\u7B54.ok) return null;
    const \u4F53 = await \u7B54.json();
    return Array.isArray(\u4F53) ? \u4F53 : null;
  } catch {
    return null;
  }
}
function \u5408\u4F1A\u8BDD\u5217\u8868(\u63A5\u53E3\u7684) {
  const \u6F14\u793A\u4E24\u6761 = [\u7EBF\u4E00\u4F1A\u8BDD, \u7EBF\u4E8C\u4F1A\u8BDD];
  const \u6F14\u793A\u7684ID = new Set(\u6F14\u793A\u4E24\u6761.map((s) => s.\u4F1A\u8BDDID));
  const \u5176\u4F59 = \u63A5\u53E3\u7684.filter((s) => !\u6F14\u793A\u7684ID.has(s.\u4F1A\u8BDDID)).sort((a, b) => (b.\u6700\u8FD1\u65F6\u95F4 ?? "").localeCompare(a.\u6700\u8FD1\u65F6\u95F4 ?? ""));
  const \u53CD\u590D\u7684 = \u5176\u4F59.filter((s) => \u91CD\u590D\u4F1A\u8BDD.has(s.\u4F1A\u8BDDID));
  return [...\u6F14\u793A\u4E24\u6761, ...\u5176\u4F59.filter((s) => !\u91CD\u590D\u4F1A\u8BDD.has(s.\u4F1A\u8BDDID)), ...\u53CD\u590D\u7684];
}

// src/data/判定.ts
var AI\u540D\u4E49 = /* @__PURE__ */ new Set(["AI\u76F4\u53D1", "\u62A5\u5907"]);
var \u8D85\u65F6\u6BEB\u79D2 = 12e3;
async function \u53D6\u5224\u5B9A(\u4F1A\u8BDDID, \u8F6E\u6B21, \u5F53\u524D\u65F6\u95F4, \u770B\u5230\u6D88\u606F\u6570) {
  try {
    const \u8BF7\u6C42\u4F53 = { \u4F1A\u8BDDID, \u8F6E\u6B21, \u5F53\u524D\u65F6\u95F4 };
    if (\u770B\u5230\u6D88\u606F\u6570 !== void 0) \u8BF7\u6C42\u4F53.\u770B\u5230\u6D88\u606F\u6570 = \u770B\u5230\u6D88\u606F\u6570;
    const \u7B54 = await fetch("/api/\u5224\u5B9A", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(\u8BF7\u6C42\u4F53),
      signal: AbortSignal.timeout(\u8D85\u65F6\u6BEB\u79D2)
    });
    if (!\u7B54.ok) return null;
    return await \u7B54.json();
  } catch {
    return null;
  }
}
function \u7A7A(\u503C) {
  if (\u503C === null || \u503C === void 0) return true;
  if (typeof \u503C === "string") return \u503C.trim() === "";
  if (Array.isArray(\u503C)) return \u503C.length === 0;
  return false;
}
function \u53D6\u5B57\u6BB5(\u5267\u672C\u7684, \u63A5\u53E3\u7684) {
  return \u7A7A(\u63A5\u53E3\u7684) ? \u5267\u672C\u7684 : \u63A5\u53E3\u7684;
}
var \u5267\u672C\u8BF4\u4E86\u7B97\u7684\u884C = "\u8FD9\u6B21\u8981\u4EC0\u4E48";
function \u5408\u4E00\u884C(\u5267\u672C\u7684, \u63A5\u53E3\u7684) {
  if (!\u63A5\u53E3\u7684) return \u5267\u672C\u7684;
  return {
    \u6807\u7B7E: \u5267\u672C\u7684.\u6807\u7B7E,
    \u503C: \u5267\u672C\u7684.\u6807\u7B7E === \u5267\u672C\u8BF4\u4E86\u7B97\u7684\u884C ? \u5267\u672C\u7684.\u503C ?? \u63A5\u53E3\u7684.\u503C : \u53D6\u5B57\u6BB5(\u5267\u672C\u7684.\u503C, \u63A5\u53E3\u7684.\u503C) ?? \u5267\u672C\u7684.\u503C,
    \u5907\u6CE8: \u53D6\u5B57\u6BB5(\u5267\u672C\u7684.\u5907\u6CE8, \u63A5\u53E3\u7684.\u5907\u6CE8),
    /**
     * **这一格和别的不一样：剧本没给 `警示`，接口给了也不上。**
     *
     * 接口是**一轮一结**，第 1 轮就把 H3 算出来了，`警示` 当场给「已逾期 2 天」。
     * 剧本是**一格一演**：「逾期浮出来」是线一第 6 步那一拍的全部内容
     * （`剧本.ts` 的 `答应过什么` 函数上写着为什么前三步不带它）。
     *
     * 照「接口非空就用」的规矩办，第 3 步右栏就开始飘红 —— 第 6 步那一拍
     * 还没演就已经演完了，而屏幕上不会报任何错。
     *
     * 代价写在这儿：**接口新算出来的、剧本没写的警示会被压掉。** 在这个演示里
     * 两者本来就是同一个值，压掉不丢东西；真接了实时数据之后要重新想 ——
     * 那时候「什么时候该报警」不该由一份演示脚本来决定。
     */
    \u8B66\u793A: \u5267\u672C\u7684.\u8B66\u793A === void 0 ? void 0 : \u53D6\u5B57\u6BB5(\u5267\u672C\u7684.\u8B66\u793A, \u63A5\u53E3\u7684.\u8B66\u793A),
    \u65F6\u9650: \u53D6\u5B57\u6BB5(\u5267\u672C\u7684.\u65F6\u9650, \u63A5\u53E3\u7684.\u65F6\u9650)
  };
}
function \u5408\u987E\u5BA2\u60C5\u51B5(\u5267\u672C\u7684, \u63A5\u53E3\u7684) {
  if (!\u5267\u672C\u7684) return void 0;
  if (!\u63A5\u53E3\u7684?.length) return \u5267\u672C\u7684;
  const \u6309\u6807\u7B7E = new Map(\u63A5\u53E3\u7684.map((\u884C) => [\u884C.\u6807\u7B7E, \u884C]));
  return \u5267\u672C\u7684.map((\u884C) => \u5408\u4E00\u884C(\u884C, \u6309\u6807\u7B7E.get(\u884C.\u6807\u7B7E)));
}
function \u5408\u5EFA\u8BAE(\u5267\u672C\u7684, \u63A5\u53E3\u7684) {
  if (!\u63A5\u53E3\u7684) return \u5267\u672C\u7684;
  if (!\u5267\u672C\u7684) return void 0;
  return {
    \u5F62\u6001: \u63A5\u53E3\u7684.\u5F62\u6001,
    \u5224\u65AD: \u53D6\u5B57\u6BB5(\u5267\u672C\u7684.\u5224\u65AD, \u63A5\u53E3\u7684.\u5224\u65AD) ?? \u5267\u672C\u7684.\u5224\u65AD,
    \u6807\u9898: \u53D6\u5B57\u6BB5(\u5267\u672C\u7684.\u6807\u9898, \u63A5\u53E3\u7684.\u6807\u9898) ?? \u5267\u672C\u7684.\u6807\u9898,
    \u8BF4\u660E: \u53D6\u5B57\u6BB5(\u5267\u672C\u7684.\u8BF4\u660E, \u63A5\u53E3\u7684.\u8BF4\u660E) ?? \u5267\u672C\u7684.\u8BF4\u660E,
    \u8BDD\u672F: \u53D6\u5B57\u6BB5(\u5267\u672C\u7684.\u8BDD\u672F, \u63A5\u53E3\u7684.\u8BDD\u672F),
    \u98CE\u9669\u6807\u7B7E: \u53D6\u5B57\u6BB5(\u5267\u672C\u7684.\u98CE\u9669\u6807\u7B7E, \u63A5\u53E3\u7684.\u98CE\u9669\u6807\u7B7E),
    \u8BDD\u672F\u5EFA\u8BAE: \u53D6\u5B57\u6BB5(\u5267\u672C\u7684.\u8BDD\u672F\u5EFA\u8BAE, \u63A5\u53E3\u7684.\u8BDD\u672F\u5EFA\u8BAE),
    \u4F9D\u636E: \u8865\u516D\u6E90\u7A7A\u4F4D(\u63A5\u53E3\u7684.\u4F9D\u636E),
    \u5DF2\u4EE3\u53D1: \u53D6\u5B57\u6BB5(\u5267\u672C\u7684.\u5DF2\u4EE3\u53D1, \u63A5\u53E3\u7684.\u5DF2\u4EE3\u53D1)
  };
}
function \u63A5\u53E3\u5EFA\u8BAE(\u4E3B\u5361) {
  if (!\u4E3B\u5361) return void 0;
  return { ...\u4E3B\u5361, \u4F9D\u636E: \u8865\u516D\u6E90\u7A7A\u4F4D(\u4E3B\u5361.\u4F9D\u636E) };
}
function \u5408\u672C\u8F6E\u5904\u7F6E(\u5267\u672C\u7684, \u5404\u8F6E) {
  if (!\u5267\u672C\u7684?.length) return void 0;
  const \u6599 = \u5404\u8F6E.flat();
  if (!\u6599.length) return \u5267\u672C\u7684;
  const \u53D6\u5230\u7B2C\u51E0\u6761 = /* @__PURE__ */ new Map();
  return \u5267\u672C\u7684.map((\u6A21\u677F) => {
    const \u7B2C\u51E0\u6761 = \u53D6\u5230\u7B2C\u51E0\u6761.get(\u6A21\u677F.\u8F93\u51FA) ?? 0;
    const \u547D\u4E2D = \u6599.filter((d) => d.\u8F93\u51FA === \u6A21\u677F.\u8F93\u51FA)[\u7B2C\u51E0\u6761];
    \u53D6\u5230\u7B2C\u51E0\u6761.set(\u6A21\u677F.\u8F93\u51FA, \u7B2C\u51E0\u6761 + 1);
    return \u547D\u4E2D ?? \u6A21\u677F;
  });
}
function \u8BDD\u672F\u6765\u6E90\u8868(\u5267\u672C) {
  const \u8868 = /* @__PURE__ */ new Map();
  for (const e of \u5267\u672C?.\u4E8B\u4EF6 ?? []) {
    for (const [\u53F7, \u5F52\u8C01] of Object.entries(e.\u8BDD\u672F\u6765\u6E90 ?? {})) {
      \u8868.set(Number(\u53F7), \u5F52\u8C01);
    }
  }
  return \u8868;
}
function \u6362\u6587\u5B57(\u6761, \u6587, \u7F72\u540D) {
  return {
    ...\u6761,
    message_text: \u6587,
    chat_content: JSON.stringify([{ index: 0, content: \u6587 }]),
    ...\u7F72\u540D === void 0 ? {} : { \u7F72\u540D }
  };
}
function \u5408\u6D88\u606F(\u6D88\u606F\u4EEC, \u5267\u672C, \u5404\u8F6E) {
  const \u8868 = \u8BDD\u672F\u6765\u6E90\u8868(\u5267\u672C);
  if (!\u8868.size || !\u5404\u8F6E) return \u6D88\u606F\u4EEC;
  const \u7528\u6389\u51E0\u6761 = /* @__PURE__ */ new Map();
  return \u6D88\u606F\u4EEC.map((\u6761) => {
    const \u5F52\u8C01 = \u8868.get(\u6761.\u6D88\u606F\u5E8F\u53F7);
    if (!\u5F52\u8C01) return \u6761;
    const \u7B54 = \u5404\u8F6E[\u5F52\u8C01.\u8F6E\u6B21];
    if (!\u7B54?.\u4E3B\u5361) return \u6761;
    if (\u5F52\u8C01.\u53D6 === "\u4E3B\u5361\u8BDD\u672F") {
      const \u6587 = \u7B54.\u4E3B\u5361.\u8BDD\u672F;
      if (!\u6587 || \u7A7A(\u6587)) return \u6761;
      return \u6362\u6587\u5B57(\u6761, \u6587);
    }
    const n = \u7528\u6389\u51E0\u6761.get(\u5F52\u8C01.\u8F6E\u6B21) ?? 0;
    \u7528\u6389\u51E0\u6761.set(\u5F52\u8C01.\u8F6E\u6B21, n + 1);
    const \u4EE3\u53D1 = \u7B54.\u4E3B\u5361.\u5DF2\u4EE3\u53D1?.[n];
    return \u4EE3\u53D1 && !\u7A7A(\u4EE3\u53D1.\u5185\u5BB9) ? \u6362\u6587\u5B57(\u6761, \u4EE3\u53D1.\u5185\u5BB9, \u4EE3\u53D1.\u7F72\u540D) : \u6761;
  });
}
function \u4E00\u8F6E\u7559\u4E00\u6761\u7B54\u590D(\u6D88\u606F\u4EEC, \u5F52\u5C5E, \u73B0\u573A\u8BDD) {
  if (!\u73B0\u573A\u8BDD) return { \u6D88\u606F: \u6D88\u606F\u4EEC, \u5F52\u5C5E };
  const \u6362\u8FC7 = /* @__PURE__ */ new Set();
  const \u51FA\u7684\u6761 = [];
  const \u51FA\u7684\u8F6E = [];
  \u6D88\u606F\u4EEC.forEach((\u6761, i) => {
    const \u8F6E = \u5F52\u5C5E[i];
    const \u8BDD = \u8F6E ? \u73B0\u573A\u8BDD[\u8F6E] : void 0;
    if (!\u8BDD || \u6761.\u89D2\u8272 !== "\u5BA2\u670D") {
      \u51FA\u7684\u6761.push(\u6761);
      \u51FA\u7684\u8F6E.push(\u5F52\u5C5E[i]);
      return;
    }
    if (\u6362\u8FC7.has(\u8F6E)) return;
    \u6362\u8FC7.add(\u8F6E);
    \u51FA\u7684\u6761.push(\u6362\u6587\u5B57(\u6761, \u8BDD));
    \u51FA\u7684\u8F6E.push(\u5F52\u5C5E[i]);
  });
  return { \u6D88\u606F: \u51FA\u7684\u6761, \u5F52\u5C5E: \u51FA\u7684\u8F6E };
}
function \u4E22\u76F4\u53D1\u8F6E\u7684\u8BDD(\u6D88\u606F\u4EEC, \u5F52\u5C5E, \u76F4\u53D1\u8F6E) {
  if (!\u76F4\u53D1\u8F6E.size) return { \u6D88\u606F: \u6D88\u606F\u4EEC, \u5F52\u5C5E };
  const \u51FA\u7684\u6761 = [];
  const \u51FA\u7684\u8F6E = [];
  \u6D88\u606F\u4EEC.forEach((\u6761, i) => {
    if (\u76F4\u53D1\u8F6E.has(\u5F52\u5C5E[i]) && \u6761.\u89D2\u8272 === "\u5BA2\u670D") return;
    \u51FA\u7684\u6761.push(\u6761);
    \u51FA\u7684\u8F6E.push(\u5F52\u5C5E[i]);
  });
  return { \u6D88\u606F: \u51FA\u7684\u6761, \u5F52\u5C5E: \u51FA\u7684\u8F6E };
}
function \u63D2\u4EE3\u53D1(\u6D88\u606F\u4EEC, \u5F52\u5C5E, \u4EE3\u53D1\u4EEC) {
  const \u8981\u63D2 = Object.entries(\u4EE3\u53D1\u4EEC).filter(([, \u6761]) => \u6761?.length).map(([\u8F6E]) => Number(\u8F6E));
  if (!\u8981\u63D2.length) return \u6D88\u606F\u4EEC;
  const \u843D\u70B9 = /* @__PURE__ */ new Map();
  for (let i = 0; i < \u6D88\u606F\u4EEC.length; i += 1) {
    const \u8F6E = \u5F52\u5C5E[i];
    if (\u8981\u63D2.includes(\u8F6E) && \u6D88\u606F\u4EEC[i].\u89D2\u8272 === "\u5BA2\u670D" && !\u843D\u70B9.has(\u8F6E)) \u843D\u70B9.set(\u8F6E, i);
  }
  for (let i = \u6D88\u606F\u4EEC.length - 1; i >= 0; i -= 1) {
    const \u8F6E = \u5F52\u5C5E[i];
    if (\u8981\u63D2.includes(\u8F6E) && !\u843D\u70B9.has(\u8F6E)) \u843D\u70B9.set(\u8F6E, i + 1);
  }
  const \u51FA = [];
  for (let i = 0; i <= \u6D88\u606F\u4EEC.length; i += 1) {
    for (const \u8F6E of \u8981\u63D2) {
      if (\u843D\u70B9.get(\u8F6E) === i) \u51FA.push(...\u4EE3\u53D1\u4EEC[\u8F6E]);
    }
    if (i < \u6D88\u606F\u4EEC.length) \u51FA.push(\u6D88\u606F\u4EEC[i]);
  }
  return \u51FA;
}
function \u8865\u516D\u6E90\u7A7A\u4F4D(\u4F9D\u636E) {
  const \u6709 = \u4F9D\u636E ?? [];
  const \u5DF2\u7ED9 = new Set(\u6709.map((e) => e.\u5E8F\u53F7));
  const \u7A7A\u4F4D = ["\u2460", "\u2461", "\u2462", "\u2463", "\u2464", "\u2465"].filter((\u5E8F\u53F7) => !\u5DF2\u7ED9.has(\u5E8F\u53F7)).map((\u5E8F\u53F7) => ({ \u5E8F\u53F7, \u51FA\u5904: "", \u6458\u8981: "", \u7528\u4E0A: false }));
  return [...\u6709, ...\u7A7A\u4F4D].sort((a, b) => a.\u5E8F\u53F7.localeCompare(b.\u5E8F\u53F7));
}

// src/data/轮次.ts
function \u8F6E\u6B21\u5F52\u5C5E(\u6D88\u606F\u4EEC) {
  const \u8868 = [];
  let \u8F6E = 0;
  let \u5728\u8F6E\u91CC = false;
  for (const \u6761 of \u6D88\u606F\u4EEC) {
    if (\u6761.\u89D2\u8272 === "\u4E70\u5BB6") {
      if (!\u5728\u8F6E\u91CC) \u8F6E += 1;
      \u5728\u8F6E\u91CC = true;
    } else {
      \u5728\u8F6E\u91CC = false;
    }
    \u8868.push(\u8F6E);
  }
  return \u8868;
}
function \u6F14\u5230\u7B2C\u51E0\u8F6E(\u5F52\u5C5E, \u5DF2\u64AD\u683C\u6570) {
  if (\u5DF2\u64AD\u683C\u6570 <= 0) return 0;
  return \u5F52\u5C5E[Math.min(\u5DF2\u64AD\u683C\u6570, \u5F52\u5C5E.length) - 1] ?? 0;
}
function \u5728\u7B49\u7684\u8F6E(\u5F52\u5C5E, \u6D88\u606F\u4EEC, \u5DF2\u64AD\u683C\u6570) {
  const \u4E0B\u4E00\u6761 = \u6D88\u606F\u4EEC[\u5DF2\u64AD\u683C\u6570];
  if (!\u4E0B\u4E00\u6761 || \u4E0B\u4E00\u6761.\u89D2\u8272 !== "\u5BA2\u670D") return 0;
  const \u8F6E = \u5F52\u5C5E[\u5DF2\u64AD\u683C\u6570] ?? 0;
  if (\u8F6E <= 0) return 0;
  const \u4E0A\u4E00\u6761 = \u6D88\u606F\u4EEC[\u5DF2\u64AD\u683C\u6570 - 1];
  if (\u4E0A\u4E00\u6761 && \u4E0A\u4E00\u6761.\u89D2\u8272 === "\u5BA2\u670D" && \u5F52\u5C5E[\u5DF2\u64AD\u683C\u6570 - 1] === \u8F6E) return 0;
  return \u8F6E;
}

// src/data/需求分解.ts
var \u8D85\u65F6\u6BEB\u79D22 = 12e3;
async function \u53D6\u9700\u6C42\u5206\u89E3(\u4F1A\u8BDDID, \u770B\u5230\u51E0\u53E5\u4E70\u5BB6\u8BDD) {
  try {
    const \u7B54 = await fetch("/api/\u9700\u6C42\u5206\u89E3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ \u4F1A\u8BDDID, \u770B\u5230\u51E0\u53E5\u4E70\u5BB6\u8BDD }),
      signal: AbortSignal.timeout(\u8D85\u65F6\u6BEB\u79D22)
    });
    if (!\u7B54.ok) return null;
    return await \u7B54.json();
  } catch {
    return null;
  }
}
function \u9700\u6C42\u5206\u89E3\u952E(\u4F1A\u8BDDID, \u770B\u5230\u51E0\u53E5\u4E70\u5BB6\u8BDD) {
  return `${\u4F1A\u8BDDID}#${\u770B\u5230\u51E0\u53E5\u4E70\u5BB6\u8BDD}`;
}
function \u6700\u8FD1\u4E00\u7248(\u8868, \u4F1A\u8BDDID, \u770B\u5230\u51E0\u53E5\u4E70\u5BB6\u8BDD) {
  for (let \u53E5\u6570 = \u770B\u5230\u51E0\u53E5\u4E70\u5BB6\u8BDD; \u53E5\u6570 >= 1; \u53E5\u6570 -= 1) {
    const \u503C = \u8868[\u9700\u6C42\u5206\u89E3\u952E(\u4F1A\u8BDDID, \u53E5\u6570)];
    if (\u503C) return \u503C;
  }
  return void 0;
}
var \u884C\u6807\u7B7E = "\u8FD9\u6B21\u8981\u4EC0\u4E48";
function \u5408\u9700\u6C42\u5206\u89E3(\u884C\u4EEC, \u503C) {
  if (!\u884C\u4EEC || !\u503C?.trim()) return \u884C\u4EEC;
  return \u884C\u4EEC.map((\u884C) => \u884C.\u6807\u7B7E === \u884C\u6807\u7B7E ? { ...\u884C, \u503C } : \u884C);
}
function \u62B9\u6389\u8981\u4EC0\u4E48\u884C(\u884C\u4EEC) {
  return \u884C\u4EEC?.map((\u884C) => \u884C.\u6807\u7B7E === \u884C\u6807\u7B7E ? { ...\u884C, \u503C: "" } : \u884C);
}

// src/data/交接包.ts
function \u515C\u5E95\u5355\u53F7(\u4F1A\u8BDDID) {
  const \u5E8F\u53F7 = String([...\u4F1A\u8BDDID].reduce((\u548C, c) => \u548C + c.charCodeAt(0), 0) % 1e3).padStart(
    3,
    "0"
  );
  return `JJ${\u6F14\u793A\u4ECA\u5929.replace(/-/g, "")}${\u5E8F\u53F7}`;
}
var \u8D85\u65F6\u6BEB\u79D23 = 8e3;
async function \u540E\u7AEF\u8BF4\u660E(\u7B54) {
  try {
    const \u4F53 = await \u7B54.json();
    const \u53E5 = [\u4F53.\u9519\u8BEF, \u4F53.\u8BE6\u60C5].filter((x) => typeof x === "string" && x !== "");
    if (\u53E5.length) return \u53E5.join(" \xB7 ");
  } catch {
  }
  return `HTTP ${\u7B54.status}`;
}
async function \u6253\u52A8\u4F5C(\u8DEF\u5F84, \u4F53) {
  try {
    const \u7B54 = await fetch(\u8DEF\u5F84, {
      method: "POST",
      ...\u4F53 === void 0 ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(\u4F53) },
      signal: AbortSignal.timeout(\u8D85\u65F6\u6BEB\u79D23)
    });
    if (!\u7B54.ok) return { \u6001: "\u540E\u7AEF\u8BF4\u4E0D", \u8BF4\u660E: await \u540E\u7AEF\u8BF4\u660E(\u7B54), \u7801: \u7B54.status };
    return { \u6001: "\u6210", \u503C: await \u7B54.json() };
  } catch {
    return { \u6001: "\u672A\u8FDE" };
  }
}
async function \u5E26\u81EA\u6108(\u6253, \u91CD\u5224) {
  const \u679C = await \u6253();
  if (\u679C.\u6001 !== "\u540E\u7AEF\u8BF4\u4E0D" || \u679C.\u7801 !== 409) return \u679C;
  if (!await \u91CD\u5224()) return \u679C;
  return \u6253();
}
function \u53D6\u4EA4\u63A5\u5305(\u4F1A\u8BDDID, \u52A8\u4F5C, \u8F6E\u6B21) {
  return \u6253\u52A8\u4F5C(`/api/\u4F1A\u8BDD/${encodeURIComponent(\u4F1A\u8BDDID)}/${\u52A8\u4F5C}`, { \u8F6E\u6B21 });
}
function \u8BB0\u53D1\u9001(\u4F1A\u8BDDID, \u8F6E\u6B21, \u91C7\u7528\u7684\u5904\u7F6Eid, \u8BDD\u672F) {
  return \u6253\u52A8\u4F5C(`/api/\u4F1A\u8BDD/${encodeURIComponent(\u4F1A\u8BDDID)}/\u53D1\u9001`, {
    \u8F6E\u6B21,
    \u91C7\u7528\u7684\u5904\u7F6Eid,
    \u8BDD\u672F
  });
}

// src/hooks/use播放器.ts
var import_react = __toESM(require_react(), 1);
var \u9ED8\u8BA4\u683C\u95F4\u9694 = 3e3;
var \u5224\u5B9A\u4E2D\u63D0\u793A = "\u6B63\u5728\u5224\u5B9A\u2026";
var \u65E0\u505C\u683C = /* @__PURE__ */ new Map();
function usePlayer(\u603B\u683C\u6570, \u505C\u683C2 = \u65E0\u505C\u683C, \u5916\u90E8\u505C\u683C = null) {
  const [\u5DF2\u64AD\u683C\u6570, set\u5DF2\u64AD\u683C\u6570] = (0, import_react.useState)(0);
  const [\u64AD\u653E\u4E2D, set\u64AD\u653E\u4E2D] = (0, import_react.useState)(false);
  const [\u683C\u95F4\u9694, set\u683C\u95F4\u9694] = (0, import_react.useState)(\u9ED8\u8BA4\u683C\u95F4\u9694);
  const \u6F14\u5B8C\u4E86 = \u5DF2\u64AD\u683C\u6570 >= \u603B\u683C\u6570;
  const \u5728\u653E = \u64AD\u653E\u4E2D && !\u6F14\u5B8C\u4E86 && !\u5916\u90E8\u505C\u683C?.(\u5DF2\u64AD\u683C\u6570);
  const \u8DF3\u5230 = (0, import_react.useCallback)(
    (\u683C, \u4E0A\u9650) => {
      const \u9876 = \u4E0A\u9650 ?? \u603B\u683C\u6570;
      set\u5DF2\u64AD\u683C\u6570(Math.max(0, Math.min(\u9876, \u683C)));
      set\u64AD\u653E\u4E2D(false);
    },
    [\u603B\u683C\u6570]
  );
  const \u91CD\u7F6E = (0, import_react.useCallback)(() => \u8DF3\u5230(0), [\u8DF3\u5230]);
  const \u6682\u505C = (0, import_react.useCallback)(() => set\u64AD\u653E\u4E2D(false), []);
  const \u64AD\u653E = (0, import_react.useCallback)(() => {
    set\u5DF2\u64AD\u683C\u6570((n) => n >= \u603B\u683C\u6570 ? 0 : n);
    set\u64AD\u653E\u4E2D(true);
  }, [\u603B\u683C\u6570]);
  const \u5207\u6362 = (0, import_react.useCallback)(() => {
    if (\u64AD\u653E\u4E2D) \u6682\u505C();
    else \u64AD\u653E();
  }, [\u64AD\u653E\u4E2D, \u64AD\u653E, \u6682\u505C]);
  const \u4E0B\u4E00\u8DF3 = (0, import_react.useCallback)(() => {
    set\u64AD\u653E\u4E2D(false);
    set\u5DF2\u64AD\u683C\u6570((n) => n >= \u603B\u683C\u6570 ? 1 : n + 1);
  }, [\u603B\u683C\u6570]);
  (0, import_react.useEffect)(() => {
    const onKey = (e) => {
      if (e.code !== "Space") return;
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      \u5207\u6362();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [\u5207\u6362]);
  (0, import_react.useEffect)(() => {
    if (!\u5728\u653E) return;
    const \u5F53\u524D = \u5DF2\u64AD\u683C\u6570;
    const t = setTimeout(
      () => {
        const \u4E0B\u4E00 = \u5F53\u524D + 1;
        set\u5DF2\u64AD\u683C\u6570(\u4E0B\u4E00);
        if (\u505C\u683C2.has(\u4E0B\u4E00)) set\u64AD\u653E\u4E2D(false);
      },
      \u5F53\u524D === 0 ? 0 : \u683C\u95F4\u9694
    );
    return () => clearTimeout(t);
  }, [\u5728\u653E, \u5DF2\u64AD\u683C\u6570, \u683C\u95F4\u9694, \u505C\u683C2]);
  const \u505C\u5728 = \u5728\u653E || \u6F14\u5B8C\u4E86 ? null : \u505C\u683C2.get(\u5DF2\u64AD\u683C\u6570) ?? \u5916\u90E8\u505C\u683C?.(\u5DF2\u64AD\u683C\u6570) ?? null;
  const \u7EE7\u7EED = (0, import_react.useCallback)(() => {
    if (\u5DF2\u64AD\u683C\u6570 >= \u603B\u683C\u6570) return;
    if (!\u505C\u683C2.has(\u5DF2\u64AD\u683C\u6570) && !\u5916\u90E8\u505C\u683C?.(\u5DF2\u64AD\u683C\u6570)) return;
    set\u64AD\u653E\u4E2D(true);
  }, [\u5DF2\u64AD\u683C\u6570, \u603B\u683C\u6570, \u505C\u683C2, \u5916\u90E8\u505C\u683C]);
  return {
    \u5DF2\u64AD\u683C\u6570,
    \u603B\u683C\u6570,
    \u5728\u653E,
    \u683C\u95F4\u9694,
    \u64AD\u653E,
    \u6682\u505C,
    \u5207\u6362,
    \u8DF3\u5230,
    \u91CD\u7F6E,
    \u4E0B\u4E00\u8DF3,
    \u8BBE\u683C\u95F4\u9694: set\u683C\u95F4\u9694,
    \u505C\u5728,
    \u7EE7\u7EED
  };
}

// src/App.tsx
var import_jsx_runtime = __toESM(require_jsx(), 1);
var \u672C\u5730\u8BB0\u53F7 = "-local-";
var \u65E0\u6D88\u606F = [];
function \u524D\u6BB5\u4E70\u5BB6\u8BDD\u6570(\u6D88\u606F\u4EEC, \u9876) {
  return \u9876 ? \u6D88\u606F\u4EEC.slice(0, \u9876).filter((m) => m.\u89D2\u8272 === "\u4E70\u5BB6").length : 0;
}
function \u62B9\u6389\u672A\u5230\u573A\u7684\u627F\u8BFA(\u884C\u4EEC) {
  return \u884C\u4EEC?.map(
    (\u884C) => \u884C.\u6807\u7B7E === "\u7B54\u5E94\u8FC7\u4EC0\u4E48" ? { ...\u884C, \u503C: "", \u5907\u6CE8: void 0, \u8B66\u793A: void 0, \u65F6\u9650: void 0 } : \u884C
  );
}
function buildAgentMessage(session, text, \u5E8F\u53F7) {
  const template = session.\u6D88\u606F.at(-1);
  const now = /* @__PURE__ */ new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return {
    \u4F1A\u8BDDID: session.\u4F1A\u8BDDID,
    \u6D88\u606F\u5E8F\u53F7: \u5E8F\u53F7,
    message_id: `${session.\u4F1A\u8BDDID}${\u672C\u5730\u8BB0\u53F7}${\u5E8F\u53F7}`,
    \u53D1\u9001\u65F6\u95F4: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    \u89D2\u8272: "\u5BA2\u670D",
    \u4E70\u5BB6\u6635\u79F0: session.\u4E70\u5BB6\u6635\u79F0,
    \u53D1\u9001\u65B9: `${session.\u5E97\u94FA}:${agent.\u6635\u79F0}`,
    \u5E97\u94FA: session.\u5E97\u94FA,
    scene_major: template?.scene_major ?? "",
    scene_minor: template?.scene_minor ?? "",
    is_target_buyer_message: false,
    message_text: text,
    \u5185\u5BB9\u7C7B\u578B: "\u6587\u672C",
    chat_content: JSON.stringify([{ index: 0, content: text }]),
    category: template?.category ?? "service",
    image_path: "",
    \u5173\u8054\u8BA2\u5355\u53F7: session.\u8BA2\u5355?.\u8BA2\u5355\u53F7 ?? "",
    \u5173\u8054\u5DE5\u5355\u53F7: session.\u5DE5\u5355?.ticket.\u5DE5\u5355\u53F7 ?? ""
  };
}
var \u5361\u4E0A\u6309\u94AE = {
  \u9700\u8981\u8BDD\u672F: "\u91C7\u7528",
  \u9700\u8981\u6388\u6743: "\u4E00\u952E\u62A5\u5907",
  \u6709\u98CE\u9669: "\u7ACB\u5373\u8F6C\u4EA4"
};
var \u4EE3\u53D1\u7F72\u540D = {
  AI\u76F4\u53D1: "Primer \u81EA\u52A8\u53D1\u9001",
  \u62A5\u5907: "Primer \u81EA\u52A8\u53D1\u9001 \xB7 \u5B89\u629A\u8BDD\u672F\uFF08\u4E0D\u542B\u627F\u8BFA\uFF0C\u65E0\u9700\u5BA2\u670D\u70B9\uFF09"
};
var \u6279\u51C6\u6BEB\u79D2 = 6e3;
function buildAutoMessage(\u4F1A\u8BDD, \u951A, \u6587, \u7F72\u540D, \u7B2C\u51E0\u6761 = 0) {
  return {
    ...buildAgentMessage(\u4F1A\u8BDD, \u6587, \u951A.\u6D88\u606F\u5E8F\u53F7),
    // 自己的 id：**不能沿用 `buildAgentMessage` 那个**，那个是「客服在界面上发了一条」
    // 的记号，会和客服真发出去的那条撞上（`MessageList` 拿它当 key）。
    //
    // ⚠️ **`第几条` 是 2026-10-06 补的，不能省。** 一条轮次里可能不止一句代发的话
    // （无卡无稿那一轮是按日志原话一句一条地补的，一轮里有两句客服话的实测占 63/482）。
    // 只拿锚的下标当 id 的话，同一轮里那几条**共用一个 key** —— 而 `MessageList`
    // 就是拿它当 key 的，React 那边表现为少画一条、或者两条互相顶掉，
    // 而屏幕上不报任何错。
    message_id: `${\u4F1A\u8BDD.\u4F1A\u8BDDID}${\u672C\u5730\u8BB0\u53F7}AI-${\u951A.\u6D88\u606F\u5E8F\u53F7}-${\u7B2C\u51E0\u6761}`,
    \u53D1\u9001\u65F6\u95F4: \u951A.\u53D1\u9001\u65F6\u95F4,
    \u89D2\u8272: "AI",
    \u53D1\u9001\u65B9: "Primer",
    \u7F72\u540D
  };
}
function \u5E26\u4EE3\u53D1(\u5361, \u8BDD\u4EEC) {
  if (!\u5361 || \u5361.\u5DF2\u4EE3\u53D1?.length || !\u8BDD\u4EEC?.length) return \u5361;
  return {
    ...\u5361,
    // `依据` 留空：真窗口上拿不到「这一句话引了哪几条」（接口只回报本轮的六源命中，
    // `api/证据.py` 的模块文档串专门说了那不是一回事）。空着一眼看得出没有，编一个
    // 出处上去看不出来。`SentList` 那一行空了就不渲染。
    \u5DF2\u4EE3\u53D1: \u8BDD\u4EEC.map((m) => ({ \u5185\u5BB9: m.message_text, \u7F72\u540D: m.\u7F72\u540D ?? "", \u4F9D\u636E: [] }))
  };
}
function App() {
  const [sessions2, setSessions] = (0, import_react2.useState)(sessions);
  const [activeId, setActiveId] = (0, import_react2.useState)(
    sessions.find((s) => \u5267\u672C\u8868[s.\u4F1A\u8BDDID])?.\u4F1A\u8BDDID ?? sessions[0]?.\u4F1A\u8BDDID ?? ""
  );
  const [\u73B0\u573A\u6D88\u606F\u8868, set\u73B0\u573A\u6D88\u606F\u8868] = (0, import_react2.useState)({});
  const [\u73B0\u573A\u5BA2\u670D\u8BDD, set\u73B0\u573A\u5BA2\u670D\u8BDD] = (0, import_react2.useState)({});
  const [\u73B0\u573A\u62A5\u5907, set\u73B0\u573A\u62A5\u5907] = (0, import_react2.useState)({});
  const [\u73B0\u573A\u8F6C\u4EA4\u8F6E, set\u73B0\u573A\u8F6C\u4EA4\u8F6E] = (0, import_react2.useState)({});
  const [\u5224\u5B9A\u8868, set\u5224\u5B9A\u8868] = (0, import_react2.useState)({});
  const [\u9700\u6C42\u5206\u89E3\u8868, set\u9700\u6C42\u5206\u89E3\u8868] = (0, import_react2.useState)({});
  const [\u9700\u6C42\u515C\u5E95, set\u9700\u6C42\u515C\u5E95] = (0, import_react2.useState)({});
  const [\u4EA4\u63A5\u5305\u8868, set\u4EA4\u63A5\u5305\u8868] = (0, import_react2.useState)({});
  const [\u5224\u5B9A\u672A\u8FDE, set\u5224\u5B9A\u672A\u8FDE] = (0, import_react2.useState)(false);
  const [\u5224\u5B9A\u4E2D, set\u5224\u5B9A\u4E2D] = (0, import_react2.useState)({});
  const [\u5224\u6CA1\u8FC7, set\u5224\u6CA1\u8FC7] = (0, import_react2.useState)({});
  const [\u5217\u8868\u672A\u8FDE, set\u5217\u8868\u672A\u8FDE] = (0, import_react2.useState)(false);
  const [\u52A8\u4F5C\u515C\u5E95, set\u52A8\u4F5C\u515C\u5E95] = (0, import_react2.useState)({});
  const [\u52A8\u4F5C\u88AB\u62D2, set\u52A8\u4F5C\u88AB\u62D2] = (0, import_react2.useState)();
  const \u5DF2\u95EE\u8FC7 = (0, import_react2.useRef)(/* @__PURE__ */ new Set());
  const \u5224\u5B9A\u952E = (0, import_react2.useCallback)(
    (\u4F1A\u8BDDID, \u8F6E, \u770B\u5230\u6D88\u606F\u6570) => \u770B\u5230\u6D88\u606F\u6570 === void 0 ? `${\u4F1A\u8BDDID}-${\u8F6E}` : `${\u4F1A\u8BDDID}-${\u8F6E}-${\u770B\u5230\u6D88\u606F\u6570}`,
    []
  );
  const \u4E0A\u6B21\u95EE\u7684 = (0, import_react2.useRef)(void 0);
  const \u5DF2\u95EE\u8FC7\u9700\u6C42 = (0, import_react2.useRef)(/* @__PURE__ */ new Set());
  const \u95EE\u4E00\u8F6E = (0, import_react2.useCallback)(
    async (\u4F1A\u8BDDID, \u8F6E, \u5F53\u524D\u65F6\u95F4, \u770B\u5230\u6D88\u606F\u6570) => {
      const \u952E = \u5224\u5B9A\u952E(\u4F1A\u8BDDID, \u8F6E, \u770B\u5230\u6D88\u606F\u6570);
      \u5DF2\u95EE\u8FC7.current.add(\u952E);
      \u4E0A\u6B21\u95EE\u7684.current = \u952E;
      set\u5224\u5B9A\u4E2D((prev) => ({ ...prev, [\u4F1A\u8BDDID]: true }));
      const \u7B54 = await \u53D6\u5224\u5B9A(\u4F1A\u8BDDID, \u8F6E, \u5F53\u524D\u65F6\u95F4, \u770B\u5230\u6D88\u606F\u6570);
      set\u5224\u5B9A\u4E2D((prev) => {
        if (!prev[\u4F1A\u8BDDID]) return prev;
        const \u5176\u4F59 = { ...prev };
        delete \u5176\u4F59[\u4F1A\u8BDDID];
        return \u5176\u4F59;
      });
      if (!\u7B54) {
        \u5DF2\u95EE\u8FC7.current.delete(\u952E);
        set\u5224\u5B9A\u672A\u8FDE(true);
        if (!\u5267\u672C\u8868[\u4F1A\u8BDDID]) {
          set\u5224\u6CA1\u8FC7((prev) => ({
            ...prev,
            [\u4F1A\u8BDDID]: { ...prev[\u4F1A\u8BDDID], [\u8F6E]: true }
          }));
        }
        return null;
      }
      const \u7ED3\u679C = \u770B\u5230\u6D88\u606F\u6570 === void 0 ? \u7B54 : { ...\u7B54, \u770B\u5230\u6D88\u606F\u6570 };
      set\u5224\u5B9A\u672A\u8FDE(false);
      set\u5224\u6CA1\u8FC7((prev) => {
        if (!prev[\u4F1A\u8BDDID]) return prev;
        const \u5176\u4F59 = { ...prev[\u4F1A\u8BDDID] };
        delete \u5176\u4F59[\u8F6E];
        const \u51FA = { ...prev };
        if (Object.keys(\u5176\u4F59).length) \u51FA[\u4F1A\u8BDDID] = \u5176\u4F59;
        else delete \u51FA[\u4F1A\u8BDDID];
        return \u51FA;
      });
      set\u5224\u5B9A\u8868((prev) => ({
        ...prev,
        // 存哪儿：**问谁就存谁**。问的轮次一律由调用方算好（演示线从剧本、真窗口
        // 从消息流），所以键就是它，不看 `答.轮次` —— 那个数只该跟它相等，不相等
        // 就是后端答错了轮，照着它存反而会把错的那一轮盖到屏幕上。
        [\u4F1A\u8BDDID]: { ...prev[\u4F1A\u8BDDID], [\u8F6E]: \u7ED3\u679C }
      }));
      return \u7ED3\u679C;
    },
    [\u5224\u5B9A\u952E]
  );
  const \u5267\u672C = \u5267\u672C\u8868[activeId];
  const \u672C\u7A97\u53E3 = sessions2.find((s) => s.\u4F1A\u8BDDID === activeId);
  const \u6D88\u606F\u4EEC = \u672C\u7A97\u53E3?.\u6D88\u606F ?? \u65E0\u6D88\u606F;
  const \u6D3B\u6761\u6570 = \u6D88\u606F\u4EEC.length;
  const \u5F52\u5C5E = (0, import_react2.useMemo)(() => \u8F6E\u6B21\u5F52\u5C5E(\u6D88\u606F\u4EEC), [\u6D88\u606F\u4EEC]);
  const \u603B\u683C\u6570 = \u5267\u672C ? \u5267\u672C.\u4E8B\u4EF6.length : \u6D3B\u6761\u6570;
  const \u505C\u683C\u8868 = (0, import_react2.useMemo)(() => \u505C\u683C(\u5267\u672C), [\u5267\u672C]);
  const \u5224\u5B9A\u6E38\u6807 = (\u683C) => {
    const \u8D77\u6F14\u683C2 = \u672C\u7A97\u53E3?.\u8D77\u6F14\u683C ?? 0;
    for (let i = Math.min(\u683C, \u6D88\u606F\u4EEC.length) - 1; i >= \u8D77\u6F14\u683C2; i -= 1) {
      if (\u6D88\u606F\u4EEC[i].\u89D2\u8272 === "\u4E70\u5BB6") return i + 1;
    }
    return void 0;
  };
  const \u771F\u7A97\u53E3\u505C = (\u683C) => {
    if (\u5267\u672C) return null;
    const \u8F6E = \u5728\u7B49\u7684\u8F6E(\u5F52\u5C5E, \u6D88\u606F\u4EEC, \u683C);
    if (!\u8F6E) return null;
    const \u7B54 = \u5224\u5B9A\u8868[activeId]?.[\u8F6E];
    if (\u7B54?.\u770B\u5230\u6D88\u606F\u6570 !== void 0 && \u7B54.\u770B\u5230\u6D88\u606F\u6570 !== \u5224\u5B9A\u6E38\u6807(\u683C)) {
      return \u5224\u5B9A\u4E2D[activeId] ? \u5224\u5B9A\u4E2D\u63D0\u793A : null;
    }
    if (!\u7B54) return \u5224\u5B9A\u4E2D[activeId] ? \u5224\u5B9A\u4E2D\u63D0\u793A : null;
    const \u5361 = \u63A5\u53E3\u5EFA\u8BAE(\u7B54.\u4E3B\u5361);
    if (!\u5361) return null;
    const \u505A\u8FC7\u4E86 = \u5361.\u5F62\u6001 === "\u9700\u8981\u8BDD\u672F" && \u73B0\u573A\u5BA2\u670D\u8BDD[activeId]?.[\u8F6E] !== void 0 || \u5361.\u5F62\u6001 === "\u9700\u8981\u6388\u6743" && (\u5267\u672C ? Boolean(\u672C\u7A97\u53E3?.\u62A5\u5907) : \u73B0\u573A\u62A5\u5907[activeId] === "\u5DF2\u7B54\u590D") || \u5361.\u5F62\u6001 === "\u6709\u98CE\u9669" && Boolean(\u672C\u7A97\u53E3?.\u8F6C\u4EA4);
    return \u505A\u8FC7\u4E86 ? null : \u5361\u4E0A\u6309\u94AE[\u5361.\u5F62\u6001];
  };
  const \u64AD\u653E = usePlayer(\u603B\u683C\u6570, \u505C\u683C\u8868, \u771F\u7A97\u53E3\u505C);
  const \u5F53\u524D\u770B\u5230\u6D88\u606F\u6570 = \u5267\u672C ? void 0 : \u5224\u5B9A\u6E38\u6807(\u64AD\u653E.\u5DF2\u64AD\u683C\u6570);
  const \u5F53\u524D\u771F\u8F6E\u6B21 = \u5267\u672C || \u64AD\u653E.\u5DF2\u64AD\u683C\u6570 <= (\u672C\u7A97\u53E3?.\u8D77\u6F14\u683C ?? 0) || \u5F53\u524D\u770B\u5230\u6D88\u606F\u6570 === void 0 ? 0 : \u6F14\u5230\u7B2C\u51E0\u8F6E(\u5F52\u5C5E, \u64AD\u653E.\u5DF2\u64AD\u683C\u6570);
  const \u53EF\u7528\u771F\u7B54 = (\u8F6E) => {
    const \u7B54 = \u5224\u5B9A\u8868[activeId]?.[\u8F6E];
    if (!\u7B54 || \u5267\u672C || \u5F53\u524D\u770B\u5230\u6D88\u606F\u6570 === void 0) return \u7B54;
    return \u7B54.\u770B\u5230\u6D88\u606F\u6570 === \u5F53\u524D\u770B\u5230\u6D88\u606F\u6570 ? \u7B54 : void 0;
  };
  const \u53EF\u89C1\u6B64\u523B = \u5F53\u524D\u770B\u5230\u6D88\u606F\u6570 && \u6D88\u606F\u4EEC[\u5F53\u524D\u770B\u5230\u6D88\u606F\u6570 - 1]?.\u53D1\u9001\u65F6\u95F4 ? \u6D88\u606F\u4EEC[\u5F53\u524D\u770B\u5230\u6D88\u606F\u6570 - 1].\u53D1\u9001\u65F6\u95F4 : void 0;
  const \u771F\u4EE3\u53D1 = (0, import_react2.useMemo)(() => {
    const \u7A7A2 = {};
    if (\u5267\u672C || \u5F53\u524D\u771F\u8F6E\u6B21 <= 0 || \u5F53\u524D\u770B\u5230\u6D88\u606F\u6570 === void 0) return \u7A7A2;
    const \u4F1A\u8BDD = sessions2.find((s) => s.\u4F1A\u8BDDID === activeId);
    if (!\u4F1A\u8BDD) return \u7A7A2;
    const \u7B54\u8868 = \u5224\u5B9A\u8868[activeId];
    const \u4EA4\u63A5\u8F6E = \u73B0\u573A\u8F6C\u4EA4\u8F6E[activeId];
    const \u51FA = {};
    for (let \u8F6E = 1; \u8F6E <= \u5F53\u524D\u771F\u8F6E\u6B21; \u8F6E += 1) {
      const \u7B54 = \u7B54\u8868?.[\u8F6E];
      if (\u4EA4\u63A5\u8F6E !== void 0 && \u8F6E >= \u4EA4\u63A5\u8F6E) continue;
      const \u5224\u8FC7 = \u7B54?.\u770B\u5230\u6D88\u606F\u6570;
      const \u7248\u672C\u5BF9\u5F97\u4E0A = \u5224\u8FC7 !== void 0 && \u5224\u8FC7 !== null && \u5224\u8FC7 <= \u5F53\u524D\u770B\u5230\u6D88\u606F\u6570;
      const \u951A = \u6D88\u606F\u4EEC.find((m, i) => \u5F52\u5C5E[i] === \u8F6E && m.\u89D2\u8272 === "\u4E70\u5BB6");
      if (!\u951A) continue;
      if (\u7248\u672C\u5BF9\u5F97\u4E0A) {
        const \u6761 = \u7B54.\u672C\u8F6E\u5904\u7F6E.filter(
          (d) => AI\u540D\u4E49.has(d.\u8F93\u51FA) && Boolean(d.\u8BDD\u672F)
        );
        if (\u6761.length) {
          const \u53BB\u8FC7\u91CD = \u6761.filter((d, i) => \u6761.findIndex((x) => x.\u8BDD\u672F === d.\u8BDD\u672F) === i);
          \u51FA[\u8F6E] = \u53BB\u8FC7\u91CD.map((d) => buildAutoMessage(\u4F1A\u8BDD, \u951A, d.\u8BDD\u672F, \u4EE3\u53D1\u7F72\u540D[d.\u8F93\u51FA]));
          continue;
        }
      }
      if (\u7248\u672C\u5BF9\u5F97\u4E0A) {
        if (\u63A5\u53E3\u5EFA\u8BAE(\u7B54.\u4E3B\u5361)) continue;
      } else if (\u7B54) {
        continue;
      } else if (\u8F6E === \u5F53\u524D\u771F\u8F6E\u6B21 && \u5224\u5B9A\u4E2D[activeId]) {
        continue;
      } else if (!\u5224\u6CA1\u8FC7[activeId]?.[\u8F6E]) {
        continue;
      }
      if (\u73B0\u573A\u5BA2\u670D\u8BDD[activeId]?.[\u8F6E] !== void 0) continue;
      const \u539F\u8BDD = \u6D88\u606F\u4EEC.filter((m, i) => \u5F52\u5C5E[i] === \u8F6E && m.\u89D2\u8272 === "\u5BA2\u670D");
      if (!\u539F\u8BDD.length) continue;
      \u51FA[\u8F6E] = \u539F\u8BDD.map(
        (m, \u5E8F) => buildAutoMessage(\u4F1A\u8BDD, \u951A, m.message_text, \u4EE3\u53D1\u7F72\u540D.AI\u76F4\u53D1, \u5E8F)
      );
    }
    return \u51FA;
  }, [
    \u5267\u672C,
    \u5F53\u524D\u771F\u8F6E\u6B21,
    \u5F53\u524D\u770B\u5230\u6D88\u606F\u6570,
    \u5224\u5B9A\u8868,
    activeId,
    sessions2,
    \u6D88\u606F\u4EEC,
    \u5F52\u5C5E,
    \u73B0\u573A\u8F6C\u4EA4\u8F6E,
    \u73B0\u573A\u5BA2\u670D\u8BDD,
    \u5224\u5B9A\u4E2D,
    \u5224\u6CA1\u8FC7
  ]);
  const \u76F4\u53D1\u8F6E = (0, import_react2.useMemo)(
    () => new Set(
      Object.keys(\u771F\u4EE3\u53D1).map(Number).filter((\u8F6E) => !\u63A5\u53E3\u5EFA\u8BAE(\u5224\u5B9A\u8868[activeId]?.[\u8F6E]?.\u4E3B\u5361))
    ),
    [\u771F\u4EE3\u53D1, \u5224\u5B9A\u8868, activeId]
  );
  (0, import_react2.useEffect)(() => {
    const \u8F6E = \u5F53\u524D\u5224\u5B9A\u8F6E\u6B21(\u5267\u672C, \u64AD\u653E.\u5DF2\u64AD\u683C\u6570);
    if (!\u5267\u672C || \u8F6E === void 0) return;
    const \u952E = \u5224\u5B9A\u952E(activeId, \u8F6E);
    if (\u5DF2\u95EE\u8FC7.current.has(\u952E) && \u4E0A\u6B21\u95EE\u7684.current === \u952E) return;
    void \u95EE\u4E00\u8F6E(activeId, \u8F6E, \u6F14\u793A\u6B64\u523B);
  }, [\u5267\u672C, activeId, \u64AD\u653E.\u5DF2\u64AD\u683C\u6570, \u95EE\u4E00\u8F6E, \u5224\u5B9A\u952E]);
  (0, import_react2.useEffect)(() => {
    if (!activeId || \u5267\u672C || \u5F53\u524D\u771F\u8F6E\u6B21 <= 0 || \u5F53\u524D\u770B\u5230\u6D88\u606F\u6570 === void 0) return;
    if (\u5DF2\u95EE\u8FC7.current.has(\u5224\u5B9A\u952E(activeId, \u5F53\u524D\u771F\u8F6E\u6B21, \u5F53\u524D\u770B\u5230\u6D88\u606F\u6570))) return;
    const \u672C\u4F1A\u8BDD = sessions2.find((s) => s.\u4F1A\u8BDDID === activeId);
    void \u95EE\u4E00\u8F6E(
      activeId,
      \u5F53\u524D\u771F\u8F6E\u6B21,
      \u53EF\u89C1\u6B64\u523B || \u672C\u4F1A\u8BDD?.\u6700\u8FD1\u65F6\u95F4 || \u6F14\u793A\u6B64\u523B,
      \u5F53\u524D\u770B\u5230\u6D88\u606F\u6570
    );
  }, [activeId, \u5267\u672C, \u5F53\u524D\u771F\u8F6E\u6B21, \u5F53\u524D\u770B\u5230\u6D88\u606F\u6570, \u53EF\u89C1\u6B64\u523B, sessions2, \u95EE\u4E00\u8F6E, \u5224\u5B9A\u952E]);
  const \u7528\u54EA\u4E2A\u8F6E\u6B21 = (\u4F1A\u8BDDID) => {
    const \u672C = \u5267\u672C\u8868[\u4F1A\u8BDDID];
    if (\u672C) return \u5F53\u524D\u5224\u5B9A\u8F6E\u6B21(\u672C, \u64AD\u653E.\u5DF2\u64AD\u683C\u6570);
    return \u4F1A\u8BDDID === activeId && \u5F53\u524D\u771F\u8F6E\u6B21 > 0 ? \u5F53\u524D\u771F\u8F6E\u6B21 : void 0;
  };
  const \u95EE\u5224\u5B9A\u7684\u6B64\u523B = (\u4F1A\u8BDDID) => \u5267\u672C\u8868[\u4F1A\u8BDDID] ? \u6F14\u793A\u6B64\u523B : \u4F1A\u8BDDID === activeId && \u53EF\u89C1\u6B64\u523B ? \u53EF\u89C1\u6B64\u523B : sessions2.find((s) => s.\u4F1A\u8BDDID === \u4F1A\u8BDDID)?.\u6700\u8FD1\u65F6\u95F4 || \u6F14\u793A\u6B64\u523B;
  const \u95EE\u5224\u5B9A\u770B\u5230\u6D88\u606F\u6570 = (\u4F1A\u8BDDID) => \u5267\u672C\u8868[\u4F1A\u8BDDID] || \u4F1A\u8BDDID !== activeId ? void 0 : \u5F53\u524D\u770B\u5230\u6D88\u606F\u6570;
  (0, import_react2.useEffect)(() => {
    void \u53D6\u4F1A\u8BDD\u5217\u8868().then((\u7B54) => {
      if (!\u7B54) {
        set\u5217\u8868\u672A\u8FDE(true);
        return;
      }
      set\u5217\u8868\u672A\u8FDE(false);
      setSessions((prev) => {
        const \u6D3B\u7684 = new Map(prev.map((s) => [s.\u4F1A\u8BDDID, s]));
        return \u5408\u4F1A\u8BDD\u5217\u8868(\u7B54).map((s) => \u6D3B\u7684.get(s.\u4F1A\u8BDDID) ?? s);
      });
    });
  }, []);
  const \u683C\u6570 = (s) => {
    const \u672C = \u5267\u672C\u8868[s.\u4F1A\u8BDDID];
    if (s.\u4F1A\u8BDDID !== activeId) return \u672C ? \u672C.\u4E8B\u4EF6.length : Number.POSITIVE_INFINITY;
    return \u64AD\u653E.\u5DF2\u64AD\u683C\u6570;
  };
  const \u5148\u4F8B\u5E93\u603B\u6570 = sessions2.reduce(
    (\u548C, s) => \u548C + \u5DF2\u5165\u5E93\u6761\u6570(\u5267\u672C\u8868[s.\u4F1A\u8BDDID], \u683C\u6570(s)),
    \u5148\u4F8B\u5E93\u57FA\u6570
  );
  const \u6307\u6807 = (0, import_react2.useMemo)(
    () => [\u5148\u4F8B\u5E93\u6307\u6807(\u5148\u4F8B\u5E93\u603B\u6570), ...shopMetrics],
    [\u5148\u4F8B\u5E93\u603B\u6570]
  );
  const \u8D34\u5224\u5B9A = (s, \u672C, \u8981\u4EC0\u4E482) => {
    const \u76D6\u8981\u4EC0\u4E48 = (\u4F1A\u8BDD) => \u8981\u4EC0\u4E482 ? { ...\u4F1A\u8BDD, \u987E\u5BA2\u60C5\u51B5: \u5408\u9700\u6C42\u5206\u89E3(\u4F1A\u8BDD.\u987E\u5BA2\u60C5\u51B5, \u8981\u4EC0\u4E482) } : \u4F1A\u8BDD;
    if (!\u672C) {
      const \u5E95 = {
        ...s,
        \u987E\u5BA2\u60C5\u51B5: \u62B9\u6389\u672A\u5230\u573A\u7684\u627F\u8BFA(\u62B9\u6389\u8981\u4EC0\u4E48\u884C(s.\u987E\u5BA2\u60C5\u51B5))
      };
      const \u771F\u7B54 = s.\u4F1A\u8BDDID === activeId && \u5F53\u524D\u771F\u8F6E\u6B21 > 0 ? \u53EF\u7528\u771F\u7B54(\u5F53\u524D\u771F\u8F6E\u6B21) : void 0;
      const \u6362\u8FC7 = \u4E00\u8F6E\u7559\u4E00\u6761\u7B54\u590D(s.\u6D88\u606F, \u5F52\u5C5E, \u73B0\u573A\u5BA2\u670D\u8BDD[s.\u4F1A\u8BDDID]);
      const \u4E22\u8FC7 = \u4E22\u76F4\u53D1\u8F6E\u7684\u8BDD(\u6362\u8FC7.\u6D88\u606F, \u6362\u8FC7.\u5F52\u5C5E, \u76F4\u53D1\u8F6E);
      const \u6D88\u606F = \u63D2\u4EE3\u53D1(\u4E22\u8FC7.\u6D88\u606F, \u4E22\u8FC7.\u5F52\u5C5E, \u771F\u4EE3\u53D1);
      if (!\u771F\u7B54) return \u76D6\u8981\u4EC0\u4E48({ ...\u5E95, \u6D88\u606F });
      const \u5404\u8F6E\u5904\u7F6E2 = Object.keys(\u5224\u5B9A\u8868[s.\u4F1A\u8BDDID] ?? {}).map(Number).filter((n) => n <= \u5F53\u524D\u771F\u8F6E\u6B21).sort((a, b) => a - b).map((n) => \u5224\u5B9A\u8868[s.\u4F1A\u8BDDID][n].\u672C\u8F6E\u5904\u7F6E);
      return \u76D6\u8981\u4EC0\u4E48({
        ...\u5E95,
        \u987E\u5BA2\u60C5\u51B5: \u771F\u7B54.\u987E\u5BA2\u60C5\u51B5.length ? \u771F\u7B54.\u987E\u5BA2\u60C5\u51B5 : \u5E95.\u987E\u5BA2\u60C5\u51B5,
        \u5EFA\u8BAE: \u5E26\u4EE3\u53D1(\u63A5\u53E3\u5EFA\u8BAE(\u771F\u7B54.\u4E3B\u5361), \u771F\u4EE3\u53D1[\u5F53\u524D\u771F\u8F6E\u6B21]),
        \u672C\u8F6E\u5904\u7F6E: \u5404\u8F6E\u5904\u7F6E2.flat(),
        \u6D88\u606F
      });
    }
    const \u8F6E = \u5F53\u524D\u5224\u5B9A\u8F6E\u6B21(\u672C, \u64AD\u653E.\u5DF2\u64AD\u683C\u6570);
    const \u7B54\u8868 = \u5224\u5B9A\u8868[s.\u4F1A\u8BDDID];
    const \u7B54 = \u8F6E === void 0 || !\u7B54\u8868 ? void 0 : \u7B54\u8868[\u8F6E];
    if (\u8F6E === void 0 || !\u7B54 || !\u7B54\u8868) return \u76D6\u8981\u4EC0\u4E48(s);
    const \u5404\u8F6E\u5904\u7F6E = Object.keys(\u7B54\u8868).map(Number).filter((n) => n <= \u8F6E).sort((a, b) => a - b).map((n) => \u7B54\u8868[n].\u672C\u8F6E\u5904\u7F6E);
    return \u76D6\u8981\u4EC0\u4E48({
      ...s,
      \u987E\u5BA2\u60C5\u51B5: \u5408\u987E\u5BA2\u60C5\u51B5(s.\u987E\u5BA2\u60C5\u51B5, \u7B54.\u987E\u5BA2\u60C5\u51B5),
      \u5EFA\u8BAE: \u5408\u5EFA\u8BAE(s.\u5EFA\u8BAE, \u7B54.\u4E3B\u5361),
      \u672C\u8F6E\u5904\u7F6E: \u5408\u672C\u8F6E\u5904\u7F6E(s.\u672C\u8F6E\u5904\u7F6E, \u5404\u8F6E\u5904\u7F6E),
      // 聊天区里「以我方名义说出去的话」也换成接口的：AI 直发的绿气泡、转交
      // 那句客服的话，此前一直是剧本写死的（右栏的 `已代发` 早在用它，但气泡
      // 没有）。**传整张 `答表` 不是 `答`** —— 一屏上可能同时躺着两轮的话。
      \u6D88\u606F: \u5408\u6D88\u606F(s.\u6D88\u606F, \u672C, \u7B54\u8868)
    });
  };
  const \u6F14\u8FC7\u7684\u4EEC = sessions2.map((s) => {
    const \u672C = \u5267\u672C\u8868[s.\u4F1A\u8BDDID];
    const \u683C = \u683C\u6570(s);
    return \u672C ? \u6F14\u5230(s, \u672C, \u683C, \u73B0\u573A\u6D88\u606F\u8868[s.\u4F1A\u8BDDID] ?? []) : { ...s, \u6D88\u606F: s.\u6D88\u606F.slice(0, \u683C) };
  });
  const \u4E70\u5BB6\u8BDD\u6570 = \u6F14\u8FC7\u7684\u4EEC.find((s) => s.\u4F1A\u8BDDID === activeId)?.\u6D88\u606F.filter((m) => m.\u89D2\u8272 === "\u4E70\u5BB6").length ?? 0;
  const \u8D77\u6F14\u683C = \u672C\u7A97\u53E3?.\u8D77\u6F14\u683C ?? 0;
  const \u524D\u6BB5 = (0, import_react2.useMemo)(() => \u524D\u6BB5\u4E70\u5BB6\u8BDD\u6570(\u6D88\u606F\u4EEC, \u8D77\u6F14\u683C), [\u6D88\u606F\u4EEC, \u8D77\u6F14\u683C]);
  const \u770B\u5230\u51E0\u53E5 = Math.max(0, \u4E70\u5BB6\u8BDD\u6570 - \u524D\u6BB5);
  const \u8981\u4EC0\u4E48 = \u5267\u672C ? \u9700\u6C42\u5206\u89E3\u8868[\u9700\u6C42\u5206\u89E3\u952E(activeId, \u770B\u5230\u51E0\u53E5)] : \u6700\u8FD1\u4E00\u7248(\u9700\u6C42\u5206\u89E3\u8868, activeId, \u770B\u5230\u51E0\u53E5);
  (0, import_react2.useEffect)(() => {
    if (!activeId) return;
    if (\u770B\u5230\u51E0\u53E5 === 0) return;
    const \u952E = \u9700\u6C42\u5206\u89E3\u952E(activeId, \u770B\u5230\u51E0\u53E5);
    if (\u5DF2\u95EE\u8FC7\u9700\u6C42.current.has(\u952E)) return;
    \u5DF2\u95EE\u8FC7\u9700\u6C42.current.add(\u952E);
    void \u53D6\u9700\u6C42\u5206\u89E3(activeId, \u770B\u5230\u51E0\u53E5).then((\u7B54) => {
      const \u503C = \u7B54?.\u503C.trim();
      if (!\u503C) {
        \u5DF2\u95EE\u8FC7\u9700\u6C42.current.delete(\u952E);
        set\u9700\u6C42\u515C\u5E95((prev) => prev[activeId] ? prev : { ...prev, [activeId]: true });
        return;
      }
      set\u9700\u6C42\u5206\u89E3\u8868((prev) => ({ ...prev, [\u952E]: \u503C }));
      set\u9700\u6C42\u515C\u5E95((prev) => {
        if (!prev[activeId]) return prev;
        const \u5176\u4F59 = { ...prev };
        delete \u5176\u4F59[activeId];
        return \u5176\u4F59;
      });
    });
  }, [activeId, \u770B\u5230\u51E0\u53E5]);
  const \u5C55\u793A = \u6F14\u8FC7\u7684\u4EEC.map(
    (s) => s.\u4F1A\u8BDDID === activeId ? \u8D34\u5224\u5B9A(s, \u5267\u672C\u8868[s.\u4F1A\u8BDDID], \u8981\u4EC0\u4E48) : s
  );
  const \u6C89\u5E95\u7684\u5C55\u793A = (() => {
    const \u6C89 = \u5C55\u793A.filter((s) => \u5224\u6CA1\u8FC7[s.\u4F1A\u8BDDID]);
    return \u6C89.length ? [...\u5C55\u793A.filter((s) => !\u5224\u6CA1\u8FC7[s.\u4F1A\u8BDDID]), ...\u6C89] : \u5C55\u793A;
  })();
  const active = \u5C55\u793A.find((s) => s.\u4F1A\u8BDDID === activeId) ?? null;
  const \u5DF2\u53D1\u73B0\u573A = (0, import_react2.useMemo)(
    () => new Set((\u73B0\u573A\u6D88\u606F\u8868[activeId] ?? []).map((\u73B0) => \u73B0.\u6D88\u606F.message_id)),
    [\u73B0\u573A\u6D88\u606F\u8868, activeId]
  );
  const \u672C\u8F6E\u5DF2\u53D1 = (0, import_react2.useMemo)(() => {
    if (\u5267\u672C) {
      const \u672C\u8F6E = \u5F53\u524D\u5224\u5B9A\u8F6E\u6B21(\u5267\u672C, \u64AD\u653E.\u5DF2\u64AD\u683C\u6570);
      if (\u672C\u8F6E === void 0) return false;
      return (\u73B0\u573A\u6D88\u606F\u8868[activeId] ?? []).some((\u73B0) => \u5F53\u524D\u5224\u5B9A\u8F6E\u6B21(\u5267\u672C, \u73B0.\u6B65) === \u672C\u8F6E);
    }
    return \u5F53\u524D\u771F\u8F6E\u6B21 > 0 && \u73B0\u573A\u5BA2\u670D\u8BDD[activeId]?.[\u5F53\u524D\u771F\u8F6E\u6B21] !== void 0;
  }, [\u5267\u672C, \u64AD\u653E.\u5DF2\u64AD\u683C\u6570, \u73B0\u573A\u6D88\u606F\u8868, \u73B0\u573A\u5BA2\u670D\u8BDD, \u5F53\u524D\u771F\u8F6E\u6B21, activeId]);
  const \u62A5\u5907\u6001 = (0, import_react2.useMemo)(() => {
    if (!\u5267\u672C) return \u73B0\u573A\u62A5\u5907[activeId] ?? "\u7B49\u5BA1\u6279";
    let \u89C1\u8FC7\u5F85\u53D1 = false;
    for (let i = 0; i < \u64AD\u653E.\u5DF2\u64AD\u683C\u6570; i++) {
      const \u5F85\u53D1 = \u5267\u672C?.\u4E8B\u4EF6[i]?.\u5F85\u53D1;
      if (!\u5F85\u53D1?.length) continue;
      \u89C1\u8FC7\u5F85\u53D1 = true;
      if (\u5F85\u53D1.some((m) => !\u5DF2\u53D1\u73B0\u573A.has(m.message_id))) return "\u7B49\u53D1\u9001";
    }
    return \u89C1\u8FC7\u5F85\u53D1 ? "\u5DF2\u7B54\u590D" : "\u7B49\u5BA1\u6279";
  }, [\u5267\u672C, \u64AD\u653E.\u5DF2\u64AD\u683C\u6570, \u5DF2\u53D1\u73B0\u573A, \u73B0\u573A\u62A5\u5907, activeId]);
  const \u5F85\u53D1\u7684 = (0, import_react2.useMemo)(
    () => \u5408\u6D88\u606F(\u5267\u672C?.\u4E8B\u4EF6[\u64AD\u653E.\u5DF2\u64AD\u683C\u6570 - 1]?.\u5F85\u53D1 ?? [], \u5267\u672C, \u5224\u5B9A\u8868[activeId]),
    [\u5267\u672C, \u64AD\u653E.\u5DF2\u64AD\u683C\u6570, \u5224\u5B9A\u8868, activeId]
  );
  const \u5F85\u53D1\u53E5 = \u62A5\u5907\u6001 !== "\u7B49\u53D1\u9001" ? void 0 : \u5267\u672C ? \u5F85\u53D1\u7684.find((m) => !\u5DF2\u53D1\u73B0\u573A.has(m.message_id)) : (
    // 真窗口：**要发的就是日志里那一句**，时间线正停在它前面（`在等的轮`）。
    // 不是「凑一句摆上去」—— 这一句是当时真发出去的原话，也正是顾客的下一句
    // 在接的东西（顶掉它换一句成稿，对话就断在那儿，实测 23 轮 ② 里 5 轮如此）。
    \u6D88\u606F\u4EEC[\u64AD\u653E.\u5DF2\u64AD\u683C\u6570]
  );
  const \u515C\u5E95 = [];
  if (\u5224\u5B9A\u672A\u8FDE) \u515C\u5E95.push("\u5224\u5B9A");
  if (\u9700\u6C42\u515C\u5E95[activeId]) \u515C\u5E95.push("\u9700\u6C42\u5206\u89E3");
  if (\u5217\u8868\u672A\u8FDE) \u515C\u5E95.push("\u4F1A\u8BDD\u5217\u8868");
  if (\u52A8\u4F5C\u515C\u5E95[activeId]) \u515C\u5E95.push("\u52A8\u4F5C");
  const \u9009\u4F1A\u8BDD = (id) => {
    const \u76EE\u6807 = sessions2.find((s) => s.\u4F1A\u8BDDID === id);
    const \u672C = \u5267\u672C\u8868[id];
    setActiveId(id);
    \u64AD\u653E.\u8DF3\u5230(
      \u672C ? 0 : \u76EE\u6807?.\u8D77\u6F14\u683C ?? 0,
      \u672C ? \u672C.\u4E8B\u4EF6.length : \u76EE\u6807?.\u6D88\u606F.length ?? 0
    );
  };
  const \u843D\u4E00\u7B14 = (\u4F1A\u8BDDID, fn) => {
    setSessions((prev) => prev.map((s) => s.\u4F1A\u8BDDID === \u4F1A\u8BDDID ? fn(s) : s));
  };
  const patch = (fn) => \u843D\u4E00\u7B14(activeId, fn);
  const \u5151\u73B0\u7684 = (\u8F93\u51FA) => (active?.\u672C\u8F6E\u5904\u7F6E ?? []).filter((d) => d.\u8F93\u51FA === \u8F93\u51FA && d.\u8F6E\u6B21 === \u7528\u54EA\u4E2A\u8F6E\u6B21(activeId)).map((d) => d.id);
  const \u8BB0\u4E00\u7B14\u53D1\u9001 = (\u8BDD\u672F, \u8F93\u51FA) => {
    const \u7F16\u53F7 = \u5151\u73B0\u7684(\u8F93\u51FA);
    if (!\u7F16\u53F7.length) return;
    const \u4F1A\u8BDDID = activeId;
    const \u8F6E\u6B21 = \u7528\u54EA\u4E2A\u8F6E\u6B21(\u4F1A\u8BDDID);
    if (\u8F6E\u6B21 === void 0) return;
    let \u73B0\u884C\u7F16\u53F7 = \u7F16\u53F7;
    void \u5E26\u81EA\u6108(
      () => \u8BB0\u53D1\u9001(\u4F1A\u8BDDID, \u8F6E\u6B21, \u73B0\u884C\u7F16\u53F7, \u8BDD\u672F),
      async () => {
        const \u7B54 = await \u95EE\u4E00\u8F6E(
          \u4F1A\u8BDDID,
          \u8F6E\u6B21,
          \u95EE\u5224\u5B9A\u7684\u6B64\u523B(\u4F1A\u8BDDID),
          \u95EE\u5224\u5B9A\u770B\u5230\u6D88\u606F\u6570(\u4F1A\u8BDDID)
        );
        if (!\u7B54) return false;
        \u73B0\u884C\u7F16\u53F7 = \u7B54.\u672C\u8F6E\u5904\u7F6E.filter((d) => d.\u8F93\u51FA === \u8F93\u51FA).map((d) => d.id);
        return \u73B0\u884C\u7F16\u53F7.length > 0;
      }
    ).then((\u679C) => {
      if (\u679C.\u6001 === "\u6210") {
        const \u6001 = \u679C.\u503C.\u62A5\u5907\u5355\u6001;
        if (!\u6001) return;
        set\u4EA4\u63A5\u5305\u8868((prev) => {
          const \u65E7 = prev[\u4F1A\u8BDDID];
          if (!\u65E7 || \u65E7.\u72B6\u6001 === \u6001) return prev;
          return { ...prev, [\u4F1A\u8BDDID]: { ...\u65E7, \u72B6\u6001: \u6001 } };
        });
        return;
      }
      if (\u679C.\u6001 === "\u672A\u8FDE") set\u52A8\u4F5C\u515C\u5E95((prev) => ({ ...prev, [\u4F1A\u8BDDID]: true }));
      else set\u52A8\u4F5C\u88AB\u62D2(`\u53D1\u9001\u6CA1\u8BB0\u4E0A \u2014\u2014 ${\u679C.\u8BF4\u660E}`);
    });
  };
  const handleSend = (text) => {
    const \u5185\u5BB9 = text.trim();
    if (!\u5185\u5BB9) return;
    if (\u5267\u672C && active) {
      const \u6761 = buildAgentMessage(
        active,
        \u5185\u5BB9,
        \u4E0B\u4E00\u4E2A\u6D88\u606F\u5E8F\u53F7(\u5267\u672C, \u73B0\u573A\u6D88\u606F\u8868[activeId])
      );
      set\u73B0\u573A\u6D88\u606F\u8868((prev) => ({
        ...prev,
        [activeId]: [...prev[activeId] ?? [], { \u6B65: \u64AD\u653E.\u5DF2\u64AD\u683C\u6570, \u6D88\u606F: \u6761 }]
      }));
      patch((s) => ({ ...s, \u8349\u7A3F: "" }));
      \u8BB0\u4E00\u7B14\u53D1\u9001(\u5185\u5BB9, "\u5BA2\u670D\u70B9\u53D1\u9001");
      \u64AD\u653E.\u7EE7\u7EED();
      return;
    }
    const \u8BE5\u843D = \u5728\u7B49\u7684\u8F6E(\u5F52\u5C5E, \u6D88\u606F\u4EEC, \u64AD\u653E.\u5DF2\u64AD\u683C\u6570);
    if (\u8BE5\u843D > 0) {
      set\u73B0\u573A\u5BA2\u670D\u8BDD((prev) => ({
        ...prev,
        [activeId]: { ...prev[activeId], [\u8BE5\u843D]: \u5185\u5BB9 }
      }));
      patch((s) => ({ ...s, \u8349\u7A3F: "" }));
      \u8BB0\u4E00\u7B14\u53D1\u9001(\u5185\u5BB9, "\u5BA2\u670D\u70B9\u53D1\u9001");
      \u64AD\u653E.\u7EE7\u7EED();
      return;
    }
    patch((s) => {
      const sent = buildAgentMessage(s, \u5185\u5BB9, s.\u6D88\u606F.length + 1);
      return { ...s, \u6D88\u606F: [...s.\u6D88\u606F, sent], \u8349\u7A3F: "" };
    });
    \u8BB0\u4E00\u7B14\u53D1\u9001(\u5185\u5BB9, "\u5BA2\u670D\u70B9\u53D1\u9001");
    \u64AD\u653E.\u7EE7\u7EED();
  };
  const handleSendPending = () => {
    if (!\u5267\u672C) {
      set\u73B0\u573A\u62A5\u5907((prev) => ({ ...prev, [activeId]: "\u5DF2\u7B54\u590D" }));
      const \u53E5 = \u5F85\u53D1\u53E5;
      if (\u53E5) \u8BB0\u4E00\u7B14\u53D1\u9001(\u53E5.message_text, "\u62A5\u5907");
      \u64AD\u653E.\u7EE7\u7EED();
      return;
    }
    if (!\u5F85\u53D1\u7684.length) return;
    const \u6B65 = \u64AD\u653E.\u5DF2\u64AD\u683C\u6570;
    set\u73B0\u573A\u6D88\u606F\u8868((prev) => ({
      ...prev,
      [activeId]: [
        ...prev[activeId] ?? [],
        ...\u5F85\u53D1\u7684.map((m) => ({ \u6B65, \u6D88\u606F: m }))
      ]
    }));
    patch((s) => ({
      ...s,
      \u8349\u7A3F: "",
      \u6458\u8981: \u5F85\u53D1\u7684[0].message_text,
      \u6700\u8FD1\u65F6\u95F4: \u5F85\u53D1\u7684[0].\u53D1\u9001\u65F6\u95F4.slice(5, 16)
    }));
    \u8BB0\u4E00\u7B14\u53D1\u9001(\u5F85\u53D1\u7684[0].message_text, "\u62A5\u5907");
    \u64AD\u653E.\u7EE7\u7EED();
  };
  const handleUseScript = () => {
    if (\u672C\u8F6E\u5DF2\u53D1) return;
    const \u8BDD\u672F = active?.\u5EFA\u8BAE?.\u8BDD\u672F;
    if (!\u8BDD\u672F) return;
    patch((s) => ({ ...s, \u8349\u7A3F: \u8BDD\u672F }));
  };
  const \u8D70\u52A8\u4F5C = async (\u52A8\u4F5C) => {
    const \u4F1A\u8BDDID = activeId;
    const \u8F6E\u6B21 = \u7528\u54EA\u4E2A\u8F6E\u6B21(\u4F1A\u8BDDID);
    if (\u8F6E\u6B21 === void 0) {
      set\u52A8\u4F5C\u88AB\u62D2(`${\u52A8\u4F5C}\u6CA1\u529E\u6210 \u2014\u2014 \u8FD9\u4E00\u5C4F\u8FD8\u6CA1\u5224\u8FC7\uFF0C\u540E\u7AEF\u8BA4\u4E0D\u51FA\u8FD9\u662F\u7B2C\u51E0\u8F6E`);
      return;
    }
    const \u679C = await \u5E26\u81EA\u6108(
      () => \u53D6\u4EA4\u63A5\u5305(\u4F1A\u8BDDID, \u52A8\u4F5C, \u8F6E\u6B21),
      // 重判这一轮。成了就值得再问一次（那一跳已经把后端台账拽过来了）；
      // 没成就别打了 —— 再打还是同一句话，白等三秒。
      async () => await \u95EE\u4E00\u8F6E(
        \u4F1A\u8BDDID,
        \u8F6E\u6B21,
        \u95EE\u5224\u5B9A\u7684\u6B64\u523B(\u4F1A\u8BDDID),
        \u95EE\u5224\u5B9A\u770B\u5230\u6D88\u606F\u6570(\u4F1A\u8BDDID)
      ) !== null
    );
    if (\u679C.\u6001 === "\u540E\u7AEF\u8BF4\u4E0D") {
      set\u52A8\u4F5C\u88AB\u62D2(`${\u52A8\u4F5C}\u6CA1\u529E\u6210 \u2014\u2014 ${\u679C.\u8BF4\u660E}`);
      return;
    }
    set\u52A8\u4F5C\u88AB\u62D2(void 0);
    const \u5355\u53F7 = \u679C.\u6001 === "\u6210" ? \u679C.\u503C.\u5355\u53F7 : \u515C\u5E95\u5355\u53F7(\u4F1A\u8BDDID);
    if (\u679C.\u6001 === "\u6210") {
      set\u4EA4\u63A5\u5305\u8868((prev) => ({ ...prev, [\u4F1A\u8BDDID]: \u679C.\u503C }));
      set\u52A8\u4F5C\u515C\u5E95((prev) => {
        if (!prev[\u4F1A\u8BDDID]) return prev;
        const \u5176\u4F59 = { ...prev };
        delete \u5176\u4F59[\u4F1A\u8BDDID];
        return \u5176\u4F59;
      });
    } else {
      set\u52A8\u4F5C\u515C\u5E95((prev) => ({ ...prev, [\u4F1A\u8BDDID]: true }));
    }
    \u843D\u4E00\u7B14(
      \u4F1A\u8BDDID,
      (s) => \u52A8\u4F5C === "\u62A5\u5907" ? { ...s, \u62A5\u5907: { \u7B49\u5F85\u5206\u949F: 0, \u5DE5\u5355\u53F7: \u5355\u53F7 } } : { ...s, \u8F6C\u4EA4: { \u5DE5\u5355\u53F7: \u5355\u53F7 } }
    );
    if (\u52A8\u4F5C === "\u8F6C\u4EA4") set\u73B0\u573A\u8F6C\u4EA4\u8F6E((prev) => ({ ...prev, [\u4F1A\u8BDDID]: \u8F6E\u6B21 }));
    if (\u52A8\u4F5C === "\u62A5\u5907" && !\u5267\u672C) {
      set\u73B0\u573A\u62A5\u5907((prev) => ({ ...prev, [\u4F1A\u8BDDID]: "\u7B49\u5BA1\u6279" }));
      setTimeout(() => {
        set\u73B0\u573A\u62A5\u5907(
          (prev) => prev[\u4F1A\u8BDDID] === "\u7B49\u5BA1\u6279" ? { ...prev, [\u4F1A\u8BDDID]: "\u7B49\u53D1\u9001" } : prev
        );
      }, \u6279\u51C6\u6BEB\u79D2);
    }
    \u64AD\u653E.\u7EE7\u7EED();
  };
  const handleReport = () => void \u8D70\u52A8\u4F5C("\u62A5\u5907");
  const handleHandover = () => void \u8D70\u52A8\u4F5C("\u8F6C\u4EA4");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex h-full w-full overflow-hidden", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_IconRail.default, { \u4F1A\u8BDD\u6570: sessions2.length }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_SessionPanel.default, { sessions: \u6C89\u5E95\u7684\u5C55\u793A, activeId, onSelect: \u9009\u4F1A\u8BDD }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_ChatPanel.default,
      {
        session: active,
        agent,
        metrics: \u6307\u6807,
        onSend: handleSend,
        onDraftChange: (text) => patch((s) => ({ ...s, \u8349\u7A3F: text })),
        \u5267\u672C,
        \u64AD\u653E,
        \u672C\u8F6E\u5DF2\u53D1
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_PrimerPanel.default,
      {
        session: active,
        onUseScript: handleUseScript,
        onReport: handleReport,
        onHandover: handleHandover,
        onSendPending: handleSendPending,
        \u62A5\u5907\u6001,
        \u5F85\u53D1\u53E5,
        \u5F85\u53D1\u9644\u6CE8: \u5267\u672C ? void 0 : "\u8FD9\u4E00\u53E5\u662F\u65E5\u5FD7\u91CC\u5F53\u65F6\u53D1\u51FA\u53BB\u7684\u539F\u8BDD",
        \u672C\u8F6E\u5DF2\u53D1,
        \u63A5\u53E3\u4EA4\u63A5\u5305: \u4EA4\u63A5\u5305\u8868[activeId],
        \u515C\u5E95,
        \u52A8\u4F5C\u88AB\u62D2,
        \u672A\u5224\u5B9A: !\u5267\u672C,
        \u5224\u5B9A\u4E2D: Boolean(\u5224\u5B9A\u4E2D[activeId]),
        \u5DF2\u5224\u5B9A: \u5F53\u524D\u771F\u8F6E\u6B21 > 0 && Boolean(\u53EF\u7528\u771F\u7B54(\u5F53\u524D\u771F\u8F6E\u6B21)),
        \u672A\u5F00\u6F14: \u5267\u672C ? \u64AD\u653E.\u5DF2\u64AD\u683C\u6570 === 0 : \u5F53\u524D\u771F\u8F6E\u6B21 === 0
      }
    )
  ] });
}

// .verify/drive-unauth.ts
var import_react3 = __toESM(require_react(), 1);
var { \u51B2\u5237, \u6536\u5C3E } = import_react3.__\u9A71\u52A8;
var \u6869\u540D = ["IconRail", "SessionPanel", "ChatPanel", "PrimerPanel"];
var \u6284\u4E0B\u7684 = {};
function \u8D70(\u8282\u70B9) {
  if (\u8282\u70B9 == null || typeof \u8282\u70B9 === "boolean") return;
  if (Array.isArray(\u8282\u70B9)) {
    \u8282\u70B9.forEach(\u8D70);
    return;
  }
  if (typeof \u8282\u70B9 !== "object" || !\u8282\u70B9.$$\u5143\u7D20) return;
  const \u540D = \u8282\u70B9.type?.__\u540D;
  if (\u540D && \u6869\u540D.includes(\u540D)) \u6284\u4E0B\u7684[\u540D] = \u8282\u70B9.props;
  const \u5B50 = \u8282\u70B9.props?.children;
  if (\u5B50 !== void 0) \u8D70(\u5B50);
}
var \u7761 = (ms) => new Promise((r) => setTimeout(r, ms));
async function \u7A33(ms = 40) {
  await \u7761(ms);
  \u8D70(\u51B2\u5237(App));
  await \u7761(20);
  \u8D70(\u51B2\u5237(App));
}
function \u770B() {
  const \u64AD\u653E = \u6284\u4E0B\u7684.ChatPanel?.\u64AD\u653E;
  const \u4F1A\u8BDD = \u6284\u4E0B\u7684.ChatPanel?.session ?? {};
  const \u53F3\u680F = \u6284\u4E0B\u7684.PrimerPanel ?? {};
  const \u6D88\u606F = \u4F1A\u8BDD.\u6D88\u606F ?? [];
  return {
    \u683C: \u64AD\u653E?.\u5DF2\u64AD\u683C\u6570 ?? 0,
    \u5171: \u64AD\u653E?.\u603B\u683C\u6570 ?? 0,
    \u505C: \u64AD\u653E?.\u505C\u5728 ?? null,
    \u5728\u653E: Boolean(\u64AD\u653E?.\u5728\u653E),
    \u8349\u7A3F: \u4F1A\u8BDD.\u8349\u7A3F ?? "",
    \u5F85\u53D1\u53E5: \u53F3\u680F.\u5F85\u53D1\u53E5?.message_text ?? "",
    \u62A5\u5907\u6001: \u53F3\u680F.\u62A5\u5907\u6001,
    \u6D88\u606F,
    /** 屏上**我方**的话：客服自己发的那几句。 */
    \u5BA2\u670D\u8BDD: \u6D88\u606F.filter((m) => m.\u89D2\u8272 === "\u5BA2\u670D"),
    /** 屏上**以 AI 名义**发出去的那几句（绿气泡）。 */
    \u4EE3\u53D1\u8BDD: \u6D88\u606F.filter((m) => m.\u89D2\u8272 === "AI")
  };
}
function \u62A5(\u6807\u7B7E) {
  const k = \u770B();
  console.log(
    `${\u6807\u7B7E.padEnd(24)} \u7B2C ${String(k.\u683C).padStart(2)}/${k.\u5171} \u6761 \xB7 \u5728\u653E=${k.\u5728\u653E ? "y" : "n"} \xB7 \u505C\u5728=${k.\u505C === null ? "\u2014" : `\u300C${k.\u505C}\u300D`} \xB7 \u5C4F\u4E0A ${k.\u6D88\u606F.length} \u6761\uFF08\u5BA2\u670D ${k.\u5BA2\u670D\u8BDD.length} \uFF0B \u4EE3\u53D1 ${k.\u4EE3\u53D1\u8BDD.length}\uFF09`
  );
}
async function \u7B49\u5230(\u6761\u4EF6, \u4E0A\u9650 = 3e4) {
  const \u89C1\u8FC7\u7684 = [];
  for (let t = 0; t < \u4E0A\u9650; t += 100) {
    await \u7A33(100);
    const k = \u770B();
    const \u6B64\u523B = `${k.\u683C}/${k.\u505C ?? "\u2014"}`;
    if (\u89C1\u8FC7\u7684.at(-1) !== \u6B64\u523B) \u89C1\u8FC7\u7684.push(\u6B64\u523B);
    if (\u6761\u4EF6(k)) return { ...k, \u89C1\u8FC7\u7684 };
  }
  return { ...\u770B(), \u89C1\u8FC7\u7684, \u8D85\u65F6: true };
}
globalThis.window = { addEventListener() {
}, removeEventListener() {
} };
var \u8BFB = (\u540D) => JSON.parse(require("fs").readFileSync(`C:/Users/Atopes/AppData/Local/Temp/${\u540D}`, "utf8"));
var \u7A97\u53E3\u4EEC = \u8BFB("\u5217\u8868.json");
var \u76EE\u68072 = \u7A97\u53E3\u4EEC.find((w) => w.\u4F1A\u8BDDID === "S00002");
if (!\u76EE\u68072) throw new Error("\u5217\u8868\u91CC\u6CA1\u6709 S00002");
var \u76EE\u68074 = \u7A97\u53E3\u4EEC.find((w) => w.\u4F1A\u8BDDID === "S00004");
if (!\u76EE\u68074) throw new Error("\u5217\u8868\u91CC\u6CA1\u6709 S00004");
var \u53611 = \u8BFB("\u52243.json");
var \u7A7A\u8F6E = (\u4F1A\u8BDDID, \u8F6E\u6B21) => ({
  ...\u53611,
  \u4F1A\u8BDDID,
  \u8F6E\u6B21,
  \u4E3B\u5361: null,
  \u672C\u8F6E\u5904\u7F6E: []
});
var \u98CE\u9669\u5361 = { ...\u53611, \u4E3B\u5361: { ...\u53611.\u4E3B\u5361, \u5F62\u6001: "\u6709\u98CE\u9669" } };
var \u6210\u7A3F = "\u8FD9\u53E5\u662F\u540E\u7AEF\u7684\u6210\u7A3F\uFF1A\u771F\u53D1\u51FA\u53BB\u7684\u8BDD\uFF0C\u5B83\u8BE5\u5E26\u7740 Primer \u7684\u7F72\u540D\u4E0A\u5C4F";
var \u6709\u7A3F\u8F6E = (\u4F1A\u8BDDID, \u8F6E\u6B21) => ({
  ...\u53611,
  \u4F1A\u8BDDID,
  \u8F6E\u6B21,
  \u4E3B\u5361: null,
  \u672C\u8F6E\u5904\u7F6E: [{ ...\u53611.\u672C\u8F6E\u5904\u7F6E[0], \u8F93\u51FA: "AI\u76F4\u53D1", \u8BDD\u672F: \u6210\u7A3F }]
});
var \u53D1\u8FC7\u7684 = [];
globalThis.fetch = async (\u8DEF\u5F84, \u9009\u9879) => {
  const \u4F53 = \u9009\u9879?.body ? JSON.parse(\u9009\u9879.body) : void 0;
  const \u56DE = (\u503C) => ({ ok: true, json: async () => \u503C });
  const p = String(\u8DEF\u5F84);
  if (p.includes("\u4F1A\u8BDD\u5217\u8868")) return \u56DE(\u7A97\u53E3\u4EEC);
  if (p.includes("\u5224\u5B9A")) {
    const \u4F1A = String(\u4F53?.\u4F1A\u8BDDID ?? "");
    const \u8F6E = Number(\u4F53?.\u8F6E\u6B21 ?? 0);
    if (\u4F1A === "S00002") {
      if (\u8F6E === 2) return \u56DE({ ...\u53611, \u4F1A\u8BDDID: \u4F1A, \u8F6E\u6B21: 2 });
      if (\u8F6E === 3) return \u56DE({ ...\u53611, \u4F1A\u8BDDID: \u4F1A, \u8F6E\u6B21: 3 });
      return \u56DE(\u7A7A\u8F6E(\u4F1A, \u8F6E));
    }
    if (\u4F1A === "S00004") {
      if (\u8F6E === 1) return \u56DE({ ...\u98CE\u9669\u5361, \u4F1A\u8BDDID: \u4F1A, \u8F6E\u6B21: 1 });
      if (\u8F6E === 2) return \u56DE(\u6709\u7A3F\u8F6E(\u4F1A, \u8F6E));
      return \u56DE(\u7A7A\u8F6E(\u4F1A, \u8F6E));
    }
    return \u56DE(\u7A7A\u8F6E(\u4F1A, \u8F6E));
  }
  if (p.includes("\u8F6C\u4EA4") || p.includes("\u62A5\u5907"))
    return \u56DE({ \u72B6\u6001: "\u7B49\u5F85\u5BA1\u6279", \u884C: [], \u5355\u53F7: "JJ-S00004-1" });
  if (p.includes("\u9700\u6C42\u5206\u89E3")) return new Promise(() => {
  });
  if (p.includes("\u53D1\u9001")) return \u56DE({ \u5151\u73B0\u4E3B\u5F20: [], \u62A5\u5907\u5355\u6001: null });
  return \u56DE({});
};
var \u5931\u8D25 = 0;
function \u65AD\u8A00(\u6761\u4EF6, \u8BF4\u660E) {
  console.log(`   ${\u6761\u4EF6 ? "\u2713" : "\u2717"} ${\u8BF4\u660E}`);
  if (!\u6761\u4EF6) \u5931\u8D25++;
}
async function \u91C7\u7528\u5E76\u53D1\u9001() {
  \u6284\u4E0B\u7684.PrimerPanel.onUseScript();
  await \u7A33(60);
  const \u8349\u7A3F = \u770B().\u8349\u7A3F;
  \u53D1\u8FC7\u7684.push(\u8349\u7A3F);
  \u6284\u4E0B\u7684.ChatPanel.onSend(\u8349\u7A3F);
  await \u7A33(60);
  return \u8349\u7A3F;
}
async function \u4E3B() {
  \u8D70(\u51B2\u5237(App));
  await \u7A33(150);
  \u6284\u4E0B\u7684.SessionPanel.onSelect("S00002");
  await \u7A33(120);
  const \u5F00 = \u770B();
  \u65AD\u8A00(\u5F00.\u5171 === 8 && \u5F00.\u683C === 0, `S00002 \u5F00\u5C4F\uFF1A8 \u683C\u6CA1\u8D70\uFF08\u5B9E\u9645 ${\u5F00.\u683C}/${\u5F00.\u5171}\uFF09`);
  \u6284\u4E0B\u7684.ChatPanel.\u64AD\u653E.\u8BBE\u683C\u95F4\u9694(200);
  \u6284\u4E0B\u7684.ChatPanel.\u64AD\u653E.\u64AD\u653E();
  const \u7532 = await \u7B49\u5230((k) => k.\u683C >= 2);
  \u62A5("\u2460 \u8F6E 1 \u90A3\u53E5\u4E0A\u5C4F\u540E");
  \u65AD\u8A00(!\u7532.\u8D85\u65F6, "\u6F14\u5230\u8F6E 1 \u7684\u5BA2\u670D\u8BDD\u90A3\u4E00\u683C\u4E86\uFF08\u6CA1\u8D85\u65F6\uFF09");
  \u65AD\u8A00(\u7532.\u505C === null, `\u8FD9\u4E00\u8F6E\u6CA1\u5361\uFF0C\u4E0D\u8BE5\u505C\uFF08\u5B9E\u9645\u300C${\u7532.\u505C}\u300D\uFF09`);
  const \u539F\u8BDD1 = \u76EE\u68072.\u6D88\u606F[1].message_text;
  const \u4EE3\u53D11 = \u7532.\u4EE3\u53D1\u8BDD.filter((m) => m.message_text === \u539F\u8BDD1);
  \u65AD\u8A00(
    \u4EE3\u53D11.length === 1,
    `\u8F6E 1 \u90A3\u53E5\u4EE5 AI \u7684\u540D\u4E49\u53D1\u51FA\u53BB\u4E86\uFF08\u7EFF\u6C14\u6CE1\uFF1A\u300C${\u539F\u8BDD1.slice(0, 18)}\u2026\u300D\uFF09`
  );
  \u65AD\u8A00(
    Boolean(\u4EE3\u53D11[0]?.\u7F72\u540D),
    `\u90A3\u4E2A\u6C14\u6CE1\u5E26\u7740\u7F72\u540D\uFF08\u5B9E\u9645 ${JSON.stringify(\u4EE3\u53D11[0]?.\u7F72\u540D)}\uFF09\u2014\u2014 \u6CA1\u7F72\u540D\u5C31\u662F\u300C\u6211\u65B9\u51ED\u7A7A\u8BF4\u4E86\u53E5\u8BDD\u300D`
  );
  \u65AD\u8A00(
    !\u7532.\u5BA2\u670D\u8BDD.some((m) => m.message_text === \u539F\u8BDD1),
    "\u540C\u65F6\u65E5\u5FD7\u539F\u8BDD\u4E0D\u5728\u5C4F\u4E0A\uFF08\u540C\u4E00\u8F6E\u91CC\u5192\u4E24\u53E5\u7B54\u590D\uFF0C\u540E\u4E00\u53E5\u8FD8\u67E5\u4E0D\u51FA\u662F\u8C01\u53D1\u7684\uFF09"
  );
  \u65AD\u8A00(\u7532.\u5171 === 8, `\u603B\u683C\u6570\u4E00\u6761\u4E0D\u6DA8\uFF08\u5B9E\u9645 ${\u7532.\u5171}\uFF09`);
  const \u4E59 = await \u7B49\u5230((k) => k.\u505C === "\u91C7\u7528");
  \u62A5("\u2461 \u8F6E 2 \u505C\u4E0B\u6765");
  \u65AD\u8A00(!\u4E59.\u8D85\u65F6 && \u4E59.\u505C === "\u91C7\u7528", `\u8F6E 2 \u505C\u5728\uFF3B\u91C7\u7528\uFF3D\u4E0A\uFF08\u5B9E\u9645\u300C${\u4E59.\u505C}\u300D\uFF09`);
  const \u53D12 = await \u91C7\u7528\u5E76\u53D1\u9001();
  const \u4E19 = await \u7B49\u5230((k) => k.\u505C === "\u91C7\u7528");
  \u62A5("\u2462 \u8F6E 3 \u505C\u4E0B\u6765");
  \u65AD\u8A00(!\u4E19.\u8D85\u65F6 && \u4E19.\u505C === "\u91C7\u7528", `\u8F6E 3 \u505C\u5728\uFF3B\u91C7\u7528\uFF3D\u4E0A\uFF08\u5B9E\u9645\u300C${\u4E19.\u505C}\u300D\uFF09`);
  const \u53D13 = await \u91C7\u7528\u5E76\u53D1\u9001();
  const \u7EC8 = await \u7B49\u5230((k) => k.\u683C >= k.\u5171 && k.\u505C === null);
  \u62A5("\u2463 \u6F14\u5230\u5934");
  \u65AD\u8A00(!\u7EC8.\u8D85\u65F6 && \u7EC8.\u683C === 8, `\u6F14\u5230\u7B2C 8 \u683C\uFF08\u5B9E\u9645 ${\u7EC8.\u683C}/${\u7EC8.\u5171}\uFF09`);
  const \u539F\u8BDD4 = \u76EE\u68072.\u6D88\u606F[7].message_text;
  const \u4EE3\u53D14 = \u7EC8.\u4EE3\u53D1\u8BDD.filter((m) => m.message_text === \u539F\u8BDD4);
  \u65AD\u8A00(\u4EE3\u53D14.length === 1 && Boolean(\u4EE3\u53D14[0]?.\u7F72\u540D), "\u8F6E 4\uFF08\u6536\u573A\u767D\uFF09\u90A3\u53E5\u4E5F\u5E26\u7740\u7F72\u540D\u4E0A\u5C4F");
  console.log("   \u5C4F\u4E0A\u9010\u6761\uFF1A");
  \u7EC8.\u6D88\u606F.forEach(
    (m, i) => console.log(
      `     [${i}] ${m.\u89D2\u8272}  \u7F72\u540D=${m.\u7F72\u540D ? `\u300C${m.\u7F72\u540D}\u300D` : "\u2014\u2014"}  ${String(m.message_text).slice(0, 26)}`
    )
  );
  const \u88F8\u7684 = \u7EC8.\u5BA2\u670D\u8BDD.filter((m) => !\u53D1\u8FC7\u7684.includes(m.message_text));
  \u65AD\u8A00(
    \u88F8\u7684.length === 0,
    `\u5C4F\u4E0A\u4E00\u53E5\u300C\u6CA1\u8D70\u5361\u3001\u4E5F\u6CA1\u8D70\u7EFF\u6C14\u6CE1\u300D\u7684\u5BA2\u670D\u8BDD\u90FD\u6CA1\u6709\uFF08\u5B9E\u9645 ${\u88F8\u7684.length} \u53E5\uFF1A${\u88F8\u7684.map((m) => `\u300C${String(m.message_text).slice(0, 16)}\u2026\u300D`).join("\u3001") || "\u2014"}\uFF09`
  );
  \u65AD\u8A00(
    \u7EC8.\u5BA2\u670D\u8BDD.length === 2 && \u53D1\u8FC7\u7684.length === 2,
    `\u5C4F\u4E0A\u4E24\u53E5\u5BA2\u670D\u8BDD\uFF0C\u6B63\u597D\u662F\u53D1\u51FA\u53BB\u7684\u90A3\u4E24\u53E5\uFF08\u5B9E\u9645 ${\u7EC8.\u5BA2\u670D\u8BDD.length} / ${\u53D1\u8FC7\u7684.length}\uFF09`
  );
  \u65AD\u8A00(
    \u7EC8.\u6D88\u606F.length === \u76EE\u68072.\u6D88\u606F.length && \u7EC8.\u5171 === \u76EE\u68072.\u6D88\u606F.length,
    `\u5C4F\u4E0A\u6761\u6570\u548C\u65E5\u5FD7\u4E00\u6837\u591A\uFF08${\u7EC8.\u6D88\u606F.length} vs ${\u76EE\u68072.\u6D88\u606F.length}\uFF09\u2014\u2014 \u4E22\u4E00\u53E5\u3001\u8865\u4E00\u53E5`
  );
  console.log("");
  \u6284\u4E0B\u7684.ChatPanel.\u64AD\u653E.\u6682\u505C();
  \u6284\u4E0B\u7684.SessionPanel.onSelect("S00004");
  await \u7A33(150);
  \u6284\u4E0B\u7684.ChatPanel.\u64AD\u653E.\u8BBE\u683C\u95F4\u9694(200);
  \u6284\u4E0B\u7684.ChatPanel.\u64AD\u653E.\u64AD\u653E();
  const \u5F85\u8F6C = await \u7B49\u5230((k) => k.\u505C === "\u7ACB\u5373\u8F6C\u4EA4");
  \u62A5("\u2464 \u2462 \u505C\u5728\uFF3B\u7ACB\u5373\u8F6C\u4EA4\uFF3D\u4E0A");
  \u65AD\u8A00(!\u5F85\u8F6C.\u8D85\u65F6 && \u5F85\u8F6C.\u505C === "\u7ACB\u5373\u8F6C\u4EA4", `\u8F6E 1 \u5224\u6210\u6709\u98CE\u9669\u3001\u505C\u5728\uFF3B\u7ACB\u5373\u8F6C\u4EA4\uFF3D\uFF08\u5B9E\u9645\u300C${\u5F85\u8F6C.\u505C}\u300D\uFF09`);
  \u6284\u4E0B\u7684.PrimerPanel.onHandover();
  const \u8F6C\u5B8C = await \u7B49\u5230((k) => k.\u683C >= k.\u5171 && k.\u505C === null);
  \u62A5("\u2465 \u8F6C\u4EA4\u4E4B\u540E\u6F14\u5230\u5934");
  \u65AD\u8A00(!\u8F6C\u5B8C.\u8D85\u65F6 && \u8F6C\u5B8C.\u683C === 7, `\u8F6C\u4EA4\u4E4B\u540E\u4E00\u8DEF\u6F14\u5230\u5934\uFF08\u5B9E\u9645 ${\u8F6C\u5B8C.\u683C}/${\u8F6C\u5B8C.\u5171}\uFF09`);
  console.log("   \u5C4F\u4E0A\u9010\u6761\uFF1A");
  \u8F6C\u5B8C.\u6D88\u606F.forEach(
    (m, i) => console.log(
      `     [${i}] ${m.\u89D2\u8272}  \u7F72\u540D=${m.\u7F72\u540D ? `\u300C${m.\u7F72\u540D}\u300D` : "\u2014\u2014"}  ${String(m.message_text).slice(0, 26)}`
    )
  );
  \u65AD\u8A00(\u8F6C\u5B8C.\u4EE3\u53D1\u8BDD.length === 0, `\u8F6C\u4EA4\u4E4B\u540E\u4E00\u6761\u7EFF\u6C14\u6CE1\u90FD\u6CA1\u6709\uFF08\u5B9E\u9645 ${\u8F6C\u5B8C.\u4EE3\u53D1\u8BDD.length} \u6761\uFF09`);
  const \u539F\u8BDD3 = \u76EE\u68074.\u6D88\u606F[3].message_text;
  const \u539F\u8BDD5 = \u76EE\u68074.\u6D88\u606F[5].message_text;
  \u65AD\u8A00(
    \u8F6C\u5B8C.\u5BA2\u670D\u8BDD.some((m) => m.message_text === \u539F\u8BDD3),
    `\u8F6E 2\uFF08\u540E\u7AEF\u7ED9\u4E86\u6210\u7A3F\u3001\u2460 \u90A3\u4E00\u6863\uFF09\u7684\u5BA2\u670D\u8BDD**\u539F\u8BDD**\u7559\u5728\u5C4F\u4E0A\uFF1A\u300C${\u539F\u8BDD3.slice(0, 16)}\u2026\u300D`
  );
  \u65AD\u8A00(
    \u8F6C\u5B8C.\u5BA2\u670D\u8BDD.some((m) => m.message_text === \u539F\u8BDD5),
    `\u8F6E 3\uFF08\u65E0\u5361\u65E0\u7A3F\uFF09\u7684\u5BA2\u670D\u8BDD**\u539F\u8BDD**\u7559\u5728\u5C4F\u4E0A\uFF1A\u300C${\u539F\u8BDD5.slice(0, 16)}\u2026\u300D`
  );
  \u65AD\u8A00(
    !\u8F6C\u5B8C.\u6D88\u606F.some((m) => m.message_text === \u6210\u7A3F),
    "\u540E\u7AEF\u90A3\u4EFD\u6210\u7A3F\u4E00\u4E2A\u5B57\u90FD\u6CA1\u4E0A\u5C4F \u2014\u2014 \u8F6C\u4EA4\u4E4B\u540E\u8FDE \u2460 \u90A3\u4E00\u6863\u4E5F\u4E0D\u518D\u4EE3\u53D1"
  );
  \u65AD\u8A00(
    \u8F6C\u5B8C.\u5BA2\u670D\u8BDD.every((m) => !m.\u7F72\u540D),
    "\u90A3\u51E0\u53E5\u4E00\u4E2A\u7F72\u540D\u90FD\u6CA1\u6709 \u2014\u2014 \u5B83\u4EEC\u8BFB\u8D77\u6765\u662F\u300C\u5DF2\u7ECF\u8F6C\u4EA4\u7ED9\u522B\u4EBA\u56DE\u7B54\u4E86\u300D"
  );
  console.log(`
${\u5931\u8D25 === 0 ? "\u5168\u7EFF" : `\u7EA2\u4E86 ${\u5931\u8D25} \u6761`}`);
  \u6536\u5C3E();
  process.exit(\u5931\u8D25 === 0 ? 0 : 1);
}
void \u4E3B();
