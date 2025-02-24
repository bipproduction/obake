#!/bin/bash

# Source environment variables
source .env

# Konfigurasi
GITHUB_TOKEN=$TOKEN
OWNER="bipproduction"
REPO="obake"

# Dapatkan daftar runs
RUNS=$(curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/actions/runs)

# Validasi apakah permintaan berhasil
if [ $(echo "$RUNS" | jq -r '.total_count') -eq 0 ]; then
  echo "Tidak ada runs yang ditemukan."
  exit 1
fi

# Ambil RUN_ID dari run pertama
RUN_ID=$(echo "$RUNS" | jq -r '.workflow_runs[0].id')

# Dapatkan daftar jobs dalam run
JOBS=$(curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/actions/runs/$RUN_ID/jobs)

# Validasi apakah ada jobs
if [ $(echo "$JOBS" | jq -r '.total_count') -eq 0 ]; then
  echo "Tidak ada jobs yang ditemukan untuk run ID $RUN_ID."
  exit 1
fi

# Ambil job ID pertama
JOB_ID=$(echo "$JOBS" | jq -r '.jobs[0].id')

echo $JOB_ID

# Unduh log dari job
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/actions/jobs/$JOB_ID/logs \
  -o job_logs.txt

# Cek apakah log berhasil diunduh
if [ $? -eq 0 ]; then
  echo "ini datanya" >> job_logs.txt
  echo "Log disimpan di job_logs.txt"
else
  echo "Gagal mengunduh log."
  exit 1
fi