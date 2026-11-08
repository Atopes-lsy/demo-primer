"""测试站整体访问密码；不代替顾客数据权限。"""

import base64
import hashlib
import hmac
import os
import secrets
import sqlite3
from contextlib import closing

from fastapi import Request
from fastapi.responses import JSONResponse

from .配置 import 取配置


def 顾客令牌(sid: str) -> str:
    token = secrets.token_urlsafe(32)
    with closing(sqlite3.connect(取配置().消息库路径)) as db:
        db.execute(
            "CREATE TABLE IF NOT EXISTS customer_tokens (hash TEXT PRIMARY KEY, sid TEXT NOT NULL)"
        )
        db.execute(
            "INSERT INTO customer_tokens VALUES (?, ?)",
            (hashlib.sha256(token.encode()).hexdigest(), sid),
        )
        db.commit()
    return token


def 查顾客(token: str) -> str | None:
    with closing(sqlite3.connect(取配置().消息库路径)) as db:
        db.execute(
            "CREATE TABLE IF NOT EXISTS customer_tokens (hash TEXT PRIMARY KEY, sid TEXT NOT NULL)"
        )
        row = db.execute(
            "SELECT sid FROM customer_tokens WHERE hash=?",
            (hashlib.sha256(token.encode()).hexdigest(),),
        ).fetchone()
    return row[0] if row else None


async def 验证访问(request: Request, call_next):
    token = request.headers.get("x-primer-customer-token", "") or request.query_params.get(
        "token", ""
    )
    if not token and not request.headers.get("authorization"):
        token = request.cookies.get("primer_customer", "")
    if token:
        sid = 查顾客(token)
        if not sid:
            return JSONResponse({"错误": "顾客访问链接无效"}, status_code=401)
        request.state.customer_sid = sid
        path = request.url.path
        allowed = (
            request.method == "GET"
            and (path == "/" or path.startswith("/assets/") or path == "/api/会话列表")
        ) or (request.method == "POST" and path == f"/api/会话/{sid}/顾客消息")
        if not allowed:
            return JSONResponse({"错误": "顾客无权执行此操作"}, status_code=403)
        response = await call_next(request)
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Cache-Control"] = "no-store"
        if request.query_params.get("token"):
            response.set_cookie(
                "primer_customer",
                token,
                httponly=True,
                secure=request.url.scheme == "https",
                samesite="strict",
            )
        return response
    password = os.getenv("PRIMER_ACCESS_PASSWORD", "") or 取配置().ACCESS_PASSWORD
    if password:
        expected = f"{os.getenv('PRIMER_ACCESS_USER') or 取配置().ACCESS_USER}:{password}"
        try:
            scheme, token = request.headers.get("authorization", "").split(" ", 1)
            supplied = (
                base64.b64decode(token, validate=True).decode() if scheme.lower() == "basic" else ""
            )
        except (ValueError, UnicodeError):
            supplied = ""
        if not hmac.compare_digest(supplied.encode(), expected.encode()):
            return JSONResponse(
                {"错误": "请登录测试站"},
                status_code=401,
                headers={"WWW-Authenticate": 'Basic realm="Primer", charset="UTF-8"'},
            )
    elif not request.client or request.client.host not in ("127.0.0.1", "::1", "testclient"):
        return JSONResponse({"错误": "未配置访问密码，仅允许本机访问"}, status_code=403)
    return await call_next(request)
