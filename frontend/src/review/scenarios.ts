import { 五客户验收会话 } from '../data/五客户验收'
import { EVIDENCE_SOURCE, type ChatMessage, type Evidence, type EvidenceSource, type Session } from '../types'

/** 全部为演示样本，不是品牌真实成分/订单，不向后台写入。 */
const cases = [
  { request: '赠品承诺 9/27 前补发，现在 9/29 还没发。我要求主管处理，不然向平台投诉。', need: '逾期补发投诉，要求主管接手', reply: '很抱歉让您久等，我们将此事转交专席核实处理。', hits: ['②','⑤','⑥'] },
  { request: '说好的赠品一直没收到，能帮我核实补发吗？', need: '核实赠品漏发并催补发', reply: '抱歉让您久等，我正在核实赠品发放记录，有进展及时同步给您。', hits: ['②','④','⑥'] },
  { request: '我怀孕三个月了，这款精华现在可以使用吗？', need: '咨询孕期护肤使用边界', reply: '孕期使用存在个体差异，建议您把成分表给产检医生确认后再决定。', hits: ['①','②'] },
  { request: '上次登记的赠品到底发出了没有？请帮我确认一下。', need: '确认赠品是否已发出', reply: '系统显示赠品尚未发出，我正在帮您核实进度，有结果及时告知。', hits: ['②','④','⑥'] },
  { request: '请问这款测试精华含乙醇吗？', need: '核对测试商品成分', reply: '根据这款测试商品的成分资料，不含乙醇。具体请以您收到的产品包装标识为准。', hits: ['①','②'] },
]

export function reviewMessage(s: Session, text: string, role: ChatMessage['角色'], number: number): ChatMessage {
  return {
    会话ID: s.会话ID, 消息序号: number, message_id: `${s.会话ID}-review-${number}`,
    发送时间: `2026-09-29 ${s.最近时间 ?? '10:00'}:00`, 角色: role,
    买家昵称: s.买家昵称, 发送方: role === '买家' ? s.买家昵称 : '测试客服', 店铺: s.店铺,
    scene_major: '', scene_minor: '', is_target_buyer_message: role === '买家',
    message_text: text, 内容类型: '文本', chat_content: JSON.stringify([{index:0,content:text}]),
    category: 'ui-review', image_path: '', 关联订单号: s.订单?.订单号 ?? '', 关联工单号: '',
    ...(role === 'AI' ? {署名:'Primer 自动发送 · 本地演示样本'} : {}),
  }
}

export const reviewEvidence: Record<string, Evidence[]> = {}
export const reviewSessions: Session[] = 五客户验收会话.map((s, index) => {
  const c = cases[index]
  const evidence = (Object.keys(EVIDENCE_SOURCE) as EvidenceSource[]).map((source): Evidence => ({
    序号: source, 出处: `演示资料 · ${EVIDENCE_SOURCE[source]}`, 用上: c.hits.includes(source),
    摘要: !c.hits.includes(source) ? '本例未采用该来源；不代表现实中没有记录。'
      : source === '①' ? '测试商品成分样本：不含乙醇；不代表真实品牌商品。'
      : source === '⑥' ? '演示补发单已登记，赠品未发货；承诺 9/27，演示日期 9/29。'
      : source === '⑤' ? '演示顾客要求主管介入并提及平台投诉。'
      : source === '④' ? '演示订单正装已签收；赠品仍未发出。'
      : '不作绝对安全承诺；事实回复必须与当前记录一致。',
  }))
  reviewEvidence[s.会话ID] = evidence
  const rows = [
    {标签:'这是谁', 值:s.买家昵称, 备注:index === 4 ? '历史咨询 · 本轮已答复' : '老客 · 本次会话'},
    {标签:'这次要什么', 值:c.need},
    {标签:'答应过什么', 值:index === 0 || index === 1 ? '9/27 前安排赠品补发' : '本轮无新增时限承诺', ...(index < 2 ? {警示:'逾期 2 天'} : {})},
    {标签:'办过什么', 值:index === 3 || index < 2 ? '补发已登记，尚未发货' : '已核对商品资料'},
    {标签:'这单', 值:s.订单?.订单号 ?? '未关联订单'},
  ]
  let advice = s.建议 ? {...s.建议, 依据:evidence, 已代发:undefined} : undefined
  if (advice?.形态 === '需要话术') advice = {...advice, 标题:'核对后采用，发送前可编辑', 说明:[c.need], 话术:c.reply}
  if (advice?.形态 === '需要授权') advice = {...advice, 标题:'赠品漏发，需要报备', 说明:['补发已登记但未发出，承诺逾期 2 天。','报备后对话仍由你接待。']}
  if (advice?.形态 === '有风险') advice = {...advice, 标题:'投诉升级，转交专席', 说明:['承诺逾期并要求主管介入。','由专席接手，不再次承诺未经确认的时限。'], 话术建议:c.reply}
  const output = index === 0 ? '转交' : index === 1 ? '报备' : index === 4 ? 'AI直发' : '客服点发送'
  return {...s, 顾客情况:rows, 建议:advice, 报备:undefined, 转交:undefined,
    消息:[reviewMessage(s,c.request,'买家',1), ...(index === 4 ? [reviewMessage(s,c.reply,'AI',2)] : [])],
    本轮处置:[{...s.本轮处置![0], 主张:c.need, 输出:output, 说明:'本地 UI 验收样本', 话术:c.reply}],
  }
})
