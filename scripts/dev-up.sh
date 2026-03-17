#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

if [ ! -f .env.local ] && [ -f .env.example ]; then
  cp .env.example .env.local
  echo "Created .env.local from .env.example"
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

DB_PATH="prisma/dev.db"
DB_WAS_MISSING=0

if [ ! -f "$DB_PATH" ]; then
  DB_WAS_MISSING=1
fi

echo "Syncing database schema..."
npm run db:push

if [ "$DB_WAS_MISSING" -eq 1 ]; then
  echo "Seeding demo data for first run..."
  npm run db:seed
fi

echo "Starting local app at http://localhost:3000"
exec npm run dev
