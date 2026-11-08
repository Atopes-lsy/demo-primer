# 测试站访问与调用额度

启动进程前设置环境变量，重启后生效：

- PRIMER_ACCESS_USER：测试站用户名，默认 primer。
- PRIMER_ACCESS_PASSWORD：自行设置长随机密码；不提交到 Git。设置后所有页面、API 和文档都要求浏览器登录。公网必须由 HTTPS 入口提供服务。
- 未设访问密码仅允许直接本机连接；反向代理部署必须设置密码，因为代理到后端的连接可能来自本机。
- PRIMER_LLM_ENABLED：默认 0，禁止外部模型调用；设 1 启用。
- PRIMER_LLM_DAILY_CALLS：默认每日 100 次，按北京时间日期统计。
- PRIMER_LLM_MINUTE_CALLS：默认每分钟 20 次。
- PRIMER_BUDGET_DB：可覆盖 SQLite 额度记录路径，默认 data/budget.sqlite3；须持久化，不能删除来重置预算。

聊天和可选的远程嵌入请求发送前预扣次数，失败也计入；本地嵌入不调用外部 API。聊天关闭 SDK 自动重试；输出限制 1024 token，输入限制 20000 字符。次数额度不是人民币硬上限，金额硬上限还需供应商账户侧配置。

## DeepSeek 聊天与本地先例库嵌入（2026-10-31）

- 聊天默认 `https://api.deepseek.com` / `deepseek-flash`；在 `backend/.env` 设置 `PRIMER_LLM_KEY`，也可通过进程环境变量设置 `DEEPSEEK_API_KEY`。真实密钥不能提交到 Git。
- 先例库默认使用 FastEmbed 的 `BAAI/bge-small-zh-v1.5`，在本机生成 512 维向量。首次运行需下载模型；服务器部署时要提前预下载，避免首次顾客请求等待或因网络失败而无先例。
- 切换模型后，`data/先例库.json` 必须由同一模型重建。原 139 条库已备份于 `.ai/先例库-切换本地嵌入前-20261031.json`；新库从 180 条素材去重为 136 条。旧模型的相似度阈值不能直接当作新模型的质量结论。
- `PRIMER_LLM_ENABLED=1` 才允许聊天 API 调用；该开关、次数上限和密钥可写在被 Git 忽略的 `backend/.env`。见 `backend/.env.example`。
- DeepSeek 官方聊天 API 未提供可替代本项目嵌入调用的模型，因此不得把聊天 Key 配到 `PRIMER_LLM_KEY_先例库` 并把 DeepSeek 地址当嵌入端点。

该访问验证是整站测试人员隔离，不是顾客级数据隔离。拿到密码的人仍能查看测试会话，部署仅限脱敏测试数据。公网部署尚未授权。


## 配置位置与启动目录（2026-10-29）

登录配置默认读取应用后端目录的 `backend/.env`（由配置模块文件位置解析为绝对路径），使用 UTF-8。仓库根目录、backend 目录或其他目录启动均读取这同一文件，不读取启动目录里其他同名文件。进程环境变量优先于文件；配置缓存于进程内，改动后需要重启。

从仓库根目录启动：

```powershell
backend/.venv/Scripts/python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

从其他目录启动须使用 Python 与 `--app-dir` 的绝对路径。部署时将配置放在应用后端目录或通过进程环境变量注入，不应依赖服务管理器的工作目录。密码缺失时的原有本机限制策略本轮未改变；公网部署仍未授权。
