/**
 * navbar.js — Renders and hydrates the persistent top navbar
 */
(function () {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  const path = window.location.pathname;
  const isActive = (href) => path.endsWith(href) ? 'active' : '';

  placeholder.innerHTML = `
    <nav class="main-navbar">
      <a class="nav-brand" href="index.html">
        <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
          <path d="M12 2 L3 20 L21 20 Z"/>
          <circle cx="12" cy="2" r="1.5" fill="currentColor"/>
          <circle cx="3"  cy="20" r="1.5" fill="currentColor"/>
          <circle cx="21" cy="20" r="1.5" fill="currentColor"/>
          <line x1="12" y1="3.5" x2="12" y2="20" stroke-width="2"/>
        </svg>
        Quantity Measurement
      </a>
      <ul class="nav-links">
        <li><a href="index.html"   class="${isActive('index.html')}">Dashboard</a></li>
        <li><a href="measure.html" class="${isActive('measure.html')}">Measure</a></li>
        <li><a href="history.html" class="${isActive('history.html')}">History</a></li>
        <li><a href="profile.html" class="${isActive('profile.html')}">Profile</a></li>
      </ul>
      <div class="nav-right">
        <button class="nav-user-btn" onclick="window.location.href='profile.html'">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span id="nav-user-name">...</span>
        </button>
        <button class="nav-logout-btn" id="btn-logout">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </nav>
  `;

  document.getElementById('btn-logout').addEventListener('click', () => {
    api.clearToken();
    window.location.href = 'login.html';
  });

  // Hydrate user name
  api.getProfile().then(profile => {
    const el = document.getElementById('nav-user-name');
    if (el && profile?.name) {
      el.textContent = profile.name.split(' ')[0];
    }
    // Also update welcome text on dashboard if present
    const welcome = document.getElementById('welcome-text');
    if (welcome && profile?.name) {
      welcome.textContent = `Welcome Back, ${profile.name.split(' ')[0]}!`;
    }
  }).catch(() => {
    const el = document.getElementById('nav-user-name');
    if (el) el.textContent = 'User';
  });
})();
