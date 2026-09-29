"""业务数据装载器 —— `业务数据.xlsx` → `schemas.Session[]`。

# 两层，为了能测

    `读工作簿`  xlsx  → `{工作表名: [行字典]}`      ← 碰文件系统
    `装成会话`  行字典 → `Session[]`                ← 纯函数

分开是因为这两类测试**会红的理由不一样**。`test_装载器.py` 测的是转换逻辑，
拿合成行跑，逻辑对就永远绿；`test_装载器_真数据.py` 钉的是那份赛题文件的几个
事实（138/113/80），**数据换版本它就该红**。

混在一起的话，赛题发个新版本，一堆本该稳定的逻辑测试跟着变红，红在哪条
全靠读名字分辨 —— 而真出问题时没人有耐心读名字。

# 一条贯穿全文件的约定：`None` → `""`

xlsx 的空单元格读出来是 `None`，契约里 `image_path` / `买家留言` 这些是 `str`
不是 `str | None`。转换只在 `_载荷` 一处做，别在下面各处零散地补 `or ""`。

**唯独 `消息序号` 例外**：它缺席时不该悄悄变成 `""` 再变成一个说不清的
int 解析错，所以在 `装成会话` 里先被 pydantic 挡一道。

# 判定产物一律留空

`顾客情况` / `建议` / `本轮处置` / `报备` / `转交` 是判定层算的，装载器
**一个都不填**。填了的话右栏会先显示一份装载器编的、再被判定结果覆盖 ——
两个来源，演示时哪一份在台上取决于谁后写。
"""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Iterable
from pathlib import Path
from typing import Any

import openpyxl

from ..api import schemas

聊天记录表 = "聊天记录"
订单表 = "订单"

#: 五张工单表 → 各自的模型类。**键是 xlsx 的工作表名**，也是
#: `schemas.TicketKind` 的取值（去掉「工单」后缀那一步在下面 `_类别`）。
#:
#: 这里直接映射到**具体类**而不是交给 `TaggedTicket.ticket` 那个联合去挑：
#: 工作表名已经告诉我们它是哪一类了，让 pydantic 按字段重叠度猜一遍是白担风险
#: （`schemas.TaggedTicket` 的文档串记着这个风险）。
工单表: dict[str, type[schemas.TicketBase]] = {
    "补发换货工单": schemas.ReshipTicket,
    "线下打款工单": schemas.PayoutTicket,
    "物流工单": schemas.LogisticsTicket,
    "不良反应工单": schemas.AdverseReactionTicket,
    "售后退货工单": schemas.ReturnRefundTicket,
}


class 业务数据缺失(FileNotFoundError):
    """业务数据文件不在。

    **启动时就该炸，不要降级成空列表。** 静默返回空列表会让 `GET /api/会话列表`
    返回 `[]` 且状态码 200 —— 那时候「前后端通了没有」这个问题的答案就变成
    假的：通了，只是没数据。
    """


def 读工作簿(路径: Path) -> dict[str, list[dict[str, Any]]]:
    """xlsx → `{工作表名: [行字典]}`，表头当键。"""
    if not 路径.exists():
        raise 业务数据缺失(
            f"找不到业务数据文件：{路径}\n"
            "默认那份在仓库根的 data/（`配置.默认业务数据`），所以缺了通常是"
            "两件事之一：文件被挪走或改了名，或者 `PRIMER_XLSX` 指到了一个"
            "不存在的路径。\n"
            "    set PRIMER_XLSX=D:\\path\\to\\赛题 1：数据共情者-业务数据(1).xlsx"
        )

    工作簿 = openpyxl.load_workbook(路径, read_only=True, data_only=True)
    try:
        return {表.title: _读表(表) for 表 in 工作簿.worksheets}
    finally:
        工作簿.close()


def _读表(工作表: Any) -> list[dict[str, Any]]:
    """一张工作表 → 行字典列表。第一行是表头，没有表头就是空表。"""
    行们: Iterable[tuple[Any, ...]] = 工作表.iter_rows(values_only=True)
    表头 = next(iter(行们), None)
    if 表头 is None:
        return []
    列名 = [str(名) for 名 in 表头 if 名 is not None]
    # `strict=False` 是刻意的：表头里有个空的尾列时，列名比行短一格，
    # 那一格就该被丢掉。`strict=True` 会为此抛异常，而这个异常说的是
    # 「长度不齐」，读的人得自己想到「哦是那个没名字的列」。
    return [dict(zip(列名, 行, strict=False)) for 行 in 行们]


def _载荷(模型: type[schemas.契约模型], 行: dict[str, Any]) -> dict[str, Any]:
    """行字典 → 构造模型的载荷。

    两条规则，都按**契约申报的类型**来，不按数据里看起来像什么：

    1. `None` → `""` —— 空单元格读出来是 `None`，而契约里这些列是 `str`
       不是 `str | None`。
    2. **契约说 `str` 的列，数字也转成字符串。** 这条是真数据逼出来的：
       `不良反应工单.年龄` 在 xlsx 里是 **int 30**，pydantic v2 默认不做
       int→str 转换，于是整次装载炸掉。而那是数据本来的样子，不是笔误 ——
       **xlsx 的单元格类型是 Excel 的产物，不是我们的约定**。

    第 2 条**只对 `str` 做**。`数量` / `单价(元)` 是 int/float，一刀切
    `str()` 会让前端拿到 `"1"` 再去做算术，那会静默变成字符串拼接。

    其余的交给 pydantic（`"30"` → int 它自己会转）；不在这里手工 `int()`，
    手工转会把「这一格是空的」变成一个 `ValueError`，丢掉是哪个会话哪一行。
    """
    文本列 = {
        字段.alias or 名
        for 名, 字段 in 模型.model_fields.items()
        if 字段.annotation is str
    }
    return {
        名: "" if 值 is None else (str(值) if 名 in 文本列 else 值)
        for 名, 值 in 行.items()
    }


def 装成会话(表: dict[str, list[dict[str, Any]]]) -> list[schemas.Session]:
    """`{工作表名: [行字典]}` → `Session[]`，按会话 ID 排序。

    缺表不报错（当空表）：真工作簿里五张工单表都在，但让缺表炸掉会让
    「这张表这次没数据」和「代码坏了」变成同一个报错，而排障时先要分辨的
    正是这个。
    """
    消息组: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for 行 in 表.get(聊天记录表, []):
        if 会话ID := 行.get("会话ID"):
            消息组[会话ID].append(行)

    订单索引 = {行["会话ID"]: 行 for 行 in 表.get(订单表, []) if 行.get("会话ID")}
    工单索引 = {
        行["会话ID"]: (表名, 行)
        for 表名 in 工单表
        for 行 in 表.get(表名, [])
        if 行.get("会话ID")
    }

    return [_装一个(会话ID, 消息组[会话ID], 订单索引, 工单索引) for 会话ID in sorted(消息组)]


def _装一个(
    会话ID: str,
    行们: list[dict[str, Any]],
    订单索引: dict[str, dict[str, Any]],
    工单索引: dict[str, tuple[str, dict[str, Any]]],
) -> schemas.Session:
    消息 = sorted(
        (schemas.ChatMessage(**_载荷(schemas.ChatMessage, 行)) for 行 in 行们),
        key=lambda 条: 条.消息序号,
    )
    最后 = 消息[-1]
    订单行 = 订单索引.get(会话ID)

    return schemas.Session(
        会话ID=会话ID,
        # 昵称和店铺取自消息而不是订单：138 个会话里有 25 个没有订单，
        # 从订单取会让这 25 个的昵称是空的。
        买家昵称=消息[0].买家昵称,
        店铺=消息[0].店铺,
        # xlsx 里没有工作台状态。先一律给「正在接待」，另外两个分组空着。
        #
        # **别改成按消息时间推**：数据跨度只有 17 天，演示用的 S00001–S00005
        # 全落在最早那天，按时间推会把它们整批判成「历史联系」。
        stage="正在接待",
        消息=消息,
        订单=schemas.Order(**_载荷(schemas.Order, 订单行)) if 订单行 else None,
        工单=_装工单(工单索引.get(会话ID)),
        摘要=最后.message_text,
        最近时间=最后.发送时间,
        未读=None,
    )


def _装工单(命中: tuple[str, dict[str, Any]] | None) -> schemas.TaggedTicket | None:
    if 命中 is None:
        return None
    表名, 行 = 命中
    模型类 = 工单表[表名]
    return schemas.TaggedTicket(
        kind=_类别(表名),
        ticket=模型类(**_载荷(模型类, 行)),
    )


def _类别(表名: str) -> schemas.TicketKind:
    """工作表名 → `TicketKind`。拿掉「工单」后缀，和 `schemas.TicketKind` 对齐。"""
    名 = 表名.removesuffix("工单")
    assert 名 in schemas.TicketKind.__args__, (  # type: ignore[attr-defined]
        f"工作表「{表名}」对不上 `TicketKind` 的取值 {schemas.TicketKind.__args__}，"  # type: ignore[attr-defined]
        "要么表名改了，要么枚举改了，两边得一起改"
    )
    return 名  # type: ignore[return-value]


class 装载器:
    """装载好的业务数据。**进程内只建一次**（`api/deps.py` 拿它当单例）。

    只读：它不提供任何写入方法，判定层要改状态得走别的路 —— 数据源是赛题给的
    xlsx，改在内存里既留不下痕，也会让下一次装载把它抹掉。
    """

    def __init__(self, 会话列表: list[schemas.Session]) -> None:
        self.会话列表 = 会话列表
        self._索引 = {会话.会话ID: 会话 for 会话 in 会话列表}

    @classmethod
    def 从表(cls, 表: dict[str, list[dict[str, Any]]]) -> 装载器:
        """测试入口 —— 不碰文件系统。"""
        return cls(装成会话(表))

    @classmethod
    def 从文件(cls, 路径: Path) -> 装载器:
        return cls(装成会话(读工作簿(路径)))

    def 找(self, 会话ID: str) -> schemas.Session | None:
        """查一个会话。查不到返回 `None`，**由路由层决定这是不是 404**。

        返回的是列表里那**同一个对象**而不是副本：会话在判定流程里会被补上
        `顾客情况` / `建议`，两个引用指向两份数据的话，右栏显示哪一份取决于
        谁后写。
        """
        return self._索引.get(会话ID)
