"""HTTP 层（`app/main.py` ＋ `app/api/路由.py`）。

# 打的不是真网络

用 `ASGITransport` 直接把请求喂给 app 对象，不起 uvicorn、不占端口 —— 所以
这个文件在别人的机器上、在 CI 里、在没有网的时候都能跑。

**顺带一个后果要记着：`ASGITransport` 不发 lifespan 事件。** 于是启动时的
装配（读配置、读 xlsx）在测试里**不会执行**，测试因此能用一个合成的装载器
（`dependency_overrides`），不需要读那份 171KB 的真文件。真实的 uvicorn
会执行它，缺文件就起不来 —— 那件事由 `test_数据文件不在时启动就炸` 单独盯。

# 这层测什么

不测判定的逻辑（那在 `app/rules/`，`test_rules.py` 管）。这里只测三件
容易在跨端的时候坏掉的事：**中文经不经得起 JSON 往返**、**线上键是不是
前端读的那些**、**出错时响应的形状统不统一**。
"""

from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path
from typing import Any

import pytest
from fastapi import FastAPI, HTTPException
from httpx import ASGITransport, AsyncClient

from app import main
from app.api import deps, schemas
from app.data.装载器 import 业务数据缺失, 装载器
from app.llm.客户端 import 先例库模型
from app.检索 import 先例库
from tests.造数据 import 合并昵称, 合并补发单号, 造合并表, 样例表

测试基地址 = "http://测试"


async def 打(方法: str, 路径: str, **参数: Any) -> Any:
    """对真实的 `main.app` 发一个请求。"""
    交通 = ASGITransport(app=main.app)
    async with AsyncClient(transport=交通, base_url=测试基地址) as 客户端:
        return await 客户端.request(方法, 路径, **参数)


@contextmanager
def 装的是(表: dict[str, list[dict[str, Any]]]) -> Iterator[None]:
    """这个 `with` 块里打出去的请求都读这张合成表，出来就清掉。

    换成 `with` 而不是每条测试自己 `try/finally`：**清不干净是会漏的** ——
    一个覆盖留在 `dependency_overrides` 里，后面每条测试读的都是它，
    而它们各自看着都还是绿的（只是测的东西悄悄换了个人）。
    """
    main.app.dependency_overrides[deps.取装载器] = lambda: 装载器.从表(表)
    try:
        yield
    finally:
        main.app.dependency_overrides.clear()


@pytest.fixture
def 合成装载器() -> Any:
    """把装载器依赖换成合成数据，跑完清掉。

    `autouse=False`：不是每个测试都要它（异常形状、CORS、配置那些不用）。
    """
    with 装的是(样例表):
        yield


# ══════════════════════════════════════════════════════════
# 一 · GET /healthz
# ══════════════════════════════════════════════════════════


@pytest.mark.usefixtures("合成装载器")
async def test_健康检查报ok和会话数() -> None:
    """会话数是刻意放进去的。

    `{"ok": true}` 在装载器读到空表时**也**是 true —— 那时候「前后端通了没有」
    这个问题的答案就变成假的了。带上计数，`curl` 一眼能看出数据是不是真的在。
    """
    res = await 打("GET", "/healthz")
    assert res.status_code == 200
    assert res.json() == {"ok": True, "会话数": 2}


# ══════════════════════════════════════════════════════════
# 二 · GET /api/会话列表
# ══════════════════════════════════════════════════════════


@pytest.mark.usefixtures("合成装载器")
async def test_会话列表返回全部会话且按ID排序() -> None:
    res = await 打("GET", "/api/会话列表")
    assert res.status_code == 200
    assert [s["会话ID"] for s in res.json()] == ["S1", "S2"]


@pytest.mark.usefixtures("合成装载器")
async def test_会话列表的线上键是前端读的那些() -> None:
    """**中文键名逐字照 `types/index.ts`，不引入映射层。**

    这条最容易坏在「后端顺手加一层蛇形转换」上 —— 那样前端每个字段都读到
    `undefined`，**而且不报错**，界面上只是少显示一块。
    """
    会话 = (await 打("GET", "/api/会话列表")).json()[0]
    assert set(会话) == {
        "会话ID", "买家昵称", "店铺", "stage", "消息", "订单", "工单",
        "摘要", "最近时间", "未读", "顾客情况", "建议", "本轮处置", "报备", "转交",
        # 2026-10-03 加的两个合并窗口字段，`types/index.ts` 同步加的
        "以前", "起演格",
    }
    assert set(会话["消息"][0]) == {
        "会话ID", "消息序号", "message_id", "发送时间", "角色", "买家昵称",
        "发送方", "店铺", "scene_major", "scene_minor", "is_target_buyer_message",
        "message_text", "内容类型", "chat_content", "category", "image_path",
        "关联订单号", "关联工单号", "署名",
    }


@pytest.mark.usefixtures("合成装载器")
async def test_每条会话都带顾客情况五行() -> None:
    """**2026-10-03 起 `/api/会话列表` 自己装配顾客情况。**

    在那之前这一栏对全部 140 条都是 `null`，于是除两条演示线之外，点开哪一条
    右栏都只有一句「这条会话还没跑判定」—— 屏幕上看到的是**插件模块整块没出现**，
    而不是「模块在、判定还没接上」。用户报的就是这个：示例之外的会话右栏是空的。

    断**标签和顺序**，不只断行数：`CustomerStateCard` 默认只展开前两行
    （`顾客情况五行` 的前两条），顺序错了不会报错，只是「这次要什么」被折进了
    「已折叠 3 条」里。
    """
    载荷 = (await 打("GET", "/api/会话列表")).json()
    assert [r["标签"] for r in 载荷[0]["顾客情况"]] == [
        "这是谁",
        "这次要什么",
        "答应过什么",
        "办过什么",
        "这单",
    ]
    assert all(len(s["顾客情况"]) == 5 for s in 载荷)


@pytest.mark.usefixtures("合成装载器")
async def test_顾客情况是装配出来的不是空壳() -> None:
    """五行都得有真值 —— 五条全空也满足「有五行」。"""
    载荷 = {s["会话ID"]: s for s in (await 打("GET", "/api/会话列表")).json()}
    S1 = {r["标签"]: r["值"] for r in 载荷["S1"]["顾客情况"]}
    S2 = {r["标签"]: r["值"] for r in 载荷["S2"]["顾客情况"]}

    assert S1["这是谁"] == "邓e**"
    assert S1["这次要什么"] == "你好，收到的粉底液泵头是坏的"
    assert S1["这单"] == "XL20931 · ¥259 · 已签收"

    # S2 只有一条**系统推送**，一个买家发言都没有。「这次要什么」照实说没有 ——
    # 系统推送不是顾客说的话，拿它顶上就是右栏替顾客编了一句诉求。
    #
    # 写「无」不写「（本轮没有买家发言）」（2026-10-03）：这一行是**值**，
    # 顾客情况里没有买家发言就是没有；带括号那句是把内部状态说给顾客听。
    assert S2["这次要什么"] == "无"


async def test_顾客情况不写回装载器里的那个会话对象() -> None:
    """`装载器.找` 返回的是列表里**同一个对象**，而它声明自己只读。

    就地写 `会话.顾客情况 = …` 的话，这次请求的产物会留在进程里：下一次请求
    拿到的是上一轮留下的行，**改装配逻辑也擦不掉**（装载只发生一次）。所以
    路由那边是 `model_copy` 出一份新的。

    这条用**同一个装载器打两次**，第二次的答案必须还是第一次那个 ——
    两次之间没有任何东西该被记住。
    """
    装 = 装载器.从表(样例表)
    main.app.dependency_overrides[deps.取装载器] = lambda: 装
    try:
        第一次 = (await 打("GET", "/api/会话列表")).json()
        第二次 = (await 打("GET", "/api/会话列表")).json()
        assert 第一次 == 第二次
        assert 第一次[0]["顾客情况"], "路由根本没填，下面两条断言就都成了空转"
        assert 装.会话列表[0].顾客情况 is None
        assert 装.找("S1").顾客情况 is None
    finally:
        main.app.dependency_overrides.clear()


@pytest.mark.usefixtures("合成装载器")
async def test_返回的东西能原样反序列化回Session() -> None:
    """JSON 往返。中文、`is_target_buyer_message` 的布尔、五类工单的联合，
    都会在这一步现原形 —— 而不是等到前端读出一个 undefined。"""
    载荷 = (await 打("GET", "/api/会话列表")).json()
    会话们 = [schemas.Session.model_validate(s) for s in 载荷]
    assert [s.会话ID for s in 会话们] == ["S1", "S2"]
    assert 会话们[0].消息[0].is_target_buyer_message is True


@pytest.mark.usefixtures("合成装载器")
async def test_订单和工单各挂各的会话() -> None:
    载荷 = {s["会话ID"]: s for s in (await 打("GET", "/api/会话列表")).json()}
    assert 载荷["S1"]["订单"]["订单号"] == "XL20931"
    assert 载荷["S1"]["工单"] is None
    assert 载荷["S2"]["订单"] is None
    assert 载荷["S2"]["工单"]["kind"] == "物流"
    assert 载荷["S2"]["工单"]["ticket"]["工单号"] == "WL101842381"


@pytest.mark.usefixtures("合成装载器")
async def test_带括号的金额列线上逐字带括号() -> None:
    载荷 = (await 打("GET", "/api/会话列表")).json()
    订单 = 载荷[0]["订单"]
    assert 订单["单价(元)"] == 259
    assert 订单["实付金额(元)"] == 259
    assert "单价元" not in 订单, "走了 Python 属性名，前端会读到 undefined 而且不报错"


@pytest.mark.usefixtures("合成装载器")
async def test_系统推送经得起JSON往返() -> None:
    """第四个角色的取值必须原样过线 —— 它是这次契约改动加的那个。"""
    载荷 = (await 打("GET", "/api/会话列表")).json()
    角色 = [m["角色"] for s in 载荷 for m in s["消息"]]
    assert "系统推送" in 角色
    assert set(角色) <= set(schemas.SenderRole.__args__)


@pytest.mark.usefixtures("合成装载器")
async def test_消息在接口上也按序号升序() -> None:
    载荷 = (await 打("GET", "/api/会话列表")).json()
    for 会话 in 载荷:
        序号 = [m["消息序号"] for m in 会话["消息"]]
        assert 序号 == sorted(序号)


# ══════════════════════════════════════════════════════════
# 二·补 · 按顾客合并窗口（2026-10-03）
# ══════════════════════════════════════════════════════════
#
# 真数据：138 条会话 → 114 个窗口（其中 24 个是多段）。规则全写在
# `data/顾客窗口.py`，这里测的是「路由有没有真的接上它」和那两件会静默坏掉的事。


async def test_同一个顾客的两次来访合并成一个窗口() -> None:
    """同一个人 5/5 和 5/9 各来一次，左栏原来得是两条互不相干的记录。

    而右栏那五行「顾客情况」本来就是**以前的会话攒出来的** —— 看不出是同一个人，
    那五行就没有出处。
    """
    with 装的是(造合并表()):
        载荷 = (await 打("GET", "/api/会话列表")).json()

    assert [s["会话ID"] for s in 载荷] == ["SB"], "两段必须并成一个窗口"
    w = 载荷[0]
    assert w["买家昵称"] == 合并昵称
    assert len(w["消息"]) == 4, "两段的消息按段序相接"

    # **序号必须重编成 1..N。** 原始数据里每个会话各自 1..n（实测 138/138），
    # 直接拼会重号 —— 而 `装配._答应过什么` 正是靠 `sorted(key=消息序号)`
    # 找「最晚一条承诺」，重号之后挑出来的是错的那条。
    assert [m["消息序号"] for m in w["消息"]] == [1, 2, 3, 4]
    assert [m["message_text"] for m in w["消息"]] == [
        "说好的赠品小样没收到", "亲抱歉！这边 48 小时内发出", "收到了，谢谢", "不客气～有需要随时找我",
    ]

    # 身份字段全取**末段**：「这单」「办过什么」说的是这一次来访
    assert w["订单"]["订单号"] == "XL90001"
    assert w["工单"]["ticket"]["工单号"] == "WL000000001"

    # 前段那 2 条是「以前」，回放从第 3 格开始 —— 「演示从最后一次会话开始」
    assert w["起演格"] == 2


async def test_以前那几行是那几段的总结() -> None:
    """`以前` 那几行的内容（2026-10-04 起界面上不渲染，接口照旧给）。

    `要什么` 取那段的**第一轮**买家原话，不取首条（真数据里大量会话第一句是
    「在吗」）、也不取末轮（实测 `S00034` 的末轮是道谢，放上去等于没说）。
    `办过什么` 走的是五行里那一行**同一个函数**，不是另写一遍。
    """
    with 装的是(造合并表()):
        载荷 = (await 打("GET", "/api/会话列表")).json()

    assert 载荷[0]["以前"] == [
        {
            "日期": "5/5",
            "要什么": "说好的赠品小样没收到",
            "办过什么": "5/5 已登记补发 · 已发出",
            "工单号": 合并补发单号,
        }
    ]


@pytest.mark.usefixtures("合成装载器")
async def test_每个窗口都写了以前而不是缺字段() -> None:
    """**`[]` 和「没这个键」在这条线是两件事**，前端就靠它分。

    - 没有这个键（前端那份剧本兜的底）→ 整块**不渲染**；
    - `[]`（接口明说这位没有更早的来访）→ 渲染「无」。

    后端写成 `null` 的话两者长得一样 —— 两条演示线的卡片会凭空多出一块「无」，
    而它们今天展示什么、以后还得展示什么，是定死的。
    """
    载荷 = (await 打("GET", "/api/会话列表")).json()
    for w in 载荷:
        assert isinstance(w["以前"], list), f"{w['会话ID']} 的以前是 {w['以前']!r}"
        assert isinstance(w["起演格"], int), f"{w['会话ID']} 的起演格是 {w['起演格']!r}"


async def test_只来过一次的顾客以前是空的起演格是零() -> None:
    """88 个真窗口就是这样（＋两条演示线）。两个空值都得**由接口写出来**。"""
    with 装的是(样例表):
        载荷 = (await 打("GET", "/api/会话列表")).json()

    assert len(载荷) == 2, "S1／S2 昵称不同，两个都是单段窗口"
    assert all(w["以前"] == [] and w["起演格"] == 0 for w in 载荷)


async def test_前段许的诺认得出自己那张票() -> None:
    """**这一条是那个假逾期的 red-green。**

    前段客服许了「48 小时内发出」并挂号 `合并补发单号` 的补发单，货**已经发出**。
    合并之后那句承诺落在 `SB` 的窗口里，而窗口的 `工单` 只有一个（末段那张物流单）。

    `_未兑现` 拿着物流单去核补发单，核不上就按「未兑现」算（那条保守规则本身是
    对的：漏报比虚报坏）—— 于是屏幕上「承诺已逾期」红字顶在卡片上，而
    `CustomerStateCard` 对带 `警示` 的行**强制展开**，藏都藏不住。

    真数据里这条路上有 **3 个**窗口说这句假话：`S00132`／`S00203`／`S00362`。
    —— 这一条只修得动前两个（它们那句承诺**挂着号**，票表里认得出）。
    `S00362` 的号**空着**，落的是另一条路（`_未兑现` 的 `本段`），
    由下面 `test_前段那句承诺没挂号就别拿末段的票去核` 钉着。
    """
    with 装的是(造合并表(前段补发物流单号="YT0000000000001")):
        载荷 = (await 打("GET", "/api/会话列表")).json()

    行 = {r["标签"]: r for r in 载荷[0]["顾客情况"]}
    assert 行["答应过什么"]["值"] == "没有未兑现的承诺", "货早发出去了"
    assert not 行["答应过什么"]["警示"], "这就是那句假逾期的红字"
    # 前段那张票得进得了票表，否则上面两条绿得没有理由
    assert 行["办过什么"]["值"] == "5/9 已登记物流处理 · 工单组处理"


async def test_前段许的诺没兑现就还是红的() -> None:
    """别把上面那条修成「合并窗口一律不报承诺」。

    红字是这个产品的核心承诺（「答应过的事不会忘」），漏报比虚报坏得多。
    """
    with 装的是(造合并表(前段补发物流单号=None)):
        载荷 = (await 打("GET", "/api/会话列表")).json()

    行 = {r["标签"]: r for r in 载荷[0]["顾客情况"]}
    assert 行["答应过什么"]["值"] == "5/5 承诺「48 小时内发出」"
    assert 行["答应过什么"]["警示"], "补发单还没发出，这就是要报的那件事"


async def test_前段那句承诺没挂号就别拿末段的票去核() -> None:
    """**号空着 = 这条承诺不挂票**，而末段那张票是**另一次来访**的。

    xlsx 里「关联工单号」那一列大半是空的（真数据实测 140 条客服消息里挂上号的
    少数）。号空着的时候 `_未兑现` 原来拿 `会话.工单` 兜底 —— 那是**末段**那张票。
    `test_前段许的诺认得出自己那张票` 那条路上这是对的（号不空、认得出前段那张）；
    号一空，兜底就**串了两次来访**：拿 5/9 的物流单去核 5/5 的承诺。

    真数据里 **S00362 姚b\\*\\*** 就是这么报出「已逾期 8 天」的（同形的还有 S00183
    不e\\*\\*）：那句承诺说的是「付完尾款 48 小时内安排发货」，而**尾款窗口 5/10
    才开**，顾客当时根本没付尾款。

    判据是**位置**，不是号：`起演格` 之前那段是更早的来访，末段的票管不着它。
    本段（单段窗口、原始会话、以及本次来访里的空号承诺）照旧兜底 ——
    那条保守规则本身没错，错的是把它伸到上一次来访里去。
    """
    with 装的是(造合并表(前段承诺挂号="")):
        载荷 = (await 打("GET", "/api/会话列表")).json()

    行 = {r["标签"]: r for r in 载荷[0]["顾客情况"]}
    assert 行["答应过什么"]["值"] == "没有未兑现的承诺", "5/5 的承诺不该拿 5/9 的票去核"
    assert not 行["答应过什么"]["警示"], "这就是那句「已逾期 N 天」的假红字"


async def test_空数据也是200不是404() -> None:
    """没有会话是**合法的空结果**，不是找不到资源。

    返回 404 会让前端把「今天没有会话」和「接口路径写错了」显示成同一件事。
    """
    main.app.dependency_overrides[deps.取装载器] = lambda: 装载器.从表({})
    try:
        res = await 打("GET", "/api/会话列表")
        assert res.status_code == 200
        assert res.json() == []
    finally:
        main.app.dependency_overrides.clear()


# ══════════════════════════════════════════════════════════
# 三 · 出错时的形状统一
# ══════════════════════════════════════════════════════════
#
# 用一个**临时 app** 装同一套异常处理，而不是往真 app 上加测试路由 ——
# `main.装异常处理` 是那个单元，测它不该往线上 app 里塞东西。


def 临时应用() -> FastAPI:
    应用 = FastAPI()
    main.装异常处理(应用)

    @应用.get("/会炸")
    async def _会炸() -> None:
        raise HTTPException(status_code=404, detail="找不到会话 S99")

    @应用.get("/要整数")
    async def _要整数(轮次: int) -> dict[str, int]:
        return {"轮次": 轮次}

    return 应用


async def 打临时(路径: str, **参数: Any) -> Any:
    交通 = ASGITransport(app=临时应用())
    async with AsyncClient(transport=交通, base_url=测试基地址) as 客户端:
        return await 客户端.request("GET", 路径, **参数)


async def test_HTTP异常收敛成错误加详情() -> None:
    res = await 打临时("/会炸")
    assert res.status_code == 404
    assert res.json() == {"错误": "找不到会话 S99", "详情": ""}


async def test_请求参数不合法走同一个形状() -> None:
    """FastAPI 默认吐的是 `{"detail": [...]}`，字段名和上面那条不一样。

    两套形状意味着前端要写两个分支去取错误文案 —— 而代码里只有一个地方
    显示错误，第二个分支永远不会被写，出错时界面上什么都不显示。
    """
    res = await 打临时("/要整数", params={"轮次": "abc"})
    assert res.status_code == 422
    体 = res.json()
    assert set(体) == {"错误", "详情"}
    assert 体["错误"] == "请求参数不合法"
    assert "轮次" in 体["详情"]


async def test_没匹配上的路径也是这个形状() -> None:
    res = await 打("GET", "/没有这个路径")
    assert res.status_code == 404
    assert set(res.json()) == {"错误", "详情"}


# ══════════════════════════════════════════════════════════
# 四 · CORS
# ══════════════════════════════════════════════════════════


@pytest.mark.parametrize("来源", ["http://localhost:5173", "http://127.0.0.1:5174"])
async def test_本地任意端口都放行(来源: str) -> None:
    """端口不写死 5173。

    Vite 的默认端口被占用时会自己往上找（5174、5175…），那件事发生在演示当天、
    发生在别人正在投屏的时候。写死端口的话，那时的报错是「跨域被拦」，
    看起来和「后端没起来」一模一样。
    """
    res = await 打("OPTIONS", "/api/会话列表", headers={
        "Origin": 来源,
        "Access-Control-Request-Method": "GET",
    })
    assert res.headers.get("access-control-allow-origin") == 来源


async def test_外站不放行() -> None:
    res = await 打("OPTIONS", "/api/会话列表", headers={
        "Origin": "http://evil.example",
        "Access-Control-Request-Method": "GET",
    })
    assert "access-control-allow-origin" not in res.headers


# ══════════════════════════════════════════════════════════
# 五 · 启动装配
# ══════════════════════════════════════════════════════════


def test_数据文件不在时启动就炸(monkeypatch: pytest.MonkeyPatch) -> None:
    """**不要降级成空列表。**

    静默返回空列表的话，`GET /api/会话列表` 会返回 `[]` 且状态码 200 ——
    「前后端通了没有」这个问题就得到了一个假的答案：通了，只是没数据。
    而排查方向会指向前端、指向代理、指向 CORS，全都不对。
    """
    from app.配置 import 取配置

    monkeypatch.setenv("PRIMER_XLSX", str(Path("/绝对不存在的目录/没有这个文件.xlsx")))
    取配置.cache_clear()
    deps.取装载器.cache_clear()
    try:
        with pytest.raises(业务数据缺失) as 抓到:
            main.启动装配()
        assert "PRIMER_XLSX" in str(抓到.value), (
            "报错得告诉人怎么修 —— 文件不在仓库里，这是唯一能改的那一处"
        )
    finally:
        取配置.cache_clear()
        deps.取装载器.cache_clear()


@pytest.mark.usefixtures("合成装载器")
async def test_中文键名原样过线而不是被转义() -> None:
    """`ensure_ascii=False`。

    转义成 `\\u4f1a\\u8bddID` 也能跑 —— 前端照样读得到。但演示时打开
    网络面板看不到中文字段，`JSON.stringify` 的日志也全是转义码，
    「字段名对不对」这件事就从肉眼可查变成必须写代码验。
    """
    res = await 打("GET", "/api/会话列表")
    assert res.headers["content-type"].startswith("application/json")
    原文 = res.content.decode("utf-8")
    assert "会话ID" in 原文
    assert "买家昵称" in 原文


# ══════════════════════════════════════════════════════════
# 六 · GET /api/先例库（2026-10-07）
# ══════════════════════════════════════════════════════════
#
# 右栏最下面那行「历史相似对话 N 条」。
#
# `conftest` 那条 autouse fixture 把 `库路径` 挪到了一个不存在的文件上，所以
# **不写库的时候这里恒是空库** —— 要测「有内容」那一支得自己把库写出来
# （第二条），写完记得 `清空()`：`取库()` 是**读一次就常驻内存**的。


async def test_先例库空的时候报零还是200() -> None:
    """空库是**常态**，不是异常。

    读不到文件、文件坏了、版本对不上、嵌入模型对不上 —— 四种都收敛在
    `取库()` 里变成空表。接口这一层要的是**照样 200 报 0**：前端那一行在
    0 的时候有自己的写法（「历史相似对话 0 条」是实话，当下一条也取不出来），
    而 500 会让它整行不显示。
    """
    res = await 打("GET", "/api/先例库")
    assert res.status_code == 200
    assert res.json() == {"条数": 0}


async def test_先例库报的是库里真有的条数(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """**这个数接的是真库，不是剧本里编的那个 56。**

    那一行原来是读 `先例库基数 = 56`（`data/剧本.ts`）再加演到第几步 —— 和盘上
    的库没有关系：库里 139 条，屏幕上从 56 起步、演完到 57。这条钉住「它现在是
    数出来的」：库里放三条就报 3，放一条就报 1。

    嵌入模型写的是**当前配置那个名字**而不是硬编 `text-embedding-v4`：库里的
    模型名和跑着的配置对不上时 `取库()` 当空库，那样这条测试会在换过模型的
    机器上报 0，而看着像接口坏了。
    """
    路径 = tmp_path / "先例库.json"
    先例库.写库(
        [先例库.先例(f"问{i}", f"答{i}", f"S{i}", 向量=(1.0, 0.0)) for i in range(3)],
        嵌入模型=先例库模型(),
        路径=路径,
    )
    monkeypatch.setattr(先例库, "库路径", 路径)
    先例库.清空()

    assert (await 打("GET", "/api/先例库")).json() == {"条数": 3}

    # 少一条就报少一条 —— 数的是**库**，不是「这个接口返回过什么」。
    先例库.写库(
        [先例库.先例("问零", "答零", "S0", 向量=(1.0, 0.0))],
        嵌入模型=先例库模型(),
        路径=路径,
    )
    先例库.清空()
    assert (await 打("GET", "/api/先例库")).json() == {"条数": 1}


#: 26 字，过 `_该丢` 那 20 字的门槛（和 `test_先例库.py` 那条同一个理由：
#: 短句会先被长度那道拦下，这条就变成在测 `_该丢` 而不是在测「回写长没长上去」）。
_合格答法 = "亲，您把货寄回来就行，这边收到之后马上给您办退款哈~"


def _假嵌(文本们):
    """桩：形状对就行，这一条不问向量算得准不准。"""
    return [[1.0, 0.0]] * len(文本们)


async def test_先例库会涨_涨的是进程里那个数不是盘上那份(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """**回写只进内存，这个接口报的也是内存。**

    2026-10-07 实测：重启后端 `curl` 报 139，浏览器一开演示线（那一下就会判
    `S_DEMO_A` 轮 1），再 `curl` 报 140 —— 盘上那份从头到尾没人动过。

    不钉的话，「回写没接上」和「接上了但接口读的是盘」在屏幕上**长得一模一样**
    （都是那个数不动），而这俩要查的方向差得远。这条把两句话一起钉住：
    回写**会**让这个接口的数涨，且涨的**不是**盘上那份。

    库路径这里指向一个**不存在的文件**，正是为了让「它数的不是盘」这件事
    没有第二种解释。
    """
    先例库.清空()
    monkeypatch.setattr(先例库, "库路径", tmp_path / "不存在.json")
    assert (await 打("GET", "/api/先例库")).json() == {"条数": 0}

    assert 先例库.回写("快递到哪了", _合格答法, "S1", 2, 嵌=_假嵌) is True
    assert (await 打("GET", "/api/先例库")).json() == {"条数": 1}, "回写没长到这个接口上"

    # 幂等键是 `(会话ID, 轮次)` —— 同一轮重问（拖回重放、看到消息数变了）不再涨。
    assert 先例库.回写("快递到哪了", _合格答法, "S1", 2, 嵌=_假嵌) is False
    assert (await 打("GET", "/api/先例库")).json() == {"条数": 1}

    assert not (tmp_path / "不存在.json").exists(), "有个文件被写出来了 —— 那这条就不成立"
    先例库.清空()
