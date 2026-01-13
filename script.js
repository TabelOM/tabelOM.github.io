// 1. CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDrueWSjgvjaGtKAr--NElsyHCSAa7ZqE4",
  authDomain: "tabelom60.firebaseapp.com",
  databaseURL: "https://tabelom60-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tabelom60",
  storageBucket: "tabelom60.firebasestorage.app",
  messagingSenderId: "823392737112",
  appId: "1:823392737112:web:6ccfafbd5123cdb858372d"
};

// 2. INITIALIZE
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let messages = [];
let activeMessages = [];
let editID = null;

const span = document.getElementById("running-content");
const inputField = document.getElementById("rt-input");
const btnSave = document.getElementById("btnSave");
const btnCancel = document.getElementById("btnCancel");

// --- FUNGSI GLOBAL (WINDOW SCOPE) ---

window.openModal = function() { document.getElementById("rt-modal").style.display = "block"; };
window.closeModal = function() { document.getElementById("rt-modal").style.display = "none"; cancelEdit(); };

window.saveOrUpdate = function() {
    const text = inputField.value.trim();
    if (!text) return alert("Pesan kosong!");
    
    if (editID) {
        db.ref("messages/" + editID).update({ Text: text }).then(() => cancelEdit());
    } else {
        db.ref("messages").push({ Text: text, Status: "active" }).then(() => { inputField.value = ""; });
    }
};

window.updateSpeed = function(val) {
    db.ref("settings/speed").set(parseInt(val));
};

window.prepareEdit = function(id, text) {
    editID = id;
    inputField.value = text;
    btnSave.innerText = "🆙 Update";
    btnCancel.style.display = "block";
};

window.cancelEdit = function() {
    editID = null;
    inputField.value = "";
    btnSave.innerText = "💾 Simpan";
    btnCancel.style.display = "none";
};

window.toggleStatus = function(id, currentStatus) {
    db.ref("messages/" + id).update({ Status: currentStatus === "active" ? "hidden" : "active" });
};

window.deleteMessage = function(id) {
    if (confirm("Hapus permanen?")) db.ref("messages/" + id).remove();
};

// --- REALTIME LISTENERS ---

// Listen Pesan
db.ref("messages").on("value", (snapshot) => {
    const data = snapshot.val();
    messages = [];
    if (data) {
        Object.keys(data).forEach(key => { messages.push({ ID: key, ...data[key] }); });
    }
    activeMessages = messages.filter(m => m.Status !== "hidden");
    renderList();
    updateMarquee();
});

// Listen Kecepatan (AUTO UPDATE ANTAR DEVICE)
db.ref("settings/speed").on("value", (snapshot) => {
    const speedVal = snapshot.val() || 15;
    
    // Update UI Slider
    const slider = document.getElementById("speed-slider");
    const speedLabel = document.getElementById("speedValue");
    if(slider) slider.value = speedVal;
    if(speedLabel) speedLabel.innerText = speedVal;

    // Paksa Reset Animasi agar perubahan detik langsung terasa
    span.style.animation = 'none';
    void span.offsetWidth; // Trik Reflow
    span.style.animation = `marquee ${speedVal}s linear infinite`;
});

// --- LOGIKA RENDER ---

function renderList() {
    const list = document.getElementById("rt-list");
    if(!list) return;
    list.innerHTML = messages.map(m => `
        <li>
            <span onclick="toggleStatus('${m.ID}', '${m.Status}')" style="cursor:pointer">
                ${m.Status === 'active' ? '👁️' : '🚫'}
            </span>
            <span class="item-text" onclick="prepareEdit('${m.ID}', '${m.Text.replace(/'/g, "\\'")}')">
                ${m.Text}
            </span>
            <span onclick="deleteMessage('${m.ID}')" style="cursor:pointer; color:red;">🗑️</span>
        </li>
    `).join('');
}

function updateMarquee() {
    if (activeMessages.length > 0) {
        if (span.textContent.includes("Menghubungkan") || span.textContent === "Tidak ada pesan aktif.") {
            span.textContent = activeMessages[0].Text;
        }
    } else {
        span.textContent = "Tidak ada pesan aktif.";
    }
}

span.addEventListener('animationiteration', () => {
    if (activeMessages.length > 0) {
        const currentIndex = activeMessages.findIndex(m => m.Text === span.textContent);
        const nextIndex = (currentIndex + 1) % activeMessages.length;
        span.textContent = activeMessages[nextIndex].Text;
    }
});

setInterval(() => { 
    const clockEl = document.getElementById("digital-clock");
    if(clockEl) clockEl.innerText = new Date().toLocaleTimeString("id-ID"); 
}, 1000);

