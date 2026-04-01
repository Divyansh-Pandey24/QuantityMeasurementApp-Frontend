/**
 * register.js — Handles signup form with live validation
 */
document.addEventListener('DOMContentLoaded', () => {
  const form       = document.getElementById('register-form');
  const nameEl     = document.getElementById('reg-name');
  const emailEl    = document.getElementById('reg-email');
  const passEl     = document.getElementById('reg-pass');
  const confirmEl  = document.getElementById('reg-confirm');
  const submitEl   = document.getElementById('reg-submit');
  const strengthFill = document.getElementById('strength-fill');
  const strengthLbl  = document.getElementById('strength-label');
  const matchErr     = document.getElementById('match-error');

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

  // ── Password strength meter ───────────────────────────────────
  passEl.addEventListener('input', () => {
    const val = passEl.value;
    let score = 0;
    if (val.length >= 8)             score++;
    if (/[A-Z]/.test(val))           score++;
    if (/[0-9]/.test(val))           score++;
    if (/[^A-Za-z0-9]/.test(val))   score++;
    if (val.length >= 12)            score++;

    const levels = [
      { w: '0%',   c: '#E2E8F0', t: '' },
      { w: '25%',  c: '#EF4444', t: 'Weak' },
      { w: '50%',  c: '#F59E0B', t: 'Fair' },
      { w: '75%',  c: '#10B981', t: 'Strong' },
      { w: '100%', c: '#059669', t: 'Very Strong' },
    ];

    const lvl = val.length === 0 ? levels[0] : levels[Math.min(score, 4)];
    strengthFill.style.width           = lvl.w;
    strengthFill.style.backgroundColor = lvl.c;
    strengthLbl.textContent            = lvl.t;
    strengthLbl.style.color            = lvl.c;

    checkMatch();
  });

  // ── Password match check ─────────────────────────────────────
  function checkMatch() {
    if (confirmEl.value.length === 0) { matchErr.classList.remove('visible'); return; }
    if (passEl.value !== confirmEl.value) {
      matchErr.classList.add('visible');
      confirmEl.classList.add('is-error');
    } else {
      matchErr.classList.remove('visible');
      confirmEl.classList.remove('is-error');
    }
  }
  confirmEl.addEventListener('input', checkMatch);

  // ── Submit ────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (passEl.value !== confirmEl.value) {
      toast.show('Passwords do not match.', 'error');
      return;
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*[@#$%^&*()+\-=])(?=.*[0-9]).{8,}$/;
    if (!passwordPattern.test(passEl.value)) {
      toast.show('Password must be 8+ chars with 1 uppercase, 1 number, 1 special character.', 'error');
      return;
    }

    const ogText = submitEl.textContent;
    submitEl.textContent = 'Creating account…';
    submitEl.disabled = true;

    try {
      await api.register(nameEl.value.trim(), emailEl.value.trim(), passEl.value);
      toast.show('Account created! Redirecting…', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    } catch (err) {
      toast.show(err.message, 'error');
      submitEl.textContent = ogText;
      submitEl.disabled = false;
    }
  });
});
