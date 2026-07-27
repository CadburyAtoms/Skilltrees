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
echo   [1 of 7]  Checking that Foundry is really closed...
REM The packs are a LevelDB; a running Foundry holds a lock on them and the pack
REM rebuild fails part-way, leaving some packs rebuilt and others not. Cheaper to
REM catch it here than to explain a half-deploy afterwards.
REM
REM Match on "Foundry", NOT on the full image name: tasklist TRUNCATES the Image
REM Name column at 25 characters, so its own output reads "Foundry Virtual Tabletop."
REM and a find for "...Tabletop.exe" never matches while Foundry is wide open.
REM When nothing matches, tasklist prints "INFO: No tasks..." which contains no
REM "Foundry", so this is exact in both directions. (Verified by running it against
REM a live Foundry on 2026-07-27 - the first version of this check silently passed.)
tasklist /FI "IMAGENAME eq Foundry Virtual Tabletop.exe" /NH 2>nul | find /I "Foundry" >nul
if not errorlevel 1 goto :stillrunning
echo   Foundry is closed. Good.

echo.
echo   [2 of 7]  Getting the latest work from GitHub...
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
echo   [3 of 7]  Checking whether you hand-edited the live engine...
REM A plain "the files differ" check cannot tell BEHIND from HAND-EDITED, and they
REM want opposite answers. `status` decides by asking whether the live content
REM matches any past commit: if it does it is merely stale (push away), if it
REM matches nothing then someone edited it inside AppData and a push destroys work
REM that is in no commit anywhere. Exit 2 means exactly that case.
node module-src-sync.js status
if errorlevel 2 goto :handedited
if errorlevel 1 goto :failed

echo.
echo   [4 of 7]  Installing the engine into your live module...
node module-src-sync.js push
if errorlevel 1 goto :failed

echo.
echo   [5 of 7]  Installing your adversary art...
node sync-art.js
if errorlevel 1 goto :failed

echo.
echo   [6 of 7]  Rebuilding the packs (leyline + deity + heroic + adversaries + items)...
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
echo   [7 of 7]  Validating the packs...
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
echo      4. SUMMONED creatures standing on a scene are frozen the same
echo         way - a Construct keeps the creature type it was minted
echo         with. If a deploy changed how something is summoned,
echo         dismiss it and forge a fresh one.
echo   ================================================================
echo.
pause
exit /b 0

:stillrunning
echo.
echo   ****************************************************************
echo    FOUNDRY IS STILL RUNNING - nothing has been changed.
echo.
echo    Close Foundry completely (the world, the main window, AND the
echo    little Setup / launcher window), then run this again.
echo.
echo    Why this matters: the packs are a database that Foundry locks
echo    while it is open. Deploying anyway rebuilds some packs and
echo    fails on the rest, which is a much worse mess than stopping.
echo   ****************************************************************
echo.
pause
exit /b 1

:handedited
echo.
echo   ****************************************************************
echo    STOPPED ON PURPOSE - nothing has been installed.
echo.
echo    The engine file in your Foundry module folder does not match
echo    ANY version in the project history, which means it was edited
echo    in place. Deploying now would replace those edits with the
echo    version from GitHub.
echo.
echo    If you did NOT edit it on purpose, it is safe to continue -
echo    but send the lines above to Claude first, so the change can be
echo    captured into the project instead of thrown away.
echo.
echo    To keep the edits: run  node module-src-sync.js  (no arguments)
echo    from this folder, then commit the result.
echo   ****************************************************************
echo.
pause
exit /b 1

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
