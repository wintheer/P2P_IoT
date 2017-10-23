@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

for /l %%x in (8888, 1, 8902) do ( 
set /a ping =%%x-1
TIMEOUT 1
IF %%x == 8888 start node index.js %%x 0 
REM & start chrome.exe http://localhost:%%x/
IF NOT %%x == 8888 start node index.js %%x !ping!
REM & start chrome.exe http://localhost:%%x/
REM TIMEOUT 1
)
