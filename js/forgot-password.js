/**
 * forgot-password.js
 * Two-step flow:
 *  Step 1 — Enter email
 *  Step 2 — Enter new password → PUT /auth/forgotPassword/{email}
 */
document.addEventListener('DOMContentLoaded', () => {
  const step1     = document.getElementById('fp-step1');
  const step2     = document.getElementById('fp-step2');
  const emailEl   = document.getElementById('fp-email');
  const passEl    = document.getElementById('fp-pass');
  const confirmEl = document.getElementById('fp-confirm');
  const nextBtn   = document.getElementById('fp-next');
  const submitBtn = document.getElementById('fp-submit');
  const shownEmail = document.getElementById('fp-shown-email');
  const backLink  = document.getElementById('fp-back');

  let resolvedEmail = '';

  // ── Step 1: proceed to step 2 ─────────────────────────────────
  nextBtn.addEventListener('click', () => {
    const email = emailEl.value.trim();
    if (!email || !emailEl.validity.valid) {
      toast.show('Please enter a valid email address.', 'error');
      return;
    }
    resolvedEmail = email;
    shownEmail.textContent = email;
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
    passEl.focus();
  });

  // Enter key in email field goes next
  emailEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); nextBtn.click(); }
  });

  // ── Back link ─────────────────────────────────────────────────
  backLink.addEventListener('click', () => {
    step2.classList.add('hidden');
    step1.classList.remove('hidden');
  });

  // ── Password eye toggles ──────────────────────────────────────
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

  // ── Step 2: submit new password ───────────────────────────────
  submitBtn.addEventListener('click', async () => {
    const password = passEl.value;
    const confirm  = confirmEl.value;

    if (!password) { toast.show('Please enter a new password.', 'error'); return; }

    const passwordPattern = /^(?=.*[A-Z])(?=.*[@#$%^&*()+\-=])(?=.*[0-9]).{8,}$/;
    if (!passwordPattern.test(password)) {
      toast.show('Password must be 8+ chars with 1 uppercase, 1 number, 1 special character.', 'error');
      return;
    }

    if (password !== confirm) { toast.show('Passwords do not match.', 'error'); return; }

    const ogText = submitBtn.textContent;
    submitBtn.textContent = 'Resetting…';
    submitBtn.disabled = true;

    try {
      await api.forgotPassword(resolvedEmail, password);
      toast.show('Password reset successfully! Please login.', 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    } catch (err) {
      toast.show(err.message, 'error');
      submitBtn.textContent = ogText;
      submitBtn.disabled = false;
    }
  });
});
