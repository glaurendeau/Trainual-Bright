/* storage.js — Gestion du stockage localStorage
 * Toutes les opérations de lecture/écriture des saisies hebdomadaires
 */
var BC = window.BC || {};

BC.Storage = {
  STORAGE_KEY: 'bright-conseil-entries',

  /** Récupère toutes les entrées stockées */
  getAll: function () {
    try {
      var data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Erreur lecture localStorage:', e);
      return [];
    }
  },

  /** Sauvegarde une entrée (écrase si même collaborateur + même semaine) */
  save: function (entry) {
    var entries = this.getAll();
    var idx = entries.findIndex(function (e) {
      return e.collaborateur === entry.collaborateur && e.semaine === entry.semaine;
    });
    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.push(entry);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
  },

  /** Récupère la dernière entrée d'un collaborateur (toutes semaines confondues) */
  getLatestEntry: function (collaborateurKey) {
    var entries = this.getAll()
      .filter(function (e) { return e.collaborateur === collaborateurKey; })
      .sort(function (a, b) { return b.timestamp - a.timestamp; });
    return entries[0] || null;
  },

  /** Récupère l'entrée d'un collaborateur pour une semaine précise */
  getEntryForWeek: function (collaborateurKey, semaine) {
    return this.getAll().find(function (e) {
      return e.collaborateur === collaborateurKey && e.semaine === semaine;
    }) || null;
  },

  /** Vérifie si un collaborateur a saisi dans les 8 derniers jours */
  hasRecentEntry: function (collaborateurKey) {
    var seuil = Date.now() - 8 * 24 * 3600 * 1000;
    return this.getAll().some(function (e) {
      return e.collaborateur === collaborateurKey && e.timestamp > seuil;
    });
  },

  /** Retourne toutes les semaines distinctes, triées ASC */
  getWeeks: function () {
    var weeks = this.getAll().map(function (e) { return e.semaine; });
    return Array.from(new Set(weeks)).sort();
  },

  /** Récupère les entrées d'une semaine donnée */
  getEntriesForWeek: function (semaine) {
    return this.getAll().filter(function (e) { return e.semaine === semaine; });
  },

  /** Initialise les données de démonstration si le localStorage est vide */
  initDemoData: function () {
    if (this.getAll().length === 0) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(BC.DEMO_DATA));
    }
  },

  /** Efface toutes les données (réinitialisation) */
  clear: function () {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};
