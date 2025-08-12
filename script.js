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

// Backend-powered status check
function checkStatus(url, statusEl) {
  statusEl.textContent = 'Checking...';
  statusEl.style.color = '';

  fetch(`/api/check?url=${encodeURIComponent(url)}`)
    .then(res => res.json())
    .then(data => {
      const isOnline = data.online;
      statusEl.textContent = isOnline ? 'Online' : 'Offline';
      statusEl.style.color = isOnline ? '#28a745' : '#dc3545';

      if (url.includes('ne2ne.com')) {
        drawTimelineGrid(updateHistory(url, isOnline));
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

// GitHub-style timeline grid
function drawTimelineGrid(history) {
  const grid = document.getElementById('timelineGrid');
  grid.innerHTML = '';

  history.forEach(entry => {
    const block = document.createElement('div');
    block.className = entry.status === 1 ? 'status-up' : 'status-down';
    block.title = `${entry.status === 1 ? 'Up' : 'Down'} — ${new Date(entry.time).toLocaleString()}`;
    grid.appendChild(block);
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
    drawTimelineGrid(existingHistory);
  }
});
