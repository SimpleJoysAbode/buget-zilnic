'use strict';
/* Buget zilnic - client. Talks to the Apps Script web app that writes into the Google Sheet. */
(function () {
  // ---------- i18n ----------
  const T = {
    ro: {
      app: 'Buget zilnic', add: 'Adaugă', month: 'Luna', year: 'Anul',
      expense: 'Cheltuială', income: 'Venit', today: 'Azi', yesterday: 'Ieri',
      notePh: 'Notă (opțional)', total: 'Total', save_expense: 'Adaugă cheltuială', save_income: 'Adaugă venitul',
      saved: 'Salvat în Google Sheets', queued: 'Salvat pe telefon, se trimite când ai internet',
      day_total_exp: 'Cheltuit', day_total_inc: 'Venit', nothing_day: 'Nimic adăugat în ziua aceasta.',
      pending: 'în așteptare', sync_ok: 'Sincronizat', sync_off: 'Offline', sync_busy: 'Se trimite…', sync_bad: 'Eroare',
      pending_n: n => `${n} în așteptare`,
      del: 'Șterge', del_confirm: 'Sigur?', deleted: 'Șters din Google Sheets',
      spent: 'Cheltuit', earned: 'Venit', result: 'Rezultat', avg: 'Medie pe zi', balance: 'Sold la final de zi', balance_now: 'Sold curent',
      per_day_hint: d => `în ${d} zile`, daily_chart: 'Cheltuieli pe zi', no_data_month: 'Nicio cheltuială în luna aceasta încă.',
      days: 'Zile', month_missing: 'Luna aceasta nu există încă în Google Sheets.',
      create_month: 'Creează luna din luna precedentă', creating: 'Se creează…', month_created: 'Luna a fost creată',
      year_total: 'Cheltuit în an', year_income: 'Venit în an', avg_month: 'Medie lunară', ytd: 'De la începutul anului',
      settings: 'Setări', language: 'Limba', your_name: 'Numele tău', name_help: 'Apare lângă fiecare sumă adăugată de tine.',
      connection: 'Conexiune', test: 'Testează conexiunea', conn_ok: 'Conectat la Google Sheets', conn_bad: 'Nu mă pot conecta',
      share_code: 'Copiază codul de configurare', copied: 'Cod copiat. Lipește-l pe celălalt telefon.', disconnect: 'Deconectează telefonul', close: 'Închide',
      setup_title: 'Buget zilnic', setup_p: 'Scrie cheltuielile direct în tabelul tău din Google Sheets.',
      code: 'Cod de configurare', code_ph: 'Lipește codul aici', connect: 'Conectează', paste: 'Lipește', code_bad: 'Codul nu pare corect.',
      name_req: 'Scrie-ți numele.', conn_fail: 'Nu am putut verifica conexiunea. Verifică internetul și codul.',
      err_unauthorized: 'Cod invalid sau expirat.', err_month_missing: 'Luna nu există în Google Sheets.', err_bad_amount: 'Suma nu este validă.',
      err_stale: 'Tabelul s-a schimbat între timp. Reîncarc.', err_complex_formula: 'Celula conține o formulă complexă, șterge-o direct în Google Sheets.',
      err_generic: 'Ceva n-a mers. Încearcă din nou.', offline_delete: 'Ai nevoie de internet pentru a șterge.',
      retry: 'Reîncearcă', stale_data: 'Date salvate pe telefon, fără internet.', ver: 'Versiune',
      invalid_expr: 'Verifică suma', today_label: 'Azi', eur: 'EUR'
    },
    en: {
      app: 'Daily budget', add: 'Add', month: 'Month', year: 'Year',
      expense: 'Expense', income: 'Income', today: 'Today', yesterday: 'Yesterday',
      notePh: 'Note (optional)', total: 'Total', save_expense: 'Add expense', save_income: 'Add income',
      saved: 'Saved to Google Sheets', queued: 'Saved on this phone, sending when you are online',
      day_total_exp: 'Spent', day_total_inc: 'Income', nothing_day: 'Nothing added for this day.',
      pending: 'pending', sync_ok: 'Synced', sync_off: 'Offline', sync_busy: 'Sending…', sync_bad: 'Error',
      pending_n: n => `${n} pending`,
      del: 'Delete', del_confirm: 'Sure?', deleted: 'Deleted from Google Sheets',
      spent: 'Spent', earned: 'Income', result: 'Net', avg: 'Average per day', balance: 'End-of-day balance', balance_now: 'Current balance',
      per_day_hint: d => `over ${d} days`, daily_chart: 'Spending per day', no_data_month: 'No spending this month yet.',
      days: 'Days', month_missing: 'This month does not exist in Google Sheets yet.',
      create_month: 'Create it from the previous month', creating: 'Creating…', month_created: 'Month created',
      year_total: 'Spent this year', year_income: 'Income this year', avg_month: 'Monthly average', ytd: 'Year to date',
      settings: 'Settings', language: 'Language', your_name: 'Your name', name_help: 'Shown next to every amount you add.',
      connection: 'Connection', test: 'Test connection', conn_ok: 'Connected to Google Sheets', conn_bad: 'Cannot connect',
      share_code: 'Copy setup code', copied: 'Code copied. Paste it on the other phone.', disconnect: 'Disconnect this phone', close: 'Close',
      setup_title: 'Daily budget', setup_p: 'Write expenses straight into your Google Sheets table.',
      code: 'Setup code', code_ph: 'Paste the code here', connect: 'Connect', paste: 'Paste', code_bad: 'That code does not look right.',
      name_req: 'Enter your name.', conn_fail: 'Could not verify the connection. Check internet and the code.',
      err_unauthorized: 'Invalid or expired code.', err_month_missing: 'That month does not exist in Google Sheets.', err_bad_amount: 'That amount is not valid.',
      err_stale: 'The sheet changed in the meantime. Reloading.', err_complex_formula: 'That cell holds a complex formula, delete it in Google Sheets.',
      err_generic: 'Something went wrong. Try again.', offline_delete: 'You need internet to delete.',
      retry: 'Retry', stale_data: 'Saved on this phone, no internet.', ver: 'Version',
      invalid_expr: 'Check the amount', today_label: 'Today', eur: 'EUR'
    }
  };

  // ---------- storage ----------
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('bz.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('bz.' + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem('bz.' + k); } catch (e) {} }
  };
  const S = {
    cfg: LS.get('cfg', null),                // {url, token, who}
    lang: LS.get('lang', (navigator.language || 'ro').toLowerCase().startsWith('en') ? 'en' : 'ro'),
    tab: 'add',
    kind: 'expense', expr: '', note: '',
    date: todayIso(),
    days: LS.get('days', {}),                // cache: date -> day
    queue: LS.get('queue', []),              // pending adds
    months: LS.get('months', {}), years: LS.get('years', {}),
    month: todayIso().slice(0, 7), yearSel: new Date().getFullYear(),
    sync: 'ok', busy: false, loading: {}, confirmDel: null, online: navigator.onLine !== false, monthStale: false, creating: false, setupError: '', exprError: false
  };
  const t = k => (T[S.lang][k] !== undefined ? T[S.lang][k] : T.ro[k]);

  // ---------- date + number helpers ----------
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function todayIso() { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(iso, n) { const [y, m, d] = iso.split('-').map(Number); const x = new Date(y, m - 1, d + n); return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()); }
  function addMonths(ym, n) { const [y, m] = ym.split('-').map(Number); const x = new Date(y, m - 1 + n, 1); return x.getFullYear() + '-' + pad(x.getMonth() + 1); }
  function dateObj(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d, 12); }
  const loc = () => (S.lang === 'en' ? 'en-GB' : 'ro-RO');
  function fmtLong(iso) { return cap(dateObj(iso).toLocaleDateString(loc(), { weekday: 'long', day: 'numeric', month: 'long' })); }
  function fmtShort(iso) { return dateObj(iso).toLocaleDateString(loc(), { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', ''); }
  function fmtMonth(ym) { const [y, m] = ym.split('-').map(Number); return cap(new Date(y, m - 1, 1).toLocaleDateString(loc(), { month: 'long', year: 'numeric' })); }
  function monthName(ym) { const [y, m] = ym.split('-').map(Number); return cap(new Date(y, m - 1, 1).toLocaleDateString(loc(), { month: 'long' })); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function money(n, cur) {
    const v = Number(n) || 0;
    // manual grouping: iOS locales differ in how they group 4-digit numbers
    const neg = v < 0 ? '-' : '';
    const [i, f] = Math.abs(v).toFixed(2).split('.');
    const dec = S.lang === 'en' ? '.' : ',', grp = S.lang === 'en' ? ',' : '.';
    return neg + i.replace(/\B(?=(\d{3})+(?!\d))/g, grp) + dec + f + (cur === false ? '' : ' ' + (cur || 'RON'));
  }
  const eur = (n, rate) => (rate ? money(n * rate, 'EUR') : '');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ico = (n, cls) => `<span class="ico ${cls || ''}" style="--i:url(icons/${n}.svg)" aria-hidden="true"></span>`;
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2));

  // ---------- expression keypad ----------
  function lastNumber(e) { const m = /[0-9.]*$/.exec(e); return m ? m[0] : ''; }
  function press(k) {
    let e = S.expr;
    S.exprError = false;
    if (k === 'back') e = e.slice(0, -1);
    else if (k === 'clear') e = '';
    else if (k === '+' || k === '-') {
      if (e === '') { if (k === '-') e = '-'; }
      else if (/[+-]$/.test(e)) { if (e.length > 1 || k === '-') e = e.slice(0, -1) + k; }
      else e += k;
    } else if (k === '.') {
      const n = lastNumber(e);
      if (n.includes('.')) return;
      e += n === '' ? '0.' : '.';
    } else if (k === '00') {
      const n = lastNumber(e);
      if (n === '' || n === '0') return;
      if (n.includes('.')) { if (n.split('.')[1].length === 0) e += '00'; else return; }
      else e += '00';
    } else {
      const n = lastNumber(e);
      if (n.includes('.') && n.split('.')[1].length >= 2) return;
      if (n === '0') e = e.slice(0, -1);
      if (n.replace('.', '').length >= 9) return;
      e += k;
    }
    S.expr = e.slice(0, 60);
    renderAmount();
  }
  function evalExpr(e) {
    const clean = e.replace(/[+-]+$/, '');
    if (!clean || clean === '-') return { value: 0, valid: false };
    if (!/^-?\d+(\.\d+)?([+-]\d+(\.\d+)?)*$/.test(clean)) return { value: 0, valid: false };
    const re = /([+-]?)(\d+(?:\.\d+)?)/g; let m, sum = 0;
    while ((m = re.exec(clean))) sum += (m[1] === '-' ? -1 : 1) * Number(m[2]);
    sum = Math.round((sum + Number.EPSILON) * 100) / 100;
    const terms = []; re.lastIndex = 0;
    while ((m = re.exec(clean))) { const tv = (m[1] === '-' ? -1 : 1) * Number(m[2]); if (tv !== 0) terms.push(tv); }
    return { value: sum, valid: sum !== 0 && terms.length > 0 && terms.length <= 30, terms };
  }
  const showExpr = e => esc(e.replace(/\./g, ',').replace(/-/g, '−').replace(/\+/g, ' + ').replace(/(.)−/g, '$1 − ').replace(/^ \+ /, ''));

  // ---------- network ----------
  async function api(method, params, opts) {
    const cfg = (opts && opts.cfg) || S.cfg;
    if (!cfg) throw new Error('no_config');
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), (opts && opts.timeout) || 25000);
    try {
      let res;
      if (method === 'GET') {
        const q = new URLSearchParams(Object.assign({ token: cfg.token }, params, { _: Date.now() })).toString();
        res = await fetch(cfg.url + (cfg.url.includes('?') ? '&' : '?') + q, { signal: ctl.signal });
      } else {
        res = await fetch(cfg.url, { method: 'POST', signal: ctl.signal, redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ token: cfg.token }, params)) });
      }
      const txt = await res.text();
      let data; try { data = JSON.parse(txt); } catch (e) { const er = new Error('bad_response'); er.net = true; throw er; }
      if (!data.ok) { const er = new Error(data.error || 'error'); er.server = true; throw er; }
      return data;
    } catch (e) {
      if (!e.server && !e.net) { e.net = true; }
      throw e;
    } finally { clearTimeout(to); }
  }
  function errText(e) {
    const m = String(e && e.message || '');
    if (m === 'unauthorized') return t('err_unauthorized');
    if (m.startsWith('month_missing')) return t('err_month_missing');
    if (m === 'bad_amount') return t('err_bad_amount');
    if (m === 'stale') return t('err_stale');
    if (m === 'complex_formula') return t('err_complex_formula');
    return t('err_generic');
  }

  // ---------- queue ----------
  const saveQueue = () => LS.set('queue', S.queue);
  async function flushQueue() {
    if (S.busy || !S.queue.length || !S.cfg) return;
    S.busy = true; S.sync = 'busy'; renderHeader();
    try {
      while (S.queue.length) {
        const op = S.queue[0];
        try {
          const r = await api('POST', { action: 'add', id: op.id, date: op.date, kind: op.kind, amount: op.amount, terms: op.terms, note: op.note, who: op.who });
          S.days[op.date] = r.day; LS.set('days', S.days);
          S.queue.shift(); saveQueue();
        } catch (e) {
          if (e.server) {
            if (String(e.message).startsWith('month_missing')) { S.sync = 'bad'; S.blockedMonth = op.date.slice(0, 7); break; }
            S.queue.shift(); saveQueue(); toast(errText(e), 'error');      // permanently invalid op: drop it, tell the user
          } else { S.sync = 'off'; break; }
        }
      }
      if (!S.queue.length) { S.sync = 'ok'; S.blockedMonth = null; }
    } finally { S.busy = false; render(); }
  }
  window.addEventListener('online', () => { S.online = true; flushQueue(); refreshCurrent(); });
  window.addEventListener('offline', () => { S.online = false; S.sync = 'off'; renderHeader(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { flushQueue(); refreshCurrent(); } });

  // ---------- data loading ----------
  async function loadDay(iso, silent) {
    if (!S.cfg) return;
    try {
      const r = await api('GET', { action: 'day', date: iso });
      S.days[iso] = r.day; LS.set('days', S.days);
      if (S.sync === 'off' && !S.queue.length) S.sync = 'ok';
    } catch (e) {
      if (e.server && String(e.message).startsWith('month_missing')) S.days[iso] = { missing: true, date: iso };
      else if (e.net) S.sync = 'off';
    }
    if (S.date === iso && S.tab === 'add') renderDay(); renderHeader();
  }
  async function loadMonth(ym) {
    if (!S.cfg) return;
    S.loading.month = true; if (S.tab === 'month') renderMonth();
    try {
      const r = await api('GET', { action: 'month', month: ym });
      S.months[ym] = r.month; LS.set('months', S.months); S.monthStale = false;
    } catch (e) { if (e.net) { S.monthStale = true; S.sync = 'off'; } }
    S.loading.month = false; if (S.tab === 'month' && S.month === ym) renderMonth(); renderHeader();
  }
  async function loadYear(y) {
    if (!S.cfg) return;
    S.loading.year = true; if (S.tab === 'year') renderYear();
    try {
      const r = await api('GET', { action: 'year', year: y });
      S.years[y] = r.year; LS.set('years', S.years); S.monthStale = false;
    } catch (e) { if (e.net) { S.monthStale = true; S.sync = 'off'; } }
    S.loading.year = false; if (S.tab === 'year' && S.yearSel === y) renderYear(); renderHeader();
  }
  function refreshCurrent() {
    if (!S.cfg) return;
    if (S.tab === 'add') loadDay(S.date); else if (S.tab === 'month') loadMonth(S.month); else loadYear(S.yearSel);
  }

  // ---------- actions ----------
  async function save() {
    const kind = S.kind, ev = evalExpr(S.expr);
    if (!ev.valid) { S.exprError = true; renderAmount(); toast(t('invalid_expr'), 'error'); return; }
    const op = { id: uid(), date: S.date, kind, amount: ev.value, terms: ev.terms, note: S.note.trim(), who: S.cfg.who, ts: Date.now() };
    S.queue.push(op); saveQueue();
    S.expr = ''; S.note = ''; S.exprError = false;
    render();
    toast(S.online ? t('saved') : t('queued'), 'success');
    await flushQueue();
    loadDay(op.date);
  }
  async function removeItem(kind, i, amount, logId) {
    if (!S.online) { toast(t('offline_delete'), 'error'); return; }
    try {
      const r = await api('POST', { action: 'remove', date: S.date, kind, index: i, amount, logId, who: S.cfg.who });
      S.days[S.date] = r.day; LS.set('days', S.days); toast(t('deleted'), 'success');
    } catch (e) { toast(errText(e), 'error'); await loadDay(S.date); }
    S.confirmDel = null; renderDay();
  }
  async function createMonth(ym) {
    S.creating = true; render();
    try { await api('POST', { action: 'createMonth', month: ym }); toast(t('month_created'), 'success'); delete S.days[S.date]; }
    catch (e) { toast(errText(e), 'error'); }
    S.creating = false; S.blockedMonth = null;
    await flushQueue(); refreshCurrent(); render();
  }

  // ---------- setup code ----------
  function encodeCode(cfg) { return 'BZ1.' + btoa(unescape(encodeURIComponent(JSON.stringify({ u: cfg.url, t: cfg.token })))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function decodeCode(code) {
    try {
      let c = String(code).trim(); const m = /BZ1\.[A-Za-z0-9_-]+/.exec(c); if (!m) return null; c = m[0].slice(4).replace(/-/g, '+').replace(/_/g, '/');
      while (c.length % 4) c += '=';
      const o = JSON.parse(decodeURIComponent(escape(atob(c))));
      if (!/^(https:\/\/|http:\/\/(127\.0\.0\.1|localhost))/.test(o.u) || !o.t) return null;
      return { url: o.u, token: o.t };
    } catch (e) { return null; }
  }
  async function connect(code, who) {
    const cfg = decodeCode(code);
    if (!cfg) { S.setupError = t('code_bad'); renderSetup(code, who); return; }
    if (!who.trim()) { S.setupError = t('name_req'); renderSetup(code, who); return; }
    const btn = document.getElementById('connectBtn'); if (btn) { btn.disabled = true; btn.textContent = '…'; }
    try {
      await api('GET', { action: 'ping' }, { cfg, timeout: 20000 });
      S.cfg = { url: cfg.url, token: cfg.token, who: who.trim().slice(0, 40) }; LS.set('cfg', S.cfg); S.setupError = '';
      history.replaceState(null, '', location.pathname);
      boot();
    } catch (e) { S.setupError = e.server ? errText(e) : t('conn_fail') + ' (' + String(e && e.message || e).slice(0, 80) + ')'; renderSetup(code, who); }
  }

  // ---------- toast / dialog ----------
  let toastTimer;
  function toast(msg, kind) {
    const el = document.getElementById('toast');
    el.innerHTML = ico(kind === 'error' ? 'alert' : 'correct', 's16') + '<span>' + esc(msg) + '</span>';
    el.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, kind === 'error' ? 4500 : 2600);
  }
  function closeDialog() { document.getElementById('dialogRoot').innerHTML = ''; }
  function openSettings() {
    const root = document.getElementById('dialogRoot');
    root.innerHTML = `<div class="scrim" id="scrim"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(t('settings'))}">
      <h2>${esc(t('settings'))}</h2>
      <div class="grp"><span class="field-label">${esc(t('language'))}</span><div class="langs"><button data-lang="ro" aria-pressed="${S.lang === 'ro'}">Română</button><button data-lang="en" aria-pressed="${S.lang === 'en'}">English</button></div></div>
      <div class="grp"><label class="field-label" for="whoIn">${esc(t('your_name'))}</label><input class="field" id="whoIn" value="${esc(S.cfg.who)}" maxlength="40" autocomplete="off"><div class="help">${esc(t('name_help'))}</div></div>
      <div class="grp"><span class="field-label">${esc(t('connection'))}</span>
        <button class="btn secondary" id="testBtn">${esc(t('test'))}</button><div class="help" id="testRes" role="status"></div>
        <div style="height:8px"></div><button class="btn secondary" id="shareBtn">${esc(t('share_code'))}</button></div>
      <div class="row2"><button class="btn danger" id="discBtn">${esc(t('disconnect'))}</button><button class="btn primary" id="closeBtn">${esc(t('close'))}</button></div>
      <div class="help" style="margin-top:12px">${esc(t('ver'))} 1.0</div></div></div>`;
    root.querySelector('#scrim').addEventListener('click', e => { if (e.target.id === 'scrim') closeDialog(); });
    root.querySelector('#closeBtn').onclick = () => { const w = root.querySelector('#whoIn').value.trim(); if (w) { S.cfg.who = w.slice(0, 40); LS.set('cfg', S.cfg); } closeDialog(); render(); };
    root.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { S.lang = b.dataset.lang; LS.set('lang', S.lang); document.documentElement.lang = S.lang; closeDialog(); render(); openSettings(); });
    root.querySelector('#testBtn').onclick = async () => { const el = root.querySelector('#testRes'); el.textContent = '…'; try { await api('GET', { action: 'ping' }); el.textContent = '✓ ' + t('conn_ok'); } catch (e) { el.textContent = '✕ ' + t('conn_bad'); } };
    root.querySelector('#shareBtn').onclick = async () => { const code = encodeCode(S.cfg); try { await navigator.clipboard.writeText(code); toast(t('copied'), 'success'); } catch (e) { window.prompt(t('share_code'), code); } };
    root.querySelector('#discBtn').onclick = () => { if (S.queue.length && !confirm('Ai ' + S.queue.length + ' sume netrimise. Sigur deconectezi?')) return; LS.del('cfg'); LS.del('days'); LS.del('queue'); LS.del('months'); LS.del('years'); location.reload(); };
  }

  // ---------- rendering ----------
  const markSvg = `<svg class="mark" viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="26" width="10" height="14" fill="#FD5108"/><rect x="19" y="17" width="10" height="23" fill="#FD5108"/><rect x="33" y="7" width="10" height="33" fill="#FD5108"/><rect x="5" y="42" width="38" height="3" fill="#000"/></svg>`;

  function render() {
    const app = document.getElementById('app');
    if (!S.cfg) { renderSetup('', ''); return; }
    app.innerHTML = `<header class="hdr" id="hdr"></header><main id="main"></main>
      <nav class="nav" aria-label="Navigare">
        ${[['add', 'add-delete', t('add')], ['month', 'calendar', t('month')], ['year', 'bar-chart', t('year')]].map(([k, i, l]) =>
          `<button data-tab="${k}" ${S.tab === k ? 'aria-current="page"' : ''}>${ico(i)}<span>${esc(l)}</span></button>`).join('')}
      </nav>`;
    app.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { S.tab = b.dataset.tab; render(); refreshCurrent(); window.scrollTo(0, 0); });
    renderHeader();
    if (S.tab === 'add') renderAdd(); else if (S.tab === 'month') renderMonth(); else renderYear();
  }

  function renderHeader() {
    const h = document.getElementById('hdr'); if (!h) return;
    const n = S.queue.length;
    let label, cls, icon;
    if (S.sync === 'busy') { label = t('sync_busy'); cls = 'busy'; icon = 'reset'; }
    else if (S.sync === 'bad') { label = n ? t('pending_n')(n) : t('sync_bad'); cls = 'bad'; icon = 'alert'; }
    else if (S.sync === 'off' || !S.online) { label = n ? t('pending_n')(n) : t('sync_off'); cls = 'off'; icon = 'wifi'; }
    else if (n) { label = t('pending_n')(n); cls = 'off'; icon = 'clock'; }
    else { label = t('sync_ok'); cls = ''; icon = 'correct'; }
    h.innerHTML = `${markSvg}<h1>${esc(t('app'))}</h1>
      <button class="sync ${cls}" id="syncBtn" aria-label="${esc(label)}">${ico(icon, 's16')}<span>${esc(label)}</span></button>
      <button class="btn-icon" id="setBtn" aria-label="${esc(t('settings'))}">${ico('settings')}</button>`;
    h.querySelector('#setBtn').onclick = openSettings;
    h.querySelector('#syncBtn').onclick = () => { flushQueue(); refreshCurrent(); };
  }

  // ----- Add view -----
  function renderAdd() {
    const main = document.getElementById('main'); if (!main) return;
    const isToday = S.date === todayIso(), isYest = S.date === addDays(todayIso(), -1);
    main.innerHTML = `
      <div class="seg" role="tablist">
        <button role="tab" data-kind="expense" aria-selected="${S.kind === 'expense'}">${esc(t('expense'))}</button>
        <button role="tab" data-kind="income" aria-selected="${S.kind === 'income'}">${esc(t('income'))}</button>
      </div>
      <div class="daterow">
        <button class="step" id="prevD" aria-label="‹">${ico('arrow-left')}</button>
        <div class="label"><span id="dateLbl">${esc(fmtLong(S.date))}</span>${ico('calendar', 's16')}<input type="date" id="dateIn" value="${S.date}" max="${addDays(todayIso(), 30)}" aria-label="${esc(t('month'))}"></div>
        <button class="step" id="nextD" aria-label="›">${ico('arrow-right')}</button>
      </div>
      <div class="chips"><button class="chip" data-quick="0" aria-pressed="${isToday}">${esc(t('today'))}</button><button class="chip" data-quick="-1" aria-pressed="${isYest}">${esc(t('yesterday'))}</button></div>
      <div class="amount" id="amount"></div>
      <input class="note" id="noteIn" placeholder="${esc(t('notePh'))}" value="${esc(S.note)}" maxlength="120" autocomplete="off" enterkeyhint="done">
      <div class="pad" id="pad">
        ${['7', '8', '9', 'back', '4', '5', '6', '+', '1', '2', '3', '-', '.', '0', '00', 'clear'].map(k => {
          const lab = { back: '⌫', '+': '+', '-': '−', '.': ',', clear: 'C' }[k] || k;
          const cls = k === '+' || k === '-' ? 'op' : (k === 'back' || k === 'clear' ? 'fn' : '');
          const al = { back: 'Backspace', clear: 'Clear', '+': 'plus', '-': 'minus', '.': 'comma' }[k] || k;
          return `<button class="${cls}" data-k="${k}" aria-label="${al}">${lab}</button>`; }).join('')}
      </div>
      <button class="btn primary" id="saveBtn"></button>
      <section class="daybox" id="daybox"></section>`;
    main.querySelectorAll('[role="tab"][data-kind]').forEach(b => b.onclick = () => { S.kind = b.dataset.kind; renderAdd(); });
    main.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => press(b.dataset.k)));
    main.querySelector('#saveBtn').onclick = save;
    main.querySelector('#noteIn').oninput = e => { S.note = e.target.value; };
    main.querySelector('#noteIn').onkeydown = e => { if (e.key === 'Enter') e.target.blur(); };
    const setDate = d => { S.date = d; S.confirmDel = null; renderAdd(); loadDay(d); };
    main.querySelector('#prevD').onclick = () => setDate(addDays(S.date, -1));
    main.querySelector('#nextD').onclick = () => setDate(addDays(S.date, 1));
    main.querySelector('#dateIn').onchange = e => { if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) setDate(e.target.value); };
    main.querySelectorAll('[data-quick]').forEach(b => b.onclick = () => setDate(addDays(todayIso(), Number(b.dataset.quick))));
    renderAmount(); renderDay();
  }

  function renderAmount() {
    const el = document.getElementById('amount'); if (!el) return;
    const ev = evalExpr(S.expr);
    const hasOp = /[+-]/.test(S.expr.replace(/^-/, ''));
    el.className = 'amount' + (S.exprError ? ' err' : '');
    el.innerHTML = `<div class="expr num">${S.expr ? showExpr(S.expr) + '<small>RON</small>' : '<span class="ph">0<small>RON</small></span>'}</div>
      <div class="total num">${hasOp && ev.valid ? esc(t('total')) + ': <b>' + esc(money(ev.value)) + '</b>' : (S.exprError ? esc(t('invalid_expr')) : '')}</div>`;
    const sb = document.getElementById('saveBtn');
    if (sb) {
      sb.disabled = !ev.valid;
      sb.innerHTML = ev.valid ? esc((S.kind === 'income' ? t('save_income') : t('save_expense'))) + ' · ' + esc(money(ev.value, false)) : esc(S.kind === 'income' ? t('save_income') : t('save_expense'));
    }
  }

  function dayView(iso) {
    // merge cached server day with pending queued adds for that date
    const base = S.days[iso];
    const view = { expense: [], income: [], missing: false, known: !!base };
    if (base && base.missing) view.missing = true;
    if (base && !base.missing) {
      ['expense', 'income'].forEach(k => base[k].items.forEach(it => view[k].push({ amount: it.amount, note: it.note, who: it.who, logId: it.id, i: it.i, pending: false, kind: k })));
    }
    S.queue.filter(q => q.date === iso).forEach(q => (q.terms || [q.amount]).forEach((a, ti) => view[q.kind].push({ amount: a, note: q.note, who: q.who, pending: true, kind: q.kind, qid: q.id + ti })));
    return view;
  }

  function renderDay() {
    const box = document.getElementById('daybox'); if (!box) return;
    const v = dayView(S.date);
    const sum = k => v[k].reduce((a, x) => a + x.amount, 0);
    if (v.missing) {
      box.innerHTML = `<div class="note-box warn">${ico('alert')}<div>${esc(t('month_missing'))}<div style="margin-top:8px"><button class="btn secondary" id="mkBtn" ${S.creating ? 'disabled' : ''}>${esc(S.creating ? t('creating') : t('create_month'))}</button></div></div></div>`;
      box.querySelector('#mkBtn').onclick = () => createMonth(S.date.slice(0, 7));
      return;
    }
    if (!v.known && !v.expense.length && !v.income.length) { box.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div>'; return; }
    const all = [...v.expense, ...v.income];
    const line = x => {
      const key = x.kind + ':' + (x.pending ? 'q' + x.qid : x.i);
      const confirm = S.confirmDel === key;
      const meta = [x.note, x.who].filter(Boolean).join(' · ');
      return `<li class="item ${x.kind}"><div class="main"><span class="amt num">${esc(money(x.amount))}</span>${x.pending ? `<span class="badge">${esc(t('pending'))}</span>` : ''}${meta ? `<div class="meta">${esc(meta)}</div>` : ''}</div>
        ${x.pending ? '' : `<button class="del ${confirm ? 'confirm' : ''}" data-del="${key}" data-kind="${x.kind}" data-i="${x.i}" data-amt="${x.amount}" data-log="${esc(x.logId || '')}" aria-label="${esc(t('del'))}">${ico('trash', confirm ? 's16' : '')}${confirm ? esc(t('del_confirm')) : ''}</button>`}</li>`;
    };
    box.innerHTML = `<div class="dayhead"><h2>${esc(S.date === todayIso() ? t('today') : fmtShort(S.date))}</h2>
      <div class="sum num">${esc(t('day_total_exp'))} ${esc(money(sum('expense')))}</div></div>
      ${sum('income') ? `<div class="help num" style="margin:-4px 0 8px;font-size:14px">${esc(t('day_total_inc'))} ${esc(money(sum('income')))}</div>` : ''}
      ${all.length ? `<ul class="list">${[...v.expense, ...v.income].map(line).join('')}</ul>` : `<div class="empty">${esc(t('nothing_day'))}</div>`}`;
    box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
      if (S.confirmDel === b.dataset.del) removeItem(b.dataset.kind, Number(b.dataset.i), Number(b.dataset.amt), b.dataset.log);
      else { S.confirmDel = b.dataset.del; renderDay(); setTimeout(() => { if (S.confirmDel === b.dataset.del) { S.confirmDel = null; renderDay(); } }, 4000); }
    });
  }

  // ----- Month view -----
  function renderMonth() {
    const main = document.getElementById('main'); if (!main) return;
    const m = S.months[S.month];
    const head = `<div class="mhead"><button class="step" id="pm" aria-label="‹">${ico('arrow-left')}</button><div class="title">${esc(fmtMonth(S.month))}</div><button class="step" id="nm" aria-label="›">${ico('arrow-right')}</button></div>`;
    let body = '';
    if (!m) body = S.loading.month ? '<div class="skeleton" style="height:120px"></div><div class="skeleton"></div>' : `<div class="empty">${esc(t('err_generic'))}</div>`;
    else if (m.missing) body = `<div class="note-box warn">${ico('alert')}<div>${esc(t('month_missing'))}${m.canCreate ? `<div style="margin-top:8px"><button class="btn secondary" id="mkBtn" ${S.creating ? 'disabled' : ''}>${esc(S.creating ? t('creating') : t('create_month'))}</button></div>` : ''}</div></div>`;
    else {
      const r = m.rate, today = todayIso();
      const maxE = Math.max(1, ...m.days.map(d => d.expense));
      const W = 336, H = 120, bw = W / m.days.length;
      const bars = m.days.map((d, i) => {
        const h = Math.max(d.expense ? 2 : 0, (d.expense / maxE) * (H - 14));
        const isT = d.date === today, isMax = d.expense === maxE && d.expense > 0;
        const fill = isT ? '#FD5108' : '#B5BCC4';
        return `<g class="bar" data-date="${d.date}"><rect x="${i * bw}" y="0" width="${bw}" height="${H}" fill="transparent"/><rect x="${i * bw + 1}" y="${H - h}" width="${Math.max(1, bw - 2)}" height="${h}" fill="${fill}" ${isMax && !isT ? 'opacity=".9"' : ''}/></g>`;
      }).join('');
      const labels = [1, Math.ceil(m.daysInMonth / 2), m.daysInMonth].map(n => `<text x="${(n - 1) * bw + bw / 2}" y="${H + 14}" font-size="10" fill="#7D7D7D" text-anchor="${n === 1 ? 'start' : n === m.daysInMonth ? 'end' : 'middle'}">${n}</text>`).join('');
      const list = m.days.filter(d => d.expense || d.income).slice().reverse();
      body = `
        <div class="hero"><div class="k">${esc(t('spent'))}</div><div class="v num">${esc(money(m.expense))}</div><div class="s num">${esc(eur(m.expense, r))}</div></div>
        <div class="kpis">
          <div class="kpi"><div class="k">${esc(t('earned'))}</div><div class="v num">${esc(money(m.income))}</div><div class="s num">${esc(eur(m.income, r))}</div></div>
          <div class="kpi"><div class="k">${esc(t('result'))}</div><div class="v num">${esc(money(m.pl))}</div><div class="s num">${esc(eur(m.pl, r))}</div></div>
          <div class="kpi"><div class="k">${esc(t('avg'))}</div><div class="v num">${esc(money(m.avg))}</div><div class="s num">${esc(m.elapsed ? t('per_day_hint')(m.elapsed) : '')}${r && m.elapsed ? ' · ' + esc(eur(m.avg, r)) : ''}</div></div>
          <div class="kpi"><div class="k">${esc(m.month === today.slice(0, 7) ? t('balance_now') : t('balance'))}</div><div class="v num">${m.balance == null ? '–' : esc(money(m.balance))}</div><div class="s num">${m.balance == null ? '' : esc(eur(m.balance, r))}</div></div>
        </div>
        <div class="chart"><div class="cap">${esc(t('daily_chart'))}</div><svg viewBox="0 0 ${W} ${H + 18}" role="img" aria-label="${esc(t('daily_chart'))}">${bars}<line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="#DFE3E6"/>${labels}</svg></div>
        <p class="eyebrow">${esc(t('days'))}</p>
        ${list.length ? `<div class="rows">${list.map(d => `<button class="row ${d.date === today ? 'today' : ''}" data-date="${d.date}"><span class="d"><b>${esc(fmtShort(d.date))}</b></span><span class="r num">${esc(money(d.expense))}${d.income ? `<small>+ ${esc(money(d.income))}</small>` : ''}</span></button>`).join('')}</div>` : `<div class="empty">${esc(t('no_data_month'))}</div>`}`;
    }
    main.innerHTML = head + (S.monthStale ? `<div class="note-box">${ico('wifi')}<div>${esc(t('stale_data'))}</div></div>` : '') + body;
    main.querySelector('#pm').onclick = () => { S.month = addMonths(S.month, -1); renderMonth(); loadMonth(S.month); };
    main.querySelector('#nm').onclick = () => { S.month = addMonths(S.month, 1); renderMonth(); loadMonth(S.month); };
    const mk = main.querySelector('#mkBtn'); if (mk) mk.onclick = () => createMonth(S.month);
    main.querySelectorAll('[data-date]').forEach(b => b.addEventListener('click', () => { S.date = b.dataset.date; S.tab = 'add'; render(); loadDay(S.date); window.scrollTo(0, 0); }));
  }

  // ----- Year view -----
  function renderYear() {
    const main = document.getElementById('main'); if (!main) return;
    const y = S.years[S.yearSel];
    const head = `<div class="mhead"><button class="step" id="py" aria-label="‹">${ico('arrow-left')}</button><div class="title">${S.yearSel}</div><button class="step" id="ny" aria-label="›">${ico('arrow-right')}</button></div>`;
    let body = '';
    if (!y) body = S.loading.year ? '<div class="skeleton" style="height:120px"></div><div class="skeleton"></div>' : `<div class="empty">${esc(t('err_generic'))}</div>`;
    else {
      const have = y.months.filter(m => !m.missing);
      const exp = have.reduce((a, m) => a + m.expense, 0), inc = have.reduce((a, m) => a + m.income, 0);
      const avgM = have.length ? exp / have.length : 0, r = y.rate;
      const maxE = Math.max(1, ...have.map(m => m.expense));
      body = `
        <div class="hero"><div class="k">${esc(t('year_total'))}</div><div class="v num">${esc(money(exp))}</div><div class="s num">${esc(eur(exp, r))}</div></div>
        <div class="kpis">
          <div class="kpi"><div class="k">${esc(t('year_income'))}</div><div class="v num">${esc(money(inc))}</div><div class="s num">${esc(eur(inc, r))}</div></div>
          <div class="kpi"><div class="k">${esc(t('avg_month'))}</div><div class="v num">${esc(money(avgM))}</div><div class="s num">${esc(eur(avgM, r))}</div></div>
        </div>
        <p class="eyebrow">${esc(t('year'))}</p>
        <div class="rows">${y.months.map(m => m.missing ? '' : `<button class="row mrow ${m.month === todayIso().slice(0, 7) ? 'today' : ''}" data-m="${m.month}"><span class="d"><b>${esc(monthName(m.month))}</b><span class="num">${esc(t('avg'))} ${esc(money(m.avg, false))}</span></span><span class="r num">${esc(money(m.expense))}${m.income ? `<small>+ ${esc(money(m.income))}</small>` : ''}</span><span class="bar" style="width:${(m.expense / maxE) * 100}%"></span></button>`).join('')}</div>`;
    }
    main.innerHTML = head + (S.monthStale ? `<div class="note-box">${ico('wifi')}<div>${esc(t('stale_data'))}</div></div>` : '') + body;
    main.querySelector('#py').onclick = () => { S.yearSel--; renderYear(); loadYear(S.yearSel); };
    main.querySelector('#ny').onclick = () => { S.yearSel++; renderYear(); loadYear(S.yearSel); };
    main.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { S.month = b.dataset.m; S.tab = 'month'; render(); loadMonth(S.month); window.scrollTo(0, 0); });
  }

  // ----- Setup -----
  function renderSetup(code, who) {
    const app = document.getElementById('app');
    app.innerHTML = `<div class="setup">${markSvg.replace('class="mark"', 'class="mark"')}
      <h1>${esc(t('setup_title'))}</h1><p>${esc(t('setup_p'))}</p>
      <div class="card">
        <div><label class="field-label" for="codeIn">${esc(t('code'))}</label><input class="field" id="codeIn" placeholder="${esc(t('code_ph'))}" value="${esc(code)}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
        <div style="margin-top:8px"><button class="btn secondary" id="pasteBtn" type="button">${esc(t('paste'))}</button></div></div>
        <div><label class="field-label" for="whoIn">${esc(t('your_name'))}</label><input class="field" id="whoIn" value="${esc(who)}" maxlength="40" autocomplete="given-name"></div>
        ${S.setupError ? `<div class="error" role="alert">${esc(S.setupError)}</div>` : ''}
        <button class="btn primary" id="connectBtn">${esc(t('connect'))}</button>
        <div class="langs"><button data-lang="ro" aria-pressed="${S.lang === 'ro'}">Română</button><button data-lang="en" aria-pressed="${S.lang === 'en'}">English</button></div>
      </div></div>`;
    const val = () => [document.getElementById('codeIn').value, document.getElementById('whoIn').value];
    app.querySelector('#connectBtn').onclick = () => { S.setupError = ''; connect(...val()); };
    app.querySelector('#pasteBtn').onclick = async () => { try { document.getElementById('codeIn').value = await navigator.clipboard.readText(); } catch (e) { document.getElementById('codeIn').focus(); } };
    app.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { const [c, w] = val(); S.lang = b.dataset.lang; LS.set('lang', S.lang); S.setupError = ''; renderSetup(c, w); });
  }

  // ---------- boot ----------
  function boot() {
    document.documentElement.lang = S.lang;
    render();
    if (S.cfg) { flushQueue().then(() => loadDay(S.date)); loadDay(S.date); }
  }
  // setup code can arrive in the URL (#s=BZ1.xxx) so one tap opens a ready-to-connect phone
  (function fromUrl() {
    const m = /[#&?]s=(BZ1\.[A-Za-z0-9_-]+)/.exec(location.hash + location.search);
    if (m && !S.cfg) { const cfg = decodeCode(m[1]); if (cfg) { window.__pendingCode = m[1]; } }
  })();
  const origRenderSetup = renderSetup;
  renderSetup = function (code, who) { origRenderSetup(code || window.__pendingCode || '', who); };
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  window.__bz = { S, press, evalExpr, decodeCode, encodeCode, money };   // test hook
  boot();
})();
