"""嵌入位 —— `检索/先例库.py` 的读侧召回和重建都走它。

# 三条要钉的

1. **模型默认不是 `qwen-plus`。** 别的位不设时都落 `取模型()`，而嵌入端点不认
   那个名字；跟着落的话报出来的是「模型不存在」，错在 `先例库` 里、离这儿很远。
2. **按 10 片切。** 服务端硬上限，超了报
   `batch size is invalid, it should not be larger than 10`（2026-10-05 实测）。
3. **顺序按 `index` 排回来。** 批量接口不保证顺序，按返回顺序配对是**静默**错位
   —— 向量和句子对不上，召回全靠运气，而且不报错。
"""

from __future__ import annotations

import pytest

from app.llm import 客户端
from app.llm.客户端 import LLM不可用


class _假条目:
    def __init__(self, index: int, embedding: list[float]) -> None:
        self.index = index
        self.embedding = embedding


class _假回应:
    def __init__(self, data: list[_假条目]) -> None:
        self.data = data


class _假嵌入端点:
    """记下每次调用的 `(model, input)`，**倒着**回一批向量。

    倒着回是有意的：调用方不按 `index` 排回来就会被这条测试抓住。
    """

    def __init__(self) -> None:
        self.调用: list[tuple[str, list[str]]] = []
        # 真客户端的形状是 `client.embeddings.create(...)`（openai 2.15.0 实测），
        # 所以假端点得顶在 `embeddings` 那一层；`create` 原样不动。
        self.embeddings = self

    def create(self, *, model: str, input: list[str]) -> _假回应:
        self.调用.append((model, list(input)))
        return _假回应(
            [
                _假条目(index=i, embedding=[float(i)])
                for i, _ in reversed(list(enumerate(input)))
            ]
        )


@pytest.fixture
def 假端点(monkeypatch: pytest.MonkeyPatch) -> _假嵌入端点:
    端点 = _假嵌入端点()
    monkeypatch.setattr(客户端, "_客户端", lambda 地址, 密钥: 端点)
    return 端点


def test_嵌入模型默认不是聊天模型(monkeypatch: pytest.MonkeyPatch) -> None:
    """全局模型换成别的，嵌入那份**一点都不动** —— 它默认就是 `text-embedding-v4`。"""
    monkeypatch.setenv("PRIMER_LLM_MODEL", "别的模型")
    assert 客户端.取模型() == "别的模型"
    assert 客户端.先例库模型() == "text-embedding-v4"
    assert 客户端.默认嵌入模型 == "text-embedding-v4"


def test_密钥和地址照旧跟着全局走(monkeypatch: pytest.MonkeyPatch) -> None:
    """只有模型那条的回退不是全局 —— 密钥和地址是同一家厂商同一把。"""
    monkeypatch.setenv("PRIMER_LLM_KEY", "全局密钥")
    monkeypatch.setenv("PRIMER_LLM_BASE_URL", "https://别处")
    assert 客户端.先例库密钥() == "全局密钥"
    assert 客户端.先例库地址() == "https://别处"


def test_单独设了就用自己那份(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PRIMER_LLM_MODEL_先例库", "自选嵌入模型")
    monkeypatch.setenv("PRIMER_LLM_KEY_先例库", "自己的密钥")
    assert 客户端.先例库模型() == "自选嵌入模型"
    assert 客户端.先例库密钥() == "自己的密钥"


def test_按十片切且顺序对得上(假端点: _假嵌入端点) -> None:
    出 = 客户端.嵌文本([f"第{i}句" for i in range(25)])
    assert [len(片) for _, 片 in 假端点.调用] == [10, 10, 5]
    # 倒着回、正着出：每一片里的 index 都是 0..n-1 的升序
    assert [v[0] for v in 出] == [float(i % 10 if i < 20 else i - 20) for i in range(25)]


def test_空输入一个包都不发(假端点: _假嵌入端点) -> None:
    assert 客户端.嵌文本([]) == []
    assert 假端点.调用 == []


def test_模型名一路传到请求上(假端点: _假嵌入端点) -> None:
    客户端.嵌文本(["一句"])
    assert 假端点.调用[0][0] == "text-embedding-v4"


def test_没密钥抛LLM不可用(monkeypatch: pytest.MonkeyPatch) -> None:
    """**这条不换端点** —— 要的就是真 `_客户端` 在空密钥上举手。"""
    for 变量 in ("PRIMER_LLM_KEY", "DASHSCOPE_API_KEY", "PRIMER_LLM_KEY_先例库"):
        monkeypatch.delenv(变量, raising=False)
    with pytest.raises(LLM不可用):
        客户端.嵌文本(["一句"])
