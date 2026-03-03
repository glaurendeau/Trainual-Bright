# Bright Conseil — Application Saisie Hebdomadaire

Application web interne pour le cabinet d'expertise comptable **Bright Conseil** (9 salariés).

## Fonctionnalités

- **Page de saisie collaborateur** : chaque salarié remplit ses indicateurs chaque vendredi en moins de 5 minutes
- **Dashboard dirigeant** : Geoffrey voit en temps réel l'état de l'équipe avec KPIs, graphiques et alertes
- **Données persistantes** : localStorage (pas de backend requis)
- **Données de démo** : pré-chargées au premier lancement pour 6 des 9 collaborateurs

## Lancement

### Option 1 — Serveur HTTP intégré (recommandé)

```bash
# Si http-server est installé :
npx http-server . -p 8080 --cors
# Ouvrir : http://localhost:8080

# Ou avec serve :
npx serve . -p 8080
# Ouvrir : http://localhost:8080
```

### Option 2 — Serveur Python (si disponible)

```bash
python3 -m http.server 8080
# Ouvrir : http://localhost:8080
```

### Option 3 — Ouverture directe (déconseillé)

Le fichier `index.html` peut être ouvert directement dans un navigateur,
mais certains navigateurs bloquent les scripts locaux pour des raisons de sécurité.
Préférer l'option 1 ou 2.

## Navigation

| Route                       | Description                          |
|-----------------------------|--------------------------------------|
| `http://localhost:8080/#/`  | Page d'accueil — sélection collaborateur |
| `#/saisie/Gerard`           | Formulaire pour Gérard               |
| `#/saisie/Timothee`         | Formulaire pour Timothée             |
| `#/saisie/Hugo`             | Formulaire pour Hugo                 |
| `#/saisie/Pascale`          | Formulaire pour Pascale              |
| `#/saisie/Antho`            | Formulaire pour Antho                |
| `#/saisie/Vincent`          | Formulaire pour Vincent              |
| `#/saisie/Nadege`           | Formulaire pour Nadège               |
| `#/saisie/Matheo`           | Formulaire pour Mathéo               |
| `#/saisie/David`            | Formulaire pour David                |
| `#/dashboard`               | Dashboard Geoffrey                   |

## Structure du projet

```
bright-conseil/
├── index.html          # Point d'entrée
├── README.md           # Ce fichier
└── src/
    ├── app.css         # Styles (thème sombre, glassmorphism, responsive)
    ├── data.js         # Config collaborateurs + objectifs + données démo
    ├── storage.js      # Opérations localStorage
    ├── status.js       # Calcul des statuts (vert/orange/rouge)
    ├── utils.js        # Fonctions utilitaires (semaine, formatage, routing)
    ├── charts.js       # Graphiques SVG (ligne, barres, donut)
    ├── forms.js        # Page de saisie collaborateur
    ├── dashboard.js    # Dashboard dirigeant
    └── app.js          # Routeur principal
```

## Logique des statuts automatiques

| Statut   | Condition                                                                 |
|----------|---------------------------------------------------------------------------|
| 🟢 OK     | Tous les indicateurs ≥ 80 % de la cible                                  |
| 🟡 Attention | Au moins 1 indicateur entre 60 % et 80 % de la cible                |
| 🔴 Alerte | Au moins 1 indicateur < 60 % de la cible OU charge ressentie ≥ 5 OU pas de saisie depuis 8 jours |

## Réinitialiser les données

Pour effacer les données et recommencer avec les données de démo :

```javascript
// Dans la console du navigateur :
localStorage.removeItem('bright-conseil-entries');
location.reload();
```

## Collaborateurs et objectifs

| Collaborateur | Rôle                      | Indicateurs principaux                    |
|---------------|---------------------------|-------------------------------------------|
| Gérard        | Chef de mission / Manager | CA ≥ 120k€, dossiers retard ≤ 2          |
| Timothée      | Chef de mission senior    | CA ≥ 152k€, retards = 0                  |
| Hugo          | Business coach            | CA ≥ 108k€, RDV ≥ 3, charge ≤ 4         |
| Pascale       | Cheffe de mission         | Dossiers traités ≥ 90%, retards = 0      |
| Antho         | Business coach 3/5        | CA ≥ 70k€, retards décla = 0             |
| Vincent       | Junior 3/5                | TVA ≥ 20/mois, RDV ≥ 1/semaine           |
| Nadège        | Resp. pôle social         | CA pôle ≥ 110k€, bulletins retard = 0    |
| Mathéo        | Assistant social          | Tâches dans délais = 100%                |
| David         | Admin / Recouvrement      | Recouvrement ≥ 10k€/sem, relances ≥ 10  |

---

*Application développée pour Bright Conseil — Mars 2026*
