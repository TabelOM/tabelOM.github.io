// 1. CONFIG FIREBASE (PASTIKAN URL SUDAH SESUAI)
const firebaseConfig = {
  apiKey: "AIzaSyDrueWSjgvjaGtKAr--NElsyHCSAa7ZqE4",
  authDomain: "tabelom60.firebaseapp.com",
  databaseURL: "https://tabelom60-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tabelom60",
  storageBucket: "tabelom60.firebasestorage.app",
  messagingSenderId: "823392737112",
  appId: "1:823392737112:web:6ccfafbd5123cdb858372d"
};

// 2. INIT FIREBASE
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 3. VARIABEL GLOBAL
let messages = [];
let activeMessages = [];
let editID = null;

// Ambil elemen DOM
const span = document.getElementById("running-content");
const inputField = document.getElementById("rt-input");
const btnSave = document.getElementById("btnSave");
const btnCancel = document.getElementById("btnCancel");

// 4. FUNGSI UTAMA (SAYA PINDAHKAN KE ATAS AGAR TERBACA)
window.saveOrUpdate = function() {
    const text = inputField.value.trim();
    if (!text) {
        alert("Isi pesan dulu ya!");
        return;
    }
    
    if (editID) {
        db.ref("messages/" + editID).update({ Text: text })
          .then(() => cancelEdit());
    } else {
        db.ref("messages").push({ Text: text, Status: "active" })
          .then(() => inputField.value = "");
    }
};

window.prepareEdit = function(id, text) {
    editID = id;
    inputField.value = text;
    btnSave.innerText = "🆙 Update";
    btnSave.style.background = "#28a745";
    btnCancel.style.display = "block";
};

window.cancelEdit = function() {
    editID = null;
    inputField.value = "";
    btnSave.innerText = "💾 Simpan ke Firebase";
    btnSave.style.background = "#123458";
    btnCancel.style.display = "none";
};

window.toggleStatus = function(id, currentStatus) {
    db.ref("messages/" + id).update({ Status: currentStatus === "active" ? "hidden" : "active" });
};

window.deleteMessage = function(id) {
    if (confirm("Hapus pesan ini?")) db.ref("messages/" + id).remove();
};

window.openModal = function() { document.getElementById("rt-modal").style.display = "block"; };
window.closeModal = function() { document.getElementById("rt-modal").style.display = "none"; cancelEdit(); };

// 5. JAM & RUNNING TEXT LOGIC
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

db.ref("messages").on("value", (snapshot) => {
    const data = snapshot.val();
    messages = [];
    if (data) {
        Object.keys(data).forEach(key => {
            messages.push({ ID: key, ...data[key] });
        });
    }
    activeMessages = messages.filter(m => m.Status !== "hidden");
    
    // Update daftar di modal
    const list = document.getElementById("rt-list");
    if(list) {
        list.innerHTML = messages.map(m => `
            <li>
                <span style="cursor:pointer" onclick="toggleStatus('${m.ID}', '${m.Status}')">${m.Status === 'active' ? '👁️' : '🚫'}</span>
                <span class="item-text" onclick="prepareEdit('${m.ID}', '${m.Text}')">${m.Text}</span>
                <span onclick="deleteMessage('${m.ID}')" style="cursor:pointer">🗑️</span>
            </li>
        `).join('');
    }

    if (activeMessages.length > 0) {
        if (span.textContent.includes("Menghubungkan")) span.textContent = activeMessages[0].Text;
    } else {
        span.textContent = "Tidak ada pesan aktif.";
    }
});

span.addEventListener('animationiteration', () => {
    if (activeMessages.length > 0) {
        const currentIndex = activeMessages.findIndex(m => m.Text === span.textContent);
        const nextIndex = (currentIndex + 1) % activeMessages.length;
        span.textContent = activeMessages[nextIndex].Text;
    }
});

window.onload = () => {
    const savedSpeed = localStorage.getItem("rtSpeed") || 15;
    const slider = document.getElementById("speed-slider");
    if(slider) {
        slider.value = savedSpeed;
        setSpeed(savedSpeed);
        slider.oninput = (e) => setSpeed(e.target.value);
    }
};
