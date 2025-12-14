async function fetchJSON(url, opts = {}) {
  try {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Request failed');
    return json.data;
  } catch (e) {
    showToast(e.message, 'error');
    console.error(e);
    return null;
  }
}

function showToast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  if (type === 'error') el.style.background = '#b91c1c';
  if (type === 'success') el.style.background = '#166534';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function formatCurrency(n) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR' }).format(Number(n || 0));
}

window.fetchJSON = fetchJSON;
window.showToast = showToast;
window.formatCurrency = formatCurrency;
