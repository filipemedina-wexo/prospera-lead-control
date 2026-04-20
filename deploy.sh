#!/bin/bash
set -e

VPS_HOST="root@77.37.41.238"
REMOTE_PATH="/var/www/prospera-lead-control"

echo "→ Building..."
npm run build

echo "→ Uploading to $VPS_HOST:$REMOTE_PATH ..."
rsync -avz --delete dist/ "$VPS_HOST:$REMOTE_PATH/"

echo "✓ Deploy concluído!"
echo "  Acesse: http://77.37.41.238"
