/* Statistics views (Day / Month / Year / Total). Pure functions: data in, HTML string out. */
(function () {
  const L = {
    ro: {
      day: 'Zi', month: 'Lună', year: 'An', total: 'Total',
      spent: 'Cheltuit', earned: 'Venit', net: 'Rezultat', saved: 'Rată de economisire', balance: 'Sold', balance_now: 'Sold curent',
      avg_day: 'Medie pe zi', avg_month: 'Medie lunară', avg_month_income: 'Venit mediu lunar', proj: 'Estimare la final de lună', proj_s: 'dacă ritmul rămâne la fel',
      vs_prev_month: 'față de luna trecută', vs_prev_year: 'față de anul trecut', vs_avg: 'față de media zilei', vs_same_day: 'față de aceeași zi luna trecută',
      more: 'mai mult', less: 'mai puțin', same: 'la fel', no_prev: 'fără termen de comparație',
      no_spend_days: 'Zile fără cheltuieli', over_avg_days: 'Zile peste medie', highest_day: 'Cea mai scumpă zi', lowest_day: 'Cea mai ieftină zi',
      best_month: 'Luna cea mai economă', worst_month: 'Luna cea mai scumpă', top_saving: 'Cea mai bună economie', longest_streak: 'Cea mai lungă serie fără cheltuieli',
      months_tracked: 'Luni urmărite', days_tracked: 'Zile urmărite', streak_unit: n => n + (n === 1 ? ' zi' : ' zile'),
      daily_chart: 'Cheltuieli pe zi', cum_chart: 'Cheltuieli cumulate în lună', weekday_chart: 'Media pe zilele săptămânii', months_chart: 'Venit și cheltuieli pe luni', balance_chart: 'Soldul la sfârșit de lună', last14: 'Ultimele 14 zile',
      this_month: 'Luna aceasta', prev_month: 'Luna trecută', income_l: 'Venit', spent_l: 'Cheltuit',
      top_days: 'Cele mai scumpe zile', top_items: 'Cele mai mari cheltuieli', items_day: 'Cheltuielile zilei', months_list: 'Pe luni', years_list: 'Pe ani', days_list: 'Zilele lunii',
      rank_t: 'Locul zilei în lună', rank_of: (r, n) => r + ' din ' + n, rank_s: 'zile, după cheltuieli (1 = cea mai scumpă)', share_month: 'Din cheltuielile lunii', mtd: 'De la începutul lunii',
      items_count: n => n + (n === 1 ? ' cheltuială' : ' cheltuieli'), nothing_day: 'Nimic adăugat în ziua aceasta.', no_data: 'Nu sunt date pentru această perioadă.',
      per_day_hint: n => 'în ' + n + (n === 1 ? ' zi' : ' zile'), loading: 'Se încarcă…', err: 'Nu am putut încărca datele.', retry: 'Reîncearcă',
      wd: ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'], month_missing: 'Luna aceasta nu există încă în Google Sheets.', create_month: 'Creează luna din luna precedentă', creating: 'Se creează…',
      months_total: 'Total luni', mo: 'luni', best: 'cel mai bun', worst: 'cel mai greu', open: 'Deschide', in_eur: 'în EUR', daily_avg_all: 'Medie zilnică (toată perioada)', yearly: 'An', rows_hint: 'Atinge o zi ca să o deschizi',
      projected: 'estimat', avg_label: 'medie',
    },
    en: {
      day: 'Day', month: 'Month', year: 'Year', total: 'Total',
      spent: 'Spent', earned: 'Income', net: 'Result', saved: 'Savings rate', balance: 'Balance', balance_now: 'Current balance',
      avg_day: 'Average per day', avg_month: 'Monthly average', avg_month_income: 'Average monthly income', proj: 'Estimate for month end', proj_s: 'if the pace stays the same',
      vs_prev_month: 'vs last month', vs_prev_year: 'vs last year', vs_avg: 'vs the day average', vs_same_day: 'vs the same day last month',
      more: 'more', less: 'less', same: 'the same', no_prev: 'nothing to compare with',
      no_spend_days: 'No-spend days', over_avg_days: 'Days above average', highest_day: 'Most expensive day', lowest_day: 'Cheapest day',
      best_month: 'Most frugal month', worst_month: 'Most expensive month', top_saving: 'Best saving', longest_streak: 'Longest no-spend streak',
      months_tracked: 'Months tracked', days_tracked: 'Days tracked', streak_unit: n => n + (n === 1 ? ' day' : ' days'),
      daily_chart: 'Spending per day', cum_chart: 'Cumulative spending in the month', weekday_chart: 'Average by weekday', months_chart: 'Income and spending by month', balance_chart: 'Balance at month end', last14: 'Last 14 days',
      this_month: 'This month', prev_month: 'Last month', income_l: 'Income', spent_l: 'Spent',
      top_days: 'Most expensive days', top_items: 'Biggest expenses', items_day: 'Entries of the day', months_list: 'By month', years_list: 'By year', days_list: 'Days of the month',
      rank_t: 'Rank of the day', rank_of: (r, n) => r + ' of ' + n, rank_s: 'days, by spending (1 = most expensive)', share_month: 'Of the month spending', mtd: 'Since the start of the month',
      items_count: n => n + (n === 1 ? ' entry' : ' entries'), nothing_day: 'Nothing added for this day.', no_data: 'No data for this period.',
      per_day_hint: n => 'in ' + n + (n === 1 ? ' day' : ' days'), loading: 'Loading…', err: 'Could not load the data.', retry: 'Try again',
      wd: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], month_missing: 'This month does not exist in Google Sheets yet.', create_month: 'Create the month from the previous one', creating: 'Creating…',
      months_total: 'Months total', mo: 'months', best: 'best', worst: 'toughest', open: 'Open', in_eur: 'in EUR', daily_avg_all: 'Daily average (whole period)', yearly: 'Year', rows_hint: 'Tap a day to open it',
      projected: 'estimated', avg_label: 'average',
    },
  };

  const C = { acc: '#FD5108', accSoft: '#FFAA72', grey: '#B5BCC4', greyD: '#7D7D7D', ink: '#000', line: '#DFE3E6', ok: '#059669', err: '#DC2626', bg: '#F5F7F8' };
  const sum = a => a.reduce((x, y) => x + y, 0);
  const r2 = n => Math.round((n + Number.EPSILON) * 100) / 100;
  const pad = n => String(n).padStart(2, '0');
  const wdIdx = iso => { const [y, m, d] = iso.split('-').map(Number); return (new Date(y, m - 1, d, 12).getDay() + 6) % 7; };   // Monday = 0
  const dim = ym => { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).getDate(); };
  const prevMonth = ym => { const [y, m] = ym.split('-').map(Number); const x = new Date(y, m - 2, 1); return x.getFullYear() + '-' + pad(x.getMonth() + 1); };

  /* ---------- data prep ---------- */
  function prep(all) {
    const months = (all && all.months || []).map(m => {
      const days = [];
      const n = m.elapsed;
      for (let i = 0; i < n; i++) days.push({ date: m.month + '-' + pad(i + 1), inc: m.d[i][0], exp: m.d[i][1] });
      return Object.assign({}, m, { days, tracked: n > 0 && (m.income !== 0 || m.expense !== 0) });
    });
    const byMonth = {}; months.forEach(m => { byMonth[m.month] = m; });
    return { months, byMonth, rate: all && all.rate };
  }
  function weekdayAvg(days) {
    const s = [0, 0, 0, 0, 0, 0, 0], c = [0, 0, 0, 0, 0, 0, 0];
    days.forEach(d => { const w = wdIdx(d.date); s[w] += d.exp; c[w]++; });
    return s.map((v, i) => (c[i] ? v / c[i] : 0));
  }
  function streak(days) {
    let best = 0, cur = 0;
    days.forEach(d => { if (d.exp === 0) { cur++; best = Math.max(best, cur); } else cur = 0; });
    return best;
  }

  /* ---------- svg charts ---------- */
  function niceMax(v) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; }
  const compact = v => (Math.abs(v) >= 1000 ? (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1).replace('.0', '') + 'k' : String(Math.round(v)));

  function barChart(o) {            // o: values[], labels[{i,text}], hl (index), avg, dataAttr[], W,H
    const W = 336, H = o.H || 120, n = o.values.length, bw = W / n, max = niceMax(Math.max(...o.values, o.avg || 0));
    const bars = o.values.map((v, i) => {
      const h = v > 0 ? Math.max(2, (v / max) * (H - 8)) : 0;
      const fill = i === o.hl ? C.acc : (o.dim && o.dim(i) ? '#DDE1E5' : C.grey);
      const attr = o.attr ? o.attr(i) : '';
      return `<g class="${attr ? 'bar' : ''}" ${attr}><rect x="${i * bw}" y="0" width="${bw}" height="${H}" fill="transparent"/><rect x="${i * bw + Math.min(1, bw * .12)}" y="${H - h}" width="${Math.max(1, bw - Math.min(2, bw * .24))}" height="${h}" fill="${fill}"/></g>`;
    }).join('');
    const avg = o.avg ? `<line x1="0" x2="${W}" y1="${H - (o.avg / max) * (H - 8)}" y2="${H - (o.avg / max) * (H - 8)}" stroke="${C.ink}" stroke-width="1" stroke-dasharray="4 3"/>` : '';
    const grid = `<line x1="0" x2="${W}" y1="${H - (H - 8) / 2}" y2="${H - (H - 8) / 2}" stroke="${C.line}"/><text x="0" y="${H - (H - 8) / 2 - 3}" font-size="9" fill="${C.greyD}">${compact(max / 2)}</text><text x="0" y="9" font-size="9" fill="${C.greyD}">${compact(max)}</text>`;
    const labels = (o.labels || []).map(l => `<text x="${l.i * bw + bw / 2}" y="${H + 14}" font-size="10" fill="${C.greyD}" text-anchor="${l.i === 0 ? 'start' : l.i === n - 1 ? 'end' : 'middle'}">${l.text}</text>`).join('');
    return `<svg viewBox="0 0 ${W} ${H + 18}" role="img" aria-label="${o.aria || ''}">${grid}${bars}${avg}<line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="${C.line}"/>${labels}</svg>`;
  }

  function groupedBars(o) {         // months: [{label, a, b}] a=income (green), b=expense (orange)
    const W = 336, H = 130, n = o.items.length, gw = W / n, max = niceMax(Math.max(...o.items.map(x => Math.max(x.a, x.b)), 1));
    const bars = o.items.map((x, i) => {
      const ha = x.a > 0 ? Math.max(2, (x.a / max) * (H - 8)) : 0, hb = x.b > 0 ? Math.max(2, (x.b / max) * (H - 8)) : 0;
      const bw = Math.max(2, Math.min(14, gw / 2 - 1.5));
      const cx = i * gw + gw / 2;
      return `<g class="${x.attr ? 'bar' : ''}" ${x.attr || ''}><rect x="${i * gw}" y="0" width="${gw}" height="${H}" fill="transparent"/><rect x="${cx - bw - .5}" y="${H - ha}" width="${bw}" height="${ha}" fill="${C.ok}"/><rect x="${cx + .5}" y="${H - hb}" width="${bw}" height="${hb}" fill="${C.acc}"/></g>`;
    }).join('');
    const step = n > 12 ? Math.ceil(n / 8) : 1;
    const labels = o.items.map((x, i) => (i % step === 0 || i === n - 1) ? `<text x="${i * gw + gw / 2}" y="${H + 14}" font-size="10" fill="${C.greyD}" text-anchor="middle">${x.label}</text>` : '').join('');
    const grid = `<line x1="0" x2="${W}" y1="${H - (H - 8) / 2}" y2="${H - (H - 8) / 2}" stroke="${C.line}"/><text x="0" y="${H - (H - 8) / 2 - 3}" font-size="9" fill="${C.greyD}">${compact(max / 2)}</text><text x="0" y="9" font-size="9" fill="${C.greyD}">${compact(max)}</text>`;
    return `<svg viewBox="0 0 ${W} ${H + 18}" role="img" aria-label="${o.aria || ''}">${grid}${bars}<line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="${C.line}"/>${labels}</svg>`;
  }

  function lineChart(o) {           // series: [{pts:[v..], color, dash, width}], xLabels:[{i,text}]
    const W = 336, H = 120, n = Math.max(o.n || 0, ...o.series.map(s => s.pts.length), 2);
    const all = [].concat(...o.series.map(s => s.pts));
    let mn = o.zero ? 0 : Math.min(...all), mx = Math.max(...all, o.zero ? 1 : mn + 1);
    if (mn === mx) mx = mn + 1;
    const pad2 = (mx - mn) * .08; if (!o.zero) { mn -= pad2; } mx += pad2;
    const X = i => 4 + (i / (n - 1)) * (W - 8), Y = v => H - ((v - mn) / (mx - mn)) * (H - 10) - 2;
    const paths = o.series.map(s => {
      if (!s.pts.length) return '';
      const d = s.pts.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
      const last = s.pts.length - 1;
      return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2}" ${s.dash ? 'stroke-dasharray="4 3"' : ''} stroke-linejoin="round" stroke-linecap="round"/>` + (s.dot ? `<circle cx="${X(last).toFixed(1)}" cy="${Y(s.pts[last]).toFixed(1)}" r="3.5" fill="${s.color}"/>` : '');
    }).join('');
    const labels = (o.xLabels || []).map(l => `<text x="${X(l.i)}" y="${H + 14}" font-size="10" fill="${C.greyD}" text-anchor="${l.i === 0 ? 'start' : l.i >= n - 1 ? 'end' : 'middle'}">${l.text}</text>`).join('');
    const grid = `<line x1="0" x2="${W}" y1="${H - (H - 10) / 2 - 2}" y2="${H - (H - 10) / 2 - 2}" stroke="${C.line}"/><text x="0" y="9" font-size="9" fill="${C.greyD}">${compact(mx)}</text><text x="0" y="${H - 4}" font-size="9" fill="${C.greyD}">${compact(mn)}</text>`;
    return `<svg viewBox="0 0 ${W} ${H + 18}" role="img" aria-label="${o.aria || ''}">${grid}${paths}<line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="${C.line}"/>${labels}</svg>`;
  }

  /* ---------- html builders ---------- */
  function build(X) {
    const { lang, esc, money, eur, ico, today, rate } = X;
    const T = L[lang] || L.ro;
    const mny = (v, cur) => esc(money(v, cur));
    const sub = v => (rate ? `<div class="s num">${esc(eur(v, rate))}</div>` : '');
    const hero = (k, v, extra) => `<div class="hero"><div class="k">${esc(k)}</div><div class="v num">${mny(v)}</div>${rate ? `<div class="s num">${esc(eur(v, rate))}</div>` : ''}${extra || ''}</div>`;
    const kpi = (k, v, s, cls) => `<div class="kpi"><div class="k">${esc(k)}</div><div class="v num ${cls || ''}">${v}</div>${s ? `<div class="s num">${s}</div>` : ''}</div>`;
    const kpis = a => `<div class="kpis">${a.join('')}</div>`;
    const chart = (cap, svg, legend) => `<div class="chart"><div class="cap">${esc(cap)}</div>${svg}${legend ? `<div class="legend">${legend}</div>` : ''}</div>`;
    const sw = (c, label) => `<span><i style="background:${c}"></i>${esc(label)}</span>`;
    const delta = (cur, prev, goodWhenDown) => {
      if (prev == null || prev === 0) return `<span class="dl">${esc(T.no_prev)}</span>`;
      const p = ((cur - prev) / Math.abs(prev)) * 100;
      if (Math.abs(p) < 0.5) return `<span class="dl">${esc(T.same)}</span>`;
      const up = p > 0, good = goodWhenDown ? !up : up;
      return `<span class="dl ${good ? 'good' : 'bad'}">${ico('arrow-right', 's16 rot' + (up ? 'u' : 'd'))}${up ? '+' : '−'}${Math.abs(p).toFixed(0)}% ${esc(up ? T.more : T.less)}</span>`;
    };
    const pct = v => (isFinite(v) ? v.toFixed(0) + '%' : '–');
    const rows = (items) => `<div class="rows">${items.join('')}</div>`;
    const rowBtn = (attr, left, sub2, right, rsub) => `<button class="row" ${attr}><span class="d"><b>${left}</b>${sub2 ? `<span class="num">${sub2}</span>` : ''}</span><span class="r num">${right}${rsub ? `<small class="${rsub.neg ? 'neg' : ''}">${rsub.t}</small>` : ''}</span></button>`;

    /* ----- DAY ----- */
    function day(d) {        // d: {date, data (prep), items:[{amount,note,who}], missing}
      const P = d.P, ym = d.date.slice(0, 7), m = P.byMonth[ym];
      const idx = Number(d.date.slice(8, 10)) - 1;
      const cell = m && m.d[idx] ? m.d[idx] : null;
      const exp = cell ? cell[1] : sum((d.items || []).filter(i => i.kind === 'expense').map(i => i.amount));
      const inc = cell ? cell[0] : 0;
      let html = hero(T.spent, exp, `<div class="s">${esc(T.items_count((d.items || []).filter(i => i.kind !== 'income').length))}${inc ? ' · ' + esc(T.earned) + ' ' + esc(money(inc)) : ''}</div>`);
      const cards = [];
      if (m && m.elapsed > 0) {
        const avgOthers = m.avg;
        cards.push(kpi(T.avg_day, mny(avgOthers), delta(exp, avgOthers, true) + ' <span class="dl">' + esc(T.vs_avg) + '</span>'));
        const dayExp = m.days.map(x => x.exp);
        const sorted = dayExp.slice().sort((a, b) => b - a);
        const inRange = idx < m.elapsed;
        if (inRange && exp > 0) cards.push(kpi(T.rank_t, esc(T.rank_of(sorted.indexOf(exp) + 1, m.elapsed)), esc(T.rank_s)));
        if (inRange && m.expense > 0) cards.push(kpi(T.share_month, pct((exp / sum(dayExp)) * 100), `${esc(money(sum(dayExp)))}`));
        if (inRange) {
          const mtd = sum(dayExp.slice(0, idx + 1)), pm = P.byMonth[prevMonth(ym)];
          const pmtd = pm ? sum(pm.d.slice(0, Math.min(idx + 1, pm.d.length)).map(x => x[1])) : null;
          cards.push(kpi(T.mtd, mny(mtd), pmtd != null ? delta(mtd, pmtd, true) + ' <span class="dl">' + esc(T.vs_same_day) + '</span>' : ''));
        }
      }
      html += kpis(cards);
      // last 14 days chart
      const flat = [];
      P.months.forEach(mm => mm.days.forEach(x => flat.push(x)));
      const pos = flat.findIndex(x => x.date === d.date);
      if (flat.length && pos >= 0) {
        const from = Math.max(0, pos - 13), seg = flat.slice(from, pos + 1);
        const vals = seg.map(x => x.exp);
        html += chart(T.last14, barChart({ values: vals, hl: vals.length - 1, avg: m && m.avg, labels: [{ i: 0, text: esc(X.fmtDay(seg[0].date)) }, { i: vals.length - 1, text: esc(X.fmtDay(seg[seg.length - 1].date)) }], attr: i => `data-date="${seg[i].date}"`, aria: T.last14 }));
      }
      const items = (d.items || []).slice().sort((a, b) => b.amount - a.amount);
      html += `<p class="eyebrow">${esc(T.items_day)}</p>` + (items.length ? rows(items.map(i => `<div class="row"><span class="d"><b class="num">${mny(i.amount)}</b>${i.note || i.who ? `<span>${esc([i.note, i.who].filter(Boolean).join(' · '))}</span>` : ''}</span><span class="r"><small class="${i.kind === 'income' ? '' : 'neg'}">${esc(i.kind === 'income' ? T.earned : T.spent)}</small></span></div>`)) : `<div class="empty">${esc(T.nothing_day)}</div>`);
      return html;
    }

    /* ----- MONTH ----- */
    function month(d) {      // d: {ym, P, detail (month endpoint w/ terms), sel}
      const P = d.P, ym = d.ym, m = P.byMonth[ym], det = d.detail;
      if (!m && !(det && !det.missing)) return null;
      const src = m || null;
      const exp = det && !det.missing ? det.expense : src.expense, inc = det && !det.missing ? det.income : src.income;
      const elapsed = (det && !det.missing ? det.elapsed : src.elapsed), n = dim(ym);
      const days = (det && !det.missing ? det.days.map(x => ({ date: x.date, inc: x.income, exp: x.expense, terms: x.terms })) : src.d.map((x, i) => ({ date: ym + '-' + pad(i + 1), inc: x[0], exp: x[1] })));
      const act = days.slice(0, elapsed);
      const spentToDate = sum(act.map(x => x.exp));
      const avg = elapsed ? spentToDate / elapsed : 0;
      const pm = P.byMonth[prevMonth(ym)];
      const isCurrent = today.slice(0, 7) === ym;
      const proj = isCurrent && elapsed > 0 ? avg * n : null;
      const res = inc - exp;
      let html = hero(T.spent, exp, `<div class="s">${esc(T.earned)} ${esc(money(inc))} · ${esc(T.net)} ${esc(money(res))}</div>`);
      const cards = [];
      cards.push(kpi(T.net, mny(res), (inc > 0 ? esc(T.saved) + ' ' + pct((res / inc) * 100) : '') ));
      cards.push(kpi(T.avg_day, mny(avg), esc(T.per_day_hint(elapsed || 0)) + (pm ? ' · ' + delta(avg, pm.avg, true) : '')));
      if (proj != null) cards.push(kpi(T.proj, mny(proj), esc(T.proj_s) + (pm ? ' · ' + delta(proj, pm.expense, true) : '')));
      else cards.push(kpi(T.vs_prev_month, pm ? delta(exp, pm.expense, true) : esc(T.no_prev), pm ? esc(money(pm.expense)) : ''));
      const noSpend = act.filter(x => x.exp === 0).length, over = act.filter(x => x.exp > avg && avg > 0).length;
      cards.push(kpi(T.no_spend_days, String(noSpend), esc(T.over_avg_days) + ': ' + over));
      const spendDays = act.filter(x => x.exp > 0);
      if (spendDays.length) {
        const hi = spendDays.reduce((a, b) => (b.exp > a.exp ? b : a)), lo = spendDays.reduce((a, b) => (b.exp < a.exp ? b : a));
        cards.push(kpi(T.highest_day, mny(hi.exp), esc(X.fmtDay(hi.date))));
        cards.push(kpi(T.lowest_day, mny(lo.exp), esc(X.fmtDay(lo.date))));
      }
      const bal = det && !det.missing ? det.balance : src.balance;
      if (bal != null) cards.push(kpi(isCurrent ? T.balance_now : T.balance, mny(bal), rate ? esc(eur(bal, rate)) : ''));
      if (pm) cards.push(kpi(T.vs_prev_month, delta(exp, pm.expense, true), esc(T.prev_month) + ': ' + esc(money(pm.expense))));
      html += kpis(cards);
      // daily bars
      const vals = days.map(x => x.exp);
      html += chart(T.daily_chart, barChart({ values: vals, hl: days.findIndex(x => x.date === today), avg: avg || 0, dim: i => i >= elapsed, labels: [{ i: 0, text: '1' }, { i: Math.floor((n - 1) / 2), text: String(Math.floor((n - 1) / 2) + 1) }, { i: n - 1, text: String(n) }], attr: i => `data-date="${days[i].date}"`, aria: T.daily_chart }), `${sw(C.acc, T.spent_l)}<span><i class="dash"></i>${esc(T.avg_label)}</span>`);
      // cumulative vs previous
      const cum = a => { let s = 0; return a.map(x => (s += x)); };
      const cur = cum(act.map(x => x.exp));
      const series = [];
      if (pm) series.push({ pts: cum(pm.d.map(x => x[1])), color: C.grey, width: 2, dash: true });
      series.push({ pts: cur, color: C.acc, width: 2.5, dot: true });
      if (cur.length > 1) html += chart(T.cum_chart, lineChart({ series, n, zero: true, xLabels: [{ i: 0, text: '1' }, { i: n - 1, text: String(n) }], aria: T.cum_chart }), `${sw(C.acc, T.this_month)}${pm ? sw(C.grey, T.prev_month) : ''}`);
      // weekday
      const wa = weekdayAvg(act), wmax = Math.max(...wa, 1);
      if (act.length >= 7) html += `<div class="chart"><div class="cap">${esc(T.weekday_chart)}</div>${wa.map((v, i) => `<div class="hb"><span class="l">${T.wd[i]}</span><span class="t"><span class="f ${v === Math.max(...wa) && v > 0 ? 'hi' : ''}" style="width:${(v / wmax) * 100}%"></span></span><span class="n num">${esc(money(v, false))}</span></div>`).join('')}</div>`;
      // top days and top items
      const topDays = spendDays.slice().sort((a, b) => b.exp - a.exp).slice(0, 5);
      if (topDays.length) html += `<p class="eyebrow">${esc(T.top_days)}</p>` + rows(topDays.map(x => rowBtn(`data-date="${x.date}"`, esc(X.fmtDay(x.date)), '', mny(x.exp), exp ? { t: pct((x.exp / exp) * 100), neg: true } : null)));
      const items = [];
      act.forEach(x => (x.terms || []).forEach(a => items.push({ a, date: x.date })));
      if (items.length) { items.sort((a, b) => b.a - a.a); html += `<p class="eyebrow">${esc(T.top_items)}</p>` + rows(items.slice(0, 5).map(x => rowBtn(`data-date="${x.date}"`, mny(x.a), esc(X.fmtDay(x.date)), '', null))); }
      // days list
      const list = days.filter(x => x.exp || x.inc).slice().reverse();
      if (list.length) html += `<p class="eyebrow">${esc(T.days_list)}</p>` + `<div class="rows">${list.map(x => `<button class="row ${x.date === today ? 'today' : ''}" data-date="${x.date}"><span class="d"><b>${esc(X.fmtDay(x.date))}</b></span><span class="r num">${mny(x.exp)}${x.inc ? `<small>+ ${esc(money(x.inc))}</small>` : ''}</span></button>`).join('')}</div>`;
      return html;
    }

    /* ----- YEAR ----- */
    function year(d) {
      const P = d.P, y = d.year;
      const ms = P.months.filter(m => m.month.startsWith(y + '-') && m.tracked);
      if (!ms.length) return `<div class="empty">${esc(T.no_data)}</div>`;
      const exp = sum(ms.map(m => m.expense)), inc = sum(ms.map(m => m.income)), res = inc - exp;
      const daysCount = sum(ms.map(m => m.elapsed));
      const pms = P.months.filter(m => m.month.startsWith((y - 1) + '-') && m.tracked);
      const pexp = pms.length ? sum(pms.map(m => m.expense)) : null;
      let html = hero(T.spent, exp, `<div class="s">${esc(T.earned)} ${esc(money(inc))} · ${esc(T.net)} ${esc(money(res))}</div>`);
      const cards = [];
      cards.push(kpi(T.net, mny(res), inc > 0 ? esc(T.saved) + ' ' + pct((res / inc) * 100) : ''));
      cards.push(kpi(T.avg_month, mny(exp / ms.length), esc(T.avg_month_income) + ': ' + esc(money(inc / ms.length))));
      cards.push(kpi(T.avg_day, mny(daysCount ? exp / daysCount : 0), esc(T.days_tracked) + ': ' + daysCount));
      if (pexp != null) cards.push(kpi(T.vs_prev_year, delta(exp, pexp, true), esc(y - 1) + ': ' + esc(money(pexp))));
      const best = ms.reduce((a, b) => (b.expense < a.expense ? b : a)), worst = ms.reduce((a, b) => (b.expense > a.expense ? b : a));
      if (ms.length > 1) { cards.push(kpi(T.best_month, mny(best.expense), esc(X.monthName(best.month)))); cards.push(kpi(T.worst_month, mny(worst.expense), esc(X.monthName(worst.month)))); }
      const topSave = ms.reduce((a, b) => (b.pl > a.pl ? b : a));
      if (ms.length > 1) cards.push(kpi(T.top_saving, mny(topSave.pl), esc(X.monthName(topSave.month))));
      const lastBal = ms[ms.length - 1].balance;
      if (lastBal != null) cards.push(kpi(T.balance_now, mny(lastBal), rate ? esc(eur(lastBal, rate)) : ''));
      html += kpis(cards);
      const items = P.months.filter(m => m.month.startsWith(y + '-')).map(m => ({ label: X.monthShort(m.month), a: m.tracked ? m.income : 0, b: m.tracked ? m.expense : 0, attr: m.tracked ? `data-m="${m.month}"` : '' }));
      html += chart(T.months_chart, groupedBars({ items, aria: T.months_chart }), `${sw(C.ok, T.income_l)}${sw(C.acc, T.spent_l)}`);
      const bpts = ms.filter(m => m.balance != null).map(m => m.balance);
      if (bpts.length > 1) html += chart(T.balance_chart, lineChart({ series: [{ pts: bpts, color: C.acc, width: 2.5, dot: true }], xLabels: [{ i: 0, text: X.monthShort(ms[0].month) }, { i: bpts.length - 1, text: X.monthShort(ms[ms.length - 1].month) }], aria: T.balance_chart }));
      const dayAll = [].concat(...ms.map(m => m.days)), wa = weekdayAvg(dayAll), wmax = Math.max(...wa, 1);
      if (dayAll.length >= 14) html += `<div class="chart"><div class="cap">${esc(T.weekday_chart)}</div>${wa.map((v, i) => `<div class="hb"><span class="l">${T.wd[i]}</span><span class="t"><span class="f ${v === Math.max(...wa) && v > 0 ? 'hi' : ''}" style="width:${(v / wmax) * 100}%"></span></span><span class="n num">${esc(money(v, false))}</span></div>`).join('')}</div>`;
      const mx = Math.max(...ms.map(m => m.expense), 1);
      html += `<p class="eyebrow">${esc(T.months_list)}</p><div class="rows">${ms.slice().reverse().map(m => `<button class="row mrow" data-m="${m.month}"><span class="d"><b>${esc(X.monthName(m.month))}</b><span class="num">${esc(T.avg_label)} ${esc(money(m.avg, false))} · ${esc(T.net)} ${esc(money(m.pl, false))}</span></span><span class="r num">${mny(m.expense)}${m.income ? `<small>+ ${esc(money(m.income))}</small>` : ''}</span><span class="bar" style="width:${(m.expense / mx) * 100}%"></span></button>`).join('')}</div>`;
      return html;
    }

    /* ----- TOTAL ----- */
    function total(d) {
      const P = d.P, ms = P.months.filter(m => m.tracked);
      if (!ms.length) return `<div class="empty">${esc(T.no_data)}</div>`;
      const exp = sum(ms.map(m => m.expense)), inc = sum(ms.map(m => m.income)), res = inc - exp;
      const dayAll = [].concat(...ms.map(m => m.days));
      let html = hero(T.spent, exp, `<div class="s">${esc(T.earned)} ${esc(money(inc))} · ${esc(T.net)} ${esc(money(res))}</div>`);
      const cards = [];
      cards.push(kpi(T.net, mny(res), inc > 0 ? esc(T.saved) + ' ' + pct((res / inc) * 100) : ''));
      const lastBal = ms[ms.length - 1].balance;
      cards.push(kpi(T.balance_now, lastBal != null ? mny(lastBal) : '–', lastBal != null && rate ? esc(eur(lastBal, rate)) : ''));
      cards.push(kpi(T.avg_month, mny(exp / ms.length), esc(T.avg_month_income) + ': ' + esc(money(inc / ms.length))));
      cards.push(kpi(T.avg_day, mny(dayAll.length ? exp / dayAll.length : 0), esc(T.days_tracked) + ': ' + dayAll.length));
      cards.push(kpi(T.months_tracked, String(ms.length), esc(X.monthShort(ms[0].month) + ' ' + ms[0].month.slice(0, 4)) + ' – ' + esc(X.monthShort(ms[ms.length - 1].month) + ' ' + ms[ms.length - 1].month.slice(0, 4))));
      if (ms.length > 1) {
        const best = ms.reduce((a, b) => (b.expense < a.expense ? b : a)), worst = ms.reduce((a, b) => (b.expense > a.expense ? b : a));
        cards.push(kpi(T.best_month, mny(best.expense), esc(X.fmtMonth(best.month)))); cards.push(kpi(T.worst_month, mny(worst.expense), esc(X.fmtMonth(worst.month))));
      }
      const hiDay = dayAll.reduce((a, b) => (b.exp > a.exp ? b : a), dayAll[0]);
      if (hiDay && hiDay.exp > 0) cards.push(kpi(T.highest_day, mny(hiDay.exp), esc(X.fmtDay(hiDay.date))));
      cards.push(kpi(T.no_spend_days, String(dayAll.filter(x => x.exp === 0).length), esc(T.longest_streak) + ': ' + esc(T.streak_unit(streak(dayAll)))));
      html += kpis(cards);
      const items = ms.map(m => ({ label: X.monthShort(m.month), a: m.income, b: m.expense, attr: `data-m="${m.month}"` }));
      html += chart(T.months_chart, groupedBars({ items, aria: T.months_chart }), `${sw(C.ok, T.income_l)}${sw(C.acc, T.spent_l)}`);
      const bpts = ms.filter(m => m.balance != null).map(m => m.balance);
      if (bpts.length > 1) html += chart(T.balance_chart, lineChart({ series: [{ pts: bpts, color: C.acc, width: 2.5, dot: true }], xLabels: [{ i: 0, text: X.monthShort(ms[0].month) }, { i: bpts.length - 1, text: X.monthShort(ms[ms.length - 1].month) }], aria: T.balance_chart }));
      const wa = weekdayAvg(dayAll), wmax = Math.max(...wa, 1);
      if (dayAll.length >= 14) html += `<div class="chart"><div class="cap">${esc(T.weekday_chart)}</div>${wa.map((v, i) => `<div class="hb"><span class="l">${T.wd[i]}</span><span class="t"><span class="f ${v === Math.max(...wa) && v > 0 ? 'hi' : ''}" style="width:${(v / wmax) * 100}%"></span></span><span class="n num">${esc(money(v, false))}</span></div>`).join('')}</div>`;
      const years = [...new Set(ms.map(m => m.month.slice(0, 4)))];
      if (years.length) {
        html += `<p class="eyebrow">${esc(T.years_list)}</p><div class="rows">${years.slice().reverse().map(yy => { const a = ms.filter(m => m.month.startsWith(yy)); const e = sum(a.map(m => m.expense)), i = sum(a.map(m => m.income)); return `<button class="row" data-y="${yy}"><span class="d"><b>${yy}</b><span class="num">${a.length} ${esc(T.mo)} · ${esc(T.net)} ${esc(money(i - e, false))}</span></span><span class="r num">${mny(e)}${i ? `<small>+ ${esc(money(i))}</small>` : ''}</span></button>`; }).join('')}</div>`;
      }
      return html;
    }

    return { day, month, year, total, T };
  }

  window.BZStats = { prep, build, prevMonth, dim };
})();
