@echo off
REM Автоматический push на GitHub с коммитом

REM Устанавливаем кодировку UTF-8 для правильного отображения
chcp 65001 >nul 2>&1

setlocal enabledelayedexpansion

echo ========================================
echo   Auto Push to GitHub
echo ========================================
echo.

REM Проверяем статус Git
git status --porcelain >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Failed to check Git status
    pause
    exit /b 1
)

REM Проверяем, есть ли изменения
git diff --quiet && git diff --cached --quiet
if errorlevel 1 (
    goto :has_changes
)
echo [INFO] No changes to commit
echo.
echo Do you want to force deploy? (y/n)
set /p FORCE=
if /i not "!FORCE!"=="y" (
    exit /b 0
)
:has_changes

REM Показываем изменения
echo [INFO] Changes:
git status --short
echo.

REM Запрашиваем сообщение коммита
if "%1"=="" (
    echo Enter commit message:
    set /p COMMIT_MSG=
) else (
    set COMMIT_MSG=%1
)

if "!COMMIT_MSG!"=="" (
    set COMMIT_MSG=Auto commit: %date% %time%
)

REM Добавляем все изменения
echo [1/3] Adding changes...
git add .

REM Коммитим
echo [2/3] Creating commit...
git commit -m "!COMMIT_MSG!"

REM Пушим
echo [3/3] Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo.
    echo [WARNING] Push failed. Trying with force...
    git push -u origin main --force
)

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to push to GitHub
    echo.
    echo Please check:
    echo   1. Remote configured: git remote -v
    echo   2. GitHub access: git push origin main
    echo   3. Current branch: git branch
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Pushed to GitHub!
echo.
echo GitHub Actions will automatically deploy to host...
echo Check status: https://github.com/faonchik/KinoTec/actions
echo.

pause

