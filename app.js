const STORAGE_KEY = "sweetstock_inventory_v1";
const defaultInventory = [
  { id: 1, name: "Bread Flour", category: "Ingredient", stock: 24, unit: "kg", price: 4.8, minimum: 10 },
  { id: 2, name: "Unsalted Butter", category: "Ingredient", stock: 7, unit: "kg", price: 28.5, minimum: 8 },
  { id: 3, name: "Caster Sugar", category: "Ingredient", stock: 16, unit: "kg", price: 5.2, minimum: 6 },
  { id: 4, name: "Dark Chocolate", category: "Ingredient", stock: 5, unit: "pack", price: 17.9, minimum: 6 }
];

// === Semak Log Masuk ===
const currentUser = JSON.parse(localStorage.getItem('sweetstock_currentUser') || 'null');
if (!currentUser && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
  window.location.href = 'login.html';
}

// === Papar Nama Pengguna ===
if (currentUser) {
  const userNameEl = document.getElementById('userName');
  const userAvatarEl = document.getElementById('userAvatar');
  if (userNameEl) userNameEl.textContent = currentUser.fullName || currentUser.username;
  if (userAvatarEl) userAvatarEl.textContent = (currentUser.fullName || currentUser.username).charAt(0).toUpperCase();
}

// === Log Keluar ===
document.getElementById('logoutLink')?.addEventListener('click', e => {
  e.preventDefault();
  localStorage.removeItem('sweetstock_currentUser');
  window.location.href = 'login.html';
});

// === Tarikh Hari Ini ===
const today = new Date();
const dateEl = document.getElementById('todayDate');
if (dateEl) dateEl.textContent = today.toLocaleDateString('ms-MY', {
  day: 'numeric', month: 'long', year: 'numeric'
});

// === Menu Tukar Bahagian ===
document.querySelectorAll('.nav-link').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const sectionId = btn.dataset.section + 'Section';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId)?.classList.add('active');
    const pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) {
      pageTitleEl.textContent = btn.dataset.section.charAt(0).toUpperCase() + btn.dataset.section.slice(1);
    }
  });
});

// === Pautan "View All" ===
document.querySelector('[data-goto="inventory"]')?.addEventListener('click', () => {
  document.querySelector('[data-section="inventory"]')?.click();
});

// === Data Inventori ===
function getInventory() {
  let data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!data || !data.length) {
    data = defaultInventory;
    saveInventory(data);
  }
  return data;
}
function saveInventory(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}
let inventory = getInventory();

// === Kemas Kini Nombor ===
function updateStats() {
  const total = inventory.length;
  const low = inventory.filter(i => i.stock < i.minimum);
  const value = inventory.reduce((sum, i) => sum + (i.stock * i.price), 0);
  
  const totalEl = document.getElementById('totalProducts');
  const lowEl = document.getElementById('lowStockCount');
  const valueEl = document.getElementById('inventoryValue');
  
  if (totalEl) totalEl.textContent = total;
  if (lowEl) lowEl.textContent = low.length;
  if (valueEl) valueEl.textContent = 'RM ' + value.toFixed(2);
  
  // Senarai Stok Rendah
  const listEl = document.getElementById('lowStockList');
  if (listEl) {
    if (low.length === 0) {
      listEl.innerHTML = '<p style="color:var(--muted);font-size:13px">Semua stok mencukupi ✅</p>';
    } else {
      listEl.innerHTML = low.map(i => `
        <div class="stock-alert">
          <div><strong>${i.name}</strong><span>${i.category}</span></div>
          <span class="stock-qty">${i.stock} ${i.unit} / ${i.minimum}</span>
        </div>
      `).join('');
    }
  }
  
  // Laporan Peratus
  const availablePct = total ? Math.round(((total - low.length) / total) * 100) : 0;
  const lowPct = total ? Math.round((low.length / total) * 100) : 0;
  
  const availPctEl = document.getElementById('availablePercent');
  const lowPctEl = document.getElementById('lowPercent');
  const availBar = document.getElementById('availableBar');
  const lowBar = document.getElementById('lowBar');
  const reportVal = document.getElementById('reportValue');
  
  if (availPctEl) availPctEl.textContent = availablePct + '%';
  if (lowPctEl) lowPctEl.textContent = lowPct + '%';
  if (availBar) availBar.style.width = availablePct + '%';
  if (lowBar) lowBar.style.width = lowPct + '%';
  if (reportVal) reportVal.textContent = 'RM ' + value.toFixed(2);
}

// === Papar Jadual Inventori ===
function renderTable() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const cat = document.getElementById('categoryFilter')?.value || 'all';
  const stockFilt = document.getElementById('stockFilter')?.value || 'all';
  
  let filtered = inventory.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search);
    const matchCat = cat === 'all' || i.category === cat;
    const isLow = i.stock < i.minimum;
    const matchStock = stockFilt === 'all' || (stockFilt === 'low' ? isLow : !isLow);
    return matchSearch && matchCat && matchStock;
  });
  
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;
  tbody.innerHTML = filtered.map(i => {
    const isLow = i.stock < i.minimum;
    return `
      <tr>
        <td><strong>${i.name}</strong></td>
        <td>${i.category}</td>
        <td>${i.stock}</td>
        <td>${i.unit}</td>
        <td>RM ${i.price.toFixed(2)}</td>
        <td><span class="stock-status ${isLow ? 'low' : 'available'}">${isLow ? '⚠️ Low' : '✅ Good'}</span></td>
        <td>
          <div class="action-group">
            <button class="icon-btn edit-btn" data-id="${i.id}" title="Ubah">✏️</button>
            <button class="icon-btn del-btn" data-id="${i.id}" title="Padam">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
  });
  document.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(parseInt(btn.dataset.id)));
  });
}

// === Modal Tambah/Ubah Produk ===
const modal = document.getElementById('productModal');
const form = document.getElementById('productForm');

function openEditModal(id) {
  const p = inventory.find(x => x.id === id);
  if (!p) return;
  document.getElementById('productId').value = p.id;
  document.getElementById('productName').value = p.name;
  document.getElementById('productCategory').value = p.category;
  document.getElementById('productStock').value = p.stock;
  document.getElementById('productUnit').value = p.unit;
  document.getElementById('productPrice').value = p.price;
  document.getElementById('productMinimum').value = p.minimum;
  document.getElementById('modalTitle').textContent = 'Kemas Kini Produk ✏️';
  modal.classList.add('show');
}

function openAddModal() {
  form.reset();
  document.getElementById('productId').value = '';
  document.getElementById('modalTitle').textContent = 'Tambah Produk Baru ✨';
  modal.classList.add('show');
}

function closeModal() {
  modal?.classList.remove('show');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function deleteProduct(id) {
  if (!confirm('Padam produk ini?')) return;
  inventory = inventory.filter(x => x.id !== id);
  saveInventory(inventory);
  updateStats();
  renderTable();
  showToast('Produk dipadamkan ✅');
}

// === Butang Tekan ===
document.getElementById('addProductBtn')?.addEventListener('click', openAddModal);
document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
document.getElementById('cancelBtn')?.addEventListener('click', closeModal);

form?.addEventListener('submit', e => {
  e.preventDefault();
  const idVal = document.getElementById('productId').value;
  const product = {
    id: idVal ? parseInt(idVal) : Date.now(),
    name: document.getElementById('productName').value.trim(),
    category: document.getElementById('productCategory').value,
    stock: parseFloat(document.getElementById('productStock').value),
    unit: document.getElementById('productUnit').value,
    price: parseFloat(document.getElementById('productPrice').value),
    minimum: parseFloat(document.getElementById('productMinimum').value)
  };
  
  if (idVal) {
    const idx = inventory.findIndex(x => x.id === product.id);
    if (idx !== -1) inventory[idx] = product;
    showToast('Produk dikemas kini ✅');
  } else {
    inventory.push(product);
    showToast('Produk ditambah ✅');
  }
  
  saveInventory(inventory);
  closeModal();
  updateStats();
  renderTable();
});

// === Penapis Carian ===
document.getElementById('searchInput')?.addEventListener('input', renderTable);
document.getElementById('categoryFilter')?.addEventListener('change', renderTable);
document.getElementById('stockFilter')?.addEventListener('change', renderTable);

// === Tutup Modal Klik Luar ===
modal?.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

// === Mula Jalankan ===
updateStats();
renderTable();
