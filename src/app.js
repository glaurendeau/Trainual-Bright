/* app.js — Point d'entrée principal, routeur hash-based
 * Routes : #/  → sélection collaborateur
 *          #/saisie/:key → formulaire collaborateur
 *          #/dashboard   → dashboard Geoffrey
 */
var BC = window.BC || {};

BC.App = {

  /** Initialise l'application */
  init: function () {
    // Charger les données de démo si localStorage vide
    BC.Storage.initDemoData();

    // Écouter les changements de route
    window.addEventListener('hashchange', function () {
      BC.App.route();
    });

    // Naviguer vers la route courante (ou accueil)
    BC.App.route();
  },

  /** Routeur principal */
  route: function () {
    var hash = window.location.hash || '#/';
    // Retirer le # initial
    var path = hash.replace(/^#/, '') || '/';

    if (path === '/' || path === '') {
      BC.Forms.renderSelectionPage();

    } else if (path.startsWith('/saisie/')) {
      var key = path.replace('/saisie/', '');
      if (BC.COLLABORATEURS[key]) {
        BC.Forms.renderForm(key);
      } else {
        BC.Utils.navigate('/');
      }

    } else if (path === '/dashboard') {
      BC.Dashboard.render();

    } else {
      BC.Utils.navigate('/');
    }
  }
};

// Démarrer quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function () {
  BC.App.init();
});
