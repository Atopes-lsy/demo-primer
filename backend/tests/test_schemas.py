"""接口契约（`app/api/schemas.py`）的完成标准，写成测试。

**这个文件不测逻辑** —— 契约层没有逻辑。它测的是一件更基础的事：
`schemas.py` 和 `frontend/src/types/index.ts` **还是不是同一套字段名**。

做法是**真的去解析那个 TS 文件**，不是在这里手抄一份字段名再跟自己比。
手抄的那份会和 TS 一起过期 —— 改了 `types/index.ts` 而没改这里，测试照样绿，
而它本来要防的就是这件事。所以 `docs/开发步骤.md` 步骤 0 的那句「逐字对应」
在这里被读成：**把 TS 文件当输入源**。

# 为什么值得为「字段名对不对」专门写一个文件

两边字段名漂移**不会让任何东西报错**。后端多拼一个字、前端读 `undefined`，
界面只是少显示一块 —— 直到演示当天有人问「这儿怎么是空的」。
这是唯一一类「两边都编译得过、两边都测试通过、但合起来是坏的」的错，
除了真去比对两个文件没有别的办法发现。

# 解析器只做够用的事

TS 是图灵完备的语言，不做通用解析器。这个文件里用到的语法只有四种，
下面各有一个取法：`interface X {}` / `type X = {}` / 联合类型 / `extends`。
够读 `types/index.ts`，换文件可能不够 —— 那是那时候的事。
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import get_args

import pytest

from app.api import schemas
from app.rules import inbound, pipeline, sources, triggers

类型文件 = Path(__file__).resolve().parents[2] / "frontend" / "src" / "types" / "index.ts"


# ══════════════════════════════════════════════════════════
# 极简 TS 读取器
# ══════════════════════════════════════════════════════════

_注释 = re.compile(r"/\*.*?\*/|//[^\n]*", re.S)


def _源码() -> str:
    """`types/index.ts` 全文，**注释已剥掉**。

    剥注释不是洁癖：字段提取只看「深度 0 的行」，而文档注释里大把
    `` `${会话ID}-${轮次}-${序号}` `` 这种带花括号和冒号的句子，
    留着它们会污染深度统计。
    """
    assert 类型文件.exists(), (
        f"找不到 {类型文件}。契约测试要拿它当输入源，"
        "缺了它「前后端字段一致」这句话就没法验证了。"
    )
    return _注释.sub("", 类型文件.read_text(encoding="utf-8"))


def _声明(源: str, 名字: str) -> re.Match[str]:
    """`interface 名字 …{` 或 `type 名字 = …{` 的匹配。`group(1)` 是花括号前那段。"""
    m = re.search(rf"\b(?:interface|type)\s+{re.escape(名字)}\b([^{{]*)\{{", 源)
    assert m is not None, f"`types/index.ts` 里找不到 `{名字}` 的声明"
    return m


def _体(源: str, 名字: str) -> str:
    """花括号里的原文，按深度配对截取（内联对象类型也能正确跳过）。"""
    m = _声明(源, 名字)
    起 = m.end()
    深 = 1
    for i in range(起, len(源)):
        if 源[i] == "{":
            深 += 1
        elif 源[i] == "}":
            深 -= 1
            if 深 == 0:
                return 源[起:i]
    raise AssertionError(f"`{名字}` 的花括号没闭合")


def _字段(源: str, 名字: str) -> set[str]:
    """一个类型的字段名集合，**含 `extends` 来的**。

    只看花括号内**深度 0** 的行的开头 —— `报备?: { 等待分钟: number }` 这种
    内联对象算一个字段（`报备`），里面的 `等待分钟` 不算。
    """
    m = _声明(源, 名字)
    字段 = _取本层(_体(源, 名字))
    for 父 in re.findall(r"extends\s+([A-Za-z_]\w*)", m.group(1)):
        字段 |= _字段(源, 父)
    return 字段


def _取本层(体: str) -> set[str]:
    """按 `;` 切段来认字段，不按行。

    `TaggedTicket` 是**一行写完**的（`{ kind: T; ticket: U }`），按行只看开头
    会漏掉第二个字段 —— 而漏掉的字段在这套测试里表现为「后端多发了一个」，
    报错信息会把人指到后端去。所以边界是 `;`，不是换行。

    花括号深度跨行累计：内联对象里的 `;`（`报备?: { 等待分钟: number; 工单号: string }`）
    深度不为 0，不会被当成段边界，`工单号` 因此不会被误认成外层字段。
    """
    字段: set[str] = set()
    深 = 0
    for 行 in 体.splitlines():
        段起 = 0
        for i, 字 in enumerate(行):
            if 字 == "{":
                深 += 1
            elif 字 == "}":
                深 -= 1
            elif 字 == ";" and 深 == 0:
                _认一段(行[段起:i], 字段)
                段起 = i + 1
        _认一段(行[段起:], 字段)
    return 字段


def _认一段(片段: str, 字段: set[str]) -> None:
    if m := re.match(r"\s*([^\s:?]+)\s*\??\s*:", 片段):
        字段.add(m.group(1).strip("'\""))


def _联合(源: str, 名字: str) -> set[str]:
    """`type X = 'a' | 'b'` 的取值集合。"""
    m = re.search(rf"export type {re.escape(名字)}\s*=\s*(.+?)(?:\n\n|\Z)", 源, re.S)
    assert m is not None, f"找不到联合类型 `{名字}`"
    return set(re.findall(r"'([^']*)'", m.group(1)))


def _内联联合(源: str, 类型: str, 字段: str) -> set[str]:
    """写在接口里的一行联合，如 `形态: '需要话术' | '需要授权' | '有风险'`。"""
    m = re.search(rf"^\s*{re.escape(字段)}\??\s*:\s*(.+)$", _体(源, 类型), re.M)
    assert m is not None, f"`{类型}.{字段}` 找不到"
    return set(re.findall(r"'([^']*)'", m.group(1)))


def _并集成员(源: str, 名字: str) -> set[str]:
    """`type X = A | B | C`（可换行）里的类型名。"""
    m = re.search(rf"export type {re.escape(名字)}\s*=\s*([^;\n]*(?:\n\s*\|[^\n]*)*)", 源)
    assert m is not None, f"找不到并集 `{名字}`"
    return set(re.findall(r"([A-Za-z_]\w*)", m.group(1)))


def _线上字段(模型: type) -> set[str]:
    """后端模型**序列化出去**的字段名。

    有 `alias` 的取 `alias` —— 别名就是线上名，这是整个别名机制的用意。
    """
    return {f.alias or 名 for 名, f in 模型.model_fields.items()}


# ══════════════════════════════════════════════════════════
# 一 · 字段名逐字对应
# ══════════════════════════════════════════════════════════
#
# 这一组是步骤 0 的完成标准本身。左边是 TS 类型名，右边是契约模型。

对应关系: list[tuple[str, type]] = [
    ("ChatMessage", schemas.ChatMessage),
    ("Order", schemas.Order),
    ("TicketBase", schemas.TicketBase),
    ("ReshipTicket", schemas.ReshipTicket),
    ("PayoutTicket", schemas.PayoutTicket),
    ("LogisticsTicket", schemas.LogisticsTicket),
    ("AdverseReactionTicket", schemas.AdverseReactionTicket),
    ("ReturnRefundTicket", schemas.ReturnRefundTicket),
    ("TaggedTicket", schemas.TaggedTicket),
    ("StateRow", schemas.StateRow),
    ("Evidence", schemas.Evidence),
    ("Advice", schemas.Advice),
    ("Disposition", schemas.Disposition),
    ("GuardHit", schemas.GuardHit),
    # 2026-10-07：`GET /api/先例库` 只有一个字段，照样进这张表 ——
    # **值一块钱的接口和值一万块的接口，字段漂移起来是一个价钱。**
    ("先例库", schemas.先例库),
]


@pytest.mark.parametrize(("类型名", "模型"), 对应关系, ids=[n for n, _ in 对应关系])
def test_字段名逐字对应(类型名: str, 模型: type) -> None:
    """TS 里有的字段，后端一个不多一个不少，且**一字不差**。

    报告两个方向的差异而不是只报一个：少了是「前端读不到」，
    多了是「后端发了没人要」，两种问题的排查方向完全不同。
    """
    ts = _字段(_源码(), 类型名)
    后端 = _线上字段(模型)
    assert 后端 == ts, (
        f"{类型名} 对不上：\n"
        f"  后端缺：{sorted(ts - 后端)}\n"
        f"  后端多：{sorted(后端 - ts)}"
    )


def test_Session_只缺草稿这一个字段() -> None:
    """`Session` 是唯一的例外，而且只缺一个字段：`草稿`。

    **`草稿` 是输入框里的字**，前端自己的注释写着「输入框内容随时会变，
    禁语必须在每次编辑后用 `查禁语()` 重新比对」。后端声明一个 `草稿`
    等于声称自己管着一份它看不见的、随时会变的副本。

    断言写成「差集恰好是 `{草稿}`」而不是「后端没有草稿」：
    后者在有人顺手漏掉别的字段时照样绿。
    """
    源 = _源码()
    ts = _字段(源, "Session")
    后端 = _线上字段(schemas.Session)

    assert "草稿" in ts, "前提变了：前端 `Session` 已经没有 `草稿` 了，这条例外该删"
    assert 后端 - ts == set(), f"后端多出了 {sorted(后端 - ts)}"
    assert ts - 后端 == {"草稿"}, (
        f"`Session` 除了 `草稿` 之外不该再缺字段，实际缺：{sorted(ts - 后端 - {'草稿'})}"
    )


def test_带括号的四个金额列线上名逐字带括号() -> None:
    """`单价(元)` 这类名字不是合法的 Python 标识符，只能 `alias`。

    **别名不是映射层** —— 线上跑出来的键就是 `单价(元)`。这条测试盯的是
    「别名有没有被写成别的样子」，比如漏了括号、用了半角/全角混写。
    """
    期望 = {
        schemas.Order: {"单价(元)", "实付金额(元)"},
        schemas.PayoutTicket: {"退款金额(元)"},
        schemas.LogisticsTicket: {"订单实付(元)"},
    }
    为替身 = 0
    for 模型, 名字们 in 期望.items():
        for 名 in 名字们:
            字段 = 模型.model_fields.get(名.replace("(元)", "元"))
            assert 字段 is not None, f"{模型.__name__} 里没有 {名} 对应的属性"
            assert 字段.alias == 名, f"{模型.__name__}.{名} 的别名是 {字段.alias!r}"
            为替身 += 1
    assert 为替身 == 4, "带括号的列一共四列，改了这里也改一下这个数"

    # 构造一个看得见的实例，确认序列化出去真的是带括号的键。
    单 = schemas.Order(
        订单号="XL1", 会话ID="S1", 买家昵称="小鹿", 店铺="旗舰店",
        商品货号="A01", 商品名称="精华", 数量=1,
        单价元=299.0, 实付金额元=279.0,
        订单状态="已发货", 下单时间="", 付款时间="", 发货时间="",
        快递公司="", 物流单号="", 收货省="", 收货市="", 赠品="", 买家留言="",
    )
    线 = 单.model_dump()
    assert 线["单价(元)"] == 299.0
    assert 线["实付金额(元)"] == 279.0
    assert "单价元" not in 线, (
        "不带参数调 `model_dump()` 时走成了 Python 属性名 —— "
        "`serialize_by_alias=True` 没生效，前端会读到 undefined 而且不报错"
    )


def test_两种名字都能建起来() -> None:
    """`populate_by_name` —— 线上名和 Python 名都能用。

    线上名是给前端的，Python 名是给后端自己写代码的。禁掉后者，
    后端每次构造都得写 `**{"单价(元)": …}` 这种。
    """
    用别名 = schemas.Evidence(序号="①", 出处="口径表 K05", 摘要="x", 用上=True)
    assert 用别名.序号 is sources.六源.商品属性表


# ══════════════════════════════════════════════════════════
# 二 · 枚举从 rules import，不另抄一份
# ══════════════════════════════════════════════════════════

@pytest.mark.parametrize(
    ("模型", "字段名", "枚举"),
    [
        (schemas.Disposition, "输出", pipeline.输出类型),
        (schemas.安全事件条目, "类别", inbound.类别),
        (schemas.安全事件条目, "处置", inbound.处置),
        (schemas.触发条目, "编号", triggers.触发编号),
        (schemas.Evidence, "序号", sources.六源),
    ],
    ids=["输出", "类别", "处置", "触发编号", "六源"],
)
def test_枚举用的是规则层那个对象本身(模型: type, 字段名: str, 枚举: type) -> None:
    """**`is` 不是 `==`。**

    `==` 在「另抄一份、恰好值一样」时也过 —— 而那正是要拦的情况：
    两处各改各的，线上只会表现成其中一处对。`is` 才是在断言「就是同一个类」。
    """
    注解 = 模型.model_fields[字段名].annotation
    assert 注解 is 枚举, f"{模型.__name__}.{字段名} 的类型是 {注解}，应当是 {枚举}"


@pytest.mark.parametrize(
    ("ts名", "枚举"),
    [
        ("OutputKind", pipeline.输出类型),
        ("SenderRole", schemas.SenderRole),
        ("ContentType", schemas.ContentType),
        ("SessionStage", schemas.SessionStage),
        ("TicketKind", schemas.TicketKind),
        ("EvidenceSource", sources.六源),
    ],
)
def test_TS联合取值和后端枚举取值一致(ts名: str, 枚举: type) -> None:
    """前端把枚举写成了联合类型，后端是 `StrEnum` —— 取值集合必须相等。

    这条是真正跨语言的那一步：`SenderRole` 在 TS 里是字面量联合、在 Python 里
    是 `Literal`，两边没有共享的对象可以 `is`，只能比值。
    """
    ts = _联合(_源码(), ts名)
    后端 = {成员.value for 成员 in 枚举} if hasattr(枚举, "__members__") else set(枚举.__args__)
    assert 后端 == ts, f"{ts名} 对不上：后端多 {后端 - ts}，前端多 {ts - 后端}"


def test_主卡形态的三种取值和前端一致() -> None:
    """`Advice.形态` 是写在接口里的一行联合，得单独取。"""
    ts = _内联联合(_源码(), "Advice", "形态")
    后端 = set(get_args(schemas.Advice.model_fields["形态"].annotation))
    assert 后端 == ts


def test_工单并集两边成员一致() -> None:
    """`AnyTicket` 是五类的联合 —— TS 用 `|` 拼，Python 用 `|` 拼，成员要一样。"""
    ts = _并集成员(_源码(), "AnyTicket")
    后端 = {t.__name__ for t in get_args(schemas.AnyTicket)}
    assert 后端 == ts


# ══════════════════════════════════════════════════════════
# 三 · 两处刻意的结构性决定
# ══════════════════════════════════════════════════════════

def test_闸门命中和GuardHit是两个类型不合并() -> None:
    """一个是输出闸门 G1–G4 的命中，一个是口径表禁语。

    合并会丢掉 `可重生成` 和 `降级去向` —— 而 `降级去向` 是 G3「不许自动发，
    降为客服点发送」唯一的载体，丢了它前端只能说「被拦了」，说不出改判成什么。
    """
    assert set(schemas.闸门命中.model_fields) == {
        "闸门", "名称", "严重度", "详情", "证据", "建议", "可重生成", "降级去向",
    }
    assert set(schemas.GuardHit.model_fields) == {"禁语", "口径", "建议"}
    assert schemas.闸门命中 is not schemas.GuardHit


def test_判定响应顶层没有已代发() -> None:
    """已代发只在 `主卡.已代发` 一处。

    开发步骤 的样例响应顶层也写了一个 `已代发` —— 那是同一份数据传两遍，
    两份一旦不同步，右栏两处会显示不一样的内容，而**两处都看着对**。
    前端只在 `Advice` 里读它。
    """
    字段 = _线上字段(schemas.判定响应)
    assert "已代发" not in 字段
    assert "已代发" in _线上字段(schemas.Advice)


# ══════════════════════════════════════════════════════════
# 四 · 能真的建起来
# ══════════════════════════════════════════════════════════

def test_判定响应能构造出一个完整的样例() -> None:
    """把契约里每个模型都实例化一遍。

    形状对不对，上面那些字段名测试已经管了；这条管的是**能不能用** ——
    前向引用没解析、联合类型挑不出来、枚举值写错了一个字，都会在这里炸，
    而不是等到步骤 1 写路由的时候。
    """
    响应 = schemas.判定响应(
        会话ID="S00005",
        轮次=3,
        顾客情况=[
            schemas.StateRow(标签="这是谁", 值="新客 · 首次到店"),
            schemas.StateRow(
                标签="答应过什么",
                值="9/26 承诺「今天答复」",
                时限="2026-09-26T23:59:00",
                警示="已逾期 2 天",
            ),
        ],
        安全事件=[
            schemas.安全事件条目(
                类别=inbound.类别.PII,
                命中="138****8888",
                处置=inbound.处置.标记,
                说明="记一笔，照常走流程",
            )
        ],
        触发=[
            schemas.触发条目(
                编号=triggers.触发编号.H3,
                名称="承诺逾期",
                严重度="高",
                证据=["2026-09-26 23:59 承诺，已过 2 天"],
                说明="答应过的时间没兑现",
            )
        ],
        本轮处置=[
            schemas.Disposition(
                id="S00005-3-1",
                轮次=3,
                主张="逾期未答复",
                输出=pipeline.输出类型.报备,
                说明="H3 命中；开头必须先道歉",
                涉及个体差异=False,
                需边界句=False,
                层="硬触发",
                权限去向="",
                交接分类="",
            )
        ],
        主卡=schemas.Advice(
            形态="需要授权",
            判断="这次需要「授权」",
            标题="🔒 这事该办，我帮你走授权",
            说明=["需核实仓库是否已发"],
            依据=[
                schemas.Evidence(序号="②", 出处="口径表 K05", 摘要="需先核实漏发", 用上=True),
                schemas.Evidence(序号="①", 出处="商品属性表", 摘要="成分栏", 用上=False),
            ],
            已代发=[
                schemas.已代发条目(
                    内容="已经帮您登记好了",
                    署名="Primer 自动发送",
                    依据=[schemas.Evidence(序号="⑥", 出处="补发换货工单", 摘要="x", 用上=True)],
                )
            ],
        ),
        闸门=[
            schemas.闸门命中(
                闸门="G3",
                名称="来源可查",
                严重度="高",
                详情="引用的行号查不到",
                证据=["口径表 K99"],
                建议="改由客服点发送",
                可重生成=False,
                降级去向="客服点发送",
            )
        ],
    )

    # 走一遍序列化：这一步才会暴露 alias 配置、枚举编码这类只在线上出现的问题。
    线 = 响应.model_dump(mode="json")
    assert 线["本轮处置"][0]["输出"] == "报备"
    assert 线["触发"][0]["编号"] == "H3"
    assert 线["主卡"]["已代发"][0]["依据"][0]["序号"] == "⑥"
    assert 线["闸门"][0]["降级去向"] == "客服点发送"
    assert 线["顾客情况"][1]["时限"] == "2026-09-26T23:59:00"


def test_主卡可以是空的() -> None:
    """「AI直发」那一轮没有要客服动手的事，右栏只显示顾客情况。"""
    响应 = schemas.判定响应(
        会话ID="S1", 轮次=1, 顾客情况=[], 安全事件=[], 触发=[], 本轮处置=[], 主卡=None, 闸门=[]
    )
    assert 响应.model_dump()["主卡"] is None


def test_工单联合按字段挑得出来() -> None:
    """`TaggedTicket` 的 `ticket` 是五类联合，输入时靠字段重叠度挑。

    产出方向永远不带歧义（构造的是具体那个类），这条测的是**输入**方向 ——
    步骤 1 的装载器要从 JSON 反序列化出来，挑错了右栏就渲染错一套详情字段。
    """
    载荷 = {
        "工单号": "A-2311", "会话ID": "S1", "关联订单号": "XL1",
        "买家昵称": "小鹿", "店铺": "旗舰店", "处理人": "王", "创建时间": "", "完成时间": "",
        "问题类型": "丢件", "快递公司": "中通", "问题包裹物流单号": "ZT1", "发货仓": "上海仓",
        "订单实付(元)": 279.0, "处理方案": "补发", "收货省": "浙江", "收货市": "杭州",
        "工单状态": "处理中",
    }
    工单 = schemas.TaggedTicket(kind="物流", ticket=载荷)
    assert isinstance(工单.ticket, schemas.LogisticsTicket), (
        f"挑成了 {type(工单.ticket).__name__} —— 字段重叠度判断挑错了"
    )
    assert 工单.model_dump()["ticket"]["订单实付(元)"] == 279.0


def test_接口契约文档里的样例能通过校验() -> None:
    """`docs/接口契约.md` 里那段 fenced JSON，**是真的拿去解析的**。

    文档里的样例是「这套契约长什么样」唯一的可视化说明，也是前端接 mock 时
    抄的那一份。它一旦过期，读的人会照着一个后端根本不接受的形状写代码 ——
    而这件事没有任何别的东西会拦。

    所以把它拽进测试：改坏形状当场红，改字段名也能红（多一个少一个都会
    被 `判定响应` 拒掉，因为模型默认 `extra='ignore'`… 见下）。

    ⚠️ 这条测的是**样例本身合不合法**，不是「样例和 schemas 字段名一致」——
    后者由上面那组逐字段对应来管。
    """
    文档 = Path(__file__).resolve().parents[2] / "docs" / "接口契约.md"
    assert 文档.exists(), f"找不到 {文档}"

    文本 = 文档.read_text(encoding="utf-8")
    # 锚在标题上，不取「第一个 ```json」—— 文档里 `### 请求` 下面还有一段更小的
    # 请求体样例，抢在响应样例前面，取错了会拿 `{"会话ID": …, "轮次": 2}` 去校验。
    块 = re.search(r"### 完整样例\n.*?```json\n(.*?)\n```", 文本, re.S)
    assert 块 is not None, "`接口契约.md` 的「完整样例」那段 ```json 没了"

    样例 = json.loads(块.group(1))
    响应 = schemas.判定响应.model_validate(样例)

    # 解析得过还不够 —— 空对象也解析得过。钉住它确实装着东西。
    assert 响应.本轮处置, "样例里没有 `本轮处置`，那它就演不出右栏最要紧的那一块"
    assert 响应.主卡 is not None
    assert 响应.主卡.已代发, "样例丢了 `已代发` —— 那正是「偏离 1」在讲的那块"
    assert len(响应.顾客情况) == 5, "顾客情况是固定五行"
    assert 响应.闸门, "样例丢了 `闸门`，`降级去向` 就没地方露脸了"

    # 逐字对一遍线上键：解析用中文名，序列化也得吐中文名。
    线 = 响应.model_dump(mode="json")
    assert set(线) == set(样例), f"线上键和文档样例对不上：{set(线) ^ set(样例)}"


# ══════════════════════════════════════════════════════════
# 五 · 解析器自己
# ══════════════════════════════════════════════════════════

def test_解析器读得对() -> None:
    """给上面的测试兜底。

    解析器一旦静默读空（比如 TS 换了写法），所有字段名测试会**一起变成绿**
    —— 空集等于空集。所以先钉死它读得到东西。
    """
    源 = _源码()
    assert len(_字段(源, "Session")) >= 15
    assert len(_字段(源, "ReshipTicket")) > len(_字段(源, "TicketBase")), (
        "`extends` 没跟着取，子接口只剩公共列"
    )
    assert _字段(源, "TicketBase") <= _字段(源, "ReshipTicket"), "继承的字段没并进来"
    assert _内联联合(源, "Advice", "形态") == {"需要话术", "需要授权", "有风险"}
    assert _并集成员(源, "AnyTicket") == {
        "ReshipTicket", "PayoutTicket", "LogisticsTicket",
        "AdverseReactionTicket", "ReturnRefundTicket",
    }
