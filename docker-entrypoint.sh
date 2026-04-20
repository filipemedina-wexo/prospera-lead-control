#!/bin/sh
set -e

# Replace placeholder values with actual runtime env vars
find /usr/share/nginx/html/assets -name "*.js" | xargs sed -i \
  -e "s|__VITE_SUPABASE_URL__|${VITE_SUPABASE_URL}|g" \
  -e "s|__VITE_SUPABASE_ANON_KEY__|${VITE_SUPABASE_ANON_KEY}|g"

exec "$@"
