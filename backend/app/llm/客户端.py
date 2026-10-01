"""一个 OpenAI 兼容 client，打通所有国内厂商 —— 换模型只改环境变量。

`pyproject.toml` 的依赖注释里就是这么写的：**不装各家的 SDK**，
一个 `openai` 包 ＋ 三个环境变量（密钥／地址／模型名）覆盖全部。
换供应商时改的是配置，不是代码。

    PRIMER_LLM_KEY     密钥。留空则回头找 `DASHSCOPE_API_KEY`
    PRIMER_LLM_BASE_URL  OpenAI 兼容端点。默认阿里云百炼
    PRIMER_LLM_MODEL     模型名。默认 `qwen-plus`

**密钥只从环境变量读，不写进任何文件。** 这不是洁癖：这个仓库要交出去，
密钥一旦进了代码或 `.env` 就是一次泄露，而它不会被测试发现。

真实调用 vs 假模型
==================

`问模型` / `问JSON` 是**唯一**碰网络的地方。`认口径` 和 `拆主张` 把它们的
引用当参数收（`问=`），所以测试里那条路整条走不到。这个分法和
`rules/triggers.H2情绪` 的 `认不信任函数` 是同一条：**签名留着，换实现不动调用方。**
"""

from __future__ import annotations

import os
from collections.abc import Callable
from functools import lru_cache

from openai import OpenAI

#: 默认端点：阿里云百炼的 OpenAI 兼容模式。冒烟过 —— `qwen-plus` 打得通。
默认地址 = "https://dashscope.aliyuncs.com/compatible-mode/v1"

#: 默认模型。挑它的理由：够便宜、够快，而这两个模型位要的都是**分类**和
#: **切分**，不是写作文。真上线换个大的，改环境变量就行。
默认模型 = "qwen-plus"

#: 没设 `PRIMER_LLM_KEY` 时回头找这个 —— 环境里本来就有它。
默认密钥变量 = "DASHSCOPE_API_KEY"

#: 「问一次」的形状：提示 ＋ 系统提示 → 模型回答的纯文本。
#:
#: 定义成两参数是为了让 `问模型` 和 `问JSON` 共用一个口子 ——
#: 假模型写一个两参数函数就能同时顶替两个，不用管 JSON 模式那些细节。
问答函数 = Callable[[str, str], str]


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


@lru_cache(maxsize=1)
def _客户端() -> OpenAI:
    """client 单例。建一次就够 —— 它自带连接池，每问一次建一个会白白多握几次手。

    `max_retries` 用 SDK 的默认值（2 次）。**不自己写重试**：SDK 那边退避和
    幂等判断都是现成的，自己叠一层的结果是重试次数相乘。
    """
    密钥 = 取密钥()
    if not 密钥:
        raise LLM不可用(
            f"没读到密钥。设 PRIMER_LLM_KEY，或设 {默认密钥变量}（默认找它）。"
        )
    return OpenAI(api_key=密钥, base_url=取地址())


def 问模型(提示: str, 系统: str = "") -> str:
    """问一个来回，返回纯文本。"""
    return _问(提示, 系统, 要JSON=False)


def 问JSON(提示: str, 系统: str = "") -> str:
    """同上，但让模型**只回一个 JSON 对象**。

    `response_format={'type': 'json_object'}` 是这个端点实际支持的（冒烟过）。
    它约束的是「回一个合法 JSON」而不是「回我们要的字段」——
    字段对不对由调用方自己校验，见 `拆主张._解析`。
    """
    return _问(提示, 系统, 要JSON=True)


def _问(提示: str, 系统: str, *, 要JSON: bool) -> str:
    消息: list[dict[str, str]] = []
    if 系统:
        消息.append({"role": "system", "content": 系统})
    消息.append({"role": "user", "content": 提示})

    try:
        回应 = _客户端().chat.completions.create(
            model=取模型(),
            messages=消息,  # type: ignore[arg-type]
            # **temperature=0：这两个位置要的是稳定，不是文采。**
            # 它不是「确定性」的保证（厂商侧的采样和批处理照样能让两次不同），
            # 只是把随机性压到最低 —— 识别和切分没有任何需要发挥的地方。
            temperature=0,
            **({"response_format": {"type": "json_object"}} if 要JSON else {}),
        )
    except LLM不可用:
        raise
    except Exception as 错:  # noqa: BLE001 —— 见 LLM不可用 的文档串
        raise LLM不可用(f"问 {取模型()} 失败：{错}") from 错

    return 回应.choices[0].message.content or ""
