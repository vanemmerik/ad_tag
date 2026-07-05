#!/usr/bin/env bash
#
# Deploy the GAM Ad Tag Validation Tool to the solutions server.
#
# Uses SFTP (same protocol as FileZilla). The server account is SFTP-only, so
# rsync-over-SSH does NOT work there (it needs a remote shell and lands on a
# read-only path -> "Read-only file system"). Plain sftp writes the files
# directly and is the supported method.
#
# Requires the Brightcove VPN to be connected.
#
# Usage:
#   ./deploy.sh          # show what will be uploaded (no transfer)
#   ./deploy.sh --live   # upload via sftp (prompts for your password)
#
# Password: sftp prompts in your terminal. For a promptless deploy, add your
# SSH public key to the server account's ~/.ssh/authorized_keys.

set -euo pipefail

REMOTE_USER="jvanemmerik"
REMOTE_HOST="solutions.brightcove.com"
REMOTE_DIR="/mnt/data/html/jvanemmerik/ad_tag"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Web files that belong on the server (everything the browser loads).
WEB_FILES=(index.html styles.css scripts.js parameters.js adtag.js)

# Files to remove on the server if present (stale / renamed).
STALE_FILES=(tooltips.js)

echo "Target: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}"
echo "Upload:"
for f in "${WEB_FILES[@]}"; do echo "   + ${f}"; done
echo "Remove if present:"
for f in "${STALE_FILES[@]}"; do echo "   - ${f}"; done
echo

if [[ "${1:-}" != "--live" ]]; then
  echo "Dry run only. Re-run with --live to upload:"
  echo "    ./deploy.sh --live"
  exit 0
fi

# Build the sftp batch. A leading '-' on a command makes sftp ignore errors
# (e.g. removing a stale file that is already gone).
BATCH="$(mktemp)"
trap 'rm -f "$BATCH"' EXIT
{
  echo "cd ${REMOTE_DIR}"
  echo "lcd ${SCRIPT_DIR}"
  for f in "${STALE_FILES[@]}"; do echo "-rm ${f}"; done
  for f in "${WEB_FILES[@]}"; do echo "put ${f}"; done
  echo "bye"
} > "$BATCH"

echo "== LIVE DEPLOY via sftp =="
sftp -b "$BATCH" "${REMOTE_USER}@${REMOTE_HOST}"

echo
echo "Done. Hard-refresh https://${REMOTE_HOST}/jvanemmerik/ad_tag/ to verify."
