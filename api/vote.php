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
    $data = json_decode(file_get_contents('php://input'), true);
    $character_id = $data['character_id'] ?? null;
    $voter_id = $data['voter_id'] ?? null;
    
    if (!$character_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Character ID is required']);
        exit;
    }
    
    if (!$voter_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Voter ID is required']);
        exit;
    }
    
    $db = getDbConnection();
    
    if (!$db) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
    
    // Vérifier si les votes sont ouverts
    $statusStmt = $db->prepare("SELECT value FROM settings WHERE `key` = 'votes_open'");
    $statusStmt->execute();
    $setting = $statusStmt->fetch();
    
    $votesOpen = $setting ? (int)$setting['value'] === 1 : false;
    
    if (!$votesOpen) {
        http_response_code(403);
        echo json_encode(['error' => 'Les votes sont actuellement fermés']);
        exit;
    }
    
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    
    // Vérifier si l'utilisateur a déjà voté (basé sur voter_id au lieu de l'IP)
    $checkStmt = $db->prepare("SELECT id, character_id FROM votes WHERE voter_ip = ? LIMIT 1");
    $checkStmt->execute([$voter_id]);
    $existingVote = $checkStmt->fetch();
    
    if ($existingVote) {
        // Mettre à jour le vote existant au lieu de le bloquer
        $updateStmt = $db->prepare("
            UPDATE votes 
            SET character_id = ?, user_agent = ? 
            WHERE id = ?
        ");
        $updateStmt->execute([$character_id, $userAgent, $existingVote['id']]);
        
        // Récupérer le vote mis à jour
        $voteStmt = $db->prepare("SELECT * FROM votes WHERE id = ?");
        $voteStmt->execute([$existingVote['id']]);
        $vote = $voteStmt->fetch();
        
        http_response_code(200);
        echo json_encode(['success' => true, 'vote' => $vote, 'updated' => true]);
    } else {
        // Insérer un nouveau vote (utiliser voter_id dans la colonne voter_ip)
        $insertStmt = $db->prepare("
            INSERT INTO votes (character_id, voter_ip, user_agent) 
            VALUES (?, ?, ?)
        ");
        
        $insertStmt->execute([$character_id, $voter_id, $userAgent]);
        
        $voteId = $db->lastInsertId();
        
        // Récupérer le vote créé
        $voteStmt = $db->prepare("SELECT * FROM votes WHERE id = ?");
        $voteStmt->execute([$voteId]);
        $vote = $voteStmt->fetch();
        
        http_response_code(201);
        echo json_encode(['success' => true, 'vote' => $vote, 'updated' => false]);
    }
    
} catch (PDOException $e) {
    error_log("Error submitting vote: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to submit vote']);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to submit vote']);
}
?>
