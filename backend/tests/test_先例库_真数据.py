"""真数据那一组：取材数、随库提交的 `data/先例库.json`。

# 这两个数为什么值得钉

180 和 139 是**实测出来的存量**，不是设计值。改取材规则、改 `_该丢`、
换嵌入模型，这两个数就动 —— 而它们一动，库的内容就换了，得有人知道。
**文件缺了就是失败，不 skip**（和 `test_装载器_真数据.py` 同一条规矩）。

⚠️ **139 那条红了先看 180 那条。** 取材数没变而条目数变了，八成是嵌入服务
那边回来的向量和建库那天不一样（去冗是贪心 ＋ 余弦阈值，够近的两条换个次序
结果就少一条）。那种时候**别直接改 139** —— 先比一比库里的条目，再决定是
重建一次、还是这条钉子的口径要改成「180 上下浮动不超过 5 条」。
"""

from __future__ import annotations

import pytest

from app.配置 import 取配置
from app.data.装载器 import 读工作簿
from app.检索 import 先例库
from app.rules import guards, koujing


@pytest.fixture(scope="module")
def 真表():
    """真业务数据。**文件缺了就是失败** —— 不 skip（`test_装载器_真数据.py` 的规矩）。"""
    return 读工作簿(取配置().业务数据路径)


def test_真数据取材180条(真表) -> None:
    assert len(先例库.从聊天记录取材(真表)) == 180


def test_真库能过取库那条路(monkeypatch: pytest.MonkeyPatch) -> None:
    """**显式指回 `默认库路径`** —— conftest 那条 autouse 把 `库路径` 挪走了。

    走 `取库()` 而不是 `_读库()`：读得动不等于 `取库()` 肯给，模型名对不上
    它照样回空（那是线上最可能的坏法）。
    """
    monkeypatch.setattr(先例库, "库路径", 先例库.默认库路径)
    先例库.清空()
    assert len(先例库.取库()) == 139
    先例库.清空()


def test_随库提交的先例库形状对(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(先例库, "库路径", 先例库.默认库路径)
    先例库.清空()
    库 = 先例库.取库()
    assert all(len(t.向量) == 1024 for t in 库)
    assert all(t.情境 and t.答法 and t.会话ID for t in 库)
    assert all(t.答法.strip() == t.答法 for t in 库), "答法带头尾空白 —— 压平那道漏了"
    先例库.清空()


def test_库里没有数字没有禁语没有没凭据的已发生动作(monkeypatch: pytest.MonkeyPatch) -> None:
    """取材那套滤在真库上真跑过一遍 —— 抽查「建库时漏了一道」这种错。

    **这是硬要求**（模块文档串那段）：库里留一个数字，`guards.G3来源可查` 会
    拿它替话术里同一个数字背书，而 ③ 压根不是出处。
    """
    monkeypatch.setattr(先例库, "库路径", 先例库.默认库路径)
    先例库.清空()
    漏的 = [
        t.答法
        for t in 先例库.取库()
        if guards.G3带单位数字.search(t.答法)
        or koujing.查禁语全(t.答法)
        or guards.已发生动作(t.答法)
    ]
    assert 漏的 == []
    先例库.清空()
