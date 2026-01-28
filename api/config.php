<?php
// Configuration MySQL/MariaDB pour Kreativemedia
// ⚠️ IMPORTANT : Remplacez les valeurs ci-dessous par vos identifiants réels !

// Option 1 : Utiliser les variables d'environnement (recommandé)
// Configurez-les dans Plesk ou dans votre .htaccess avec SetEnv
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'edelparc_vote-test';
$db_user = getenv('DB_USER') ?: 'edelvote';
$db_pass = getenv('DB_PASS') ?: 'Q%XJ?o7c6ysp7vbn';
$admin_password = getenv('ADMIN_PASSWORD') ?: 'edelparc26';

// Option 2 : Hardcoder les valeurs directement ici
// Décommentez et remplissez avec vos identifiants Kreativemedia :
/*
$db_host = 'localhost';
$db_name = 'votin12_voting_app';  // Remplacez par votre nom de base
$db_user = 'votin12_dbuser';      // Remplacez par votre utilisateur
$db_pass = 'VotreMotDePasse123!'; // Remplacez par votre mot de passe
$admin_password = 'mon_mot_de_passe_admin'; // Mot de passe pour accéder aux résultats
*/

// Fonction de connexion à la base de données
function getDbConnection() {
    global $db_host, $db_name, $db_user, $db_pass;
    
    try {
        $dsn = "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        return new PDO($dsn, $db_user, $db_pass, $options);
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
}

// Constantes pour compatibilité
define('ADMIN_PASSWORD', $admin_password);
?>
