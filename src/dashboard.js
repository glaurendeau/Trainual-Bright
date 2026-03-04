/* dashboard.js — Dashboard dirigeant Geoffrey (version premium)
 * KPIs avec sparklines, grille équipe avec anneaux de statut,
 * graphiques animés, section blocages
 */
var BC = window.BC || {};

BC.Dashboard = {

  render: function () {
    var week       = BC.Utils.getCurrentWeek();
    var allEntries = BC.Storage.getAll();
    var weeks      = BC.Storage.getWeeks();

    // ── KPIs globaux ──────────────────────────────────
    var totalCA = 0, totalRetard = 0, recouvrement = 0, alertes = 0;

    BC.COLLABORATEURS_ORDER.forEach(function (key) {
      var e = BC.Storage.getLatestEntry(key);
      if (!e) return;
      totalCA       += (e.ca_cumule || 0) + (e.ca_pole_cumule || 0);
      totalRetard   += e.dossiers_retard || 0;
      recouvrement  += e.recouvrement_semaine || 0;
      if (BC.getCollaborateurStatus(key) === 'rouge') alertes++;
    });

    // ── Tendances (comparaison semaine précédente) ────
    var prevWeek = weeks.length >= 2 ? weeks[weeks.length - 2] : null;
    var prevCA   = 0;
    if (prevWeek) {
      BC.COLLABORATEURS_ORDER.forEach(function (key) {
        var e = BC.Storage.getEntryForWeek(key, prevWeek);
        if (e) prevCA += (e.ca_cumule || 0) + (e.ca_pole_cumule || 0);
      });
    }
    var caTrend = prevCA > 0 ? Math.round(((totalCA - prevCA) / prevCA) * 100) : null;

    // ── Complétion équipe ─────────────────────────────
    var nbSaisi = BC.COLLABORATEURS_ORDER.filter(function (k) {
      return BC.Storage.hasRecentEntry(k);
    }).length;

    // ── Statuts ───────────────────────────────────────
    var statusCounts = { vert: 0, orange: 0, rouge: 0 };
    BC.COLLABORATEURS_ORDER.forEach(function (key) {
      statusCounts[BC.getCollaborateurStatus(key)]++;
    });

    // ── Blocages / réunion lundi ──────────────────────
    var blocages = [];
    BC.COLLABORATEURS_ORDER.forEach(function (key) {
      var e = BC.Storage.getLatestEntry(key);
      if (e && e.blocages && e.blocages.trim()) {
        blocages.push({
          name: BC.COLLABORATEURS[key].name,
          color: BC.COLLABORATEURS[key].color,
          text: e.blocages.trim(),
          semaine: e.semaine
        });
      }
    });

    // ── Construction HTML ─────────────────────────────
    var html = '<div class="page page-dashboard">';

    // Header
    html += '<header class="dashboard-header">';
    html += '<div class="header-brand">';
    html += '<div class="logo"><span class="logo-dot"></span>Bright Conseil</div>';
    html += '<div class="header-week">Dashboard &mdash; ' + week.str + '</div>';
    html += '</div>';
    html += '<div class="header-actions">';
    html += '<a href="#/" class="btn-ghost">Saisie</a>';
    html += '<button class="btn-ghost" onclick="window.print()">Exporter PDF</button>';
    html += '</div></header>';

    // ── Zone 1 : KPIs ─────────────────────────────────
    html += '<section class="kpi-section">';

    // KPI 1 — CA total
    var caColor = '#3B82F6';
    var caTrendHtml = caTrend !== null
      ? '<span class="kpi-trend ' + (caTrend >= 0 ? 'up' : 'down') + '">' + (caTrend >= 0 ? '↑' : '↓') + ' ' + Math.abs(caTrend) + '% vs S' + BC.Utils.formatWeek(prevWeek) + '</span>'
      : '<span class="kpi-trend neutral">Semaine courante</span>';

    html += '<div class="kpi-card">';
    html += '<div class="kpi-header"><div class="kpi-icon" style="background:rgba(59,130,246,0.12);color:#3B82F6">💰</div>' + caTrendHtml + '</div>';
    html += '<div class="kpi-value" style="color:' + caColor + '">' + BC.Utils.formatEur(totalCA) + '</div>';
    html += '<div class="kpi-label">CA cumulé équipe</div>';
    html += '<div class="kpi-sparkline" id="spark-ca"></div>';
    html += '</div>';

    // KPI 2 — Dossiers retard
    var retardColor = totalRetard <= 2 ? '#10B981' : totalRetard <= 5 ? '#F59E0B' : '#EF4444';
    html += '<div class="kpi-card">';
    html += '<div class="kpi-header"><div class="kpi-icon" style="background:rgba(245,158,11,0.1);color:#F59E0B">📂</div>' +
      '<span class="kpi-trend ' + (totalRetard <= 2 ? 'up' : 'down') + '">' + (totalRetard <= 2 ? '✓ OK' : '⚠ Élevé') + '</span></div>';
    html += '<div class="kpi-value" style="color:' + retardColor + '">' + totalRetard + '</div>';
    html += '<div class="kpi-label">Dossiers en retard</div>';
    html += '<div class="kpi-sparkline" id="spark-retard"></div>';
    html += '</div>';

    // KPI 3 — Recouvrement
    var recColor = recouvrement >= 10000 ? '#10B981' : '#EF4444';
    html += '<div class="kpi-card">';
    html += '<div class="kpi-header"><div class="kpi-icon" style="background:rgba(16,185,129,0.1);color:#10B981">💳</div>' +
      '<span class="kpi-trend ' + (recouvrement >= 10000 ? 'up' : 'down') + '">' + (recouvrement >= 10000 ? '✓ Objectif' : '↓ Sous objectif') + '</span></div>';
    html += '<div class="kpi-value" style="color:' + recColor + '">' + BC.Utils.formatEur(recouvrement) + '</div>';
    html += '<div class="kpi-label">Recouvrement semaine</div>';
    html += '<div class="kpi-sparkline" id="spark-rec"></div>';
    html += '</div>';

    // KPI 4 — Alertes
    html += '<div class="kpi-card' + (alertes > 0 ? ' kpi-card--alert' : '') + '">';
    html += '<div class="kpi-header"><div class="kpi-icon" style="background:rgba(239,68,68,0.1);color:#EF4444">🚨</div>' +
      '<span class="kpi-trend ' + (alertes === 0 ? 'up' : 'down') + '">' + (alertes === 0 ? '✓ Aucune' : alertes + ' actives') + '</span></div>';
    html += '<div class="kpi-value" style="color:' + (alertes === 0 ? '#10B981' : '#EF4444') + '">' + alertes + '</div>';
    html += '<div class="kpi-label">Alertes actives</div>';
    html += '</div>';

    html += '</section>';

    // ── Zone 2 : Grille équipe ────────────────────────
    html += '<section class="team-section">';
    html += '<div class="team-section-header">';
    html += '<div class="section-title">Vue de l\'équipe</div>';
    html += '<div class="team-completion">' + nbSaisi + ' / ' + BC.COLLABORATEURS_ORDER.length + ' ont saisi cette semaine</div>';
    html += '</div>';
    html += '<div class="team-grid">';
    BC.COLLABORATEURS_ORDER.forEach(function (key, i) {
      html += BC.Dashboard._renderCollabCard(key, i);
    });
    html += '</div></section>';

    // ── Zone 3 : Graphiques ───────────────────────────
    html += '<section class="charts-section">';
    html += '<div class="section-title">Graphiques</div>';
    html += '<div class="charts-grid">';

    html += '<div class="chart-card"><h3 class="chart-title">Évolution CA cumulé équipe</h3><div id="chart-line" class="chart-container"></div></div>';
    html += '<div class="chart-card"><h3 class="chart-title">Recouvrement David &mdash; par semaine</h3><div id="chart-bars" class="chart-container"></div></div>';
    html += '<div class="chart-card chart-card--donut"><h3 class="chart-title">Répartition des statuts</h3><div id="chart-donut" class="chart-container chart-container--donut"></div></div>';

    html += '</div></section>';

    // ── Zone 4 : Points réunion lundi ────────────────
    if (blocages.length > 0) {
      html += '<section class="reunion-section">';
      html += '<div class="section-title">Points à aborder lundi</div>';
      html += '<div class="blocages-list">';
      blocages.forEach(function (b) {
        html += '<div class="blocage-item">';
        html += '<div class="blocage-header">';
        html += '<span class="blocage-author" style="color:' + b.color + '">' + BC.Utils.escHtml(b.name) + '</span>';
        html += '<span class="blocage-week">' + BC.Utils.escHtml(b.semaine) + '</span>';
        html += '</div>';
        html += '<p class="blocage-text">' + BC.Utils.escHtml(b.text) + '</p>';
        html += '</div>';
      });
      html += '</div></section>';
    }

    html += '</div>'; // .page-dashboard

    // Modal
    html += '<div id="modal-overlay" class="modal-overlay" onclick="BC.Dashboard.closeModal()" style="display:none"></div>';
    html += '<div id="modal-drawer" class="modal-drawer" style="display:none"></div>';

    document.getElementById('app').innerHTML = html;

    // Rendu des graphiques + sparklines après insertion DOM
    BC.Dashboard._renderCharts(allEntries, weeks);
  },

  // ── Card collaborateur avec anneau de statut ──────────
  _renderCollabCard: function (key, idx) {
    var config  = BC.COLLABORATEURS[key];
    var entry   = BC.Storage.getLatestEntry(key);
    var status  = BC.getCollaborateurStatus(key);
    var sc      = BC.statusColor(status);
    var hasSaisie = BC.Storage.hasRecentEntry(key);

    // Calcul ratio moyen pour l'anneau
    var ratios = [];
    if (entry) {
      config.fields.forEach(function (field) {
        if (!field.isObjective || field.type === 'text' || field.type === 'boolean') return;
        var r = BC.computeFieldRatio(entry[field.key], field);
        if (r !== null) ratios.push(r);
      });
    }
    var avgRatio = ratios.length ? ratios.reduce(function (a, b) { return a + b; }, 0) / ratios.length : 0;
    var ringPct  = Math.round(avgRatio * 100);

    // SVG anneau
    var R = 24, cx = 25, cy = 25, strokeW = 2.5;
    var circ = 2 * Math.PI * R;
    var dash = (ringPct / 100) * circ;
    var offset = circ - dash;

    var ringSvg =
      '<svg class="avatar-ring" viewBox="0 0 50 50" width="50" height="50">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="' + strokeW + '"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="' + sc + '" stroke-width="' + strokeW + '"' +
      ' stroke-linecap="round"' +
      ' stroke-dasharray="' + circ + '" stroke-dashoffset="' + circ + '"' +
      ' transform="rotate(-90 ' + cx + ' ' + cy + ')"' +
      ' style="animation:ringFill 1s cubic-bezier(.4,0,.2,1) ' + (idx * 0.08) + 's forwards;--ring-circumference:' + circ + ';--ring-offset:' + offset + '"/>' +
      '</svg>';

    var delay = (idx * 0.06) + 's';
    var html = '<div class="collab-dash-card status-border-' + status +
      '" onclick="BC.Dashboard.openModal(\'' + key + '\')" style="animation-delay:' + delay + '">';

    // Header
    html += '<div class="collab-dash-header">';
    html += '<div class="avatar-ring-wrap">' + ringSvg;
    html += '<div class="collab-dash-avatar" style="background:' + config.color + '18;border-color:' + config.color + '44;color:' + config.color + '">' + config.initials + '</div>';
    html += '</div>';
    html += '<div class="collab-dash-info"><div class="collab-dash-name">' + BC.Utils.escHtml(config.name) + '</div><div class="collab-dash-role">' + BC.Utils.escHtml(config.role) + '</div></div>';
    html += '<div class="collab-dash-badge" style="background:' + sc + '18;color:' + sc + ';border-color:' + sc + '33">' + BC.statusEmoji(status) + ' ' + BC.statusLabel(status) + '</div>';
    html += '</div>';

    if (!hasSaisie || !entry) {
      html += '<div class="collab-dash-nosaisie">Aucune saisie cette semaine</div>';
    } else {
      // Mini KPIs
      html += '<div class="collab-dash-kpis">';
      var shown = config.fields.filter(function (f) {
        return f.isObjective && f.type !== 'text' && f.type !== 'boolean' &&
               entry[f.key] !== undefined && entry[f.key] !== null;
      }).slice(0, 3);

      shown.forEach(function (field) {
        var val   = entry[field.key];
        var ratio = BC.computeFieldRatio(val, field);
        var pct   = ratio !== null ? Math.min(100, Math.round(ratio * 100)) : 0;
        var bc    = ratio >= 0.8 ? '#10B981' : ratio >= 0.6 ? '#F59E0B' : '#EF4444';
        var dispV = field.unit ? BC.Utils.escHtml(String(val)) + ' ' + field.unit : BC.Utils.escHtml(String(val));

        html += '<div class="mini-kpi"><div class="mini-kpi-row">';
        html += '<span class="mini-kpi-label">' + BC.Utils.escHtml(field.label.split(' ').slice(0, 4).join(' ')) + '</span>';
        html += '<span class="mini-kpi-val" style="color:' + bc + '">' + dispV + '</span>';
        html += '</div><div class="mini-bar-wrap"><div class="mini-bar" style="width:' + pct + '%;background:' + bc + '"></div></div></div>';
      });
      html += '</div>';

      if (entry.blocages && entry.blocages.trim()) {
        var excerpt = entry.blocages.trim().substring(0, 72);
        html += '<p class="collab-dash-blocage">&ldquo;' + BC.Utils.escHtml(excerpt) + (entry.blocages.trim().length > 72 ? '…' : '') + '&rdquo;</p>';
      }
      html += '<div class="collab-dash-date">Saisie le ' + BC.Utils.formatDate(entry.timestamp) + '</div>';
    }

    html += '</div>';
    return html;
  },

  // ── Rendu des graphiques ──────────────────────────────
  _renderCharts: function (allEntries, weeks) {
    // Line chart — CA cumulé équipe
    var caByWeek = weeks.map(function (w) {
      return allEntries
        .filter(function (e) { return e.semaine === w; })
        .reduce(function (sum, e) { return sum + (e.ca_cumule || 0) + (e.ca_pole_cumule || 0); }, 0);
    });
    BC.Charts.renderLineChart('chart-line', weeks, caByWeek);

    // Bar chart — Recouvrement David
    var davidEntries = allEntries
      .filter(function (e) { return e.collaborateur === 'David' && e.recouvrement_semaine != null; })
      .sort(function (a, b) { return a.semaine > b.semaine ? 1 : -1; });
    BC.Charts.renderBarChart(
      'chart-bars',
      davidEntries.map(function (e) { return e.semaine; }),
      davidEntries.map(function (e) { return e.recouvrement_semaine || 0; }),
      10000
    );

    // Donut — statuts
    var counts = { vert: 0, orange: 0, rouge: 0 };
    BC.COLLABORATEURS_ORDER.forEach(function (k) { counts[BC.getCollaborateurStatus(k)]++; });
    BC.Charts.renderDonutChart('chart-donut', counts);

    // Sparklines dans les KPI cards
    BC.Charts.renderSparkline('spark-ca', caByWeek, '#3B82F6');

    var retardByWeek = weeks.map(function (w) {
      return allEntries
        .filter(function (e) { return e.semaine === w && e.dossiers_retard != null; })
        .reduce(function (sum, e) { return sum + (e.dossiers_retard || 0); }, 0);
    });
    BC.Charts.renderSparkline('spark-retard', retardByWeek, '#F59E0B');

    var recByWeek = weeks.map(function (w) {
      return allEntries
        .filter(function (e) { return e.semaine === w && e.recouvrement_semaine != null; })
        .reduce(function (sum, e) { return sum + (e.recouvrement_semaine || 0); }, 0);
    });
    BC.Charts.renderSparkline('spark-rec', recByWeek, '#10B981');
  },

  // ── Modal détail collaborateur ────────────────────────
  openModal: function (key) {
    var config = BC.COLLABORATEURS[key];
    var entry  = BC.Storage.getLatestEntry(key);
    var status = BC.getCollaborateurStatus(key);
    var sc     = BC.statusColor(status);

    var html = '<button class="modal-close" onclick="BC.Dashboard.closeModal()">&times;</button>';

    html += '<div class="modal-hero" style="border-color:' + config.color + '33">';
    html += '<div class="modal-avatar" style="background:' + config.color + '18;border-color:' + config.color + ';color:' + config.color + '">' + config.initials + '</div>';
    html += '<div><div class="modal-name">' + BC.Utils.escHtml(config.name) + '</div><div class="modal-role">' + BC.Utils.escHtml(config.role) + '</div></div>';
    html += '<div class="modal-status" style="background:' + sc + '18;color:' + sc + ';border:1px solid ' + sc + '33">' + BC.statusEmoji(status) + ' ' + BC.statusLabel(status) + '</div>';
    html += '</div>';

    if (!entry) {
      html += '<p class="modal-nosaisie">Aucune saisie récente — ce collaborateur n\'a pas encore renseigné ses indicateurs cette semaine.</p>';
    } else {
      html += '<div class="modal-fields">';
      config.fields.forEach(function (field) {
        var val = entry[field.key];
        if (val === undefined || val === null) return;
        if (field.type === 'text' && !val) return;

        var dv;
        if (field.type === 'boolean') dv = val ? 'Oui ✓' : 'Non ✗';
        else if (field.type === 'slider') dv = val + ' / ' + field.max;
        else if (field.unit === '€') dv = BC.Utils.formatEur(val);
        else if (field.unit) dv = val + ' ' + field.unit;
        else dv = String(val);

        var ratio = BC.computeFieldRatio(val, field);
        var bc2   = ratio === null ? '#64748B' : (ratio >= 0.8 ? '#10B981' : ratio >= 0.6 ? '#F59E0B' : '#EF4444');
        var pct   = ratio !== null ? Math.min(100, Math.round(ratio * 100)) : null;

        html += '<div class="modal-field"><div class="modal-field-row">';
        html += '<span class="modal-field-label">' + BC.Utils.escHtml(field.label) + '</span>';
        html += '<span class="modal-field-val" style="color:' + bc2 + '">' + BC.Utils.escHtml(dv) + '</span>';
        html += '</div>';
        if (pct !== null) {
          html += '<div class="mini-bar-wrap" style="margin-top:5px"><div class="mini-bar" style="width:' + pct + '%;background:' + bc2 + '"></div></div>';
        }
        if (field.objectifLabel) html += '<div class="modal-field-hint">' + BC.Utils.escHtml(field.objectifLabel) + '</div>';
        html += '</div>';
      });
      html += '</div>';

      if (entry.blocages && entry.blocages.trim()) {
        html += '<div class="modal-blocage"><div class="modal-blocage-title">Blocages / Notes</div>';
        html += '<p class="modal-blocage-text">' + BC.Utils.escHtml(entry.blocages) + '</p></div>';
      }

      html += '<div class="modal-footer">Saisie le ' + BC.Utils.formatDate(entry.timestamp) + ' &mdash; ' + BC.Utils.escHtml(entry.semaine) + '</div>';
    }

    html += '<div class="modal-actions"><a href="#/saisie/' + key + '" class="btn-primary" onclick="BC.Dashboard.closeModal()">Modifier la saisie</a></div>';

    var drawer  = document.getElementById('modal-drawer');
    var overlay = document.getElementById('modal-overlay');
    if (drawer && overlay) {
      drawer.innerHTML = html;
      drawer.style.display = 'flex';
      overlay.style.display = 'block';
      setTimeout(function () { drawer.classList.add('modal-drawer--open'); }, 10);
    }
  },

  closeModal: function () {
    var drawer  = document.getElementById('modal-drawer');
    var overlay = document.getElementById('modal-overlay');
    if (drawer && overlay) {
      drawer.classList.remove('modal-drawer--open');
      setTimeout(function () { drawer.style.display = 'none'; overlay.style.display = 'none'; }, 300);
    }
  }
};
