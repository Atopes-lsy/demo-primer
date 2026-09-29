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

from pathlib import Path
from typing import Any

import pytest
from fastapi import FastAPI, HTTPException
from httpx import ASGITransport, AsyncClient

from app import main
from app.api import deps, schemas
from app.data.装载器 import 业务数据缺失, 装载器
from tests.造数据 import 样例表

测试基地址 = "http://测试"


async def 打(方法: str, 路径: str, **参数: Any) -> Any:
    """对真实的 `main.app` 发一个请求。"""
    交通 = ASGITransport(app=main.app)
    async with AsyncClient(transport=交通, base_url=测试基地址) as 客户端:
        return await 客户端.request(方法, 路径, **参数)


@pytest.fixture
def 合成装载器() -> Any:
    """把装载器依赖换成合成数据，跑完清掉。

    `autouse=False`：不是每个测试都要它（异常形状、CORS、配置那些不用）。
    """
    main.app.dependency_overrides[deps.取装载器] = lambda: 装载器.从表(样例表)
    yield
    main.app.dependency_overrides.clear()


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
    }
    assert set(会话["消息"][0]) == {
        "会话ID", "消息序号", "message_id", "发送时间", "角色", "买家昵称",
        "发送方", "店铺", "scene_major", "scene_minor", "is_target_buyer_message",
        "message_text", "内容类型", "chat_content", "category", "image_path",
        "关联订单号", "关联工单号", "署名",
    }


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
