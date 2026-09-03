#!/usr/bin/env bash
set -e

echo "=== Memulai Setup & Push ke GitHub (Klambi.id) ==="

git branch -M main
git remote set-url origin https://github.com/hafiswardhana-arch/Klambi.id.git

echo "Mengunggah ke GitHub..."
git push -u origin main

echo "=== Selesai! Berhasil di-push ke GitHub ==="
