"""实时列表不能套用历史来访的末句去尾规则。"""

import pytest

from app import main
from app.api import deps
from tests.test_动作 import _打, 净台账, 真装, 装了  # noqa: F401

pytestmark = pytest.mark.usefixtures("装了")


async def summary():
    response = await _打("GET", "/api/会话列表")
    assert response.status_code == 200
    session = next(s for s in response.json() if s["会话ID"] == "S_DEMO_A")
    return next(r["值"] for r in session["顾客情况"] if r["标签"] == "这次要什么")


async def test_连续新问题回复后刷新仍保留最新诉求():
    for text in ("请核实瓶盖清洁方法QA", "另外请核实保质期QA"):
        assert (await _打("POST", "/api/会话/S_DEMO_A/顾客消息", 内容=text)).status_code == 201
        assert text in await summary()
    store = main.app.dependency_overrides[deps.取消息库]()
    session = main.app.dependency_overrides[deps.取装载器]().找("S_DEMO_A")
    store.保存文本(session, "我会核实后回复", "客服")
    # 两次列表读取模拟轮询/刷新，不依赖判定或模型。
    for _ in range(2):
        value = await summary()
        assert "请核实瓶盖清洁方法QA" in value
        assert "另外请核实保质期QA" in value
    other = (await _打("GET", "/api/会话列表")).json()
    b = next(s for s in other if s["会话ID"] == "S_DEMO_B")
    assert "保质期QA" not in str(b["顾客情况"])


def test_前次来访实时问题不改变本次历史去尾(request):
    from app.api.判定 import 整会话顾客情况

    original = request.getfixturevalue("真装").找("S_DEMO_A")

    def value(session):
        return next(r.值 for r in 整会话顾客情况(session) if r.标签 == "这次要什么")

    prefix = original.消息[0].model_copy(
        update={"message_id": "older.runtime.1", "角色": "买家", "message_text": "前次问题不应混入"}
    )
    combined = original.model_copy(update={"消息": [prefix, *original.消息], "起演格": 1})
    assert value(combined) == value(original)
    assert "前次问题不应混入" not in value(combined)


def test_仅新增客服消息不改变历史摘要(request):
    from app.api.判定 import 整会话顾客情况

    original = request.getfixturevalue("真装").找("S_DEMO_A")
    reply = original.消息[-1].model_copy(
        update={"message_id": "S_DEMO_A.runtime.99", "角色": "客服", "message_text": "客服备注"}
    )
    changed = original.model_copy(update={"消息": [*original.消息, reply]})

    def value(session):
        return next(r.值 for r in 整会话顾客情况(session) if r.标签 == "这次要什么")

    assert value(changed) == value(original)
