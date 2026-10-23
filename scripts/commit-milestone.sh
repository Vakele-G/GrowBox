#!/usr/bin/env bash
set -euo pipefail

[ $# -eq 2 ] || { echo "Usage: $0 M01 \"short description\""; exit 1; }
MID="$1"; DESC="$2"


MEMBERS=(
"Vakele Godongwana|123022306+Vakele-G@users.noreply.github.com|$HOME/.ssh/id_vakele_wsl_github"
"Siphosihle Sehume|273103277+SiphosihleSehume-ops@users.noreply.github.com|$HOME/.ssh/id_sipho_github_key"
"Silindokuhle Zondo|175194081+Slindo-creator@users.noreply.github.com|$HOME/.ssh/id_slindo_github_key"
"Botshelo Mogale|210411529+botshelomogale@users.noreply.github.com|$HOME/.ssh/id_botshelo_github_key"
)

# Next person = whoever comes after the author of the last commit
last="$(git log -1 --format=%ae 2>/dev/null || true)"
next=0
for i in "${!MEMBERS[@]}"; do
  IFS='|' read -r _ e _ <<< "${MEMBERS[$i]}"
  [ "$e" = "$last" ] && next=$(( (i + 1) % ${#MEMBERS[@]} ))
done
IFS='|' read -r NAME EMAIL KEY <<< "${MEMBERS[$next]}"

# Credit the other teammates
TRAILERS=""
for i in "${!MEMBERS[@]}"; do
  [ "$i" -eq "$next" ] && continue
  IFS='|' read -r n e _ <<< "${MEMBERS[$i]}"
  TRAILERS+="Co-authored-by: $n <$e>"$'\n'
done

git config user.name  "$NAME"
git config user.email "$EMAIL"
git config core.sshCommand "ssh -i $KEY -o IdentitiesOnly=yes"

git pull --ff-only origin main
git add -A
git diff --cached --quiet && { echo "Nothing to commit."; exit 0; }
git commit -m "$MID: $DESC" -m "$TRAILERS"
git push origin main

echo "Pushed $(git rev-parse --short HEAD) as $NAME"