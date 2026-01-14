// Application de vote - JavaScript vanilla

let characters = [];
let voted = false;
let votedCharacter = null;

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

// Vérifier si l'utilisateur a déjà voté
function checkVoted() {
    const votedChar = localStorage.getItem('voted');
    if (votedChar) {
        voted = true;
        votedCharacter = votedChar;
        showSuccess(`Merci ! Votre vote pour ${votedChar} a été enregistré`);
    }
}

// Charger les personnages
async function loadCharacters() {
    try {
        const response = await fetch(`${BASE_PATH}api/characters`);
        if (!response.ok) throw new Error('Erreur de chargement');
        
        characters = await response.json();
        characters.sort((a, b) => a.order_position - b.order_position);
        
        displayCharacters();
        hideLoading();
    } catch (error) {
        console.error('Erreur chargement:', error);
        showError('Erreur lors du chargement des personnages');
        hideLoading();
    }
}

// Afficher les personnages
function displayCharacters() {
    const grid = document.getElementById('characters-grid');
    grid.innerHTML = '';
    
    characters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'character-card';
        
        const button = document.createElement('button');
        button.className = 'character-btn';
        button.disabled = voted;
        button.onclick = () => handleVote(character.id, character.name);
        
        button.innerHTML = `
            <span class="emoji">✨</span>
            <span class="name">${character.name}</span>
        `;
        
        card.appendChild(button);
        
        if (character.description) {
            const desc = document.createElement('p');
            desc.className = 'description';
            desc.textContent = character.description;
            card.appendChild(desc);
        }
        
        grid.appendChild(card);
    });
    
    grid.style.display = 'grid';
}

// Gérer le vote
async function handleVote(characterId, characterName) {
    if (voted) {
        showError('Vous avez déjà voté !');
        return;
    }

    try {
        const response = await fetch(`${BASE_PATH}api/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ character_id: characterId })
        });

        const data = await response.json();

        if (response.ok) {
            voted = true;
            votedCharacter = characterName;
            localStorage.setItem('voted', characterName);
            showSuccess(`Merci ! Votre vote pour ${characterName} a été enregistré`);
            
            // Désactiver tous les boutons
            document.querySelectorAll('.character-btn').forEach(btn => {
                btn.disabled = true;
            });
        } else {
            showError(data.error || 'Erreur lors du vote');
        }
    } catch (error) {
        console.error('Erreur vote:', error);
        showError('Erreur lors du vote');
    }
}

// Afficher message de succès
function showSuccess(message) {
    const msg = document.getElementById('success-message');
    msg.textContent = message;
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 5000);
}

// Afficher message d'erreur
function showError(message) {
    const msg = document.getElementById('error-message');
    msg.textContent = message;
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 5000);
}

// Masquer le loading
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    checkVoted();
    loadCharacters();
});
