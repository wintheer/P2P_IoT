@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

for /l %%x in (8888, 1, 8891) do ( 
set /a ping =%%x-1

IF %%x == 8888 start node index.js %%x 0

IF NOT %%x == 8888 start node index.js %%x !ping! 
REM TIMEOUT 1
REM & start chrome.exe http://localhost:%%x/
)
