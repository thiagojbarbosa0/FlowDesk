#!/bin/sh
set -e
cd /app

php artisan migrate --force

# Seed apenas uma vez (o volume persiste o marcador)
if [ ! -f .docker-seeded ]; then
  php artisan db:seed --force
  touch .docker-seeded
fi

exec php artisan serve --host=0.0.0.0 --port=8000
