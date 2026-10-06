"""一个 OpenAI 兼容 client，打通所有国内厂商 —— 换模型只改环境变量。

`pyproject.toml` 的依赖注释里就是这么写的：**不装各家的 SDK**，
一个 `openai` 包 ＋ 三个环境变量（密钥／地址／模型名）覆盖全部。
换供应商时改的是配置，不是代码。

    PRIMER_LLM_KEY     密钥。留空则回头找 `DASHSCOPE_API_KEY`
    PRIMER_LLM_BASE_URL  OpenAI 兼容端点。默认阿里云百炼
    PRIMER_LLM_MODEL     模型名。默认 `qwen-plus`

**密钥只从环境变量读，不写进任何文件。** 这不是洁癖：这个仓库要交出去，
密钥一旦进了代码或 `.env` 就是一次泄露，而它不会被测试发现。

`话术生成` 和 `拆需求` 各有一套（三个变量，各自回退到上面那份）
============================================================

    PRIMER_LLM_MODEL_话术生成      PRIMER_LLM_MODEL_需求分解
    PRIMER_LLM_BASE_URL_话术生成   PRIMER_LLM_BASE_URL_需求分解
    PRIMER_LLM_KEY_话术生成        PRIMER_LLM_KEY_需求分解

2026-10-02 起，`话术生成` 能单独选型（`docs/工单交接_给模型线_C.md` §三）。理由：
别的位干的是分类和切分，只有它是**写作文**；而且它一条主张一次、一稿最多
`话术生成.最多调用` 次，是花钱最多的那个。

2026-10-04 起 `拆需求` 也能（右栏「这次要什么」那一行由它拆）。理由和上面那个
**恰好相反**：它不是贵，是**频率** —— 前端每点开一个窗口就问它一次。想换成
便宜货／快模型压这一路的开销，改这三个变量，别的位一个字不动。

⚠️ **三个都不设时，行为和没有这套变量时逐字相同** —— 演示当天没人会去设它们，
**没设的那条路就是演示走的那条路**，这条有 `tests/test_选型.py` 钉着。
所以别把 `默认模型` 改成「话术生成专用」的什么东西。

⚠️ 变量名带中文，是这个仓库的命名习惯（模型位就叫 `话术生成`）。**代价是
Windows 的 `cmd.exe` 在非 UTF-8 代码页下不好设** —— 演示用的 Git Bash 没这个问题。

嵌入（`先例库`）
================

    PRIMER_LLM_MODEL_先例库    **默认 `text-embedding-v4`**
    PRIMER_LLM_BASE_URL_先例库
    PRIMER_LLM_KEY_先例库

⚠️ **只有模型那条的回退不是全局。** 另外几个位不设时都落到 `qwen-plus`，而聊天
端点不认嵌入模型名、嵌入端点也不认 `qwen-plus`。密钥和地址照旧回退（同一家厂商、
同一把钥匙），只有模型是**各管各的默认值**，见 `先例库模型`。

真实调用 vs 假模型
==================

`问模型` / `问JSON` 是**唯一**碰网络的地方。`认口径` 和 `拆主张` 把它们的
引用当参数收（`问=`），所以测试里那条路整条走不到。这个分法和
`rules/triggers.H2情绪` 的 `认不信任函数` 是同一条：**签名留着，换实现不动调用方。**

调用记录（`记录钩子`）
======================

留痕（步骤 6）要存「模型调用的原始 prompt 和返回」。`记录钩子` 就是那个口子：
**不设时是 `None`，`_问` 的行为逐字不变**（多出来的只有四行收尾）。

⚠️ **这里只承诺「一次完整调用记下来了」，不承诺「可重放」。** 同一个提示问两次
可以给两个答案，`temperature=0` 也不是确定性保证（见 `_问` 里的实测记录）。
可重放的范围到 `rules.pipeline.切轮` 为止，别把这两件事说成一件事。

⚠️ **`llm/` 不许反向 import `api/`。** 所以这里只留一个 `Callable` 口子，
「收下来存进留痕」是装配层接线的事（`api/留痕.接模型钩子`）。
"""

from __future__ import annotations

import logging
import os
from collections.abc import Callable, Sequence
from contextvars import ContextVar
from dataclasses import dataclass
from functools import lru_cache

from openai import OpenAI

#: 默认端点：阿里云百炼的 OpenAI 兼容模式。冒烟过 —— `qwen-plus` 打得通。
默认地址 = "https://dashscope.aliyuncs.com/compatible-mode/v1"

#: 默认模型。挑它的理由：够便宜、够快，而**除了 `话术生成` 之外的三个位**
#: 要的都是**分类**和**切分**，不是写作文。真上线换个大的，改环境变量就行。
#:
#: ⚠️ **`话术生成` 也在用它 —— 这仍然是刻意的。** 它自己那套变量不设时
#: 就落到这儿（见 `话术生成模型`）。「它单独可配」不等于「它默认换个模型」：
#: 换个默认值会把没配过的地方的行为一起改掉，而那正是要避免的。
默认模型 = "qwen-plus"

#: 没设 `PRIMER_LLM_KEY` 时回头找这个 —— 环境里本来就有它。
默认密钥变量 = "DASHSCOPE_API_KEY"

#: `话术生成` 那套。三个变量各自回退到上面那份 —— 见模块文档串。
话术生成模型变量 = "PRIMER_LLM_MODEL_话术生成"
话术生成地址变量 = "PRIMER_LLM_BASE_URL_话术生成"
话术生成密钥变量 = "PRIMER_LLM_KEY_话术生成"

#: `拆需求` 那套。同样各自回退 —— 见模块文档串（那边单独可配的理由是**频率**）。
需求分解模型变量 = "PRIMER_LLM_MODEL_需求分解"
需求分解地址变量 = "PRIMER_LLM_BASE_URL_需求分解"
需求分解密钥变量 = "PRIMER_LLM_KEY_需求分解"

#: 嵌入那份。`检索/先例库.py` 用（读侧召回 ＋ 重建时嵌全库）。
默认嵌入模型 = "text-embedding-v4"

#: 一次请求最多嵌几条。**10 是服务端硬上限**，超了报
#: `batch size is invalid, it should not be larger than 10`（2026-10-05 实测）。
嵌入批 = 10

先例库模型变量 = "PRIMER_LLM_MODEL_先例库"
先例库地址变量 = "PRIMER_LLM_BASE_URL_先例库"
先例库密钥变量 = "PRIMER_LLM_KEY_先例库"

#: 「问一次」的形状：提示 ＋ 系统提示 → 模型回答的纯文本。
#:
#: 定义成两参数是为了让 `问模型` 和 `问JSON` 共用一个口子 ——
#: 假模型写一个两参数函数就能同时顶替两个，不用管 JSON 模式那些细节。
问答函数 = Callable[[str, str], str]


@dataclass(frozen=True, slots=True)
class 模型调用:
    """一次真实调用的完整记录。**留痕的 `模型调用[]` 就是这个形状。**

    存的是**发出去的原文和收回来的原文**，不是摘要 —— 「这一轮为什么这么判」
    最后争的往往就是提示里那几个字（第几层、给没给依据），摘要把争的那部分
    正好抹掉。

    ⚠️ **「原文」的那份不进留痕 —— 留痕里是脱敏过的那一份。** 这里是记录钩子
    的入参，谁接钩子谁决定存什么：`留痕.收模型调用` 会把它整棵洗过一遍
    （手机号打成 `138****8000`），所以**拿留痕去复现「模型看见了什么」，
    看见的是脱敏版**，和真发出去的那串差着几个星号。
    这是有意的（留痕是长期材料），但别把留痕里那份说成「逐字就是发出去的」。
    """

    位: str
    """拆主张／认口径／查六源／生成话术／认诉求／认权限／需求分解。

    ⚠️ **空串 ＝ 这一路没接记录钩子**（测试装配就是这样）。`_问` 自己不知道
    它替哪一位问的 —— 六个位都从这一个口子过，位名是**装配层**给的，
    见 `当前模型位`。
    """
    模型: str
    系统: str
    提示: str
    回答: str
    要JSON: bool
    输入token: int | None = None
    """`回应.usage.prompt_tokens`。**顺路捞的，不是验收项** ——
    厂商不给就是 `None`（步骤 7.3「成本实测」要它，本步只负责记下来）。"""
    输出token: int | None = None


#: 当前这次调用属于哪个模型位。**由装配层设，不由 `_问` 猜。**
#:
#: ⚠️ **用 `ContextVar` 不用模块变量**：判定路由是 `sync def`，跑在 Starlette 的
#: 线程池里 —— 模块变量会被两个并发请求串台，而串台的后果是留痕里
#: 「位」记成另一个请求的，两处都看着对。
#:
#: ⚠️ **不从调用栈上取调用方名字**：那种做法在函数改名之后静默记成空串，
#: 而空串在这套口径里是合法值（＝没接钩子），所以错了也看不出来。
当前模型位: ContextVar[str] = ContextVar("当前模型位", default="")

#: 收下每一次调用的口子。**`None` ＝ 不记录，`_问` 行为逐字不变。**
#:
#: 装配层给它接上 `api/留痕.收模型调用`（`main.启动装配`）；测试走
#: `ASGITransport` **不触发 lifespan**，所以测试里它一直是 `None` —— 正是要的。
#: 单测要测记录时自己设，测完 `finally` 摘掉。
记录钩子: Callable[[模型调用], None] | None = None

#: 记不上时要说一声。**静默吞掉和「这一路本来就没接钩子」长得一样** ——
#: 而后者是合法常态（测试装配就是），所以不留一句话就查不出来。
#: 理由同 `检索/先例库.py` 那个 `日志`。
日志 = logging.getLogger(__name__)


class LLM不可用(RuntimeError):
    """够不着模型。网络断了、密钥没了、厂商 5xx 都归这一类。

    **包一层而不是把原始异常放出去**，是为了让调用方能只 catch 这一种
    —— 见 `认口径` 和 `拆主张` 的兜底：它们要的是「模型不可用 → 退到保守答案」，
    不是「任何错都吞掉」。
    """


def 取密钥() -> str:
    return os.environ.get("PRIMER_LLM_KEY") or os.environ.get(默认密钥变量, "")


def 取地址() -> str:
    return os.environ.get("PRIMER_LLM_BASE_URL") or 默认地址


def 取模型() -> str:
    return os.environ.get("PRIMER_LLM_MODEL") or 默认模型


def 话术生成模型() -> str:
    """`话术生成` 那份模型名。没单独设就跟着全局走。"""
    return os.environ.get(话术生成模型变量) or 取模型()


def 话术生成地址() -> str:
    return os.environ.get(话术生成地址变量) or 取地址()


def 话术生成密钥() -> str:
    return os.environ.get(话术生成密钥变量) or 取密钥()


def 需求分解模型() -> str:
    """`拆需求` 那份模型名。没单独设就跟着全局走。"""
    return os.environ.get(需求分解模型变量) or 取模型()


def 需求分解地址() -> str:
    return os.environ.get(需求分解地址变量) or 取地址()


def 需求分解密钥() -> str:
    return os.environ.get(需求分解密钥变量) or 取密钥()


def 先例库模型() -> str:
    """嵌入那份模型名。**默认不跟着全局走**（见模块文档串），要换只改这三个变量。"""
    return os.environ.get(先例库模型变量) or 默认嵌入模型


def 先例库地址() -> str:
    return os.environ.get(先例库地址变量) or 取地址()


def 先例库密钥() -> str:
    return os.environ.get(先例库密钥变量) or 取密钥()


@lru_cache(maxsize=8)
def _客户端(地址: str, 密钥: str) -> OpenAI:
    """client 单例，**按（地址，密钥）各一个**。

    建一次就够 —— 它自带连接池，每问一次建一个会白白多握几次手。
    缓存按参数分：`话术生成` 配了别的端点／密钥时要用另一个 client，
    共用一个会把请求发到错的地址去（而那种错表现为「模型答得驴唇不对马嘴」，
    不像一个连接错误）。

    `max_retries` 用 SDK 的默认值（2 次）。**不自己写重试**：SDK 那边退避和
    幂等判断都是现成的，自己叠一层的结果是重试次数相乘。
    """
    if not 密钥:
        raise LLM不可用(
            f"没读到密钥。设 PRIMER_LLM_KEY，或设 {默认密钥变量}（默认找它）。"
        )
    return OpenAI(api_key=密钥, base_url=地址)


def 嵌文本(
    文本们: Sequence[str],
    *,
    模型: str | None = None,
    地址: str | None = None,
    密钥: str | None = None,
) -> list[list[float]]:
    """一批文本 → 一批向量，**顺序与入参一致**。

    `嵌入批` 片切是服务端要求；`sorted(..., key=index)` 是**必须的**：批量接口
    不保证返回顺序，按到达顺序配对是静默错位 —— 向量和句子对不上，召回全靠运气，
    而且不报错。片内顺序由我们拼，片间顺序由循环拼。
    """
    if not 文本们:
        return []
    用模型 = 模型 or 先例库模型()
    客户端_ = _客户端(地址 or 先例库地址(), 密钥 or 先例库密钥())
    出: list[list[float]] = []
    for i in range(0, len(文本们), 嵌入批):
        片 = list(文本们[i : i + 嵌入批])
        try:
            回应 = 客户端_.embeddings.create(model=用模型, input=片)
        except LLM不可用:
            raise
        except Exception as 错:  # noqa: BLE001 —— 和 `_问` 同一条：包一层好让调用方只 catch 一种
            raise LLM不可用(f"嵌 {用模型} 失败：{错}") from 错
        出.extend(d.embedding for d in sorted(回应.data, key=lambda d: d.index))
    return 出


def 问模型(
    提示: str,
    系统: str = "",
    *,
    模型: str | None = None,
    地址: str | None = None,
    密钥: str | None = None,
) -> str:
    """问一个来回，返回纯文本。

    三个关键字参数都留 `None` ＝ 用全局那套（`取模型` / `取地址` / `取密钥`），
    所以 `问答函数 = Callable[[str, str], str]` 这个形状没变 —— 两参数的
    调用和以前逐字相同，`假模型` 照样顶得上。

    **要分家的位（目前只有 `话术生成`）从这里传自己那套。** 三样要一起给：
    `_客户端` 是按（地址，密钥）缓存的，只换密钥不换地址等于拿别家的钥匙
    去敲这家的门，报出来的是「密钥无效」，离真正的错很远。
    """
    return _问(提示, 系统, 要JSON=False, 模型=模型, 地址=地址, 密钥=密钥)


def 问JSON(
    提示: str,
    系统: str = "",
    *,
    模型: str | None = None,
    地址: str | None = None,
    密钥: str | None = None,
) -> str:
    """同上，但让模型**只回一个 JSON 对象**。

    `response_format={'type': 'json_object'}` 是这个端点实际支持的（冒烟过）。
    它约束的是「回一个合法 JSON」而不是「回我们要的字段」——
    字段对不对由调用方自己校验，见 `拆主张._解析`。
    """
    return _问(提示, 系统, 要JSON=True, 模型=模型, 地址=地址, 密钥=密钥)


def _问(
    提示: str,
    系统: str,
    *,
    要JSON: bool,
    模型: str | None = None,
    地址: str | None = None,
    密钥: str | None = None,
) -> str:
    用模型 = 模型 or 取模型()
    用地址 = 地址 or 取地址()
    消息: list[dict[str, str]] = []
    if 系统:
        消息.append({"role": "system", "content": 系统})
    消息.append({"role": "user", "content": 提示})

    try:
        回应 = _客户端(用地址, 密钥 or 取密钥()).chat.completions.create(
            model=用模型,
            messages=消息,  # type: ignore[arg-type]
            # **temperature=0：这几个位置要的都是稳定，不是文采** ——
            # 分类、切分自不必说；`话术生成` 也是（它写的是客服话术，
            # 要的是别跑偏，不是发挥）。
            #
            # 它不是「确定性」的保证（厂商侧的采样和批处理照样能让两次不同），
            # 只是把随机性压到最低。2026-10-02 实测：同一批 8 条各跑两次，
            # 结果逐条一致 —— **是观察，不是承诺**。
            temperature=0,
            **({"response_format": {"type": "json_object"}} if 要JSON else {}),
        )
    except LLM不可用:
        raise
    except Exception as 错:  # noqa: BLE001 —— 见 LLM不可用 的文档串
        raise LLM不可用(f"问 {用模型} 失败：{错}") from 错

    回答 = 回应.choices[0].message.content or ""

    # ── 调用记录（留痕，步骤 6）────────────────────────────────
    # 整段包在 try 里：**留痕是旁路，它出任何错都不该让一次成功的模型调用
    # 变成 500**。代价是这条路上的问题在接口上看不见，所以失败要留一句日志。
    #
    # `usage` 拿 `getattr` 取：这个端点给，别的兼容端点不一定给 ——
    # 少两个 token 数不该让这一次调用记不上（那两格本来就不是验收项）。
    收 = 记录钩子
    if 收 is not None:
        try:
            用量 = getattr(回应, "usage", None)
            收(
                模型调用(
                    位=当前模型位.get(),
                    模型=用模型,
                    系统=系统,
                    提示=提示,
                    回答=回答,
                    要JSON=要JSON,
                    输入token=getattr(用量, "prompt_tokens", None),
                    输出token=getattr(用量, "completion_tokens", None),
                )
            )
        except Exception as 错:  # noqa: BLE001 —— 见上：不许连坐
            日志.warning("模型调用没能记进留痕（%s）：%r", 用模型, 错)

    return 回答
