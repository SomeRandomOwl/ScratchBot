@echo off
:start
echo (%time%) Bot started.
python logclean.py
node index.js
echo (%time%) WARNING: Bot closed or crashed, restarting.
python logclean.py
goto start