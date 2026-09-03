$env:PATH = "$env:LOCALAPPDATA\Programs\MinGit\cmd;$env:PATH"
git branch -M main
git remote set-url origin git@github.com:wildanfadel19-crypto/Kl-mbi.id.git
Write-Host "Mengunggah ke GitHub via SSH..." -ForegroundColor Cyan
git push -u origin main
