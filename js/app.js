/* NPF Trend Analysis dashboard — renders all views, tables and SVG charts from sample data. */
(function () {
  'use strict';

  // ================================================================ data
  const MONTHS = [
    { y: 2025, m: 'October' }, { y: 2025, m: 'November' }, { y: 2025, m: 'December' },
    { y: 2026, m: 'January' }, { y: 2026, m: 'February' }, { y: 2026, m: 'March' },
    { y: 2026, m: 'April' }, { y: 2026, m: 'May' }, { y: 2026, m: 'June' },
    { y: 2026, m: 'July' }, { y: 2026, m: 'August' }
  ];
  const LAST = MONTHS.length - 1;
  const OJK = 5, INDUSTRY = 2.66;

  const SUMMARY = {
    osp: [4089, 3904, 3767, 3571, 3392, 3213, 3049, 2880, 2715, 2548, 2399],
    amt: [254, 244, 300, 292, 287, 275, 276, 266, 254, 239, 227]
  };

  // deterministic pseudo-random so the page renders identically every load
  let seed = 42;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const between = (a, b) => a + rand() * (b - a);
  const clampPct = (v) => Math.min(100, Math.max(0, v));
  // linear path from a → b across the months with a little noise
  const ramp = (a, b, noise = 0.3) =>
    MONTHS.map((_, k) => +clampPct(a + (b - a) * k / LAST + between(-noise, noise)).toFixed(1));

  const TAB20 = ['#4e79a7', '#a0cbe8', '#f28e2b', '#ffbe7d', '#59a14f', '#8cd17d', '#b6992d',
    '#f1ce63', '#499894', '#86bcb6', '#e15759', '#ff9d9a', '#79706e', '#bab0ac', '#d37295',
    '#fabfd2', '#b07aa1', '#d4a6c8', '#9d7660', '#d7b5a6'];

  // ---------- region / collector ----------
  const REGION_NAMES = [
    '-', 'COLLECTION I', 'COLLECTION II', 'COLLECTION III', 'COLLECTION IV',
    'COLLECTION IX', 'COLLECTION V', 'COLLECTION VI', 'COLLECTION VII',
    'COLLECTION VIII', 'HEAD OFFICE', 'REGIONAL III - FL'
  ];
  const REGION_NPF = {
    '-': [32.9, 39.5, 41.9, 48.7, 62.8, 72.1, 29.1, 100, 100, 100, null],
    'REGIONAL III - FL': [null, 4.8, 75.3, 78.2, 80.0, 81.6, 83.5, 85.0, 87.1, 89.6, 90.6],
    'COLLECTION IX': [50.7, 56.3, 52.0, 47.5, 43.0, 38.5, 34.0, 29.0, 24.0, 18.0, 10.5],
    'COLLECTION III': [12.7, 12.5, 12.4, 12.4, 12.2, 12.1, 12.3, 13.0, 13.1, 12.4, 12.5],
    'HEAD OFFICE': [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, null, null]
  };
  REGION_NAMES.forEach((n) => {
    if (!REGION_NPF[n]) { const b = between(3, 9); REGION_NPF[n] = ramp(b, b + 1.8, 0.4); }
  });

  const GROUP_NAMES = ['223', '-', 'AIR MOLEK', 'BALIKPAPAN', 'BANDUNG', 'BANJARMASIN',
    'BEKASI', 'BOGOR', 'CIREBON', 'DENPASAR', 'JAMBI', 'JEMBER', 'KEDIRI', 'MAKASSAR',
    'MALANG', 'MEDAN', 'PADANG', 'PALEMBANG', 'PEKANBARU', 'SAMARINDA', 'SEMARANG', 'SURABAYA'];
  const BRANCH_NAMES = ['-', 'AIR MOLEK', 'BALIKPAPAN', 'Balikpapan - Paser', 'BANDUNG',
    'Bandung - Cimahi', 'BANJARMASIN', 'BEKASI', 'BOGOR', 'CIREBON', 'DENPASAR', 'JAMBI',
    'JEMBER', 'KEDIRI', 'MAKASSAR', 'MALANG', 'MEDAN', 'PADANG', 'PALEMBANG', 'PEKANBARU'];
  const FC_NAMES = ['Null', '[140515]Ahmad Mansyur', '[650715]Kevin Christian Tamon',
    '[1700815]M Hasbullah Fatoni', '[2210915]I Made Yuliantha', '[2560915]Nelfianto Permana',
    '[2830915]Muh Rendi Saputra', '[2600915]Banu Sarwono', '[2730915]Sulipurwanto',
    '[3321015]Fahlevi Julianto', '[3591015]Moh Hafid', '[3661115]Qhario', '[4021115]Martono',
    '[4041115]Riki Fardana', '[4231215]Fadli Muchlis', '[4261215]Heri Arto Fadana',
    '[4731215]Azhar', '[5290416]Rahmat Machmud'];

  // ---------- product ----------
  const PRODUCTS = [
    { g: 'CF', c: '2W', p: '01.NEW BIKE', osp: 1010, npf: ramp(3.1, 2.7, 0.3) },
    { g: 'CF', c: '2W', p: '02.USED BIKE', osp: 48, npf: ramp(6.2, 5.6, 0.4) },
    { g: 'CF', c: '2W', p: '06.DAHSYAT', osp: 30, npf: ramp(4.5, 6.0, 0.4) },
    { g: 'CF', c: '4W', p: '03.NEW CAR', osp: 278, npf: ramp(5.4, 7.5, 0.3) },
    { g: 'CF', c: '4W', p: '04.USED CAR', osp: 796, npf: ramp(8.9, 8.2, 0.3) },
    { g: 'CF', c: '4W', p: '06.DAHSYAT', osp: 60, npf: ramp(7.0, 9.0, 0.5) },
    { g: 'CF', c: 'COP', p: '07.COP', osp: 7, npf: MONTHS.map((_, k) => (k >= 4 && k <= 8 ? 0 : null)) },
    { g: 'CF', c: 'MP', p: '05.MULTI PRODUCT', osp: 0.5, npf: [56.9, 60.1, 100, 100, 100, 100, 100, 100, 100, 100, 100] },
    { g: 'CF', c: 'MP', p: '06.DAHSYAT', osp: 4, npf: [96.3, 96.2, 96.1, 96.5, 96.3, 96.2, 100, 100, 100, 100, 100] },
    { g: 'CF', c: 'MP', p: '10.PROPERTY', osp: 4.4, npf: [96.3, 96.2, 96.1, 96.5, 96.3, 96.2, 100, 100, 100, 100, 100] },
    { g: 'FL', c: 'FL', p: '08.DF', osp: 40, npf: [9.5, 9.8, 10.3, 13.7, 15.1, 15.7, 18.9, 22.1, 19.8, 24.3, 28.2] },
    { g: 'FL', c: 'FL', p: '09.SLB', osp: 0.5, npf: MONTHS.map(() => 0) },
    { g: 'FL', c: 'FL', p: '10.PROPERTY', osp: 102, npf: [8.3, 9.8, 48.8, 53.0, 56.5, 60.2, 64.5, 68.7, 71.3, 75.8, 79.6] }
  ].map((r) => Object.assign(r, {
    months: r.npf.map((npf, k) => {
      if (npf == null) return null;
      const osp = r.osp * (1 + (LAST - k) * 0.03);
      return { osp, amt: osp * npf / 100, npf };
    })
  }));

  const CAT_COLORS = { '2W': '#4e79a7', '4W': '#f28e2b', 'COP': '#e15759', 'FL': '#76b7b2', 'MP': '#59a14f' };
  const PROD_COLORS = {
    '01.NEW BIKE': '#4e79a7', '02.USED BIKE': '#a0cbe8', '03.NEW CAR': '#f28e2b',
    '04.USED CAR': '#ffbe7d', '05.MULTI PRODUCT': '#59a14f', '06.DAHSYAT': '#8cd17d',
    '07.COP': '#e15759', '08.DF': '#f1ce63', '09.SLB': '#499894', '10.PROPERTY': '#b07aa1'
  };
  // donut: CF in blues, FL in oranges (as in the Tableau workbook)
  const DONUT_CAT = { 'CF, 2W': '#3f6d9e', 'CF, 4W': '#6a95c4', 'CF, COP': '#8fb2d8', 'CF, MP': '#b3cde9', 'FL, FL': '#ef8a2e' };
  const SUPPLIERS = ['PT Astra Honda Motor', 'PT Yamaha Indonesia Motor Mfg', 'PT Toyota-Astra Motor',
    'PT Astra Daihatsu Motor', 'PT Suzuki Indomobil Sales', 'PT Mitsubishi Motors Krama Yudha Sales',
    'PT Trakindo Utama', 'PT United Tractors'];

  const BRAND_NAMES = ['Null', '- MP', 'ADI MILLINDO MESIN FL', 'APPKTM 2W', 'APRILIA 2W', 'BENELLI 2W',
    'BMW 4W', 'BOMAG FL', 'BYD 4W', 'CAMC 4W', 'CAMC FL', 'CATERPILAR FL', 'Caterpillar FL',
    'CHERY 4W', 'CHERY COP', 'CHEVROLET 4W', 'DAIHATSU 4W', 'HONDA 2W', 'HONDA 4W', 'MITSUBISHI 4W',
    'SUZUKI 4W', 'TOYOTA 4W', 'YAMAHA 2W'];
  const MERK_NAMES = ['Null', 'HYD ROUGH TERRAIN CRANE', 'KLX', '2', '3S', '320', '700', '.',
    '.CAMRY', 'A200', 'ACCORD', 'ADDRESS', 'ADV', 'AERIAL WORKING', 'AEROX', 'AGYA', 'AVANZA',
    'BEAT', 'BRIO', 'CALYA', 'INNOVA', 'NMAX', 'SCOOPY', 'VARIO', 'XPANDER'];

  // Build a monthly series of {npf, amt, osp} rows for a list of names.
  function buildRows(names, ospRange, opts = {}) {
    return names.map((name, i) => {
      const osp0 = opts.osp ? opts.osp(name, i) || between(ospRange[0], ospRange[1]) : between(ospRange[0], ospRange[1]);
      const npf0 = opts.npf ? opts.npf(name, i) : between(0.5, 18);
      const months = MONTHS.map((_, k) => {
        if (opts.gap && opts.gap(name, k)) return null;
        const osp = osp0 * (1 - k * 0.035) * between(0.97, 1.03);
        const npf = clampPct(npf0 + between(-1.2, 1.4) + k * 0.15);
        return { npf, amt: osp * npf / 100, osp };
      });
      return { name, months };
    });
  }
  // "Null" only carries the latest month; named rows stop the month before (as in the source extract)
  const nullGap = (n, k) => (n === 'Null' ? k < LAST : k === LAST);

  const regionRows = REGION_NAMES.map((name) => {
    const osp0 = name === '-' ? 0.2 : name === 'HEAD OFFICE' ? 5 : between(150, 450);
    return {
      name,
      months: REGION_NPF[name].map((npf, k) => npf == null ? null : ({
        npf, osp: osp0 * (1 - k * 0.035), amt: osp0 * (1 - k * 0.035) * npf / 100
      }))
    };
  });
  const groupRows = buildRows(GROUP_NAMES, [10, 90], {
    npf: (n) => n === '223' ? 84 : n === '-' ? 60 : n === 'AIR MOLEK' ? 2.5 : between(1, 16)
  });
  const branchRows = buildRows(BRANCH_NAMES, [1000, 18000], {
    npf: (n) => n === '-' ? 98 : n === 'AIR MOLEK' ? 2.4 : between(1, 20)
  });
  const fcRows = buildRows(FC_NAMES, [1500, 22000], {
    osp: (n) => n.includes('Rendi') ? 70000 : n === 'Null' ? 2399434 : 0,
    npf: (n) => /Kevin|Made/.test(n) ? 0 : /Hasbullah/.test(n) ? 40 : n === 'Null' ? 9.4 : between(0, 20),
    gap: (n, k) => (n.includes('Ahmad') ? k !== 7 : nullGap(n, k))
  });
  const brandRows = buildRows(BRAND_NAMES, [800, 9000], {
    osp: (n) => ({ 'HONDA 2W': 110000, 'Caterpillar FL': 24000, 'TOYOTA 4W': 30000, 'Null': 2399434 })[n] || 0,
    npf: (n) => ({ 'APPKTM 2W': 0, 'HONDA 2W': 9, 'Caterpillar FL': 20, 'Null': 9.4 })[n] ?? between(0, 22),
    gap: nullGap
  });
  const merkRows = buildRows(MERK_NAMES, [300, 6000], {
    osp: (n) => ({ 'BEAT': 90000, 'Null': 2399434, 'VARIO': 22000 })[n] || 0,
    npf: (n) => ({ 'HYD ROUGH TERRAIN CRANE': 0, 'KLX': 7.8, '2': 24, 'BEAT': 9, 'Null': 9.4 })[n] ?? between(0, 22),
    gap: nullGap
  });

  // ================================================================ helpers
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);
  const fmt = (v, d = 1) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const monthLabel = (i) => `${MONTHS[i].m} ${MONTHS[i].y}`;

  function svg(tag, attrs = {}, parent) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  }
  function text(parent, x, y, str, attrs = {}) {
    const t = svg('text', Object.assign({ x, y }, attrs), parent);
    t.textContent = str;
    return t;
  }

  // NPF heat colour: 0% green → 2.5% yellow → 5%+ terracotta (matches header scale)
  function heat(npf) {
    const stops = [[90, 158, 122], [227, 207, 77], [192, 105, 79]];
    const t = Math.min(npf, OJK) / OJK;
    const [a, b, f] = t < 0.5 ? [stops[0], stops[1], t * 2] : [stops[1], stops[2], (t - 0.5) * 2];
    return `rgb(${a.map((c, i) => Math.round(c + (b[i] - c) * f)).join(',')})`;
  }

  const tip = $('tooltip');
  function bindTip(el, html) {
    el.addEventListener('mousemove', (e) => {
      tip.innerHTML = html;
      tip.style.display = 'block';
      tip.style.left = Math.min(e.clientX + 12, window.innerWidth - tip.offsetWidth - 8) + 'px';
      tip.style.top = (e.clientY + 12) + 'px';
    });
    el.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
  }

  // Sum rows' monthly osp/amt by a key and recompute %NPF.
  function aggregate(items, keyFn, extra) {
    const map = new Map();
    items.forEach((it) => {
      const key = keyFn(it);
      if (!map.has(key)) map.set(key, Object.assign({ name: key, months: MONTHS.map(() => null) }, extra ? extra(it) : {}));
      const row = map.get(key);
      it.months.forEach((v, k) => {
        if (!v) return;
        const cur = row.months[k] || (row.months[k] = { osp: 0, amt: 0, npf: 0 });
        cur.osp += v.osp; cur.amt += v.amt;
        cur.npf = cur.osp ? cur.amt / cur.osp * 100 : 0;
      });
    });
    return [...map.values()];
  }

  function emptyState(host, msg) {
    host.innerHTML = `<div class="empty-state">${msg}</div>`;
  }

  // ================================================================ heat tables
  // Columns run latest month first, grouped by year, like the source workbook.
  // heads: row-header column titles; with two, rows carry `group` which is merged down.
  function renderHeatTable(table, rows, { unit, maxCols = MONTHS.length, heads = ['Name'], deltas = false }) {
    table.innerHTML = '';
    const idx = MONTHS.map((_, i) => i).reverse().slice(0, maxCols);
    const thead = document.createElement('thead');
    const yearRow = document.createElement('tr');
    const monRow = document.createElement('tr');
    heads.forEach((h) => {
      const th = document.createElement('th');
      th.className = 'row-head'; th.rowSpan = 2; th.textContent = h;
      yearRow.appendChild(th);
    });
    let lastYear = null, yearCell = null;
    idx.forEach((i) => {
      const { y, m } = MONTHS[i];
      const sep = lastYear !== null && y !== lastYear;
      if (y !== lastYear) {
        yearCell = document.createElement('th');
        yearCell.textContent = y; yearCell.colSpan = 0;
        if (sep) yearCell.className = 'year-sep';
        yearRow.appendChild(yearCell);
        lastYear = y;
      }
      yearCell.colSpan++;
      const th = document.createElement('th');
      th.textContent = m;
      if (sep) th.className = 'year-sep';
      monRow.appendChild(th);
    });
    thead.append(yearRow, monRow);

    const tbody = document.createElement('tbody');
    rows.forEach((row, r) => {
      const tr = document.createElement('tr');
      if (heads.length === 2) {
        if (r === 0 || rows[r - 1].group !== row.group) {
          const th = document.createElement('th');
          th.className = 'row-head grp-head';
          th.rowSpan = rows.filter((x) => x.group === row.group).length;
          th.textContent = row.group;
          tr.appendChild(th);
        }
      }
      if (heads.length) {
        const th = document.createElement('th');
        th.className = 'row-head'; th.textContent = row.label || row.name;
        tr.appendChild(th);
      }
      idx.forEach((i, c) => {
        const td = document.createElement('td');
        const v = row.months[i];
        if (c > 0 && MONTHS[i].y !== MONTHS[idx[c - 1]].y) td.classList.add('year-sep');
        if (!v) { td.classList.add('empty'); tr.appendChild(td); return; }
        td.style.background = heat(v.npf);
        let html = `<b>${fmt(v.npf)}%</b>${fmt(v.amt)} ${unit}<br>${fmt(v.osp)} ${unit}`;
        const prev = row.months[i - 1];
        if (deltas && prev) {
          const d = v.npf - prev.npf;
          html = `<b>${fmt(v.npf)}%</b>${fmt(v.amt)} ${unit} <span class="${d > 0 ? 'delta-down' : 'delta-up'}">${d > 0 ? '▲' : '▼'} ${fmt(Math.abs(d))}%</span><br>${fmt(v.osp, 0)} ${unit}`;
        }
        td.innerHTML = html;
        bindTip(td, `<b>${row.group ? row.group + ' · ' : ''}${row.label || row.name}</b><br>${monthLabel(i)}<br>%NPF: ${fmt(v.npf)}%<br>Amount 90+: ${fmt(v.amt)} ${unit}<br>OSP: ${fmt(v.osp)} ${unit}`);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.append(thead, tbody);
  }

  // ================================================================ KPI tiles
  function renderKpis() {
    const k = LAST, npf = SUMMARY.amt[k] / SUMMARY.osp[k] * 100;
    const npfPrev = SUMMARY.amt[k - 1] / SUMMARY.osp[k - 1] * 100;
    const dAmt = SUMMARY.amt[k] - SUMMARY.amt[k - 1], dOsp = SUMMARY.osp[k] - SUMMARY.osp[k - 1];
    const arrow = (d) => (d > 0 ? '▲' : '▼');
    $('kpis').innerHTML = `
      <div class="kpi"><div class="k-label">%NPF · ${monthLabel(k)}</div>
        <div class="k-val">${fmt(npf)}%<span class="chip ${npf > OJK ? 'bad' : 'ok'}">${npf > OJK ? 'Above' : 'Within'} OJK 5%</span></div>
        <div class="k-sub">${arrow(npf - npfPrev)} ${fmt(Math.abs(npf - npfPrev), 2)} pp vs ${MONTHS[k - 1].m}</div></div>
      <div class="kpi"><div class="k-label">Amount 90+</div>
        <div class="k-val">${fmt(SUMMARY.amt[k], 0)} bio</div>
        <div class="k-sub">${arrow(dAmt)} ${fmt(Math.abs(dAmt), 0)} bio vs ${MONTHS[k - 1].m}</div></div>
      <div class="kpi"><div class="k-label">OSP</div>
        <div class="k-val">${fmt(SUMMARY.osp[k], 0)} bio</div>
        <div class="k-sub">${arrow(dOsp)} ${fmt(Math.abs(dOsp), 0)} bio vs ${MONTHS[k - 1].m}</div></div>
      <div class="kpi"><div class="k-label">Gap to Threshold</div>
        <div class="k-val">${npf > OJK ? '+' : ''}${fmt(npf - OJK)} pp</div>
        <div class="k-sub">Industry average ${INDUSTRY}% (Aug 2024)</div></div>`;
    const ins = document.createElement('div');
    ins.className = 'insight';
    ins.textContent = `%NPF rose from ${fmt(SUMMARY.amt[0] / SUMMARY.osp[0] * 100)}% to ${fmt(npf)}% since ${monthLabel(0)} while Amount 90+ fell ${fmt((1 - SUMMARY.amt[k] / SUMMARY.amt[0]) * 100, 0)}%: OSP is shrinking faster (${fmt((1 - SUMMARY.osp[k] / SUMMARY.osp[0]) * 100, 0)}%) than the 90+ book.`;
    $('kpis').after(ins);
  }

  // ================================================================ combo chart (bars OSP + line 90+)
  function linearTrend(vals) {
    const n = vals.length, xs = vals.map((_, i) => i);
    const mx = xs.reduce((a, b) => a + b) / n, my = vals.reduce((a, b) => a + b) / n;
    let num = 0, den = 0;
    xs.forEach((x, i) => { num += (x - mx) * (vals[i] - my); den += (x - mx) ** 2; });
    const s = num / den;
    return (x) => my + s * (x - mx);
  }

  function renderCombo() {
    const W = 1000, H = 340, m = { t: 20, r: 60, b: 40, l: 60 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const root = svg('svg', { viewBox: `0 0 ${W} ${H}` }, $('combo-chart'));
    const n = MONTHS.length, step = iw / n;
    const yL = (v) => m.t + ih - (v / 4500) * ih;
    const yR = (v) => m.t + ih - (v / 330) * ih;
    const xc = (i) => m.l + step * (i + 0.5);

    const grid = svg('g', { class: 'grid' }, root);
    const axis = svg('g', { class: 'axis' }, root);
    [0, 1000, 2000, 3000, 4000].forEach((v) => {
      svg('line', { x1: m.l, x2: W - m.r, y1: yL(v), y2: yL(v) }, grid);
      text(axis, m.l - 6, yL(v) + 3, `${fmt(v, 0)} bio`, { 'text-anchor': 'end' });
    });
    [0, 50, 100, 150, 200, 250, 300].forEach((v) => text(axis, W - m.r + 6, yR(v) + 3, `${v} bio`));
    text(axis, 16, m.t + ih / 2, 'OSP', { transform: `rotate(-90 16 ${m.t + ih / 2})`, 'text-anchor': 'middle' });
    text(axis, W - 10, m.t + ih / 2, '90+', { transform: `rotate(90 ${W - 10} ${m.t + ih / 2})`, 'text-anchor': 'middle' });
    svg('line', { x1: m.l, x2: m.l, y1: m.t, y2: m.t + ih, stroke: '#ccc' }, root);
    svg('line', { x1: W - m.r, x2: W - m.r, y1: m.t, y2: m.t + ih, stroke: '#ccc' }, root);

    SUMMARY.osp.forEach((v, i) => {
      const bw = step * 0.24;
      const r = svg('rect', { x: xc(i) - bw / 2, y: yL(v), width: bw, height: yL(0) - yL(v), fill: 'var(--green)' }, root);
      bindTip(r, `<b>${monthLabel(i)}</b><br>OSP: ${fmt(v, 0)} bio`);
      text(root, xc(i), yL(v) - 4, `${fmt(v, 0)} bio`, { class: 'val-label', 'text-anchor': 'middle' });
      text(axis, xc(i), H - m.b + 16, monthLabel(i), { 'text-anchor': 'middle', style: 'font-size:9px' });
    });

    const tOsp = linearTrend(SUMMARY.osp), tAmt = linearTrend(SUMMARY.amt);
    svg('line', { x1: m.l, y1: yL(tOsp(-0.5)), x2: W - m.r, y2: yL(tOsp(n - 0.5)), stroke: 'var(--green)', 'stroke-dasharray': '4 3', 'stroke-width': 1.5 }, root);
    svg('line', { x1: m.l, y1: yR(tAmt(-0.5)), x2: W - m.r, y2: yR(tAmt(n - 0.5)), stroke: 'var(--red)', 'stroke-dasharray': '4 3', 'stroke-width': 1.5 }, root);

    svg('polyline', { points: SUMMARY.amt.map((v, i) => `${xc(i)},${yR(v)}`).join(' '), fill: 'none', stroke: 'var(--red)', 'stroke-width': 3 }, root);
    SUMMARY.amt.forEach((v, i) => {
      const c = svg('circle', { cx: xc(i), cy: yR(v), r: 4, fill: 'var(--red)' }, root);
      bindTip(c, `<b>${monthLabel(i)}</b><br>Amount 90+: ${v} bio<br>%NPF: ${fmt(v / SUMMARY.osp[i] * 100)}%`);
      text(root, xc(i), yR(v) - 8, `${v} bio`, { class: 'val-label', 'text-anchor': 'middle' });
    });
  }

  // ================================================================ %NPF line chart
  // series: [{name, color, vals: [npf|null]}]; labelled series show point values.
  function renderLineChart(host, legendHost, series, { legendTitle, bottom = false, height = 360, labelOver = 15 } = {}) {
    host.innerHTML = '';
    if (!series.length) { emptyState(host, 'No data for the selected filters.'); legendHost.innerHTML = ''; return; }
    const W = bottom ? 620 : 1000, H = height, m = { t: 20, r: 70, b: 36, l: 50 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const root = svg('svg', { viewBox: `0 0 ${W} ${H}` }, host);
    const step = iw / LAST;
    const x = (i) => m.l + step * i;
    const y = (v) => m.t + ih - (v / 105) * ih;

    // threshold bands: red above OJK 5%, green below
    svg('rect', { x: m.l, y: y(105), width: iw, height: y(OJK) - y(105), fill: '#fbd3d0' }, root);
    svg('rect', { x: m.l, y: y(OJK), width: iw, height: y(0) - y(OJK) + 6, fill: '#d8f5d0' }, root);

    const axis = svg('g', { class: 'axis' }, root);
    [0, 20, 40, 60, 80, 100].forEach((v) => {
      svg('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: 'rgba(255,255,255,.7)' }, root);
      text(axis, m.l - 6, y(v) + 3, `${fmt(v)}%`, { 'text-anchor': 'end' });
    });
    text(axis, 14, m.t + ih / 2, 'NPF', { transform: `rotate(-90 14 ${m.t + ih / 2})`, 'text-anchor': 'middle' });
    MONTHS.forEach((_, i) => {
      if (bottom && i % 2) return; // narrow half-width charts: every other month
      text(axis, x(i), H - 12, monthLabel(i), { 'text-anchor': 'middle', style: 'font-size:9px' });
    });

    // reference lines
    svg('line', { x1: m.l, x2: W - m.r, y1: y(OJK), y2: y(OJK), stroke: '#b5121b', 'stroke-dasharray': '5 3' }, root);
    text(axis, W - m.r + 4, y(OJK) - 2, 'OJK 5%', { style: 'fill:#b5121b;font-weight:600' });
    svg('line', { x1: m.l, x2: W - m.r, y1: y(INDUSTRY), y2: y(INDUSTRY), stroke: '#555', 'stroke-dasharray': '2 3' }, root);
    text(axis, W - m.r + 4, y(INDUSTRY) + 9, `Ind. ${INDUSTRY}%`);

    legendHost.innerHTML = legendTitle && !bottom ? `<div class="legend-title">${legendTitle}</div>` : (legendTitle ? `<b>${legendTitle}:</b>` : '');
    const groups = [];
    series.forEach((s, si) => {
      const labelled = Math.max(...s.vals.filter((v) => v != null)) > labelOver;
      const g = svg('g', {}, root);
      groups.push(g);
      let seg = [];
      const flush = () => {
        if (seg.length > 1) svg('polyline', { points: seg.join(' '), fill: 'none', stroke: s.color, 'stroke-width': labelled ? 2.5 : 1.5 }, g);
        seg = [];
      };
      s.vals.forEach((v, i) => { if (v == null) flush(); else seg.push(`${x(i)},${y(v)}`); });
      flush();
      s.vals.forEach((v, i) => {
        if (v == null) return;
        const c = svg('circle', { cx: x(i), cy: y(v), r: labelled ? 3.5 : 2, fill: s.color }, g);
        bindTip(c, `<b>${s.name}</b><br>${monthLabel(i)}<br>%NPF: ${fmt(v)}%`);
        if (labelled && v > 4) text(g, x(i), y(v) - 7, `${fmt(v)}%`, { class: 'val-label', 'text-anchor': 'middle' });
      });

      const item = document.createElement(bottom ? 'span' : 'div');
      item.innerHTML = `<i style="background:${s.color}"></i>${s.name}`;
      item.style.cursor = 'pointer';
      item.addEventListener('mouseenter', () => groups.forEach((gg, k) => (gg.style.opacity = k === si ? 1 : 0.12)));
      item.addEventListener('mouseleave', () => groups.forEach((gg) => (gg.style.opacity = 1)));
      legendHost.appendChild(item);
    });
  }

  // ================================================================ stacked 100% chart
  function renderStack(host, legendHost, rows, { legendTitle, tail = 0, width = 1000 } = {}) {
    host.innerHTML = '';
    const W = width, H = 380, m = { t: 26, r: 10, b: 30, l: 50 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const root = svg('svg', { viewBox: `0 0 ${W} ${H}` }, host);
    const idx = MONTHS.map((_, i) => i).reverse();
    const step = iw / idx.length, bw = step * 0.72;
    const y = (p) => m.t + ih - p * ih;
    const axis = svg('g', { class: 'axis' }, root);
    [0, .2, .4, .6, .8, 1].forEach((p) => {
      svg('line', { x1: m.l, x2: W - m.r, y1: y(p), y2: y(p), stroke: '#eee' }, root);
      text(axis, m.l - 6, y(p) + 3, `${Math.round(p * 100)}%`, { 'text-anchor': 'end' });
    });
    text(axis, 14, m.t + ih / 2, '% of Total 90+', { transform: `rotate(-90 14 ${m.t + ih / 2})`, 'text-anchor': 'middle' });

    // a long tail of small, unnamed contributors fills the bars like the source chart
    const tailW = Array.from({ length: tail }, () => between(0.3, 1.6));
    idx.forEach((i, c) => {
      const x0 = m.l + step * c + (step - bw) / 2;
      const parts = rows.map((r, k) => ({ name: r.name, color: TAB20[k % TAB20.length], v: r.months[i] ? r.months[i].amt : 0 }));
      const named = parts.reduce((a, p) => a + p.v, 0);
      if (!rows[0].months[i]) {
        tailW.forEach((t, k) => parts.push({ name: `Others #${k + 1}`, color: `hsl(${(k * 47) % 360},50%,${62 + (k % 3) * 8}%)`, v: t * named / 40 }));
      }
      const total = parts.reduce((a, p) => a + p.v, 0) || 1;
      let acc = 0;
      parts.forEach((p) => {
        if (!p.v) return;
        const h = (p.v / total) * ih;
        const top = y(acc / total) - h;
        const r = svg('rect', { x: x0, y: top, width: bw, height: h, fill: p.color, stroke: '#fff', 'stroke-width': 0.3 }, root);
        bindTip(r, `<b>${p.name}</b><br>${monthLabel(i)}<br>Share of 90+: ${fmt(p.v / total * 100)}%`);
        if (p.v / total > 0.08 && bw > 18) {
          const cx = x0 + bw / 2, cy = top + h / 2;
          text(root, cx, cy + 3, `${fmt(p.v / total * 100)}%`, { class: 'val-label', 'text-anchor': 'middle', transform: `rotate(-90 ${cx} ${cy})` });
        }
        acc += p.v;
      });
      text(axis, x0 + bw / 2, H - 10, MONTHS[i].m.slice(0, 3), { 'text-anchor': 'middle' });
    });
    const y26 = idx.filter((i) => MONTHS[i].y === 2026).length;
    text(axis, m.l + step * y26 / 2, 14, '2026', { 'text-anchor': 'middle', style: 'font-weight:600' });
    text(axis, m.l + step * (y26 + (idx.length - y26) / 2), 14, '2025', { 'text-anchor': 'middle', style: 'font-weight:600' });
    svg('line', { x1: m.l + step * y26, x2: m.l + step * y26, y1: 0, y2: H - m.b, stroke: '#ccc' }, root);

    legendHost.innerHTML = `<div class="legend-title">${legendTitle}</div>`;
    rows.forEach((r, k) => {
      const item = document.createElement('div');
      item.innerHTML = `<i style="background:${TAB20[k % TAB20.length]}"></i>${r.name}`;
      item.title = r.name;
      legendHost.appendChild(item);
    });
  }

  // ================================================================ two-ring donut
  function arcPath(cx, cy, r0, r1, a0, a1) {
    if (a1 - a0 >= 2 * Math.PI - 1e-6) a1 = a0 + 2 * Math.PI - 1e-4;
    const p = (r, a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const [x0, y0] = p(r1, a0), [x1, y1] = p(r1, a1), [x2, y2] = p(r0, a1), [x3, y3] = p(r0, a0);
    return `M${x0},${y0}A${r1},${r1} 0 ${large} 1 ${x1},${y1}L${x2},${y2}` +
      (r0 ? `A${r0},${r0} 0 ${large} 0 ${x3},${y3}Z` : 'Z');
  }

  function renderDonut(host, products, measure) {
    host.innerHTML = '';
    const items = products.map((p) => ({ p, v: p.months[LAST] ? p.months[LAST][measure] : 0 }));
    const total = items.reduce((a, it) => a + it.v, 0);
    if (!total) { emptyState(host, 'No data in the latest month for the selected filters.'); return; }
    const W = 460, H = 330, cx = W / 2, cy = H / 2, rIn = 82, r0 = 88, r1 = 122;
    const root = svg('svg', { viewBox: `0 0 ${W} ${H}` }, host);
    const unit = 'bio', label = measure === 'osp' ? 'OSP' : 'Amount 90+';

    // inner ring: Cat Product
    const cats = aggregate(products, (p) => `${p.g}, ${p.c}`);
    let a = 0;
    cats.forEach((c) => {
      const v = c.months[LAST] ? c.months[LAST][measure] : 0;
      if (!v) return;
      const da = v / total * 2 * Math.PI;
      const path = svg('path', { d: arcPath(cx, cy, 0, rIn, a, a + da), fill: DONUT_CAT[c.name], stroke: '#fff', 'stroke-width': 1 }, root);
      bindTip(path, `<b>${c.name}</b><br>${label}: ${fmt(v)} ${unit}<br>Share: ${fmt(v / total * 100)}%`);
      a += da;
    });

    // outer ring: Product, ordered within its category so rings line up
    a = 0;
    const order = cats.map((c) => c.name);
    items.sort((x, y) => order.indexOf(`${x.p.g}, ${x.p.c}`) - order.indexOf(`${y.p.g}, ${y.p.c}`));
    const labels = [];
    items.forEach((it) => {
      if (!it.v) return;
      const da = it.v / total * 2 * Math.PI, share = it.v / total * 100;
      const path = svg('path', { d: arcPath(cx, cy, r0, r1, a, a + da), fill: DONUT_CAT[`${it.p.g}, ${it.p.c}`], 'fill-opacity': 0.78, stroke: '#fff', 'stroke-width': 1.5 }, root);
      bindTip(path, `<b>${it.p.g}, ${it.p.c}, ${it.p.p}</b><br>${label}: ${fmt(it.v)} ${unit}<br>Share: ${fmt(share)}%`);
      if (share >= 1) {
        const mid = a + da / 2;
        labels.push({ s: Math.sin(mid), c: -Math.cos(mid), share, name: it.p.p });
      }
      a += da;
    });

    // place labels per side, pushed apart vertically so small slices don't collide
    [1, -1].forEach((side) => {
      const ls = labels.filter((l) => (l.s >= 0 ? 1 : -1) === side)
        .map((l) => Object.assign(l, { y: cy + (r1 + 16) * l.c }))
        .sort((p, q) => p.y - q.y);
      for (let i = 1; i < ls.length; i++) ls[i].y = Math.max(ls[i].y, ls[i - 1].y + 22);
      const over = ls.length ? ls[ls.length - 1].y - (H - 14) : 0;
      if (over > 0) ls.forEach((l) => (l.y -= over));
      for (let i = ls.length - 2; i >= 0; i--) ls[i].y = Math.min(ls[i].y, ls[i + 1].y - 22);
      ls.forEach((l) => {
        const ex = cx + r1 * l.s, ey = cy + r1 * l.c;
        const lx = cx + side * (r1 + 22);
        svg('polyline', { points: `${ex},${ey} ${cx + (r1 + 10) * l.s},${l.y} ${lx},${l.y}`, fill: 'none', stroke: '#999' }, root);
        const anchor = side > 0 ? 'start' : 'end', tx = lx + side * 3;
        text(root, tx, l.y - 1, `${fmt(l.share)}%`, { class: 'val-label', 'text-anchor': anchor, style: 'font-weight:600' });
        text(root, tx, l.y + 9, l.name, { class: 'val-label', 'text-anchor': anchor });
      });
    });
  }

  function renderShareTable(products) {
    const t = $('share-table');
    const tot = (m) => products.reduce((a, p) => a + (p.months[LAST] ? p.months[LAST][m] : 0), 0);
    const tOsp = tot('osp') || 1, tAmt = tot('amt') || 1;
    const pct = (p, m) => fmt((p.months[LAST] ? p.months[LAST][m] : 0) / (m === 'osp' ? tOsp : tAmt) * 100);
    let html = '<thead><tr><th>Product</th><th>OSP</th><th>90+</th><th>%NPF</th></tr></thead><tbody>';
    aggregate(products, (p) => `${p.g}, ${p.c}`).forEach((c) => {
      const v = c.months[LAST];
      html += `<tr class="grp"><td><i style="background:${DONUT_CAT[c.name]}"></i>${c.name}</td><td>${pct(c, 'osp')}</td><td>${pct(c, 'amt')}</td><td>${v ? fmt(v.npf) + '%' : '–'}</td></tr>`;
      products.filter((p) => `${p.g}, ${p.c}` === c.name).forEach((p) => {
        const pv = p.months[LAST];
        html += `<tr><td>&nbsp;&nbsp;${p.p}</td><td>${pct(p, 'osp')}</td><td>${pct(p, 'amt')}</td><td style="color:${pv && pv.npf > OJK ? '#8d2a14' : 'inherit'}">${pv ? fmt(pv.npf) + '%' : '–'}</td></tr>`;
      });
    });
    t.innerHTML = html + '</tbody>';
  }

  // ================================================================ performance bars
  let perfSort = 'amt';
  function renderPerf() {
    const host = $('perf');
    const latest = LAST - 1; // named collectors' latest complete month
    const data = fcRows.filter((r) => r.months[latest]).map((r) => Object.assign({ name: r.name }, r.months[latest]));
    data.sort((a, b) => b[perfSort] - a[perfSort]);
    const maxAmt = Math.max(...data.map((d) => d.amt)) || 1;
    const maxOsp = Math.max(...data.map((d) => d.osp)) || 1;
    const maxNpf = Math.max(...data.map((d) => d.npf), OJK);
    host.innerHTML = `<div class="perf-row head"><span>FC EmployeeName</span><span>Amount 90+ (mio)</span><span>OSP (mio)</span><span>%NPF</span></div>`;
    data.forEach((d) => {
      const row = document.createElement('div');
      row.className = 'perf-row';
      row.innerHTML = `
        <span class="perf-name" title="${d.name}">${d.name}</span>
        <div class="bar-wrap"><div class="bar" style="width:${d.amt / maxAmt * 100}%;background:var(--red)"></div><span class="bar-val">${fmt(d.amt)}</span></div>
        <div class="bar-wrap"><div class="bar" style="width:${d.osp / maxOsp * 100}%;background:var(--green)"></div><span class="bar-val">${fmt(d.osp)}</span></div>
        <div class="bar-wrap"><div class="bar" style="width:${d.npf / maxNpf * 100}%;background:${heat(d.npf)}"></div><span class="bar-val">${fmt(d.npf)}%</span></div>`;
      host.appendChild(row);
    });
  }

  // ================================================================ filters
  const F = {
    region: $('f-region'), cg: $('f-cg'), branch: $('f-branch'),
    group: $('f-group'), cat: $('f-cat'), product: $('f-product'), supplier: $('f-supplier')
  };
  function fillSelect(sel, values) {
    const cur = sel.value;
    sel.innerHTML = '<option value="">(All)</option>' + values.map((v) => `<option>${v}</option>`).join('');
    sel.value = values.includes(cur) ? cur : '';
  }
  const uniq = (a) => [...new Set(a)];

  function cascadeProductFilters() {
    fillSelect(F.cat, uniq(PRODUCTS.filter((p) => !F.group.value || p.g === F.group.value).map((p) => p.c)));
    fillSelect(F.product, uniq(PRODUCTS.filter((p) => (!F.group.value || p.g === F.group.value) && (!F.cat.value || p.c === F.cat.value)).map((p) => p.p)).sort());
  }

  function filteredProducts() {
    return PRODUCTS.filter((p) =>
      (!F.group.value || p.g === F.group.value) &&
      (!F.cat.value || p.c === F.cat.value) &&
      (!F.product.value || p.p === F.product.value));
  }

  function renderFilterBar() {
    const bar = $('filterbar');
    const labels = { region: 'Collection Region', cg: 'Collection Group', branch: 'Collection Branch', group: 'Group Product', cat: 'Cat Product', product: 'Product', supplier: 'Supplier Name' };
    const active = Object.keys(F).filter((k) => F[k].value);
    bar.hidden = !active.length;
    bar.innerHTML = 'Active filters:' + active.map((k) => ` <span class="fchip">${labels[k]}: ${F[k].value}</span>`).join('') +
      '<span class="note">Summary shows the whole portfolio. Sample data: Collection Group, Branch and Supplier filters are display only.</span>';
  }

  // ================================================================ view renderers
  function renderRegionView() {
    const rows = regionRows.filter((r) => !F.region.value || r.name === F.region.value);
    renderLineChart($('region-chart'), $('region-legend'),
      rows.map((r) => ({ name: r.name, color: TAB20[REGION_NAMES.indexOf(r.name) % TAB20.length], vals: REGION_NPF[r.name] })),
      { legendTitle: 'Nama Regional', labelOver: 12 });
    renderHeatTable($('region-table'), rows, { unit: 'bio', heads: ['Nama Regional'], maxCols: 5 });
  }

  function renderProductView() {
    const prods = filteredProducts();
    renderDonut($('donut-osp'), prods, 'osp');
    renderDonut($('donut-amt'), prods, 'amt');
    renderShareTable(prods);

    const cats = aggregate(prods, (p) => `${p.g}|${p.c}`, (p) => ({ group: p.g, label: p.c, cat: p.c }));
    renderLineChart($('cat-chart'), $('cat-legend'),
      cats.map((c) => ({ name: c.cat, color: CAT_COLORS[c.cat], vals: c.months.map((v) => (v ? +v.npf.toFixed(1) : null)) })),
      { legendTitle: 'Cat Product', bottom: true, height: 380 });
    renderHeatTable($('cat-table'), cats, { unit: 'bio', heads: ['Group Product', 'Cat Product'], maxCols: 7 });

    const prodRows = aggregate(prods, (p) => p.p).sort((a, b) => a.name.localeCompare(b.name));
    renderLineChart($('prod-chart'), $('prod-legend'),
      prodRows.map((r) => ({ name: r.name, color: PROD_COLORS[r.name], vals: r.months.map((v) => (v ? +v.npf.toFixed(1) : null)) })),
      { legendTitle: 'Product', bottom: true, height: 380 });
    renderHeatTable($('prod-table'), prodRows, { unit: 'bio', heads: ['Product'], maxCols: 8 });
  }

  // ================================================================ navigation
  const VIEWS = ['region', 'product'];
  function showView(view) {
    if (!VIEWS.includes(view)) view = 'region';
    document.querySelectorAll('main [data-view]').forEach((el) => { el.hidden = el.dataset.view !== view; });
    document.querySelectorAll('.nav-btn[data-view]').forEach((b) => {
      const on = b.dataset.view === view;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on);
    });
    try { history.replaceState(null, '', '#' + view); } catch (e) { /* sandboxed frame */ }
  }

  // ================================================================ init
  renderKpis();
  const summaryRow = [{
    name: 'Total',
    months: SUMMARY.osp.map((osp, i) => ({ osp, amt: SUMMARY.amt[i], npf: SUMMARY.amt[i] / osp * 100 }))
  }];
  renderHeatTable($('summary-table'), summaryRow, { unit: 'bio', heads: [], deltas: true });
  renderCombo();

  fillSelect(F.region, REGION_NAMES);
  fillSelect(F.cg, GROUP_NAMES);
  fillSelect(F.branch, BRANCH_NAMES);
  fillSelect(F.group, uniq(PRODUCTS.map((p) => p.g)));
  fillSelect(F.supplier, SUPPLIERS);
  cascadeProductFilters();

  renderRegionView();
  renderHeatTable($('group-table'), groupRows, { unit: 'bio', heads: ['Nama CG'], maxCols: 5 });
  renderHeatTable($('branch-table'), branchRows, { unit: 'mio', heads: ['Nama Branch'], maxCols: 5 });
  renderHeatTable($('fc-table'), fcRows, { unit: 'mio', heads: ['FC EmployeeName'] });
  renderStack($('fc-stack'), $('fc-legend'), fcRows, { legendTitle: 'FC EmployeeName', tail: 40 });
  renderPerf();

  renderProductView();
  renderHeatTable($('brand-table'), brandRows, { unit: 'mio', heads: ['Asset Brand Cat Product'], maxCols: 6 });
  renderStack($('brand-stack'), $('brand-legend'), brandRows, { legendTitle: 'Asset Brand Cat Product', tail: 12, width: 520 });
  renderHeatTable($('merk-table'), merkRows, { unit: 'mio', heads: ['Asset Merk'], maxCols: 6 });
  renderStack($('merk-stack'), $('merk-legend'), merkRows, { legendTitle: 'Asset Merk', tail: 40, width: 520 });

  F.region.addEventListener('change', () => { renderRegionView(); renderFilterBar(); });
  [F.group, F.cat, F.product].forEach((sel) => sel.addEventListener('change', () => {
    cascadeProductFilters(); renderProductView(); renderFilterBar();
  }));
  [F.cg, F.branch, F.supplier].forEach((sel) => sel.addEventListener('change', renderFilterBar));
  $('filters').addEventListener('reset', () => setTimeout(() => {
    cascadeProductFilters(); renderRegionView(); renderProductView(); renderFilterBar();
  }));

  document.querySelectorAll('.perf-sort button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.perf-sort button').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    perfSort = b.dataset.sort;
    renderPerf();
  }));

  document.querySelectorAll('.nav-btn[data-view]').forEach((b) =>
    b.addEventListener('click', () => { showView(b.dataset.view); window.scrollTo({ top: 0 }); }));
  showView(location.hash.slice(1));
  window.scrollTo(0, 0);
})();
