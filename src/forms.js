/* forms.js — Page de saisie hebdomadaire
 * Rendu du formulaire dynamique par collaborateur
 */
var BC = window.BC || {};

BC.Forms = {

  /** État courant du formulaire */
  _state: {
    collaborateur: null,
    values: {},
    submitted: false
  },

  /**
   * Affiche la page de sélection du collaborateur.
   */
  renderSelectionPage: function () {
    var week = BC.Utils.getCurrentWeek();
    var html = '<div class="page page-saisie">';
    html += '<header class="page-header"><div class="logo"><span class="logo-dot"></span>Bright Conseil</div>';
    html += '<a href="#/dashboard" class="btn-ghost">Dashboard &rarr;</a></header>';
    html += '<div class="content-center">';
    html += '<h1 class="page-title">Saisie hebdomadaire</h1>';
    html += '<p class="page-subtitle">Semaine <strong>' + week.str + '</strong> &mdash; Sélectionnez votre profil</p>';
    html += '<div class="collaborateur-grid">';

    BC.COLLABORATEURS_ORDER.forEach(function (key) {
      var c = BC.COLLABORATEURS[key];
      var entry = BC.Storage.getLatestEntry(key);
      var weekEntry = BC.Storage.getEntryForWeek(key, week.str);
      var done = !!weekEntry;
      var status = done ? BC.computeStatus(weekEntry, key) : null;

      html += '<button class="collab-card' + (done ? ' collab-card--done' : '') + '" onclick="BC.Utils.navigate(\'/saisie/' + key + '\')" style="--collab-color:' + c.color + '">';
      html += '<div class="collab-avatar" style="background:' + c.color + '22;border-color:' + c.color + '44;color:' + c.color + '">' + c.initials + '</div>';
      html += '<div class="collab-info"><div class="collab-name">' + c.name + '</div><div class="collab-role">' + c.role + '</div></div>';
      if (done) {
        html += '<div class="collab-status-badge status-' + status + '">' + BC.statusEmoji(status) + ' ' + BC.statusLabel(status) + '</div>';
      } else {
        html += '<div class="collab-status-badge status-pending">À saisir</div>';
      }
      html += '</button>';
    });

    html += '</div></div></div>';
    document.getElementById('app').innerHTML = html;
  },

  /**
   * Affiche le formulaire pour un collaborateur donné.
   * @param {string} key
   */
  renderForm: function (key) {
    var config = BC.COLLABORATEURS[key];
    if (!config) {
      BC.Utils.navigate('/');
      return;
    }

    var week = BC.Utils.getCurrentWeek();
    // Pré-remplir avec l'entrée existante si elle existe
    var existing = BC.Storage.getEntryForWeek(key, week.str) || {};

    this._state = { collaborateur: key, values: Object.assign({}, existing), submitted: false };

    var html = '<div class="page page-form">';
    html += '<header class="page-header">';
    html += '<div class="header-left"><a href="#/" class="btn-ghost">&larr; Retour</a>';
    html += '<div class="logo"><span class="logo-dot"></span>Bright Conseil</div></div>';
    html += '<a href="#/dashboard" class="btn-ghost">Dashboard &rarr;</a>';
    html += '</header>';

    html += '<div class="form-container">';
    html += '<div class="form-hero" style="--collab-color:' + config.color + '">';
    html += '<div class="form-avatar" style="background:' + config.color + '22;border-color:' + config.color + ';color:' + config.color + '">' + config.initials + '</div>';
    html += '<div><h1 class="form-name">' + config.name + '</h1>';
    html += '<p class="form-role">' + config.role + '</p>';
    html += '<p class="form-week">Semaine <strong>' + week.str + '</strong></p></div>';
    html += '</div>';

    html += '<form id="saisie-form" onsubmit="BC.Forms.handleSubmit(event)" novalidate>';

    config.fields.forEach(function (field, idx) {
      html += BC.Forms._renderField(field, existing[field.key], idx, config.color);
    });

    html += '<div class="form-actions">';
    html += '<button type="submit" class="btn-primary" id="submit-btn">';
    html += '<span id="submit-label">Enregistrer ma saisie</span>';
    html += '</button>';
    html += '</div>';
    html += '</form>';
    html += '</div></div>';

    document.getElementById('app').innerHTML = html;

    // Attacher les listeners après le rendu
    BC.Forms._attachListeners(config);
    // Mettre à jour les indicateurs visuels avec les valeurs existantes
    if (Object.keys(existing).length > 0) {
      config.fields.forEach(function (field) {
        if (existing[field.key] !== undefined) {
          BC.Forms._updateFieldFeedback(field, existing[field.key]);
        }
      });
    }
  },

  /**
   * Génère le HTML d'un champ de formulaire.
   */
  _renderField: function (field, currentValue, idx, color) {
    var delay = (idx * 60) + 'ms';
    var html = '<div class="field-group" style="animation-delay:' + delay + '" id="fg-' + field.key + '">';
    html += '<label class="field-label" for="f-' + field.key + '">';
    html += BC.Utils.escHtml(field.label);
    if (field.optional) html += ' <span class="field-optional">(optionnel)</span>';
    html += '</label>';

    if (field.type === 'number') {
      var val = (currentValue !== undefined && currentValue !== null) ? currentValue : '';
      html += '<div class="field-input-wrap">';
      html += '<input type="number" id="f-' + field.key + '" name="' + field.key + '"';
      html += ' class="field-input" value="' + BC.Utils.escHtml(String(val)) + '"';
      if (field.min !== undefined) html += ' min="' + field.min + '"';
      if (field.max !== undefined) html += ' max="' + field.max + '"';
      html += ' placeholder="' + BC.Utils.escHtml(field.placeholder || '') + '"';
      html += ' oninput="BC.Forms._onInput(\'' + field.key + '\')">';
      if (field.unit) html += '<span class="field-unit">' + field.unit + '</span>';
      html += '</div>';
      html += '<div class="field-hint">' + BC.Utils.escHtml(field.objectifLabel || '') + '</div>';
      html += '<div class="field-feedback" id="fb-' + field.key + '"></div>';

    } else if (field.type === 'slider') {
      var sliderVal = (currentValue !== undefined && currentValue !== null) ? currentValue : field.min;
      var initPct = Math.round(((sliderVal - field.min) / (field.max - field.min)) * 100);
      html += '<div class="slider-wrap">';
      html += '<input type="range" id="f-' + field.key + '" name="' + field.key + '"';
      html += ' class="field-slider" min="' + field.min + '" max="' + field.max + '"';
      html += ' value="' + sliderVal + '"';
      html += ' oninput="BC.Forms._onSlider(\'' + field.key + '\')" style="--slider-color:' + color + ';--slider-pct:' + initPct + '%">';
      html += '<div class="slider-value-row">';
      html += '<div class="slider-labels">';
      if (field.sliderLabels) {
        field.sliderLabels.forEach(function (lbl, i) {
          html += '<span>' + BC.Utils.escHtml(lbl) + '</span>';
        });
      } else {
        for (var i = field.min; i <= field.max; i++) {
          html += '<span>' + i + '</span>';
        }
      }
      html += '</div>';
      html += '<div class="slider-current" id="sc-' + field.key + '">' + sliderVal + ' / ' + field.max + '</div>';
      html += '</div>';
      html += '</div>';
      html += '<div class="field-hint">' + BC.Utils.escHtml(field.objectifLabel || '') + '</div>';
      html += '<div class="field-feedback" id="fb-' + field.key + '"></div>';

    } else if (field.type === 'boolean') {
      var checked = (currentValue === true || currentValue === 'true');
      html += '<div class="toggle-wrap">';
      html += '<label class="toggle" for="f-' + field.key + '">';
      html += '<input type="checkbox" id="f-' + field.key + '" name="' + field.key + '"' + (checked ? ' checked' : '');
      html += ' onchange="BC.Forms._onToggle(\'' + field.key + '\')">';
      html += '<span class="toggle-slider"></span>';
      html += '</label>';
      html += '<span class="toggle-label" id="tl-' + field.key + '">' + (checked ? 'Oui' : 'Non') + '</span>';
      html += '</div>';
      html += '<div class="field-hint">' + BC.Utils.escHtml(field.objectifLabel || '') + '</div>';

    } else if (field.type === 'text') {
      var textVal = (currentValue !== undefined && currentValue !== null) ? currentValue : '';
      html += '<textarea id="f-' + field.key + '" name="' + field.key + '"';
      html += ' class="field-textarea" rows="3"';
      html += ' placeholder="' + BC.Utils.escHtml(field.placeholder || '') + '"';
      html += ' oninput="BC.Forms._onText(\'' + field.key + '\')">';
      html += BC.Utils.escHtml(textVal);
      html += '</textarea>';
    }

    html += '</div>'; // .field-group
    return html;
  },

  /** Attache les listeners de validation temps réel */
  _attachListeners: function (config) {
    // Les listeners sont inline via oninput/onchange pour compatibilité maximale
  },

  /** Handler : champ numérique modifié */
  _onInput: function (key) {
    var config = BC.COLLABORATEURS[this._state.collaborateur];
    var field = config.fields.find(function (f) { return f.key === key; });
    var input = document.getElementById('f-' + key);
    var value = input ? parseFloat(input.value) : null;
    if (!isNaN(value)) this._state.values[key] = value;
    this._updateFieldFeedback(field, isNaN(value) ? null : value);
  },

  /** Handler : slider modifié */
  _onSlider: function (key) {
    var config = BC.COLLABORATEURS[this._state.collaborateur];
    var field = config.fields.find(function (f) { return f.key === key; });
    var input = document.getElementById('f-' + key);
    var value = input ? parseInt(input.value, 10) : null;
    this._state.values[key] = value;
    // Mettre à jour le label valeur
    var scEl = document.getElementById('sc-' + key);
    if (scEl) scEl.textContent = value + ' / ' + field.max;
    this._updateFieldFeedback(field, value);
    // Mise à jour de la couleur du slider
    var pct = ((value - field.min) / (field.max - field.min)) * 100;
    if (input) input.style.setProperty('--slider-pct', pct + '%');
  },

  /** Handler : toggle modifié */
  _onToggle: function (key) {
    var input = document.getElementById('f-' + key);
    var value = input ? input.checked : false;
    this._state.values[key] = value;
    var label = document.getElementById('tl-' + key);
    if (label) label.textContent = value ? 'Oui' : 'Non';
  },

  /** Handler : texte libre modifié */
  _onText: function (key) {
    var input = document.getElementById('f-' + key);
    this._state.values[key] = input ? input.value : '';
  },

  /**
   * Met à jour le feedback visuel (barre de progression + couleur).
   */
  _updateFieldFeedback: function (field, value) {
    if (!field.isObjective || field.type === 'text' || field.type === 'boolean') return;
    var fb = document.getElementById('fb-' + field.key);
    if (!fb) return;

    if (value === null || value === undefined || value === '') {
      fb.innerHTML = '';
      return;
    }

    var ratio = BC.computeFieldRatio(value, field);
    if (ratio === null) { fb.innerHTML = ''; return; }

    var pct = Math.round(ratio * 100);
    var color, label;
    if (ratio >= 0.8) { color = '#10B981'; label = 'Objectif atteint'; }
    else if (ratio >= 0.6) { color = '#F59E0B'; label = 'Proche de l\'objectif'; }
    else { color = '#EF4444'; label = 'En dessous de l\'objectif'; }

    fb.innerHTML =
      '<div class="progress-bar-wrap">' +
      '<div class="progress-bar" style="width:' + Math.min(100, pct) + '%;background:' + color + '"></div>' +
      '</div>' +
      '<span class="progress-label" style="color:' + color + '">' + pct + '% &mdash; ' + label + '</span>';
  },

  /**
   * Soumission du formulaire.
   */
  handleSubmit: function (event) {
    event.preventDefault();
    var self = BC.Forms;
    var key = self._state.collaborateur;
    var config = BC.COLLABORATEURS[key];
    var week = BC.Utils.getCurrentWeek();

    // Lire toutes les valeurs du DOM
    config.fields.forEach(function (field) {
      var el = document.getElementById('f-' + field.key);
      if (!el) return;
      if (field.type === 'number') {
        var v = parseFloat(el.value);
        self._state.values[field.key] = isNaN(v) ? null : v;
      } else if (field.type === 'slider') {
        self._state.values[field.key] = parseInt(el.value, 10);
      } else if (field.type === 'boolean') {
        self._state.values[field.key] = el.checked;
      } else if (field.type === 'text') {
        self._state.values[field.key] = el.value.trim();
      }
    });

    // Construire l'entrée
    var entry = Object.assign({}, self._state.values, {
      collaborateur: key,
      semaine: week.str,
      timestamp: Date.now()
    });

    // Sauvegarder
    BC.Storage.save(entry);

    // Afficher la confirmation
    self._renderConfirmation(entry, config);
  },

  /**
   * Affiche la page de confirmation post-soumission.
   */
  _renderConfirmation: function (entry, config) {
    var status = BC.computeStatus(entry, this._state.collaborateur);
    var statusColor = BC.statusColor(status);

    var html = '<div class="page page-confirm">';
    html += '<header class="page-header">';
    html += '<div class="logo"><span class="logo-dot"></span>Bright Conseil</div>';
    html += '<a href="#/dashboard" class="btn-ghost">Dashboard &rarr;</a>';
    html += '</header>';

    html += '<div class="confirm-container">';
    html += '<div class="confirm-icon">&#10003;</div>';
    html += '<h2 class="confirm-title">Saisie enregistrée !</h2>';
    html += '<p class="confirm-subtitle">Merci ' + config.name + ', à la semaine prochaine.</p>';

    // Statut global
    html += '<div class="confirm-status" style="border-color:' + statusColor + '">';
    html += '<span class="status-emoji">' + BC.statusEmoji(status) + '</span>';
    html += '<span class="status-text" style="color:' + statusColor + '">' + BC.statusLabel(status) + '</span>';
    html += '</div>';

    // Récapitulatif des indicateurs
    html += '<div class="confirm-summary">';
    config.fields.forEach(function (field) {
      if (field.type === 'text' || entry[field.key] === undefined || entry[field.key] === null) return;
      var val = entry[field.key];
      var displayVal;
      if (field.type === 'boolean') displayVal = val ? 'Oui' : 'Non';
      else if (field.unit) displayVal = BC.Utils.escHtml(String(val)) + ' ' + field.unit;
      else displayVal = BC.Utils.escHtml(String(val));

      var ratio = BC.computeFieldRatio(val, field);
      var color = '';
      if (ratio !== null) {
        if (ratio >= 0.8) color = '#10B981';
        else if (ratio >= 0.6) color = '#F59E0B';
        else color = '#EF4444';
      }

      html += '<div class="summary-row">';
      html += '<span class="summary-label">' + BC.Utils.escHtml(field.label) + '</span>';
      html += '<span class="summary-value" style="' + (color ? 'color:' + color : '') + '">' + displayVal + '</span>';
      html += '</div>';
    });
    html += '</div>';

    html += '<div class="confirm-actions">';
    html += '<a href="#/" class="btn-secondary">Retour à l\'accueil</a>';
    html += '<a href="#/dashboard" class="btn-primary">Voir le dashboard</a>';
    html += '</div>';
    html += '</div></div>';

    document.getElementById('app').innerHTML = html;
  }
};
