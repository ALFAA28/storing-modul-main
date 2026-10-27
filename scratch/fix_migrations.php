<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    DB::statement("ALTER TABLE moduls ALTER COLUMN jenis_perangkat TYPE VARCHAR(100)");
    echo "Success altering column to VARCHAR\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
