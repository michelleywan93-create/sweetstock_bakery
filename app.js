const STORAGE_KEY = "sweetstock_inventory_v1";
const defaultInventory = [
  { id: 1, name: "Bread Flour", category: "Ingredient", stock: 24, unit: "kg", price: 4.8, minimum: 10 },
  { id: 2, name: "Unsalted Butter", category: "Ingredient", stock: 7, unit: "kg", price: 28.5, minimum: 8 },
  { id: 3, name: "Caster Sugar", category: "Ingredient", stock: 16, unit: "kg", price: 5.2, minimum: 6 },
  { id: 4, name: "Dark Chocolate", category: "Ingredient", stock: 5, unit: "pack", price: 17.9, minimum: 6 }
];

// Semak Log Masuk
const currentUser = JSON.parse(localStorage.getItem('sweetstock_currentUser') || 'null');
if (!currentUser && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
  window.location.href = 'login.html';
}

// Papar Nama Pengguna
if (currentUser) {
  document.getElementById('userName').textContent = currentUser.fullName || currentUser.username;
  const initial = (currentUser.fullName || currentUser.username).charAt(0).toUpperCase();
  document.getElementById('userAvatar').textContent = initial;
}

// Log Keluar
document.getElementById('logoutLink')?.addEventListener('click', e => {
  e.preventDefault();
  localStorage.removeItem('sweetstock_currentUser');
  window.location.href = 'login.html';
});

// Tarikh Hari Ini
const today = new Date();
document.getElementById('todayDate').textContent = today.toLocaleDateString('ms-MY', {
  day: 'numeric', month: 'long', year: 'numeric'
});

// Menu Alih (Telefon)
const sidebar = document.getElementById('sidebar');
document.getElementById('menuBtn')?.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// Tukar Bahagian
document.querySelectorAll('.nav-link').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const sectionId = btn.dataset.section + 'Section';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId)?.classList.add('active');
    document.getElementById('pageTitle').textContent = btn.querySelector('span').textContent.trim() === '⌂' ? 'Dashboard' : btn.textContent.trim();
    sidebar?.classList.remove('open');
  });
});

// Pautan "View all"
document.querySelector('[data-goto="inventory"]')?.addEventListener('click', () => {
  document.querySelector('[data-section="inventory"]').click();
});

// Data Inventori
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

// Kemas Kini Statistik
function updateStats() {
  const total = inventory.length;
  const low = inventory.filter(i => i.stock < i.minimum);
  const value = inventory.reduce((sum, i) => sum + (i.stock * i.price), 0);
  
  document.getElementById('totalProducts').textContent = total;
  document.getElementById('lowStockCount').textContent = low.length;
  document.getElementById('inventoryValue').textContent = 'RM ' + value.toFixed(2);
  
  // Senarai Stok Rendah
  const listEl = document.getElementById('lowStockList');
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
  
  // Laporan
  const availablePct = total ? Math.round(((total - low.length) / total) * 100) : 0;
  const lowPct = total ? Math.round((low.length / total) * 100) : 0;
  document.getElementById('availablePercent').textContent = availablePct + '%';
  document.getElementById('lowPercent').textContent = lowPct + '%';
  document.getElementById('availableBar').style.width = availablePct + '%';
  document.getElementById('lowBar').style.width = lowPct + '%';
  document.getElementById('reportValue').textContent = 'RM ' + value.toFixed(2);
}

// Jadual Inventori
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
          <div class="action-group
