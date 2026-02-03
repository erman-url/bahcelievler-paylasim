/* >> BAHÇELİEVLER FORUM - GAMES ENGINE V1.1 << */

// --- PAYLAŞILAN DEĞİŞKENLER VE BAŞLATICI ---
document.addEventListener("DOMContentLoaded", () => {
    // Skorları ilk açılışta yükle
    if (typeof renderScores === "function") renderScores();
    
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