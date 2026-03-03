/* charts.js — Génération de graphiques SVG
 * Line chart, Bar chart, Donut chart — sans bibliothèque externe
 */
var BC = window.BC || {};

BC.Charts = {

  /**
   * Génère un graphique en ligne (évolution CA cumulé équipe).
   * @param {string} containerId  ID de l'élément cible
   * @param {Array}  weeks        Tableau de semaines triées
   * @param {Array}  values       Valeurs correspondantes (€)
   */
  renderLineChart: function (containerId, weeks, values) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var W = container.clientWidth || 500;
    var H = 180;
    var padL = 60, padR = 20, padT = 20, padB = 40;
    var innerW = W - padL - padR;
    var innerH = H - padT - padB;

    if (!weeks.length) {
      container.innerHTML = '<p class="chart-empty">Pas de données disponibles</p>';
      return;
    }

    var minVal = Math.min.apply(null, values);
    var maxVal = Math.max.apply(null, values);
    var range = maxVal - minVal || 1;
    // Ajout d'une marge de 10%
    var yMin = Math.max(0, minVal - range * 0.1);
    var yMax = maxVal + range * 0.1;
    var yRange = yMax - yMin || 1;

    var points = weeks.map(function (w, i) {
      var x = padL + (i / Math.max(weeks.length - 1, 1)) * innerW;
      var y = padT + innerH - ((values[i] - yMin) / yRange) * innerH;
      return { x: x, y: y, w: w, v: values[i] };
    });

    // Ligne de remplissage (aire)
    var areaPath = 'M ' + points[0].x + ' ' + (padT + innerH);
    points.forEach(function (p) { areaPath += ' L ' + p.x + ' ' + p.y; });
    areaPath += ' L ' + points[points.length - 1].x + ' ' + (padT + innerH) + ' Z';

    // Ligne principale
    var linePath = points.map(function (p, i) {
      return (i === 0 ? 'M' : 'L') + ' ' + p.x + ' ' + p.y;
    }).join(' ');

    // Graduations Y
    var yTicks = '';
    for (var i = 0; i <= 4; i++) {
      var val = yMin + (yRange / 4) * i;
      var y = padT + innerH - (i / 4) * innerH;
      var label = val >= 1000 ? Math.round(val / 1000) + 'k' : Math.round(val);
      yTicks += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>';
      yTicks += '<text x="' + (padL - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="#64748B">' + label + '</text>';
    }

    // Étiquettes X
    var xLabels = '';
    points.forEach(function (p) {
      xLabels += '<text x="' + p.x + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11" fill="#64748B">' + BC.Utils.formatWeek(p.w) + '</text>';
    });

    // Cercles sur les points
    var circles = points.map(function (p) {
      return '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="#3B82F6" stroke="#0A0F1E" stroke-width="2">' +
        '<title>' + BC.Utils.formatWeek(p.w) + ' : ' + BC.Utils.formatEur(p.v) + '</title>' +
        '</circle>';
    }).join('');

    container.innerHTML =
      '<svg width="100%" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#3B82F6" stop-opacity="0.3"/>' +
      '<stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/>' +
      '</linearGradient>' +
      '</defs>' +
      yTicks +
      '<path d="' + areaPath + '" fill="url(#lineGrad)"/>' +
      '<path d="' + linePath + '" fill="none" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      circles +
      xLabels +
      '</svg>';
  },

  /**
   * Génère un graphique en barres (recouvrement David semaine par semaine).
   * @param {string} containerId
   * @param {Array}  weeks
   * @param {Array}  values
   * @param {number} objectif
   */
  renderBarChart: function (containerId, weeks, values, objectif) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var W = container.clientWidth || 500;
    var H = 180;
    var padL = 60, padR = 20, padT = 20, padB = 40;
    var innerW = W - padL - padR;
    var innerH = H - padT - padB;

    if (!weeks.length) {
      container.innerHTML = '<p class="chart-empty">Pas de données disponibles</p>';
      return;
    }

    var maxVal = Math.max.apply(null, values.concat([objectif || 0]));
    var yMax = maxVal * 1.15 || 1;

    var barW = Math.min(40, (innerW / weeks.length) * 0.6);
    var gap = innerW / weeks.length;

    var bars = '';
    var labels = '';
    weeks.forEach(function (w, i) {
      var x = padL + gap * i + gap / 2 - barW / 2;
      var barH = (values[i] / yMax) * innerH;
      var y = padT + innerH - barH;
      var color = values[i] >= (objectif || 0) ? '#10B981' : '#EF4444';
      bars += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + barH + '" rx="3" fill="' + color + '" opacity="0.85">' +
        '<title>' + BC.Utils.formatWeek(w) + ' : ' + BC.Utils.formatEur(values[i]) + '</title>' +
        '</rect>';
      labels += '<text x="' + (x + barW / 2) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11" fill="#64748B">' + BC.Utils.formatWeek(w) + '</text>';
    });

    // Ligne objectif
    var objectifY = padT + innerH - (objectif / yMax) * innerH;
    var objectifLine = '';
    if (objectif) {
      objectifLine =
        '<line x1="' + padL + '" y1="' + objectifY + '" x2="' + (W - padR) + '" y2="' + objectifY + '" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="4,4"/>' +
        '<text x="' + (W - padR - 2) + '" y="' + (objectifY - 4) + '" text-anchor="end" font-size="10" fill="#F59E0B">objectif</text>';
    }

    // Graduations Y
    var yTicks = '';
    for (var i = 0; i <= 4; i++) {
      var val = (yMax / 4) * i;
      var y = padT + innerH - (i / 4) * innerH;
      var label = val >= 1000 ? Math.round(val / 1000) + 'k' : Math.round(val);
      yTicks += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>';
      yTicks += '<text x="' + (padL - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="#64748B">' + label + '</text>';
    }

    container.innerHTML =
      '<svg width="100%" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' +
      yTicks + bars + objectifLine + labels +
      '</svg>';
  },

  /**
   * Génère un donut chart (répartition des statuts).
   * @param {string} containerId
   * @param {{ vert: number, orange: number, rouge: number }} counts
   */
  renderDonutChart: function (containerId, counts) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var total = counts.vert + counts.orange + counts.rouge;
    var size = 140;
    var cx = size / 2, cy = size / 2;
    var r = 52, innerR = 34;

    if (total === 0) {
      container.innerHTML = '<p class="chart-empty">Aucune donnée</p>';
      return;
    }

    var segments = [
      { label: 'OK', value: counts.vert, color: '#10B981' },
      { label: 'Attention', value: counts.orange, color: '#F59E0B' },
      { label: 'Alerte', value: counts.rouge, color: '#EF4444' }
    ].filter(function (s) { return s.value > 0; });

    var paths = '';
    var startAngle = -Math.PI / 2;

    segments.forEach(function (seg) {
      var angle = (seg.value / total) * 2 * Math.PI;
      var endAngle = startAngle + angle;
      var x1 = cx + r * Math.cos(startAngle);
      var y1 = cy + r * Math.sin(startAngle);
      var x2 = cx + r * Math.cos(endAngle);
      var y2 = cy + r * Math.sin(endAngle);
      var xi1 = cx + innerR * Math.cos(endAngle);
      var yi1 = cy + innerR * Math.sin(endAngle);
      var xi2 = cx + innerR * Math.cos(startAngle);
      var yi2 = cy + innerR * Math.sin(startAngle);
      var large = angle > Math.PI ? 1 : 0;

      paths += '<path d="M ' + x1 + ' ' + y1 +
        ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 +
        ' L ' + xi1 + ' ' + yi1 +
        ' A ' + innerR + ' ' + innerR + ' 0 ' + large + ' 0 ' + xi2 + ' ' + yi2 +
        ' Z" fill="' + seg.color + '" opacity="0.9">' +
        '<title>' + seg.label + ' : ' + seg.value + '</title></path>';

      startAngle = endAngle;
    });

    // Texte central
    var centerText =
      '<text x="' + cx + '" y="' + (cy - 5) + '" text-anchor="middle" font-size="20" font-weight="700" fill="#E2E8F0">' + total + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" font-size="10" fill="#64748B">équipe</text>';

    // Légende
    var legendY = size + 10;
    var legend = '<g transform="translate(0,' + legendY + ')">';
    var lx = 0;
    segments.forEach(function (seg) {
      legend += '<rect x="' + lx + '" y="0" width="10" height="10" rx="2" fill="' + seg.color + '"/>';
      legend += '<text x="' + (lx + 14) + '" y="9" font-size="11" fill="#94A3B8">' + seg.label + ' (' + seg.value + ')</text>';
      lx += 90;
    });
    legend += '</g>';

    container.innerHTML =
      '<svg width="' + size + '" height="' + (size + 30) + '" viewBox="0 0 ' + size + ' ' + (size + 30) + '" xmlns="http://www.w3.org/2000/svg">' +
      paths + centerText + legend +
      '</svg>';
  }
};
