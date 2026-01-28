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
    
    // Récupérer l'état du vote
    $stmt = $db->prepare("SELECT value FROM settings WHERE `key` = 'votes_open'");
    $stmt->execute();
    $setting = $stmt->fetch();
    
    $votesOpen = $setting ? (int)$setting['value'] === 1 : false;
    
    echo json_encode(['votes_open' => $votesOpen]);
    
} catch (PDOException $e) {
    error_log("Error fetching vote status: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch vote status', 'votes_open' => false]);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch vote status', 'votes_open' => false]);
}
?>
