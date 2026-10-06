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
  /** 可选操作回执，必须由调用方的成功结果提供；UI 不猜交接数量。 */
  执行摘要?: string
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
   * 必填，没有默认值：真窗口那类没有剧本的会话走不到后面两态，调用方给的就是
   * `等审批` —— 那是它算出来的结论，不该由这里替它兜一个。
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
 * 「Primer 建议」主卡 —— 右栏里随情况变的那一块。
 *
 * 一轮可能拆出多条主张、产出不同输出，这里只显示最高态；其余的在输入框下方
 * 的「本轮处置」里逐条可查，免得客服以为 AI 抢了他的活或者漏做了什么。
 */
export default function AdviceCard({
  advice,
  处理话术,
  执行摘要,
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
                  {/* 「已答复」那一档**只留单号**（2026-10-07 删）。原来尾巴上还有半句
                      「回访由专员接续」—— 报备并不转移对话，这句话是替后台许愿。 */}
                  <p className="primer-action-note" title={`报备单号 ${报备.工单号}`}>{执行摘要 ?? `报备单号 ${报备.工单号}${报备态 === '等审批' ? ` · 等待 ${报备.等待分钟} 分钟，对话仍由你接待` : 报备态 === '等发送' ? ` · ${待发附注}` : ''}`}</p>
                </div>
              ) : (
                <button type="button" onClick={onReport} className="primer-action primer-primary">一键报备</button>
              ) : null}
              {risk ? 转交 ? (
                <div className="primer-action-result" role="status">
                  <p className="primer-completion">已转交 · 由专席接续</p>
                  <p className="primer-action-note" title={`转交单号 ${转交.工单号}`}>{执行摘要 ?? `转交单号 ${转交.工单号} · 你不必再跟进`}</p>
                </div>
              ) : (
                <button type="button" onClick={onHandover} className="primer-action primer-primary">立即转交</button>
              ) : null}
            </div>
          </li>
        </ol>
      </div>
    </section>
  )
}
