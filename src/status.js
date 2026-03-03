/* status.js — Calcul des statuts des collaborateurs
 * Logique métier : vert / orange / rouge selon les indicateurs
 */
var BC = window.BC || {};

/**
 * Calcule le ratio de performance pour un champ donné.
 * @param {*} value       Valeur saisie
 * @param {object} field  Config du champ
 * @returns {number|null} Ratio 0–1, ou null si non applicable
 */
BC.computeFieldRatio = function (value, field) {
  if (!field.isObjective) return null;
  if (field.type === 'text') return null;
  if (value === null || value === undefined || value === '') return null;

  // Champ booléen objectif
  if (field.type === 'boolean') {
    return value ? 1.0 : 0.0;
  }

  // Champs numériques et sliders
  var objectif = field.objectif;
  var v = parseFloat(value);
  if (isNaN(v)) return null;

  if (field.objectifDir === 'min') {
    // "Atteindre au moins X" — plus c'est élevé, mieux c'est
    if (objectif === 0) return v >= 0 ? 1.0 : 0.0;
    return Math.min(1.0, v / objectif);
  }

  if (field.objectifDir === 'max') {
    // "Ne pas dépasser X" — plus c'est bas, mieux c'est
    if (objectif === 0) return v === 0 ? 1.0 : 0.0; // Zéro tolérance
    return v <= objectif ? 1.0 : objectif / v;
  }

  return null;
};

/**
 * Calcule le statut global (vert/orange/rouge) d'une entrée.
 * Règles :
 *   vert   = tous les ratios ≥ 0.8
 *   orange = au moins 1 ratio entre 0.6 et 0.8
 *   rouge  = au moins 1 ratio < 0.6  OU charge ressentie ≥ 5
 *
 * @param {object} entry             Données saisies
 * @param {string} collaborateurKey  Clé du collaborateur
 * @returns {'vert'|'orange'|'rouge'}
 */
BC.computeStatus = function (entry, collaborateurKey) {
  if (!entry) return 'rouge';
  var config = BC.COLLABORATEURS[collaborateurKey];
  if (!config) return 'rouge';

  // Alerte automatique si charge ressentie = 5 (max)
  if (entry.charge_ressentie >= 5) return 'rouge';
  if (entry.charge_matheo >= 5) return 'rouge';

  var ratios = [];
  config.fields.forEach(function (field) {
    if (!field.isObjective || field.type === 'text') return;
    var v = entry[field.key];
    var ratio = BC.computeFieldRatio(v, field);
    if (ratio !== null) ratios.push(ratio);
  });

  if (ratios.length === 0) return 'orange'; // Données insuffisantes

  var minRatio = Math.min.apply(null, ratios);
  if (minRatio >= 0.8) return 'vert';
  if (minRatio >= 0.6) return 'orange';
  return 'rouge';
};

/**
 * Statut final d'un collaborateur (inclut la vérification de la dernière saisie).
 * Absence de saisie depuis 8 jours → rouge automatique.
 */
BC.getCollaborateurStatus = function (collaborateurKey) {
  if (!BC.Storage.hasRecentEntry(collaborateurKey)) return 'rouge';
  var entry = BC.Storage.getLatestEntry(collaborateurKey);
  return BC.computeStatus(entry, collaborateurKey);
};

/**
 * Retourne la couleur CSS associée à un statut.
 */
BC.statusColor = function (status) {
  return { vert: '#10B981', orange: '#F59E0B', rouge: '#EF4444' }[status] || '#94A3B8';
};

/**
 * Retourne l'emoji associé à un statut.
 */
BC.statusEmoji = function (status) {
  return { vert: '🟢', orange: '🟡', rouge: '🔴' }[status] || '⚪';
};

/**
 * Retourne le libellé associé à un statut.
 */
BC.statusLabel = function (status) {
  return { vert: 'OK', orange: 'Attention', rouge: 'Alerte' }[status] || 'Inconnu';
};
