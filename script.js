const DATA_URL = "data.json";
let messages = [];
let activeMessages = [];

const span = document.getElementById("running-content");
const speedSlider = document.getElementById("speed-slider");
const inputField = document.getElementById("rt-input");
const btnSave = document.getElementById("btnSave");

// 1. JAM
setInterval(() => {
    document.getElementById("digital-clock").innerText = new Date().toLocaleTimeString("id-ID");
}, 1000);

// 2. SPEED
function setSpeed(val) {
    span.style.animationDuration = val + "s";
    document.getElementById("speedValue").innerText = val;
    localStorage.setItem("rtSpeed", val);
}
speedSlider.oninput = (e) => setSpeed(e.target.value);

// 3. FETCH JSON DATA
async function fetchMessages() {
    try {
        const response = await fetch(DATA_URL + "?t=" + Date.now());
        messages = await response.json();
        updateActiveMessages();
        renderList();
    } catch (e) {
        console.error("Gagal load JSON");
        span.textContent = "Gagal memuat data.json";
    }
}

function renderList() {
    const list = document.getElementById("rt-list");
    list.innerHTML = messages.map(m => {
        const isVisible = String(m.Status).toLowerCase() === "active";
        return `
        <li>
            <span class="item-visibility ${isVisible ? '' : 'muted'}">${isVisible ? '👁️' : '🚫'}</span>
            <span class="item-text ${isVisible ? '' : 'text-muted'}" onclick="prepareEdit('${m.Text}')">
                ${m.Text}
            </span>
        </li>
    `}).join('');
}

// 4. KLIK UNTUK EDIT (PINDAH KE BOX)
function prepareEdit(text) {
    inputField.value = text;
    inputField.focus();
    btnSave.innerText = "🆙 Teks siap di-copy ke GitHub";
    btnSave.style.background = "#28a745";
}

// 5. SIMULASI SIMPAN
function simulateSave() {
    alert("PENTING: Perubahan di sini hanya sementara.\n\nUntuk mengubah secara permanen, Anda harus mengedit file 'data.json' di GitHub Anda dan melakukan Commit.");
    inputField.value = "";
    btnSave.innerText = "💾 Simpan Ke Database";
    btnSave.style.background = "#123458";
}

function updateActiveMessages() {
    activeMessages = messages.filter(m => String(m.Status).toLowerCase() === "active");
    if (activeMessages.length > 0) {
        if (span.textContent.includes("Memuat")) {
            span.textContent = activeMessages[0].Text;
        }
    }
}

// INITIAL LOAD
window.onload = () => {
    const savedSpeed = localStorage.getItem("rtSpeed") || 15;
    speedSlider.value = savedSpeed;
    setSpeed(savedSpeed);
    fetchMessages();
};

span.addEventListener('animationiteration', () => {
    if (activeMessages.length > 0) {
        const nextMsg = activeMessages[Math.floor(Math.random() * activeMessages.length)];
        span.textContent = nextMsg.Text;
    }
});

function openModal() { document.getElementById("rt-modal").style.display = "block"; fetchMessages(); }
function closeModal() { document.getElementById("rt-modal").style.display = "none"; }
