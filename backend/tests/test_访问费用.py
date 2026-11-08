import base64

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from app.访问控制 import 验证访问
from app.费用控制 import 预扣调用


async def test_整站需要密码(monkeypatch):
    monkeypatch.setenv("PRIMER_ACCESS_PASSWORD", "test-only-password")
    app = FastAPI()
    app.middleware("http")(验证访问)

    @app.get("/")
    def home():
        return {"ok": True}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost") as client:
        assert (await client.get("/")).status_code == 401
        token = base64.b64encode(b"primer:test-only-password").decode()
        assert (
            await client.get("/", headers={"Authorization": f"Basic {token}"})
        ).status_code == 200


async def test_顾客令牌只能访问自己会话(monkeypatch):
    import app.访问控制 as access

    monkeypatch.setattr(access, "查顾客", lambda token: "S1" if token == "valid" else None)
    app = FastAPI()
    app.middleware("http")(验证访问)

    @app.get("/api/会话列表")
    def sessions():
        return []

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost") as client:
        assert (
            await client.get("/api/会话列表", headers={"X-Primer-Customer-Token": "valid"})
        ).status_code == 200
        assert (
            await client.post("/api/判定", headers={"X-Primer-Customer-Token": "valid"})
        ).status_code == 403
        assert (
            await client.post("/api/会话/S2/顾客消息", headers={"X-Primer-Customer-Token": "valid"})
        ).status_code == 403
        assert (
            await client.get("/api/会话列表", headers={"X-Primer-Customer-Token": "bad"})
        ).status_code == 401


def test_关闭和持久额度(monkeypatch, tmp_path):
    monkeypatch.setenv("PRIMER_BUDGET_DB", str(tmp_path / "budget.db"))
    monkeypatch.setenv("PRIMER_LLM_ENABLED", "0")
    with pytest.raises(RuntimeError, match="关闭"):
        预扣调用()
    monkeypatch.setenv("PRIMER_LLM_ENABLED", "1")
    monkeypatch.setenv("PRIMER_LLM_DAILY_CALLS", "2")
    monkeypatch.setenv("PRIMER_LLM_MINUTE_CALLS", "10")
    预扣调用()
    预扣调用()
    with pytest.raises(RuntimeError, match="额度"):
        预扣调用()
