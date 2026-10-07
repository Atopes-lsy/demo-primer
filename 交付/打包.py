"""组装一次性交付包 —— 对方解压、双击、就能用，机器上不装任何东西。

    backend/.venv/Scripts/python.exe 交付/打包.py

产出：

    交付包/PRIMER/        组装好的目录（可以直接进去双击 启动.bat 试跑）
    交付包/PRIMER.zip     发给同学的就是这个

# 交付目录长这样，动其中任何一层之前先看 `app/配置.py`

    启动.bat              双击这个
    怎么用.txt            给不懂技术的人看的（源文件是 交付/怎么用.md）
    env.local.bat         带着一把模型密钥
    backend/app/          后端源码
    backend/.venv/Lib/site-packages/   依赖
    data/                 业务数据（文件名是中文）
    frontend/dist/        前端构建产物
    runtime/python/       随身带的解释器

`配置.py` 用 `Path(__file__).resolve().parents[2]` 算仓库根，`检索/先例库.py`
用 `parents[3]`。**这两处决定了 `backend/app/…` 和 `data/` 的相对层级不能变** ——
挪一层，程序会在启动时报「业务数据缺失」，而报错的位置看不出是层级挪了。

# 为什么不发 `backend/.venv` 整个

venv 里只有 `Scripts/python.exe`，**没有 `python312.dll`、没有标准库** —— 它靠
`pyvenv.cfg` 里那行 `home = C:\\Users\\Atopes\\…\\Python312` 去找解释器。换台机器
要么没装 Python、要么装在别的路径，两种都是直接起不来。

所以改成：基础解释器剪一份放进 `runtime/python/`，依赖用 `PYTHONPATH` 指过去
（`启动.bat` 里那行）。`pyvenv.cfg` 只用来**找到**基础解释器，不随包发出去。
"""

from __future__ import annotations

import os
import shutil
import stat
import sys
import zipfile
from pathlib import Path

仓库根 = Path(__file__).resolve().parents[1]
交付目录 = 仓库根 / "交付"
出面 = 仓库根 / "交付包"
包根 = 出面 / "PRIMER"

#: 组装进包的东西，一样都不能少 —— 少了哪个都要在**打包时**炸，不能等到
#: 对方双击了才发现。缺 `dist/` 是最容易发生的一种（它是构建产物，不在 git 里）。
必须有的 = (
    仓库根 / "frontend" / "dist" / "index.html",
    仓库根 / "backend" / "app" / "main.py",
    仓库根 / "backend" / ".venv" / "Lib" / "site-packages",
    仓库根 / "data" / "koujing.json",
    仓库根 / "data" / "先例库.json",
    仓库根 / "env.local.bat",
    交付目录 / "启动.bat",
    交付目录 / "怎么用.md",
)

#: 解释器里不带走的部分。`Lib/site-packages` 也在里面 —— 依赖全部由
#: `PYTHONPATH` 指向 venv 那份，基础解释器自己那份用不着。
解释器_不带的顶层 = frozenset({"Doc", "include", "libs", "tcl", "Scripts", "testing", "etc", "share"})
解释器_不带的Lib = frozenset({"test", "idlelib", "tkinter", "lib2to3", "ensurepip", "site-packages", "turtledemo", "distutils"})

#: 到处都不带。
到处不带 = frozenset({"__pycache__", ".pytest_cache", ".ruff_cache", ".git"})


def 读基础解释器() -> Path:
    """从 venv 的 `pyvenv.cfg` 里读出基础解释器在哪。

    **不写死路径**：这个脚本不只在这台机器上跑。写死的话，别人 checkout 下来
    一跑，装进包里的就是一台别人机器上的解释器（或者干脆是个不存在的路径）。
    """
    cfg = 仓库根 / "backend" / ".venv" / "pyvenv.cfg"
    if not cfg.is_file():
        raise SystemExit(f"找不到 {cfg}。先按 docs/开发步骤.md 建好 backend/.venv。")
    for 行 in cfg.read_text(encoding="utf-8").splitlines():
        if 行.strip().startswith("home"):
            _, _, 值 = 行.partition("=")
            目录 = Path(值.strip())
            if not (目录 / "python.exe").is_file():
                raise SystemExit(f"pyvenv.cfg 指向的 {目录} 里没有 python.exe。")
            return 目录
    raise SystemExit(f"{cfg} 里没有 home 这一行，读不出基础解释器。")


def 拷贝树(
    源: Path,
    目标: Path,
    *,
    跳目录: frozenset[str] = frozenset(),
    分层的跳目录: dict[str, frozenset[str]] | None = None,
    只根目录跳的后缀: tuple[str, ...] = (),
) -> int:
    """递归拷贝，返回拷了多少个文件。

    `分层的跳目录` 按**相对路径**给额外要跳的子目录名，比如 `{"Lib": {"test"}}`
    —— 只在那一个目录下生效。不分层的话 `test` 这种名字会在整棵树上到处命中，
    而标准库里叫 `test` 的目录不止一个。

    `只根目录跳的后缀` 是给解释器用的：它的根目录上躺着几个不知道谁丢进去的
    `.py`（`8.py` 之类），不属于 Python，跟着发出去只会让人以为包里漏了什么。
    标准库里到处都是 `.py`，当然不能一起跳。
    """
    条数 = 0
    分层的跳目录 = 分层的跳目录 or {}
    for 根, 目录们, 文件们 in os.walk(源):
        相对 = Path(根).relative_to(源)
        相对文本 = "" if 相对 == Path() else 相对.as_posix()
        本层要跳 = 跳目录 | 分层的跳目录.get(相对文本, frozenset())
        目录们[:] = [d for d in 目录们 if d not in 本层要跳 and d not in 到处不带]
        (目标 / 相对).mkdir(parents=True, exist_ok=True)
        for 名 in 文件们:
            后缀 = Path(名).suffix
            if 相对文本 == "" and 后缀 in 只根目录跳的后缀:
                continue
            shutil.copy2(Path(根) / 名, 目标 / 相对 / 名)
            条数 += 1
    return 条数


class 中文名条目(zipfile.ZipInfo):
    """让条目名按 **cp936 原样存进 zip，并且不设 UTF-8 标记**。

    这是 Windows 资源管理器自己压出来的样子，也是现有那份 `PRIMER.zip` 的样子。
    照它来是因为对面的解压工具说不准：带 UTF-8 标记的包，老一点的第三方解压软件
    （各种「好压」「360压缩」）会按系统码页去解，`赛题 1：数据共情者…xlsx`
    这种名字直接变乱码 —— 而那个文件不存在，程序启动就会报「业务数据缺失」，
    报错离真正的原因隔着一整层。

    zipfile 默认会把非 ASCII 名字转成 UTF-8 并打上标记（`_encodeFilenameFlags`）。
    这里把那个行为改掉：名字先由调用方编码成 cp936 再按 cp437 解回 str，
    于是两个方向互相抵消，落盘的正好是原始 cp936 字节。

    **`_encodeFilenameFlags` 是私有方法**，Python 大版本之间动过。改不动的话
    下面 `写包` 会在解包自检那一步炸出来，不会静默发出一份乱码包。
    """

    def _encodeFilenameFlags(self):  # noqa: N802 —— 覆盖的是标准库里这个名字
        return self.filename.encode("cp437"), self.flag_bits & ~0x800


def 写包(源根: Path, 目标zip: Path) -> None:
    """把 `源根` 整个压成 zip，条目名走 cp936。"""
    with zipfile.ZipFile(目标zip, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as 包:
        for 路径 in sorted(源根.rglob("*")):
            if 路径.is_dir():
                continue
            相对 = 路径.relative_to(源根).as_posix()
            名字 = f"{源根.name}/{相对}"
            try:
                名_cp437 = 名字.encode("cp936").decode("cp437")
            except UnicodeEncodeError:
                # 有 cp936 装不下的字符（emoji 之类）——退回默认的 UTF-8 路径，
                # 至少这份包在认识 UTF-8 标记的工具上是好的。
                print(f"  [注意] {相对} 的名字 cp936 装不下，这条按 UTF-8 存")
                名_cp437 = 名字
            条目 = 中文名条目(名_cp437)
            条目.compress_type = zipfile.ZIP_DEFLATED
            条目.external_attr = (stat.S_IFREG | 0o644) << 16
            包.writestr(条目, 路径.read_bytes())


def 写启动器(源: Path, 目标: Path) -> None:
    """把 UTF-8 的启动器源转成 **GBK + CRLF** 写进包里。

    两样都要，缺一样的表现都是「某一整行忽然没执行，而且不报错」：

    - **编码**：`cmd.exe` 按控制台的码页（中文 Windows 上是 cp936）逐字节读
      `.bat`。UTF-8 的多字节序列被当 cp936 解，读偏移就和实际字节数对不上，
      行尾会被当成命令跑掉 —— 2026-10-07 实测，`echo 地址：http://…` 那一行
      整个消失，cmd 拿 `地址：http:` 去找命令。
    - **CRLF**：同理，裸 LF 也会让偏移错位。源文件从编辑器出来是 LF，这里一并转。

    四种组合的实测表在 `启动.bat` 顶部。
    """
    文 = 源.read_text(encoding="utf-8")
    文 = 文.replace("\r\n", "\n").replace("\n", "\r\n")
    目标.write_bytes(文.encode("gbk"))


def 查缺() -> None:
    缺 = [p for p in 必须有的 if not p.exists()]
    if not 缺:
        return
    说明 = "\n".join(f"  {p.relative_to(仓库根)}" for p in 缺)
    raise SystemExit(
        "这些没准备好，先补上再打包：\n"
        f"{说明}\n\n"
        "  frontend/dist 缺了就跑：cd frontend && npm run build\n"
    )


def main() -> int:
    查缺()
    解释器 = 读基础解释器()
    print(f"基础解释器：{解释器}")

    if 出面.exists():
        shutil.rmtree(出面)
    包根.mkdir(parents=True)

    print("拷贝：")
    print(f"  backend/app                              {拷贝树(仓库根 / 'backend' / 'app', 包根 / 'backend' / 'app'):>6} 个文件")
    print(
        "  backend/.venv/Lib/site-packages          "
        f"{拷贝树(仓库根 / 'backend' / '.venv' / 'Lib' / 'site-packages', 包根 / 'backend' / '.venv' / 'Lib' / 'site-packages'):>6} 个文件"
    )
    print(f"  data                                     {拷贝树(仓库根 / 'data', 包根 / 'data'):>6} 个文件")
    print(f"  frontend/dist                            {拷贝树(仓库根 / 'frontend' / 'dist', 包根 / 'frontend' / 'dist'):>6} 个文件")
    print(
        "  runtime/python                           "
        f"{拷贝树(解释器, 包根 / 'runtime' / 'python', 跳目录=解释器_不带的顶层, 分层的跳目录={'Lib': 解释器_不带的Lib}, 只根目录跳的后缀=('.py',)):>6} 个文件"
    )

    # 这几样是单文件，直接拷。`启动.bat` 到包里改叫 启动.bat（交付目录里那份
    # 多加了个前缀，是为了跟仓库根上那个开发用的启动器区分开）。
    shutil.copy2(仓库根 / "env.local.bat", 包根 / "env.local.bat")
    写启动器(交付目录 / "启动.bat", 包根 / "启动.bat")
    # 源文件是 `.md`，进包装成 `.txt`：Windows 对 `.md` 没有默认打开方式，
    # 对面双击会弹「你要如何打开这个文件？」—— 一个不懂技术的同学到这儿就卡住了。
    # `.txt` 双击直接进记事本。
    shutil.copy2(交付目录 / "怎么用.md", 包根 / "怎么用.txt")
    print("  env.local.bat / 启动.bat / 怎么用.txt      3 个文件")

    # 那个 .pth 里钉着这台机器的绝对路径，带过去只会在对面的 sys.path 上
    # 挂一条不存在的目录。我们是从 `backend/` 当工作目录直接 import `app` 的，
    # 用不上这条可编辑安装。
    野pth = 包根 / "backend" / ".venv" / "Lib" / "site-packages" / "_editable_impl_primer_backend.pth"
    if 野pth.exists():
        野pth.unlink()
        print("  摘掉 site-packages/_editable_impl_primer_backend.pth（里面是本机绝对路径）")

    zip路径 = 出面 / "PRIMER.zip"
    print(f"\n压缩 -> {zip路径.relative_to(仓库根)}")
    写包(包根, zip路径)

    目录大小 = sum(f.stat().st_size for f in 包根.rglob("*") if f.is_file())
    print(f"\n  目录  {目录大小 / 1024 / 1024:>7.1f} MB")
    print(f"  压缩包 {zip路径.stat().st_size / 1024 / 1024:>6.1f} MB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
