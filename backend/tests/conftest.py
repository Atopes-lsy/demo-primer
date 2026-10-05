"""测试进程的全局约定。

# 先例库默认是空的 —— 这条是**纪律**，不是配置

`话术生成.生成话术` 的默认参数 `召回先例=` 就是真的那一条
（`检索/先例库.召回先例`），而 `tests/test_话术生成.py` 有十几处直接调它。
`data/先例库.json` 一旦随仓库提交，**每一次调用都会真发一个嵌入请求**：
测试变成网络测试 —— 慢、花钱、看厂商脸色，而它红了指向的是「话术生成写错了」。

所以这条 fixture 把 `库路径` 挪到一个不存在的临时文件上：库读不到 ⇒
`召回先例` 在**发请求之前**就返回 `()`（`先例库` 里「库没加载 or 没密钥 or
条目为空 → 立刻返回」），一个包都不发。

要测先例库自己的测试，在**测试体里**再
`monkeypatch.setattr(先例库, "库路径", 真路径)` —— 后设的生效。
"""

from __future__ import annotations

from pathlib import Path

import pytest


@pytest.fixture(autouse=True)
def _先例库空(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    from app.检索 import 先例库

    monkeypatch.setattr(先例库, "库路径", tmp_path / "先例库_测试里不存在.json")
    先例库.清空()
