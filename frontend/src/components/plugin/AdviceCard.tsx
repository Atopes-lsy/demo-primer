import type { Advice, ChatMessage } from '../../types'

/**
 * 报备卡上的三个状态。
 *
 * `等审批` 交上去了没回来 → `等发送` 审批回来了、话压在手上等客服点［一键发送］
 * → `已答复` 那句话发出去了。
 *
 * **由进度和现场消息推出来，不另存**（见 `App` 的 `报备态`）：存一份就多一处
 * 要跟播放进度同步的状态，而它本来就是「演到哪一步 + 那句发没发」的结论。
 */
export type 报备态 = '等审批' | '等发送' | '已答复'

type Props = {
  advice: Advice
  /** 现有本轮处置提供的话术，仅预览，不在 UI 中推导或自动发送。 */
  处理话术?: string
  /** 「采用」：只把话术带进输入框，**不发** —— 发不发由客服按发送决定。 */
  onUseScript: () => void
  /** 「一键报备」：后台走审批，对话还在客服手里。 */
  onReport: () => void
  /** 「立即转交」：对话交出去，客服不再跟进。 */
  onHandover: () => void
  /** 「一键发送」：审批回来了，把这一步备好的话发出去。 */
  onSendPending: () => void
  /** 已报备后的等待状态。 */
  报备?: { 等待分钟: number; 工单号: string }
  /** 已转交后的交接单号。 */
  转交?: { 工单号: string }
  /**
   * 报备走到哪一步了。
   *
   * 必填，没有默认值：没有剧本的会话（那种没有播放器）走不到后面两态，调用方
   * 给的就是 `等审批` —— 那是它算出来的结论，不该由这里替它兜一个。
   */
  报备态: 报备态
  /** 审批回来、还没发出去的那句话（`剧本事件.待发` 的第一条）。 */
  待发句?: ChatMessage
  /**
   * `待发句` 下面那行小字 · 和单号拼在一起。**不传就是演示线那句。**
   *
   * 演示线那句是「这句是按审批口径写好的」—— 话术是 primer 写的，审批批的就是它。
   * 真窗口上那句话**不是 primer 写的**：它是当时客服真发出去的原话（`App.待发句`），
   * 说成「按审批口径写好的」是假话。两种会话各说各的实话，所以这一句得从外面传。
   */
  待发附注?: string
  /**
   * ② 那一档的话已经发出去了（见 `App` 的 `本轮已发`）。
   *
   * 卡片**不会自己撤**（线一第 4 格那张和第 3 格是同一句话），所以「发过了」
   * 得由这里说出来：把［采用］换成一行「已发送」。
   *
   * # 为什么非要收口不可（2026-10-05 实测）
   *
   * 不收口时那一格写着「✍️ 这条得你来发 · 涉个体差异」加一颗亮着的［采用］
   * —— 照着卡片做的人（他就是被这么叫的）再点一次［采用］→［发送］，
   * **同一句话就在聊天区连出两遍**。两次都是单击，没有一处报错。
   */
  已发本轮?: boolean
}

/**
 * 主卡描边随形态变，这是右栏里唯一区分优先级的视觉信号。
 *
 * 三种形态，对应清单 §3.4 的 ②③④ 三档：② 蓝（等你点一下）、
 * ③ 琥珀（报备）、④ 红（转交）。**① `AI直发` 不在这里** ——
 * 它不做卡，右栏那一轮走空态（见 `PrimerPanel`）。
 */

/**
 * 已代发清单 —— 本轮 AI 已经以客服名义发出去的话。
 *
 * 名字是英文的，理由同 `EvidenceList`（React 不认中文开头的组件）。
 *
 * # 为什么默认展开，而底下那块依据默认折叠
 *
 * 两块要回答的不是一个问题。依据是**客服想追的时候**才去看的（他得先起疑）；
 * 「有句话已经用你的名义发出去了」是**他必须知道、而且不知道自己不知道**的
 * 那类事 —— 折叠起来就等于没做。它只在真有代发时出现，不会长期占地方。
 *
 * 不展开的代价有具体形状：顾客下一句回「你刚才不是说可以退吗」，
 * 客服这边翻遍右栏找不到自己说过那句。聊天区的绿气泡也标了署名，
 * 但气泡会随着对话滚走（`types/index.ts:417`）。
 *
 * # 为什么用 `ai-*` 那组绿
 *
 * 聊天气泡里的 AI 代发、气泡下面那行署名、`本轮处置` 里的「AI直发」都是这个色。
 * 四处说的是同一件事（这话不是你打的），颜色就该是同一种。
 */
function SentList({ 已代发 }: { 已代发: NonNullable<Advice['已代发']> }) {
  return (
    <div className="border-t border-ai-line bg-ai-soft px-3 py-2">
      <p className="text-xs font-medium text-ai-ink">已代发 · 以你的名义</p>

      {已代发.map((条, i) => (
        // 内容当 key 的一部分：同一个会话里两条代发话术撞内容的情况没有，
        // 但下标不能当唯一依据（列表会随轮次整块换）。
        <div key={`${i}-${条.内容}`} className="mt-1.5">
          <p className="rounded border border-line-soft bg-canvas px-2 py-2 text-xs leading-relaxed text-ink">
            {条.内容}
          </p>
          {/* 署名原样出，**不加前缀** —— 它自己就写着「Primer 自动发送」，
              和聊天区那行是同一个字符串（`MessageList` 也给它加了 ◆）。 */}
          <p className="mt-1 text-note text-ai-ink-2">◆ {条.署名}</p>
          {/* 这一句引的是哪几条。和底下依据清单一**不是**一回事：
              底下那份是「本轮六源查到了什么」（`N/6` 那个分母），
              这份是「这一句话引了哪几条」。别把两块并成一个
              （`api/证据.py` 的模块文档串专门写了为什么）。

              **空着就整行不画。** 真窗口那一档的 `依据` 恒为 `[]` —— 接口只回报
              本轮的六源命中，说不出「这一句引了哪几条」（`App.带代发` 那段）。
              照画的话是一行有上边距的空 `<p>`：读起来像「这句话没有依据」，而它
              实际的意思是「这一趟我们拿不到依据」—— 两件事，分开说。 */}
          {条.依据.length ? (
            <p className="mt-0.5 text-note leading-relaxed text-ink-4">
              {条.依据.map((e) => `${e.序号} ${e.出处}`).join('　')}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )
}

/**
 * 「Primer 建议」主卡 —— 右栏里随情况变的那一块。
 *
 * 一轮可能拆出多条主张、产出不同输出，这里只显示最高态；其余的在输入框下方
 * 的「本轮处置」里逐条可查，免得客服以为 AI 抢了他的活或者漏做了什么。
 */
export default function AdviceCard({
  advice,
  处理话术,
  onUseScript,
  onReport,
  onHandover,
  onSendPending,
  报备,
  转交,
  报备态,
  待发句,
  待发附注 = '这句是按审批口径写好的',
  已发本轮,
}: Props) {
  const report = advice.形态 === '需要授权'
  const risk = advice.形态 === '有风险'
  const tone = risk ? 'risk' : report ? 'report' : 'confirm'
  const script = risk ? advice.话术建议 : advice.话术 ?? 处理话术
  const sources = advice.依据.filter((e) => e.用上)
  return (
    <section data-tone={tone} className="primer-advice primer-structured">
      <header>
        <h2>Primer 建议</h2>
        <span className="primer-judgement">{risk ? '必须转交' : report ? '需要报备' : 已发本轮 ? '已发送' : '待客服确认'}</span>
      </header>
      <div className="primer-advice-body">
        <h3 className="primer-advice-title">{advice.标题}</h3>
        <ol className="primer-step-flow" key={`${advice.判断}-${script ?? ''}`}>
          <li className="primer-step">
            <span className="primer-step-number" aria-hidden="true">1</span>
            <div><span className="primer-step-label">判断 <span className="primer-help" tabIndex={0} aria-label={`判断说明：${advice.说明.join('；')}`}>?<span className="primer-help-popover">{advice.说明.map((line) => <span key={line}>{line}</span>)}</span></span></span>
              <p className="primer-step-judgement" title={advice.判断}>{risk ? advice.风险标签 ?? advice.判断 : advice.判断}</p>
            </div>
          </li>
          <li className="primer-step">
            <span className="primer-step-number" aria-hidden="true">2</span>
            <div><span className="primer-step-label">{risk ? '转交说明' : '建议回复'}</span>
              {script ? <p className="primer-script">{script}</p>
                : <p className="primer-script">{advice.说明.join(' ')}</p>}
              <p className="primer-source-caption" title={sources.map((e) => e.出处).join('；')}>
                六源依据 · 本轮采用 {sources.length} 源
              </p>
            </div>
          </li>
          <li className="primer-step primer-step-execution">
            <span className="primer-step-number" aria-hidden="true">3</span>
            <div><span className="primer-step-label">执行操作</span>
              {!report && !risk ? 已发本轮 ? (
                <p role="status" className="primer-completion">已发送 · 这一轮不用再发一遍</p>
              ) : (
                <button type="button" onClick={onUseScript} className="primer-action primer-primary">采用到输入框</button>
              ) : null}
              {report ? 报备 ? (
                <div className="primer-action-result" role="status">
                  <p className="primer-completion">{报备态 === '等审批' ? '已报备 · 等待审批' : 报备态 === '等发送' ? '审批已通过 · 待发送' : '已答复顾客'}</p>
                  {报备态 === '等发送' && <>
                    {待发句 && <p className="primer-script">{待发句.message_text}</p>}
                    <button type="button" onClick={onSendPending} className="primer-action primer-primary">一键发送</button>
                  </>}
                  <p className="primer-action-note">报备单号 {报备.工单号} · {报备态 === '等审批' ? `等待 ${报备.等待分钟} 分钟，对话仍由你接待` : 报备态 === '等发送' ? 待发附注 : '回访由专员接续'}</p>
                </div>
              ) : (
                <button type="button" onClick={onReport} className="primer-action primer-primary">一键报备</button>
              ) : null}
              {risk ? 转交 ? (
                <div className="primer-action-result" role="status">
                  <p className="primer-completion">已转交 · 由专席接续</p>
                  <p className="primer-action-note">转交单号 {转交.工单号} · 你不必再跟进</p>
                </div>
              ) : (
                <button type="button" onClick={onHandover} className="primer-action primer-primary">立即转交</button>
              ) : null}
            </div>
          </li>
        </ol>
      </div>
      {advice.已代发?.length ? <SentList 已代发={advice.已代发} /> : null}
    </section>
  )
}
