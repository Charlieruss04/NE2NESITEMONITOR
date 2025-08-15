// Alert banner logic
function showAlert(message) {
  let alertDiv = document.getElementById('offlineAlert');
  if (!alertDiv) {
    alertDiv = document.createElement('div');
    alertDiv.id = 'offlineAlert';
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '0';
    alertDiv.style.left = '0';
    alertDiv.style.width = '100%';
    alertDiv.style.background = '#dc3545';
    alertDiv.style.color = 'white';
    alertDiv.style.textAlign = 'center';
    alertDiv.style.padding = '16px 0';
    alertDiv.style.fontSize = '1.2em';
    alertDiv.style.zIndex = '9999';
    document.body.appendChild(alertDiv);
  }
  alertDiv.textContent = message;
  alertDiv.style.display = 'block';
}

function hideAlert() {
  const alertDiv = document.getElementById('offlineAlert');
  if (alertDiv) {
    alertDiv.style.display = 'none';
  }
}

function checkAllSitesStatus() {
  // Find all offline sites
  const offlineSites = sites.filter(site => site.statusEl.textContent === 'Offline');
  if (offlineSites.length > 0) {
    const offlineList = offlineSites.map(site => site.url.replace(/^https?:\/\//, '')).join(', ');
    const msg = offlineSites.length === 1
      ? `ALERT: ${offlineList} is OFFLINE!`
      : `ALERT: The following sites are OFFLINE: ${offlineList}`;
    showAlert(msg);
  } else {
    hideAlert();
  }
}
// Clear all history button logic
document.addEventListener('DOMContentLoaded', () => {
  const clearBtn = document.getElementById('clearHistoryBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('history_')) localStorage.removeItem(k);
      });
    });
  }
});
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
  card.appendChild(contentWrapper);
  card.appendChild(statusText);
  card.appendChild(deleteBtn);
  sitesGrid.appendChild(card);

  const siteData = {
    url,
    statusEl: statusText
  };
  sites.push(siteData);

  // Add dataset to main chart

  checkStatus(url, statusText, siteData);
}

function checkStatus(url, statusEl, siteData) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
    .then(() => {
      statusEl.textContent = 'Online';
      statusEl.style.color = '#28a745';
      updateHistory(url, true);
      checkAllSitesStatus();
    })
    .catch(() => {
      statusEl.textContent = 'Offline';
      statusEl.style.color = '#dc3545';
      updateHistory(url, false);
      checkAllSitesStatus();
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


// Main chart logic


// Refresh every 20 seconds
setInterval(() => {
  sites.forEach(site => {
    site.statusEl.textContent = 'Checking...';
    site.statusEl.style.color = '';
    checkStatus(site.url, site.statusEl, site);
  });
  // After all checks, update alert
  setTimeout(checkAllSitesStatus, 1000);
}, 20000);

const defaultSites = [
  'https://google.com',
  'https://ne2ne.com'
];

document.addEventListener('DOMContentLoaded', () => {
  defaultSites.forEach(site => addSite(site));
  setTimeout(checkAllSitesStatus, 1000);
});
