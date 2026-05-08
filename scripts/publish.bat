@echo off
REM scripts/publish.bat — Windows wrapper for publish.sh.
REM Runs the bash script through Git Bash.
setlocal
set "SCRIPT_DIR=%~dp0"
set "MSG=%~1"
if "%MSG%"=="" set "MSG=atlas edits"
bash "%SCRIPT_DIR%publish.sh" "%MSG%"
exit /b %ERRORLEVEL%
