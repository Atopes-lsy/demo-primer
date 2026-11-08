"""审批集成：真实 API/SQLite，判定模型使用替身，不代表真实模型效果。"""

import asyncio

import pytest

from app import main
from app.api import deps, 台账
from tests.test_动作 import _打, 净台账, 判定一次, 真装, 装了  # noqa: F401

pytestmark = pytest.mark.usefixtures("装了")
BASE = "/api/会话/S_DEMO_A/审批"


async def submit(text="已核实，可以安排补发"):
    response = await _打("POST", BASE, 轮次=2, 话术=text, 顾客消息ID="")
    assert response.status_code == 200, response.text
    return response.json()


async def test_批准发送持久化并发幂等():
    await 判定一次(轮次=2)
    ticket = await submit()
    path = f"{BASE}/{ticket['id']}"
    assert (await _打("POST", path + "/发送")).status_code == 409
    assert (await _打("POST", path + "/批准")).status_code == 200
    # 清掉所有进程内判定状态；每个 API 请求重新打开 SQLite。
    台账.清空()
    assert (await _打("GET", BASE)).json()[0]["状态"] == "已批准"
    results = await asyncio.gather(*[_打("POST", path + "/发送") for _ in range(4)])
    assert all(r.status_code == 200 for r in results)
    ids = {r.json()["消息"]["message_id"] for r in results}
    assert len(ids) == 1
    library = main.app.dependency_overrides[deps.取消息库]()
    assert len([m for m in library.取("S_DEMO_A") if m.message_text == ticket["话术"]]) == 1
    assert (await _打("GET", BASE)).json()[0]["状态"] == "已发送"


async def test_修改必须重新批准():
    await 判定一次(轮次=2)
    first = await submit()
    assert (await _打("POST", f"{BASE}/{first['id']}/批准")).status_code == 200
    second = await submit("修改后的补发回复")
    assert (await _打("POST", f"{BASE}/{first['id']}/发送")).status_code == 409
    assert (await _打("POST", f"{BASE}/{second['id']}/发送")).status_code == 409
    assert (await _打("POST", f"{BASE}/{second['id']}/批准")).status_code == 200
    assert (await _打("POST", f"{BASE}/{second['id']}/发送")).status_code == 200


async def test_顾客新消息使批准失效():
    await 判定一次(轮次=2)
    ticket = await submit()
    path = f"{BASE}/{ticket['id']}"
    assert (await _打("POST", path + "/批准")).status_code == 200
    response = await _打("POST", "/api/会话/S_DEMO_A/顾客消息", 内容="地址变更了，请先不要补发")
    assert response.status_code == 201
    assert (await _打("POST", path + "/发送")).status_code == 409
    assert (
        await _打("POST", BASE, 轮次=2, 话术="旧回复", 顾客消息ID=response.json()["message_id"])
    ).status_code == 409


async def test_非授权判定不能提交():
    await 判定一次(轮次=1)
    assert (await _打("POST", BASE, 轮次=1, 话术="任意回复", 顾客消息ID="")).status_code == 409


async def test_顾客不能查询批准或发送(tmp_path, monkeypatch):
    from app import 访问控制
    from app.配置 import 配置

    library = main.app.dependency_overrides[deps.取消息库]()
    monkeypatch.setattr(访问控制, "取配置", lambda: 配置(_env_file=None, 消息库路径=library.路径))
    token = 访问控制.顾客令牌("S_DEMO_A")
    from httpx import ASGITransport, AsyncClient

    async with AsyncClient(
        transport=ASGITransport(app=main.app),
        base_url="http://test",
        headers={"X-Primer-Customer-Token": token},
    ) as client:
        for method, path in [
            ("GET", BASE),
            ("POST", BASE),
            ("POST", BASE + "/x/批准"),
            ("POST", BASE + "/x/发送"),
        ]:
            assert (await client.request(method, path)).status_code == 403


async def test_重新判定使旧审批失效():
    await 判定一次(轮次=2)
    ticket = await submit()
    path = f"{BASE}/{ticket['id']}"
    assert (await _打("POST", path + "/批准")).status_code == 200
    await 判定一次(轮次=1)
    assert (await _打("POST", path + "/发送")).status_code == 409


async def test_旧判定不能绕过已有审批普通发送():
    await 判定一次(轮次=2)
    await submit()
    await 判定一次(轮次=1)
    response = await _打(
        "POST", "/api/会话/S_DEMO_A/发送", 轮次=1, 话术="绕过审批", 采用的处置id=[]
    )
    assert response.status_code == 422
    assert "审批" in response.json()["错误"]
