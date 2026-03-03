/* utils.js — Fonctions utilitaires */
var BC = window.BC || {};

BC.Utils = {

  /**
   * Calcule la semaine ISO courante.
   * @returns {{ year: number, week: number, str: string }}
   */
  getCurrentWeek: function () {
    var now = new Date();
    var d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    var day = d.getUTCDay() || 7; // dimanche = 7
    d.setUTCDate(d.getUTCDate() + 4 - day);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    var str = d.getUTCFullYear() + '-W' + String(week).padStart(2, '0');
    return { year: d.getUTCFullYear(), week: week, str: str };
  },

  /**
   * Formate un nombre en monnaie française.
   * @param {number} value
   * @returns {string}
   */
  formatEur: function (value) {
    if (value === null || value === undefined) return '—';
    return Number(value).toLocaleString('fr-FR') + ' €';
  },

  /**
   * Formate un timestamp en date lisible.
   * @param {number} ts
   * @returns {string}
   */
  formatDate: function (ts) {
    if (!ts) return 'Jamais';
    var d = new Date(ts);
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  },

  /**
   * Formate une clé de semaine en libellé lisible.
   * @param {string} semaine  Format "YYYY-WNN"
   * @returns {string}
   */
  formatWeek: function (semaine) {
    if (!semaine) return '';
    var parts = semaine.split('-W');
    if (parts.length !== 2) return semaine;
    return 'S' + parseInt(parts[1], 10);
  },

  /**
   * Calcule le pourcentage d'avancement vers un objectif.
   * @param {number} value
   * @param {object} field
   * @returns {number} Pourcentage 0–100
   */
  fieldPercent: function (value, field) {
    var ratio = BC.computeFieldRatio(value, field);
    if (ratio === null) return 0;
    return Math.round(ratio * 100);
  },

  /**
   * Échappe les caractères HTML pour éviter les injections XSS.
   * @param {string} str
   * @returns {string}
   */
  escHtml: function (str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * Navigue vers une route (hash-based routing).
   * @param {string} route
   */
  navigate: function (route) {
    window.location.hash = route;
  },

  /**
   * Debounce — retarde l'exécution d'une fonction.
   */
  debounce: function (fn, delay) {
    var timer;
    return function () {
      clearTimeout(timer);
      var args = arguments;
      var ctx = this;
      timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
    };
  }
};
