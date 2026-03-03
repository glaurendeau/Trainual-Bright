/* data.js — Configuration des collaborateurs Bright Conseil
 * Contient les champs, objectifs et données de démonstration
 */
var BC = window.BC || {};

// ────────────────────────────────────────────────────
// CONFIG COLLABORATEURS + CHAMPS + OBJECTIFS
// ────────────────────────────────────────────────────
BC.COLLABORATEURS = {
  Gerard: {
    name: 'Gérard',
    role: 'Chef de mission / Manager',
    color: '#3B82F6',
    initials: 'GÉ',
    fields: [
      {
        key: 'ca_cumule',
        label: 'CA cumulé depuis octobre',
        type: 'number',
        unit: '€',
        placeholder: 'Ex : 95 000',
        objectif: 120000,
        objectifDir: 'min', // min = atteindre au moins cette valeur
        objectifLabel: 'Objectif : ≥ 120 000 €',
        isObjective: true
      },
      {
        key: 'dossiers_retard',
        label: 'Dossiers avec avancement < 85 %',
        type: 'number',
        placeholder: 'Ex : 1',
        objectif: 2,
        objectifDir: 'max', // max = ne pas dépasser
        objectifLabel: 'Objectif : ≤ 2',
        isObjective: true
      },
      {
        key: 'point_juniors',
        label: 'Point hebdo effectué avec les juniors',
        type: 'boolean',
        objectifLabel: 'Objectif : Oui',
        isObjective: true
      },
      {
        key: 'dossier_complexe_signale',
        label: 'Dossier complexe signalé à Geoffrey',
        type: 'boolean',
        objectifLabel: 'Informatif',
        isObjective: false
      },
      {
        key: 'blocages',
        label: 'Blocages / Notes libres',
        type: 'text',
        optional: true,
        placeholder: 'Décrivez les éventuels blocages ou points à noter…'
      }
    ]
  },

  Timothee: {
    name: 'Timothée',
    role: 'Chef de mission senior',
    color: '#8B5CF6',
    initials: 'TI',
    fields: [
      {
        key: 'ca_cumule',
        label: 'CA cumulé depuis octobre',
        type: 'number',
        unit: '€',
        placeholder: 'Ex : 130 000',
        objectif: 152000,
        objectifDir: 'min',
        objectifLabel: 'Objectif : ≥ 152 000 €',
        isObjective: true
      },
      {
        key: 'retards_non_justifies',
        label: 'Retards non anticipés cette semaine',
        type: 'number',
        placeholder: 'Ex : 0',
        objectif: 0,
        objectifDir: 'max',
        objectifLabel: 'Objectif : 0',
        isObjective: true
      },
      {
        key: 'partage_equipe_mois',
        label: 'Partage technique effectué ce mois',
        type: 'boolean',
        objectifLabel: 'Objectif : Oui',
        isObjective: true
      },
      {
        key: 'blocages',
        label: 'Blocages / Notes libres',
        type: 'text',
        optional: true,
        placeholder: 'Décrivez les éventuels blocages…'
      }
    ]
  },

  Hugo: {
    name: 'Hugo',
    role: 'Business coach',
    color: '#06B6D4',
    initials: 'HU',
    fields: [
      {
        key: 'ca_cumule',
        label: 'CA cumulé depuis octobre',
        type: 'number',
        unit: '€',
        placeholder: 'Ex : 89 500',
        objectif: 108000,
        objectifDir: 'min',
        objectifLabel: 'Objectif : ≥ 108 000 €',
        isObjective: true
      },
      {
        key: 'rdv_clients_semaine',
        label: 'RDV clients réalisés cette semaine',
        type: 'number',
        placeholder: 'Ex : 3',
        objectif: 3,
        objectifDir: 'min',
        objectifLabel: 'Objectif : ≥ 3',
        isObjective: true
      },
      {
        key: 'charge_ressentie',
        label: 'Charge de travail ressentie',
        type: 'slider',
        min: 1,
        max: 5,
        objectif: 4,
        objectifDir: 'max',
        objectifLabel: 'Objectif : ≤ 4  (5 = Alerte automatique)',
        isObjective: true,
        alerteAt5: true,
        sliderLabels: ['Légère', 'Faible', 'Modérée', 'Forte', 'Critique']
      },
      {
        key: 'blocages',
        label: 'Blocages / Notes libres',
        type: 'text',
        optional: true,
        placeholder: 'Décrivez les éventuels blocages…'
      }
    ]
  },

  Pascale: {
    name: 'Pascale',
    role: 'Cheffe de mission',
    color: '#EC4899',
    initials: 'PA',
    fields: [
      {
        key: 'tx_dossiers_traites',
        label: '% dossiers traités / planifiés ce mois',
        type: 'number',
        unit: '%',
        placeholder: 'Ex : 90',
        min: 0,
        max: 100,
        objectif: 90,
        objectifDir: 'min',
        objectifLabel: 'Objectif : ≥ 90 %',
        isObjective: true
      },
      {
        key: 'retards_non_justifies',
        label: 'Retards non anticipés',
        type: 'number',
        placeholder: 'Ex : 0',
        objectif: 0,
        objectifDir: 'max',
        objectifLabel: 'Objectif : 0',
        isObjective: true
      },
      {
        key: 'transmissions_trimestre',
        label: 'Dossiers transmis ce trimestre',
        type: 'number',
        placeholder: 'Ex : 1',
        objectif: 1,
        objectifDir: 'min',
        objectifLabel: 'Objectif : ≥ 1',
        isObjective: true
      },
      {
        key: 'blocages',
        label: 'Blocages / Notes libres',
        type: 'text',
        optional: true,
        placeholder: 'Décrivez les éventuels blocages…'
      }
    ]
  },

  Antho: {
    name: 'Antho',
    role: 'Business coach 3/5',
    color: '#F59E0B',
    initials: 'AN',
    fields: [
      {
        key: 'ca_cumule',
        label: 'CA cumulé depuis octobre',
        type: 'number',
        unit: '€',
        placeholder: 'Ex : 52 000',
        objectif: 70000,
        objectifDir: 'min',
        objectifLabel: 'Objectif : ≥ 70 000 €',
        isObjective: true
      },
      {
        key: 'retards_declarations',
        label: 'Retards de déclarations fiscales ce mois',
        type: 'number',
        placeholder: 'Ex : 0',
        objectif: 0,
        objectifDir: 'max',
        objectifLabel: 'Objectif : 0',
        isObjective: true
      },
      {
        key: 'point_gerard',
        label: 'Point hebdo avec Gérard effectué',
        type: 'boolean',
        objectifLabel: 'Objectif : Oui',
        isObjective: true
      },
      {
        key: 'ton_emails',
        label: 'Auto-évaluation ton des emails clients',
        type: 'slider',
        min: 1,
        max: 5,
        objectif: 4,
        objectifDir: 'min',
        objectifLabel: 'Objectif : ≥ 4',
        isObjective: true,
        sliderLabels: ['Trop froid', 'Distant', 'Neutre', 'Chaleureux', 'Excellent']
      },
      {
        key: 'blocages',
        label: 'Blocages / Notes libres',
        type: 'text',
        optional: true,
        placeholder: 'Décrivez les éventuels blocages…'
      }
    ]
  },

  Vincent: {
    name: 'Vincent',
    role: 'Junior 3/5',
    color: '#10B981',
    initials: 'VI',
    fields: [
      {
        key: 'declarations_tva_mois',
        label: 'Déclarations TVA réalisées ce mois',
        type: 'number',
        placeholder: 'Ex : 18',
        objectif: 20,
        objectifDir: 'min',
        objectifLabel: 'Objectif : ≥ 20',
        isObjective: true
      },
      {
        key: 'rdv_clients_semaine',
        label: 'RDV clients réalisés cette semaine',
        type: 'number',
        placeholder: 'Ex : 1',
        objectif: 1,
        objectifDir: 'min',
        objectifLabel: 'Objectif : ≥ 1',
        isObjective: true
      },
      {
        key: 'blocage_signale_avant',
        label: 'Blocage signalé à Gérard avant deadline',
        type: 'boolean',
        objectifLabel: 'Objectif : Oui si blocage',
        isObjective: false
      },
      {
        key: 'blocages',
        label: 'Blocages / Notes libres',
        type: 'text',
        optional: true,
        placeholder: 'Décrivez les éventuels blocages…'
      }
    ]
  },

  Nadege: {
    name: 'Nadège',
    role: 'Responsable pôle social',
    color: '#F97316',
    initials: 'NA',
    fields: [
      {
        key: 'ca_pole_cumule',
        label: 'CA pôle social cumulé depuis octobre',
        type: 'number',
        unit: '€',
        placeholder: 'Ex : 98 000',
        objectif: 110000,
        objectifDir: 'min',
        objectifLabel: 'Objectif : ≥ 110 000 €',
        isObjective: true
      },
      {
        key: 'bulletins_retard_mois',
        label: 'Bulletins de salaire en retard ce mois',
        type: 'number',
        placeholder: 'Ex : 0',
        objectif: 0,
        objectifDir: 'max',
        objectifLabel: 'Objectif : 0',
        isObjective: true
      },
      {
        key: 'charge_matheo',
        label: 'Charge ressentie de Mathéo',
        type: 'slider',
        min: 1,
        max: 5,
        objectif: 3,
        objectifDir: 'max',
        objectifLabel: 'Objectif : ≤ 3',
        isObjective: true,
        sliderLabels: ['Très légère', 'Légère', 'Modérée', 'Forte', 'Critique']
      },
      {
        key: 'blocages',
        label: 'Blocages / Notes libres',
        type: 'text',
        optional: true,
        placeholder: 'Décrivez les éventuels blocages…'
      }
    ]
  },

  Matheo: {
    name: 'Mathéo',
    role: 'Assistant social',
    color: '#14B8A6',
    initials: 'MA',
    fields: [
      {
        key: 'taches_dans_delais_pct',
        label: '% tâches livrées dans les délais ce mois',
        type: 'number',
        unit: '%',
        placeholder: 'Ex : 95',
        min: 0,
        max: 100,
        objectif: 100,
        objectifDir: 'min',
        objectifLabel: 'Objectif : 100 %',
        isObjective: true
      },
      {
        key: 'blocage_signale_avant',
        label: 'Blocage signalé à Nadège avant deadline',
        type: 'boolean',
        objectifLabel: 'Objectif : Oui si blocage',
        isObjective: false
      },
      {
        key: 'blocages',
        label: 'Blocages / Notes libres',
        type: 'text',
        optional: true,
        placeholder: 'Décrivez les éventuels blocages…'
      }
    ]
  },

  David: {
    name: 'David',
    role: 'Admin / Recouvrement',
    color: '#6366F1',
    initials: 'DA',
    fields: [
      {
        key: 'recouvrement_semaine',
        label: 'Montant encaissé cette semaine',
        type: 'number',
        unit: '€',
        placeholder: 'Ex : 10 000',
        objectif: 10000,
        objectifDir: 'min',
        objectifLabel: 'Objectif : ≥ 10 000 €',
        isObjective: true
      },
      {
        key: 'relances_semaine',
        label: 'Relances effectuées cette semaine',
        type: 'number',
        placeholder: 'Ex : 10',
        objectif: 10,
        objectifDir: 'min',
        objectifLabel: 'Objectif : ≥ 10',
        isObjective: true
      },
      {
        key: 'taches_bloquantes',
        label: 'Tâches admin bloquant un collègue > 48 h',
        type: 'number',
        placeholder: 'Ex : 0',
        objectif: 0,
        objectifDir: 'max',
        objectifLabel: 'Objectif : 0',
        isObjective: true
      },
      {
        key: 'blocages',
        label: 'Blocages / Notes libres',
        type: 'text',
        optional: true,
        placeholder: 'Décrivez les éventuels blocages…'
      }
    ]
  }
};

// Ordre d'affichage des collaborateurs
BC.COLLABORATEURS_ORDER = [
  'Gerard', 'Timothee', 'Hugo', 'Pascale', 'Antho',
  'Vincent', 'Nadege', 'Matheo', 'David'
];

// ────────────────────────────────────────────────────
// DONNÉES DE DÉMONSTRATION
// 6 collaborateurs ont saisi — Pascale, Mathéo, David n'ont pas encore saisi
// ────────────────────────────────────────────────────
BC.DEMO_DATA = [
  // ── Semaine W10 (semaine courante) ──
  {
    collaborateur: 'Gerard', semaine: '2026-W10',
    timestamp: Date.now() - 1 * 86400000,
    ca_cumule: 95000, dossiers_retard: 1,
    point_juniors: true, dossier_complexe_signale: false,
    blocages: ''
  },
  {
    collaborateur: 'Timothee', semaine: '2026-W10',
    timestamp: Date.now() - 2 * 86400000,
    ca_cumule: 130000, retards_non_justifies: 0,
    partage_equipe_mois: true,
    blocages: ''
  },
  {
    collaborateur: 'Hugo', semaine: '2026-W10',
    timestamp: Date.now() - 1 * 86400000,
    ca_cumule: 89500, rdv_clients_semaine: 4, charge_ressentie: 3,
    blocages: 'Client Dupont veut avancer la réunion stratégique — à confirmer avec Geoffrey.'
  },
  {
    collaborateur: 'Antho', semaine: '2026-W10',
    timestamp: Date.now() - 1 * 86400000,
    ca_cumule: 52000, retards_declarations: 0,
    point_gerard: true, ton_emails: 4,
    blocages: ''
  },
  {
    collaborateur: 'Vincent', semaine: '2026-W10',
    timestamp: Date.now() - 1 * 86400000,
    declarations_tva_mois: 18, rdv_clients_semaine: 1,
    blocage_signale_avant: true,
    blocages: 'Difficultés sur le dossier Martin — logiciel comptable qui bug.'
  },
  {
    collaborateur: 'Nadege', semaine: '2026-W10',
    timestamp: Date.now() - 1 * 86400000,
    ca_pole_cumule: 98000, bulletins_retard_mois: 0, charge_matheo: 2,
    blocages: ''
  },

  // ── Semaine W09 ──
  {
    collaborateur: 'Gerard', semaine: '2026-W09',
    timestamp: Date.now() - 8 * 86400000,
    ca_cumule: 78000, dossiers_retard: 2,
    point_juniors: true, dossier_complexe_signale: false, blocages: ''
  },
  {
    collaborateur: 'Timothee', semaine: '2026-W09',
    timestamp: Date.now() - 9 * 86400000,
    ca_cumule: 110000, retards_non_justifies: 1,
    partage_equipe_mois: false,
    blocages: 'Formation client reportée à la semaine suivante.'
  },
  {
    collaborateur: 'Hugo', semaine: '2026-W09',
    timestamp: Date.now() - 8 * 86400000,
    ca_cumule: 72000, rdv_clients_semaine: 3, charge_ressentie: 4, blocages: ''
  },
  {
    collaborateur: 'Antho', semaine: '2026-W09',
    timestamp: Date.now() - 8 * 86400000,
    ca_cumule: 41000, retards_declarations: 1,
    point_gerard: true, ton_emails: 3,
    blocages: 'Client difficile à joindre — 3 tentatives sans réponse.'
  },
  {
    collaborateur: 'Vincent', semaine: '2026-W09',
    timestamp: Date.now() - 8 * 86400000,
    declarations_tva_mois: 14, rdv_clients_semaine: 1,
    blocage_signale_avant: false, blocages: ''
  },
  {
    collaborateur: 'Nadege', semaine: '2026-W09',
    timestamp: Date.now() - 8 * 86400000,
    ca_pole_cumule: 82000, bulletins_retard_mois: 0, charge_matheo: 2, blocages: ''
  },
  {
    collaborateur: 'David', semaine: '2026-W09',
    timestamp: Date.now() - 8 * 86400000,
    recouvrement_semaine: 12500, relances_semaine: 14, taches_bloquantes: 0, blocages: ''
  },

  // ── Semaine W08 ──
  {
    collaborateur: 'Gerard', semaine: '2026-W08',
    timestamp: Date.now() - 15 * 86400000,
    ca_cumule: 61000, dossiers_retard: 3,
    point_juniors: false, dossier_complexe_signale: true,
    blocages: 'Dossier Lebrun complexe — expertise fiscale nécessaire, à voir avec Geoffrey.'
  },
  {
    collaborateur: 'Timothee', semaine: '2026-W08',
    timestamp: Date.now() - 16 * 86400000,
    ca_cumule: 88000, retards_non_justifies: 0,
    partage_equipe_mois: true, blocages: ''
  },
  {
    collaborateur: 'Hugo', semaine: '2026-W08',
    timestamp: Date.now() - 15 * 86400000,
    ca_cumule: 55000, rdv_clients_semaine: 2, charge_ressentie: 4,
    blocages: 'Agenda surchargé cette semaine.'
  },
  {
    collaborateur: 'Nadege', semaine: '2026-W08',
    timestamp: Date.now() - 15 * 86400000,
    ca_pole_cumule: 65000, bulletins_retard_mois: 2, charge_matheo: 4,
    blocages: 'Pic de charge fin de mois — retards exceptionnels.'
  },
  {
    collaborateur: 'David', semaine: '2026-W08',
    timestamp: Date.now() - 15 * 86400000,
    recouvrement_semaine: 8200, relances_semaine: 9, taches_bloquantes: 1,
    blocages: 'Blocage sur le dossier Rousseau — attente signature direction.'
  }
];
