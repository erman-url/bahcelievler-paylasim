/* >> BAHÇELİEVLER FORUM - GAMES ENGINE V1.1 << */

// --- PAYLAŞILAN DEĞİŞKENLER VE BAŞLATICI ---
document.addEventListener("DOMContentLoaded", () => {
    // Skorları ilk açılışta yükle
    if (typeof renderScores === "function") renderScores();
    
    // Cyber-Jump kontrollerini bağla
    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
        gameContainer.addEventListener("touchstart", jump);
        gameContainer.addEventListener("mousedown", jump);
    }
    document.addEventListener("keydown", (e) => { 
        if (e.code === "Space") jump(); 
    });
});

// --- OYUN 1: SAYI TAHMİN MOTORU ---
let targetNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

window.resetGame = function() {
    targetNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    const status = document.getElementById("game-status");
    if (status) {
        status.textContent = "YENİ SAYI TUTULDU!";
        status.style.color = "#00d2ff";
    }
    document.getElementById("game-input-area").style.display = "block";
    document.getElementById("game-result-area").style.display = "none";
    document.getElementById("guess-input").value = "";
};

window.makeGuess = function() {
    const input = document.getElementById("guess-input");
    const status = document.getElementById("game-status");
    const guess = parseInt(input.value);

    if (isNaN(guess) || guess < 1 || guess > 100) {
        alert("Lütfen 1-100 arası geçerli bir sayı girin.");
        return;
    }

    attempts++;
    if (guess === targetNumber) {
        status.textContent = "TEBRİKLER! 🎉";
        status.style.color = "#28a745";
        document.getElementById("game-input-area").style.display = "none";
        document.getElementById("game-result-area").style.display = "block";
        document.getElementById("attempt-count").textContent = attempts;
    } else if (guess < targetNumber) {
        status.textContent = "DAHA BÜYÜK ⬆️";
        status.style.color = "#ffc107";
    } else {
        status.textContent = "DAHA KÜÇÜK ⬇️";
        status.style.color = "#ff4d4d";
    }
    input.value = "";
    input.focus();
};

window.saveScore = async function() {
    const name = document.getElementById("player-name").value || "Anonim";
    const { error } = await window.supabase.from('skorlar').insert([{
        player_name: name,
        score: attempts
    }]);

    if (!error) {
        alert("Skor kaydedildi!");
        renderScores();
        resetGame();
    }
};

// --- OYUN 2: HAREKETLİ CYBER-JUMP MOTORU ---
let isJumping = false;
let gameActive = false;
let jumpScore = 0;
let gameInterval;

window.startGame = function() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    const obstacle = document.getElementById("obstacle");
    const player = document.getElementById("player");
    jumpScore = 0;
    gameActive = true;
    
    gameInterval = setInterval(() => {
        if(!gameActive) return;
        
        let obstacleLeft = parseInt(window.getComputedStyle(obstacle).getPropertyValue("left"));
        let playerBottom = parseInt(window.getComputedStyle(player).getPropertyValue("bottom"));

        jumpScore++;
        document.getElementById("live-score").textContent = `Skor: ${Math.floor(jumpScore/10)}`;

        if (obstacleLeft < 90 && obstacleLeft > 50 && playerBottom <= 40) {
            gameOver();
        }
    }, 10);
    
    obstacle.style.animation = "moveObstacle 1.5s infinite linear";
};

function jump() {
    if (isJumping || !gameActive) return;
    const player = document.getElementById("player");
    isJumping = true;
    let position = 0;
    
    let upInterval = setInterval(() => {
        if (position >= 120) {
            clearInterval(upInterval);
            let downInterval = setInterval(() => {
                if (position <= 0) {
                    clearInterval(downInterval);
                    isJumping = false;
                }
                position -= 5;
                player.style.bottom = position + "px";
            }, 20);
        }
        position += 5;
        player.style.bottom = position + "px";
    }, 20);
}

async function gameOver() {
    gameActive = false;
    clearInterval(gameInterval);
    document.getElementById("obstacle").style.animation = "none";
    let finalScore = Math.floor(jumpScore/10);
    
    const playerName = prompt(`OYUN BİTTİ! Skorun: ${finalScore}\nAdını yaz:`) || "İsimsiz";
    await window.supabase.from('skorlar').insert([{ player_name: playerName, score: finalScore }]);
    
    document.getElementById("start-screen").style.display = "block";
    document.getElementById("game-container").style.display = "none";
    renderScores();
}

// --- SKOR LİSTELEME SİSTEMİ ---
async function renderScores() {
    const el = document.getElementById('high-scores-list');
    if (!el) return;
    const { data } = await window.supabase.from('skorlar').select('*').order('score', { ascending: true }).limit(5);

    el.innerHTML = data?.map((s, index) => `
        <div class="cyber-card" style="margin-bottom:8px; display:flex; justify-content:space-between; padding:10px;">
            <span><b>${index + 1}.</b> ${s.player_name}</span>
            <span class="neon-text">${s.score} Deneme/Skor</span>
        </div>
    `).join('') || "Henüz rekor yok.";
}