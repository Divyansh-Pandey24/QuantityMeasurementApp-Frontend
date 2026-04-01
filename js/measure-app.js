/**
 * measure-app.js — All measure page logic: state, UI, API calls
 */
document.addEventListener('DOMContentLoaded', () => {

  // ── State ─────────────────────────────────────────────────────
  const UNITS = {
    LengthUnit:      [
      { key: 'FEET',        label: 'Feet' },
      { key: 'INCHES',      label: 'Inches' },
      { key: 'YARDS',       label: 'Yards' },
      { key: 'CENTIMETERS', label: 'Centimeters' },
      { key: 'METERS',      label: 'Meters' },
      { key: 'KILOMETERS',  label: 'Kilometers' },
      { key: 'MILES',       label: 'Miles' },
    ],
    WeightUnit:      [
      { key: 'KILOGRAM', label: 'Kilogram' },
      { key: 'GRAM',     label: 'Gram' },
      { key: 'POUND',    label: 'Pound' },
      { key: 'OUNCE',    label: 'Ounce' },
      { key: 'TON',      label: 'Ton' },
    ],
    TemperatureUnit: [
      { key: 'CELSIUS',    label: 'Celsius' },
      { key: 'FAHRENHEIT', label: 'Fahrenheit' },
      { key: 'KELVIN',     label: 'Kelvin' },
    ],
    VolumeUnit:      [
      { key: 'LITRE',       label: 'Litre' },
      { key: 'MILLILITRE',  label: 'Millilitre' },
      { key: 'GALLON',      label: 'Gallon' },
      { key: 'CUBIC_METER', label: 'Cubic Meter' },
    ],
  };

  const state = {
    type:     'LengthUnit',
    action:   'compare',   // compare | convert | add | subtract | divide
    fromVal:  1,
    toVal:    1000,
    fromUnit: 'FEET',
    toUnit:   'INCHES',
    operator: 'add',       // add | subtract | divide  (arithmetic sub-action)
  };

  // ── DOM refs ──────────────────────────────────────────────────
  const typeCards   = document.querySelectorAll('.type-card');
  const actionTabs  = document.querySelectorAll('.tab-btn');
  const fromValEl   = document.getElementById('from-value');
  const toValEl     = document.getElementById('to-value');
  const toColEl     = document.getElementById('to-col');
  const fromBtnEl   = document.getElementById('from-unit-btn');
  const fromLblEl   = document.getElementById('from-unit-label');
  const fromMenuEl  = document.getElementById('from-unit-menu');
  const toBtnEl     = document.getElementById('to-unit-btn');
  const toLblEl     = document.getElementById('to-unit-label');
  const toMenuEl    = document.getElementById('to-unit-menu');
  const centerBtn   = document.getElementById('btn-center');
  const opDropEl    = document.getElementById('op-dropdown');
  const calcBtn     = document.getElementById('btn-calculate');
  const resultBox   = document.getElementById('result-box');
  const resultInd   = document.getElementById('result-indicator');
  const resultTxt   = document.getElementById('result-text');
  const label1El    = document.getElementById('label-val1');
  const label2El    = document.getElementById('label-val2');

  // ── Custom Select helpers ─────────────────────────────────────
  function buildMenu(menuEl, units, selectedKey, onSelect) {
    menuEl.innerHTML = units.map(u =>
      `<div class="select-option${u.key === selectedKey ? ' selected' : ''}" data-key="${u.key}">${u.label}</div>`
    ).join('');
    menuEl.querySelectorAll('.select-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelect(opt.dataset.key, opt.textContent);
        menuEl.classList.remove('open');
      });
    });
  }

  function openMenu(btnEl, menuEl) {
    // Close all other menus first
    [fromMenuEl, toMenuEl, opDropEl].forEach(m => m !== menuEl && m.classList.remove('open'));
    menuEl.classList.toggle('open');
    btnEl.classList.toggle('open', menuEl.classList.contains('open'));
  }

  document.addEventListener('click', () => {
    fromMenuEl.classList.remove('open');
    toMenuEl.classList.remove('open');
    opDropEl.classList.remove('open');
    fromBtnEl.classList.remove('open');
    toBtnEl.classList.remove('open');
    centerBtn.classList.remove('open');
  });

  fromBtnEl.addEventListener('click', (e) => { e.stopPropagation(); openMenu(fromBtnEl, fromMenuEl); });
  toBtnEl.addEventListener('click',   (e) => { e.stopPropagation(); openMenu(toBtnEl,   toMenuEl);   });

  function populateDropdowns(type) {
    const units = UNITS[type] || [];
    if (units.length < 2) return;
    state.fromUnit = units[0].key;
    state.toUnit   = units[1].key;
    fromLblEl.textContent = units[0].label;
    toLblEl.textContent   = units[1].label;

    buildMenu(fromMenuEl, units, state.fromUnit, (key, label) => {
      state.fromUnit = key;
      fromLblEl.textContent = label;
      markSelected(fromMenuEl, key);
    });
    buildMenu(toMenuEl, units, state.toUnit, (key, label) => {
      state.toUnit = key;
      toLblEl.textContent = label;
      markSelected(toMenuEl, key);
    });
  }

  function markSelected(menuEl, key) {
    menuEl.querySelectorAll('.select-option').forEach(o => {
      o.classList.toggle('selected', o.dataset.key === key);
    });
  }

  // ── Type card switching ───────────────────────────────────────
  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      typeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.type = card.dataset.type;
      populateDropdowns(state.type);

      // Disable arithmetic for temperature
      const arithTab = document.querySelector('.tab-btn[data-action="arithmetic"]');
      if (arithTab) {
        if (state.type === 'TemperatureUnit') {
          arithTab.classList.add('tab-disabled');
          if (state.action === 'arithmetic') switchAction('compare');
        } else {
          arithTab.classList.remove('tab-disabled');
        }
      }

      setResult('Click Calculate to get started.', 'muted');
    });
  });

  // ── Action tab switching ──────────────────────────────────────
  function switchAction(action) {
    state.action = action;
    actionTabs.forEach(t => t.classList.toggle('active', t.dataset.action === action));
    updateUIForAction(action);
    setResult('Click Calculate to get started.', 'muted');
  }

  actionTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('tab-disabled')) return;
      switchAction(tab.dataset.action);
    });
  });

  function updateUIForAction(action) {
    const arrowSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
    const opLabels = { add: '+', subtract: '−', divide: '÷' };

    if (action === 'convert') {
      toValEl.readOnly = true;
      toValEl.style.background = 'var(--bg)';
      toValEl.style.color = 'var(--text-muted)';
      label1El.textContent = 'FROM';
      label2El.textContent = 'TO';
      centerBtn.innerHTML = arrowSVG;
      centerBtn.dataset.mode = 'swap';
      toColEl.classList.remove('hidden');
    } else if (action === 'compare') {
      toValEl.readOnly = false;
      toValEl.style.background = '';
      toValEl.style.color = '';
      label1El.textContent = 'FROM';
      label2El.textContent = 'TO';
      centerBtn.innerHTML = arrowSVG;
      centerBtn.dataset.mode = 'swap';
      toColEl.classList.remove('hidden');
    } else {
      // arithmetic
      toValEl.readOnly = false;
      toValEl.style.background = '';
      toValEl.style.color = '';
      label1El.textContent = 'VALUE 1';
      label2El.textContent = 'VALUE 2';
      centerBtn.innerHTML = opLabels[state.operator] || '+';
      centerBtn.dataset.mode = 'operator';
      toColEl.classList.remove('hidden');
    }
  }

  // ── Center button (swap / operator) ──────────────────────────
  centerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (centerBtn.dataset.mode === 'swap') {
      // Swap
      [state.fromUnit, state.toUnit] = [state.toUnit, state.fromUnit];
      const fromUnits = UNITS[state.type];
      const fLabel = fromUnits.find(u => u.key === state.fromUnit)?.label || state.fromUnit;
      const tLabel = fromUnits.find(u => u.key === state.toUnit)?.label || state.toUnit;
      fromLblEl.textContent = fLabel;
      toLblEl.textContent   = tLabel;
      markSelected(fromMenuEl, state.fromUnit);
      markSelected(toMenuEl,   state.toUnit);
      setResult('Units swapped. Click Calculate.', 'muted');
    } else {
      opDropEl.classList.toggle('open');
    }
  });

  // ── Operator options ─────────────────────────────────────────
  document.querySelectorAll('.op-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.operator = btn.dataset.op;
      const labels = { add: '+', subtract: '−', divide: '÷' };
      centerBtn.innerHTML = labels[state.operator] || '+';
      opDropEl.classList.remove('open');
      document.querySelectorAll('.op-option').forEach(b => b.classList.toggle('active', b.dataset.op === state.operator));
    });
  });

  // ── Input sync ───────────────────────────────────────────────
  fromValEl.addEventListener('input', () => { state.fromVal = fromValEl.value; });
  toValEl.addEventListener('input',   () => { state.toVal   = toValEl.value; });

  // ── Calculate ────────────────────────────────────────────────
  calcBtn.addEventListener('click', calculate);

  async function calculate() {
    fromValEl.classList.remove('is-error');
    toValEl.classList.remove('is-error');

    const fromV = parseFloat(state.fromVal);
    const toV   = parseFloat(state.toVal);

    let hasErr = false;
    if (isNaN(fromV)) { fromValEl.classList.add('is-error'); hasErr = true; }
    if (state.action !== 'convert' && isNaN(toV)) { toValEl.classList.add('is-error'); hasErr = true; }
    if (hasErr) { setResult('Please enter valid numbers.', 'error'); return; }

    // Determine backend operation
    let operation = state.action;
    if (state.action === 'arithmetic') operation = state.operator; // add | subtract | divide

    // Build DTO
    const dto = {
      thisQuantityDTO: { value: fromV, unit: state.fromUnit, measurementType: state.type },
      thatQuantityDTO: { value: state.action === 'convert' ? 0 : toV, unit: state.toUnit, measurementType: state.type },
    };
    // For arithmetic with a target unit
    if (state.action === 'arithmetic') {
      dto.targetUnitDTO = { value: 0, unit: state.fromUnit, measurementType: state.type };
    }

    const ogHTML = calcBtn.innerHTML;
    calcBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Calculating…`;
    calcBtn.disabled = true;

    try {
      const res = await api.measure(operation, dto);
      displayResult(res, operation);
    } catch (err) {
      setResult(err.message, 'error');
    } finally {
      calcBtn.innerHTML = ogHTML;
      calcBtn.disabled  = false;
    }
  }

  function displayResult(res, operation) {
    if (res.error) { setResult(res.errorMessage || 'An error occurred.', 'error'); return; }

    const fromUnit = UNITS[state.type]?.find(u => u.key === res.thisUnit)?.label || res.thisUnit || '';
    const toUnit   = UNITS[state.type]?.find(u => u.key === res.thatUnit)?.label || res.thatUnit || '';
    const resUnit  = UNITS[state.type]?.find(u => u.key === res.resultUnit)?.label || res.resultUnit || '';

    let text = '';

    if (operation === 'compare') {
      const eq = res.resultString === 'true';
      text = `${res.thisValue} ${fromUnit} ${eq ? '=' : '≠'} ${res.thatValue} ${toUnit} — ${eq ? 'Equal' : 'Not Equal'}`;
    } else if (operation === 'convert') {
      toValEl.value = res.resultValue;
      text = `${res.thisValue} ${fromUnit} = ${res.resultValue} ${resUnit}`;
    } else {
      const sym = { add: '+', subtract: '−', divide: '÷' }[operation] || operation;
      text = `${res.thisValue} ${fromUnit} ${sym} ${res.thatValue} ${toUnit} = ${res.resultValue} ${resUnit}`;
    }

    setResult(text, 'success');
  }

  function setResult(text, type = 'normal') {
    resultTxt.textContent = text;
    resultTxt.className = `result-text${type === 'error' ? ' error' : type === 'muted' ? ' muted' : ''}`;
    resultInd.className = `result-indicator${type === 'success' ? ' success' : type === 'error' ? ' error' : ''}`;
  }

  // ── Init ─────────────────────────────────────────────────────
  populateDropdowns('LengthUnit');
  updateUIForAction('compare');
  setResult('Select type and action, then click Calculate.', 'muted');
});
