# Primer｜电商客服辅助工作台

React / TypeScript + FastAPI 的本地全栈项目。把顾客新消息、商品、订单和工单依据放到同一工作台，生成可编辑回复，并在发送前执行权限、审批和订单事实规则。

这是独立的客服工作台原型，尚未验证接入千牛客户端或真实电商订单系统，尚未完成公网部署验收。

## 能演示什么

- 顾客端输入新问题，客服端读取并触发判定；两端通过轮询同步。
- 查询业务依据、编辑草稿、普通回复、报备审批与转交。
- SQLite 保存运行时消息、审批、转交和工作台显示快照，支持刷新恢复。
- 服务端对发货/签收两类事实执行发送前校验；这不是通用语义事实核验。
- 模型调用开关、调用次数额度和访问控制。次数限制不等于金额封顶。
- 先例检索、可替换的模型依赖和前后端契约测试。

## 架构

```text
React / TypeScript / Vite
  顾客输入 → FastAPI → SQLite 运行时消息 → 客服轮询
  客服判定 → 商品/订单/工单资料 + 先例检索 → 规则与模型 → 可编辑建议
  确认发送 → 服务端权限/审批/事实规则 → SQLite → 顾客读回

历史业务资料：data/ 下的 Excel（只读）
先例嵌入：默认 FastEmbed / BAAI/bge-small-zh-v1.5
聊天：OpenAI 兼容接口，通过配置选择服务与模型
```

## 环境与安装

需要 Python 3.12+、Node.js 22.12+（或兼容的更新版本）、npm。以下命令在仓库根目录执行，适用于 PowerShell。

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -e './backend[dev]'
npm --prefix frontend ci
```

### 无 API Key 的隔离演示（建议先用此入口）

此入口使用合成业务数据和模型替身，禁止真实模型请求。启动前不要复制真实配置文件；每次使用新的数据库文件名。

```powershell
$env:PRIMER_E2E_DB = Join-Path $env:TEMP ('primer-demo-' + [guid]::NewGuid() + '.sqlite3')
backend/.venv/Scripts/python.exe -m uvicorn tests.browser_acceptance_server:app --app-dir backend --host 127.0.0.1 --port 8000
```

另开一个终端：

```powershell
npm --prefix frontend run dev -- --host 127.0.0.1
```

打开终端给出的前端地址，添加 `?live=agent` 进入实时客服工作台。后端测试认证为 `qa-agent / qa-local-only`，仅供本机合成数据演示。顾客专属入口需要由客服页生成的链接进入；`?live=customer` 本身不代表已取得顾客身份。两端可用独立浏览器上下文验证。

验证顺序：顾客发新问题 → 客服查看与判定 → 编辑并发送 → 顾客读回 → 刷新两端检查持久化。审批和转交另做专项验证，不能以普通回复成功代替。

### 真实配置入口

确认业务数据、访问配置和模型配置后，从根目录启动：

```powershell
Copy-Item backend/.env.example backend/.env
# 编辑 backend/.env；不要提交真实密钥
$env:PYTHONIOENCODING = 'utf-8'
backend/.venv/Scripts/python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

默认禁止外部模型调用。启用真实模型前阅读 [测试站配置](TEST-DEPLOYMENT.md)。本地嵌入首次使用需要下载模型；普通启动成功不代表真实模型效果通过。默认数据文件名及覆盖配置见 `backend/app/配置.py`，缺失数据时启动会失败。

## 验证

```powershell
Push-Location backend
.venv/Scripts/python.exe -m pytest -q
Pop-Location
npm --prefix frontend run build
```

测试默认通过替身隔离模型和嵌入调用。历史推进记录报告过 910 项后端测试通过，但不能把历史数量当成本次执行结果或模型准确率；当前验证结果另见交付报告。

## 已知限制

- 现有浏览器闭环记录使用合成数据和模型替身，没有真实客服效率或真实用户效果结论。
- 访问控制是测试站边界；审批允许同账号自审批，仅适用于当前测试流程。
- 首次访问无效顾客链接、空数据库初始化等边界需持续专项验证，不能由已有正常流程推定通过。
- 未宣称高并发、商业支付、生产多租户或公网可用。
- 展示数据的来源、授权与脱敏需分别核对；不要上传密钥、运行时数据库或包含个人信息的日志。

## 代码导航与贡献说明

`frontend/src/LiveApp.tsx`：实时交互；`backend/app/api/`：接口与审批；`backend/app/data/运行时消息.py`：持久化；`backend/app/rules/发送事实.py`：发送规则；`backend/tests/`：业务、接口和可靠性回归。

这是团队与 AI 辅助开发项目。项目能力不等于某一成员独立贡献；简历请按本人实际负责的契约、实现、修复与验收范围表述。历史记录见 [PROGRESS.md](PROGRESS.md)，接口见 [docs/接口契约.md](docs/接口契约.md)。
