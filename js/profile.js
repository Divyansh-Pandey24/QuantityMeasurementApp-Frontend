/**
 * profile.js — Loads user profile and handles password reset
 */
document.addEventListener('DOMContentLoaded', async () => {
  const nameEl   = document.getElementById('profile-name');
  const emailEl  = document.getElementById('profile-email');
  const avatarEl = document.getElementById('profile-avatar');
  const roleEl   = document.getElementById('profile-role');

  // ── Load profile ──────────────────────────────────────────────
  try {
    const profile = await api.getProfile();
    if (nameEl)   nameEl.textContent  = profile.name  || 'User';
    if (emailEl)  emailEl.textContent = profile.email || '';
    if (roleEl)   roleEl.textContent  = profile.role  || 'USER';
    if (avatarEl) avatarEl.textContent = (profile.name || 'U').charAt(0).toUpperCase();
  } catch (err) {
    toast.show('Could not load profile: ' + err.message, 'error');
  }

  // ── Reset password form ───────────────────────────────────────
  const form    = document.getElementById('reset-form');
  const currEl  = document.getElementById('curr-pass');
  const newEl   = document.getElementById('new-pass');
  const btnEl   = document.getElementById('btn-reset');

  // Password eye toggles
  document.querySelectorAll('.pw-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.innerHTML = isPass
        ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = currEl.value;
    const newPassword     = newEl.value;

    const passwordPattern = /^(?=.*[A-Z])(?=.*[@#$%^&*()+\-=])(?=.*[0-9]).{8,}$/;
    if (!passwordPattern.test(newPassword)) {
      toast.show('New password must be 8+ chars with 1 uppercase, 1 number, 1 special character.', 'error');
      return;
    }

    const email = emailEl?.textContent?.trim();
    if (!email) { toast.show('Could not determine your email. Please refresh.', 'error'); return; }

    const ogText = btnEl.textContent;
    btnEl.textContent = 'Updating…';
    btnEl.disabled = true;

    try {
      await api.resetPassword(email, currentPassword, newPassword);
      toast.show('Password updated successfully!', 'success');
      form.reset();
    } catch (err) {
      toast.show(err.message, 'error');
    } finally {
      btnEl.textContent = ogText;
      btnEl.disabled = false;
    }
  });
});
