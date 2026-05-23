// State tracker for editing and database
let db = null;
let savingChart = null;
let spendingChart = null;

// Sync config state
let syncBinId = localStorage.getItem("syncBinId") || "";
let autoSyncEnabled = localStorage.getItem("autoSyncEnabled") === "true";

// Initialize Database
function initDB() {
  const stored = localStorage.getItem("financeDB");
  if (stored) {
    db = JSON.parse(stored);
  } else {
    // Populate realistic mock data for first-time use
    db = {
      purchases: [
        { item: "Groceries", price: 4500, month: "Every Month" },
        { item: "Electricity Bill", price: 2200, month: "Every Month" },
        { item: "High-Speed Wi-Fi", price: 850, month: "Every Month" },
        { item: "Gym Membership", price: 1500, month: "Every Month" },
        { item: "Soaps & Shampoo", price: 450, month: "Every Month" }
      ],
      spendings: [
        { amount: 15500, category: "Rent & Utilities", reason: "January Rent and Electric", date: "2026-01-05" },
        { amount: 3500, category: "Dining Out", reason: "New Year family dinner", date: "2026-01-12" },
        { amount: 14800, category: "Rent & Utilities", reason: "February Rent and Electric", date: "2026-02-05" },
        { amount: 5200, category: "Medical Checkup", reason: "Dental cleaning & prescription", date: "2026-02-14" },
        { amount: 15000, category: "Rent & Utilities", reason: "March Rent and Electric", date: "2026-03-05" },
        { amount: 2800, category: "Groceries Extra", reason: "Bulk pantry shopping", date: "2026-03-20" },
        { amount: 15200, category: "Rent & Utilities", reason: "April Rent and Electric", date: "2026-04-05" },
        { amount: 7500, category: "Car Repair", reason: "Brake replacement and service", date: "2026-04-18" },
        { amount: 14900, category: "Rent & Utilities", reason: "May Rent and Electric", date: "2026-05-05" },
        { amount: 4200, category: "Clothing", reason: "Summer wardrobe shopping", date: "2026-05-15" }
      ],
      savings: [
        { amount: 18000, dropReason: "None", goal: "Emergency fund growth", date: "2026-01-31" },
        { amount: 12000, dropReason: "Dental clinic expenses", goal: "Build rainy day cash", date: "2026-02-28" },
        { amount: 22000, dropReason: "None", goal: "Start equity investments", date: "2026-03-31" },
        { amount: 8000, dropReason: "Car repair bills", goal: "Keep saving above 20%", date: "2026-04-30" },
        { amount: 16000, dropReason: "Clothing expenses", goal: "Annual travel fund target", date: "2026-05-23" }
      ],
      investments: [
        { asset: "Nifty 50 Index Fund", amount: 5000, date: "2026-01-10" },
        { asset: "Gold Mutual Fund", amount: 3000, date: "2026-02-15" },
        { asset: "Tech Stock Mutual Fund", amount: 8000, date: "2026-03-18" },
        { asset: "Nifty 50 Index Fund", amount: 5000, date: "2026-04-12" },
        { asset: "Government Bonds", amount: 10000, date: "2026-05-10" }
      ],
      losses: [
        { amount: 1500, reason: "Credit card late fees", date: "2026-02-20" },
        { amount: 3000, reason: "Crypto derivative liquidation", date: "2026-04-22" },
        { amount: 500, reason: "Uncancelled Gym subscription fee", date: "2026-05-18" }
      ]
    };
    saveDB();
  }
}

// Save Database to LocalStorage
function saveDB() {
  localStorage.setItem("financeDB", JSON.stringify(db));
  autoUpload();
}

// Open / Navigation logic
function openPage(pageId, btnEl) {
  // Hide all sections
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });
  
  // Show target section
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add("active");
  }
  
  // Update sidebar active classes
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });
  if (btnEl) {
    btnEl.classList.add("active");
  }
  
  // Update Title text
  const titles = {
    home: "Dashboard Overview",
    purchases: "Non-Negotiable Monthly Purchases",
    spendings: "Expense Tracker",
    savings: "Savings Logs & Milestones",
    investments: "Asset Investment Tracker",
    losses: "Loss Registry",
    sync: "Multi-Device Cloud Sync"
  };
  document.getElementById("currentPageTitle").textContent = titles[pageId] || "Finance Tracker";
}

// Display notification messages
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  // Icon based on notification level
  let icon = "";
  if (type === "success") {
    icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 18px; height: 18px; color: var(--color-success); flex-shrink:0;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
  } else if (type === "danger") {
    icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 18px; height: 18px; color: var(--color-danger); flex-shrink:0;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
  } else {
    icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 18px; height: 18px; color: var(--color-accent); flex-shrink:0;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
  }
  
  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);
  
  // Cleanup after transition finishes
  setTimeout(() => {
    toast.style.animation = "fadeOut 0.3s forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Aggregate, Sort and Format lists by Date
function getChronologicalData(dataList, valueKey) {
  // Sort entries chronologically by Date
  const sorted = [...dataList].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Aggregate identical dates
  const aggregated = {};
  sorted.forEach(item => {
    // Clean and validate date
    let dateStr = item.date;
    if (!dateStr || dateStr.trim() === "") return;
    
    // Format YYYY-MM-DD to a simpler format e.g. "Jan 15" or "15 Jan"
    const parsedDate = new Date(dateStr);
    const label = parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    
    const amt = Number(item[valueKey] || 0);
    if (aggregated[label]) {
      aggregated[label] += amt;
    } else {
      aggregated[label] = amt;
    }
  });
  
  return {
    labels: Object.keys(aggregated),
    data: Object.values(aggregated)
  };
}

// Update home statistics panel and line graphs
function updateDashboard() {
  // Compute totals
  const totalPurchases = db.purchases.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
  const totalSavings = db.savings.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalSpendings = db.spendings.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalInvestments = db.investments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalLosses = db.losses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  
  // Render dashboard card figures
  document.getElementById("dashboardSavingsValue").textContent = `₹${totalSavings.toLocaleString()}`;
  document.getElementById("dashboardSpendingsValue").textContent = `₹${totalSpendings.toLocaleString()}`;
  document.getElementById("dashboardInvestmentsValue").textContent = `₹${totalInvestments.toLocaleString()}`;
  document.getElementById("dashboardLossesValue").textContent = `₹${totalLosses.toLocaleString()}`;
  
  // Update section page total badges
  document.getElementById("purchasesTotalBadge").textContent = `Total: ₹${totalPurchases.toLocaleString()}`;
  document.getElementById("spendingsTotalBadge").textContent = `Total: ₹${totalSpendings.toLocaleString()}`;
  document.getElementById("savingsTotalBadge").textContent = `Total: ₹${totalSavings.toLocaleString()}`;
  document.getElementById("investmentsTotalBadge").textContent = `Total: ₹${totalInvestments.toLocaleString()}`;
  document.getElementById("lossesTotalBadge").textContent = `Total: ₹${totalLosses.toLocaleString()}`;
  
  // Redraw analytics charts
  drawCharts();
}

// Draw line charts on Home view using Chart.js
function drawCharts() {
  const chartFontConfig = {
    family: "'Inter', sans-serif",
    size: 11
  };
  
  const chartGridConfig = {
    color: 'rgba(255, 255, 255, 0.05)',
    drawBorder: false
  };

  // 1. SAVINGS TREND LINE GRAPH
  const savingsData = getChronologicalData(db.savings, "amount");
  const savingCanvas = document.getElementById("savingChartCanvas");
  if (savingCanvas) {
    if (savingChart) {
      savingChart.destroy();
    }
    
    const ctx = savingCanvas.getContext("2d");
    // Create soft gradient for area chart below the line
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.25)");
    gradient.addColorStop(1, "rgba(16, 185, 129, 0.00)");
    
    savingChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: savingsData.labels,
        datasets: [{
          label: "Amount Saved (₹)",
          data: savingsData.data,
          borderColor: "#10b981",
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#10b981",
          pointBorderColor: "#0b0f19",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            titleFont: { family: "'Inter', sans-serif", size: 12 },
            bodyFont: { family: "'Inter', sans-serif", size: 12 },
            padding: 10,
            cornerRadius: 8,
            backgroundColor: "#1e293b",
            borderColor: "#334155",
            borderWidth: 1,
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8", font: chartFontConfig }
          },
          y: {
            grid: chartGridConfig,
            ticks: {
              color: "#94a3b8",
              font: chartFontConfig,
              callback: (value) => "₹" + value
            }
          }
        }
      }
    });
  }

  // 2. SPENDINGS TREND LINE GRAPH
  const spendingsData = getChronologicalData(db.spendings, "amount");
  const spendingCanvas = document.getElementById("spendingChartCanvas");
  if (spendingCanvas) {
    if (spendingChart) {
      spendingChart.destroy();
    }
    
    const ctx = spendingCanvas.getContext("2d");
    // Create soft gradient for area chart below the line
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(245, 158, 11, 0.25)");
    gradient.addColorStop(1, "rgba(245, 158, 11, 0.00)");
    
    spendingChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: spendingsData.labels,
        datasets: [{
          label: "Amount Spent (₹)",
          data: spendingsData.data,
          borderColor: "#f59e0b",
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#f59e0b",
          pointBorderColor: "#0b0f19",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            titleFont: { family: "'Inter', sans-serif", size: 12 },
            bodyFont: { family: "'Inter', sans-serif", size: 12 },
            padding: 10,
            cornerRadius: 8,
            backgroundColor: "#1e293b",
            borderColor: "#334155",
            borderWidth: 1,
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8", font: chartFontConfig }
          },
          y: {
            grid: chartGridConfig,
            ticks: {
              color: "#94a3b8",
              font: chartFontConfig,
              callback: (value) => "₹" + value
            }
          }
        }
      }
    });
  }
}

// Render dynamic tables for all section menus
function renderTables() {
  // 1. Purchases Table
  const purchasesBody = document.getElementById("purchasesTableBody");
  purchasesBody.innerHTML = "";
  if (db.purchases.length === 0) {
    purchasesBody.innerHTML = `<tr><td colspan="4" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      No non-negotiable monthly items tracked yet. Add one to start!
    </td></tr>`;
  } else {
    db.purchases.forEach((row, i) => {
      purchasesBody.innerHTML += `
        <tr>
          <td><strong style="color: var(--text-primary);">${row.item}</strong></td>
          <td><span class="text-success">₹${Number(row.price).toLocaleString()}</span></td>
          <td><span class="badge badge-emerald">${row.month}</span></td>
          <td style="text-align: center;">
            <div class="action-buttons">
              <button class="btn-icon edit" onclick="editRow('purchases', ${i})" title="Edit Item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button class="btn-icon delete" onclick="deleteRow('purchases', ${i})" title="Delete Item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </td>
        </tr>`;
    });
  }

  // 2. Spendings Table
  const spendingsBody = document.getElementById("spendingsTableBody");
  spendingsBody.innerHTML = "";
  if (db.spendings.length === 0) {
    spendingsBody.innerHTML = `<tr><td colspan="5" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      No spending records. Fill out the form to log your expenses.
    </td></tr>`;
  } else {
    // Display recent spendings first
    const sortedSpendings = [...db.spendings].map((item, index) => ({ ...item, originalIndex: index }))
                            .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedSpendings.forEach((row) => {
      spendingsBody.innerHTML += `
        <tr>
          <td><span style="font-family: monospace;">${row.date}</span></td>
          <td><span class="badge badge-amber">${row.category}</span></td>
          <td><span style="color: var(--text-muted);">${row.reason}</span></td>
          <td><strong class="text-danger">₹${Number(row.amount).toLocaleString()}</strong></td>
          <td style="text-align: center;">
            <div class="action-buttons">
              <button class="btn-icon edit" onclick="editRow('spendings', ${row.originalIndex})" title="Edit Log">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button class="btn-icon delete" onclick="deleteRow('spendings', ${row.originalIndex})" title="Delete Log">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </td>
        </tr>`;
    });
  }

  // 3. Savings Table
  const savingsBody = document.getElementById("savingsTableBody");
  savingsBody.innerHTML = "";
  if (db.savings.length === 0) {
    savingsBody.innerHTML = `<tr><td colspan="5" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      No savings records logged. Enter your monthly savings to see savings trends.
    </td></tr>`;
  } else {
    const sortedSavings = [...db.savings].map((item, index) => ({ ...item, originalIndex: index }))
                          .sort((a, b) => new Date(b.date) - new Date(a.date));
                          
    sortedSavings.forEach((row) => {
      const dropClass = row.dropReason.toLowerCase() !== "none" ? "text-danger" : "text-muted";
      savingsBody.innerHTML += `
        <tr>
          <td><span style="font-family: monospace;">${row.date}</span></td>
          <td><strong class="text-success">₹${Number(row.amount).toLocaleString()}</strong></td>
          <td><span class="${dropClass}">${row.dropReason}</span></td>
          <td><span class="text-info">${row.goal}</span></td>
          <td style="text-align: center;">
            <div class="action-buttons">
              <button class="btn-icon edit" onclick="editRow('savings', ${row.originalIndex})" title="Edit Savings">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button class="btn-icon delete" onclick="deleteRow('savings', ${row.originalIndex})" title="Delete Savings">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </td>
        </tr>`;
    });
  }

  // 4. Investments Table
  const investmentsBody = document.getElementById("investmentsTableBody");
  investmentsBody.innerHTML = "";
  if (db.investments.length === 0) {
    investmentsBody.innerHTML = `<tr><td colspan="4" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      No investments listed.
    </td></tr>`;
  } else {
    const sortedInvestments = [...db.investments].map((item, index) => ({ ...item, originalIndex: index }))
                              .sort((a, b) => new Date(b.date) - new Date(a.date));
                              
    sortedInvestments.forEach((row) => {
      investmentsBody.innerHTML += `
        <tr>
          <td><span style="font-family: monospace;">${row.date}</span></td>
          <td><span class="badge badge-indigo">${row.asset}</span></td>
          <td><strong style="color: var(--text-primary);">₹${Number(row.amount).toLocaleString()}</strong></td>
          <td style="text-align: center;">
            <div class="action-buttons">
              <button class="btn-icon edit" onclick="editRow('investments', ${row.originalIndex})" title="Edit Investment">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button class="btn-icon delete" onclick="deleteRow('investments', ${row.originalIndex})" title="Delete Investment">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </td>
        </tr>`;
    });
  }

  // 5. Losses Table
  const lossesBody = document.getElementById("lossesTableBody");
  lossesBody.innerHTML = "";
  if (db.losses.length === 0) {
    lossesBody.innerHTML = `<tr><td colspan="4" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
      Excellent! No financial losses logged. Keep leaks at bay.
    </td></tr>`;
  } else {
    const sortedLosses = [...db.losses].map((item, index) => ({ ...item, originalIndex: index }))
                          .sort((a, b) => new Date(b.date) - new Date(a.date));
                          
    sortedLosses.forEach((row) => {
      lossesBody.innerHTML += `
        <tr>
          <td><span style="font-family: monospace;">${row.date}</span></td>
          <td><span style="color: var(--text-primary);">${row.reason}</span></td>
          <td><strong class="text-danger">₹${Number(row.amount).toLocaleString()}</strong></td>
          <td style="text-align: center;">
            <div class="action-buttons">
              <button class="btn-icon edit" onclick="editRow('losses', ${row.originalIndex})" title="Edit Log">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button class="btn-icon delete" onclick="deleteRow('losses', ${row.originalIndex})" title="Delete Log">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </td>
        </tr>`;
    });
  }
}

// Handle Form Submission (Add and Edit)
function handleFormSubmit(event, section) {
  event.preventDefault();
  
  const editIndexVal = document.getElementById(`${section}_edit_index`).value;
  const isEdit = editIndexVal !== "";
  const index = parseInt(editIndexVal, 10);
  
  let entry = {};
  
  // Custom schema mappings per section
  if (section === "purchases") {
    entry.item = document.getElementById("purchases_item").value.trim();
    entry.price = Number(document.getElementById("purchases_price").value);
    entry.month = document.getElementById("purchases_month").value;
  } 
  else if (section === "spendings") {
    entry.amount = Number(document.getElementById("spendings_amount").value);
    entry.category = document.getElementById("spendings_category").value.trim();
    entry.reason = document.getElementById("spendings_reason").value.trim();
    entry.date = document.getElementById("spendings_date").value;
  }
  else if (section === "savings") {
    entry.amount = Number(document.getElementById("savings_amount").value);
    entry.dropReason = document.getElementById("savings_dropReason").value.trim() || "None";
    entry.goal = document.getElementById("savings_goal").value.trim() || "None";
    entry.date = document.getElementById("savings_date").value;
  }
  else if (section === "investments") {
    entry.asset = document.getElementById("investments_asset").value.trim();
    entry.amount = Number(document.getElementById("investments_amount").value);
    entry.date = document.getElementById("investments_date").value;
  }
  else if (section === "losses") {
    entry.amount = Number(document.getElementById("losses_amount").value);
    entry.reason = document.getElementById("losses_reason").value.trim();
    entry.date = document.getElementById("losses_date").value;
  }

  // Update or insert
  if (isEdit) {
    db[section][index] = entry;
    showToast(`Entry successfully updated in ${section}!`, "success");
  } else {
    db[section].push(entry);
    showToast(`Entry successfully added to ${section}!`, "success");
  }
  
  // Save, synchronize interface
  saveDB();
  resetForm(section);
  renderTables();
  updateDashboard();
}

// Edit entry (Enables non-destructive update flow)
function editRow(section, index) {
  const row = db[section][index];
  if (!row) return;
  
  // Fill inputs and switch titles/buttons
  document.getElementById(`${section}_edit_index`).value = index;
  
  if (section === "purchases") {
    document.getElementById("purchases_item").value = row.item;
    document.getElementById("purchases_price").value = row.price;
    document.getElementById("purchases_month").value = row.month;
    
    document.getElementById("purchasesFormTitle").textContent = "Edit Purchase Details";
    document.getElementById("purchasesSubmitBtn").textContent = "Update Purchase";
    document.getElementById("purchasesSubmitBtn").className = "btn btn-success";
  }
  else if (section === "spendings") {
    document.getElementById("spendings_amount").value = row.amount;
    document.getElementById("spendings_category").value = row.category;
    document.getElementById("spendings_reason").value = row.reason;
    document.getElementById("spendings_date").value = row.date;
    
    document.getElementById("spendingsFormTitle").textContent = "Edit Spending Details";
    document.getElementById("spendingsSubmitBtn").textContent = "Update Spending";
    document.getElementById("spendingsSubmitBtn").className = "btn btn-success";
  }
  else if (section === "savings") {
    document.getElementById("savings_amount").value = row.amount;
    document.getElementById("savings_dropReason").value = row.dropReason;
    document.getElementById("savings_goal").value = row.goal;
    document.getElementById("savings_date").value = row.date;
    
    document.getElementById("savingsFormTitle").textContent = "Edit Savings Details";
    document.getElementById("savingsSubmitBtn").textContent = "Update Savings";
    document.getElementById("savingsSubmitBtn").className = "btn btn-success";
  }
  else if (section === "investments") {
    document.getElementById("investments_asset").value = row.asset;
    document.getElementById("investments_amount").value = row.amount;
    document.getElementById("investments_date").value = row.date;
    
    document.getElementById("investmentsFormTitle").textContent = "Edit Investment Details";
    document.getElementById("investmentsSubmitBtn").textContent = "Update Investment";
    document.getElementById("investmentsSubmitBtn").className = "btn btn-success";
  }
  else if (section === "losses") {
    document.getElementById("losses_amount").value = row.amount;
    document.getElementById("losses_reason").value = row.reason;
    document.getElementById("losses_date").value = row.date;
    
    document.getElementById("lossesFormTitle").textContent = "Edit Loss Details";
    document.getElementById("lossesSubmitBtn").textContent = "Update Loss";
    document.getElementById("lossesSubmitBtn").className = "btn btn-success";
  }
  
  // Show cancel button
  const cancelBtn = document.getElementById(`${section}CancelBtn`);
  if (cancelBtn) {
    cancelBtn.style.display = "inline-flex";
  }
  
  // Scroll to form on mobile devices
  const formCard = document.querySelector(`#${section} .form-card`);
  if (formCard) {
    formCard.scrollIntoView({ behavior: 'smooth' });
  }
}

// Reset form elements
function resetForm(section) {
  // Clear hidden input
  document.getElementById(`${section}_edit_index`).value = "";
  
  // Clear inputs
  document.getElementById(`${section}Form`).reset();
  
  // Reset date field to current date (if exists)
  const dateField = document.getElementById(`${section}_date`);
  if (dateField) {
    dateField.value = new Date().toISOString().split('T')[0];
  }
  
  // Reset heading titles and buttons
  const titles = {
    purchases: "Add Monthly Purchase",
    spendings: "Record Spending",
    savings: "Record Savings",
    investments: "Log Investment",
    losses: "Record a Loss"
  };
  
  const submitText = {
    purchases: "Add Purchase",
    spendings: "Add Spending",
    savings: "Add Saving",
    investments: "Add Investment",
    losses: "Log Loss"
  };
  
  document.getElementById(`${section}FormTitle`).textContent = titles[section];
  
  const submitBtn = document.getElementById(`${section}SubmitBtn`);
  submitBtn.textContent = submitText[section];
  submitBtn.className = "btn btn-primary";
  
  const cancelBtn = document.getElementById(`${section}CancelBtn`);
  if (cancelBtn) {
    cancelBtn.style.display = "none";
  }
}

// Delete item entry from database
function deleteRow(section, index) {
  if (confirm("Are you sure you want to delete this record?")) {
    db[section].splice(index, 1);
    saveDB();
    
    // If we were editing that deleted row, reset form
    const editIndexVal = document.getElementById(`${section}_edit_index`).value;
    if (editIndexVal !== "" && parseInt(editIndexVal, 10) === index) {
      resetForm(section);
    } else if (editIndexVal !== "" && parseInt(editIndexVal, 10) > index) {
      // Offset edit index because of element shifts
      document.getElementById(`${section}_edit_index`).value = parseInt(editIndexVal, 10) - 1;
    }
    
    showToast("Entry successfully deleted.", "danger");
    renderTables();
    updateDashboard();
  }
}

// Cloud Sync Integration Methods
async function autoUpload() {
  if (autoSyncEnabled && syncBinId) {
    try {
      await fetch(`https://jsonbin-zeta.vercel.app/api/bins/${syncBinId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(db)
      });
    } catch (err) {
      console.error("Auto-upload failed", err);
    }
  }
}

async function generateBinId() {
  try {
    const res = await fetch("https://jsonbin-zeta.vercel.app/api/bins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(db)
    });
    if (!res.ok) throw new Error("Could not create cloud bin");
    const data = await res.json();
    syncBinId = data.id;
    localStorage.setItem("syncBinId", syncBinId);
    document.getElementById("sync_bin_id").value = syncBinId;
    showToast(`Generated Sync Key: ${syncBinId}. Copy this key!`, "success");
    autoUpload();
  } catch (err) {
    showToast("Failed to generate Sync Key.", "danger");
    console.error(err);
  }
}

async function uploadToCloud() {
  const binInput = document.getElementById("sync_bin_id").value.trim();
  if (!binInput) {
    showToast("Please enter or generate a Sync Key first.", "danger");
    return;
  }
  syncBinId = binInput;
  localStorage.setItem("syncBinId", syncBinId);
  
  try {
    const res = await fetch(`https://jsonbin-zeta.vercel.app/api/bins/${syncBinId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(db)
    });
    if (!res.ok) throw new Error("Could not upload data");
    showToast("Successfully uploaded database to cloud!", "success");
  } catch (err) {
    showToast("Failed to upload data to cloud.", "danger");
    console.error(err);
  }
}

async function downloadFromCloud() {
  const binInput = document.getElementById("sync_bin_id").value.trim();
  if (!binInput) {
    showToast("Please enter or generate a Sync Key first.", "danger");
    return;
  }
  syncBinId = binInput;
  localStorage.setItem("syncBinId", syncBinId);
  
  try {
    const res = await fetch(`https://jsonbin-zeta.vercel.app/api/bins/${syncBinId}`);
    if (!res.ok) throw new Error("Could not download data");
    const cloudData = await res.json();
    
    if (cloudData.purchases && cloudData.spendings && cloudData.savings) {
      db = cloudData;
      localStorage.setItem("financeDB", JSON.stringify(db));
      renderTables();
      updateDashboard();
      showToast("Successfully downloaded database from cloud!", "success");
    } else {
      throw new Error("Invalid database format");
    }
  } catch (err) {
    showToast("Failed to download data from cloud. Is the key correct?", "danger");
    console.error(err);
  }
}

function toggleAutoSync() {
  autoSyncEnabled = document.getElementById("sync_auto").checked;
  localStorage.setItem("autoSyncEnabled", autoSyncEnabled);
  if (autoSyncEnabled) {
    const binInput = document.getElementById("sync_bin_id").value.trim();
    if (binInput) {
      syncBinId = binInput;
      localStorage.setItem("syncBinId", syncBinId);
      autoUpload();
      showToast("Auto-Sync enabled.", "success");
    } else {
      showToast("Auto-Sync requires a Sync Key.", "info");
    }
  } else {
    showToast("Auto-Sync disabled.", "info");
  }
}

// Startup Initialization
window.addEventListener("DOMContentLoaded", async () => {
  // Format current date badge
  const badge = document.getElementById("currentDateBadge");
  if (badge) {
    const today = new Date();
    badge.textContent = today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
  
  // Pre-fill default dates for forms to today
  ["spendings", "savings", "investments", "losses"].forEach(sec => {
    const el = document.getElementById(`${sec}_date`);
    if (el) {
      el.value = new Date().toISOString().split('T')[0];
    }
  });
  
  initDB();
  
  // Load sync config
  document.getElementById("sync_bin_id").value = syncBinId;
  document.getElementById("sync_auto").checked = autoSyncEnabled;
  
  // Auto-download if enabled
  if (autoSyncEnabled && syncBinId) {
    try {
      const res = await fetch(`https://jsonbin-zeta.vercel.app/api/bins/${syncBinId}`);
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData.purchases && cloudData.spendings && cloudData.savings) {
          db = cloudData;
          localStorage.setItem("financeDB", JSON.stringify(db));
        }
      }
    } catch (err) {
      console.warn("Auto-sync download failed", err);
    }
  }
  
  renderTables();
  updateDashboard();
});