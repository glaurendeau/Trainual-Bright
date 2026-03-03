/* dashboard.js — Dashboard dirigeant Geoffrey
 * Vue d'ensemble de l'équipe, KPIs, graphiques, alertes
 */
var BC = window.BC || {};

BC.Dashboard = {

  /** Rendu complet du dashboard */
  render: function () {
    var week = BC.Utils.getCurrentWeek();
    var allEntries = BC.Storage.getAll();
    var weekEntries = BC.Storage.getEntriesForWeek(week.str);

    // ── Calcul des KPIs globaux ──
    var totalCA = 0;
    var totalDossiersRetard = 0;
    var recouvrementSemaine = 0;
    var alertes = 0;

    BC.COLLABORATEURS_ORDER.forEach(function (key) {
      var entry = BC.Storage.getLatestEntry(key);
      if (!entry) return;
      // CA cumulé (tous les collaborateurs avec un indicateur CA)
      if (entry.ca_cumule) totalCA += entry.ca_cumule;
      if (entry.ca_pole_cumule) totalCA += entry.ca_pole_cumule;
      if (entry.dossiers_retard) totalDossiersRetard += entry.dossiers_retard;
      if (entry.recouvrement_semaine) recouvrementSemaine += entry.recouvrement_semaine;
      var status = BC.getCollaborateurStatus(key);
      if (status === 'rouge') alertes++;
    });

    // ── Distribution des statuts ──
    var statusCounts = { vert: 0, orange: 0, rouge: 0 };
    BC.COLLABORATEURS_ORDER.forEach(function (key) {
      statusCounts[BC.getCollaborateurStatus(key)]++;
    });

    // ── Blocages / Points réunion lundi ──
    var blocages = [];
    BC.COLLABORATEURS_ORDER.forEach(function (key) {
      var entry = BC.Storage.getLatestEntry(key);
      if (entry && entry.blocages && entry.blocages.trim()) {
        blocages.push({
          name: BC.COLLABORATEURS[key].name,
          color: BC.COLLABORATEURS[key].color,
          text: entry.blocages.trim(),
          semaine: entry.semaine
        });
      }
    });

    // ── Construction de l'HTML ──
    var html = '<div class="page page-dashboard">';

    // Header
    html += '<header class="dashboard-header">';
    html += '<div class="header-brand"><div class="logo"><span class="logo-dot"></span>Bright Conseil</div>';
    html += '<div class="header-week">Dashboard &mdash; ' + week.str + '</div></div>';
    html += '<div class="header-actions">';
    html += '<a href="#/" class="btn-ghost">Saisie &rarr;</a>';
    html += '<button class="btn-ghost" onclick="window.print()">Exporter PDF</button>';
    html += '</div></header>';

    // ── Zone 1 : KPIs globaux ──
    html += '<section class="kpi-section">';
    html += BC.Dashboard._renderKPI('CA total équipe', BC.Utils.formatEur(totalCA), 'sum', '#3B82F6');
    html += BC.Dashboard._renderKPI('Dossiers en retard', totalDossiersRetard, 'retard', totalDossiersRetard > 4 ? '#EF4444' : '#F59E0B');
    html += BC.Dashboard._renderKPI('Recouvrement semaine', BC.Utils.formatEur(recouvrementSemaine), 'recouvrement', recouvrementSemaine >= 10000 ? '#10B981' : '#EF4444');
    html += BC.Dashboard._renderKPI('Alertes actives', alertes, 'alert', alertes > 0 ? '#EF4444' : '#10B981', alertes > 0 ? 'kpi-card--alert' : '');
    html += '</section>';

    // ── Zone 2 : Grille équipe ──
    html += '<section class="team-section">';
    html += '<h2 class="section-title">Vue de l\'équipe</h2>';
    html += '<div class="team-grid">';
    BC.COLLABORATEURS_ORDER.forEach(function (key) {
      html += BC.Dashboard._renderCollabCard(key);
    });
    html += '</div></section>';

    // ── Zone 3 : Graphiques ──
    html += '<section class="charts-section">';
    html += '<h2 class="section-title">Graphiques</h2>';
    html += '<div class="charts-grid">';

    // Graphique CA cumulé équipe (ligne)
    html += '<div class="chart-card">';
    html += '<h3 class="chart-title">Évolution CA cumulé équipe</h3>';
    html += '<div id="chart-line" class="chart-container"></div>';
    html += '</div>';

    // Graphique recouvrement David (barres)
    html += '<div class="chart-card">';
    html += '<h3 class="chart-title">Recouvrement David &mdash; semaine par semaine</h3>';
    html += '<div id="chart-bars" class="chart-container"></div>';
    html += '</div>';

    // Donut statuts
    html += '<div class="chart-card chart-card--donut">';
    html += '<h3 class="chart-title">Répartition des statuts</h3>';
    html += '<div id="chart-donut" class="chart-container chart-container--donut"></div>';
    html += '</div>';

    html += '</div></section>';

    // ── Section : Points à aborder en réunion lundi ──
    if (blocages.length > 0) {
      html += '<section class="reunion-section">';
      html += '<h2 class="section-title">&#128197; Points à aborder lundi</h2>';
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

    // Modal overlay (pour le détail d'un collaborateur)
    html += '<div id="modal-overlay" class="modal-overlay" onclick="BC.Dashboard.closeModal()" style="display:none"></div>';
    html += '<div id="modal-drawer" class="modal-drawer" style="display:none"></div>';

    document.getElementById('app').innerHTML = html;

    // Rendu des graphiques après insertion dans le DOM
    BC.Dashboard._renderCharts(allEntries, week.str);
  },

  /** Génère une card KPI */
  _renderKPI: function (label, value, icon, color, extraClass) {
    return '<div class="kpi-card ' + (extraClass || '') + '">' +
      '<div class="kpi-value" style="color:' + color + '">' + BC.Utils.escHtml(String(value)) + '</div>' +
      '<div class="kpi-label">' + BC.Utils.escHtml(label) + '</div>' +
      '</div>';
  },

  /** Génère la card d'un collaborateur pour la grille équipe */
  _renderCollabCard: function (key) {
    var config = BC.COLLABORATEURS[key];
    var entry = BC.Storage.getLatestEntry(key);
    var status = BC.getCollaborateurStatus(key);
    var statusColor = BC.statusColor(status);
    var hasSaisie = BC.Storage.hasRecentEntry(key);

    var html = '<div class="collab-dash-card status-border-' + status + '" onclick="BC.Dashboard.openModal(\'' + key + '\')">';

    // En-tête card
    html += '<div class="collab-dash-header">';
    html += '<div class="collab-dash-avatar" style="background:' + config.color + '22;border-color:' + config.color + '55;color:' + config.color + '">' + config.initials + '</div>';
    html += '<div class="collab-dash-info">';
    html += '<div class="collab-dash-name">' + BC.Utils.escHtml(config.name) + '</div>';
    html += '<div class="collab-dash-role">' + BC.Utils.escHtml(config.role) + '</div>';
    html += '</div>';
    html += '<div class="collab-dash-badge" style="background:' + statusColor + '22;color:' + statusColor + ';border-color:' + statusColor + '44">';
    html += BC.statusEmoji(status) + ' ' + BC.statusLabel(status);
    html += '</div>';
    html += '</div>';

    if (!hasSaisie || !entry) {
      html += '<div class="collab-dash-nosaisie">Aucune saisie récente</div>';
    } else {
      // Indicateurs clés avec mini barres
      html += '<div class="collab-dash-kpis">';
      var shownFields = config.fields.filter(function (f) {
        return f.isObjective && f.type !== 'text' && f.type !== 'boolean' && entry[f.key] !== undefined && entry[f.key] !== null;
      }).slice(0, 3);

      shownFields.forEach(function (field) {
        var val = entry[field.key];
        var ratio = BC.computeFieldRatio(val, field);
        var pct = ratio !== null ? Math.min(100, Math.round(ratio * 100)) : 0;
        var barColor = ratio >= 0.8 ? '#10B981' : ratio >= 0.6 ? '#F59E0B' : '#EF4444';
        var displayVal = field.unit ? BC.Utils.escHtml(String(val)) + ' ' + field.unit : BC.Utils.escHtml(String(val));

        html += '<div class="mini-kpi">';
        html += '<div class="mini-kpi-row">';
        html += '<span class="mini-kpi-label">' + BC.Utils.escHtml(field.label.split(' ').slice(0, 4).join(' ')) + '</span>';
        html += '<span class="mini-kpi-val" style="color:' + barColor + '">' + displayVal + '</span>';
        html += '</div>';
        html += '<div class="mini-bar-wrap"><div class="mini-bar" style="width:' + pct + '%;background:' + barColor + '"></div></div>';
        html += '</div>';
      });
      html += '</div>';

      // Blocage en italique
      if (entry.blocages && entry.blocages.trim()) {
        html += '<p class="collab-dash-blocage">&ldquo;' + BC.Utils.escHtml(entry.blocages.trim().substring(0, 80)) + (entry.blocages.trim().length > 80 ? '…' : '') + '&rdquo;</p>';
      }

      // Date dernière saisie
      html += '<div class="collab-dash-date">Saisie le ' + BC.Utils.formatDate(entry.timestamp) + '</div>';
    }

    html += '</div>'; // .collab-dash-card
    return html;
  },

  /** Rend les graphiques SVG */
  _renderCharts: function (allEntries, currentWeek) {
    var weeks = BC.Storage.getWeeks();

    // ── Line chart : CA cumulé équipe par semaine ──
    var caByWeek = weeks.map(function (w) {
      var entries = allEntries.filter(function (e) { return e.semaine === w; });
      var ca = entries.reduce(function (sum, e) {
        return sum + (e.ca_cumule || 0) + (e.ca_pole_cumule || 0);
      }, 0);
      return ca;
    });
    BC.Charts.renderLineChart('chart-line', weeks, caByWeek);

    // ── Bar chart : Recouvrement David ──
    var davidEntries = allEntries
      .filter(function (e) { return e.collaborateur === 'David' && e.recouvrement_semaine !== undefined; })
      .sort(function (a, b) { return a.semaine > b.semaine ? 1 : -1; });
    var davidWeeks = davidEntries.map(function (e) { return e.semaine; });
    var davidValues = davidEntries.map(function (e) { return e.recouvrement_semaine || 0; });
    BC.Charts.renderBarChart('chart-bars', davidWeeks, davidValues, 10000);

    // ── Donut : répartition des statuts ──
    var counts = { vert: 0, orange: 0, rouge: 0 };
    BC.COLLABORATEURS_ORDER.forEach(function (key) {
      counts[BC.getCollaborateurStatus(key)]++;
    });
    BC.Charts.renderDonutChart('chart-donut', counts);
  },

  /** Ouvre le modal détail d'un collaborateur */
  openModal: function (key) {
    var config = BC.COLLABORATEURS[key];
    var entry = BC.Storage.getLatestEntry(key);
    var status = BC.getCollaborateurStatus(key);
    var statusColor = BC.statusColor(status);

    var html = '<button class="modal-close" onclick="BC.Dashboard.closeModal()">&times;</button>';
    html += '<div class="modal-hero" style="border-color:' + config.color + '44">';
    html += '<div class="modal-avatar" style="background:' + config.color + '22;border-color:' + config.color + ';color:' + config.color + '">' + config.initials + '</div>';
    html += '<div><h2 class="modal-name">' + BC.Utils.escHtml(config.name) + '</h2>';
    html += '<p class="modal-role">' + BC.Utils.escHtml(config.role) + '</p></div>';
    html += '<div class="modal-status" style="background:' + statusColor + '22;color:' + statusColor + ';border:1px solid ' + statusColor + '44">';
    html += BC.statusEmoji(status) + ' ' + BC.statusLabel(status) + '</div>';
    html += '</div>';

    if (!entry) {
      html += '<p class="modal-nosaisie">Aucune saisie récente — ce collaborateur n\'a pas encore saisi cette semaine.</p>';
    } else {
      html += '<div class="modal-fields">';
      config.fields.forEach(function (field) {
        var val = entry[field.key];
        if (val === undefined || val === null) return;
        if (field.type === 'text' && !val) return;

        var displayVal;
        if (field.type === 'boolean') displayVal = val ? 'Oui' : 'Non';
        else if (field.type === 'slider') displayVal = val + ' / ' + field.max;
        else if (field.unit) displayVal = BC.Utils.formatEur(val).replace('€', '') + (field.unit === '€' ? '€' : ' ' + field.unit);
        else displayVal = String(val);

        var ratio = BC.computeFieldRatio(val, field);
        var barColor = ratio === null ? '#64748B' : (ratio >= 0.8 ? '#10B981' : ratio >= 0.6 ? '#F59E0B' : '#EF4444');
        var pct = ratio !== null ? Math.min(100, Math.round(ratio * 100)) : null;

        html += '<div class="modal-field">';
        html += '<div class="modal-field-row">';
        html += '<span class="modal-field-label">' + BC.Utils.escHtml(field.label) + '</span>';
        html += '<span class="modal-field-val" style="color:' + barColor + '">' + BC.Utils.escHtml(displayVal) + '</span>';
        html += '</div>';
        if (pct !== null) {
          html += '<div class="mini-bar-wrap" style="margin-top:4px"><div class="mini-bar" style="width:' + pct + '%;background:' + barColor + '"></div></div>';
        }
        if (field.objectifLabel) {
          html += '<div class="modal-field-hint">' + BC.Utils.escHtml(field.objectifLabel) + '</div>';
        }
        html += '</div>';
      });
      html += '</div>';

      if (entry.blocages && entry.blocages.trim()) {
        html += '<div class="modal-blocage">';
        html += '<div class="modal-blocage-title">Blocages / Notes</div>';
        html += '<p class="modal-blocage-text">' + BC.Utils.escHtml(entry.blocages) + '</p>';
        html += '</div>';
      }

      html += '<div class="modal-footer">Saisie du ' + BC.Utils.formatDate(entry.timestamp) + ' &mdash; Semaine ' + BC.Utils.escHtml(entry.semaine) + '</div>';
    }

    html += '<div class="modal-actions">';
    html += '<a href="#/saisie/' + key + '" class="btn-primary" onclick="BC.Dashboard.closeModal()">Modifier la saisie</a>';
    html += '</div>';

    var drawer = document.getElementById('modal-drawer');
    var overlay = document.getElementById('modal-overlay');
    if (drawer && overlay) {
      drawer.innerHTML = html;
      drawer.style.display = 'flex';
      overlay.style.display = 'block';
      setTimeout(function () {
        drawer.classList.add('modal-drawer--open');
      }, 10);
    }
  },

  /** Ferme le modal */
  closeModal: function () {
    var drawer = document.getElementById('modal-drawer');
    var overlay = document.getElementById('modal-overlay');
    if (drawer && overlay) {
      drawer.classList.remove('modal-drawer--open');
      setTimeout(function () {
        drawer.style.display = 'none';
        overlay.style.display = 'none';
      }, 300);
    }
  }
};
