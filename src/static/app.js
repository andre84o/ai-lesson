document.addEventListener('DOMContentLoaded', () => {
  const countrySelect = document.getElementById('country');
  const citySelect = document.getElementById('city');
  const form = document.getElementById('search-form');
  const status = document.getElementById('status');
  const poisList = document.getElementById('pois');

  // Read country map JSON injected by server in a safe <script type="application/json"> tag
  let countryMap = {};
  const countryDataEl = document.getElementById('country-data');
  if (countryDataEl) {
    try {
      countryMap = JSON.parse(countryDataEl.textContent || '{}');
    } catch (e) {
      console.error('Failed to parse country data JSON:', e);
      countryMap = {};
    }
  }

  // Populate countries
  Object.keys(countryMap).forEach(country => {
    const opt = document.createElement('option');
    opt.value = country;
    opt.textContent = country;
    countrySelect.appendChild(opt);
  });

  function populateCities() {
    const country = countrySelect.value;
    citySelect.innerHTML = '';
    (countryMap[country] || []).forEach(city => {
      const opt = document.createElement('option');
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
  }

  countrySelect.addEventListener('change', populateCities);
  // initialize
  if (countrySelect.options.length > 0) {
    countrySelect.selectedIndex = 0;
    populateCities();
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const country = countrySelect.value;
    const city = citySelect.value;
    const radius = document.getElementById('radius').value;
    const limit = document.getElementById('limit').value;

    status.textContent = 'Searching...';
    poisList.innerHTML = '';

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, city, radius, limit })
      });
      const data = await res.json();
      if (data.error) {
        status.textContent = 'Error: ' + data.error;
        return;
      }
      status.textContent = `${data.count} results`;
      if (Array.isArray(data.pois)) {
        data.pois.forEach(p => {
          const li = document.createElement('li');
          const name = p.tags && (p.tags.name || p.tags.operator) ? (p.tags.name || p.tags.operator) : '(no name)';
          li.textContent = `${name} — ${p.lat || ''}, ${p.lon || ''}`;
          poisList.appendChild(li);
        });
      }
    } catch (e) {
      status.textContent = 'Request failed: ' + e.message;
    }
  });
});
