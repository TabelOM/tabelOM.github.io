const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzgD28b-fYtqB0a6ke-s9YrUg4WbCzL41deQqBJAzhszIhxaj2OFQM6I5-Hj8Uf9gxb/exec";
let messages = [];
let editID = null;

const span = document.getElementById("running-content");
const clockElement = document.getElementById("digital-clock");
const modal = document.getElementById("rt-modal");
const inputField = document.getElementById("rt-input");
const speedSlider = document.getElementById("speed-slider");
const speedValueDisplay = document.getElementById("speedValue");

/* 1. JAM DIGITAL */
function updateClock() {
    clockElement.innerText = new Date().toLocaleTimeString("id-ID");
}
setInterval(updateClock, 1000);
updateClock();

/* 2. LOGIKA KECEPATAN */
function applySpeed(val) {
    span.style.animationDuration = val + "s";
    if(speedValueDisplay) speedValueDisplay.innerText = val;
    localStorage.setItem("marqueeSpeed", val);
}

if(speedSlider) {
    speedSlider.addEventListener("input", (e) => applySpeed(e.target.value));
}

/* 3. ANTI-HILANG: GANTI TEKS SAAT ANIMASI SELESAI */
function updateTextContent() {
    if (messages.length === 0) return;
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    span.textContent = randomMsg.Text;
}

span.addEventListener('animationiteration', updateTextContent);

/* 4. DATA SHEETS */
async function fetchSheetsData() {
    try {
        const response = await fetch(SCRIPT_URL);
        const result = await response.json();
        messages = Array.isArray(result) ? result : result.data;
        if (span.textContent.includes("Memuat") || span.textContent === "") updateTextContent();
        renderList();
    } catch (error) {
        span.textContent = "Gagal memuat data.";
    }
}

/* 5. MODAL & CRUD */
document.getElementById("btn-manage-rt").onclick = () => {
    modal.style.display = "block";
    fetchSheetsData();
};

function closeModal() {
    modal.style.display = "none";
    editID = null;
    inputField.value = "";
}

function renderList() {
    const ul = document.getElementById("rt-list");
    ul.innerHTML = "";
    messages.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div style="cursor:pointer; flex:1" onclick="prepareEdit('${item.ID}', '${item.Text}')">${item.Text}</div>
            <div class="delete-btn" onclick="deleteData('${item.ID}')">🗑️</div>
        `;
        ul.appendChild(li);
    });
}

function prepareEdit(id, text) {
    editID = id;
    inputField.value = text;
}

async function saveText() {
    const text = inputField.value.trim();
    if (!text) return;
    const btn = document.getElementById("btnSave");
    btn.textContent = "⏳...";
    const payload = {
        action: editID ? "update" : "insert",
        ID: editID || Date.now().toString(),
        Text: text,
        KeyInTime: new Date().toLocaleString("id-ID")
    };
    try {
        await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
        closeModal();
        fetchSheetsData();
    } catch (e) { alert("Gagal!"); } 
    finally { btn.textContent = "💾 Simpan"; }
}

async function deleteData(id) {
    if (!confirm("Hapus?")) return;
    await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "delete", ID: id }) });
    fetchSheetsData();
}

/* 6. INIT */
window.addEventListener("load", () => {
    const savedSpeed = localStorage.getItem("marqueeSpeed") || 15;
    if(speedSlider) speedSlider.value = savedSpeed;
    applySpeed(savedSpeed);
    fetchSheetsData();
});
