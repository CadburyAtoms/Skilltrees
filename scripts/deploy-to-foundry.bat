@echo off
setlocal
cd /d "%~dp0"

echo.
echo   ================================================================
echo    EDHA - Deploy the latest fixes to your Foundry table
echo   ================================================================
echo.
echo   Before you continue: make sure FOUNDRY IS FULLY CLOSED
echo   (including the little Setup / launcher window - it locks files).
echo.
echo   Press any key to start, or close this window to cancel.
pause >nul

echo.
echo   [1 of 5]  Getting the latest work from GitHub...
git pull
if errorlevel 1 goto :failed

echo.
echo   [2 of 5]  Installing the engine into your live module...
node module-src-sync.js push
if errorlevel 1 goto :failed

echo.
echo   [3 of 5]  Installing your adversary art...
node sync-art.js
if errorlevel 1 goto :failed

echo.
echo   [4 of 5]  Rebuilding the packs (leyline + deity + heroic + adversaries + items)...
node foundry-build.js leyline
if errorlevel 1 goto :failed
node foundry-build.js deity
if errorlevel 1 goto :failed
node foundry-build.js heroic
if errorlevel 1 goto :failed
node foundry-build.js adversaries
if errorlevel 1 goto :failed
node foundry-build.js items
if errorlevel 1 goto :failed

echo.
echo   [5 of 5]  Validating the packs...
node validate-packs.js
if errorlevel 1 goto :failed
node validate-adversaries.js
if errorlevel 1 goto :failed

echo.
echo   ================================================================
echo    SUCCESS - deploy finished with no errors.
echo.
echo    The steps left happen INSIDE Foundry:
echo      1. Relaunch Foundry and open your world.
echo      2. Click the round Sync Talents arrows on each character
echo         you are going to play.
echo      3. Click "Sync Adversaries from Pack" in the Actors-sidebar
echo         footer - world adversaries, their items, and their placed
echo         tokens (including new art) update in place. No re-drag.
echo   ================================================================
echo.
pause
exit /b 0

:failed
echo.
echo   ****************************************************************
echo    SOMETHING STOPPED on the step just above this message.
echo.
echo    Do NOT relaunch Foundry yet. Copy everything in this window
echo    and send it to Claude - it will tell you exactly what to do.
echo.
echo    (Common cause: talents you edited inside Foundry have not been
echo     saved back to the project yet - the builder stops on purpose
echo     so your edits are not lost. That is a safe stop, not a break.)
echo   ****************************************************************
echo.
pause
exit /b 1
