<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    DB::statement("SELECT setval('migrations_id_seq', (SELECT max(id) FROM migrations) + 1)");
    echo "Sequence advanced successfully.\n";
} catch (\Exception $e) {
    echo "Failed: " . $e->getMessage() . "\n";
}
