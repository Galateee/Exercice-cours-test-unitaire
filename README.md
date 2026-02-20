# Exercice Tests Unitaires - Application React

![Build and Test](https://github.com/Galateee/Exercice-cours-test-unitaire/actions/workflows/build_test_deploy_react.yml/badge.svg)
[![codecov](https://codecov.io/gh/Galateee/Exercice-cours-test-unitaire/branch/main/graph/badge.svg)](https://codecov.io/gh/Galateee/Exercice-cours-test-unitaire)

Application React dédiée à l'apprentissage des tests unitaires et de l'intégration continue. Ce projet implémente un système de validation de formulaire utilisateur avec une couverture de tests complète et un pipeline CI/CD automatisé.

## Liens

- **[Application en ligne](https://galateee.github.io/Exercice-cours-test-unitaire/)**
- **[Documentation technique](https://galateee.github.io/Exercice-cours-test-unitaire/docs/)**
- **[Rapport de couverture (Codecov)](https://codecov.io/gh/Galateee/Exercice-cours-test-unitaire)**

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Scripts disponibles](#scripts-disponibles)
- [Tests](#tests)
- [Tests E2E (Cypress)](#tests-e2e-cypress)
- [Documentation](#documentation)
- [CI/CD](#cicd)
- [Structure du projet](#structure-du-projet)
- [Technologies utilisées](#technologies-utilisées)

## Fonctionnalités

- **Validation de formulaire utilisateur** avec feedback en temps réel
- **Validation d'unicité d'email** avec vérification en base (détection des doublons)
- **Intégration API RESTful** avec Axios et JSONPlaceholder
- **Gestion d'état asynchrone** avec Context React et API calls
- **Détection automatique de l'autofill Chrome** avec validation instantanée
- **Valid ateurs modulaires** pour :
  - Email (format RFC 5322 + unicité)
  - Âge (18-120 ans avec calcul précis)
  - Nom et prénom (format français)
  - Code postal français (5 chiffres)
- **Navigation SPA** avec React Router (pages Accueil + Inscription)
- **Gestion d'erreurs HTTP** avec notifications toast (400/500/réseau)
- **Tests complets avec mocking** (237 tests Jest + 18 tests Cypress E2E, 100% de couverture)
- **Tests End-to-End** avec Cypress et cy.intercept() mocking
- **CI/CD automatisé** avec GitHub Actions
- **Documentation technique** générée automatiquement
- **Déploiement continu** sur GitHub Pages

### Architecture API

L'application utilise une architecture client-serveur moderne :

- **Client** : React SPA avec Axios pour les requêtes HTTP
- **API** : JSONPlaceholder (https://jsonplaceholder.typicode.com)
  - `GET /users` : Récupération de la liste des utilisateurs
  - `POST /users` : Création d'un nouvel utilisateur
- **État global** : Context React avec opérations asynchrones
- **Gestion d'erreurs** : Try/catch avec toast notifications (react-toastify)

### Fonctionnalités avancées

#### Validation d'unicité d'email

- Détection des emails déjà enregistrés via UserContext (données API)
- Comparaison case-insensitive (test@example.com = TEST@EXAMPLE.COM)
- Message d'erreur explicite : "This email address is already registered"
- Bouton submit désactivé en cas de doublon

#### Détection d'autofill Chrome

- Event listeners sur tous les champs pour capturer l'autocomplétion
- Polling DOM à 100ms et 500ms pour détection initiale
- Validation automatique des champs autofillés
- Fonctionne sans interaction manuelle (pas besoin de cliquer/blur)
- Gestion robuste des éléments DOM manquants

## Prérequis

- **Node.js** >= 20.x
- **npm** >= 9.x
- **Git**

## Installation

```bash
# Cloner le repository
git clone https://github.com/Galateee/Exercice-cours-test-unitaire.git

# Naviguer dans le dossier
cd Exercice-cours-test-unitaire

# Installer les dépendances
npm install
```

## Scripts disponibles

### Développement

```bash
# Démarrer le serveur de développement
npm start
# Ouvre http://localhost:3000
```

### Production

```bash
# Créer le build de production
npm run build

# Déployer sur GitHub Pages
npm run deploy
```

### Tests

```bash
# Lancer les tests en mode watch
npm test

# Lancer les tests avec couverture
npm run test:coverage
```

### Documentation

```bash
# Générer la documentation JSDoc
npm run jsdoc
# Documentation disponible dans public/docs/
```

## Tests

Le projet utilise **Jest** et **React Testing Library** pour les tests unitaires/intégration, et **Cypress** pour les tests E2E, avec une stratégie de mocking complète pour isoler les tests de l'API externe.

### Couverture des tests

- **Tests unitaires** : Tous les validateurs et services sont testés individuellement
- **Tests d'intégration** : Le formulaire React, UserContext, et pages sont testés avec des scénarios réels
- **Tests E2E (Cypress)** : 18 tests de navigation et parcours utilisateur complets avec API mocking
  - 11 tests de navigation nominale et validation
  - 7 tests de résilience aux erreurs API (400, 500, 503, réseau)
- **Couverture** : 100% des branches (237 tests Jest + 18 tests Cypress)
- **Isolation** : Aucun appel réseau réel grâce au mocking (jest.mock + cy.intercept)

**[Plan de test complet (TEST_PLAN.md)](https://github.com/Galateee/Exercice-cours-test-unitaire/blob/main/TEST_PLAN.md)**

### Stratégie de mocking

#### Jest (Tests Unitaires/Intégration)

L'application utilise `jest.mock()` pour isoler les tests des appels API réels :

```javascript
// Mock Axios dans api.test.js
jest.mock("axios");
axios.get.mockResolvedValue({ data: mockUsers });
axios.post.mockResolvedValue({ data: { ...userData, id: 123 } });

// Mock apiService dans UserContext.test.jsx
jest.mock("../services/api");
apiService.getUsers.mockResolvedValue([]);
apiService.createUser.mockResolvedValue({ ...userData, id: 1 });
```

**Scénarios testés** :

- Succès HTTP 200/201 (récupération/création)
- Erreur client 400 (données invalides)
- Erreur serveur 500 (internal server error)
- Erreur réseau (timeout, connexion perdue)

#### Cypress (Tests E2E)

Cypress utilise `cy.intercept()` pour mocker les appels API pendant les tests :

```javascript
// Helper function pour setup unifié
function setupApiIntercepts(existingUsers = []) {
  cy.intercept("GET", "**/users", {
    statusCode: 200,
    body: existingUsers,
  }).as("getUsers");

  cy.intercept("POST", "**/users", (req) => {
    req.reply({
      statusCode: 201,
      body: { ...req.body, id: Date.now() },
    });
  }).as("createUser");
}

// Utilisation dans les tests
beforeEach(() => {
  setupApiIntercepts();
});

cy.visit("/");
cy.wait("@getUsers"); // Synchronisation explicite
// ... actions utilisateur ...
cy.wait("@createUser");
```

**Avantages** :

- Tests déterministes (pas de dépendance réseau)
- Contrôle total des réponses (statuts, délais, erreurs)
- Tests rapides (pas d'appels HTTP réels)
- CI/CD fiable (pas de rate limiting API)

### Exécution locale

```bash
# Tests interactifs
npm test

# Tests avec rapport de couverture
npm run test:coverage

# Rapport disponible dans coverage/lcov-report/index.html
```

### Exemple de test

```javascript
describe("emailValidator", () => {
  it("should validate correct email", () => {
    expect(() => validateEmail("test@example.com")).not.toThrow();
  });

  it("should reject invalid email", () => {
    expect(() => validateEmail("invalid-email")).toThrow(ValidationError);
  });
});
```

## Tests E2E (Cypress)

Le projet implémente des tests End-to-End avec **Cypress** pour valider les parcours utilisateurs complets à travers l'application multi-pages.

### Architecture testée

- **Navigation SPA** avec React Router
- **État partagé** via Context React (UserContext)
- **Persistance des données** entre les pages
- **Scénarios de navigation** complexes

### Scénarios E2E implémentés

#### Scénario Nominal

1. Navigation vers l'Accueil (/) → Vérification "0 utilisateur inscrit" et liste vide
2. Navigation vers le Formulaire (/register)
3. Ajout d'un nouvel utilisateur valide (Jean Dupont)
4. Redirection automatique vers l'Accueil
5. Vérification "1 utilisateur inscrit" ET présence du nouvel utilisateur dans la liste

#### Scénario d'Erreur de Validation

1. Partant de l'état précédent (1 inscrit)
2. Navigation vers le Formulaire
3. Tentative d'ajout invalide (email doublon ou champs vides)
4. Vérification de l'erreur affichée
5. Retour vers l'Accueil
6. Vérification "Toujours 1 utilisateur inscrit" et liste inchangée

#### Scénarios d'Erreur API (Résilience)

Tests de la robustesse de l'application face aux erreurs serveur avec `cy.intercept()` :

1. **Erreur 400 - Données invalides**
   - Mock POST /users → 400 "Email already exists"
   - Vérification : toast d'erreur affiché, aucun utilisateur ajouté, formulaire toujours accessible

2. **Erreur 500 - Serveur down**
   - Mock POST /users → 500 "Internal Server Error"
   - Vérification : toast "Server error. Please try again later.", application ne crash pas

3. **Erreur Réseau - API inaccessible**
   - Mock POST /users → `forceNetworkError: true`
   - Vérification : toast "Network error. Please check your connection.", formulaire reste fonctionnel

4. **Erreur GET - Chargement initial**
   - Mock GET /users → 500 "Database connection failed"
   - Vérification : page Home s'affiche quand même, compteur à 0, pas de crash

5. **Retry après erreur**
   - Premier essai : 400 → erreur affichée
   - Correction email + nouvel essai : 201 → succès
   - Vérification : redirection Home + utilisateur créé

**Isolation complète** : Aucun appel réseau réel ne sort des tests E2E grâce aux intercepts Cypress.

### Exécution locale

```bash
# Mode interactif (interface graphique Cypress)
npm run cypress

# Mode headless (ligne de commande)
npm run cypress:run
# ou
npx cypress run
```

### Sélecteurs robustes

Tous les éléments testés utilisent des attributs `data-cy` pour garantir la stabilité des tests :

```javascript
cy.get("[data-cy='home-page']");
cy.get("[data-cy='user-count']");
cy.get("[data-cy='input-email']");
```

### Intégration CI/CD

Les tests Cypress s'exécutent automatiquement dans le pipeline GitHub Actions en mode headless après les tests unitaires.

## Documentation

La documentation technique est générée automatiquement avec **JSDoc** et déployée avec l'application.

### Accès à la documentation

- **En ligne** : [Documentation technique](https://galateee.github.io/Exercice-cours-test-unitaire/docs/)
- **Local** : `npm run jsdoc` puis ouvrir `public/docs/index.html`

### Modules documentés

- **Validateurs** : `ageValidator`, `emailValidator`, `identityValidator`, `postalCodeValidator`, `userValidator`
- **Composants React** : `UserForm`, `App`, `Home`, `Register`
- **Context** : `UserContext` avec typedef pour types User et UserContextValue
- **Classes** : `ValidationError` avec exemples d'utilisation

## CI/CD

Le projet utilise **GitHub Actions** pour l'intégration et le déploiement continus.

### Pipeline automatisé

```yaml
Trigger: Push sur main
  ↓
Job 1: build_test
  ├─ Checkout code
  ├─ Setup Node.js 20.x
  ├─ Install dependencies
  ├─ Run tests with coverage
  ├─ Upload coverage to Codecov
  ├─ Generate JSDoc
  ├─ Build React app
  └─ Upload artifact
  ↓
Job 2: deploy_pages
  └─ Deploy to GitHub Pages
```

### Fichier workflow

Le workflow est défini dans `.github/workflows/build_test_deploy_react.yml`

### Vérification

Chaque push déclenche automatiquement :

1. Installation des dépendances
2. Exécution de tous les tests
3. Génération du rapport de couverture
4. Upload vers Codecov
5. Génération de la documentation
6. Build de production
7. Déploiement sur GitHub Pages

## Structure du projet

```
Exercice-cours-test-unitaire/
├── .github/
│   └── workflows/
│       └── build_test_deploy_react.yml    # Configuration CI/CD
├── public/
│   ├── docs/                               # Documentation JSDoc générée
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── validators/                         # Modules de validation
│   │   ├── ageValidator.js
│   │   ├── ageValidator.test.js
│   │   ├── emailValidator.js
│   │   ├── emailValidator.test.js
│   │   ├── identityValidator.js
│   │   ├── identityValidator.test.js
│   │   ├── postalCodeValidator.js
│   │   ├── postalCodeValidator.test.js
│   │   ├── userValidator.js
│   │   ├── userValidator.test.js
│   │   └── ValidationError.js
│   ├── App.js                              # Composant principal
│   ├── App.test.js
│   ├── UserForm.jsx                        # Formulaire de validation
│   ├── UserForm.test.jsx
│   └── index.js
├── build/                                  # Build de production (généré)
├── coverage/                               # Rapport de couverture (généré)
├── package.json
├── jest.config.json                        # Configuration Jest
├── jsdoc.config.json                       # Configuration JSDoc
└── README.md
```

## Technologies utilisées

### Frontend

- **React** 19.2.4 - Framework UI (avec hooks : useState, useMemo, useEffect, useContext)
- **React DOM** 19.2.4 - Rendu React
- **React Router DOM** 7.13.0 - Navigation SPA
- **Axios** 1.13.5 - Client HTTP pour appels API RESTful
- **react-toastify** 11.0.3 - Notifications utilisateur (erreurs API, succès)

### API & Services

- **JSONPlaceholder** - API REST publique (typicode.com/users)
- **Context API** - Gestion d'état global asynchrone

### Tests

- **Jest** 27.5.1 - Framework de test avec mocking (jest.mock)
- **React Testing Library** 16.3.2 - Tests de composants React
- **@testing-library/user-event** 14.6.1 - Simulation d'interactions utilisateur
- **Cypress** 15.10.0 - Tests End-to-End avec cy.intercept() mocking

### Outils de développement

- **React Scripts** 5.0.1 - Tooling Create React App
- **JSDoc** 4.0.5 - Génération de documentation
- **Codecov** - Analyse de couverture de code

### CI/CD

- **GitHub Actions** - Intégration et déploiement continus
- **GitHub Pages** - Hébergement de l'application

## Scripts npm

| Script                  | Description                               |
| ----------------------- | ----------------------------------------- |
| `npm start`             | Lance le serveur de développement         |
| `npm test`              | Exécute les tests avec couverture         |
| `npm run build`         | Crée le build de production               |
| `npm run jsdoc`         | Génère la documentation JSDoc             |
| `npm run deploy`        | Déploie sur GitHub Pages                  |
| `npm run test:coverage` | Tests avec rapport de couverture détaillé |
| `npm run cypress`       | Ouvre l'interface graphique Cypress       |
| `npm run cypress:run`   | Exécute les tests E2E en mode headless    |

## Objectifs pédagogiques

Ce projet a été réalisé dans le cadre d'un exercice sur les tests unitaires et l'intégration API :

1. **Tests unitaires** - Validation de fonctions isolées avec mocking
2. **Tests d'intégration** - Validation de composants React avec API mockée
3. **Tests E2E** - Tests de navigation et parcours utilisateur avec Cypress + cy.intercept()
4. **Architecture API** - Intégration RESTful avec Axios et JSONPlaceholder
5. **Mocking avancé** - jest.mock('axios'), cy.intercept(), scénarios d'erreur (400/500)
6. **Architecture SPA** - Navigation multi-pages avec React Router et Context API asynchrone
7. **Gestion d'erreurs** - Try/catch, toast notifications, états loading/error
8. **TDD** - Test-Driven Development avec couverture complète
9. **Couverture de code** - 100% de couverture (237 tests Jest + 18 tests Cypress E2E)
10. **CI/CD** - Pipeline automatisé complet avec tests E2E
11. **Documentation** - Génération automatique avec JSDoc
12. **Déploiement continu** - GitHub Pages

## Auteur

**Robin Vidal - M1 Expert Dev Full Stack**

- GitHub: [@Galateee](https://github.com/Galateee)

## Licence

Ce projet est un exercice pédagogique dans le cadre d'une formation sur les tests unitaires.
