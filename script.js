const addBtn = document.getElementById('addBtn');
const urlInput = document.getElementById('urlInput');
const sitesGrid = document.getElementById('sitesGrid');

const sites = []; // store { url, statusEl }

addBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (!url) return;
  const fullUrl = normalizeUrl(url);
  addSite(fullUrl);
  urlInput.value = '';
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
  
  // Removed light element
  
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

  // Add to sites array for periodic refresh
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
      statusEl.style.color = '#28a745'; // green
    })
    .catch(() => {
      statusEl.textContent = 'Offline';
      statusEl.style.color = '#dc3545'; // red
    })
    .finally(() => {
      clearTimeout(timeout);
    });
}

setInterval(() => {
  sites.forEach(site => {
    site.statusEl.textContent = 'Checking...';
    site.statusEl.style.color = '';
    checkStatus(site.url, site.statusEl);
  });
}, 20000); // 20 seconds

const defaultSites = [
  'https://google.com',
  'https://ne2ne.com'
];

document.addEventListener('DOMContentLoaded', () => {
  defaultSites.forEach(site => addSite(site));
});


