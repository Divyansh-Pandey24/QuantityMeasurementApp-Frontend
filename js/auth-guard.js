/**
 * auth-guard.js
 * Run synchronously before body renders to prevent flash of protected content.
 * Pages that require a JWT will redirect to login if none is stored.
 */
(function () {
  const token = localStorage.getItem('qm_token');
  if (!token) {
    // Redirect to login, preserving intended destination
    const dest = window.location.pathname;
    window.location.replace('login.html' + (dest && dest !== '/login.html' ? '?next=' + encodeURIComponent(dest) : ''));
  }
})();
