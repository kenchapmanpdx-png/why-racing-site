#!/usr/bin/env bash
# Permanently delete unused Scrapedimages from the repo.
# Run from the repo root. Audit produced by /tmp during the May 7 2026 audit pass.
#
# What this does:
#   - Keeps the 7 image files actually referenced in HTML/JS/CSS.
#   - Deletes the other 553 (≈ 110 MB) from disk.
#   - Then `git add -A && git commit -m "chore: prune unused Scrapedimages"` to land it.
#
# Safe to re-run; uses a whitelist.

set -euo pipefail

DIR="images/Scrapedimages"
[[ -d "$DIR" ]] || { echo "missing $DIR"; exit 1; }

KEEP=(
  "33216246_1685527644876492_6650516404111933440_o.jpg"
  "Brian-Jones-IMAGE.jpg"
  "Good-Times.jpg"
  "Jenni-cropped.jpg"
  "Noland-Hoshino.jpg"
  "our-lifestyle-img.jpg"
  "rebecca-cady-age30.jpg"
)

KEEP_SET=$(printf "%s\n" "${KEEP[@]}" | sort -u)

deleted=0
kept=0
total_bytes=0

while IFS= read -r f; do
  base=$(basename "$f")
  if grep -qx "$base" <<< "$KEEP_SET"; then
    kept=$((kept+1))
  else
    sz=$(stat -c '%s' "$f" 2>/dev/null || stat -f '%z' "$f")
    total_bytes=$((total_bytes + sz))
    rm -f "$f"
    deleted=$((deleted+1))
  fi
done < <(find "$DIR" -maxdepth 1 -type f)

echo "kept:    $kept"
echo "deleted: $deleted"
echo "freed:   $(awk "BEGIN {printf \"%.1f MB\", $total_bytes/1024/1024}")"
echo
echo "Next: git add -A && git commit -m 'chore: prune unused Scrapedimages'"
