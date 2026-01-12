const DATA_URL = "data.json";
let messages = [];
let activeMessages = [];

const span = document.getElementById("running-content");
const speedSlider = document.getElementById("speed-slider");

// 1. JAM DIGITAL
setInterval(() => {
    document.getElementById("digital-clock").innerText = new Date().toLocaleTimeString("id-ID");
}, 1000);

// 2. KONTROL KECEPATAN (LOKAL)
function setSpeed(val) {
    span.style.animationDuration = val + "s";
    document.getElementById("speedValue").innerText = val;
    localStorage.setItem("rtSpeed", val);
}
speedSlider.oninput = (e) => setSpeed(e.target.value);

// 3. AMBIL DATA DARI JSON
async function fetchMessages() {
    try {
        // Cache busting agar data selalu fresh
        const response = await fetch(`${DATA_URL}?t=${new Date().getTime()}`);
        if (!response.ok) throw new Error("Gagal load data.json");
        
        messages = await response.json();
        updateActiveMessages();
        renderList();
    } catch (e) {
        console.error("Error:", e);
        span.textContent = "Gagal memuat pesan dari data.json";
    }
}

function updateActiveMessages() {
    activeMessages = messages.filter(m => String(m.Status).toLowerCase() === "active");
    if (activeMessages.length > 0) {
        // Ganti teks pertama kali jika masih memuat
        if (span.textContent.includes("Memuat")) {
            span.textContent = activeMessages[0].Text;
        }
    } else {
        span.textContent = "Tidak ada pesan aktif di data.json";
    }
}

function renderList() {
    const list = document.getElementById("rt-list");
    list.innerHTML = messages.map(m => {
        const isActive = String(m.Status).toLowerCase() === "active";
        return `
            <li>
                <span class="item-visibility ${isActive ? '' : 'muted'}">${isActive ? '👁️' : '🚫'}</span>
                <span class="item-text ${isActive ? '' : 'text-muted'}">${m.Text}</span>
            </li>
        `;
    }).join("");
}

// 4. GANTI TEKS SETIAP ANIMASI SELESAI
span.addEventListener('animationiteration', () => {
    if (activeMessages.length > 0) {
        const nextMsg = activeMessages[Math.floor(Math.random() * activeMessages.length)];
        span.textContent = nextMsg.Text;
    }
});

// 5. MODAL
function openModal() {
    document.getElementById("rt-modal").style.display = "block";
    fetchMessages();
}
function closeModal() {
    document.getElementById("rt-modal").style.display = "none";
}

// INITIAL LOAD
window.onload = () => {
    const savedSpeed = localStorage.getItem("rtSpeed") || 15;
    speedSlider.value = savedSpeed;
    setSpeed(savedSpeed);
    fetchMessages();
    
    // Auto refresh data tiap 5 menit
    setInterval(fetchMessages, 300000);
};
