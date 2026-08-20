FROM php:8.3-cli

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

# Install dependencies (tambahkan ignore-platform-reqs agar build di Render tidak crash)
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Atur hak akses folder storage & cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Render menggunakan variabel PORT dinamis (default 10000), tentukan port 8000
EXPOSE 8000

# Jalankan migration lalu serve
CMD php artisan config:cache && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000