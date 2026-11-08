"""测试账号审批：批准绑定不可变草稿，发送与审批完成在同一 SQLite 事务。"""

import hashlib
import json
from contextlib import closing
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .动作 import _存档或409, 业务数据, 运行时消息

router = APIRouter()


class 提交请求(BaseModel):
    轮次: int
    话术: str = Field(min_length=1, max_length=4000)
    顾客消息ID: str


def 判定版本(dispositions):
    return hashlib.sha256(
        json.dumps(
            [d.model_dump(mode="json") for d in dispositions], ensure_ascii=False, sort_keys=True
        ).encode()
    ).hexdigest()


def 当前买家(库, sid):
    return next((m.message_id for m in reversed(库.取(sid)) if m.角色 == "买家"), "")


def 列表(库, sid):
    with closing(库._连接()) as conn:
        return [
            json.loads(r[0])
            for r in conn.execute(
                "SELECT 载荷 FROM approvals WHERE sid=? ORDER BY rowid DESC", (sid,)
            )
        ]


@router.get("/api/会话/{sid}/审批")
def 查询(sid: str, 库: 运行时消息):
    return 列表(库, sid)


@router.post("/api/会话/{sid}/审批")
def 提交(sid: str, 请求: 提交请求, 库: 运行时消息):
    record = _存档或409(sid, 请求.轮次)
    outputs = {d.输出 for d in record.本轮处置}
    if "转交" in outputs or "报备" not in outputs:
        raise HTTPException(409, "本轮不能提交授权审批")
    if not 请求.话术.strip():
        raise HTTPException(422, "回复不能为空")
    if 当前买家(库, sid) != 请求.顾客消息ID:
        raise HTTPException(409, "顾客消息已更新，请重新判定")
    ticket = {
        "id": uuid4().hex,
        "会话ID": sid,
        "轮次": 请求.轮次,
        "话术": 请求.话术.strip(),
        "顾客消息ID": 请求.顾客消息ID,
        "判定版本": 判定版本(record.本轮处置),
        "状态": "等待审批",
        "提交时间": datetime.now(UTC).isoformat(),
        "处置": [d.model_dump(mode="json") for d in record.本轮处置],
    }
    with closing(库._连接()) as conn:
        conn.execute("BEGIN IMMEDIATE")
        context = conn.execute(
            "SELECT buyer, revision FROM approval_decisions WHERE sid=?", (sid,)
        ).fetchone()
        if (
            not context
            or tuple(context) != (请求.顾客消息ID, ticket["判定版本"])
            or 当前买家(库, sid) != 请求.顾客消息ID
        ):
            raise HTTPException(409, "判定已过期，请重新判定后提交")
        for old_id, payload in conn.execute(
            "SELECT id, 载荷 FROM approvals WHERE sid=?", (sid,)
        ).fetchall():
            old = json.loads(payload)
            if old["状态"] in ("等待审批", "已批准"):
                old["状态"] = "已失效"
                conn.execute(
                    "UPDATE approvals SET 载荷=? WHERE id=?",
                    (json.dumps(old, ensure_ascii=False), old_id),
                )
        conn.execute(
            "INSERT INTO approvals VALUES (?, ?, ?)",
            (ticket["id"], sid, json.dumps(ticket, ensure_ascii=False)),
        )
        conn.commit()
    return ticket


@router.post("/api/会话/{sid}/审批/{ticket_id}/批准")
def 批准(sid: str, ticket_id: str, 库: 运行时消息):
    with closing(库._连接()) as conn:
        conn.execute("BEGIN IMMEDIATE")
        row = conn.execute(
            "SELECT 载荷 FROM approvals WHERE sid=? AND id=?", (sid, ticket_id)
        ).fetchone()
        if not row:
            raise HTTPException(404, "审批单不存在")
        ticket = json.loads(row[0])
        context = conn.execute(
            "SELECT buyer, revision FROM approval_decisions WHERE sid=?", (sid,)
        ).fetchone()
        if not context or tuple(context) != (ticket["顾客消息ID"], ticket["判定版本"]):
            raise HTTPException(409, "判定已更新，请重新提交审批")
        if ticket["状态"] != "等待审批":
            raise HTTPException(409, "该审批单已处理")
        if ticket["顾客消息ID"] != 当前买家(库, sid):
            raise HTTPException(409, "顾客有新消息，请重新提交")
        ticket.update(
            状态="已批准", 审批方式="测试账号自审批", 批准时间=datetime.now(UTC).isoformat()
        )
        conn.execute(
            "UPDATE approvals SET 载荷=? WHERE id=?",
            (json.dumps(ticket, ensure_ascii=False), ticket_id),
        )
        conn.commit()
    return ticket


@router.post("/api/会话/{sid}/审批/{ticket_id}/发送")
def 发送批准(sid: str, ticket_id: str, 库: 运行时消息, 装: 业务数据):
    ticket = next((t for t in 列表(库, sid) if t["id"] == ticket_id), None)
    if not ticket:
        raise HTTPException(404, "审批单不存在")
    session = 装.找(sid)
    if session is None:
        raise HTTPException(404, "会话不存在")
    try:
        message = 库.保存文本(
            session, ticket["话术"], "客服", f"approval:{ticket_id}", 审批ID=ticket_id
        )
    except ValueError as e:
        raise HTTPException(409, str(e)) from e
    return {"状态": "已发送", "消息": message}


@router.get("/api/会话/{sid}/工作台状态")
def 工作台状态(sid: str, 库: 运行时消息):
    """只恢复当前买家版本的显示状态，不重跑模型，也不回写消息。"""
    with closing(库._连接()) as conn:
        conn.execute("BEGIN")
        rows = conn.execute(
            "SELECT 载荷 FROM runtime_messages WHERE 会话ID=? ORDER BY 消息序号", (sid,)
        ).fetchall()
        buyers = [
            json.loads(r[0])["message_id"] for r in rows if json.loads(r[0])["角色"] == "买家"
        ]
        buyer = buyers[-1] if buyers else ""
        context = conn.execute(
            "SELECT buyer, revision FROM approval_decisions WHERE sid=?", (sid,)
        ).fetchone()
        decision = conn.execute(
            "SELECT payload FROM workbench_decisions WHERE sid=?", (sid,)
        ).fetchone()
        empty = {"顾客消息ID": buyer, "判定": None, "报备": None, "报备态": "等审批"}
        if not context or context[0] != buyer or not decision:
            return empty
        result = {**empty, "判定": json.loads(decision[0])}
        report = conn.execute(
            "SELECT buyer, revision, payload FROM workbench_reports WHERE sid=?", (sid,)
        ).fetchone()
        tickets = [
            json.loads(r[0])
            for r in conn.execute(
                "SELECT 载荷 FROM approvals WHERE sid=? ORDER BY rowid DESC", (sid,)
            )
        ]
        ticket = next(
            (
                t
                for t in tickets
                if t["顾客消息ID"] == buyer
                and t["判定版本"] == context[1]
                and t["状态"] != "已失效"
            ),
            None,
        )
        if report and tuple(report[:2]) == tuple(context):
            result["报备"] = {"等待分钟": 0, "工单号": json.loads(report[2])["单号"]}
        elif ticket:
            result["报备"] = {"等待分钟": 0, "工单号": ticket["id"]}
        if ticket:
            result["报备态"] = {"已发送": "已答复", "已批准": "等发送"}.get(
                ticket["状态"], "等审批"
            )
        return result
