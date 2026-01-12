// CONFIG FIREBASE ANDA
const firebaseConfig = {
  apiKey: "AIzaSyDrueWSjgvjaGtKAr--NElsyHCSAa7ZqE4",
  authDomain: "tabelom60.firebaseapp.com",
  databaseURL: "https://tabelom60-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tabelom60",
  storageBucket: "tabelom60.firebasestorage.app",
  messagingSenderId: "823392737112",
  appId: "1:823392737112:web:6ccfafbd5123cdb858372d",
  measurementId: "G-FZBC4FEVPS"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Variabel Global
let messages = [];
let activeMessages = [];
let editID = null;

const span = document.getElementById("running-content");
const inputField = document.getElementById("rt-input");
const btnSave = document.getElementById("btnSave");
const btnCancel = document.getElementById("btnCancel");

// 1. JAM & SPEED
setInterval(() => { 
    if(document.getElementById("digital-clock")) {
        document.getElementById("digital-clock").innerText = new Date().toLocaleTimeString("id-ID"); 
    }
}, 1000);

function setSpeed(val) { 
    span.style.animationDuration = val + "s"; 
    if(document.getElementById("speedValue")) document.getElementById("speedValue").innerText = val; 
    localStorage.setItem("rtSpeed", val); 
}

// 2. LISTEN DATABASE (REAL-TIME)
db.ref("messages").on("value", (snapshot) => {
    const data = snapshot.val();
    messages = [];
    if (data) {
        Object.keys(data).forEach(key => {
            messages.push({ ID: key, ...data[key] });
        });
    }
    updateActiveMessages();
    renderList();
});

function renderList() {
    const list = document.getElementById("rt-list");
    if(!list) return;
    list.innerHTML = messages.map(m => {
        const isVisible = m.Status !== "hidden";
        return `
        <li>
            <span class="item-visibility ${isVisible ? '' : 'muted'}" onclick="toggleStatus('${m.ID}', '${m.Status}')">
                ${isVisible ? '👁️' : '🚫'}
            </span>
            <span class="item-text ${isVisible ? '' : 'text-muted'}" onclick="prepareEdit('${m.ID}', '${m.Text.replace(/'/g, "\\'")}')">
                ${m.Text}
            </span>
            <span class="btn-delete" style="cursor:pointer; margin-left:10px" onclick="deleteMessage('${m.ID}')">🗑️</span>
        </li>
    `}).join('');
}

// 3. SIMPAN / UPDATE
async function saveOrUpdate() {
    const text = inputField.value.trim();
    if (!text) return;
    
    if (editID) {
        db.ref("messages/" + editID).update({ Text: text });
    } else {
        db.ref("messages").push({ Text: text, Status: "active" });
    }
    cancelEdit();
}

function prepareEdit(id, text) {
    editID = id;
    inputField.value = text;
    btnSave.innerText = "🆙 Update Pesan";
    btnSave.style.background = "#28a745";
    btnCancel.style.display = "block";
}

function cancelEdit() {
    editID = null;
    inputField.value = "";
    btnSave.innerText = "💾 Simpan Ke Database";
    btnSave.style.background = "#123458";
    btnCancel.style.display = "none";
}

function toggleStatus(id, currentStatus) {
    db.ref("messages/" + id).update({ Status: currentStatus === "active" ? "hidden" : "active" });
}

function deleteMessage(id) {
    if (confirm("Hapus pesan ini?")) db.ref("messages/" + id).remove();
}

function updateActiveMessages() {
    activeMessages = messages.filter(m => m.Status !== "hidden");
    if (activeMessages.length > 0) {
        if (span.textContent.includes("Menghubungkan") || span.textContent === "Tidak ada pesan aktif.") {
            span.textContent = activeMessages[0].Text;
        }
    } else {
        span.textContent = "Tidak ada pesan aktif.";
    }
}

// INITIAL LOAD
window.onload = () => {
    const savedSpeed = localStorage.getItem("rtSpeed") || 15;
    const slider = document.getElementById("speed-slider");
    if(slider) {
        slider.value = savedSpeed;
        setSpeed(savedSpeed);
        slider.oninput = (e) => setSpeed(e.target.value);
    }
};

span.addEventListener('animationiteration', () => {
    if (activeMessages.length > 0) {
        const nextMsg = activeMessages[Math.floor(Math.random() * activeMessages.length)];
        span.textContent = nextMsg.Text;
    }
});

function openModal() { document.getElementById("rt-modal").style.display = "block"; }
function closeModal() { document.getElementById("rt-modal").style.display = "none"; cancelEdit(); }
