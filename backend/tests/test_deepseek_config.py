"""切换默认供应商后，聊天请求和本地配置应走同一套值。"""

from types import SimpleNamespace

from app.llm import 客户端


def test_聊天默认DeepSeek并可从私有配置取密钥(monkeypatch):
    monkeypatch.delenv("PRIMER_LLM_KEY", raising=False)
    monkeypatch.delenv("PRIMER_LLM_BASE_URL", raising=False)
    monkeypatch.delenv("PRIMER_LLM_MODEL", raising=False)
    monkeypatch.setattr(
        客户端,
        "取配置",
        lambda: SimpleNamespace(LLM_KEY="private-key", LLM_BASE_URL="", LLM_MODEL=""),
    )
    assert 客户端.取密钥() == "private-key"
    assert 客户端.取地址() == "https://api.deepseek.com"
    assert 客户端.取模型() == "deepseek-flash"


def test_默认聊天请求关闭思考并保持JSON约束(monkeypatch):
    收到 = []

    def 假创建(**参数):
        收到.append(参数)
        消息 = SimpleNamespace(content='{"ok":true}')
        return SimpleNamespace(choices=[SimpleNamespace(message=消息)])

    假客户端 = SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=假创建)))
    monkeypatch.setattr(客户端, "_客户端", lambda 地址, 密钥: 假客户端)
    monkeypatch.setattr("app.费用控制.预扣调用", lambda: None)
    monkeypatch.setenv("PRIMER_LLM_KEY", "test-key")
    monkeypatch.delenv("PRIMER_LLM_MODEL", raising=False)
    monkeypatch.delenv("PRIMER_LLM_BASE_URL", raising=False)
    assert 客户端.问JSON("输出 JSON", "") == '{"ok":true}'
    assert 收到[0]["model"] == "deepseek-flash"
    assert 收到[0]["response_format"] == {"type": "json_object"}
    assert 收到[0]["extra_body"] == {"thinking": {"type": "disabled"}}
