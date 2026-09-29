"""HTTP 路由。

**步骤 1 只有两个只读接口**，`docs/接口契约.md` 第二节那张表的头两行。

顺序是刻意的：先写这两个最简单的，验证的是「前后端能通」这件事本身 ——
Vite 代理配没配对、CORS 过不过、中文经不经得起 JSON 往返。这些坑在五分钟的
接口上暴露，比在判定接口上暴露便宜得多。

`POST /api/判定` 是步骤 2，写在另一个模块里（它要挂三个还没实现的模型位）。
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from ..data.装载器 import 装载器
from . import deps, schemas

router = APIRouter()

业务数据 = Annotated[装载器, Depends(deps.取装载器)]
"""装载好的业务数据。两个只读接口都要它。

写成 `Annotated` 而不是 `装: 装载器 = Depends(...)`：后者是 ruff 的 B008
（函数调用出现在参数默认值里），而 `Annotated` 本来就是 `Depends` 的
现代写法 —— 顺手把 lint 的例外也免了，不用挂 `# noqa`。
"""


@router.get("/healthz", summary="活着没")
def 健康检查(装: 业务数据) -> dict[str, object]:
    """带会话数，不是单纯的 `{"ok": true}`。

    装载器读到空表时 `{"ok": true}` **也是 true** —— 那时候
    「前后端通了没有」这个问题的答案就变成假的了。带上计数，
    `curl` 一眼能看出数据到底在不在。
    """
    return {"ok": True, "会话数": len(装.会话列表)}


@router.get("/api/会话列表", response_model=list[schemas.Session], summary="左侧列表 ＋ 中部聊天区")
def 会话列表(装: 业务数据) -> list[schemas.Session]:
    """全部会话，按会话 ID 排序。

    **没有分页、没有筛选**：138 个会话一次给完，前端左侧列表本来就是全量渲染
    （它现在读的就是一份写死的全量数组）。等真有几千个会话再说。
    """
    return 装.会话列表
