"""后端配置。

**这个文件存在的唯一理由还是路径**，但理由变了。业务数据文件原本在仓库外
（`Path.home()/Downloads`，`docs/开发步骤.md` 坑 2 记着当时的考量），
**2026-09-29 搬进了仓库根的 `data/`**。

搬进来之后，默认值必须是**从 `__file__` 算出来的绝对路径**，不能是相对
路径 —— 相对路径的基准是当前工作目录，而「从哪儿启动服务」在演示当天
由不得我们（IDE、`uvicorn`、测试各自的 CWD 都不一样）。算错的后果不是
随便用了一份数据，是 `业务数据缺失` 抛出来起不来，这点还算好。

换一份数据（比如赛题发新版本）就用环境变量：

    PRIMER_XLSX   业务数据.xlsx 的绝对路径
    PRIMER_CORS   额外放行的来源，JSON 数组，如 '["http://10.0.0.5:5173"]'
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

#: 仓库根。`配置.py` 在 `backend/app/` 下，往上是 app → backend → 根。
仓库根 = Path(__file__).resolve().parents[2]

#: 默认的业务数据位置 —— 仓库内，checkout 下来就有。
#:
#: 文件名里那个 `(1)` 是赛题文件的本来名字（浏览器下载留下的），不是我们加的
#: 版本号。**别顺手去掉** —— 去掉就指向一个不存在的文件，而报错在
#: `业务数据缺失` 那一层，不在这一层，改的人得自己想到是这儿。
#:
#: 和 `app/rules/koujing.py` 用的是同一套算法（那里是 `parents[3]`，它在
#: `app/rules/` 下多一层）。
默认业务数据 = 仓库根 / "data" / "赛题 1：数据共情者-业务数据(1).xlsx"

#: 本地开发的来源一律放行，**端口不限**。
#:
#: 不写死 5173：Vite 的默认端口被占用时会自己往上找（5174、5175…），
#: 而这件事发生在演示当天、发生在别人正在投屏的时候。写死端口的话，
#: 那种场面下的报错是「跨域被拦」，看起来和「后端没起来」一模一样。
本地来源 = r"http://(localhost|127\.0\.0\.1)(:\d+)?$"


class 配置(BaseSettings):
    """进程配置。`SettingsConfigDict` 的 `extra="ignore"` 是必要的 ——
    机器上通常还躺着别的 `PRIMER_*` 变量，不该因为不认识就起不来。"""

    model_config = SettingsConfigDict(env_prefix="PRIMER_", env_file=".env", extra="ignore")

    业务数据路径: Path = Field(
        default=默认业务数据,
        validation_alias=AliasChoices("PRIMER_XLSX", "业务数据路径"),
    )

    CORS来源: list[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("PRIMER_CORS", "CORS来源"),
    )
    """额外的放行来源（JSON 数组）。本地来源由 `本地来源` 那条正则兜住，不用写在这。

    演示时要投屏到另一台机器才需要它 —— 那种情况下把 http://<那台机器的IP>:5173
    加进来。
    """

    CORS来源正则: str = 本地来源


@lru_cache(maxsize=1)
def 取配置() -> 配置:
    """配置单例。读一次环境变量就够 —— 它在一个进程里不会变。"""
    return 配置()
