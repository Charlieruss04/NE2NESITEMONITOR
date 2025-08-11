const addBtn = document.getElementById('addBtn');
const urlInput = document.getElementById('urlInput');
const sitesGrid = document.getElementById('sitesGrid');
const sites = [];
let chart;

addBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (!url) return;
  const fullUrl = normalizeUrl(url);
  addSite(fullUrl);
  urlInput.value = '';
});

urlInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const url = urlInput.value.trim();
    if (!url) return;
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
  siteUrl.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;

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

function updateHistory(url, isOnline) {
  const key = `history_${url}`;
  let history = JSON.parse(localStorage.getItem(key)) || [];

  history.push({ time: Date.now(), status: isOnline ? 1 : 0 });

  const cutoff = Date.now() - (24 * 60 * 60 * 1000);
  history = history.filter(entry => entry.time >= cutoff);

  localStorage.setItem(key, JSON.stringify(history));
  return history;
}

function drawChart(history) {
  const ctx = document.getElementById('statusChart').getContext('2d');
  const labels = history.map(entry =>
    new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const data = history.map(entry => entry.status);

  if (chart) chart.destroy();

  // Option 2 - Bar Segments (Timeline)
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: data.map(v => v === 1 ? '#28a745' : '#dc3545'),
        borderWidth: 0
      }]
    },
    options: {
      animation: false,
      responsive: true,
      scales: {
        x: { 
          grid: { display: false }, 
          ticks: { color: 'black', maxRotation: 0 } 
        },
        y: { display: false }
      },
      plugins: { 
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const status = context.raw === 1 ? 'Online' : 'Offline';
              const time = history[context.dataIndex].time;
              return `${status} — ${new Date(time).toLocaleString()}`;
            }
          }
        }
      }
    }
  });
}

setInterval(() => {
  sites.forEach(site => {
    site.statusEl.textContent = 'Checking...';
    site.statusEl.style.color = '';
    checkStatus(site.url, site.statusEl);
  });
}, 20000);

const defaultSites = [
  'https://google.com',
  'https://ne2ne.com'
];

document.addEventListener('DOMContentLoaded', () => {
  defaultSites.forEach(site => addSite(site));

  const existingHistory = JSON.parse(localStorage.getItem('history_https://ne2ne.com')) || [];
  if (existingHistory.length > 0) {
    drawChart(existingHistory);
  }
});
