import { ImageIcon } from 'lucide-react'

import type { Order } from '../../types'

type Props = {
  订单: Order
}

/**
 * 聊天区顶部的商品卡：**这单买的是什么**。
 *
 * 它只回答一个问题 —— 买了什么，所以卡上只有三样：商品名、件数、实付。其余一概
 * 不摆：榜单名次、卖点标签、优惠券、已售数、原价都是买家端拉转化用的，摆在客服
 * 工作台上是噪声。物流和货号也去了 —— 那两样在右栏「顾客情况」的「这单」那一行
 * 里已经有了，同一件事说两遍，客服还得比对哪个是对的。
 *
 * 数据取 `Session.订单` 而不是曾经的「正在浏览」：客服要判的是**已经发生的这笔
 * 交易**，买家此刻在逛什么跟这通对话要处理的事没关系。没下单的会话就不出这张卡 ——
 * 「未下单」本身就是结论，不该拿一个「正在看别的」来填位置。
 */
export default function ProductCard({ 订单 }: Props) {
  return (
    <div className="mx-3 mt-2 flex items-center gap-3 rounded border border-line bg-white p-2.5">
      <div className="flex size-12 shrink-0 items-center justify-center rounded bg-canvas text-ink-4">
        <ImageIcon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-xs font-medium text-ink">{订单.商品名称}</h3>

        <p className="mt-1.5 flex items-baseline gap-3 text-[11px] text-ink-3">
          <span>
            数量 <span className="text-ink-2">{订单.数量}</span>
          </span>
          <span>
            实付 <span className="text-sm font-semibold text-danger">¥{订单['实付金额(元)']}</span>
          </span>
        </p>
      </div>
    </div>
  )
}
