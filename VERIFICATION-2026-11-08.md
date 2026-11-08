# Primer 本轮验证

2026-11-08，北京时间；基于本机当前代码的独立副本。

- 完整后端回归：913 passed，83.37 秒。
- 编码修复专项：`tests/test_转交隔离.py`，6 passed。
- 前端：TypeScript 与 Vite 生产构建通过；主 JS 约 326 kB、gzip 104 kB。
- 本轮没有调用真实模型，没有重新进行双浏览器业务验收或公网部署；README 中的双端流程能力仍有历史记录边界，不能将其写成本轮浏览器实测。

首次完整回归是 912 passed / 1 failed，独立子进程测试未指定 UTF-8；父进程传入 UTF-8 中文 JSON，而子进程可能按 Windows 默认编码读取，且 stderr 解码也失败。将子进程启动改成 `python -X utf8` 后，专项和完整回归通过。

新增 README 描述当前实时工作台、合成数据与模型替身入口、安装与启动、持久化、测试和已知限制。新增 npm 锁文件使 README 中的 `npm ci` 可复现；原 pnpm 锁文件保留，本说明与 README 的复现命令统一使用 npm，不要求跨包管理器混用。

示例配置已清空疑似密钥并将 `PRIMER_LLM_ENABLED` 设为 0。没有复制真实 `.env`、运行时数据库或原项目的模型凭据。若原示例中的值曾是真实有效密钥，应由账号持有人轮换；删除文件中的值不能撤销已泄漏凭据。

后端复现（从 backend 目录）：

```powershell
$env:PYTHONIOENCODING = 'utf-8'
.venv/Scripts/python.exe -m pytest -q
```

前端复现：`npm --prefix frontend ci`，随后 `npm --prefix frontend run build`。

本地原始记录：副本根目录 `backend-verified.log`、`backend-targeted.log`、`frontend-build.log`。本轮复用了原项目安装好的 Python 环境，实际测试对象和新建数据库均在独立副本或临时目录；没有修改真实业务数据库。
