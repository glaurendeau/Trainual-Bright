/* charts.js — Graphiques SVG animés
 * Line chart animé, Bar chart animé, Donut chart, Sparklines
 */
var BC = window.BC || {};

BC.Charts = {

  // ── Tooltip global ────────────────────────────────────
  _tooltip: null,

  _getTooltip: function () {
    if (!this._tooltip) {
      var el = document.createElement('div');
      el.className = 'chart-tooltip';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      document.body.appendChild(el);
      this._tooltip = el;
    }
    return this._tooltip;
  },

  _showTooltip: function (text, x, y) {
    var t = this._getTooltip();
    t.textContent = text;
    t.style.opacity = '1';
    t.style.left = (x + 14) + 'px';
    t.style.top  = (y - 10) + 'px';
  },

  _hideTooltip: function () {
    var t = this._getTooltip();
    t.style.opacity = '0';
  },

  // ── Ligne chart — CA cumulé équipe ───────────────────
  renderLineChart: function (containerId, weeks, values) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (!weeks.length) {
      container.innerHTML = '<p class="chart-empty">Aucune donnée historique disponible</p>';
      return;
    }

    var W = Math.max(container.clientWidth || 480, 200);
    var H = 180;
    var padL = 52, padR = 16, padT = 16, padB = 38;
    var iW = W - padL - padR;
    var iH = H - padT - padB;

    var minV = Math.min.apply(null, values);
    var maxV = Math.max.apply(null, values);
    var range = maxV - minV || 1;
    var yMin = Math.max(0, minV - range * 0.15);
    var yMax = maxV + range * 0.15;
    var yR   = yMax - yMin || 1;

    var pts = weeks.map(function (w, i) {
      var x = padL + (weeks.length > 1 ? (i / (weeks.length - 1)) * iW : iW / 2);
      var y = padT + iH - ((values[i] - yMin) / yR) * iH;
      return { x: x, y: y, w: w, v: values[i] };
    });

    // Smooth curve via cubic bezier
    var pathD = '';
    pts.forEach(function (p, i) {
      if (i === 0) {
        pathD = 'M ' + p.x + ' ' + p.y;
      } else {
        var prev = pts[i - 1];
        var cx1 = prev.x + (p.x - prev.x) * 0.5;
        var cx2 = p.x  - (p.x - prev.x) * 0.5;
        pathD += ' C ' + cx1 + ' ' + prev.y + ' ' + cx2 + ' ' + p.y + ' ' + p.x + ' ' + p.y;
      }
    });

    // Aire de remplissage
    var areaD = pathD +
      ' L ' + pts[pts.length - 1].x + ' ' + (padT + iH) +
      ' L ' + pts[0].x + ' ' + (padT + iH) + ' Z';

    // Calcul longueur de la ligne (approximation)
    var lineLen = 0;
    for (var i = 1; i < pts.length; i++) {
      var dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
      lineLen += Math.sqrt(dx*dx + dy*dy);
    }
    lineLen = Math.ceil(lineLen) + 100;

    // Y-axis ticks
    var gridSvg = '';
    for (var i = 0; i <= 4; i++) {
      var val = yMin + (yR / 4) * i;
      var y = padT + iH - (i / 4) * iH;
      var lbl = val >= 1000 ? (val / 1000).toFixed(0) + 'k' : Math.round(val);
      gridSvg += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y +
        '" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>';
      gridSvg += '<text x="' + (padL - 7) + '" y="' + (y + 4) +
        '" text-anchor="end" font-size="10" fill="#334155">' + lbl + '</text>';
    }

    // X labels
    var xLbls = '';
    pts.forEach(function (p) {
      xLbls += '<text x="' + p.x + '" y="' + (H - 8) +
        '" text-anchor="middle" font-size="10" fill="#334155">' + BC.Utils.formatWeek(p.w) + '</text>';
    });

    // Dernier point avec pulse
    var lastPt = pts[pts.length - 1];
    var pulseCircle = '';
    if (lastPt) {
      pulseCircle =
        '<circle cx="' + lastPt.x + '" cy="' + lastPt.y + '" r="6" fill="rgba(59,130,246,0.2)">' +
        '<animate attributeName="r" values="4;10;4" dur="2s" repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/>' +
        '</circle>';
    }

    // Cercles interactifs
    var circles = pts.map(function (p) {
      return '<circle class="chart-point" cx="' + p.x + '" cy="' + p.y +
        '" r="4" fill="#3B82F6" stroke="' + '#070B14' + '" stroke-width="2"' +
        ' data-label="' + BC.Utils.formatWeek(p.w) + ' : ' + BC.Utils.formatEur(p.v) + '">' +
        '</circle>';
    }).join('');

    var svgId = 'svg-' + containerId;
    container.innerHTML =
      '<svg id="' + svgId + '" width="100%" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<defs>' +
      '<linearGradient id="lg-' + containerId + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#3B82F6" stop-opacity="0.18"/>' +
      '<stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/>' +
      '</linearGradient>' +
      '</defs>' +
      gridSvg +
      '<path d="' + areaD + '" fill="url(#lg-' + containerId + ')" style="animation:fadeIn 0.8s ease 0.3s both"/>' +
      '<path d="' + pathD + '" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round"' +
      ' stroke-dasharray="' + lineLen + '" stroke-dashoffset="' + lineLen + '"' +
      ' style="animation:drawLine 1s cubic-bezier(.4,0,.2,1) 0.1s forwards;--line-length:' + lineLen + '"/>' +
      pulseCircle + circles + xLbls +
      '</svg>';

    // Ajouter tooltips via événements
    var svg = document.getElementById(svgId);
    if (svg) {
      svg.querySelectorAll('.chart-point').forEach(function (c) {
        c.addEventListener('mouseenter', function (e) {
          BC.Charts._showTooltip(c.getAttribute('data-label'), e.clientX, e.clientY);
        });
        c.addEventListener('mousemove', function (e) {
          BC.Charts._showTooltip(c.getAttribute('data-label'), e.clientX, e.clientY);
        });
        c.addEventListener('mouseleave', function () { BC.Charts._hideTooltip(); });
      });
    }
  },

  // ── Bar chart — Recouvrement David ───────────────────
  renderBarChart: function (containerId, weeks, values, objectif) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (!weeks.length) {
      container.innerHTML = '<p class="chart-empty">Pas de données de recouvrement</p>';
      return;
    }

    var W = Math.max(container.clientWidth || 480, 200);
    var H = 180;
    var padL = 52, padR = 16, padT = 16, padB = 38;
    var iW = W - padL - padR;
    var iH = H - padT - padB;

    var maxV = Math.max.apply(null, values.concat([objectif || 0])) * 1.2 || 1;
    var barW = Math.min(36, (iW / weeks.length) * 0.55);
    var gap  = iW / weeks.length;

    // Grid Y
    var gridSvg = '';
    for (var i = 0; i <= 4; i++) {
      var v = (maxV / 4) * i;
      var y = padT + iH - (i / 4) * iH;
      var lbl = v >= 1000 ? Math.round(v / 1000) + 'k' : Math.round(v);
      gridSvg += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y +
        '" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>';
      gridSvg += '<text x="' + (padL - 7) + '" y="' + (y + 4) +
        '" text-anchor="end" font-size="10" fill="#334155">' + lbl + '</text>';
    }

    // Barres
    var bars = '';
    var xLbls = '';
    weeks.forEach(function (w, i) {
      var bH  = Math.max(2, (values[i] / maxV) * iH);
      var x   = padL + gap * i + gap / 2 - barW / 2;
      var y   = padT + iH - bH;
      var ok  = values[i] >= (objectif || 0);
      var col = ok ? '#10B981' : '#EF4444';
      var colLight = ok ? '#34D399' : '#FCA5A5';

      bars +=
        '<defs>' +
        '<linearGradient id="bg-' + containerId + '-' + i + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="' + colLight + '" stop-opacity="0.9"/>' +
        '<stop offset="100%" stop-color="' + col + '" stop-opacity="0.7"/>' +
        '</linearGradient></defs>' +
        '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + bH +
        '" rx="4" fill="url(#bg-' + containerId + '-' + i + ')"' +
        ' class="chart-bar" data-label="' + BC.Utils.formatWeek(w) + ' : ' + BC.Utils.formatEur(values[i]) + '"' +
        ' style="animation:barRise 0.5s cubic-bezier(.4,0,.2,1) ' + (i * 0.08) + 's both"/>';

      xLbls += '<text x="' + (x + barW / 2) + '" y="' + (H - 8) +
        '" text-anchor="middle" font-size="10" fill="#334155">' + BC.Utils.formatWeek(w) + '</text>';
    });

    // Ligne objectif
    var objLine = '';
    if (objectif) {
      var oy = padT + iH - (objectif / maxV) * iH;
      objLine =
        '<line x1="' + padL + '" y1="' + oy + '" x2="' + (W - padR) + '" y2="' + oy +
        '" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="5,4"/>' +
        '<rect x="' + (W - padR - 52) + '" y="' + (oy - 10) + '" width="50" height="14" rx="4" fill="rgba(245,158,11,0.12)"/>' +
        '<text x="' + (W - padR - 27) + '" y="' + (oy + 1) +
        '" text-anchor="middle" font-size="9" fill="#F59E0B" font-weight="700">objectif</text>';
    }

    var svgId = 'svgbar-' + containerId;
    container.innerHTML =
      '<svg id="' + svgId + '" width="100%" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      gridSvg + bars + objLine + xLbls + '</svg>';

    var svg = document.getElementById(svgId);
    if (svg) {
      svg.querySelectorAll('.chart-bar').forEach(function (b) {
        b.addEventListener('mouseenter', function (e) {
          BC.Charts._showTooltip(b.getAttribute('data-label'), e.clientX, e.clientY);
        });
        b.addEventListener('mousemove', function (e) {
          BC.Charts._showTooltip(b.getAttribute('data-label'), e.clientX, e.clientY);
        });
        b.addEventListener('mouseleave', function () { BC.Charts._hideTooltip(); });
      });
    }
  },

  // ── Donut chart — Répartition statuts ────────────────
  renderDonutChart: function (containerId, counts) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var total = counts.vert + counts.orange + counts.rouge;
    if (total === 0) {
      container.innerHTML = '<p class="chart-empty">Aucune donnée</p>';
      return;
    }

    var SIZE = 140, cx = 70, cy = 70, r = 52, innerR = 35;
    var circumference = 2 * Math.PI * r;

    var segs = [
      { label: 'OK',        v: counts.vert,   c: '#10B981', lc: '#34D399' },
      { label: 'Attention', v: counts.orange, c: '#F59E0B', lc: '#FCD34D' },
      { label: 'Alerte',    v: counts.rouge,  c: '#EF4444', lc: '#FCA5A5' }
    ].filter(function (s) { return s.v > 0; });

    var arcs = '';
    var startA = -Math.PI / 2;
    var delay = 0;

    segs.forEach(function (seg) {
      var angle  = (seg.v / total) * 2 * Math.PI;
      var endA   = startA + angle;
      var x1 = cx + r * Math.cos(startA), y1 = cy + r * Math.sin(startA);
      var x2 = cx + r * Math.cos(endA),   y2 = cy + r * Math.sin(endA);
      var xi1 = cx + innerR * Math.cos(endA),   yi1 = cy + innerR * Math.sin(endA);
      var xi2 = cx + innerR * Math.cos(startA), yi2 = cy + innerR * Math.sin(startA);
      var large = angle > Math.PI ? 1 : 0;

      var arcLen = angle * r;
      var offset = circumference - arcLen;

      arcs +=
        '<defs>' +
        '<linearGradient id="dg-' + containerId + '-' + seg.label + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="' + seg.lc + '"/>' +
        '<stop offset="100%" stop-color="' + seg.c + '"/>' +
        '</linearGradient></defs>' +
        '<path d="M ' + x1 + ' ' + y1 +
        ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 +
        ' L ' + xi1 + ' ' + yi1 +
        ' A ' + innerR + ' ' + innerR + ' 0 ' + large + ' 0 ' + xi2 + ' ' + yi2 + ' Z"' +
        ' fill="url(#dg-' + containerId + '-' + seg.label + ')"' +
        ' style="animation:fadeIn 0.5s ease ' + delay + 's both;filter:drop-shadow(0 0 6px ' + seg.c + '44)">' +
        '<title>' + seg.label + ' : ' + seg.v + '</title></path>';

      startA = endA;
      delay += 0.12;
    });

    // Centre
    var center =
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (innerR - 2) + '" fill="' + '#0D1424' + '"/>' +
      '<text x="' + cx + '" y="' + (cy - 6) + '" text-anchor="middle" font-size="22" font-weight="800" fill="#F1F5F9">' + total + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 13) + '" text-anchor="middle" font-size="9" fill="#475569" letter-spacing="0.08em">ÉQUIPE</text>';

    // Légende
    var legendY = SIZE + 12;
    var legend = '<g transform="translate(0,' + legendY + ')">';
    var lx = 0;
    segs.forEach(function (seg) {
      legend += '<rect x="' + lx + '" y="2" width="8" height="8" rx="2" fill="' + seg.c + '"/>';
      legend += '<text x="' + (lx + 12) + '" y="10" font-size="10" fill="#64748B">' + seg.label + ' (' + seg.v + ')</text>';
      lx += 86;
    });
    legend += '</g>';

    container.innerHTML =
      '<svg width="' + SIZE + '" height="' + (SIZE + 34) + '" viewBox="0 0 ' + SIZE + ' ' + (SIZE + 34) + '">' +
      arcs + center + legend + '</svg>';
  },

  // ── Sparkline — mini ligne dans KPI card ─────────────
  renderSparkline: function (containerId, values, color) {
    var container = document.getElementById(containerId);
    if (!container || values.length < 2) return;

    var W = container.clientWidth || 140;
    var H = 32;
    var pad = 2;
    var iW = W - pad * 2, iH = H - pad * 2;

    var minV = Math.min.apply(null, values);
    var maxV = Math.max.apply(null, values);
    var rangeV = maxV - minV || 1;

    var pts = values.map(function (v, i) {
      return {
        x: pad + (i / (values.length - 1)) * iW,
        y: pad + iH - ((v - minV) / rangeV) * iH
      };
    });

    var pathD = pts.map(function (p, i) { return (i === 0 ? 'M' : 'L') + ' ' + p.x + ' ' + p.y; }).join(' ');
    var areaD = pathD + ' L ' + pts[pts.length-1].x + ' ' + (H - pad) + ' L ' + pts[0].x + ' ' + (H - pad) + ' Z';

    var c = color || '#3B82F6';
    container.innerHTML =
      '<svg width="100%" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<defs><linearGradient id="spk-' + containerId + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + c + '" stop-opacity="0.2"/>' +
      '<stop offset="100%" stop-color="' + c + '" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      '<path d="' + areaD + '" fill="url(#spk-' + containerId + ')"/>' +
      '<path d="' + pathD + '" fill="none" stroke="' + c + '" stroke-width="1.5" stroke-linecap="round"/>' +
      '<circle cx="' + pts[pts.length-1].x + '" cy="' + pts[pts.length-1].y + '" r="2.5" fill="' + c + '"/>' +
      '</svg>';
  }
};
