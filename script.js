const addBtn = document.getElementById('addBtn');
const urlInput = document.getElementById('urlInput');
const sitesGrid = document.getElementById('sitesGrid');

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
  
  const light = document.createElement('div');
  light.className = 'light';
  
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
    // Remove from sites array as well
    const index = sites.findIndex(s => s.url === url);
    if (index > -1) sites.splice(index, 1);
  });

  card.appendChild(light);
  card.appendChild(siteUrl);
  card.appendChild(statusText);
  card.appendChild(deleteBtn);
  sitesGrid.appendChild(card);

  // Add to sites array for periodic refresh
  sites.push({ url, lightEl: light, statusEl: statusText });

  // First check
  checkStatus(url, light, statusText);
}




function checkStatus(url, lightEl, statusEl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
    .then(() => {
      lightEl.classList.add('green');
      statusEl.textContent = 'Online';
    })
    .catch(() => {
      lightEl.classList.add('red');
      statusEl.textContent = 'Offline';
    })
    .finally(() => {
      clearTimeout(timeout);
    });
}
const sites = []; // store { url, lightEl, statusEl }

setInterval(() => {
  sites.forEach(site => {
    // Clear old colors before re-checking
    site.lightEl.classList.remove('green', 'red');
    site.statusEl.textContent = 'Checking...';
    checkStatus(site.url, site.lightEl, site.statusEl);
  });
}, 20000); // 20 seconds

const defaultSites = [
  'https://google.com',
  'https://ne2ne.com'
];

document.addEventListener('DOMContentLoaded', () => {
  defaultSites.forEach(site => addSite(site));
});


