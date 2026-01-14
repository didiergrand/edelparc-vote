<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/config.php';

try {
    $password = $_GET['password'] ?? '';
    
    if ($password !== ADMIN_PASSWORD) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $db = getDbConnection();
    
    if (!$db) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
    
    // Récupérer les personnages avec le nombre de votes
    $stmt = $db->query("
        SELECT 
            c.id,
            c.name,
            COUNT(v.id) as votes
        FROM characters c
        LEFT JOIN votes v ON c.id = v.character_id
        GROUP BY c.id, c.name
        ORDER BY votes DESC, c.order_position ASC
    ");
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convertir votes en entier
    foreach ($results as &$result) {
        $result['votes'] = (int)$result['votes'];
    }
    
    echo json_encode($results);
    
} catch (PDOException $e) {
    error_log("Error fetching results: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch results']);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch results']);
}
?>
