// Page des résultats - JavaScript vanilla

const COLORS = ['#4f46e5', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

let password = '';

// Détecter le chemin de base automatiquement
function getBasePath() {
    const path = window.location.pathname;
    // Si on est dans un sous-dossier (ex: /vote/), retourner ce chemin
    const parts = path.split('/').filter(p => p);
    if (parts.length > 0 && parts[parts.length - 1].endsWith('.html')) {
        // On est dans un fichier HTML, donc dans un sous-dossier
        parts.pop(); // Enlever le nom du fichier
        return parts.length > 0 ? '/' + parts.join('/') + '/' : '/';
    }
    return '/';
}

const BASE_PATH = getBasePath();

// Vérifier si déjà authentifié
function checkAuth() {
    const stored = sessionStorage.getItem('results-auth');
    if (stored) {
        password = stored;
        showResults();
    }
}

// Gérer la connexion
async function handleLogin(event) {
    event.preventDefault();
    password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${BASE_PATH}api/results?password=${encodeURIComponent(password)}`);
        
        if (response.status === 403) {
            showError('Mot de passe incorrect');
            document.getElementById('password').value = '';
        } else if (response.ok) {
            sessionStorage.setItem('results-auth', password);
            showResults();
        } else {
            showError('Erreur lors de la vérification');
        }
    } catch (error) {
        console.error('Erreur connexion:', error);
        showError('Erreur de connexion');
    }
}

// Afficher les résultats
async function showResults() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('results-container').style.display = 'block';
    
    try {
        const response = await fetch(`${BASE_PATH}api/results?password=${encodeURIComponent(password)}`);
        
        if (response.ok) {
            const results = await response.json();
            results.sort((a, b) => b.votes - a.votes);
            displayResults(results);
        } else {
            showError('Erreur lors du chargement des résultats');
        }
    } catch (error) {
        console.error('Erreur chargement résultats:', error);
        showError('Erreur de connexion');
    }
}

// Afficher les résultats
function displayResults(results) {
    const list = document.getElementById('results-list');
    const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
    
    document.getElementById('total-votes').textContent = totalVotes;
    
    if (results.length === 0) {
        list.innerHTML = '<div class="empty-state">Aucun vote enregistré pour le moment</div>';
        return;
    }
    
    list.innerHTML = '';
    
    results.forEach((result, index) => {
        const percentage = totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0;
        const color = COLORS[index % COLORS.length];
        
        const item = document.createElement('div');
        item.className = 'result-item';
        
        item.innerHTML = `
            <div class="rank" style="background-color: ${color}">${index + 1}</div>
            <div class="result-info">
                <div class="result-name">${result.name}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%; background-color: ${color}"></div>
                </div>
            </div>
            <div class="result-stats">
                <div class="result-votes">${result.votes}</div>
                <div class="result-percentage">${percentage.toFixed(1)}%</div>
            </div>
        `;
        
        list.appendChild(item);
    });
}

// Afficher erreur
function showError(message) {
    const msg = document.getElementById('error-message');
    if (msg) {
        msg.textContent = message;
        msg.style.display = 'block';
    }
    
    // Aussi afficher dans le formulaire de login si présent
    const loginError = document.getElementById('login-error');
    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = 'block';
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
