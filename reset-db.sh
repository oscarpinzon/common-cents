#!/usr/bin/env bash
set -e

echo "🛑 Stopping and removing DB container + volume..."
docker compose down -v  # or: docker-compose down -v

echo "🚀 Starting fresh Postgres..."
docker compose up -d

echo "🧱 Applying EF Core migrations..."
cd backend
dotnet ef database update \
  -p src/CommonCents.Infrastructure/CommonCents.Infrastructure.csproj \
  -s src/CommonCents.Api/CommonCents.Api.csproj

echo "✅ DB reset complete."