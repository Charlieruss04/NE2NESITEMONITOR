const addBtn = document.getElementById('addBtn');
const urlInput = document.getElementById('urlInput');
const sitesGrid = document.getElementById('sitesGrid');

const sites = []; // store { url, statusEl }

// Add site when clicking button
addBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (!url) return; // ignore empty input
  const fullUrl = normalizeUrl(url);
  addSite(fullUrl);
  urlInput.value = '';
});

// Add site when pressing Enter in the input
urlInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const url = urlInput.value.trim();
    if (!url) return; // ignore empty input
    event.preventDefault(); // prevent form submission
    addBtn.click(); // simulate clicking Add Site
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

  // Append elements to the card
  card.appendChild(siteUrl);
  card.appendChild(statusText);
  card.appendChild(deleteBtn);
  sitesGrid.appendChild(card);

  // Add to sites array for periodic refresh
  sites.push({ url, statusEl: statusText });

  // Initial status check
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
});


