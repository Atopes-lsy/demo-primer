"""独立本地验收入口：合成数据/模型替身，生产入口不导入本文件。"""

# 环境隔离必须早于应用导入，防止配置缓存读到真实数据库。
# ruff: noqa: E402
import os
from pathlib import Path

path = Path(os.environ["PRIMER_E2E_DB"]).resolve()
if path.exists():
    raise RuntimeError("每次验收必须使用新的隔离数据库")
os.environ.update(
    PRIMER_ACCESS_USER="qa-agent", PRIMER_ACCESS_PASSWORD="qa-local-only", PRIMER_LLM_ENABLED="0"
)
os.environ["PRIMER_消息库"] = str(path)
from app import main
from app.api import deps
from app.data.演示会话 import 演示表
from app.data.装载器 import 装载器
from app.llm import 客户端
from app.检索 import 先例库
from tests.test_动作 import _假生成话术
from tests.假模型 import 假拆需求, 假认权限

# 原合成表仅供订单/工单/历史结构；当日新问题由浏览器自由输入。
tables = 演示表()
for rows in tables.values():
    for row in rows:
        for key, value in list(row.items()):
            if isinstance(value, str):
                row[key] = (
                    value.replace("S_DEMO_A", "QA_A")
                    .replace("S_DEMO_B", "QA_B")
                    .replace("2026-09-", "2026-10-")
                    .replace("小鹿", "测试顾客甲")
                    .replace("阿沅", "测试顾客乙")
                )
tables["聊天记录"] = [r for r in tables["聊天记录"] if r["发送时间"] < "2026-10-29"]
loader = 装载器.从表(tables)
main.app.dependency_overrides[deps.取装载器] = lambda: loader
main.启动装配 = lambda: None


def deny(*args, **kwargs):
    raise AssertionError("禁止真实模型调用")


客户端._客户端 = deny
先例库.库路径 = path.parent / "absent-precedents.json"
models = deps.取模型位()
main.app.dependency_overrides[deps.取模型位] = lambda: deps.模型位(
    拆主张=lambda text, *args, **kwargs: [text.strip()],
    认口径=lambda claim, *args, **kwargs: "K05" if "赠品" in claim else None,
    查六源=models.查六源,
    生成话术=_假生成话术,
    认诉求=lambda text, *args, **kwargs: text.strip(),
    认权限=假认权限,
    拆需求=假拆需求,
)
app = main.app
