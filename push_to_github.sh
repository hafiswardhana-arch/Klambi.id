#!/usr/bin/env bash
set -e

echo "=== Memulai Setup & Push ke GitHub (SSH) ==="

git branch -M main
git remote set-url origin git@github.com:wildanfadel19-crypto/Kl-mbi.id.git

echo "Mengunggah ke GitHub..."
git push -u origin main

echo "=== Selesai! Berhasil di-push ke GitHub ==="
