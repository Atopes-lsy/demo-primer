"""嵌入位 —— `检索/先例库.py` 的读侧召回和重建都走它。

# 三条要钉的

1. 聊天默认 DeepSeek，先例库默认本地中文嵌入，不能混用聊天端点。
2. 可选远程嵌入仍按 10 条分批，并使用独立的地址和密钥。
3. 远程结果按 `index` 排回来。批量接口不保证顺序，按返回顺序配对是**静默**错位
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
    monkeypatch.setenv("PRIMER_LLM_MODEL_先例库", "text-embedding-v4")
    monkeypatch.setenv("PRIMER_LLM_BASE_URL_先例库", "https://embed.example/v1")
    monkeypatch.setenv("PRIMER_LLM_KEY_先例库", "test-key")
    monkeypatch.setattr(客户端, "_客户端", lambda 地址, 密钥: 端点)
    return 端点


def test_嵌入模型默认不是聊天模型(monkeypatch: pytest.MonkeyPatch) -> None:
    """全局聊天模型换掉，本地嵌入模型不跟着换。"""
    monkeypatch.setenv("PRIMER_LLM_MODEL", "别的模型")
    monkeypatch.delenv("PRIMER_LLM_MODEL_先例库", raising=False)
    assert 客户端.取模型() == "别的模型"
    assert 客户端.先例库模型() == "BAAI/bge-small-zh-v1.5"
    assert 客户端.默认嵌入模型 == "BAAI/bge-small-zh-v1.5"


def test_嵌入密钥和地址不误用DeepSeek(monkeypatch: pytest.MonkeyPatch) -> None:
    """远程嵌入必须有自己的端点和密钥。"""
    monkeypatch.setenv("PRIMER_LLM_KEY", "全局密钥")
    monkeypatch.setenv("PRIMER_LLM_BASE_URL", "https://别处")
    monkeypatch.delenv("PRIMER_LLM_KEY_先例库", raising=False)
    monkeypatch.delenv("PRIMER_LLM_BASE_URL_先例库", raising=False)
    assert 客户端.先例库密钥() == ""
    assert 客户端.先例库地址() == ""


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


def test_远程嵌入没单独配置就报错(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PRIMER_LLM_MODEL_先例库", "remote-model")
    monkeypatch.delenv("PRIMER_LLM_BASE_URL_先例库", raising=False)
    monkeypatch.delenv("PRIMER_LLM_KEY_先例库", raising=False)
    with pytest.raises(LLM不可用, match="远程嵌入须单独设置"):
        客户端.嵌文本(["一句"])


def test_本地嵌入不请求API或扣次数(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("PRIMER_LLM_MODEL_先例库", raising=False)

    class 假向量:
        def __init__(self, 值):
            self.值 = 值

        def tolist(self):
            return [float(self.值)]

    class 假本地模型:
        def embed(self, 文本们):
            return [假向量(i) for i, _ in enumerate(文本们)]

    monkeypatch.setattr(客户端, "_本地嵌入器", lambda: 假本地模型())
    monkeypatch.setattr(客户端, "_客户端", lambda *_: pytest.fail("本地嵌入不应请求 API"))
    assert 客户端.嵌文本(["甲", "乙"]) == [[0.0], [1.0]]
