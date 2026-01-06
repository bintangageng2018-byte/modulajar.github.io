// --- DATA DEFAULT & STATE ---
const defaultSchool = {
  name: "SDN PEJATEN TIMUR 07",
  logo:
    "https://z-cdn-media.chatglm.cn/files/f4a9c140-a57f-4fb3-8121-1e603ceed38a.jpeg?auth_key=1867551877-1a4401e1f726498ba873eed5db1f891b-0-c98faf96fed2da9b45d3236ebb3fad04",
  building:
    "https://z-cdn-media.chatglm.cn/files/60ba8caa-ded9-4437-8b9b-280afaff4f92.jpeg?auth_key=1867551877-12aa738f57cd43929ee830536a3505ff-0-fcb76315c98c444465aba64249acd823",
};

// Data awal user (Template)
const initialUsersTemplate = [
  { username: "admin", password: "admin", role: "admin" },
  { username: "guru", password: "guru", role: "user" },
];

let currentUser = null;

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi User agar bisa diedit (hapus hardcode fallback)
  initUserSystem();

  loadSchoolIdentity();
  checkSession();
  renderUserTable();
});

// --- SISTEM MANAJEMEN USER (EDITABLE) ---
function initUserSystem() {
  const existingUsers = localStorage.getItem("appUsers");
  if (!existingUsers) {
    // Jika belum ada user sama sekali, simpan default user
    localStorage.setItem("appUsers", JSON.stringify(initialUsersTemplate));
  }
}

// Fungsi ini mengambil data user murni dari LocalStorage
function getUsers() {
  const stored = localStorage.getItem("appUsers");
  return stored ? JSON.parse(stored) : [];
}

function saveUsers(users) {
  localStorage.setItem("appUsers", JSON.stringify(users));
  renderUserTable();
}

// --- AUTHENTICATION FUNCTIONS ---
function checkSession() {
  const sessionUser = localStorage.getItem("currentUser");
  if (sessionUser) {
    currentUser = JSON.parse(sessionUser);
    // Cek apakah user yang login masih ada di daftar user yang ada
    const currentUsers = getUsers();
    const userExists = currentUsers.find(
      (u) => u.username === currentUser.username
    );

    if (userExists) {
      showDashboard();
    } else {
      // Jika user dihapus admin, logout otomatis
      localStorage.removeItem("currentUser");
      showLogin();
    }
  } else {
    showLogin();
  }
}

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const u = document.getElementById("loginUsername").value;
  const p = document.getElementById("loginPassword").value;

  const users = getUsers();
  const validUser = users.find(
    (user) => user.username === u && user.password === p
  );

  if (validUser) {
    currentUser = validUser;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    showToast("Login Berhasil!", "success");
    showDashboard();
  } else {
    showToast("Username atau Password salah!", "error");
  }
});

function handleLogout() {
  if (confirm("Apakah Anda yakin ingin logout?")) {
    localStorage.removeItem("currentUser");
    currentUser = null;
    document.getElementById("loginUsername").value = "";
    document.getElementById("loginPassword").value = "";
    showLogin();
  }
}

function showLogin() {
  document.getElementById("login-page").style.display = "flex";
  document.getElementById("dashboard").style.display = "none";
}

function showDashboard() {
  document.getElementById("login-page").style.display = "none";
  document.getElementById("dashboard").style.display = "flex";

  // Set User Info di Header
  document.getElementById("displayUsername").textContent = currentUser.username;

  // Cek Role: Jika bukan admin, sembunyikan menu Pengaturan
  if (currentUser.role !== "admin") {
    document.getElementById("btnPengaturan").classList.add("hidden");
  } else {
    document.getElementById("btnPengaturan").classList.remove("hidden");
  }

  backToMenu();
}

// --- NAVIGATION FUNCTIONS ---

function openBahasaIndonesiaMenu() {
  hideAllSections();
  document.getElementById("bahasaIndonesiaSection").style.display = "block";
}

function openMatematikaMenu() {
  hideAllSections();
  document.getElementById("matematikaSection").style.display = "block";
}

function openPancasilaMenu() {
  hideAllSections();
  document.getElementById("pancasilaSection").style.display = "block";
}

function openIPASMenu() {
  hideAllSections();
  document.getElementById("ipasSection").style.display = "block";
}

function openBahasaInggrisMenu() {
  hideAllSections();
  document.getElementById("bahasaInggrisSection").style.display = "block";
}

function openSeniRupaMenu() {
  hideAllSections();
  document.getElementById("seniRupaSection").style.display = "block";
}

function openKalenderPendidikanMenu() {
  hideAllSections();
  document.getElementById("kalenderPendidikanSection").style.display = "block";
}

function openModule(moduleId) {
  if (moduleId === "pengaturan") {
    hideAllSections();
    document.getElementById("pengaturanSection").style.display = "block";

    document.getElementById("settingSchoolName").value =
      localStorage.getItem("schoolName") || defaultSchool.name;
    renderUserTable();
  }
}

function backToMenu() {
  hideAllSections();
  document.getElementById("menuSection").style.display = "block";
}

function hideAllSections() {
  const sections = document.querySelectorAll(".form-section, #menuSection");
  sections.forEach((sec) => (sec.style.display = "none"));
}

// FUNGSI BUKA FILE
function openLink(filePath, fileName) {
  // Buka file di tab baru
  if (filePath && filePath !== "#") {
    window.open(filePath, "_blank");
  } else {
    showToast("Link tidak valid", "error");
  }
}

// --- SETTINGS: SCHOOL IDENTITY ---

function loadSchoolIdentity() {
  const name = localStorage.getItem("schoolName") || defaultSchool.name;
  const logo = localStorage.getItem("schoolLogo") || defaultSchool.logo;

  // Update Dashboard Header
  document.getElementById("headerSchoolName").textContent = name;
  document.getElementById(
    "pageTitle"
  ).textContent = `APLIKASI MODUL AJAR - ${name}`;
  document.getElementById("headerLogo").src = logo;

  // Update Login Page (Kanan) -> Nama Sekolah
  document.getElementById("loginRightSchoolName").textContent = name;

  // Update Login Page (Kiri atas) -> Logo
  document.getElementById("loginLogo").src = logo;
}

function saveSchoolIdentity() {
  const name = document.getElementById("settingSchoolName").value;
  const fileInput = document.getElementById("settingLogoFile");

  if (!name) {
    showToast("Nama Sekolah tidak boleh kosong!", "error");
    return;
  }

  localStorage.setItem("schoolName", name);

  // Handle Logo File Upload (Convert to Base64)
  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64Logo = e.target.result;
      try {
        localStorage.setItem("schoolLogo", base64Logo);
        loadSchoolIdentity();
        showToast("Identitas Sekolah berhasil diperbarui!", "success");
      } catch (err) {
        showToast("Ukuran gambar terlalu besar untuk LocalStorage", "error");
        console.error(err);
      }
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    loadSchoolIdentity();
    showToast("Nama Sekolah berhasil diperbarui!", "success");
  }
}

// --- USER MANAGEMENT FUNCTIONS ---

function renderUserTable() {
  const users = getUsers();
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  users.forEach((user, index) => {
    const tr = document.createElement("tr");
    const badgeClass = user.role === "admin" ? "badge-admin" : "badge-user";

    tr.innerHTML = `
      <td>${user.username}</td>
      <td>${user.password}</td>
      <td><span class="badge ${badgeClass}">${user.role.toUpperCase()}</span></td>
      <td>
        <button class="btn btn-edit-small" onclick="editUser(${index})"><i class="fas fa-pen"></i></button>
        ${
          user.username !== "admin"
            ? `<button class="btn btn-danger" style="margin-left: 5px;" onclick="deleteUser(${index})"><i class="fas fa-trash"></i></button>`
            : '<span style="color:#aaa; font-size:11px; margin-left: 5px;">Default</span>'
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function addUser() {
  const u = document.getElementById("newUsername").value;
  const p = document.getElementById("newPassword").value;
  const r = document.getElementById("newRole").value;

  if (!u || !p) {
    showToast("Username dan Password wajib diisi!", "error");
    return;
  }

  const users = getUsers();

  // Cek duplikat
  if (users.find((user) => user.username === u)) {
    showToast("Username sudah ada!", "error");
    return;
  }

  users.push({ username: u, password: p, role: r });
  saveUsers(users);

  // Reset Form
  document.getElementById("newUsername").value = "";
  document.getElementById("newPassword").value = "";
  showToast("User berhasil ditambahkan!", "success");
}

// Fungsi Edit User (Menggunakan Prompt)
function editUser(index) {
  const users = getUsers();
  const user = users[index];

  const newName = prompt("Edit Username:", user.username);
  if (newName === null) return; // Cancel

  const newPass = prompt("Edit Password:", user.password);
  if (newPass === null) return; // Cancel

  user.username = newName;
  user.password = newPass;

  saveUsers(users);

  // Update session jika mengedit diri sendiri
  if (currentUser && currentUser.username === newName) {
    currentUser.username = newName;
    currentUser.password = newPass;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    document.getElementById("displayUsername").textContent = newName;
  }

  showToast("User berhasil diupdate!", "success");
}

function deleteUser(index) {
  if (confirm("Yakin ingin menghapus user ini?")) {
    const users = getUsers();
    users.splice(index, 1);
    saveUsers(users);
    showToast("User dihapus.", "info");
  }
}

// --- UTILS ---
function showToast(msg, type) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}
