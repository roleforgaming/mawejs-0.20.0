#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Claude Code status line: model | git branch | cwd | context usage
# ---------------------------------------------------------------------------

input=$(cat)

# --- model name ------------------------------------------------------------
model=$(echo "$input" | jq -r '.model.display_name // "unknown"')

# --- git branch (skip optional locks, fail silently) -----------------------
branch=$(cd "$(echo "$input" | jq -r '.workspace.current_dir // empty')" 2>/dev/null \
  && GIT_OPTIONAL_LOCKS=0 git branch --show-current 2>/dev/null) || branch=""

# --- current working directory ---------------------------------------------
cwd=$(echo "$input" | jq -r '.workspace.current_dir // "?"')

# --- context usage percentage ----------------------------------------------
used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')

# ---------------------------------------------------------------------------
# Assemble the line
#   ANSI colours (will appear dimmed inside Claude Code's status bar):
#     \033[36m  cyan        – model
#     \033[32m  green       – branch
#     \033[33m  yellow      – cwd
#     \033[35m  magenta     – context
#     \033[2m   dim         – separators
#     \033[0m   reset
# ---------------------------------------------------------------------------
SEP=$'\033[2m│\033[0m'

printf '\033[36m%s\033[0m' "$model"
printf ' %s ' "$SEP"

if [ -n "$branch" ]; then
  printf '\033[32m%s\033[0m' "$branch"
else
  printf '\033[2mno branch\033[0m'
fi
printf ' %s ' "$SEP"

printf '\033[33m%s\033[0m' "$cwd"
printf ' %s ' "$SEP"

if [ -n "$used" ]; then
  printf '\033[35mctx: %s%%\033[0m' "$used"
else
  printf '\033[2mctx: —\033[0m'
fi

printf '\n'
