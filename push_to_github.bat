@echo off
set "PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%"
git branch -M main
git remote set-url origin git@github.com:wildanfadel19-crypto/Kl-mbi.id.git
echo Mengunggah ke GitHub...
git push -u origin main
pause
