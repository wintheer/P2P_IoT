@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

for /l %%x in (8888, 1, 8891) do ( 
set /a ping =%%x-1
TIMEOUT 1
IF %%x == 8888 start node index.js %%x 0 & start chrome.exe http://localhost:%%x/
IF NOT %%x == 8888 start node index.js %%x !ping! & start chrome.exe http://localhost:%%x/
)
