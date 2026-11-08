"""真实API/SQLite的转交约束；判定采用测试替身。"""

import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

import pytest

from app import main
from app.api import deps, 台账
from app.data.运行时消息 import 已转交错误, 消息库
from tests.test_动作 import _打, 净台账, 判定一次, 真装, 装了  # noqa: F401

pytestmark = pytest.mark.usefixtures("装了")


def library():
    return main.app.dependency_overrides[deps.取消息库]()


async def test_需要转交但尚未点击也不能发送():
    await 判定一次("S_DEMO_B", 轮次=1)
    response = await _打(
        "POST", "/api/会话/S_DEMO_B/发送", 轮次=1, 话术="绕过按钮", 采用的处置id=[]
    )
    assert response.status_code == 409
    assert library().取("S_DEMO_B") == []
    assert 台账.已发送("S_DEMO_B", 1) == []


async def test_重判与内存清空不能解除转交():
    await 判定一次("S_DEMO_B", 轮次=1)
    response = await _打("POST", "/api/会话/S_DEMO_B/转交", 轮次=1)
    assert response.status_code == 200
    ticket = response.json()["单号"]
    台账.清空()
    # 用不受风险触发的另一会话验证持久锁，不依赖当前判定仍为转交。
    library().转出("S_DEMO_A", ticket)
    await 判定一次("S_DEMO_A", 轮次=1)
    response = await _打(
        "POST", "/api/会话/S_DEMO_A/发送", 轮次=1, 话术="重判后仍不能发", 采用的处置id=[]
    )
    assert response.status_code == 409
    sessions = (await _打("GET", "/api/会话列表")).json()
    assert next(s for s in sessions if s["会话ID"] == "S_DEMO_B")["转交"]["工单号"] == ticket
    assert (await _打("POST", "/api/会话/S_DEMO_A/顾客消息", 内容="补充说明")).status_code == 201


async def test_旧批准原文也不能越过转交():
    await 判定一次("S_DEMO_A", 轮次=2)
    base = "/api/会话/S_DEMO_A/审批"
    ticket = (await _打("POST", base, 轮次=2, 话术="已批准的回复", 顾客消息ID="")).json()
    path = f"{base}/{ticket['id']}"
    assert (await _打("POST", path + "/批准")).status_code == 200
    library().转出("S_DEMO_A", "handover-test")
    assert (await _打("POST", path + "/发送")).status_code == 409
    assert library().取("S_DEMO_A") == []


def test_独立进程读取转交后仍禁止AI发送(request):
    db = library()
    db.转出("S_DEMO_A", "persisted-test")
    code = """
import sys
from pathlib import Path
from app.data.运行时消息 import 消息库, 已转交错误
from app.api.schemas import Session
store = 消息库(Path(sys.argv[1]))
assert store.转交单号("S_DEMO_A") == "persisted-test"
try:
    store.保存文本(Session.model_validate_json(sys.stdin.read()), "AI迟到回复", "AI")
except 已转交错误:
    print("blocked")
else:
    raise AssertionError("转交锁在重启后丢失")
"""
    result = subprocess.run(
        [sys.executable, "-X", "utf8", "-c", code, str(db.路径)],
        input=request.getfixturevalue("真装").找("S_DEMO_A").model_dump_json(),
        text=True,
        encoding="utf-8",
        capture_output=True,
        cwd=str(__import__("pathlib").Path(__file__).resolve().parents[1]),
    )
    assert result.returncode == 0, result.stderr
    assert result.stdout.strip() == "blocked"
    assert db.取("S_DEMO_A") == []


def test_转交与发送并发只能在线性顺序前发送(request):
    db = library()
    session = request.getfixturevalue("真装").找("S_DEMO_A")

    def send(i):
        try:
            return db.保存文本(session, f"回复{i}", "客服")
        except 已转交错误:
            return None

    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(send, i) for i in range(12)]
        pool.submit(db.转出, "S_DEMO_A", "concurrent").result()
        after = len(db.取("S_DEMO_A"))
        for i in range(12, 24):
            assert pool.submit(send, i).result() is None
        for future in futures:
            future.result()
    assert len(db.取("S_DEMO_A")) == after
    assert 消息库(db.路径).转交单号("S_DEMO_A") == "concurrent"


async def test_转交后重放已发送请求仍被拒绝():
    await 判定一次("S_DEMO_A", 轮次=1)
    payload = dict(轮次=1, 话术="先前回复", 采用的处置id=[], 请求ID="replay-after-transfer")
    assert (await _打("POST", "/api/会话/S_DEMO_A/发送", **payload)).status_code == 200
    library().转出("S_DEMO_A", "replay-lock")
    response = await _打("POST", "/api/会话/S_DEMO_A/发送", **payload)
    assert response.status_code == 409
    assert len(library().取("S_DEMO_A")) == 1
