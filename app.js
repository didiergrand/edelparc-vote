// Application de vote - JavaScript vanilla

let characters = [];
let voted = false;
let votedCharacter = null;

// Détecter le chemin de base automatiquement
function getBasePath() {
    const path = window.location.pathname;
    // Si le pathname se termine par un fichier HTML, retirer le nom du fichier
    if (path.endsWith('.html')) {
        const lastSlash = path.lastIndexOf('/');
        return path.substring(0, lastSlash + 1);
    }
    // Sinon, s'assurer qu'il y a un / à la fin
    return path.endsWith('/') ? path : path + '/';
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
        const response = await fetch(`${BASE_PATH}api/characters.php`);
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
        // Permettre de voter même si on a déjà voté (pour changer de vote)
        button.disabled = false;
        if (voted && votedCharacter === character.name) {
            button.classList.add('voted');
        }
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
    // Permettre de modifier le vote
    const isChangingVote = voted && votedCharacter !== characterName;
    
    try {
        const response = await fetch(`${BASE_PATH}api/vote.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ character_id: characterId })
        });

        const data = await response.json();

        if (response.ok) {
            voted = true;
            votedCharacter = characterName;
            localStorage.setItem('voted', characterName);
            
            if (isChangingVote) {
                showSuccess(`Votre vote a été modifié pour ${characterName}`);
            } else {
                showSuccess(`Merci ! Votre vote pour ${characterName} a été enregistré`);
            }
            
            // Mettre à jour l'affichage des boutons pour montrer le vote actuel
            updateButtonsDisplay();
        } else {
            showError(data.error || 'Erreur lors du vote');
        }
    } catch (error) {
        console.error('Erreur vote:', error);
        showError('Erreur lors du vote');
    }
}

// Mettre à jour l'affichage des boutons pour montrer le vote actuel
function updateButtonsDisplay() {
    document.querySelectorAll('.character-btn').forEach(btn => {
        const nameSpan = btn.querySelector('.name');
        if (nameSpan && nameSpan.textContent === votedCharacter) {
            btn.classList.add('voted');
            btn.disabled = false; // Permettre de cliquer à nouveau pour changer
        } else {
            btn.classList.remove('voted');
            btn.disabled = false; // Tous les boutons restent actifs
        }
    });
}

// Afficher message de succès
function showSuccess(message) {
    const msg = document.getElementById('success-message');
    msg.textContent = message;
    msg.style.display = 'block';
    // Le message reste affiché (pas de timeout)
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
