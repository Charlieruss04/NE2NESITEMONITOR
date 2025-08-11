const addBtn = document.getElementById('addBtn');
const urlInput = document.getElementById('urlInput');
const sitesGrid = document.getElementById('sitesGrid');
const sites = []; // store { url, statusEl }
let chart; // Chart.js instance

// Add site when clicking button
addBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (!url) return; // ignore empty input
  const fullUrl = normalizeUrl(url);
  addSite(fullUrl);
  urlInput.value = '';
});

// Add site when pressing Enter
urlInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const url = urlInput.value.trim();
    if (!url) return; // ignore empty
    event.preventDefault();
    addBtn.click();
  }
});

function normalizeUrl(url) {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

function addSite(url) {
  const card = document.createElement('div');
  card.className = 'card';

  const siteUrl = document.createElement('div');
  siteUrl.className = 'site-url';
  siteUrl.textContent = url;

  const statusText = document.createElement('div');
  statusText.className = 'status-text';
  statusText.textContent = 'Checking...';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.addEventListener('click', () => {
    sitesGrid.removeChild(card);
    const index = sites.findIndex(s => s.url === url);
    if (index > -1) sites.splice(index, 1);
  });

  card.appendChild(siteUrl);
  card.appendChild(statusText);
  card.appendChild(deleteBtn);
  sitesGrid.appendChild(card);

  sites.push({ url, statusEl: statusText });

  // First check
  checkStatus(url, statusText);
}

function checkStatus(url, statusEl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
    .then(() => {
      statusEl.textContent = 'Online';
      statusEl.style.color = '#28a745';
      if (url.includes('ne2ne.com')) {
        drawChart(updateHistory(url, true));
      }
    })
    .catch(() => {
      statusEl.textContent = 'Offline';
      statusEl.style.color = '#dc3545';
      if (url.includes('ne2ne.com')) {
        drawChart(updateHistory(url, false));
      }
    })
    .finally(() => {
      clearTimeout(timeout);
    });
}

// Store history in localStorage
function updateHistory(url, isOnline) {
  const key = `history_${url}`;
  let history = JSON.parse(localStorage.getItem(key)) || [];

  history.push({ time: Date.now(), status: isOnline ? 1 : 0 });

  // Keep only last 24 hours
  const cutoff = Date.now() - (24 * 60 * 60 * 1000);
  history = history.filter(entry => entry.time >= cutoff);

  localStorage.setItem(key, JSON.stringify(history));
  return history;
}

// Draw the Chart.js timeline
function drawChart(history) {
  const ctx = document.getElementById('statusChart').getContext('2d');
  const labels = history.map(entry => new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const data = history.map(entry => entry.status);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'ne2ne.com Status',
        data,
        borderColor: '#28a745',
        backgroundColor: 'rgba(40,167,69,0.2)',
        stepped: true,
        fill: true,
        pointRadius: 0 // no dots on line
      }]
    },
    options: {
      animation: false,
      responsive: true,
      scales: {
        y: {
          ticks: {
            callback: (value) => value === 1 ? 'Online' : 'Offline'
          },
          min: 0,
          max: 1
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// Refresh every 20 seconds
setInterval(() => {
  sites.forEach(site => {
    site.statusEl.textContent = 'Checking...';
    site.statusEl.style.color = '';
    checkStatus(site.url, site.statusEl);
  });
}, 20000);

// Default sites
const defaultSites = [
  'https://google.com',
  'https://ne2ne.com'
];

document.addEventListener('DOMContentLoaded', () => {
  defaultSites.forEach(site => addSite(site));

  // Load and draw existing history for ne2ne.com
  const existingHistory = JSON.parse(localStorage.getItem('history_https://ne2ne.com')) || [];
  if (existingHistory.length > 0) {
    drawChart(existingHistory);
  }
});
