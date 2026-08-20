FROM php:8.4-cli

# Install dependensi sistem dan PostgreSQL driver (untuk CockroachDB)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    zip \
    unzip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_pgsql pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy kodingan ke container
WORKDIR /var/www
COPY . /var/www

# Bypass scripts package:discover saat build composer agar tidak error syntax
ENV COMPOSER_ALLOW_SUPERUSER=1

RUN composer install --no-dev --optimize-autoloader --no-scripts

# Atur hak akses folder storage & cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 8000

# Jalankan discovery, cache, migration, lalu serve saat container running
CMD sh -c "php artisan package:discover --ansi && php artisan config:cache && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"