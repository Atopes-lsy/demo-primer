"""外部调用前原子预扣次数；失败也计费，重启不清零。"""

import os
import sqlite3
from contextlib import closing
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .配置 import 取配置


class 调用受限(RuntimeError):
    """可直接向界面说明的调用拦截，禁止作为普通模型故障吞掉。"""


def 预扣调用():
    配置 = 取配置()
    if os.getenv("PRIMER_LLM_ENABLED", "1" if 配置.LLM_ENABLED else "0") != "1":
        raise 调用受限("模型调用已关闭；设置 PRIMER_LLM_ENABLED=1 才可启用")
    path = Path(
        os.getenv(
            "PRIMER_BUDGET_DB", str(Path(__file__).resolve().parents[2] / "data" / "budget.sqlite3")
        )
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone(timedelta(hours=8)))
    day, minute = now.strftime("%Y-%m-%d"), now.strftime("%Y-%m-%d %H:%M")
    with closing(sqlite3.connect(path, timeout=10)) as db:
        db.execute(
            "CREATE TABLE IF NOT EXISTS budget (period TEXT PRIMARY KEY, count INTEGER NOT NULL)"
        )
        db.execute("BEGIN IMMEDIATE")
        for period, limit in (
            (day, int(os.getenv("PRIMER_LLM_DAILY_CALLS", str(配置.LLM_DAILY_CALLS)))),
            (minute, int(os.getenv("PRIMER_LLM_MINUTE_CALLS", str(配置.LLM_MINUTE_CALLS)))),
        ):
            row = db.execute("SELECT count FROM budget WHERE period=?", (period,)).fetchone()
            if (row[0] if row else 0) >= limit:
                raise 调用受限("模型调用额度已用完，请稍后重试或调整测试额度")
            db.execute(
                "INSERT INTO budget VALUES (?, 1) ON CONFLICT(period) DO UPDATE SET count=count+1",
                (period,),
            )
        db.commit()
