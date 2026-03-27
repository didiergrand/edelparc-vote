<?php
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/config.php';

try {
    $db = getDbConnection();
    
    if (!$db) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
    
    $stmt = $db->query("
        SELECT id, name, description, order_position 
        FROM parade 
        ORDER BY order_position ASC
    ");
    
    $parade = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($parade);
} catch (PDOException $e) {
    error_log("Error fetching parade: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch parade']);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch parade']);
}
?>
