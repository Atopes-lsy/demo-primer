"""工作台刷新恢复：读取持久显示状态不能触发模型或新消息。"""

import pytest

from app import main
from app.api import deps, 台账
from tests.test_动作 import _打, 净台账, 判定一次, 真装, 装了  # noqa: F401

pytestmark = pytest.mark.usefixtures("装了")
BASE = "/api/会话/S_DEMO_A"


async def test_判定报备与批准发送状态可恢复():
    decision = await 判定一次(轮次=2)
    report = (await _打("POST", BASE + "/报备", 轮次=2)).json()
    saved = (await _打("GET", BASE + "/工作台状态")).json()
    assert saved["判定"] == decision
    assert saved["报备"]["工单号"] == report["单号"]
    assert saved["报备态"] == "等审批"
    ticket = (
        await _打("POST", BASE + "/审批", 轮次=2, 话术="我继续核实进度", 顾客消息ID="")
    ).json()
    path = BASE + "/审批/" + ticket["id"]
    assert (await _打("POST", path + "/批准")).status_code == 200
    assert (await _打("GET", BASE + "/工作台状态")).json()["报备态"] == "等发送"
    assert (await _打("POST", path + "/发送")).status_code == 200
    # 清空进程内台账，每次请求重新打开SQLite，仍可读取完整卡片。
    台账.清空()
    main.app.dependency_overrides[deps.取模型位] = lambda: (_ for _ in ()).throw(
        AssertionError("恢复不能调用模型")
    )
    restored = (await _打("GET", BASE + "/工作台状态")).json()
    assert restored["判定"] == decision
    assert restored["报备"]["工单号"] == report["单号"]
    assert restored["报备态"] == "已答复"
    assert len(main.app.dependency_overrides[deps.取消息库]().取("S_DEMO_A")) == 1


async def test_新顾客消息不能恢复旧卡与旧报备():
    await 判定一次(轮次=2)
    await _打("POST", BASE + "/报备", 轮次=2)
    incoming = (await _打("POST", BASE + "/顾客消息", 内容="新问题，请重新核实")).json()
    saved = (await _打("GET", BASE + "/工作台状态")).json()
    assert saved["顾客消息ID"] == incoming["message_id"]
    assert saved["判定"] is None and saved["报备"] is None


async def test_重判别的处置不能展示旧报备():
    await 判定一次(轮次=2)
    await _打("POST", BASE + "/报备", 轮次=2)
    new = await 判定一次(轮次=1)
    saved = (await _打("GET", BASE + "/工作台状态")).json()
    assert saved["判定"] == new
    assert saved["报备"] is None


async def test_没判定过状态为空():
    saved = (await _打("GET", BASE + "/工作台状态")).json()
    assert saved["判定"] is None and saved["报备"] is None


async def test_报备生成途中重判不得给旧交接包盖新版本(monkeypatch):
    from dataclasses import replace

    from app.api import 动作
    from app.api.审批 import 判定版本

    await 判定一次(轮次=2)
    original = 动作._交接

    def raced(*args, **kwargs):
        receipt = original(*args, **kwargs)
        store = main.app.dependency_overrides[deps.取消息库]()
        conn = store._连接()
        try:
            old = 台账.取("S_DEMO_A")
            changed = replace(
                old,
                本轮处置=tuple(
                    d.model_copy(update={"主张": "重判后的另一个主张"}) for d in old.本轮处置
                ),
            )
            monkeypatch.setattr(台账, "取", lambda sid: changed)
            conn.execute(
                "UPDATE approval_decisions SET revision=? WHERE sid='S_DEMO_A'",
                (判定版本(changed.本轮处置),),
            )
            conn.commit()
        finally:
            conn.close()
        return receipt

    monkeypatch.setattr(动作, "_交接", raced)
    assert (await _打("POST", BASE + "/报备", 轮次=2)).status_code == 409
    assert (await _打("GET", BASE + "/工作台状态")).json()["报备"] is None
