chcp 65001 >nul
@echo off
setlocal
cd /d "%~dp0"

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
echo   [2/2] 正在启动，浏览器会自动打开：
echo         http://localhost:5173
echo.
echo   提示：想停止预览，直接关掉这个黑窗口就行。
echo.

call npm run dev

echo.
echo   预览已停止。
pause
