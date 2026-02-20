# Test Plan - User Registration Form

## Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Tests Unitaires (UT)](#tests-unitaires-ut)
- [Tests d'Intégration (IT)](#tests-dintégration-it)
- [Tests End-to-End (E2E)](#tests-end-to-end-e2e)
- [Couverture de Code](#couverture-de-code)
- [Stratégie de Test](#stratégie-de-test)

---

## Vue d'ensemble

Ce projet implémente un formulaire d'inscription utilisateur avec validation en temps réel. La stratégie de test adopte une approche pyramidale :

- **Tests Unitaires (UT)** : Validation de la logique métier isolée (validators)
- **Tests d'Intégration (IT)** : Validation de l'interface utilisateur et de l'intégration des composants
- **Tests End-to-End (E2E)** : Validation des parcours utilisateur complets avec API mocking

**Total des tests** : 237 tests Jest + 18 tests Cypress E2E = **255 tests**
**Couverture de code** : 100% (Jest)

### Évolutions récentes testées

#### Validation d'unicité d'email (47 nouveaux tests)

- `validateUniqueEmail()` : Vérifie qu'un email n'est pas déjà dans localStorage
- `validateEmailComplete()` : Validation format + unicité combinée
- Tests avec localStorage vide, null, invalide, ou peuplé
- Comparaison case-insensitive (TEST@EXAMPLE.COM = test@example.com)
- Integration dans UserForm avec feedback visuel

#### Détection d'autofill Chrome (2 nouveaux tests + validation implicite)

- Event listeners attachés sur chaque champ pour capturer l'autocomplétion
- Polling DOM à 100ms et 500ms pour détecter l'autofill initial
- Validation automatique sans interaction manuelle
- Cleanup des event listeners au démontage du composant
- Gestion robuste des éléments DOM manquants

---

## Tests Unitaires (UT)

Les tests unitaires se concentrent sur la validation des règles métier de manière isolée, sans dépendance UI.

### 1. ageValidator.test.js (16 tests)

#### Scénarios couverts :

- **Validation basique**
  - Rejette une date de naissance undefined
  - Rejette une date de naissance null
  - Rejette un type non-Date (string, number, object, array)
  - Rejette une date invalide (Invalid Date)
- **Validation d'âge**
  - Rejette les utilisateurs de moins de 18 ans (0, 10, 17 ans)
  - Accepte les utilisateurs de 18 ans exactement
  - Accepte les utilisateurs de plus de 18 ans (19, 25, 50, 100 ans)
- **Edge cases temporels**
  - Gère correctement les anniversaires (1 jour avant 18 ans)
  - Gère les années bissextiles
  - Rejette les dates futures
  - Rejette les âges irréalistes (> 150 ans)

- **Date de référence custom**
  - Permet de spécifier une date de référence pour les calculs

### 2. emailValidator.test.js (53 tests)

#### Scénarios couverts :

- **Validation basique**
  - Rejette email undefined/null
  - Rejette types invalides (number, boolean, object, array)
  - Rejette chaînes vides ou whitespace uniquement
  - Rejette espaces avant/après
- **Format d'email**
  - Rejette emails sans @
  - Rejette emails sans domaine
  - Rejette domaines invalides (sans TLD, TLD court)
  - Accepte formats valides (simple, avec points, chiffres, tirets)
  - Accepte sous-domaines
- **Edge cases spécifiques**
  - Rejette points consécutifs (..)
  - Rejette point au début/fin de la partie locale
  - Rejette emails trop longs (> 254 caractères)
- **Sécurité**
  - Détecte tentatives XSS
- **Validation d'unicité (47 tests)**
  - Rejette emails déjà enregistrés dans localStorage
  - Accepte nouveaux emails
  - Gère localStorage vide/null/invalide
  - Comparaison case-insensitive (test@example.com = TEST@EXAMPLE.COM)
  - validateEmailComplete : format + unicité simultanée

### 3. identityValidator.test.js (30 tests)

#### Scénarios couverts :

- **Validation basique**
  - Rejette valeurs undefined/null
  - Rejette types non-string (number, boolean, object, array)
  - Rejette chaînes vides ou whitespace
  - Rejette espaces avant/après
- **Longueur**
  - Rejette noms trop courts (< 2 caractères)
  - Accepte longueurs valides (2-50 caractères)
  - Rejette noms trop longs (> 50 caractères)
- **Caractères autorisés**
  - Accepte lettres simples, accents, espaces, traits d'union, apostrophes
  - Accepte noms composés (Jean-Pierre, Marie Claire, O'Connor)
  - Rejette chiffres et caractères spéciaux (@, #, $, etc.)
- **Edge cases**
  - Gère correctement les caractères Unicode (émojis, caractères chinois)
- **Sécurité**
  - Détecte tentatives XSS multiples

### 4. postalCodeValidator.test.js (21 tests)

#### Scénarios couverts :

- **Validation basique**
  - Rejette valeurs undefined/null
  - Rejette types non-string
  - Rejette chaînes vides
- **Format**
  - Accepte codes valides (5 chiffres : 75001, 69001, 01000)
  - Rejette codes trop courts (< 5 chiffres)
  - Rejette codes trop longs (> 5 chiffres)
  - Rejette lettres et caractères spéciaux
  - Rejette espaces et tirets
- **Edge cases**
  - Accepte codes commençant par 0 (01000, 00100)

### 5. userValidator.test.js (39 tests)

#### Scénarios couverts :

- **Validation complète d'utilisateur**
  - Valide tous les champs simultanément
  - Rejette objets undefined/null/non-objet
  - Rejette champs manquants (firstName, lastName, email, birthDate, postalCode, city)
- **Validation individuelle des champs**
  - firstName invalide (trop court, chiffres, XSS)
  - lastName invalide (vide, type invalide, caractères spéciaux)
  - email invalide (format, XSS)
  - birthDate invalide (type, mineur, future)
  - postalCode invalide (format, longueur)
  - city invalide (chiffres, trop court)
- **Scénarios de succès**
  - Accepte utilisateurs valides (plusieurs profils types)

---

## Tests d'Intégration (IT)

Les tests d'intégration valident l'interaction entre l'UI et la logique métier, simulant le comportement d'un utilisateur réel.

### UserForm.test.jsx (30 tests)

#### 1. Rendu et Structure du Formulaire (2 tests)

- Affiche tous les champs requis avec leurs labels
- Bouton submit désactivé initialement

#### 2. Validation en Temps Réel (8 tests)

- Affiche erreur pour firstName invalide (après blur)
- Affiche erreur pour lastName avec chiffres
- Affiche erreur pour email invalide
- Affiche erreur pour utilisateur mineur (< 18 ans)
- Affiche erreur pour code postal invalide
- Affiche erreur pour city invalide
- Affiche erreur pour date de naissance future
- Validation birthDate avec format requis

#### 3. Comportement Utilisateur (5 tests)

- Gère corrections multiples : saisies invalides → corrections → re-saisies
  - Teste firstName : invalide → corrigé
  - Teste email : invalide → corrigé
  - Teste postalCode : lettres → chiffres valides
  - Vérifie que le bouton reste désactivé tant que formulaire incomplet
- Active le bouton quand tous les champs sont valides

#### 4. Soumission du Formulaire (4 tests)

- Sauvegarde dans localStorage avec timestamp
- Vérifie structure des données sauvegardées (firstName, lastName, email, age, postalCode, city, timestamp)
- Affiche toast de succès avec paramètres corrects
- Vide tous les champs après soumission
- Désactive à nouveau le bouton après reset
- Ne soumet pas le formulaire si données invalides

#### 5. Validation d'Unicité Email (3 tests)

- Détecte email déjà enregistré dans localStorage
- Affiche erreur "This email address is already registered"
- Désactive le bouton si email en doublon

#### 6. Edge Cases Spécifiques (9 tests)

- Accepte utilisateur de exactement 18 ans
- Accepte codes postaux commençant par 0
- Rejette villes avec chiffres ou caractères spéciaux
- Rejette âges irréalistes (> 150 ans)
- Calcul d'âge précis (compte mois et jour, pas seulement année)
- Détecte tentatives XSS dans firstName
- Validation en temps réel après premier touch du champ
- Messages d'erreur disparaissent lors de la correction
- Formulaire partiellement rempli garde le bouton désactivé

#### 7. Validation des Branches (2 tests)

- Soumet le formulaire avec email invalide (tous champs remplis)
- Soumet le formulaire avec code postal invalide (tous champs remplis)

#### 8. Optimisations React (2 tests)

- Cleanup des event listeners au démontage du composant
- Gestion robuste des éléments DOM manquants lors du setup des listeners

#### 9. Détection Autofill Chrome (tests implicites)

- Event listeners pour capturer l'autocomplétion Chrome
- Validation automatique des champs autofillés
- Détection en temps réel des valeurs autofillées
- Polling DOM à 100ms et 500ms pour autofill initial

---

## Tests End-to-End (E2E)

Les tests E2E valident les parcours utilisateur complets à travers l'application multi-pages avec **Cypress**. Tous les appels API sont mockés avec `cy.intercept()` pour garantir l'isolation des tests.

### cypress/e2e/navigation.cy.js (18 tests)

#### 1. Scénario Nominal - Navigation et Inscription (1 test)

**Test** : Parcours complet d'inscription d'un utilisateur

- Visite de la page Home (0 utilisateur)
- Navigation vers /register
- Remplissage du formulaire avec données valides
- Soumission du formulaire
- Redirection vers Home avec l'utilisateur affiché
- Vérification du compteur (1 utilisateur)
- Vérification de la liste avec les données correctes

**API Mocking** :

- `GET /users` → 200 (liste vide initialement)
- `POST /users` → 201 (création réussie)

---

#### 2. Scénario d'Erreur - Validation et État Inchangé (2 tests)

**Test 1** : Rejet d'un email déjà enregistré

- État initial : 1 utilisateur existant
- Tentative d'inscription avec email en doublon
- Affichage de l'erreur de validation
- Bouton submit désactivé
- Retour à Home → état inchangé (toujours 1 utilisateur)

**Test 2** : Rejet d'un formulaire avec champs invalides

- État initial : 1 utilisateur existant
- Tentative de soumission avec champs vides/invalides
- Vérification que le bouton reste désactivé
- Retour à Home → état inchangé

**API Mocking** :

- `GET /users` → 200 (1 utilisateur existant)
- Pas d'appel POST (validation front-end bloque)

---

#### 3. Tests de Navigation E2E (9 tests)

**Test 1** : Chargement de la page Home

- Affichage du titre "Registered Users"
- Affichage du compteur d'utilisateurs
- Affichage du bouton "Register New User"
- Message d'état vide visible

**Test 2** : Navigation Home → Register

- Click sur "Register New User"
- URL contient `/register`
- Affichage du formulaire d'inscription
- Tous les champs sont visibles

**Test 3** : Navigation Register → Home

- Click sur "Back to Home"
- Retour à la page Home
- URL ne contient plus `/register`

**Test 4** : Inscription et redirection vers Home

- Remplissage du formulaire complet
- Soumission → redirection automatique vers Home
- Toast de succès affiché
- Utilisateur visible dans la liste

**Test 5** : Inscription de plusieurs utilisateurs

- Inscription de 2 utilisateurs successifs
- Vérification du compteur incrémenté
- Tous les utilisateurs visibles dans la liste

**Test 6** : Disparition du message d'état vide

- Message "No users registered yet" visible initialement
- Inscription d'un utilisateur
- Message d'état vide disparaît
- Liste des utilisateurs s'affiche

**Test 7** : Persistance des données (via API)

- Inscription d'un utilisateur
- Rechargement de la page (`cy.reload()`)
- Mock de `GET /users` avec données de test
- Données toujours affichées après reload

**Test 8** : Réinitialisation du formulaire

- Inscription réussie d'un utilisateur
- Navigation vers /register
- Vérification que tous les champs sont vides
- Bouton submit désactivé

**Test 9** : Préservation de l'état après click "Back"

- Navigation Register → Home sans soumission
- État de la liste préservé

**API Mocking** :

- `GET /users` → 200 (liste vide ou avec utilisateurs)
- `POST /users` → 201 (création réussie)

---

#### 4. Scénario d'Erreur - Gestion des Erreurs API (6 tests)

**Test 1** : Erreur 400 - Email déjà existant (duplicate)

- Mock `POST /users` → 400 avec message "Email already exists"
- Toast d'erreur affiché
- Utilisateur reste sur /register
- Compteur reste à 0

**Test 2** : Erreur 400 avec message personnalisé

- Mock `POST /users` → 400 avec message custom
- Toast d'erreur affiché avec le message API
- Formulaire reste accessible pour correction

**Test 3** : Erreur 500 - Erreur serveur

- Mock `POST /users` → 500 "Internal Server Error"
- Toast d'erreur affiché
- Utilisateur reste sur /register
- Formulaire reste visible pour retry
- Compteur reste à 0

**Test 4** : Erreur 503 - Service Unavailable

- Mock `POST /users` → 503 "Service Temporarily Unavailable"
- Toast d'erreur affiché
- Formulaire reste accessible

**Test 5** : Erreur réseau (API injoignable)

- Mock `POST /users` → `forceNetworkError: true`
- Toast d'erreur affiché
- Utilisateur reste sur /register
- Formulaire reste visible

**Test 6** : Erreur GET /users sur Home (load initial)

- Mock `GET /users` → 500 "Database connection failed"
- Page Home s'affiche quand même
- Compteur affiche 0
- Aucun crash de l'application

**API Mocking** :

- `GET /users` → 200 (liste vide)
- `POST /users` → 400/500/503/network error

---

### Stratégie de Mocking E2E

#### Isolation totale des tests

```javascript
// Setup dans beforeEach
cy.intercept("GET", "https://jsonplaceholder.typicode.com/users", {
  statusCode: 200,
  body: mockUsers,
}).as("getUsers");

cy.intercept("POST", "https://jsonplaceholder.typicode.com/users", (req) => {
  req.reply({
    statusCode: 201,
    body: { ...req.body, id: Date.now() },
  });
}).as("createUser");
```

#### Scénarios d'erreur testés

- **400 Bad Request** : Validation serveur (email duplicate)
- **500 Internal Server Error** : Crash serveur
- **503 Service Unavailable** : Service temporairement indisponible
- **Network Error** : API complètement injoignable
- **GET Error** : Erreur lors du chargement initial des utilisateurs

---

## Couverture de Code

```
-------------------------|---------|----------|---------|---------|
File                     | % Stmts | % Branch | % Funcs | % Lines |
-------------------------|---------|----------|---------|---------|
All files                |     100 |      100 |     100 |     100 |
 src                     |     100 |      100 |     100 |     100 |
  App.js                 |     100 |      100 |     100 |     100 |
  UserForm.jsx           |     100 |      100 |     100 |     100 |
 src/validators          |     100 |      100 |     100 |     100 |
  ValidationError.js     |     100 |      100 |     100 |     100 |
  ageValidator.js        |     100 |      100 |     100 |     100 |
  emailValidator.js      |     100 |      100 |     100 |     100 |
  identityValidator.js   |     100 |      100 |     100 |     100 |
  postalCodeValidator.js |     100 |      100 |     100 |     100 |
  userValidator.js       |     100 |      100 |     100 |     100 |
-------------------------|---------|----------|---------|---------|
```

---

## Stratégie de Test

### Répartition des Responsabilités

#### Tests Unitaires (UT) - 159 tests

**Objectif** : Valider la logique métier de manière isolée

- **Validation des règles métier** : Formats, longueurs, types
- **Validation d'unicité** : Détection des emails en doublon via localStorage
- **Edge cases métier** : Dates limites, années bissextiles, caractères Unicode
- **Sécurité** : XSS, injections, validation stricte
- **Gestion d'erreurs** : Messages explicites, codes d'erreur spécifiques
- **Indépendance** : Pas de dépendance UI, rapides à exécuter

**Fichiers** :

- ageValidator.test.js (16 tests)
- emailValidator.test.js (53 tests)
- identityValidator.test.js (30 tests)
- postalCodeValidator.test.js (21 tests)
- userValidator.test.js (39 tests)

#### Tests d'Intégration (IT) - 78 tests

**Objectif** : Valider l'intégration UI + logique métier + API

- **Interaction utilisateur** : Saisie clavier, focus, blur, click, autofill
- **Feedback visuel** : Affichage des erreurs, états du bouton, styles CSS
- **Flux complets** : Formulaire invalide → corrections → soumission
- **Intégrations API** : Appels Axios, gestion d'erreurs HTTP (400/500/réseau)
- **Context React** : State management global avec UserContext
- **Navigation** : React Router entre pages Home et Register
- **Optimisations React** : useMemo, event listeners cleanup, DOM polling
- **Détection autofill** : Event listeners, polling DOM, validation instantanée
- **Accessibilité** : Rôles ARIA, labels, navigation clavier

**Fichiers** :

- UserForm.test.jsx (30 tests)
- UserContext.test.jsx (10 tests)
- Home.test.jsx (11 tests)
- Register.test.jsx (13 tests)
- api.test.js (9 tests)
- App.test.js (5 tests)

#### Tests End-to-End (E2E) - 18 tests

**Objectif** : Valider les parcours utilisateur complets de bout en bout

- **Navigation multi-pages** : Flux Home ↔ Register avec React Router
- **Scénarios réels** : Inscription, validation, affichage liste, gestion d'état
- **Intégration API complète** : Mocking des appels réseau avec cy.intercept()
- **Gestion d'erreurs** : Résilience aux erreurs API (400/500/503/réseau)
- **Tests de régression** : Persistance, redirection, reset formulaire
- **Isolation totale** : Aucun appel réseau réel, tests déterministes

**Fichiers** :

- cypress/e2e/navigation.cy.js (18 tests)
  - 1 test de scénario nominal complet
  - 2 tests de validation et état inchangé
  - 9 tests de navigation et flux utilisateur
  - 6 tests de gestion d'erreurs API
