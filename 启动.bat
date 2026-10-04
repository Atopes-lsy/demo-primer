@echo off
rem Primer -- start backend (:8000) and frontend (:5173), one window each.
rem Double-click this file. Close a window to stop that half.
rem
rem   backend  uvicorn --reload  -> restarts itself when a .py changes
rem   frontend vite             -> HMR on .tsx, proxies /api to :8000
rem
rem NOTE 1 -- this file is deliberately ASCII-only. cmd.exe parses .bat bytes
rem with the OEM code page (cp936 here), so UTF-8 Chinese comments inside a .bat
rem get mis-decoded and split the script apart. Keep it ASCII.
rem
rem NOTE 2 -- PYTHONIOENCODING=utf-8 is not optional: without it Chinese log
rem lines are mojibake on the Windows console (docs/开发步骤.md, 坑 1).
rem
rem NOTE 3 -- open the frontend at http://localhost:5173/ , NOT 127.0.0.1.
rem vite binds ::1 (IPv6); over IPv4 the browser only says "connection refused".

cd /d "%~dp0"

start "Primer backend :8000" /D "%~dp0backend" cmd /k "chcp 65001 >nul && set PYTHONIOENCODING=utf-8 && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"
start "Primer frontend :5173" /D "%~dp0frontend" cmd /k "chcp 65001 >nul && npm run dev"

echo.
echo   backend   http://localhost:8000/healthz
echo   frontend  http://localhost:5173/
echo.
echo Two windows opened. This one can be closed.
timeout /t 5 >nul
