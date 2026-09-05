FROM php:8.3-cli

RUN docker-php-ext-install pdo pdo_pgsql
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY composer.json ./
RUN composer install --no-interaction --prefer-dist --no-scripts || true
COPY . .
RUN composer dump-autoload --optimize || true

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
