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

// Uses backend API for accurate status
function checkStatus(url, statusEl) {
  statusEl.textContent = 'Checking...';
  statusEl.style.color = '';

  fetch(`/api/check?url=${encodeURIComponent(url)}`)
    .then(res => res.json())
    .then(data => {
      if (data.online) {
        statusEl.textContent = 'Online';
        statusEl.style.color = '#28a745';
        if (url.includes('ne2ne.com')) {
          drawChart(updateHistory(url, true));
        }
      } else {
        statusEl.textContent = 'Offline';
        statusEl.style.color = '#dc3545';
        if (url.includes('ne2ne.com')) {
          drawChart(updateHistory(url, false));
        }
      }
    })
    .catch(() => {
      statusEl.textContent = 'Error';
      statusEl.style.color = '#dc3545';
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

// New visually appealing blocky uptime chart
function drawChart(history) {
  const ctx = document.getElementById('statusChart').getContext('2d');

  const labels = history.map(entry =>
    new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  const data = history.map(entry => entry.status);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Uptime',
        data,
        backgroundColor: data.map(v => v === 1 ? '#28a745' : '#dc3545'),
        borderWidth: 0,
        barPercentage: 1.0,
        categoryPercentage: 1.0
      }]
    },
    options: {
      animation: false,
      responsive: true,
      indexAxis: 'y',
      scales: {
        x: {
          display: false,
          min: 0,
          max: 1
        },
        y: {
          ticks: {
            color: 'black',
            autoSkip: true,
            maxTicksLimit: 12
          },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const status = context.parsed.x === 1 ? 'Up' : 'Down';
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
