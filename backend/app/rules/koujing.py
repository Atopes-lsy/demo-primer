"""口径表加载与禁语扫描。

数据在仓库根的 `data/koujing.json`，前端 `src/data/koujing.ts` 读的是同一份 ——
闸门 G1（这里）和输入框确认条（前端）必须按同一张表判定，各存一份迟早漂移。
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

#: 仓库根。本文件在 `backend/app/rules/` 下，往上四层。
仓库根 = Path(__file__).resolve().parents[3]
默认数据路径 = 仓库根 / "data" / "koujing.json"

#: 严重度权重。数值小的先判，让「高」压过「低」。
#: 前端 `扫描顺序` 用的是同一套权重，两边必须一致。
严重度权重 = {"高": 0, "中": 1, "低": 2}


@dataclass(frozen=True, slots=True)
class 口径条目:
    编号: str
    话题: str
    严重度: str
    可以说: str
    """公司允许说到哪一步。话术生成的上界。"""
    禁语: tuple[str, ...]
    """字面词，子串扫描。"""
    禁语模式: tuple[str, ...]
    """正则，给「保证X天到账」这类带占位符的写法用。"""
    备注: str
    """原表里跟在禁语后面的括号说明。不参与扫描，但别丢 —— 它是那条禁语的适用条件。"""
    标准话术: str


@dataclass(frozen=True, slots=True)
class 禁语命中:
    禁语: str
    口径: str
    严重度: str
    建议: str
    """建议改成什么。一键替换用。"""

    def __str__(self) -> str:
        return f"「{self.禁语}」（口径表 {self.口径} · {self.严重度}）"


@dataclass(frozen=True, slots=True)
class 口径表数据:
    口径表: tuple[口径条目, ...]
    补充禁语: tuple[dict[str, str], ...]
    替换说法: dict[str, str]
    元数据: dict[str, object]

    def 取(self, 编号: str) -> 口径条目 | None:
        return next((k for k in self.口径表 if k.编号 == 编号), None)

    def 待核对数字(self) -> set[str]:
        """业务方还没确认的数字。闸门 G3 遇到它们时不能放行。

        见 `guards.G3来源可查` 的 `待核对` 参数 —— 用一张自己标着「待改错」
        的表给数字背书，等于闸门在为一个没人确认过的数担保。
        """
        return {
            str(x["值"])
            for x in self.元数据.get("待核对") or ()
            if isinstance(x, dict) and x.get("值")
        }


class 口径表自相矛盾(ValueError):
    """「可以说」里含禁语 —— 数据本身讲不通，不是调用方能兜住的。"""


def 校验互斥(数据: 口径表数据) -> list[str]:
    """查「可以说」是否含禁语，返回违规说明（空列表表示干净）。

    **为什么这是硬约束而不是提醒。** 「可以说」的定位是「公司允许说到哪一步」，
    话术生成拿它当上界 —— 模型照着上界写。上界里含禁语的话，模型按规则办事
    反而会踩中自己的雷，生成侧再怎么调都救不回来。

    K09 原来就是这样：「可以说」里写着【保证100%正品】，同一个词又在补充禁语里
    按高危拦。原表就这么写的，不是录入错误 —— 所以这条校验必须常驻，
    否则换一份口径表又会漂回来。

    三类都要查：编号条目的禁语、禁语模式（正则），以及补充禁语。
    """
    违规: list[str] = []

    # 补充禁语先收成一份「词 → 口径」的表，报错时要能说清是撞上哪一条。
    红线: list[tuple[str, str]] = []
    for k in 数据.口径表:
        for w in k.禁语:
            红线.append((w, k.编号))
    for s in 数据.补充禁语:
        红线.append((s["禁语"], s["口径"]))

    for k in 数据.口径表:
        上界 = k.可以说
        for 词, 口径 in 红线:
            # 自己条目里的禁语不算自相矛盾吗？算。「可以说」是给人看的完整表述，
            # 里面有禁语就是有，不因为同属一条就放行。
            if 词 in 上界:
                违规.append(f"{k.编号} 的「可以说」含禁语「{词}」（来自 {口径}）")

        for 源 in k.禁语模式:
            m = re.search(源, 上界)
            if m:
                违规.append(f"{k.编号} 的「可以说」命中禁语模式「{m.group(0)}」（来自 {k.编号}）")

    return 违规


@lru_cache(maxsize=1)
def _加载(路径: str | None = None) -> 口径表数据:
    raw = json.loads(Path(路径 or 默认数据路径).read_text(encoding="utf-8"))

    条目 = tuple(
        sorted(
            (
                口径条目(
                    编号=k["编号"],
                    话题=k["话题"],
                    严重度=k["严重度"],
                    可以说=k["可以说"],
                    禁语=tuple(k["禁语"]),
                    禁语模式=tuple(k.get("禁语模式") or ()),
                    备注=k.get("备注", ""),
                    标准话术=k["标准话术"],
                )
                for k in raw["口径表"]
            ),
            # 按严重度排，同级比编号 —— 顺序必须稳定，否则前端提示和后端留痕
            # 可能报出不同的词。理由见 查禁语 的文档串。
            key=lambda k: (严重度权重.get(k.严重度, 9), k.编号),
        )
    )

    数据 = 口径表数据(
        口径表=条目,
        补充禁语=tuple(raw.get("补充禁语") or ()),
        替换说法=raw.get("替换说法") or {},
        元数据=raw.get("元数据") or {},
    )

    # 加载即校验，且是抛错不是警告 —— 口径表是全流程唯一的真源，
    # 它自相矛盾的话，生成侧和闸门侧会同时错，而且错得互相抵消（见 校验互斥）。
    if 违规 := 校验互斥(数据):
        raise 口径表自相矛盾(
            "口径表的「可以说」里含禁语，生成话术的上界不合法：\n  - "
            + "\n  - ".join(违规)
            + "\n（要么把「可以说」里的词换掉，要么把它从禁语里删掉）"
        )

    return 数据


def 加载口径表(路径: str | None = None) -> 口径表数据:
    """读口径表。`路径` 留空则用仓库根的 `data/koujing.json`。"""
    return _加载(路径)


def _建议(数据: 口径表数据, 禁语: str, 兜底: str) -> str:
    return 数据.替换说法.get(禁语) or 兜底


def 查禁语(text: str, 路径: str | None = None) -> 禁语命中 | None:
    """扫描一段文字命中的**第一条**禁语，供前端输入框确认条使用。

    按严重度从高到低扫，不是按编号 —— 原实现按 K01→K20 顺序返回，那样
    K19「绝对适合你」会盖过 K01「孕妇可以用」。同一句话命中两条时，
    该报的是更严重的那个。

    后端闸门要的是完整清单，用 `查禁语全`。
    """
    return next(iter(查禁语全(text, 路径)), None)


def 查禁语全(text: str, 路径: str | None = None) -> list[禁语命中]:
    """扫描一段文字命中的**全部**禁语，按严重度降序。

    闸门 G1 用这个：留痕要记下这一句到底踩了几条口径，不能只记第一条就完事。
    """
    数据 = _加载(路径)
    命中: list[禁语命中] = []
    已记: set[str] = set()

    for k in 数据.口径表:
        for word in k.禁语:
            if word in text and word not in 已记:
                已记.add(word)
                命中.append(
                    禁语命中(
                        禁语=word,
                        口径=k.编号,
                        严重度=k.严重度,
                        建议=_建议(数据, word, k.可以说),
                    )
                )

        for 源 in k.禁语模式:
            m = re.search(源, text)
            if m and m.group(0) not in 已记:
                已记.add(m.group(0))
                命中.append(
                    禁语命中(
                        禁语=m.group(0),
                        口径=k.编号,
                        严重度=k.严重度,
                        建议=_建议(数据, m.group(0), k.可以说),
                    )
                )

    # 补充禁语排在最后：它们是口径表没单列、按更严标准补上的词，
    # 所以同一条文字里也优先级最低（前面已经按严重度排好了）。
    for s in 数据.补充禁语:
        if s["禁语"] in text and s["禁语"] not in 已记:
            已记.add(s["禁语"])
            命中.append(
                禁语命中(禁语=s["禁语"], 口径=s["口径"], 严重度="高", 建议=s["建议"])
            )

    return 命中
