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

  // NEW: status text
  const statusText = document.createElement('div');
  statusText.className = 'status-text';
  statusText.textContent = 'Checking...';

  card.appendChild(light);
  card.appendChild(siteUrl);
  card.appendChild(statusText);
  sitesGrid.appendChild(card);

  checkStatus(url, light, statusText); // pass statusText too
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
