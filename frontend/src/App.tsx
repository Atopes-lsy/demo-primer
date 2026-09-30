import { useMemo, useState } from 'react'

import ChatPanel from './components/chat/ChatPanel'
import IconRail from './components/IconRail'
import type { 报备态 } from './components/plugin/AdviceCard'
import PrimerPanel from './components/plugin/PrimerPanel'
import SessionPanel from './components/session/SessionPanel'
import { agent, sessions as seedSessions, shopMetrics, 先例库指标 } from './data'
import { 演到, 停格, 剧本表, 已入库条数, 先例库基数, type 现场消息 } from './data/剧本'
import { usePlayer } from './hooks/use播放器'
import type { ChatMessage, Session } from './types'

/** 客服发出的消息。字段从会话最后一条消息沿用，只覆盖真正变化的部分。 */
function buildAgentMessage(session: Session, text: string, 序号: number): ChatMessage {
  const template = session.消息.at(-1)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')

  return {
    会话ID: session.会话ID,
    消息序号: 序号,
    message_id: `${session.会话ID}-local-${序号}`,
    发送时间: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
      now.getHours(),
    )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    角色: '客服',
    买家昵称: session.买家昵称,
    发送方: `${session.店铺}:${agent.昵称}`,
    店铺: session.店铺,
    scene_major: template?.scene_major ?? '',
    scene_minor: template?.scene_minor ?? '',
    is_target_buyer_message: false,
    message_text: text,
    内容类型: '文本',
    chat_content: JSON.stringify([{ index: 0, content: text }]),
    category: template?.category ?? 'service',
    image_path: '',
    关联订单号: session.订单?.订单号 ?? '',
    关联工单号: session.工单?.ticket.工单号 ?? '',
  }
}

/**
 * 报备单／交接单的号。
 *
 * 规格 §7 要求报备和转交都自动生成单号、客服零填写，所以这里本地拼一个
 * `BH20260928001` 形状的串。接了后端之后这个函数整个删掉，用接口返回值。
 */
function 生成单号(前缀: 'BH' | 'JJ', 会话ID: string): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  const 序号 = 会话ID.replace(/\D/g, '').slice(-3).padStart(3, '0')
  return `${前缀}${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${序号}`
}

export default function App() {
  const [sessions, setSessions] = useState<Session[]>(seedSessions)

  /**
   * 开屏停在**第一条演示线**上，不是列表第一条。
   *
   * 演示是从 S3「顾客 A 进线」开始的，前面那几条静态会话不在片子里，选中它们
   * 只会让演示的人多一次点击。更要紧的是先例库计数：S11 要的是「56 → 57 轻跳」，
   * 而**非当前会话一律按演到底算**（见 `格数`）—— 开屏要是停在一条没有剧本的会话
   * 上，线一就成了「非当前」，一进来计数就是 57，那一跳就白跳了。
   */
  const [activeId, setActiveId] = useState(
    seedSessions.find((s) => 剧本表[s.会话ID])?.会话ID ?? seedSessions[0]?.会话ID ?? '',
  )

  /**
   * 演示过程中**客服现场发出去的消息**，按会话分开存（见 `剧本.现场消息`）。
   *
   * 只有**有剧本的会话**用它。普通会话的消息直接往 `sessions` 里长，不需要这一份。
   *
   * 为什么不直接塞进 `sessions`：那样它就成了 `活.消息`，而 `演到` 把 `活.消息`
   * 一律排在剧本消息**后面**。客服停在第 5 步发的那句，走到第 8 步就会跑到
   * 「好的，谢谢啦」后面去 —— 时间线当场就乱。记着步号，它才插得回原位。
   */
  const [现场消息表, set现场消息表] = useState<Record<string, 现场消息[]>>({})

  const 剧本 = 剧本表[activeId]
  const 活条数 = sessions.find((s) => s.会话ID === activeId)?.消息.length ?? 0

  /**
   * 播放器的总格数。**有剧本的会话要按步数，不能按消息条数。**
   *
   * 有剧本的会话，一格是**剧本的一步**。一步带不带消息不影响格子数：没有消息的
   * 步（「六源扫描」「逾期浮出」）照样占一格，照样要停下来让人讲。这正是不能按
   * 消息条数数的原因。
   *
   * 没有剧本的会话一条消息一停，总格数就是消息条数。
   *
   * 每一格停多久不在这儿 —— 那是播放器上的 `1s / 3s / 5s` 那一档，见 `use播放器`。
   * 早先这里给的是一张「每步各自的间隔」表，**那张表已经删了**：速度现在全片
   * 统一，节奏由演示的人当场挑。
   */
  const 总格数 = 剧本 ? 剧本.事件.length : 活条数

  /**
   * 第几格要停下来等人点按钮（见 `剧本.停格`）。
   *
   * `useMemo` 不是性能考虑，是**正确性**：这一份进 `usePlayer` 定时器 effect 的
   * 依赖数组，每次渲染现造一个 Map 的话，每次渲染都会把定时器清掉重排，播放就
   * 被自己的渲染拖慢了。剧本是模块常量，所以这个 Map 一个会话里只建一次。
   */
  const 停格表 = useMemo(() => 停格(剧本), [剧本])

  const 播放 = usePlayer(总格数, 停格表)

  /**
   * 这条会话该演到第几格。**当前会话按真实进度，其余一律演到底。**
   *
   * 抽出来是因为 `展示` 和先例库计数要按同一套规矩算 —— 两处各写一遍的话，
   * 有一处改了另一处没跟上，「列表里都演完了」和「先例库还差一条」就会打架。
   */
  const 格数 = (s: Session): number => {
    const 本 = 剧本表[s.会话ID]
    if (s.会话ID !== activeId) return 本 ? 本.事件.length : Number.POSITIVE_INFINITY
    return 播放.已播格数
  }

  /**
   * 顶栏那个先例库计数。
   *
   * **要把所有剧本都算进来，不能只看当前这一条。** 演示到「换一位顾客」时
   * 会切到线二，那时线一已经入过库了 —— 只看当前会话的话，一切走计数就从
   * 57 掉回 56，屏幕上「存进去了」和「又没了」同时发生。
   *
   * 非当前会话按演到底算，和 `展示` 同一套规矩：在这套演示里，它们本来就是
   * 全演出来的。
   */
  const 先例库总数 = sessions.reduce(
    (和, s) => 和 + 已入库条数(剧本表[s.会话ID], 格数(s)),
    先例库基数,
  )

  /**
   * 顶部指标条。**只有「先例库」那一项是活的** —— 演到「入先例库」那一步
   * 自己从 56 跳到 57。剩下的全是当日常量，混在同一个数组里没人看得出哪个
   * 能动，所以那个计数单列了一个 `先例库指标`，只在这儿拼进来。
   */
  const 指标 = useMemo(
    () => [先例库指标(先例库总数), ...shopMetrics],
    [先例库总数],
  )

  /**
   * 渲染用的会话列表。
   *
   * 屏幕上演到哪儿，由播放器的进度决定 —— **两种会话都归它管**：
   *   - 有剧本：进度的单位本来就是步，直接喂给 `演到`，右栏跟着一起变；
   *   - 没剧本：一格一条，直接从消息列表里截前 N 条。
   *
   * 这里**不做步和条的换算**。早先中间隔了一层 `条到步`，那是因为当时那份剧本
   * 恰好一步一条消息，换算看着是恒等式；换成有「空步」的剧本之后，它会拿步数
   * 当条数再换一次，把整拍空步跳过去 —— 右栏的报备、逾期、入库全演不出来。
   *
   * 普通会话不能也走剧本那条路。给它现造一份「一条消息一步」的剧本看着更统一，
   * 但那份剧本的消息和 `活.消息` 是同一批 —— `演到` 会把 `活.消息` 再追加一遍，
   * 屏幕上每条消息出现两次。
   *
   * 「当前会话按真实进度、其余演到底」这条规矩在 `格数` 里，不在这儿 ——
   * 先例库计数也要用它。非当前会话演到底是因为它们只是列表里的一行摘要，
   * 没播完会显示成一条空会话，演示的人反而找不到它。当前会话按真实进度走，
   * 所以选中它时摘要会先空一下再随播放长回来 —— 这个「重演」的观感正是想要的。
   */
  const 展示: Session[] = sessions.map((s) => {
    const 本 = 剧本表[s.会话ID]
    const 格 = 格数(s)
    if (本) return 演到(s, 本, 格, 现场消息表[s.会话ID] ?? [])
    return { ...s, 消息: s.消息.slice(0, 格) }
  })

  const active = 展示.find((s) => s.会话ID === activeId) ?? null

  /**
   * 报备卡现在是哪个状态（见 `AdviceCard` 的 `报备态`）。
   *
   * **从「演到第几步」和现场消息推出来，不另存。** 三个状态分别对应：
   *   - `等审批`：报备交上去了还没回来 —— 第 6 步报备之后、第 7 步之前；
   *   - `等发送`：审批回来了，话压在手上等客服点［一键发送］—— 第 7 步；
   *   - `已答复`：那句话发出去了。
   *
   * 为什么扫一整段而不是只看当前这一步有没有 `待发`：第 7 步发完之后时间线走到
   * 第 8 步，而第 8 步没有 `待发` —— 只看当前步的话，卡片会在顾客道谢那一下从
   * 「审批回来了」倒回「等待组长审批」，屏幕上就成了「刚发完又回到等审批」。
   *
   * 判「发过没有」用的是 `message_id`：`待发` 是模块常量，发出去的那一份进了
   * `现场消息表`，两边同一个 ID。往回拖不会把它变回没发 —— 也没有发出去的话
   * 还能收回来的道理。而在第 6 步上它又是「等审批」，因为那句话还没进消息流
   * （`演到` 按步裁），两处看到的是一致的。
   */
  /** 这条会话已经现场发出去的消息 ID。判「那句话发过没有」用它。 */
  const 已发现场 = useMemo(
    () => new Set((现场消息表[activeId] ?? []).map((现) => 现.消息.message_id)),
    [现场消息表, activeId],
  )

  const 报备态 = useMemo((): 报备态 => {
    let 见过待发 = false
    for (let i = 0; i < 播放.已播格数; i++) {
      const 待发 = 剧本?.事件[i]?.待发
      if (!待发?.length) continue
      见过待发 = true
      if (待发.some((m) => !已发现场.has(m.message_id))) return '等发送'
    }
    return 见过待发 ? '已答复' : '等审批'
  }, [剧本, 播放.已播格数, 已发现场])

  /**
   * 审批回来、**还没发出去**的那句话。
   *
   * 门开在 `报备态` 上而不是自己再判一遍：它等于「等发送」时，当前这一步
   * 必然就是那个带 `待发` 的步，直接取就是了。
   */
  const 待发句 =
    报备态 === '等发送'
      ? 剧本?.事件[播放.已播格数 - 1]?.待发?.find((m) => !已发现场.has(m.message_id))
      : undefined

  /**
   * 切会话就把播放器归零。
   *
   * 归零放在这里而不是 `usePlayer` 的 effect 里：切会话是**这个点击**造成的，
   * 在造成变化的地方顺手清掉，比等渲染完再补一次 setState 少一轮渲染，也不会
   * 先闪一帧上一条会话的进度。顺带一个好处 —— 重复点当前会话 = 重播。
   */
  const 选会话 = (id: string) => {
    setActiveId(id)
    播放.重置()
  }

  /** 改一条会话。插件产出的一切状态（草稿、报备、转交）都落在会话上。 */
  const patch = (fn: (s: Session) => Session) => {
    setSessions((prev) => prev.map((s) => (s.会话ID === activeId ? fn(s) : s)))
  }

  /**
   * 客服按了输入框上那个「发送」。**有剧本和没剧本的会话走的不是同一条路。**
   *
   * 有剧本的会话（演示会话）：这条是**现场消息**，得记着停在第几步发的，才能照
   * 顺序插回原位（见 `现场消息`）。它**不改 `摘要` / `最近时间`** —— 那两样在
   * 剧本里是叙事的一部分（第 7 步要写「好的，谢谢啦」），而现场消息带的是真实
   * 时钟上的时间戳，写进去就等于把「2026-09-30 14:23」塞进一条 9/26 的时间线。
   * 有剧本的会话，左边列表那一行归剧本管。
   *
   * 普通会话：还是老办法，直接往 `sessions` 里长。
   *
   * 两种都要接着放：第 5 步正停着等客服按这一下（`剧本.等点击`）。点了发送，
   * 这一拍才算走完。
   */
  const handleSend = (text: string) => {
    const 内容 = text.trim()
    if (!内容) return

    if (剧本 && active) {
      const 条 = buildAgentMessage(active, 内容, active.消息.length + 1)
      set现场消息表((prev) => ({
        ...prev,
        [activeId]: [...(prev[activeId] ?? []), { 步: 播放.已播格数, 消息: 条 }],
      }))
      // 发出去就把草稿清掉，否则输入框里还挂着刚发的那句话。
      patch((s) => ({ ...s, 草稿: '' }))
      播放.继续()
      return
    }

    patch((s) => {
      const sent = buildAgentMessage(s, 内容, s.消息.length + 1)
      return {
        ...s,
        消息: [...s.消息, sent],
        草稿: '',
        摘要: 内容,
        最近时间: sent.发送时间.slice(5, 16),
      }
    })
  }

  /**
   * 主卡［一键发送］：把这一步备好的话（`剧本事件.待发`）发出去。
   *
   * 这就是报备走完一圈的那一下（脚本 S11）。搬进 `现场消息表` 之后，它和客服
   * 自己发的一条没有区别 —— 也该没有：报备走到底，客服也就是「按了一下」。
   *
   * 这里**写 `摘要` / `最近时间`**（第 5 步那条现场消息不写）：这句是从剧本里
   * 搬出来的，自带 9/26 10:08 的时间戳，写进列表那一行正好接上第 8 步。
   */
  const handleSendPending = () => {
    const 待发 = 剧本?.事件[播放.已播格数 - 1]?.待发
    if (!待发?.length) return
    const 步 = 播放.已播格数
    set现场消息表((prev) => ({
      ...prev,
      [activeId]: [
        ...(prev[activeId] ?? []),
        ...待发.map((m) => ({ 步, 消息: m })),
      ],
    }))
    patch((s) => ({
      ...s,
      草稿: '',
      摘要: 待发[0].message_text,
      最近时间: 待发[0].发送时间.slice(5, 16),
    }))
    播放.继续()
  }

  /**
   * 三个主卡按钮都做两件事：改会话状态，然后**接着放**。
   *
   * 后半句是给「停在这一步等你点」用的（见 `剧本.等点击`）：点了按钮时间线就
   * 往下走，演示的人不用再去够播放键。没停在那一格时 `继续` 什么也不做，所以
   * 顺手点一下卡片不会把时间线带走。
   */

  /**
   * 主卡［采用］：只把话术带进输入框 —— **不发**。
   *
   * 发不发由客服决定。他可能改，也可能像脚本 S7 那样改出个禁语被拦下来。
   *
   * 所以这里**不调 `播放.继续()`**：那会让时间线在客服还没按发送时就往下走，
   * 把「他按了发送」这一拍抢掉。第 4 步的续放交给 `handleSend`。
   */
  const handleUseScript = () => {
    const 话术 = active?.建议?.话术
    if (!话术) return
    patch((s) => ({ ...s, 草稿: 话术 }))
  }

  /** 主卡「一键报备」：对话还在客服手里，顾客无感知。 */
  const handleReport = () => {
    patch((s) => ({ ...s, 报备: { 等待分钟: 0, 工单号: 生成单号('BH', s.会话ID) } }))
    播放.继续()
  }

  /** 主卡「立即转交」：对话交出去，客服不再跟进。 */
  const handleHandover = () => {
    patch((s) => ({ ...s, 转交: { 工单号: 生成单号('JJ', s.会话ID) } }))
    播放.继续()
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <IconRail />
      <SessionPanel sessions={展示} activeId={activeId} onSelect={选会话} />
      <ChatPanel
        session={active}
        agent={agent}
        metrics={指标}
        onSend={handleSend}
        onDraftChange={(text) => patch((s) => ({ ...s, 草稿: text }))}
        剧本={剧本}
        播放={播放}
        // 普通会话的提示行要显示「刚出现的那条」。截断之后最后一条就是它。
        // 有剧本的会话不走这个 —— 它的提示行是剧本的标题和备注。
        当前消息={剧本 ? undefined : active?.消息.at(-1)}
      />
      <PrimerPanel
        session={active}
        onUseScript={handleUseScript}
        onReport={handleReport}
        onHandover={handleHandover}
        onSendPending={handleSendPending}
        报备态={报备态}
        待发句={待发句}
      />
    </div>
  )
}
