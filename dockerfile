FROM richarvey/nginx-php-fpm:latest

# Copy seluruh file proyek ke container
COPY . /var/www/html

# Set konfigurasi Webroot ke folder public Laravel
ENV WEBROOT /var/www/html/public
ENV PHP_ERRORS_STDERR 1
ENV RUN_SCRIPTS 1
ENV REAL_IP_HEADER 1

# Install dependency composer dengan flag --ignore-platform-reqs agar tidak gagal di versi PHP
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

EXPOSE 80