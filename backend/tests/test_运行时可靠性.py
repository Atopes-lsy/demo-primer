from concurrent.futures import ThreadPoolExecutor

import pytest

from app.data.装载器 import 装载器
from app.data.运行时消息 import 消息库
from tests.造数据 import 样例表


def test_并发消息序号无冲突且重开可读(tmp_path):
    path = tmp_path / "runtime.db"
    db = 消息库(path)
    session = 装载器.从表(样例表).找("S1")
    with ThreadPoolExecutor(max_workers=8) as pool:
        messages = list(pool.map(lambda i: db.保存文本(session, f"并发问题{i}", "买家"), range(24)))
    assert len({m.消息序号 for m in messages}) == 24
    assert len(消息库(path).取("S1")) == 24


@pytest.mark.parametrize("text", ["", " \n\t", "a" * 4001])
def test_非法内容不得落库(tmp_path, text):
    db = 消息库(tmp_path / "runtime.db")
    session = 装载器.从表(样例表).找("S1")
    with pytest.raises(ValueError):
        db.保存文本(session, text, "买家")
    assert db.取("S1") == []


def test_幂等重试只保存一次且不同内容拒绝(tmp_path):
    db = 消息库(tmp_path / "runtime.db")
    session = 装载器.从表(样例表).找("S1")
    first = db.保存文本(session, "同一个问题", "买家", "request-1")
    assert db.保存文本(session, "同一个问题", "买家", "request-1") == first
    with pytest.raises(ValueError):
        db.保存文本(session, "另一个问题", "买家", "request-1")
    assert len(db.取("S1")) == 1


def test_自动回复重判不同措辞复用已发原文(tmp_path):
    db = 消息库(tmp_path / "runtime.db")
    session = 装载器.从表(样例表).找("S1")
    first = db.保存文本(session, "第一版回复", "AI", "auto:buyer:disposition", 复用已发=True)
    retry = db.保存文本(
        session, "模型生成的不同措辞", "AI", "auto:buyer:disposition", 复用已发=True
    )
    assert retry == first
    assert len(db.取("S1")) == 1
