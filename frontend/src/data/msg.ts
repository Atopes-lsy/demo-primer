/**
 * 造一条聊天记录。
 *
 * xlsx 有 18 列，但同一次会话里大半是重复的（店铺、买家昵称、scene_major…），
 * 逐条写满会把数据文件淹掉。这里收成默认值，只在 `over` 里写真正不同的。
 *
 * 单独一个文件是为了避开循环引用：`data/index.ts` 要用它造静态会话，
 * `data/剧本.ts` 要用它造演示脚本的消息，而 `index.ts` 又得引用 `剧本.ts`
 * 才能把演示会话加进列表。
 */

import type { ChatMessage, SenderRole } from '../types'

export const 店铺 = '测试美妆旗舰店'

export function 造消息(
  s: { 会话ID: string; 买家昵称: string },
  序号: number,
  发送时间: string,
  角色: SenderRole,
  message_text: string,
  over: Partial<ChatMessage> = {},
): ChatMessage {
  return {
    会话ID: s.会话ID,
    消息序号: 序号,
    message_id: `${s.会话ID}-${序号}`,
    发送时间,
    角色,
    买家昵称: s.买家昵称,
    发送方: 角色 === '买家' ? s.买家昵称 : 角色 === 'AI' ? 'Primer' : `${店铺}:测试客服`,
    店铺,
    scene_major: '',
    scene_minor: '',
    is_target_buyer_message: 角色 === '买家',
    message_text,
    内容类型: '文本',
    chat_content: JSON.stringify([{ index: 0, content: message_text }]),
    category: 'service',
    image_path: '',
    关联订单号: '',
    关联工单号: '',
    ...over,
  }
}
