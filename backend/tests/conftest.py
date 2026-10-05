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

# 另一条闸门：默认嵌入被换成**一调就抛**的桩

上面那条 fixture 只管「库读不到」这一种短路。库读得到的时候（测试自己写了库
文件、或者哪条路顺手 `回写` 了一句长话术）`召回先例`／`回写` 会走到**嵌入**那
一步，而它的默认参数是真的 `嵌文本` —— 这台机器上 `DASHSCOPE_API_KEY` 非空，
走到就是**真花钱、真看网络脸色**。今天全绿只是因为假话术都 ≤ 16 字、死在
`_该丢` 那 20 字的长度门槛上：**4 个字的余量，不是一道闸门**。

`先例库.嵌条目` 是同一个口子 —— 它默认也伸向 `嵌文本`，上一版漏掉了它，
`--重建` 之外没人调用所以没露头（Task 9 顺手补上）。

所以 `_默认嵌入拦住` 把三个函数的默认嵌入都换成桩。拦下来不出声（两个调用方
都把异常吞了），要的就是这个 —— 目标是**没有测试能花到钱或依赖网络**，不是
让它们喊出来。
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest


#: 测试期把库挪到一个**不存在**的文件上 —— 库读不到，`召回先例` 会在发请求之前返回。
#: 用固定路径而不是 `tmp_path`：`tmp_path` 给每条用例建一个目录，720 条要多花 ~5s。
#: 这条文件**永远不该被创建** —— 真被创建了，下面那句 assert 会让它当场炸出来。
_测试库路径 = Path(__file__).parent / "_先例库_测试里不存在.json"


@pytest.fixture(autouse=True)
def _先例库空(monkeypatch: pytest.MonkeyPatch) -> None:
    from app.检索 import 先例库

    assert not _测试库路径.exists(), "测试库路径被创建了 —— 有测试拿默认路径写了盘"
    monkeypatch.setattr(先例库, "库路径", _测试库路径)
    先例库.清空()


def _拦嵌入() -> Any:
    """默认嵌入的替身。**一被调用就抛**（见 `_默认嵌入拦住` 的文档串）。"""

    def 拦(*_: object, **__: object) -> Any:
        raise RuntimeError("测试里伸向了默认嵌入 —— 见 conftest 的文档串")

    return 拦


@pytest.fixture(autouse=True)
def _默认嵌入拦住(monkeypatch: pytest.MonkeyPatch) -> None:
    """把 `召回先例`／`回写`／`嵌条目` 的**默认**嵌入换成桩，测试里一个包都不发出去。

    ⚠️ **把手只有 `__kwdefaults__`。** `嵌: 嵌入函数 = 嵌文本` 是**定义时**绑定
    的，事后改 `先例库.嵌文本` 一点用都没有（函数默认参数不会跟着变名）；
    三个 `嵌` 又都是关键字参数，所以它们的默认值住在 `__kwdefaults__` 这个
    dict 里。**是 dict 就得用 `setitem`** —— `monkeypatch.setattr` 对 dict
    会抛 `AttributeError`（`getattr(dict, "嵌")` 拿不到）。

    显式传了 `嵌=` 的测试不受影响：这只改默认值。
    """
    from app.检索 import 先例库

    拦 = _拦嵌入()
    monkeypatch.setitem(先例库.回写.__kwdefaults__, "嵌", 拦)
    monkeypatch.setitem(先例库.召回先例.__kwdefaults__, "嵌", 拦)
    monkeypatch.setitem(先例库.嵌条目.__kwdefaults__, "嵌", 拦)
