<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $password = $_GET['password'] ?? '';
    
    if ($password !== ADMIN_PASSWORD) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $votesOpen = $data['votes_open'] ?? null;
    
    if ($votesOpen === null) {
        http_response_code(400);
        echo json_encode(['error' => 'votes_open parameter is required']);
        exit;
    }
    
    $db = getDbConnection();
    
    if (!$db) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
    
    // Mettre à jour l'état du vote
    $stmt = $db->prepare("
        INSERT INTO settings (`key`, `value`) 
        VALUES ('votes_open', ?) 
        ON DUPLICATE KEY UPDATE `value` = ?
    ");
    
    $value = $votesOpen ? '1' : '0';
    $stmt->execute([$value, $value]);
    
    echo json_encode([
        'success' => true,
        'votes_open' => $votesOpen
    ]);
    
} catch (PDOException $e) {
    error_log("Error toggling votes: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to toggle votes']);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to toggle votes']);
}
?>
