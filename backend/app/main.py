"""FastAPI 应用 —— 骨架、CORS、统一异常。

起法：

    cd backend && PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe \\
        -m uvicorn app.main:app --reload

（`PYTHONIOENCODING=utf-8` 不是可选的：少了它中文日志在 Windows 控制台上是乱码，
看报错原因都得猜。`docs/开发步骤.md` 坑 1。）

# 为什么「缺数据文件」要在这里炸

`启动装配` 在读不到 `业务数据.xlsx` 时**直接让进程起不来**。另一种写法是
返回空列表让服务活着，代价是 `/api/会话列表` 会返回 `[]` 加一个 200 ——
于是「前后端通了没有」得到的是假答案，排查方向会指向前端、指向代理、
指向 CORS，全都不对。缺文件是最容易修的一种故障（设一个环境变量），
不该让它伪装成最难查的那种。
"""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from .api import deps, 判定, 动作, 留痕, 需求分解, 路由
from .配置 import 仓库根, 取配置

日志 = logging.getLogger(__name__)


def 启动装配() -> None:
    """启动时该做完的事：读配置、把业务数据装进内存。

    **故意做成会抛的。** 它抛，`uvicorn` 就起不来；起不来比「起来了但没数据」
    好查得多。测试里 `ASGITransport` 不发 lifespan 事件，所以这个函数不会
    被间接执行 —— 那条路径由 `test_数据文件不在时启动就炸` 直接盯着。
    """
    配置 = 取配置()
    存档 = deps.取装载器()
    日志.info(
        "业务数据已装载：%d 个会话（%s）",
        len(存档.会话列表),
        配置.业务数据路径,
    )
    # 留痕的模型调用钩子。**接线放这儿，不做模块级副作用** ——
    # 模块级的话，`llm/客户端` 会在 import 期间就和 `api/` 缠上，
    # 而「`llm/` 不许反向 import `api/`」是模型线与接口线之间的那堵墙。
    #
    # 测试走 `ASGITransport` 不触发 lifespan ⇒ 测试里钩子一直是 `None`，
    # 单测不会顺手去打真模型。要测记录的那几条自己接（`留痕.接模型钩子`）。
    留痕.接模型钩子()


@asynccontextmanager
async def 生命周期(应用: FastAPI) -> AsyncIterator[None]:
    启动装配()
    yield


def 装异常处理(应用: FastAPI) -> None:
    """把两类报错收敛成同一个形状：`{"错误": …, "详情": …}`。

    FastAPI 默认给的是 `{"detail": …}`，而校验错给的是 `{"detail": [...]}` ——
    同一个键名，两种类型。前端要写两个分支去取错误文案，但界面上只有一个地方
    显示错误，第二个分支永远不会被写；出错时界面上什么都不显示。

    所以统一成「一句话中文 ＋ 一段给人看的补充」：`错误` 可以**直接显示**，
    `详情` 是排障用的，前端可以只显示它。
    """

    @应用.exception_handler(StarletteHTTPException)
    async def _http错误(请求: Request, 异常: StarletteHTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=异常.status_code,
            content={"错误": str(异常.detail), "详情": ""},
        )

    @应用.exception_handler(RequestValidationError)
    async def _参数错误(请求: Request, 异常: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={"错误": "请求参数不合法", "详情": _说明(异常)},
        )


def _说明(异常: RequestValidationError) -> str:
    """pydantic 的报错压成一行。

    只取 `loc` / `msg` / `type` 三个键 —— `errors()` 里还带着 `ctx`，
    而 `ctx` 里可能有不能 JSON 序列化的对象（正则在里面就是一个 `Pattern`）。
    整个塞进响应的话，会在**报错的时候再报一次错**，而这次是 500。
    """
    return "；".join(
        f"{'.'.join(str(段) for 段 in 错.get('loc', ()))}: {错.get('msg', '')}"
        for 错 in 异常.errors()
    )


def 装CORS(应用: FastAPI) -> None:
    """放行本地开发来源。端口不限，理由见 `app/配置.py` 的 `本地来源`。"""
    配置 = 取配置()
    应用.add_middleware(
        CORSMiddleware,
        allow_origins=配置.CORS来源,
        allow_origin_regex=配置.CORS来源正则,
        allow_methods=["*"],
        allow_headers=["*"],
    )


#: 前端构建产物。`npm run build` 落在 `frontend/dist/`。
#:
#: **不在 git 里**（`.gitignore` 挡着），所以全新 checkout 上没有这一份 ——
#: 下面那个函数必须容忍它缺席，见那里。
前端产物 = 仓库根 / "frontend" / "dist"


def 装静态(应用: FastAPI) -> None:
    """把前端产物挂到 `/`，让**一个端口**把整站供出去。

    给出去的那份交付包就靠它：学生双击一个 `.bat`，没有 vite、没有 node、
    没有第二个窗口，浏览器开 `http://localhost:8000/` 就是完整的界面。
    前端那边所有请求本来就是相对路径（`fetch('/api/判定')`），同源之后
    `vite.config.ts` 里那段代理**在生产路径上根本用不着** —— 那句注释
    「生产同源部署，这一整块用不上」写在那很久了，这里才把它兑现。

    **没有 `dist/` 就不挂，也不报错。** 全新 checkout 上没有这一份，而开发时
    前端跑的是 vite 自己的 5173；这里再挂一份只会多出一个会漂移的副本，让人
    分不清屏幕上看到的是哪一份。

    挂载放在**最后**（所有 `include_router` 之后）：Starlette 按注册顺序匹配，
    `/api/*` 和 `/healthz` 先注册就先命中，这条 `/` 只兜没人认领的路径。
    """
    if not 前端产物.is_dir():
        日志.info(
            "没有前端产物（%s）—— 只提供接口，界面走 vite 的开发服务器",
            前端产物,
        )
        return
    应用.mount("/", StaticFiles(directory=前端产物, html=True), name="前端")


app = FastAPI(
    title="Primer 判定服务",
    description="千牛客服工作台右栏插件的后端。契约见 docs/接口契约.md。",
    version="0.1.0",
    lifespan=生命周期,
)

装异常处理(app)
装CORS(app)
app.include_router(路由.router)
app.include_router(判定.router)
app.include_router(动作.router)
app.include_router(留痕.router)
app.include_router(需求分解.router)

装静态(app)
