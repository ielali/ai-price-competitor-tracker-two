#!/bin/sh
set -e

echo "Running database migrations..."
npm run migrate || echo "Migration failed or already applied, continuing..."

echo "Starting API server..."
exec "$@"
