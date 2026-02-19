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
- [Documentation](#documentation)
- [CI/CD](#cicd)
- [Structure du projet](#structure-du-projet)
- [Technologies utilisées](#technologies-utilisées)

## Fonctionnalités

- **Validation de formulaire utilisateur** avec feedback en temps réel
- **Validation d'unicité d'email** avec localStorage (détection des doublons)
- **Détection automatique de l'autofill Chrome** avec validation instantanée
- **Validateurs modulaires** pour :
  - Email (format RFC 5322 + unicité)
  - Âge (18-120 ans avec calcul précis)
  - Nom et prénom (format français)
  - Code postal français (5 chiffres)
- **Tests complets** (190 tests, 100% de couverture)
- **Tests d'intégration** du formulaire React
- **CI/CD automatisé** avec GitHub Actions
- **Documentation technique** générée automatiquement
- **Déploiement continu** sur GitHub Pages

### Fonctionnalités avancées

#### Validation d'unicité d'email

- Détection des emails déjà enregistrés via localStorage
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

Le projet utilise **Jest** et **React Testing Library** pour les tests unitaires et d'intégration.

### Couverture des tests

- **Tests unitaires** : Tous les validateurs sont testés individuellement
- **Tests d'intégration** : Le formulaire React est testé avec des scénarios réels
- **Couverture** : 100% des fonctions, branches et lignes

**[Plan de test complet (TEST_PLAN.md)](https://github.com/Galateee/Exercice-cours-test-unitaire/blob/main/TEST_PLAN.md)**

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

## Documentation

La documentation technique est générée automatiquement avec **JSDoc** et déployée avec l'application.

### Accès à la documentation

- **En ligne** : [Documentation technique](https://galateee.github.io/Exercice-cours-test-unitaire/docs/)
- **Local** : `npm run jsdoc` puis ouvrir `public/docs/index.html`

### Modules documentés

- **Validateurs** : `ageValidator`, `emailValidator`, `identityValidator`, `postalCodeValidator`, `userValidator`
- **Composants React** : `UserForm`, `App`
- **Classes** : `ValidationError`

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

- **React** 19.2.4 - Framework UI (avec hooks : useState, useMemo, useEffect)
- **React DOM** 19.2.4 - Rendu React
- **react-toastify** 11.0.3 - Notifications utilisateur

### Tests

- **Jest** 27.5.1 - Framework de test
- **React Testing Library** 16.3.2 - Tests de composants React
- **@testing-library/user-event** 14.6.1 - Simulation d'interactions utilisateur

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

## Objectifs pédagogiques

Ce projet a été réalisé dans le cadre d'un exercice sur les tests unitaires et couvre :

1. **Tests unitaires** - Validation de fonctions isolées
2. **Tests d'intégration** - Validation de composants React
3. **TDD** - Test-Driven Development
4. **Couverture de code** - 100% de couverture
5. **CI/CD** - Pipeline automatisé complet
6. **Documentation** - Génération automatique avec JSDoc
7. **Déploiement continu** - GitHub Pages

## Auteur

**Robin Vidal - M1 Expert Dev Full Stack**

- GitHub: [@Galateee](https://github.com/Galateee)

## Licence

Ce projet est un exercice pédagogique dans le cadre d'une formation sur les tests unitaires.
