<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $columns = DB::select("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'moduls'");
    foreach ($columns as $c) {
        echo $c->column_name . ": " . $c->data_type . "\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
