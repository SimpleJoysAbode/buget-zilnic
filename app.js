'use strict';
/* Buget zilnic - client. Talks to the Apps Script web app that writes into the Google Sheet. */
(function () {
  // ---------- i18n ----------
  const T = {
    ro: {
      app: 'Buget zilnic', add: 'Adaugă', stats: 'Statistici', month: 'Luna', year: 'Anul',
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
      share_code: 'Copiază linkul de configurare', copied: 'Link copiat. Deschide-l în Safari pe celălalt telefon.', a2hs: 'Pentru ecranul principal: în Safari apasă Partajează, apoi Adaugă pe ecranul principal. Aplicația se conectează singură.', connecting: 'Se conectează…', disconnect: 'Deconectează telefonul', close: 'Închide',
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
      app: 'Daily budget', add: 'Add', stats: 'Insights', month: 'Month', year: 'Year',
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
      share_code: 'Copy setup link', copied: 'Link copied. Open it in Safari on the other phone.', a2hs: 'For the Home Screen: in Safari tap Share, then Add to Home Screen. The app connects itself.', connecting: 'Connecting…', disconnect: 'Disconnect this phone', close: 'Close',
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
    month: todayIso().slice(0, 7), yearSel: new Date().getFullYear(), cm: LS.get('cm', {}), idx: LS.get('idx', []), sv: LS.get('sv', 'day'),
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
    const timeout = (opts && opts.timeout) || 25000;
    const fin = data => { if (!data.ok) { const er = new Error(data.error || 'error'); er.server = true; throw er; } return data; };
    if (!LS.get('jsonp', false)) {
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), timeout);
      try {
        let res;
        if (method === 'GET') {
          const q = new URLSearchParams(Object.assign({ token: cfg.token }, params, { _: Date.now() })).toString();
          res = await fetch(cfg.url + (cfg.url.includes('?') ? '&' : '?') + q, { signal: ctl.signal });
        } else {
          res = await fetch(cfg.url, { method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ token: cfg.token }, params)) });
        }
        const txt = await res.text();
        let data; try { data = JSON.parse(txt); } catch (e) { const er = new Error('bad_response'); er.net = true; throw er; }
        return fin(data);
      } catch (e) {
        if (e.server) throw e;
        if (!(e && e.name === 'AbortError')) {
          // Some browsers/extensions/networks block cross-site fetch; fall back to a script tag, which they do not.
          try { const d = await jsonp(cfg, method, params, timeout); LS.set('jsonp', true); return fin(d); }
          catch (e2) { if (e2.server) throw e2; e2.net = true; e2.message = (e.message || 'fetch') + ' / ' + e2.message; throw e2; }
        }
        e.net = true; throw e;
      } finally { clearTimeout(to); }
    }
    try { return fin(await jsonp(cfg, method, params, timeout)); }
    catch (e) { if (!e.server) e.net = true; throw e; }
  }
  // Script-tag transport: everything travels as GET, the answer is a function call (works around blocked fetch).
  function jsonp(cfg, method, params, timeout) {
    return new Promise((resolve, reject) => {
      const name = '__bzcb' + Date.now() + Math.floor(Math.random() * 1e6);
      const q = { token: cfg.token, callback: name, _: Date.now() };
      if (method === 'GET') Object.assign(q, params);
      else { q.action = params.action; const p = Object.assign({}, params); delete p.action; q.payload = JSON.stringify(p); }
      const sc = document.createElement('script');
      const done = () => { clearTimeout(tm); delete window[name]; sc.remove(); };
      const tm = setTimeout(() => { done(); reject(new Error('timeout')); }, timeout);
      window[name] = d => { done(); resolve(d); };
      sc.onerror = () => { done(); reject(new Error('script_blocked')); };
      sc.src = cfg.url + (cfg.url.includes('?') ? '&' : '?') + new URLSearchParams(q).toString();
      document.head.appendChild(sc);
    });
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
    if (S.date === iso && S.tab === 'add') renderDay(); else if (S.tab === 'stats' && S.sv === 'day' && S.date === iso) renderStats(); renderHeader();
  }
  async function loadMonth(ym) {
    if (!S.cfg) return;
    S.loading.month = true; if (S.tab === 'stats') renderStats();
    try {
      const r = await api('GET', { action: 'month', month: ym, today: todayIso() });
      S.months[ym] = r.month; LS.set('months', S.months); S.monthStale = false;
    } catch (e) { if (e.net) { S.monthStale = true; S.sync = 'off'; } }
    S.loading.month = false; if (S.tab === 'stats') renderStats(); renderHeader();
  }
  // Statistics data: a list of month tabs plus compact per-month numbers, kept on the phone.
  // Only the current and previous month are refreshed each time; older months load once (in parallel) and are reused.
  function expandMonth(c, today) {
    const n = c.d.length, ym = c.month, tm = today.slice(0, 7);
    const elapsed = tm === ym ? Number(today.slice(8, 10)) : (tm < ym ? 0 : n);
    let inc = 0, exp = 0, spent = 0;
    c.d.forEach((x, i) => { inc += x[0]; exp += x[1]; if (i < elapsed) spent += x[1]; });
    let bal = null; for (let i = Math.min(Math.max(elapsed, 1), n) - 1; i >= 0 && bal == null; i--) bal = c.bal[i];
    const r2 = v => Math.round((v + Number.EPSILON) * 100) / 100;
    return { month: ym, daysInMonth: n, d: c.d, income: r2(inc), expense: r2(exp), pl: r2(inc - exp), elapsed, avg: elapsed ? r2(spent / elapsed) : 0, balance: bal, rate: c.rate };
  }
  function allData() {
    if (S.legacy && !(S.idx || []).length) return S.legacy;
    const today = todayIso(), months = [];
    (S.idx || []).forEach(ym => { const c = S.cm[ym]; if (c) months.push(expandMonth(c, today)); });
    let rate = null; months.forEach(m => { if (m.rate) rate = m.rate; });
    return { months, rate };
  }
  let allRun = 0;
  async function loadAll(force) {
    if (!S.cfg) return;
    if (!force && Date.now() - (S.allAt || 0) < 45000) return;      // don't hammer the sheet when switching tabs
    S.allAt = Date.now(); const run = ++allRun;
    S.loading.all = true; if (S.tab === 'stats' && !(S.idx || []).length) renderStats();
    let failed = false;
    try {
      const r = await api('GET', { action: 'index' });
      S.idx = r.index.months; LS.set('idx', S.idx);
      const now = Date.now(), tm = todayIso().slice(0, 7), pm = window.BZStats.prevMonth(tm);
      const need = S.idx.filter(ym => force || !S.cm[ym] || ym >= pm || now - (S.cm[ym].t || 0) > 12 * 3600 * 1000);
      // newest first, 3 months per request, all requests at once
      const chunks = []; need.slice().reverse().forEach((ym, i) => { if (i % 3 === 0) chunks.push([]); chunks[chunks.length - 1].push(ym); });
      await Promise.all(chunks.map(async ch => {
        try {
          const q = await api('GET', { action: 'stats', months: ch.join(',') });
          q.stats.months.forEach(c => { c.t = Date.now(); S.cm[c.month] = c; });
          LS.set('cm', S.cm); S.monthStale = false;
          if (S.tab === 'stats' && run === allRun) renderStats();
        } catch (e) { failed = true; if (e.net) { S.monthStale = true; S.sync = 'off'; } }
      }));
    } catch (e) {
      if (e.server && e.message === 'unknown_action') {   // older backend: use the slower all-in-one call
        try { const r = await api('GET', { action: 'all', today: todayIso() }); S.legacy = { months: r.all.months, rate: r.all.rate }; failed = false; }
        catch (e2) { failed = true; if (e2.net) { S.monthStale = true; S.sync = 'off'; } }
      } else { failed = true; if (e.net) { S.monthStale = true; S.sync = 'off'; } }
    }
    S.allError = failed && !allData().months.length;
    if (failed) S.allAt = 0;
    S.loading.all = false; if (S.tab === 'stats') renderStats(); renderHeader();
  }
  function refreshCurrent() {
    if (!S.cfg) return;
    if (S.tab === 'add') loadDay(S.date);
    else { loadAll(); if (S.sv === 'month') loadMonth(S.month); else if (S.sv === 'day') loadDay(S.date); }
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
    S.allAt = 0; setTimeout(() => loadAll(), 300);
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
    S.creating = false; S.blockedMonth = null; delete S.months[ym];
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
  // The setup code stays in the page address (after the #, which is never sent to any server). iPhones start a
  // Home Screen app with its own empty storage but from this very address, so it connects itself on first open.
  function keepInUrl() {
    if (!S.cfg) return;
    try { history.replaceState(null, '', location.pathname + location.search + '#s=' + encodeCode(S.cfg) + '&n=' + encodeURIComponent(S.cfg.who || '')); } catch (e) {}
    updateManifest();
  }
  // iPhone: no manifest at all, so Add to Home Screen keeps the exact current address. Others: a manifest whose start address is the current one.
  function updateManifest() {
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (ios || !window.Blob || !URL.createObjectURL) return;
    try {
      const abs = p => new URL(p, location.href).href;
      const man = { name: 'Buget zilnic', short_name: 'Buget', start_url: location.href, scope: abs('./'), display: 'standalone', background_color: '#FFFFFF', theme_color: '#FFFFFF',
        icons: [{ src: abs('icons/icon-192.png'), sizes: '192x192', type: 'image/png' }, { src: abs('icons/icon-512.png'), sizes: '512x512', type: 'image/png' }, { src: abs('icons/icon-512-maskable.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' }] };
      let l = document.querySelector('link[rel="manifest"]'); if (!l) { l = document.createElement('link'); l.rel = 'manifest'; document.head.appendChild(l); }
      l.href = URL.createObjectURL(new Blob([JSON.stringify(man)], { type: 'application/manifest+json' }));
    } catch (e) {}
  }
  function shareLink() { return location.origin + location.pathname + '#s=' + encodeCode(S.cfg); }
  async function connect(code, who) {
    const cfg = decodeCode(code);
    if (!cfg) { S.setupError = t('code_bad'); renderSetup(code, who); return; }
    if (!who.trim()) { S.setupError = t('name_req'); renderSetup(code, who); return; }
    const btn = document.getElementById('connectBtn'); if (btn) { btn.disabled = true; btn.textContent = '…'; }
    try {
      await api('GET', { action: 'ping' }, { cfg, timeout: 20000 });
      S.cfg = { url: cfg.url, token: cfg.token, who: who.trim().slice(0, 40) }; LS.set('cfg', S.cfg); S.setupError = '';
      keepInUrl();
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
        <div style="height:8px"></div><button class="btn secondary" id="shareBtn">${esc(t('share_code'))}</button><div class="help" style="margin-top:8px">${esc(t('a2hs'))}</div></div>
      <div class="row2"><button class="btn danger" id="discBtn">${esc(t('disconnect'))}</button><button class="btn primary" id="closeBtn">${esc(t('close'))}</button></div>
      <div class="help" style="margin-top:12px">${esc(t('ver'))} 1.0</div></div></div>`;
    root.querySelector('#scrim').addEventListener('click', e => { if (e.target.id === 'scrim') closeDialog(); });
    root.querySelector('#closeBtn').onclick = () => { const w = root.querySelector('#whoIn').value.trim(); if (w) { S.cfg.who = w.slice(0, 40); LS.set('cfg', S.cfg); keepInUrl(); } closeDialog(); render(); };
    root.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { S.lang = b.dataset.lang; LS.set('lang', S.lang); document.documentElement.lang = S.lang; closeDialog(); render(); openSettings(); });
    root.querySelector('#testBtn').onclick = async () => { const el = root.querySelector('#testRes'); el.textContent = '…'; try { await api('GET', { action: 'ping' }); el.textContent = '✓ ' + t('conn_ok'); } catch (e) { el.textContent = '✕ ' + t('conn_bad'); } };
    root.querySelector('#shareBtn').onclick = async () => { const link = shareLink(); try { await navigator.clipboard.writeText(link); toast(t('copied'), 'success'); } catch (e) { window.prompt(t('share_code'), link); } };
    root.querySelector('#discBtn').onclick = () => { if (S.queue.length && !confirm('Ai ' + S.queue.length + ' sume netrimise. Sigur deconectezi?')) return; LS.del('cfg'); LS.del('days'); LS.del('queue'); LS.del('months'); LS.del('years'); LS.del('cm'); LS.del('idx'); location.reload(); };
  }

  // ---------- rendering ----------
  const markSvg = `<svg class="mark" viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="26" width="10" height="14" fill="#FD5108"/><rect x="19" y="17" width="10" height="23" fill="#FD5108"/><rect x="33" y="7" width="10" height="33" fill="#FD5108"/><rect x="5" y="42" width="38" height="3" fill="#000"/></svg>`;

  function render() {
    const app = document.getElementById('app');
    if (!S.cfg) { renderSetup('', ''); return; }
    app.innerHTML = `<header class="hdr" id="hdr"></header><main id="main"></main>
      <nav class="nav" aria-label="Navigare">
        ${[['add', 'add-delete', t('add')], ['stats', 'bar-chart', t('stats')]].map(([k, i, l]) =>
          `<button data-tab="${k}" ${S.tab === k ? 'aria-current="page"' : ''}>${ico(i)}<span>${esc(l)}</span></button>`).join('')}
      </nav>`;
    app.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { S.tab = b.dataset.tab; render(); refreshCurrent(); window.scrollTo(0, 0); });
    renderHeader();
    if (S.tab === 'add') renderAdd(); else renderStats();
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
    h.querySelector('#syncBtn').onclick = () => { flushQueue(); if (S.tab === 'stats') loadAll(true); refreshCurrent(); };
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

  // ----- Statistics (day / month / year / total) -----
  const statsCtx = () => ({ lang: S.lang, esc, money, eur, ico, today: todayIso(), rate: allData().rate || null, fmtDay: fmtShort, fmtMonth, monthName, monthShort: ym => monthName(ym).slice(0, 3).replace('.', '') });
  function renderStats() {
    const main = document.getElementById('main'); if (!main) return;
    const X = statsCtx(), B = window.BZStats.build(X), T = B.T, P = window.BZStats.prep(allData());
    const views = [['day', T.day], ['month', T.month], ['year', T.year], ['total', T.total]];
    const seg = `<div class="seg" role="tablist" aria-label="Statistici">${views.map(([k, l]) => `<button role="tab" data-sv="${k}" aria-selected="${S.sv === k}">${esc(l)}</button>`).join('')}</div>`;
    let title = '', stepper = true;
    if (S.sv === 'day') title = S.date === todayIso() ? t('today') + ' · ' + fmtShort(S.date) : fmtShort(S.date);
    else if (S.sv === 'month') title = fmtMonth(S.month);
    else if (S.sv === 'year') title = String(S.yearSel);
    else { title = T.total; stepper = false; }
    const head = stepper ? `<div class="mhead"><button class="step" id="sPrev" aria-label="‹">${ico('arrow-left')}</button><div class="title">${esc(title)}</div><button class="step" id="sNext" aria-label="›">${ico('arrow-right')}</button></div>` : '';
    let body = '';
    const waiting = !allData().months.length;
    if (waiting) body = S.loading.all || !S.allError ? '<div class="skeleton" style="height:120px"></div><div class="skeleton"></div>' : `<div class="note-box err">${ico('alert')}<div>${esc(T.err)}<div style="margin-top:8px"><button class="btn secondary" id="retryBtn">${esc(T.retry)}</button></div></div></div>`;
    else if (S.sv === 'day') {
      const v = dayView(S.date);
      if (v.missing) body = missingBox();
      else body = B.day({ date: S.date, P, items: [...v.expense, ...v.income] }) + `<button class="btn secondary" id="openAdd" style="margin-top:16px">${esc(S.date === todayIso() ? t('add') + ' · ' + t('today').toLowerCase() : t('add') + ' · ' + fmtShort(S.date))}</button>`;
    } else if (S.sv === 'month') {
      const det = S.months[S.month];
      if (det && det.missing) body = missingBox(S.month, det.canCreate);
      else body = B.month({ ym: S.month, P, detail: det }) || `<div class="empty">${esc(T.no_data)}</div>`;
    } else if (S.sv === 'year') body = B.year({ year: S.yearSel, P });
    else body = B.total({ P });
    function missingBox(ym, can) { const mm = ym || S.date.slice(0, 7); return `<div class="note-box warn">${ico('alert')}<div>${esc(t('month_missing'))}<div style="margin-top:8px"><button class="btn secondary" id="mkBtn" data-ym="${mm}" ${S.creating ? 'disabled' : ''}>${esc(S.creating ? t('creating') : t('create_month'))}</button></div></div></div>`; }
    main.innerHTML = seg + head + (S.monthStale ? `<div class="note-box">${ico('wifi')}<div>${esc(t('stale_data'))}</div></div>` : '') + body;
    main.querySelectorAll('[data-sv]').forEach(b => b.onclick = () => { S.sv = b.dataset.sv; LS.set('sv', S.sv); renderStats(); refreshCurrent(); window.scrollTo(0, 0); });
    const step = d => () => {
      if (S.sv === 'day') { S.date = addDays(S.date, d); renderStats(); loadDay(S.date); }
      else if (S.sv === 'month') { S.month = addMonths(S.month, d); renderStats(); loadMonth(S.month); }
      else { S.yearSel += d; renderStats(); }
    };
    const pv = main.querySelector('#sPrev'); if (pv) { pv.onclick = step(-1); main.querySelector('#sNext').onclick = step(1); }
    const mk = main.querySelector('#mkBtn'); if (mk) mk.onclick = () => createMonth(mk.dataset.ym);
    const rt = main.querySelector('#retryBtn'); if (rt) rt.onclick = () => loadAll(true);
    const oa = main.querySelector('#openAdd'); if (oa) oa.onclick = () => { S.tab = 'add'; render(); loadDay(S.date); window.scrollTo(0, 0); };
    const go = (v, fn) => { S.sv = v; LS.set('sv', v); fn(); renderStats(); window.scrollTo(0, 0); };
    main.querySelectorAll('[data-date]').forEach(b => b.addEventListener('click', () => go('day', () => { S.date = b.dataset.date; loadDay(S.date); })));
    main.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => go('month', () => { S.month = b.dataset.m; loadMonth(S.month); })));
    main.querySelectorAll('[data-y]').forEach(b => b.addEventListener('click', () => go('year', () => { S.yearSel = Number(b.dataset.y); })));
  }
  // legacy hooks used by day view re-render after deletes
  function renderMonth() { if (S.tab === 'stats') renderStats(); }

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
    if (!S.cfg && window.__auto) {
      const a = window.__auto; window.__auto = null;
      document.getElementById('app').innerHTML = `<div class="setup">${markSvg}<h1>${esc(t('setup_title'))}</h1><p>${esc(t('connecting'))}</p></div>`;
      connect(a.code, a.who); return;
    }
    keepInUrl();
    render();
    if (S.cfg) { loadDay(S.date); flushQueue(); setTimeout(() => loadAll(), 400); }
  }
  // setup code can arrive in the URL (#s=BZ1.xxx) so one tap opens a ready-to-connect phone
  (function fromUrl() {
    const m = /[#&?]s=(BZ1\.[A-Za-z0-9_-]+)/.exec(location.hash + location.search);
    if (m && !S.cfg) {
      const cfg = decodeCode(m[1]);
      if (cfg) {
        window.__pendingCode = m[1];
        const n = /[#&]n=([^&]*)/.exec(location.hash);
        let who = ''; try { who = n ? decodeURIComponent(n[1]) : ''; } catch (e) {}
        window.__pendingWho = who;
        if (who.trim()) window.__auto = { code: m[1], who };
      }
    }
  })();
  const origRenderSetup = renderSetup;
  renderSetup = function (code, who) { origRenderSetup(code || window.__pendingCode || '', who || window.__pendingWho || ''); };
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  window.__bz = { S, press, evalExpr, decodeCode, encodeCode, money };   // test hook
  boot();
})();
