const addBtn = document.getElementById('addBtn');
const urlInput = document.getElementById('urlInput');
const sitesGrid = document.getElementById('sitesGrid');
const sites = [];

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

  const contentWrapper = document.createElement('div');
  contentWrapper.style.flex = '1';
  contentWrapper.style.display = 'flex';
  contentWrapper.style.flexDirection = 'column';

  const siteUrl = document.createElement('div');
  siteUrl.className = 'site-url';
  siteUrl.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;

  const statusText = document.createElement('div');
  statusText.className = 'status-text';
  statusText.textContent = 'Checking...';

  const chartCanvas = document.createElement('canvas');
  chartCanvas.className = 'site-chart';
  chartCanvas.height = 100; // small chart height
  chartCanvas.id = `chart-${Date.now()}-${Math.floor(Math.random()*1000)}`;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.addEventListener('click', () => {
    sitesGrid.removeChild(card);
    const index = sites.findIndex(s => s.url === url);
    if (index > -1) sites.splice(index, 1);
    localStorage.removeItem(`history_${url}`);
  });

  contentWrapper.appendChild(siteUrl);
  contentWrapper.appendChild(chartCanvas);

  card.appendChild(contentWrapper);
  card.appendChild(statusText);
  card.appendChild(deleteBtn);

  sitesGrid.appendChild(card);

  const siteData = {
    url,
    statusEl: statusText,
    chartEl: chartCanvas,
    chart: null
  };
  sites.push(siteData);

  // Draw initial chart if we have history
  const existingHistory = JSON.parse(localStorage.getItem(`history_${url}`)) || [];
  if (existingHistory.length > 0) {
    drawChart(siteData, existingHistory);
  }

  checkStatus(url, statusText, siteData);
}

function checkStatus(url, statusEl, siteData) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
    .then(() => {
      statusEl.textContent = 'Online';
      statusEl.style.color = '#28a745';
      drawChart(siteData, updateHistory(url, true));
    })
    .catch(() => {
      statusEl.textContent = 'Offline';
      statusEl.style.color = '#dc3545';
      drawChart(siteData, updateHistory(url, false));
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

function drawChart(siteData, history) {
  const ctx = siteData.chartEl.getContext('2d');
  const labels = history.map(entry =>
    new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const data = history.map(entry => entry.status);

  if (siteData.chart) siteData.chart.destroy();

  siteData.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        fill: false,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
        borderColor: ctx => ctx.dataset.data.map(v => v === 1 ? '#28a745' : '#dc3545'),
        segment: {
          borderColor: ctx => ctx.p1.parsed.y === 1 ? '#28a745' : '#dc3545'
        }
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
        y: {
          ticks: {
            color: 'black',
            stepSize: 1,
            callback: value => value === 1 ? 'Up' : 'Down'
          },
          min: 0,
          max: 1
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const status = context.parsed.y === 1 ? 'Up' : 'Down';
              const time = history[context.dataIndex].time;
              return `${status} — ${new Date(time).toLocaleString()}`;
            }
          }
        }
      }
    }
  });
}

// Refresh every 20 seconds
setInterval(() => {
  sites.forEach(site => {
    site.statusEl.textContent = 'Checking...';
    site.statusEl.style.color = '';
    checkStatus(site.url, site.statusEl, site);
  });
}, 20000);

const defaultSites = [
  'https://google.com',
  'https://example.com'
];

document.addEventListener('DOMContentLoaded', () => {
  defaultSites.forEach(site => addSite(site));
});
