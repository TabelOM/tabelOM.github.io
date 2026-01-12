const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbytn2YZXqgtqU8XcuefayvEpEV8NugEGhW4S1nIkVxyH9MIdxvgkkXPhjHHt4hHPIEe/exec";
let messages = [];
let activeMessages = [];
let editID = null; // Menyimpan ID yang sedang diedit

const span = document.getElementById("running-content");
const speedSlider = document.getElementById("speed-slider");
const inputField = document.getElementById("rt-input");
const btnSave = document.getElementById("btnSave");
const btnCancel = document.getElementById("btnCancel");
const inputLabel = document.getElementById("input-label");

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

// 3. FETCH GLOBAL DATA
async function fetchMessages() {
    try {
        const res = await fetch(SCRIPT_URL);
        const data = await res.json();
        messages = Array.isArray(data) ? data : data.data;
        updateActiveMessages();
        renderList();
    } catch (e) { console.error("Error fetching data"); }
}

function renderList() {
    const list = document.getElementById("rt-list");
    list.innerHTML = messages.map(m => {
        const isVisible = String(m.Status).toLowerCase() !== "hidden";
        return `
        <li>
            <span class="item-visibility ${isVisible ? '' : 'muted'}" 
                  onclick="toggleItemVisibility('${m.ID}', '${isVisible ? 'hidden' : 'active'}')">
                  ${isVisible ? '👁️' : '🚫'}
            </span>
            <span class="item-text ${isVisible ? '' : 'text-muted'}" onclick="prepareEdit('${m.ID}', '${m.Text.replace(/'/g, "\\'")}')">
                ${m.Text}
            </span>
            <span class="btn-delete" onclick="deleteMessage('${m.ID}')">🗑️</span>
        </li>
    `}).join('');
}

// 4. LOGIKA EDIT (Klik Teks muncul di Box)
function prepareEdit(id, text) {
    editID = id;
    inputField.value = text;
    inputField.focus();
    
    // Ubah tampilan tombol
    inputLabel.innerText = "Edit Pesan Terpilih";
    btnSave.innerText = "🆙 Update Pesan di Database";
    btnSave.style.background = "#28a745"; // Warna hijau untuk update
    btnCancel.style.display = "block";
}

function cancelEdit() {
    editID = null;
    inputField.value = "";
    inputLabel.innerText = "Tambah Pesan Baru";
    btnSave.innerText = "💾 Simpan Ke Database";
    btnSave.style.background = "#123458";
    btnCancel.style.display = "none";
}

// 5. SIMPAN ATAU UPDATE
async function saveOrUpdate() {
    const text = inputField.value.trim();
    if (!text) return;

    btnSave.innerText = "⏳ Memproses...";
    
    const actionType = editID ? "updateText" : "insert";
    const payload = { 
        action: actionType, 
        ID: editID || Date.now().toString(), 
        Text: text, 
        Status: "active" 
    };

    await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    });

    cancelEdit();
    fetchMessages();
}

// 6. TOGGLE MATA
async function toggleItemVisibility(id, newStatus) {
    const msg = messages.find(m => m.ID.toString() === id.toString());
    msg.Status = newStatus;
    updateActiveMessages();
    renderList();

    await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "updateStatus", ID: id, Status: newStatus })
    });
}

function updateActiveMessages() {
    activeMessages = messages.filter(m => String(m.Status).toLowerCase() !== "hidden");
    if (activeMessages.length > 0) {
        if (span.textContent.includes("Memuat") || span.textContent === "Tidak ada pesan aktif.") {
            span.textContent = activeMessages[0].Text;
        }
    } else {
        span.textContent = "Tidak ada pesan aktif.";
    }
}

// 7. DELETE
async function deleteMessage(id) {
    if (!confirm("Hapus pesan?")) return;
    await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "delete", ID: id }) });
    fetchMessages();
}

// 8. INITIAL LOAD
window.onload = () => {
    const savedSpeed = localStorage.getItem("rtSpeed") || 15;
    speedSlider.value = savedSpeed;
    setSpeed(savedSpeed);
    fetchMessages();
};

function openModal() { document.getElementById("rt-modal").style.display = "block"; fetchMessages(); }
function closeModal() { cancelEdit(); document.getElementById("rt-modal").style.display = "none"; }

span.addEventListener('animationiteration', () => {
    if (activeMessages.length > 0) {
        const nextMsg = activeMessages[Math.floor(Math.random() * activeMessages.length)];
        span.textContent = nextMsg.Text;
    }
});
