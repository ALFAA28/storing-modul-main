<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$tables = ['catatan_revisis', 'moduls', 'mapels', 'personal_access_tokens'];

foreach ($tables as $table) {
    try {
        Schema::dropIfExists($table);
        echo "Dropped $table\n";
    } catch (\Exception $e) {
        echo "Failed to drop $table: " . $e->getMessage() . "\n";
    }
}
echo "Done.\n";
