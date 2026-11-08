"""从多个启动目录加载同一配置；仅使用临时配置，不读取或输出开发机密码。"""

import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest


@pytest.mark.parametrize("start", ["repository", "backend", "unrelated"])
@pytest.mark.parametrize("override", [False, True])
def test_不同启动目录保持登录隔离(tmp_path, start, override):
    root = tmp_path / "repository"
    backend = root / "backend"
    package = backend / "app"
    package.mkdir(parents=True)
    (package / "__init__.py").write_text("", encoding="utf-8")
    source = Path(__file__).resolve().parents[1] / "app"
    for name in ("配置.py", "访问控制.py"):
        shutil.copyfile(source / name, package / name)
    (backend / ".env").write_text(
        "PRIMER_ACCESS_USER=test-agent\nPRIMER_ACCESS_PASSWORD=临时测试口令\n", encoding="utf-8"
    )
    unrelated = tmp_path / "unrelated"
    unrelated.mkdir()
    # 工作目录里有另一个配置也不能覆盖应用自己的文件。
    for directory in (root, unrelated):
        (directory / ".env").write_text(
            "PRIMER_ACCESS_PASSWORD=wrong-directory\n", encoding="utf-8"
        )
    env = {k: v for k, v in os.environ.items() if not k.upper().startswith("PRIMER_")}
    env["PYTHONPATH"] = str(backend)
    env["PYTHONIOENCODING"] = "utf-8"
    if override:
        env["PRIMER_ACCESS_PASSWORD"] = "environment-wins"
    script = """
import asyncio
import base64
import sys
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from app.配置 import 配置, 取配置
from app.访问控制 import 验证访问
expected = "environment-wins" if sys.argv[1] == "True" else "临时测试口令"
assert 取配置().ACCESS_USER == "test-agent"
assert 取配置().ACCESS_PASSWORD == expected
assert 配置(_env_file=None).ACCESS_PASSWORD == (expected if sys.argv[1] == "True" else "")
app = FastAPI()
app.middleware("http")(验证访问)
@app.get("/")
@app.get("/api/probe")
def probe():
    return {"ok": True}
async def verify():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://127.0.0.1") as client:
        for path in ("/", "/api/probe"):
            assert (await client.get(path)).status_code == 401
            wrong = base64.b64encode(b"test-agent:wrong-directory").decode()
            response = await client.get(path, headers={"Authorization":"Basic " + wrong})
            assert response.status_code == 401
            token = base64.b64encode(("test-agent:" + expected).encode()).decode()
            response = await client.get(path, headers={"Authorization":"Basic " + token})
            assert response.status_code == 200
asyncio.run(verify())
print("configuration and auth passed")
"""
    result = subprocess.run(
        [sys.executable, "-c", script, str(override)],
        cwd={"repository": root, "backend": backend, "unrelated": unrelated}[start],
        env=env,
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=30,
    )
    assert result.returncode == 0, result.stderr
    assert result.stdout.strip() == "configuration and auth passed"
