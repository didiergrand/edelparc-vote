<?php
header('Content-Type: application/json');
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
        FROM characters 
        ORDER BY order_position ASC
    ");
    
    $characters = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($characters);
} catch (PDOException $e) {
    error_log("Error fetching characters: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch characters']);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch characters']);
}
?>
