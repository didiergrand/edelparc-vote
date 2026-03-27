<?php
// Script de test de connexion à la base de données
// Utilisez ce fichier pour vérifier que votre configuration fonctionne
// ⚠️ Supprimez ce fichier après les tests pour la sécurité !

require_once __DIR__ . '/config.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Test de connexion à la base de données</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .error { background: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .info { background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 10px 0; }
        h1 { color: #1f2937; }
        h2 { color: #4f46e5; margin-top: 30px; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; }
    </style>
</head>
<body>
    <h1>🔍 Test de connexion à la base de données</h1>
    
    <?php
    // Test 1 : Connexion
    echo "<h2>1. Test de connexion</h2>";
    $db = getDbConnection();
    
    if ($db) {
        echo "<div class='success'>✅ Connexion réussie à la base de données !</div>";
    } else {
        echo "<div class='error'>❌ Échec de la connexion à la base de données</div>";
        echo "<p>Vérifiez vos identifiants dans <code>config.php</code></p>";
        exit;
    }
    
    // Test 2 : Vérifier les tables
    echo "<h2>2. Vérification des tables</h2>";
    try {
        $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        if (in_array('parade', $tables) && in_array('votes', $tables)) {
            echo "<div class='success'>✅ Tables 'parade' et 'votes' trouvées</div>";
        } else {
            echo "<div class='error'>❌ Tables manquantes. Importez le fichier SQL !</div>";
            echo "<p>Tables trouvées : " . implode(', ', $tables) . "</p>";
        }
    } catch (PDOException $e) {
        echo "<div class='error'>❌ Erreur : " . htmlspecialchars($e->getMessage()) . "</div>";
    }
    
    // Test 3 : Compter les char ou groupes
    echo "<h2>3. Données dans la table 'parade'</h2>";
    try {
        $stmt = $db->query("SELECT COUNT(*) as count FROM parade");
        $count = $stmt->fetch()['count'];
        if ($count > 0) {
            echo "<div class='success'>✅ $count char ou groupe(s) trouvé(s) dans la base</div>";
            
            // Afficher les char ou groupes
            $parade = $db->query("SELECT id, name, description, order_position FROM parade ORDER BY order_position")->fetchAll();
            echo "<table>";
            echo "<tr><th>ID</th><th>Nom</th><th>Description</th><th>Position</th></tr>";
            foreach ($parade as $char) {
                echo "<tr>";
                echo "<td>" . htmlspecialchars($char['id']) . "</td>";
                echo "<td>" . htmlspecialchars($char['name']) . "</td>";
                echo "<td>" . htmlspecialchars($char['description'] ?? '') . "</td>";
                echo "<td>" . htmlspecialchars($char['order_position']) . "</td>";
                echo "</tr>";
            }
            echo "</table>";
        } else {
            echo "<div class='error'>❌ Aucun char ou groupe trouvé. Importez le fichier SQL !</div>";
        }
    } catch (PDOException $e) {
        echo "<div class='error'>❌ Erreur : " . htmlspecialchars($e->getMessage()) . "</div>";
    }
    
    // Test 4 : Compter les votes
    echo "<h2>4. Votes enregistrés</h2>";
    try {
        $stmt = $db->query("SELECT COUNT(*) as count FROM votes");
        $count = $stmt->fetch()['count'];
        echo "<div class='info'>📊 $count vote(s) enregistré(s)</div>";
    } catch (PDOException $e) {
        echo "<div class='error'>❌ Erreur : " . htmlspecialchars($e->getMessage()) . "</div>";
    }
    
    // Test 5 : Test de l'API
    echo "<h2>5. Test de l'API</h2>";
    echo "<div class='info'>";
    echo "<p>Testez l'API en visitant :</p>";
    echo "<ul>";
    echo "<li><a href='parade.php' target='_blank'>parade.php</a> - Liste des char ou groupes</li>";
    echo "<li><a href='results.php?password=" . urlencode(ADMIN_PASSWORD) . "' target='_blank'>results.php</a> - Résultats (avec mot de passe)</li>";
    echo "</ul>";
    echo "</div>";
    ?>
    
    <div class='info' style='margin-top: 30px;'>
        <p><strong>⚠️ Important :</strong> Supprimez ce fichier (<code>test-connection.php</code>) après les tests pour la sécurité !</p>
    </div>
</body>
</html>
