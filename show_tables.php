<?php
$dsn = 'pgsql:host=absensi-db-31236.j77.aws-ap-southeast-3.cockroachlabs.cloud;port=26257;dbname=absensi-db-31236.neondb;sslmode=require';
$user = 'smknu-absensi';
$password = 'Gj7GUPYBmBsWwZGrjmAcRw';
$pdo = new PDO($dsn, $user, $password);
$stmt = $pdo->query('SHOW TABLES');
foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    echo $row['table_name'] . "\n";
}
