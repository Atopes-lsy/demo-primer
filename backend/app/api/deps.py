"""依赖注入 —— 装载器单例。

**单例不是性能优化，是正确性。** `装载器.找` 返回的是列表里那**同一个对象**
（理由见 `app/data/装载器.py`）：判定层会把 `顾客情况` / `建议` 补在这个对象上。
每次请求重新装载一遍的话，补上去的东西会在下一个请求里无声消失，而右栏显示
的是「判定结果没了」——看起来像判定接口坏了。

`lru_cache` 而不是模块级全局变量：测试要能 `cache_clear()` 换掉它，
模块级变量只能在导入时定型。
"""

from __future__ import annotations

from functools import lru_cache

from ..data.装载器 import 装载器
from ..配置 import 取配置


@lru_cache(maxsize=1)
def 取装载器() -> 装载器:
    """装载业务数据。**第一次调用时读盘**，之后进程内复用。"""
    return 装载器.从文件(取配置().业务数据路径)
