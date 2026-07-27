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
REM --ff-only: if GitHub and this machine have drifted apart, STOP instead of
REM quietly merging in the middle of a deploy.
git pull --ff-only
if errorlevel 1 goto :failed
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set DEPLOY_BRANCH=%%b
for /f "delims=" %%s in ('git rev-parse --short HEAD') do set DEPLOY_SHA=%%s
echo.
echo   You are deploying branch "%DEPLOY_BRANCH%" at commit %DEPLOY_SHA%.
echo   If that is not the branch you expected, close this window now -
echo   nothing has been installed yet.

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
echo    (Deployed: branch "%DEPLOY_BRANCH%" at commit %DEPLOY_SHA%)
echo.
echo    The steps left happen INSIDE Foundry:
echo      1. Relaunch Foundry and open your world.
echo      2. Click the round Sync Talents arrows on each character
echo         you are going to play.
echo      3. Adversaries already dragged into the world are FROZEN
echo         copies - they keep their OLD abilities and their OLD art,
echo         not just the picture. If a deploy changed adversaries
echo         (this one very likely did), delete the placed copies and
echo         drag fresh ones out of the pack before you run them.
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
echo.
echo    (Another safe stop: step 1 refuses to pull when GitHub and this
echo     machine disagree about history - nothing was installed.)
echo   ****************************************************************
echo.
pause
exit /b 1
