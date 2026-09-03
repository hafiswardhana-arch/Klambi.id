@echo off
set "PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%"
git branch -M main
git remote set-url origin https://github.com/hafiswardhana-arch/Klambi.id.git
echo Mengunggah ke GitHub https://github.com/hafiswardhana-arch/Klambi.id.git ...
git push -u origin main
pause
