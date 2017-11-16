@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

for /l %%x in (8889, 1, 8892) do ( 
set /a ping =%%x-1
TIMEOUT 1
IF %%x == 8888 start node index.js %%x 0 
IF NOT %%x == 8888 start node index.js %%x !ping!

)
