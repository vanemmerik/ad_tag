#!/usr/bin/env bash
#
# Deploy the GAM Ad Tag Validation Tool to the solutions server.
#
# Requires the Brightcove VPN to be connected (SSH is only reachable over it).
# Uploads the static web files and mirrors the remote folder so stale files
# (e.g. the old tooltips.js) are removed.
#
# Usage:
#   ./deploy.sh            # preview only (dry run) — shows what WOULD change
#   ./deploy.sh --live     # actually deploy
#
# Password: rsync/ssh will prompt in your terminal. Do not hardcode it here.
# For a promptless deploy, add your SSH public key to the server's
# ~/.ssh/authorized_keys.

set -euo pipefail

REMOTE_USER="jvanemmerik"
REMOTE_HOST="solutions.brightcove.com"
REMOTE_DIR="/mnt/data/html/jvanemmerik/ad_tag"

# Local source is the directory this script lives in.
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/"

EXCLUDES=(
  --exclude '.git'
  --exclude '.gitignore'
  --exclude '.gitattributes'
  --exclude 'test'
  --exclude 'CLAUDE.md'
  --exclude 'deploy.sh'
  --exclude '.DS_Store'
)

# Default to a dry run unless --live is passed.
DRY="-n"
MODE="DRY RUN (no files changed)"
if [[ "${1:-}" == "--live" ]]; then
  DRY=""
  MODE="LIVE DEPLOY"
fi

echo "== ${MODE} =="
echo "   ${LOCAL_DIR}"
echo "-> ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"
echo

rsync -avz ${DRY} --delete "${EXCLUDES[@]}" \
  "${LOCAL_DIR}" \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"

echo
if [[ -n "${DRY}" ]]; then
  echo "Preview complete. Re-run with --live to deploy for real:"
  echo "    ./deploy.sh --live"
else
  echo "Deployed. Hard-refresh https://${REMOTE_HOST}/jvanemmerik/ad_tag/ to verify."
fi
