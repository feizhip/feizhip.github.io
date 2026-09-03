@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title 马泽杰个人作品集 - 本地预览

echo.
echo   ==========================================
echo     马泽杰个人作品集 - 本地预览启动器
echo   ==========================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo   [错误] 这台电脑上没找到 npm。
  echo         请先安装 Node.js:  https://nodejs.org/zh-cn/download
  echo         装完重启电脑，再双击我。
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo   [1/2] 首次运行，正在安装依赖，可能需要几分钟，请耐心等待...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo   [错误] 依赖安装失败。请把窗口里的红色报错截图发给我。
    echo.
    pause
    exit /b 1
  )
) else (
  echo   [1/2] 依赖已安装，跳过。
)

echo.
echo   [2/2] 正在启动开发服务器，请稍等 3~10 秒...
echo         网页就绪后会【自动打开浏览器】，不用手动输网址。
echo.
echo   *** 想停止预览：直接关掉这个黑窗口就行 ***
echo.

REM 后台探测 5173 / 5174 两个端口，谁先就绪就自动打开谁
start "" /min powershell -NoProfile -Command "$u1='http://localhost:5173';$u2='http://localhost:5174';for($i=0;$i -lt 240;$i++){foreach($u in @($u1,$u2)){try{$r=Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 2;if($r.StatusCode -eq 200){Start-Process $u;exit 0}}catch{}};Start-Sleep -Milliseconds 500}"

call npm run dev

echo.
echo   预览已停止（黑窗口已关或被关闭）。
echo   想再次访问：重新双击 start-dev.bat
echo.
pause
