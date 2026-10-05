/* NPF Trend Analysis dashboard — renders all tables and SVG charts from sample data. */
(function () {
  'use strict';

  // ---------------------------------------------------------------- data
  const MONTHS = [
    { y: 2025, m: 'October' }, { y: 2025, m: 'November' }, { y: 2025, m: 'December' },
    { y: 2026, m: 'January' }, { y: 2026, m: 'February' }, { y: 2026, m: 'March' },
    { y: 2026, m: 'April' }, { y: 2026, m: 'May' }, { y: 2026, m: 'June' },
    { y: 2026, m: 'July' }, { y: 2026, m: 'August' }
  ];

  const SUMMARY = {
    osp: [4089, 3904, 3767, 3571, 3392, 3213, 3049, 2880, 2715, 2548, 2399],
    amt: [254, 244, 300, 292, 287, 275, 276, 266, 254, 239, 227]
  };

  // deterministic pseudo-random so the page renders identically every load
  let seed = 42;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const between = (a, b) => a + rand() * (b - a);

  const REGION_NAMES = [
    '-', 'COLLECTION I', 'COLLECTION II', 'COLLECTION III', 'COLLECTION IV',
    'COLLECTION IX', 'COLLECTION V', 'COLLECTION VI', 'COLLECTION VII',
    'COLLECTION VIII', 'HEAD OFFICE', 'REGIONAL III - FL'
  ];
  const REGION_COLORS = [
    '#4e79a7', '#a0cbe8', '#f28e2b', '#ffbe7d', '#59a14f', '#8cd17d',
    '#b6992d', '#f1ce63', '#499894', '#86bcb6', '#e15759', '#ff9d9a'
  ];
  // %NPF per region per month (null = no data)
  const REGION_NPF = {
    '-': [32.9, 39.5, 41.9, 48.7, 62.8, 72.1, 29.1, 100, 100, 100, null],
    'REGIONAL III - FL': [null, 4.8, 75.3, 78.2, 80.0, 81.6, 83.5, 85.0, 87.1, 89.6, 90.6],
    'COLLECTION IX': [50.7, 56.3, 52.0, 47.5, 43.0, 38.5, 34.0, 29.0, 24.0, 18.0, 10.5],
    'COLLECTION III': [12.7, 12.5, 12.4, 12.4, 12.2, 12.1, 12.3, 13.0, 13.1, 12.4, 12.5],
    'HEAD OFFICE': [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, null, null]
  };
  REGION_NAMES.forEach((n, i) => {
    if (!REGION_NPF[n]) {
      const base = between(3, 9);
      REGION_NPF[n] = MONTHS.map((_, k) => +(base + k * 0.18 + between(-0.4, 0.4)).toFixed(1));
    }
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

  // Build a monthly series of {npf, amt, osp} rows for a list of names.
  function buildRows(names, ospRange, opts = {}) {
    return names.map((name, i) => {
      const osp0 = between(ospRange[0], ospRange[1]);
      const npf0 = opts.npf ? opts.npf(name, i) : between(0.5, 18);
      const months = MONTHS.map((_, k) => {
        if (opts.gap && opts.gap(name, k)) return null;
        const osp = osp0 * (1 - k * 0.035) * between(0.97, 1.03);
        const npf = Math.min(100, Math.max(0, npf0 + between(-1.2, 1.4) + k * 0.15));
        return { npf, amt: osp * npf / 100, osp };
      });
      return { name, months };
    });
  }

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
    npf: (n) => /Kevin|Made/.test(n) ? 0 : /Hasbullah/.test(n) ? 40 : between(0, 20),
    gap: (n, k) => (n === 'Null' && k < 10) || (n.includes('Ahmad') && k !== 7) ||
      (n !== 'Null' && !n.includes('Ahmad') && k === 10)
  });

  // ---------------------------------------------------------------- helpers
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);
  const fmt = (v, d = 1) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

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
    const t = Math.min(npf, 5) / 5;
    const [a, b, f] = t < 0.5 ? [stops[0], stops[1], t * 2] : [stops[1], stops[2], (t - 0.5) * 2];
    return `rgb(${a.map((c, i) => Math.round(c + (b[i] - c) * f)).join(',')})`;
  }

  // Tooltip
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

  // ---------------------------------------------------------------- heat tables
  // Columns are shown latest month first, grouped by year, like the source workbook.
  function renderHeatTable(table, rows, { unit, maxCols = MONTHS.length, rowHead = true, deltas = false }) {
    const idx = MONTHS.map((_, i) => i).reverse().slice(0, maxCols);
    const thead = document.createElement('thead');
    const yearRow = document.createElement('tr');
    const monRow = document.createElement('tr');
    if (rowHead) {
      const th = document.createElement('th');
      th.className = 'row-head'; th.rowSpan = 2;
      th.textContent = rowHead === true ? 'Name' : rowHead;
      yearRow.appendChild(th);
    }
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
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      if (rowHead) {
        const th = document.createElement('th');
        th.className = 'row-head'; th.textContent = row.name;
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
        bindTip(td, `<b>${row.name}</b><br>${MONTHS[i].m} ${MONTHS[i].y}<br>%NPF: ${fmt(v.npf)}%<br>Amount 90+: ${fmt(v.amt)} ${unit}<br>OSP: ${fmt(v.osp)} ${unit}`);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.append(thead, tbody);
  }

  // ---------------------------------------------------------------- combo chart (bars OSP + line 90+)
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
    const yL = (v) => m.t + ih - (v / 4500) * ih;        // OSP axis
    const yR = (v) => m.t + ih - (v / 330) * ih;         // 90+ axis
    const xc = (i) => m.l + step * (i + 0.5);

    const grid = svg('g', { class: 'grid' }, root);
    const axis = svg('g', { class: 'axis' }, root);
    [0, 1000, 2000, 3000, 4000].forEach((v) => {
      svg('line', { x1: m.l, x2: W - m.r, y1: yL(v), y2: yL(v) }, grid);
      text(axis, m.l - 6, yL(v) + 3, `${fmt(v, 0)} bio`, { 'text-anchor': 'end' });
    });
    [0, 50, 100, 150, 200, 250, 300].forEach((v) =>
      text(axis, W - m.r + 6, yR(v) + 3, `${v} bio`));
    text(axis, 16, m.t + ih / 2, 'OSP', { transform: `rotate(-90 16 ${m.t + ih / 2})`, 'text-anchor': 'middle' });
    text(axis, W - 10, m.t + ih / 2, '90+', { transform: `rotate(90 ${W - 10} ${m.t + ih / 2})`, 'text-anchor': 'middle' });
    svg('line', { x1: m.l, x2: m.l, y1: m.t, y2: m.t + ih, stroke: '#ccc' }, root);
    svg('line', { x1: W - m.r, x2: W - m.r, y1: m.t, y2: m.t + ih, stroke: '#ccc' }, root);

    // bars
    SUMMARY.osp.forEach((v, i) => {
      const bw = step * 0.24;
      const r = svg('rect', { x: xc(i) - bw / 2, y: yL(v), width: bw, height: yL(0) - yL(v), fill: 'var(--green)' }, root);
      bindTip(r, `<b>${MONTHS[i].m} ${MONTHS[i].y}</b><br>OSP: ${fmt(v, 0)} bio`);
      text(root, xc(i), yL(v) - 4, `${fmt(v, 0)} bio`, { class: 'val-label', 'text-anchor': 'middle' });
      text(axis, xc(i), H - m.b + 16, `${MONTHS[i].m} ${MONTHS[i].y}`, { 'text-anchor': 'middle', style: 'font-size:9px' });
    });

    // trend lines
    const tOsp = linearTrend(SUMMARY.osp), tAmt = linearTrend(SUMMARY.amt);
    svg('line', { x1: m.l, y1: yL(tOsp(-0.5)), x2: W - m.r, y2: yL(tOsp(n - 0.5)), stroke: 'var(--green)', 'stroke-dasharray': '4 3', 'stroke-width': 1.5 }, root);
    svg('line', { x1: m.l, y1: yR(tAmt(-0.5)), x2: W - m.r, y2: yR(tAmt(n - 0.5)), stroke: 'var(--red)', 'stroke-dasharray': '4 3', 'stroke-width': 1.5 }, root);

    // 90+ line
    svg('polyline', { points: SUMMARY.amt.map((v, i) => `${xc(i)},${yR(v)}`).join(' '), fill: 'none', stroke: 'var(--red)', 'stroke-width': 3 }, root);
    SUMMARY.amt.forEach((v, i) => {
      const c = svg('circle', { cx: xc(i), cy: yR(v), r: 4, fill: 'var(--red)' }, root);
      bindTip(c, `<b>${MONTHS[i].m} ${MONTHS[i].y}</b><br>Amount 90+: ${v} bio<br>%NPF: ${fmt(v / SUMMARY.osp[i] * 100)}%`);
      text(root, xc(i), yR(v) - 8, `${v} bio`, { class: 'val-label', 'text-anchor': 'middle' });
    });
  }

  // ---------------------------------------------------------------- region line chart
  function renderRegionChart() {
    const W = 1000, H = 360, m = { t: 20, r: 40, b: 36, l: 50 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const root = svg('svg', { viewBox: `0 0 ${W} ${H}` }, $('region-chart'));
    const n = MONTHS.length, step = iw / (n - 1);
    const x = (i) => m.l + step * i;
    const y = (v) => m.t + ih - (v / 105) * ih;

    // threshold bands: green under 5%, red above
    svg('rect', { x: m.l, y: y(105), width: iw, height: y(5) - y(105), fill: '#fbd3d0' }, root);
    svg('rect', { x: m.l, y: y(5), width: iw, height: y(0) - y(5) + 6, fill: '#d8f5d0' }, root);

    const axis = svg('g', { class: 'axis' }, root);
    [0, 20, 40, 60, 80, 100].forEach((v) => {
      svg('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: 'rgba(255,255,255,.7)' }, root);
      text(axis, m.l - 6, y(v) + 3, `${fmt(v)}%`, { 'text-anchor': 'end' });
    });
    text(axis, 14, m.t + ih / 2, 'NPF', { transform: `rotate(-90 14 ${m.t + ih / 2})`, 'text-anchor': 'middle' });
    MONTHS.forEach((mo, i) => text(axis, x(i), H - 12, `${mo.m} ${mo.y}`, { 'text-anchor': 'middle', style: 'font-size:9px' }));

    const legend = $('region-legend');
    const labelled = new Set(['-', 'REGIONAL III - FL', 'COLLECTION IX', 'COLLECTION III']);
    REGION_NAMES.forEach((name, ri) => {
      const color = REGION_COLORS[ri];
      const vals = REGION_NPF[name];
      const g = svg('g', { class: 'series' }, root);
      // break the line where data is missing
      let seg = [];
      const flush = () => {
        if (seg.length > 1) svg('polyline', { points: seg.join(' '), fill: 'none', stroke: color, 'stroke-width': labelled.has(name) ? 2.5 : 1.5 }, g);
        seg = [];
      };
      vals.forEach((v, i) => { if (v == null) flush(); else seg.push(`${x(i)},${y(v)}`); });
      flush();
      vals.forEach((v, i) => {
        if (v == null) return;
        const c = svg('circle', { cx: x(i), cy: y(v), r: labelled.has(name) ? 3.5 : 2, fill: color }, g);
        bindTip(c, `<b>${name}</b><br>${MONTHS[i].m} ${MONTHS[i].y}<br>%NPF: ${fmt(v)}%`);
        if (labelled.has(name) && v > 4) text(g, x(i), y(v) - 7, `${fmt(v)}%`, { class: 'val-label', 'text-anchor': 'middle' });
      });

      const item = document.createElement('div');
      item.innerHTML = `<i style="background:${color}"></i>${name}`;
      item.style.cursor = 'pointer';
      item.addEventListener('mouseenter', () => root.querySelectorAll('.series').forEach((s, k) => s.style.opacity = k === ri ? 1 : 0.15));
      item.addEventListener('mouseleave', () => root.querySelectorAll('.series').forEach((s) => s.style.opacity = 1));
      legend.appendChild(item);
    });
  }

  // ---------------------------------------------------------------- stacked 100% chart
  const FC_COLORS = ['#4e79a7', '#a0cbe8', '#f28e2b', '#ffbe7d', '#59a14f', '#8cd17d', '#b6992d',
    '#f1ce63', '#499894', '#86bcb6', '#e15759', '#ff9d9a', '#79706e', '#bab0ac', '#d37295',
    '#fabfd2', '#b07aa1', '#d4a6c8'];

  function renderStack() {
    const W = 1000, H = 380, m = { t: 26, r: 10, b: 30, l: 50 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const root = svg('svg', { viewBox: `0 0 ${W} ${H}` }, $('stack-chart'));
    const idx = MONTHS.map((_, i) => i).reverse();
    const step = iw / idx.length, bw = step * 0.72;
    const y = (p) => m.t + ih - p * ih;
    const axis = svg('g', { class: 'axis' }, root);
    [0, .2, .4, .6, .8, 1].forEach((p) => {
      svg('line', { x1: m.l, x2: W - m.r, y1: y(p), y2: y(p), stroke: '#eee' }, root);
      text(axis, m.l - 6, y(p) + 3, `${p * 100}%`, { 'text-anchor': 'end' });
    });
    text(axis, 14, m.t + ih / 2, '% of Total 90+', { transform: `rotate(-90 14 ${m.t + ih / 2})`, 'text-anchor': 'middle' });

    // a long tail of small collectors (unnamed) fills the bars like the source chart
    const tail = Array.from({ length: 40 }, () => between(0.3, 1.6));
    idx.forEach((i, c) => {
      const x0 = m.l + step * c + (step - bw) / 2;
      const parts = fcRows.map((r, k) => ({ name: r.name, color: FC_COLORS[k], v: r.months[i] ? r.months[i].amt : 0 }));
      const named = parts.reduce((a, p) => a + p.v, 0);
      if (i !== MONTHS.length - 1) {
        // the dominant collector (index 6 in palette) holds ~40% like the capture
        parts[6].v = named * 0.8;
        tail.forEach((t, k) => parts.push({ name: `Collector #${k + 1}`, color: `hsl(${(k * 47) % 360},55%,${60 + (k % 3) * 8}%)`, v: t * named / 30 }));
      }
      const total = parts.reduce((a, p) => a + p.v, 0) || 1;
      let acc = 0;
      parts.forEach((p) => {
        if (!p.v) return;
        const h = (p.v / total) * ih;
        const r = svg('rect', { x: x0, y: y(acc / total) - h, width: bw, height: h, fill: p.color, stroke: '#fff', 'stroke-width': 0.3 }, root);
        bindTip(r, `<b>${p.name}</b><br>${MONTHS[i].m} ${MONTHS[i].y}<br>Share of 90+: ${fmt(p.v / total * 100)}%`);
        if (p.v / total > 0.08) text(root, x0 + bw / 2, y(acc / total) - h / 2, `${fmt(p.v / total * 100)}%`, { class: 'val-label', 'text-anchor': 'middle', transform: `rotate(-90 ${x0 + bw / 2} ${y(acc / total) - h / 2})` });
        acc += p.v;
      });
      text(axis, x0 + bw / 2, H - 10, MONTHS[i].m, { 'text-anchor': 'middle' });
    });
    // year headers
    const y26 = idx.filter((i) => MONTHS[i].y === 2026).length;
    text(axis, m.l + step * y26 / 2, 14, '2026', { 'text-anchor': 'middle', style: 'font-weight:600' });
    text(axis, m.l + step * (y26 + (idx.length - y26) / 2), 14, '2025', { 'text-anchor': 'middle', style: 'font-weight:600' });
    svg('line', { x1: m.l + step * y26, x2: m.l + step * y26, y1: 0, y2: H - m.b, stroke: '#ccc' }, root);

    const legend = $('fc-legend');
    fcRows.forEach((r, k) => {
      const item = document.createElement('div');
      item.innerHTML = `<i style="background:${FC_COLORS[k]}"></i>${r.name}`;
      legend.appendChild(item);
    });
  }

  // ---------------------------------------------------------------- performance bars
  function renderPerf(sortKey) {
    const host = $('perf');
    const latest = MONTHS.length - 2; // July = latest complete month for named collectors
    const data = fcRows.filter((r) => r.months[latest]).map((r) => Object.assign({ name: r.name }, r.months[latest]));
    data.sort((a, b) => b[sortKey] - a[sortKey]);
    const maxAmt = Math.max(...data.map((d) => d.amt)) || 1;
    const maxOsp = Math.max(...data.map((d) => d.osp)) || 1;
    const maxNpf = Math.max(...data.map((d) => d.npf), 5);
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

  // ---------------------------------------------------------------- init
  const summaryRow = [{
    name: 'Total',
    months: SUMMARY.osp.map((osp, i) => ({ osp, amt: SUMMARY.amt[i], npf: SUMMARY.amt[i] / osp * 100 }))
  }];
  renderHeatTable($('summary-table'), summaryRow, { unit: 'bio', rowHead: false, deltas: true });
  renderCombo();
  renderRegionChart();
  renderHeatTable($('region-table'), regionRows, { unit: 'bio', rowHead: 'Nama Regional', maxCols: 5 });
  renderHeatTable($('group-table'), groupRows, { unit: 'bio', rowHead: 'Nama CG', maxCols: 5 });
  renderHeatTable($('branch-table'), branchRows, { unit: 'mio', rowHead: 'Nama Branch', maxCols: 5 });
  renderHeatTable($('fc-table'), fcRows, { unit: 'mio', rowHead: 'FC EmployeeName' });
  renderStack();
  renderPerf('amt');

  document.querySelectorAll('.perf-sort button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.perf-sort button').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    renderPerf(b.dataset.sort);
  }));

  // region filter options + nav highlight
  const sel = $('f-region');
  REGION_NAMES.forEach((n) => { const o = document.createElement('option'); o.textContent = n; sel.appendChild(o); });
  document.querySelectorAll('.nav-btn').forEach((a) => a.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach((x) => x.classList.remove('active'));
    a.classList.add('active');
  }));
})();
