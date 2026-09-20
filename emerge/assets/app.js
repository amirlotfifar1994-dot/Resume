
(function(){
  const $ = (sel, el=document) => el.querySelector(sel);
  const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

  // Theme
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('emerge_theme', theme);
    const btn = $('#themeToggle');
    if(btn) btn.textContent = theme === 'light' ? 'Dark' : 'Light';
  }
  function initTheme(){
    const saved = localStorage.getItem('emerge_theme');
    const theme = saved || 'dark';
    applyTheme(theme);
    const btn = $('#themeToggle');
    if(btn){
      btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'dark';
        applyTheme(cur === 'dark' ? 'light' : 'dark');
      });
    }
  }

  // Helpers
  function niceTicks(min, max, count){
    if(!isFinite(min) || !isFinite(max) || min === max){
      return [min];
    }
    const span = max - min;
    const step0 = span / Math.max(1, count-1);
    const mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const norm = step0 / mag;
    let step;
    if(norm < 1.5) step = 1 * mag;
    else if(norm < 3) step = 2 * mag;
    else if(norm < 7) step = 5 * mag;
    else step = 10 * mag;
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks = [];
    for(let v = start; v <= end + 0.5*step; v += step) ticks.push(v);
    return ticks;
  }

  function fmt(v){
    if(v === null || v === undefined || !isFinite(v)) return '–';
    const av = Math.abs(v);
    if(av !== 0 && (av < 0.001 || av >= 10000)) return v.toExponential(2);
    if(av >= 100) return v.toFixed(1);
    if(av >= 10) return v.toFixed(2);
    return v.toFixed(3);
  }


  // Canvas point chart (hover is ALWAYS active: move anywhere to get values)
  // - Uses ResizeObserver safely (no infinite growth)
  // - Tooltip shows values for ALL series at the closest x-position
  class ScatterChart{
    constructor(container, series, opts={}){
      this.container = container;
      this.series = series;
      this.opts = Object.assign({
        xLabel: '',
        yLabel: '',
        yLog: false,
        pointRadius: 2.2,
        highlightRadius: 4.4,
        padding: {l:44, r:14, t:16, b:34},
      }, opts);

      this.wrap = document.createElement('div');
      this.wrap.className = 'chart-wrap';

      // Responsive height: respect data-height on desktop, cap on small screens
      const hAttr = this.container.getAttribute('data-height');
      const baseH = hAttr ? Number(String(hAttr).trim()) : 300;
      const isSmall = window.matchMedia && window.matchMedia('(max-width: 520px)').matches;
      const h = isSmall ? Math.min(baseH, 260) : baseH;
      this.wrap.style.height = (isFinite(h) ? h : 300) + 'px';

      this.canvas = document.createElement('canvas');
      this.canvas.className = 'chart-canvas';
      this.canvas.style.touchAction = 'none';

      this.tooltip = document.createElement('div');
      this.tooltip.className = 'tooltip';

      this.wrap.appendChild(this.canvas);
      this.wrap.appendChild(this.tooltip);
      this.container.innerHTML = '';
      this.container.appendChild(this.wrap);

      this.ctx = this.canvas.getContext('2d', {alpha:true});

      this._pxSeries = []; // [{name, color, points:[{x,y,px,py,i}]}]
      this._hover = null;   // {x, px, items:[{name,color,x,y,px,py}]}

      this._w = 0; this._h = 0; this._dpr = 1;

      this.resizeObs = new ResizeObserver(() => this.resize());
      this.resizeObs.observe(this.wrap);

      const move = (e) => this.onMove(e);
      const leave = () => this.onLeave();

      this.canvas.addEventListener('pointermove', move, {passive:true});
      this.canvas.addEventListener('pointerdown', move, {passive:true});
      this.canvas.addEventListener('pointerleave', leave);
      this.canvas.addEventListener('mouseleave', leave);

      this.resize();
    }

    destroy(){
      this.resizeObs.disconnect();
    }

    computeRanges(){
      let xmin=Infinity, xmax=-Infinity, ymin=Infinity, ymax=-Infinity;
      for(const s of this.series){
        for(let i=0;i<s.x.length;i++){
          const x = s.x[i], y = s.y[i];
          if(!isFinite(x) || !isFinite(y)) continue;
          xmin = Math.min(xmin, x); xmax = Math.max(xmax, x);
          if(this.opts.yLog){
            if(y <= 0) continue;
            ymin = Math.min(ymin, y); ymax = Math.max(ymax, y);
          }else{
            ymin = Math.min(ymin, y); ymax = Math.max(ymax, y);
          }
        }
      }
      if(!isFinite(xmin)){
        xmin=0; xmax=1; ymin=0; ymax=1;
      }

      const xpad = (xmax-xmin) * 0.04 || 1;
      xmin -= xpad; xmax += xpad;

      if(this.opts.yLog){
        ymin = Math.max(ymin * 0.85, 1e-12);
        ymax = ymax * 1.15;
      }else{
        const ypad = (ymax-ymin) * 0.08 || 1;
        ymin -= ypad; ymax += ypad;
      }
      return {xmin,xmax,ymin,ymax};
    }

    resize(){
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(10, Math.floor(this.wrap.clientWidth || this.wrap.getBoundingClientRect().width));
      const h = Math.max(10, Math.floor(this.wrap.clientHeight || this.wrap.getBoundingClientRect().height));

      // Guard: prevent resize loops causing runaway growth
      if(w === this._w && h === this._h && dpr === this._dpr) return;
      this._w = w; this._h = h; this._dpr = dpr;

      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.ctx.setTransform(dpr,0,0,dpr,0,0);

      this.draw();
    }

    scales(){
      const {l,r,t,b} = this.opts.padding;
      const W = this._w || this.wrap.clientWidth || this.wrap.getBoundingClientRect().width;
      const H = this._h || this.wrap.clientHeight || this.wrap.getBoundingClientRect().height;
      const plotW = Math.max(1, W - l - r);
      const plotH = Math.max(1, H - t - b);
      const ranges = this.computeRanges();

      const xToPx = (x) => l + (x - ranges.xmin) / (ranges.xmax - ranges.xmin) * plotW;
      const pxToX = (px) => ranges.xmin + (px - l) / plotW * (ranges.xmax - ranges.xmin);

      let yToPx, pxToY;
      if(this.opts.yLog){
        const logMin = Math.log10(ranges.ymin);
        const logMax = Math.log10(ranges.ymax);
        yToPx = (y) => {
          const v = Math.log10(Math.max(y, ranges.ymin));
          return t + (logMax - v) / (logMax - logMin) * plotH;
        };
        pxToY = (py) => {
          const v = logMax - (py - t) / plotH * (logMax - logMin);
          return Math.pow(10, v);
        };
      }else{
        yToPx = (y) => t + (ranges.ymax - y) / (ranges.ymax - ranges.ymin) * plotH;
        pxToY = (py) => ranges.ymax - (py - t) / plotH * (ranges.ymax - ranges.ymin);
      }

      return {W,H,plotW,plotH,ranges,xToPx,yToPx,pxToX,pxToY};
    }

    rebuildPixelCache(sc){
      this._pxSeries = [];
      for(const s of this.series){
        const pts=[];
        for(let i=0;i<s.x.length;i++){
          const x=s.x[i], y=s.y[i];
          if(!isFinite(x) || !isFinite(y)) continue;
          if(this.opts.yLog && y<=0) continue;
          const px=sc.xToPx(x);
          const py=sc.yToPx(y);
          pts.push({x,y,px,py,i});
        }
        this._pxSeries.push({name:s.name, color:s.color, points:pts});
      }
    }

    // points must be sorted by x for binary search (true for our exported sims)
    nearestByX(points, xVal){
      const n = points.length;
      if(n === 0) return null;
      if(n === 1) return points[0];

      let lo=0, hi=n-1;
      while(lo <= hi){
        const mid = (lo+hi) >> 1;
        const x = points[mid].x;
        if(x === xVal) return points[mid];
        if(x < xVal) lo = mid + 1;
        else hi = mid - 1;
      }
      // lo is insertion point
      const i1 = Math.min(n-1, Math.max(0, lo));
      const i0 = Math.min(n-1, Math.max(0, lo-1));
      const p0 = points[i0], p1 = points[i1];
      return (Math.abs(p0.x - xVal) <= Math.abs(p1.x - xVal)) ? p0 : p1;
    }

    draw(){
      const ctx=this.ctx;
      const sc=this.scales();
      this._sc = sc;
      this.rebuildPixelCache(sc);

      ctx.clearRect(0,0,sc.W,sc.H);

      // Background grid
      const {l,r,t,b}=this.opts.padding;
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1;

      const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || 'rgba(255,255,255,.08)';
      ctx.strokeStyle = gridColor;

      const xTicks = niceTicks(sc.ranges.xmin, sc.ranges.xmax, 6);
      const yTicks = this.opts.yLog
        ? niceTicks(Math.log10(sc.ranges.ymin), Math.log10(sc.ranges.ymax), 6).map(v => Math.pow(10,v))
        : niceTicks(sc.ranges.ymin, sc.ranges.ymax, 6);

      // grid lines
      ctx.beginPath();
      for(const xv of xTicks){
        const x = sc.xToPx(xv);
        ctx.moveTo(x, t);
        ctx.lineTo(x, sc.H - b);
      }
      for(const yv of yTicks){
        const y = sc.yToPx(yv);
        ctx.moveTo(l, y);
        ctx.lineTo(sc.W - r, y);
      }
      ctx.stroke();

      // axes
      ctx.strokeStyle = 'rgba(245,158,11,.35)';
      ctx.beginPath();
      ctx.moveTo(l, t);
      ctx.lineTo(l, sc.H - b);
      ctx.lineTo(sc.W - r, sc.H - b);
      ctx.stroke();

      // labels
      const textColor = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || 'rgba(229,231,235,.72)';
      ctx.fillStyle = textColor;
      ctx.font = '12px ' + (getComputedStyle(document.body).fontFamily || 'sans-serif');

      // x tick labels
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for(const xv of xTicks){
        const x = sc.xToPx(xv);
        ctx.fillText(fmt(xv), x, sc.H - b + 6);
      }
      // y tick labels
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for(const yv of yTicks){
        const y = sc.yToPx(yv);
        ctx.fillText(fmt(yv), l - 8, y);
      }

      // axis titles
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      if(this.opts.yLabel){
        ctx.save();
        ctx.translate(14, sc.H/2);
        ctx.rotate(-Math.PI/2);
        ctx.fillText(this.opts.yLabel, 0, 0);
        ctx.restore();
      }
      if(this.opts.xLabel){
        ctx.textAlign = 'center';
        ctx.fillText(this.opts.xLabel, (l + sc.W - r)/2, sc.H - 18);
      }

      ctx.restore();

      // points
      for(const s of this._pxSeries){
        ctx.fillStyle = s.color;
        for(const p of s.points){
          ctx.beginPath();
          ctx.arc(p.px, p.py, this.opts.pointRadius, 0, Math.PI*2);
          ctx.fill();
        }
      }

      // hover overlay
      if(this._hover){
        const {px, items} = this._hover;
        ctx.save();
        ctx.strokeStyle = 'rgba(245,158,11,.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4,4]);
        ctx.beginPath();
        ctx.moveTo(px, t);
        ctx.lineTo(px, sc.H - b);
        ctx.stroke();
        ctx.setLineDash([]);

        for(const it of items){
          ctx.fillStyle = it.color;
          ctx.beginPath();
          ctx.arc(it.px, it.py, this.opts.highlightRadius, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    onMove(e){
      if(!this._sc) return;
      const rect = this.canvas.getBoundingClientRect();
      const mx = (e.clientX ?? 0) - rect.left;
      const my = (e.clientY ?? 0) - rect.top;

      // Only react if pointer is within the canvas bounds
      if(mx < 0 || my < 0 || mx > rect.width || my > rect.height){
        this.onLeave();
        return;
      }

      const sc = this._sc;
      const {l,r,t,b}=this.opts.padding;

      // Clamp x within plot region for stable readout
      const xPx = Math.min(Math.max(mx, l), sc.W - r);
      const xVal = sc.pxToX(xPx);

      const items = [];
      for(const s of this._pxSeries){
        const p = this.nearestByX(s.points, xVal);
        if(!p) continue;
        items.push({
          name: s.name,
          color: s.color,
          x: p.x,
          y: p.y,
          px: p.px,
          py: p.py,
        });
      }

      if(items.length === 0){
        this.onLeave();
        return;
      }

      // Use the first series' x for the vertical marker (keeps it consistent)
      const baseX = items[0].x;
      const basePx = sc.xToPx(baseX);
      this._hover = {x: baseX, px: basePx, items};

      // Tooltip content
      const rows = items.map(it => (
        `<div style="display:flex;align-items:center;gap:8px">
          <span style="width:10px;height:10px;border-radius:999px;background:${it.color};display:inline-block"></span>
          <span style="opacity:.9">${it.name}:</span>
          <span style="font-weight:700">${fmt(it.y)}</span>
        </div>`
      )).join('');

      this.tooltip.style.opacity = '1';
      this.tooltip.innerHTML = `
        <div style="font-weight:800;margin-bottom:6px">x: ${fmt(baseX)}</div>
        ${rows}
      `;

      // Position tooltip near pointer but keep inside chart
      const pad = 12;
      const tw = this.tooltip.offsetWidth || 160;
      const th = this.tooltip.offsetHeight || 80;
      let tx = mx + 12;
      let ty = my - 12;
      const W = sc.W, H = sc.H;
      if(tx + tw + pad > W) tx = mx - tw - 16;
      if(ty - th < 0) ty = my + 16;
      this.tooltip.style.left = tx + 'px';
      this.tooltip.style.top = ty + 'px';

      this.draw();
    }

    onLeave(){
      this._hover = null;
      this.tooltip.style.opacity = '0';
      this.draw();
    }

    exportPNG(filename='chart.png'){
      const link = document.createElement('a');
      link.download = filename;
      link.href = this.canvas.toDataURL('image/png');
      link.click();
    }
  }

  const PALETTE =
 [
    '#f59e0b', // amber
    '#38bdf8', // sky
    '#a78bfa', // violet
    '#34d399', // emerald
    '#fb7185', // rose
    '#f97316', // orange
  ];

  function makeLegend(el, series){
    const leg = document.createElement('div');
    leg.className = 'legend';
    series.forEach((s, i) => {
      const item = document.createElement('div');
      item.className = 'item';
      const sw = document.createElement('span');
      sw.className = 'swatch';
      sw.style.background = s.color;
      item.appendChild(sw);
      const tx = document.createElement('span');
      tx.textContent = s.name;
      item.appendChild(tx);
      leg.appendChild(item);
    });
    el.appendChild(leg);
  }

  function renderTable(container, df){
    const table = document.createElement('table');
    table.className = 'table';
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    df.columns.forEach(c => {
      const th = document.createElement('th');
      th.textContent = c;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    df.rows.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(v => {
        const td = document.createElement('td');
        td.textContent = (typeof v === 'number') ? fmt(v) : String(v);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
  }

  function initCharts(){
    const D = window.EMERGE_DATA;
    if(!D){
      console.error('EMERGE_DATA not found');
      return;
    }

    // Summary pills
    const meta = D.meta;
    const pill = $('#metaPill');
    if(pill){
      const tPeak = meta.t_peak_h && meta.t_peak_h[0];
      const dur = meta.duration_h && meta.duration_h[0];
      const dt = meta.dt_h && meta.dt_h[0];
      pill.textContent = `t_peak=${fmt(tPeak)}h · dt=${fmt(dt)}h · duration=${fmt(dur)}h`;
    }

    // Routine
    const rt = D.routine.time_s;
    const routineInputs = [
      {name:'E (Input)', x:rt, y:D.routine.E, color:PALETTE[0]},
      {name:'C (Context)', x:rt, y:D.routine.C, color:PALETTE[1]},
    ];
    const routineMeaning = [
      {name:'M_r (Meaning)', x:rt, y:D.routine.M_r, color:PALETTE[0]},
      {name:'Psi', x:rt, y:D.routine.Psi, color:PALETTE[2]},
    ];
    const routineEntropy = [
      {name:'H_e', x:rt, y:D.routine.H_e, color:PALETTE[3]},
      {name:'H_c', x:rt, y:D.routine.H_c, color:PALETTE[4]},
    ];

    // Transformative
    const th = D.transform.time_h;
    const transformDrug = [
      {name:'D (Drug level)', x:th, y:D.transform.D, color:PALETTE[0]},
    ];
    const transformMeaning = [
      {name:'M_t (Transform)', x:th, y:D.transform.M_t, color:PALETTE[1]},
    ];
    const transformEntropy = [
      {name:'H_e', x:th, y:D.transform.H_e, color:PALETTE[3]},
      {name:'E', x:th, y:D.transform.E, color:PALETTE[0]},
      {name:'C', x:th, y:D.transform.C, color:PALETTE[2]},
    ];

    // Cultural: show outcomes vs psi0 (2 points but still interactive)
    const cx = D.culture.psi0;
    const culturalSeries = [
      {name:'M_r_final', x:cx, y:D.culture.M_r_final, color:PALETTE[0]},
      {name:'H_e_final', x:cx, y:D.culture.H_e_final, color:PALETTE[3]},
      {name:'time_to_M>0.35 (s)', x:cx, y:D.culture.time_to_M_gt_0p35_s, color:PALETTE[1]},
    ];

    // Sensitivity
    const ax = D.sensitivity.alpha_E;
    const sensMeaning = [
      {name:'M_r_final', x:ax, y:D.sensitivity.M_r_final, color:PALETTE[0]},
    ];
    const sensTime = [
      {name:'time_to_M>0.40 (s)', x:ax, y:D.sensitivity.time_to_M_gt_0p40_s, color:PALETTE[1]},
    ];
    const sensEntropy = [
      {name:'H_e_final', x:ax, y:D.sensitivity.H_e_final, color:PALETTE[3]},
    ];

    const charts = [];

    function mount(id, series, opts){
      const el = document.getElementById(id);
      if(!el) return;
      const chart = new ScatterChart(el, series, opts);
      charts.push({id, chart});
      makeLegend(el.parentElement, series);
      // export button if exists
      const btn = el.parentElement.querySelector('[data-export]');
      if(btn){
        btn.addEventListener('click', () => chart.exportPNG(id + '.png'));
      }
    }

    mount('routine-inputs-chart', routineInputs, {xLabel:'time (s)', yLabel:'value', yLog:false});
    mount('routine-meaning-chart', routineMeaning, {xLabel:'time (s)', yLabel:'value', yLog:false});
    mount('routine-entropy-chart', routineEntropy, {xLabel:'time (s)', yLabel:'entropy', yLog:false});

    mount('transform-meaning-chart', transformMeaning, {xLabel:'time (h)', yLabel:'value', yLog:false});
    // drug is often better log-scaled
    mount('transform-drug-chart', transformDrug, {xLabel:'time (h)', yLabel:'D', yLog:true});
    mount('transform-entropy-chart', transformEntropy, {xLabel:'time (h)', yLabel:'value', yLog:false});

    mount('cultural-chart', culturalSeries, {xLabel:'psi0', yLabel:'outcome', yLog:false});

    mount('sens-meaning-chart', sensMeaning, {xLabel:'alpha_E', yLabel:'M_r_final', yLog:false});
    mount('sens-time-chart', sensTime, {xLabel:'alpha_E', yLabel:'time (s)', yLog:false});
    mount('sens-entropy-chart', sensEntropy, {xLabel:'alpha_E', yLabel:'H_e_final', yLog:false});

    // Tables
    const cultureTbl = $('#cultureTable');
    if(cultureTbl){
      renderTable(cultureTbl, {columns:Object.keys(D.culture), rows: [0,1].map(i => Object.keys(D.culture).map(c => D.culture[c][i]))});
    }
    const sensTbl = $('#sensTable');
    if(sensTbl){
      const n = D.sensitivity.alpha_E.length;
      renderTable(sensTbl, {columns:Object.keys(D.sensitivity), rows: Array.from({length:n}, (_,i)=>Object.keys(D.sensitivity).map(c=>D.sensitivity[c][i]))});
    }

    // global export all (optional)
    const exportAll = $('#exportAll');
    if(exportAll){
      exportAll.addEventListener('click', () => {
        charts.forEach(({id, chart}) => chart.exportPNG(id + '.png'));
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCharts();
  });
})();
