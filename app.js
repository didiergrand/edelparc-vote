// Application de vote - JavaScript vanilla

let characters = [];
let voted = false;
let votedCharacter = null;

// Détecter le chemin de base automatiquement
function getBasePath() {
    const path = globalThis.location.pathname;
    // Si le pathname se termine par un fichier HTML, retirer le nom du fichier
    if (path.endsWith('.html')) {
        const lastSlash = path.lastIndexOf('/');
        return path.substring(0, lastSlash + 1);
    }
    // Sinon, s'assurer qu'il y a un / à la fin
    return path.endsWith('/') ? path : path + '/';
}

const BASE_PATH = getBasePath();

// Générer ou récupérer un identifiant unique pour cet utilisateur/navigateur
function getVoterId() {
    let voterId = localStorage.getItem('voter_id');
    if (!voterId) {
        // Générer un UUID v4
        voterId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.trunc(Math.random() * 16);
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        localStorage.setItem('voter_id', voterId);
    }
    return voterId;
}

// Vérifier si l'utilisateur a déjà voté
function checkVoted() {
    const votedChar = localStorage.getItem('voted');
    if (votedChar) {
        voted = true;
        votedCharacter = votedChar;
        showSuccess(`Merci ! Votre vote pour ${votedChar} a été enregistré`);
    }
}

// Vérifier l'état du vote
async function checkVoteStatus() {
    try {
        const response = await fetch(`${BASE_PATH}api/vote-status.php`);
        if (!response.ok) {
            // Si l'API n'est pas disponible, on considère que les votes sont ouverts par défaut
            return true;
        }
        const data = await response.json();
        return data.votes_open === true;
    } catch (error) {
        console.error('Erreur vérification état:', error);
        // En cas d'erreur, on considère que les votes sont ouverts par défaut
        return true;
    }
}

// Mélanger aléatoirement les parcs d'attractions (algo de Fisher-Yates)
function shuffleCharacters() {
    for (let i = characters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [characters[i], characters[j]] = [characters[j], characters[i]];
    }
}

// Charger les parcs d'attractions
async function loadCharacters() {
    try {
        // Vérifier d'abord si les votes sont ouverts
        const votesOpen = await checkVoteStatus();
        
        if (!votesOpen) {
            const grid = document.getElementById('characters-grid');
            grid.innerHTML = `
                <div style="text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #991b1b; margin-bottom: 16px;">Les votes sont actuellement fermés</h2>
                    <p style="color: #6b7280;">Merci de votre intérêt !</p>
                </div>
            `;
            grid.style.display = 'block';
            hideLoading();
            return;
        }
        
        const response = await fetch(`${BASE_PATH}api/characters.php`);
        if (!response.ok) throw new Error('Erreur de chargement');
        
        characters = await response.json();
        // Mélanger l'ordre d'affichage à chaque chargement
        shuffleCharacters();
        
        displayCharacters();
        hideLoading();
    } catch (error) {
        console.error('Erreur chargement:', error);
        showError('Erreur lors du chargement des parcs d\'attractions');
        hideLoading();
    }
}

// Afficher les parcs d'attractions
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
            <span class="name">${character.name}</span>
        `;
        
        card.appendChild(button);
        
        if (character.description) {
            const desc = document.createElement('p');
            desc.className = 'description';
            desc.textContent = character.description;
            button.appendChild(desc);
        }
        
        grid.appendChild(card);
    });
    
    grid.style.display = 'grid';
}

// Gérer le vote
async function handleVote(characterId, characterName) {
    // Vérifier d'abord si les votes sont ouverts
    const votesOpen = await checkVoteStatus();
    if (!votesOpen) {
        showError('Les votes sont actuellement fermés');
        return;
    }
    
    // Permettre de modifier le vote
    const isChangingVote = voted && votedCharacter !== characterName;
    
    try {
        const voterId = getVoterId();
        const response = await fetch(`${BASE_PATH}api/vote.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                character_id: characterId,
                voter_id: voterId
            })
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
