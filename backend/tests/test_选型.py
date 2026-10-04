"""两个位单独选型 —— `话术生成` 和 `拆需求`。

# 为什么要单独配

六个模型位共用一份全局配置（`PRIMER_LLM_MODEL` 那三个变量）。目前有两把
口子能从里面分出来，理由**各不相同**：

- **`话术生成`（2026-10-02）—— 因为它贵。** 只有它是写作文，另外几个都是
  分类和切分；而且它一条主张一次、一稿最多 `话术生成.最多调用` 次，
  一次判定里它花钱最多。2026-10-01 拍板「等全流程跑通了把它单独拎出来配」，
  2026-10-02 条件到了。
- **`拆需求`（2026-10-04）—— 因为它频。** 右栏「这次要什么」那一行由它拆，
  前端**每点开一个窗口就问它一次**。想拿便宜货／快模型压这一路的开销，
  改这三个变量，别的位一个字不动。

机制是同一套：三个变量（模型／地址／密钥）各自回退到全局那份，
`话术生成._问话术` 和 `拆需求._问需求` 是**各自的默认口子**。

# 这批测试钉的第一条，是「不设就跟现在一模一样」

新变量**一个都不设**时，取值必须和改动之前逐字相同（同一份默认模型、同一个
端点、同一个密钥回退）。这不是保守 —— 演示当天没人会去设它们，**没设的那条路
就是演示走的那条路**。

第二条才是「设了就真的分家」：光能读到变量不算，得一路传到 `问JSON` 的
`model=` 上。读到了却没传下去，是这一改最可能的坏法 —— 单看变量取值全绿。

第三条（最后一节）是**默认口子接没接上**：`_问需求` 写得再对，忘了换
`拆需求(问=)` 的默认值也没人调它，而上面两种坏法都测不出来。
"""

from __future__ import annotations

import inspect

import pytest

from app.llm import 客户端
from app.llm import 拆需求 as 拆需求模块
from app.llm import 话术生成


def test_不设新变量时和改动前一模一样():
    """两套新变量都不设 → 逐字沿用全局那份。

    这条要是红了，说明「没设就是老行为」这个前提没了 —— 而演示当天
    没人会设它们。
    """
    for 取自己, 取全局 in [(客户端.话术生成模型, 客户端.取模型), (客户端.需求分解模型, 客户端.取模型)]:
        assert 取自己() == 取全局() == 客户端.默认模型
    assert 客户端.话术生成地址() == 客户端.需求分解地址() == 客户端.取地址()
    assert 客户端.取地址() == 客户端.默认地址


@pytest.mark.parametrize(
    "取自己,取全局",
    [
        pytest.param(客户端.话术生成模型, 客户端.取模型, id="话术生成"),
        pytest.param(客户端.需求分解模型, 客户端.取模型, id="拆需求"),
    ],
)
def test_只设全局时自己那份跟着走(取自己, 取全局, monkeypatch: pytest.MonkeyPatch) -> None:
    """**只设了全局、没设它那份** —— 它得跟着全局走，不能自己退回硬编码默认。

    退回硬编码的话，`PRIMER_LLM_MODEL` 一改，别的位跟着换、它一个不换，
    而**没有任何东西会红**（默认值照样是个能用的模型名）。
    """
    monkeypatch.setenv("PRIMER_LLM_MODEL", "全局的")
    assert 取全局() == "全局的"
    assert 取自己() == "全局的"


def test_话术生成可以单独配模型(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PRIMER_LLM_MODEL", "全局的")
    monkeypatch.setenv("PRIMER_LLM_MODEL_话术生成", "写作文的")
    assert 客户端.取模型() == "全局的"
    assert 客户端.话术生成模型() == "写作文的"


def test_拆需求可以单独配模型(monkeypatch: pytest.MonkeyPatch) -> None:
    """这一位单独配的理由和 `话术生成` 相反：不是贵，是**每开一个窗口问一次**。"""
    monkeypatch.setenv("PRIMER_LLM_MODEL", "全局的")
    monkeypatch.setenv("PRIMER_LLM_MODEL_需求分解", "便宜的")
    assert 客户端.取模型() == "全局的"
    assert 客户端.需求分解模型() == "便宜的"


def test_两把口子互不影响(monkeypatch: pytest.MonkeyPatch) -> None:
    """各配各的 —— 一位换了模型，另一位和全局都不该动。

    `话术生成` 单配之后 `拆需求` 跟着换，等于白分一次家：那天想只给「这次要什么」
    那一行换个便宜货，结果话术也一起换了，而**这不会红**（两个模型名都合法）。
    """
    monkeypatch.setenv("PRIMER_LLM_MODEL", "全局的")
    monkeypatch.setenv("PRIMER_LLM_MODEL_话术生成", "写作文的")
    monkeypatch.setenv("PRIMER_LLM_MODEL_需求分解", "便宜的")
    assert 客户端.话术生成模型() == "写作文的"
    assert 客户端.需求分解模型() == "便宜的"
    assert 客户端.取模型() == "全局的"


def test_端点也能单独配(monkeypatch: pytest.MonkeyPatch) -> None:
    """模型名分家、端点不分家的话，「换个供应商写作文」就做不到。

    密钥同理 —— 换个供应商就是换一把钥匙。
    """
    monkeypatch.setenv("PRIMER_LLM_BASE_URL_话术生成", "https://别处.example/v1")
    monkeypatch.setenv("PRIMER_LLM_KEY_话术生成", "另一把钥匙")
    assert 客户端.话术生成地址() == "https://别处.example/v1"
    assert 客户端.话术生成密钥() == "另一把钥匙"
    assert 客户端.取地址() == 客户端.默认地址


def test_拆需求的端点也能单独配(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PRIMER_LLM_BASE_URL_需求分解", "https://快的那家.example/v1")
    monkeypatch.setenv("PRIMER_LLM_KEY_需求分解", "快的那把钥匙")
    assert 客户端.需求分解地址() == "https://快的那家.example/v1"
    assert 客户端.需求分解密钥() == "快的那把钥匙"
    assert 客户端.取地址() == 客户端.默认地址


def test_没设端点时话术生成沿用全局端点(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PRIMER_LLM_BASE_URL", "https://全局.example/v1")
    assert 客户端.话术生成地址() == "https://全局.example/v1"
    assert 客户端.需求分解地址() == "https://全局.example/v1"


def test_密钥回退到dashscope(monkeypatch: pytest.MonkeyPatch) -> None:
    """不设任何密钥变量时，两套都回头找 `DASHSCOPE_API_KEY`（老行为）。"""
    monkeypatch.delenv("PRIMER_LLM_KEY", raising=False)
    monkeypatch.delenv("PRIMER_LLM_KEY_话术生成", raising=False)
    monkeypatch.delenv("PRIMER_LLM_KEY_需求分解", raising=False)
    monkeypatch.setenv("DASHSCOPE_API_KEY", "环境里本来就有的")
    assert 客户端.话术生成密钥() == "环境里本来就有的"
    assert 客户端.需求分解密钥() == "环境里本来就有的"


# ══════════════════════════════════════════════════════════
# 读到了 ≠ 传下去了
# ══════════════════════════════════════════════════════════


def _假问JSON(收到: list[dict]):
    def 假问JSON(
        提示: str,
        系统: str = "",
        *,
        模型: str | None = None,
        地址: str | None = None,
        密钥: str | None = None,
    ) -> str:
        收到.append({"提示": 提示, "系统": 系统, "模型": 模型, "地址": 地址, "密钥": 密钥})
        return "{}"

    return 假问JSON


def test_话术生成模型名一路传到问JSON的model上(monkeypatch: pytest.MonkeyPatch) -> None:
    """**这条才是这一改的要点。**

    上面几条只证明「变量读得到」。读到了却没往 `问JSON` 的 `model=` 上传，
    是这一改最可能的坏法：变量取值全对、单测全绿，而真跑起来还是原来那个模型。

    所以这里拦在 `问JSON` 那一层，看 `模型=` 收到的是不是分家后那个。
    """
    monkeypatch.setenv("PRIMER_LLM_MODEL", "全局的")
    monkeypatch.setenv("PRIMER_LLM_MODEL_话术生成", "写作文的")
    monkeypatch.setenv("PRIMER_LLM_BASE_URL_话术生成", "https://别处.example/v1")
    monkeypatch.setenv("PRIMER_LLM_KEY_话术生成", "另一把钥匙")

    收到: list[dict] = []
    monkeypatch.setattr(话术生成, "问JSON", _假问JSON(收到))
    话术生成._问话术("写一句", "你是客服")

    # 三样一起断言：只传模型名的话，「换个供应商」做不到，而单测看不出来。
    assert 收到 == [{
        "提示": "写一句",
        "系统": "你是客服",
        "模型": "写作文的",
        "地址": "https://别处.example/v1",
        "密钥": "另一把钥匙",
    }]


def test_拆需求的模型名一路传到问JSON的model上(monkeypatch: pytest.MonkeyPatch) -> None:
    """同上，`拆需求` 那一份。

    ⚠️ 这一位是**每一行都要出**的（前端每点开一个窗口问一次），传丢了的话
    表面上什么都对：变量读得到、单测全绿、答案是模型给的 —— 只是贵的那份。
    """
    monkeypatch.setenv("PRIMER_LLM_MODEL", "全局的")
    monkeypatch.setenv("PRIMER_LLM_MODEL_需求分解", "便宜的")
    monkeypatch.setenv("PRIMER_LLM_BASE_URL_需求分解", "https://快的那家.example/v1")
    monkeypatch.setenv("PRIMER_LLM_KEY_需求分解", "快的那把钥匙")

    收到: list[dict] = []
    monkeypatch.setattr(拆需求模块, "问JSON", _假问JSON(收到))
    拆需求模块._问需求("她说了什么", "你拆需求")

    assert 收到 == [{
        "提示": "她说了什么",
        "系统": "你拆需求",
        "模型": "便宜的",
        "地址": "https://快的那家.example/v1",
        "密钥": "快的那把钥匙",
    }]


@pytest.mark.parametrize(
    "模块,口子",
    [
        pytest.param(话术生成, lambda: 话术生成._问话术("写一句", "你是客服"), id="话术生成"),
        pytest.param(拆需求模块, lambda: 拆需求模块._问需求("她说了什么", "你拆需求"), id="拆需求"),
    ],
)
def test_没配时传下去的是全局那套而不是None(模块, 口子, monkeypatch: pytest.MonkeyPatch) -> None:
    """不设新变量时传下去的也得是**全局那份实际取值**，不是三个 `None`。

    传 `None` 的话，`问JSON` 里「`None` ＝ 用全局」那条回退是对的 ——
    结果一样，但**「这份配置是谁的」这条信息丢在了半路**：
    以后要给这一位加第二个参数（超时、重试），又得从这里再穿一遍；
    而且拦在 `问JSON` 那一层看，分不出「分家了但没配」和「压根没分家」。
    """
    monkeypatch.setenv("PRIMER_LLM_MODEL", "全局的")
    monkeypatch.setenv("PRIMER_LLM_BASE_URL", "https://全局.example/v1")

    收到: list[tuple] = []

    def 假问JSON(
        提示: str,
        系统: str = "",
        *,
        模型: str | None = None,
        地址: str | None = None,
        密钥: str | None = None,
    ) -> str:
        收到.append((模型, 地址))
        return "{}"

    monkeypatch.setattr(模块, "问JSON", 假问JSON)
    口子()
    assert 收到 == [("全局的", "https://全局.example/v1")]


# ══════════════════════════════════════════════════════════
# 默认口子接没接上
# ══════════════════════════════════════════════════════════


@pytest.mark.parametrize(
    "入口,口子",
    [
        pytest.param(话术生成.生成话术, 话术生成._问话术, id="话术生成"),
        pytest.param(拆需求模块.拆需求, 拆需求模块._问需求, id="拆需求"),
    ],
)
def test_默认问就是自己的那个口子(入口, 口子) -> None:
    """`问=` 的默认值必须是那个带配置的口子。

    忘了换默认值的话，`_问需求` 写得再对也没人调它 —— 上面那几条测试
    直接调口子，照样全绿。**这是「读到了、传下去了、但没接上」的第三种坏法。**
    """
    assert inspect.signature(入口).parameters["问"].default is 口子, "默认还是 `问JSON`，等于没分家"


def test_另外几个位的默认口子照旧() -> None:
    """分家只动那两位 —— 别的位不许被顺手改。

    它们的默认口子一旦跟着换，`拆主张` / `认口径` / `认诉求` / `认权限` 会一起
    开始读某一位的配置，而那种错**只在真跑时显形**（假模型测试全都自己传 `问=`）。
    """
    from app.llm import 拆主张, 认口径, 认权限, 认诉求

    assert inspect.signature(拆主张.拆主张).parameters["问"].default is 客户端.问JSON
    assert inspect.signature(认口径.认口径).parameters["问"].default is 客户端.问模型
    assert inspect.signature(认诉求.认诉求).parameters["问"].default is 客户端.问模型
    assert inspect.signature(认权限.认权限).parameters["问"].default is 客户端.问模型
