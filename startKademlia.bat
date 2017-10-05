@echo off
for /l %%x in (8888, 1, 8895) do ( 

IF %%x == 8888 echo start node index.js %%x 0

IF NOT %%x == 8888 echo %%x 

)


