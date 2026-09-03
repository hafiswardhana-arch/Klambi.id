$env:PATH = "$env:LOCALAPPDATA\Programs\MinGit\cmd;$env:PATH"
git branch -M main
git remote set-url origin https://github.com/hafiswardhana-arch/Klambi.id.git
Write-Host "Mengunggah ke GitHub https://github.com/hafiswardhana-arch/Klambi.id.git ..." -ForegroundColor Cyan
git push -u origin main
