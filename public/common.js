const CATEGORIES = [
  'Food',
  'Transport',
  'School',
  'Bills',
  'Entertainment',
  'Other'
];

const peso = (n) =>
  '₱' + Number(n).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

async function api(url, method = 'GET', body = null) {
  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: body !== null ? JSON.stringify(body) : undefined
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }

    return data;

  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

function fillCategories(select, withAll = false) {
  select.innerHTML =
    (withAll
      ? '<option value="">All categories</option>'
      : '') +
    CATEGORIES
      .map((c) => `<option value="${c}">${c}</option>`)
      .join('');
}

function header(active) {
  const links = [
    ['index.html', 'Dashboard'],
    ['expenses.html', 'Expenses'],
    ['foods.html', 'Food menu'],
    ['movies.html', 'Movies']
  ];

  document.querySelector('header').innerHTML = `
    <div class="bar">
      <span class="brand">Mini Information System</span>
      <nav>
        ${links
          .map(
            ([href, label]) =>
              `<a href="${href}" class="${href === active ? 'active' : ''}">${label}</a>`
          )
          .join('')}
      </nav>
    </div>
  `;
}