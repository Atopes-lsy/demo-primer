"""本地运行时消息库。

赛题 xlsx 是只读的历史输入；顾客新发的话不能写回去。这里用单独的 SQLite 文件
保存工作台产生的消息。数据库路径可由 ``PRIMER_消息库`` 覆盖，测试则直接注入
临时路径，因此不会碰开发机上的真实记录。
"""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

from ..api import schemas
from ..rules.发送事实 import 查订单事实


class 已转交错误(ValueError):
    """会话归属已转出，不允许当前工作台继续回复。"""


class 消息库:
    def 保存文本(
        self,
        会话: schemas.Session,
        内容: str,
        角色: str,
        幂等键: str | None = None,
        审批ID: str | None = None,
        判定版本: str | None = None,
        顾客版本: str | None = None,
        复用已发: bool = False,
    ) -> schemas.ChatMessage:
        """分配序号和落库在同一写事务内，避免并发消息撞号。"""
        内容 = 内容.strip()
        if not 内容 or len(内容) > 4000:
            raise ValueError("消息必须为 1 到 4000 个非空白字符")
        连 = self._连接()
        try:
            连.execute("BEGIN IMMEDIATE")
            if (
                角色 != "买家"
                and 连.execute("SELECT 1 FROM handovers WHERE sid=?", (会话.会话ID,)).fetchone()
            ):
                raise 已转交错误("已转交专席，当前工作台不能继续发送")
            if 幂等键:
                existing = 连.execute(
                    "SELECT 载荷 FROM message_requests WHERE 会话ID=? AND 键=?",
                    (会话.会话ID, 幂等键),
                ).fetchone()
                if existing:
                    message = schemas.ChatMessage.model_validate_json(existing[0])
                    if 复用已发 and 角色 == "AI" and message.角色 == "AI":
                        return message
                    if message.message_text != 内容 or message.角色 != 角色:
                        raise ValueError("同一请求标识不能提交不同内容")
                    return message
            # 发送原文按服务端订单核验；审批也不能覆盖事实冲突。
            # 放在审批完成与消息落库之前，失败时不产生发送或幂等记录。
            if 角色 != "买家" and 会话.订单 is not None:
                conflict = 查订单事实(
                    内容, 发货时间=会话.订单.发货时间, 订单状态=会话.订单.订单状态
                )
                if conflict:
                    raise ValueError(conflict)
            rows = 连.execute(
                "SELECT 载荷 FROM runtime_messages WHERE 会话ID=? ORDER BY 消息序号", (会话.会话ID,)
            ).fetchall()
            buyers_now = [
                json.loads(r[0])["message_id"] for r in rows if json.loads(r[0])["角色"] == "买家"
            ]
            current_buyer = buyers_now[-1] if buyers_now else ""
            if 顾客版本 is not None and 顾客版本 != current_buyer:
                raise ValueError("顾客有新消息，请重新判定")
            if 判定版本 is not None:
                context = 连.execute(
                    "SELECT buyer, revision FROM approval_decisions WHERE sid=?", (会话.会话ID,)
                ).fetchone()
                if not context or tuple(context) != (current_buyer, 判定版本):
                    raise ValueError("判定已过期，请重新判定")
                tickets = 连.execute(
                    "SELECT 载荷 FROM approvals WHERE sid=?", (会话.会话ID,)
                ).fetchall()
                if any(
                    json.loads(r[0])["顾客消息ID"] == current_buyer
                    and json.loads(r[0])["状态"] in ("等待审批", "已批准")
                    for r in tickets
                ):
                    raise ValueError("存在待处理审批，请从审批单发送")
            if 审批ID:
                approval = 连.execute(
                    "SELECT 载荷 FROM approvals WHERE id=? AND sid=?", (审批ID, 会话.会话ID)
                ).fetchone()
                if not approval:
                    raise ValueError("审批单不存在")
                ticket = json.loads(approval[0])
                context = 连.execute(
                    "SELECT buyer, revision FROM approval_decisions WHERE sid=?", (会话.会话ID,)
                ).fetchone()
                if not context or tuple(context) != (ticket["顾客消息ID"], ticket["判定版本"]):
                    raise ValueError("判定已更新，请重新提交审批")
                rows = 连.execute(
                    "SELECT 载荷 FROM runtime_messages WHERE 会话ID=? ORDER BY 消息序号",
                    (会话.会话ID,),
                ).fetchall()
                buyers = [
                    json.loads(r[0])["message_id"]
                    for r in rows
                    if json.loads(r[0])["角色"] == "买家"
                ]
                if ticket["状态"] != "已批准" or ticket["话术"] != 内容:
                    raise ValueError("只能发送已批准的原文")
                if (buyers[-1] if buyers else "") != ticket["顾客消息ID"]:
                    raise ValueError("顾客有新消息，请重新提交审批")
                ticket["状态"] = "已发送"
                连.execute(
                    "UPDATE approvals SET 载荷=? WHERE id=?",
                    (json.dumps(ticket, ensure_ascii=False), 审批ID),
                )
            row = 连.execute(
                "SELECT MAX(消息序号) FROM runtime_messages WHERE 会话ID=?", (会话.会话ID,)
            ).fetchone()
            序号 = max(row[0] or 0, max((m.消息序号 for m in 会话.消息), default=0)) + 1
            消息 = schemas.ChatMessage(
                会话ID=会话.会话ID,
                消息序号=序号,
                message_id=f"{会话.会话ID}.runtime.{序号}",
                发送时间=datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S"),
                角色=角色,
                买家昵称=会话.买家昵称,
                发送方=会话.买家昵称 if 角色 == "买家" else f"{会话.店铺}:客服",
                店铺=会话.店铺,
                scene_major="",
                scene_minor="",
                is_target_buyer_message=角色 == "买家",
                message_text=内容,
                内容类型="文本",
                chat_content=json.dumps([{"index": 0, "content": 内容}], ensure_ascii=False),
                category="service",
                image_path="",
                关联订单号="",
                关联工单号="",
            )
            连.execute(
                "INSERT INTO runtime_messages VALUES (?, ?, ?)",
                (消息.会话ID, 序号, 消息.model_dump_json()),
            )
            if 幂等键:
                连.execute(
                    "INSERT INTO message_requests VALUES (?, ?, ?)",
                    (会话.会话ID, 幂等键, 消息.model_dump_json()),
                )
            连.commit()
            return 消息
        finally:
            连.close()

    def __init__(self, 路径: Path) -> None:
        self.路径 = 路径
        路径.parent.mkdir(parents=True, exist_ok=True)
        连 = self._连接()
        try:
            连.execute(
                """CREATE TABLE IF NOT EXISTS runtime_messages (
                    会话ID TEXT NOT NULL,
                    消息序号 INTEGER NOT NULL,
                    载荷 TEXT NOT NULL,
                    PRIMARY KEY (会话ID, 消息序号)
                )"""
            )
            连.execute(
                "CREATE TABLE IF NOT EXISTS message_requests ("
                "会话ID TEXT NOT NULL, 键 TEXT NOT NULL, 载荷 TEXT NOT NULL,"
                "PRIMARY KEY(会话ID, 键))"
            )
            连.execute(
                "CREATE TABLE IF NOT EXISTS approval_decisions "
                "(sid TEXT PRIMARY KEY, buyer TEXT NOT NULL, revision TEXT NOT NULL)"
            )
            连.execute(
                "CREATE TABLE IF NOT EXISTS approvals "
                "(id TEXT PRIMARY KEY, sid TEXT NOT NULL, 载荷 TEXT NOT NULL)"
            )
            连.execute(
                "CREATE TABLE IF NOT EXISTS handovers (sid TEXT PRIMARY KEY, ticket TEXT NOT NULL)"
            )
            连.execute(
                "CREATE TABLE IF NOT EXISTS workbench_decisions "
                "(sid TEXT PRIMARY KEY, payload TEXT NOT NULL)"
            )
            连.execute(
                "CREATE TABLE IF NOT EXISTS workbench_reports "
                "(sid TEXT PRIMARY KEY, buyer TEXT NOT NULL, "
                "revision TEXT NOT NULL, payload TEXT NOT NULL)"
            )
            连.commit()
        finally:
            连.close()

    def 转出(self, sid: str, ticket: str) -> str:
        连 = self._连接()
        try:
            连.execute("BEGIN IMMEDIATE")
            连.execute("INSERT OR IGNORE INTO handovers VALUES (?, ?)", (sid, ticket))
            保存号 = 连.execute("SELECT ticket FROM handovers WHERE sid=?", (sid,)).fetchone()[0]
            连.commit()
            return 保存号
        finally:
            连.close()

    def 转交单号(self, sid: str) -> str | None:
        连 = self._连接()
        try:
            row = 连.execute("SELECT ticket FROM handovers WHERE sid=?", (sid,)).fetchone()
            return row[0] if row else None
        finally:
            连.close()

    def _连接(self) -> sqlite3.Connection:
        return sqlite3.connect(self.路径)

    def 追加(self, 消息: schemas.ChatMessage) -> None:
        连 = self._连接()
        try:
            连.execute(
                "INSERT INTO runtime_messages (会话ID, 消息序号, 载荷) VALUES (?, ?, ?)",
                (消息.会话ID, 消息.消息序号, json.dumps(消息.model_dump(), ensure_ascii=False)),
            )
            连.commit()
        finally:
            连.close()

    def 取(self, 会话ID: str) -> list[schemas.ChatMessage]:
        连 = self._连接()
        try:
            行 = 连.execute(
                "SELECT 载荷 FROM runtime_messages WHERE 会话ID = ? ORDER BY 消息序号", (会话ID,)
            ).fetchall()
        finally:
            连.close()
        return [schemas.ChatMessage.model_validate_json(载荷) for (载荷,) in 行]
