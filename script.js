/* KONFIGURASI */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzgD28b-fYtqB0a6ke-s9YrUg4WbCzL41deQqBJAzhszIhxaj2OFQM6I5-Hj8Uf9gxb/exec";
let messages = [];
let editID = null;

// Ambil Elemen DOM
const span = document.getElementById("running-content");
const clockElement = document.getElementById("digital-clock");
const modal = document.getElementById("rt-modal");
const inputField = document.getElementById("rt-input");

/* 1. JAM DIGITAL */
function updateClock() {
    clockElement.innerText = new Date().toLocaleTimeString("id-ID");
}
setInterval(updateClock, 1000);
updateClock();

/* 2. LOGIKA GANTI TEKS OTOMATIS (SOLUSI NO. 2) */
// Fungsi ini hanya mengubah isi teks tanpa merusak animasi
function updateTextContent() {
    if (!messages || messages.length === 0) return;
    
    // Ambil pesan secara acak
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    
    // Ganti isi teksnya saja
    span.textContent = randomMsg.Text;
}

// EVENT LISTENER: Menunggu animasi selesai 1 putaran di pojok kiri
span.addEventListener('animationiteration', () => {
    updateTextContent(); 
    console.log("Animasi selesai satu putaran, teks diganti.");
});

/* 3. AMBIL DATA DARI SHEETS */
async function fetchSheetsData() {
    try {
        const response = await fetch(SCRIPT_URL);
        const result = await response.json();
        messages = Array.isArray(result) ? result : result.data;
        
        // Update teks pertama kali saat data berhasil dimuat
        if (span.textContent === "Memuat data..." || span.textContent === "Menghubungkan ke Sheets...") {
            updateTextContent();
        }
        
        renderList();
    } catch (error) {
        console.error("Fetch Error:", error);
        span.textContent = "Gagal memuat data.";
    }
}

/* 4. MODAL & FORM LOGIC */
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
            <div class="rt-text" onclick="prepareEdit('${item.ID}', '${item.Text}')">${item.Text}</div>
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
        ID: editID || new Date().getTime().toString(),
        Text: text,
        KeyInTime: new Date().toLocaleString("id-ID")
    };

    try {
        await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
        closeModal();
        fetchSheetsData();
    } catch (e) {
        alert("Gagal simpan");
    } finally {
        btn.textContent = "💾 Simpan";
    }
}

async function deleteData(id) {
    if (!confirm("Hapus teks?")) return;
    try {
        await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "delete", ID: id }) });
        fetchSheetsData();
    } catch (e) {
        alert("Gagal hapus");
    }
}

// Jalankan pengambilan data pertama kali
fetchSheetsData();