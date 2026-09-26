<?php
$dsn = 'pgsql:host=absensi-db-31236.j77.aws-ap-southeast-3.cockroachlabs.cloud;port=26257;dbname=absensi-db-31236.neondb;sslmode=require';
$user = 'smknu-absensi';
$password = 'Gj7GUPYBmBsWwZGrjmAcRw';

try {
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $migrations_to_delete = [
        '2026_08_10_021337_create_mapels_table',
        '2026_08_10_021406_create_moduls_table',
        '2026_08_10_021848_create_catatan_revisis_table',
        '2026_08_25_000001_create_jenis_perangkats_table',
        '2026_09_23_000001_alter_moduls_jenis_perangkat_column',
        '2026_09_23_000002_add_jurusan_to_mapels_table',
        '2026_09_23_224129_alter_jenis_perangkat_on_moduls_table',
        '2026_09_23_234612_create_settings_table',
        '2026_09_24_000001_restructure_mapels_and_moduls'
    ];

    foreach ($migrations_to_delete as $migration) {
        $stmt = $pdo->prepare("DELETE FROM migrations WHERE migration = ?");
        $stmt->execute([$migration]);
        echo "Deleted migration record: $migration\n";
    }

    echo "Ready to migrate.\n";
} catch (PDOException $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
