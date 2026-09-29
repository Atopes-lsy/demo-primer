"""缺省配置下，业务数据该在哪儿。

# 这个文件盯着一次搬迁

数据文件原本在仓库外（`Path.home()/Downloads`，`docs/开发步骤.md` 坑 2 记着
当时的理由），2026-09-29 挪进了仓库根的 `data/`。**默认路径得跟着挪。**

没跟上的后果不是报错，是**静默走另一条路**：`test_装载器_真数据.py` 那句
skip 的原话是「它在仓库外，没带这份文件就跳过」—— 只要默认值还指着
Downloads，一份 checkout 下来就会安安静静地跳过，全绿的测试报告里少 7 条，
而没人在意。搬到仓库内的意义正是「checkout 即得」，所以默认值指错地方
等于这次搬迁没发生。

# 仓库根怎么找

**不重算源码里那个 `parents[N]`** —— 同义反复，源码写错几层它就跟着错几层，
测试照样绿。这里改为往上找带 `.git` 的那一层：它是仓库根这件事和
`配置.py` 住在哪、少不少一层目录都无关。
"""

from __future__ import annotations

from pathlib import Path

import pytest

from app.配置 import 取配置, 默认业务数据

仓库根 = next(向上 for 向上 in Path(__file__).resolve().parents if (向上 / ".git").exists())
"""往上的第一个带 `.git` 的目录。`tests/` → `backend/` → 仓库根。"""


def test_默认业务数据在仓库里() -> None:
    """这是这次搬迁的全部意义：默认值不该再指向仓库外。"""
    路径 = 默认业务数据.resolve()
    assert 仓库根 in 路径.parents, (
        f"默认业务数据指到仓库外去了：{路径}\n"
        f"它现在应该在 {仓库根 / 'data'} 下。数据文件进仓库就是为了让别人 "
        "checkout 下来直接能跑，默认值指着 Downloads 的话这件事不成立。"
    )


def test_默认路径那个文件真的在() -> None:
    """仓库内就不该有「文件没带」这种状态了。

    这条红 = 文件被删了或被改名了。以前它在仓库外时这是正常的（所以那边
    skip）；现在它是**仓库的一部分**，缺了就是仓库坏了。
    """
    assert 默认业务数据.exists(), (
        f"仓库里没有这个文件：{默认业务数据}\n"
        "数据文件已经进仓库了，删它或改它名字之前先想想这个默认值。"
    )


def test_不设环境变量时拿到的就是仓库内那份(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """上面两条量的是模块常量，这条量的是**实际取值路径**。

    默认值和 `AliasChoices` 是两件事：常量对、但 `PRIMER_XLSX` 拼错成
    `PRIMER_XLS` 之类的话，环境变量永远读不到，而默认值那条测试发现不了 ——
    它只看常量。
    """
    monkeypatch.delenv("PRIMER_XLSX", raising=False)
    取配置.cache_clear()
    try:
        assert 取配置().业务数据路径 == 默认业务数据
    finally:
        取配置.cache_clear()
