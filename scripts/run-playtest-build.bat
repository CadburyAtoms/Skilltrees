@echo off
cd /d "C:\Users\benhe\OneDrive\Documentos\Worldbuilding\Claude Design\Skilltrees\scripts"
echo === process check === > build-log.txt
powershell -NoProfile -Command "Get-Process | Where-Object {$_.ProcessName -match 'foundry|electron'} | Select-Object ProcessName,Id" >> build-log.txt 2>&1
echo === build deity === >> build-log.txt
node foundry-build.js deity >> build-log.txt 2>&1
echo === build heroic === >> build-log.txt
node foundry-build.js heroic >> build-log.txt 2>&1
echo === validate === >> build-log.txt
node C:\tmp\validate2.js >> build-log.txt 2>&1
echo === ALL DONE === >> build-log.txt
