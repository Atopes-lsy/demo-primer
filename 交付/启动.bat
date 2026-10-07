@echo off
rem ==========================================================================
rem  Primer  --  double-click this file to start the program.
rem
rem  One window, one address:  http://localhost:8000/
rem  Nothing is installed on this machine. The Python runtime, every library,
rem  the front-end build and the business data all travel inside this folder.
rem  Copy the folder anywhere you can write to and it still works.
rem
rem  ------------------------------------------------------------------------
rem  THIS FILE IS A UTF-8 SOURCE. THE SHIPPED COPY MUST BE GBK.
rem  `交付/打包.py` transcodes it on the way into the package -- do not copy
rem  this file into a delivery by hand, and do not "fix" it back to UTF-8.
rem
rem  WHY GBK, AND WHY THERE IS NO `chcp` HERE -- measured 2026-10-07
rem
rem  cmd.exe reads a .bat byte by byte in the console's code page (cp936 on a
rem  Chinese Windows). A UTF-8 file read as cp936 mis-decodes every multi-byte
rem  character, the read offset desynchronises, and cmd runs the tail of the
rem  line as a command. What that looked like:
rem
rem    UTF-8 + chcp 65001 + CRLF  -> `地址：http://localhost:8000/` VANISHED.
rem                                  cmd ran `地址：http:` as a command and the
rem                                  whole line never printed.
rem    UTF-8, no chcp             -> worse: every Chinese line mangled
rem    GBK   + chcp 65001         -> mangled
rem    GBK   + no chcp            -> correct, every line
rem
rem  So: the file is GBK, and the console stays at cp936. Do NOT add a `chcp
rem  65001` here -- it would make cmd re-read the GBK bytes as UTF-8 and undo
rem  the whole thing.
rem
rem  `PYTHONIOENCODING` is gone for the same reason it used to be there. The
rem  old launcher paired `chcp 65001` with `PYTHONIOENCODING=utf-8`. With the
rem  console left at cp936, Python writes the console through WriteConsoleW
rem  (Unicode, code page irrelevant), and forcing an encoding only breaks it.
rem
rem  Bonus: on an English Windows (cp437) the GBK bytes decode one-for-one, so
rem  the Chinese comes out as garbage but the file still RUNS. A UTF-8 file on
rem  cp936 does not -- it dies. That asymmetry is why GBK is the safer side to
rem  be wrong on.
rem
rem  ------------------------------------------------------------------------
rem  WHAT THIS FILE EXPECTS -- every path below is relative to %~dp0. If you
rem  build the package yourself, keep exactly this layout:
rem
rem    启动.bat                             <- this file
rem    env.local.bat                        <- optional; holds the model key
rem    backend\app\                         <- the FastAPI sources
rem    backend\.venv\Lib\site-packages\     <- the dependencies (PYTHONPATH)
rem    data\                                <- business data; file names are Chinese
rem    frontend\dist\                       <- the built front-end, served on :8000
rem    runtime\python\python.exe            <- the interpreter that travels along
rem
rem  `data\` and `backend\` have to stay siblings. `app/配置.py` computes the
rem  repo root as `parents[2]` from its own file, and `检索/先例库.py` writes
rem  back to `data/先例库.json`. Move either one and the app dies at startup
rem  with 业务数据缺失 -- an error that points nowhere near the real cause.
rem
rem  There is deliberately NO `pyvenv.cfg`: a venv finds its interpreter through
rem  that file's absolute `home = ...` line, which does not exist on anyone
rem  else's machine. `PYTHONPATH` above replaces it.
rem
rem  No `node_modules` and no vite: `frontend\dist` is served by the backend on
rem  the same origin, which is why there is only one window and one address.
rem  ------------------------------------------------------------------------
setlocal

cd /d "%~dp0"

set "PYTHON=%~dp0runtime\python\python.exe"
set "PYTHONPATH=%~dp0backend\.venv\Lib\site-packages"

if not exist "%PYTHON%" goto no_python

rem -- 本机的 key。这一份交付包里带着一把，所以开箱就能跑真模型 -----------
if exist "%~dp0env.local.bat" (
  call "%~dp0env.local.bat"
) else (
  echo   [提示] 没有找到 env.local.bat，没有模型密钥。
  echo          程序照样能开，但判定会走剧本兜底。
)

rem -- 8000 上已经有东西在跑？提醒一句，但不拦着（宁可让它自己报错）------
netstat -ano | findstr /c:"LISTENING" | findstr /c:":8000 " >nul 2>&1
if not errorlevel 1 (
  echo.
  echo   [提示] 8000 端口已经有东西在跑了。
  echo          如果浏览器里已经能看到界面，就用那个，不用再开。
  echo          如果看不到，先把别的黑色窗口都关掉，再双击一次本文件。
)

echo.
echo   Primer 正在启动，几秒钟后浏览器会自己打开。
echo   地址：http://localhost:8000/
echo   要关掉程序：直接关掉这个黑色窗口。
echo.

rem -- 等 8 秒再开浏览器。ping 当 sleep 用：timeout 在 stdin 被重定向时会直接报错
start "" /min cmd /c "ping -n 9 127.0.0.1 >nul & start http://localhost:8000/"

cd /d "%~dp0backend"
"%PYTHON%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000

echo.
echo   ==========================================================
echo    程序已经停了。
echo    如果不是你自己关的，把上面几行报错原样发给技术同学。
echo   ==========================================================
pause
exit /b


:no_python
rem -- 两种情况分开说。学生最容易犯的错是**在压缩包窗口里直接双击** ——
rem    那种情况下 Windows 只解压你点的那一个文件出来，看起来"程序坏了"，
rem    其实只是旁边的东西没跟着出来。和杀毒软件删文件是不同的病，不同的话。
if not exist "%~dp0backend\app\main.py" goto not_extracted
echo.
echo   找不到 Python 运行时：%PYTHON%
echo.
echo   多半是解压不完整 —— 杀毒软件有时会把 python.exe 直接删掉。
echo   把压缩包重新解压一次（先关掉杀毒软件的实时防护），再双击本文件。
echo.
pause
exit /b


:not_extracted
echo.
echo   这个文件夹不完整：没有找到 backend\app\main.py
echo.
echo   最常见的原因 —— 你是在压缩包的窗口里直接双击的。
echo   那样 Windows 只会解压出你点的那一个文件，旁边的文件夹全都不在。
echo.
echo   正确做法：
echo     1. 右键点压缩包
echo     2. 选「全部解压…」
echo     3. 进到解压出来的文件夹里，再双击本文件
echo.
pause
exit /b
