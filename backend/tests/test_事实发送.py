"""事实发送约束：判定使用替身，HTTP与SQLite真实执行。"""

import pytest

from app import main
from app.api import deps, 台账
from tests.test_动作 import _打, 净台账, 判定一次, 真装, 装了  # noqa: F401

pytestmark = pytest.mark.usefixtures("装了")


async def test_直接API不能发送与订单冲突的发货事实():
    await 判定一次("S_DEMO_A", 轮次=1)
    session = main.app.dependency_overrides[deps.取装载器]().找("S_DEMO_A")
    assert not session.订单.发货时间
    response = await _打(
        "POST",
        "/api/会话/S_DEMO_A/发送",
        轮次=1,
        话术="赠品已经发出了",
        采用的处置id=[],
        请求ID="fact-fail",
    )
    assert response.status_code == 422, response.text
    assert "事实不一致" in response.json()["错误"]
    store = main.app.dependency_overrides[deps.取消息库]()
    assert store.取("S_DEMO_A") == []
    assert 台账.已发送("S_DEMO_A", 1) == []
    # 失败不占用请求ID，修改为核实回复可以正常送出。
    response = await _打(
        "POST",
        "/api/会话/S_DEMO_A/发送",
        轮次=1,
        话术="我马上帮您核实发出时间",
        采用的处置id=[],
        请求ID="fact-fail",
    )
    assert response.status_code == 200, response.text


async def test_批准不能覆盖事实冲突且失败不改变批准状态():
    await 判定一次("S_DEMO_A", 轮次=2)
    base = "/api/会话/S_DEMO_A/审批"
    result = await _打("POST", base, 轮次=2, 话术="赠品已经发货", 顾客消息ID="")
    assert result.status_code == 200
    path = f"{base}/{result.json()['id']}"
    assert (await _打("POST", path + "/批准")).status_code == 200
    response = await _打("POST", path + "/发送")
    assert response.status_code == 409
    assert "事实不一致" in response.json()["错误"]
    assert (await _打("GET", base)).json()[0]["状态"] == "已批准"
    assert main.app.dependency_overrides[deps.取消息库]().取("S_DEMO_A") == []


@pytest.mark.parametrize("role", ["客服", "AI"])
@pytest.mark.parametrize("text", ["已经发出", "已 发货", "寄出了", "已经签收"])
def test_写入入口拒绝冲突并保持数据库为空(request, role, text):
    store = main.app.dependency_overrides[deps.取消息库]()
    original = request.getfixturevalue("真装").找("S_DEMO_A")
    session = original.model_copy(
        update={"订单": original.订单.model_copy(update={"发货时间": "", "订单状态": "待发货"})}
    )
    with pytest.raises(ValueError, match="事实不一致"):
        store.保存文本(session, text, role, "blocked-key")
    assert store.取(session.会话ID) == []


@pytest.mark.parametrize(
    "text", ["今天安排发出", "会尽快发出", "我先核实物流", "已经发出", "已经签收"]
)
def test_记录支持或未来核实回复允许发送(request, text):
    store = main.app.dependency_overrides[deps.取消息库]()
    original = request.getfixturevalue("真装").找("S_DEMO_A")
    session = original.model_copy(
        update={
            "订单": original.订单.model_copy(
                update={"发货时间": "2026-10-29 10:00:00", "订单状态": "已签收"}
            )
        }
    )
    assert store.保存文本(session, text, "客服").message_text == text


def test_顾客发言与无订单会话不作为事实冲突(request):
    store = main.app.dependency_overrides[deps.取消息库]()
    session = request.getfixturevalue("真装").找("S_DEMO_A")
    assert not session.订单.发货时间
    assert store.保存文本(session, "你们说已经发货", "买家").角色 == "买家"
    no_order = session.model_copy(update={"订单": None})
    assert store.保存文本(no_order, "已经发货", "客服").角色 == "客服"


@pytest.mark.parametrize("text", ["今天安排发出", "会尽快发出", "我先核实物流"])
def test_未发货不误拦未来或核实话术(request, text):
    store = main.app.dependency_overrides[deps.取消息库]()
    session = request.getfixturevalue("真装").找("S_DEMO_A")
    assert not session.订单.发货时间
    assert store.保存文本(session, text, "客服").message_text == text
