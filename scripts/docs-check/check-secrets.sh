#!/usr/bin/env bash
# usage: bash check-secrets.sh <repo-root>
cd "$1" || exit 2
hits=$(grep -rnIiE \
  '(eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})|((secret|password|passwd|token|api[_-]?key)\s*[:=]\s*["'"'"']?[A-Za-z0-9/+_-]{12,})|(-----BEGIN [A-Z ]*PRIVATE KEY)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,})' \
  docs README.md --exclude-dir=superpowers --exclude-dir=node_modules --exclude-dir=.vitepress \
  | grep -vE 'noreply@|example\.(com|vn)|@types/|@tanstack/|@radix-ui/|@hookform/|@ant-design/|@testing-library/|@vitejs/|@mermaid-js/|@use |@[a-z-]+/[a-z-]+')
if [ -n "$hits" ]; then echo "$hits"; exit 1; fi
echo "check-secrets: OK"
