# Prima-Vision-Corp - CiblOrgaSport

## Table des matières

- [Architecture](#architecture)
- [Technologies utilisées](#technologies-utilisées)
- [Fonctionnalités implémentées](#fonctionnalités-implémentées)
- [Installation et lancement](#installation-et-lancement)
- [Configuration](#configuration)
- [Liens des e-mails (activation, invitations)](#liens-des-e-mails-activation-invitations)
- [Identifiants de connexion](#identifiants-de-connexion)
- [Tests](#tests)
- [Déploiement](#déploiement)

## Architecture

L’application repose sur une **architecture monolithique** côté serveur : un **seul déployable** Spring Boot regroupe toute l’API REST, la logique métier et l’accès aux données. Le code est structuré en **modules logiques** (packages par domaine : événements, compétitions, sécurité, etc.) au sein de ce même projet, sans découpe en microservices indépendants. Le **frontend** est une application **SPA** (React) distincte, qui communique avec le backend uniquement via HTTP.

En résumé :

- **Backend** : API REST Spring Boot (Java 21), application monolithique modulaire
- **Frontend** : application React avec Material-UI
- **Base de données** : PostgreSQL
- **Déploiement** : Docker Compose, AWS EC2

Le frontend appelle le backend via HTTP (JSON), avec authentification JWT. La liste des préfixes d’URL réels est donnée par les `@RequestMapping` des contrôleurs sous `cosBack/src/main/java/com/ciblorgasport/`.

## Technologies utilisées

### Backend
- **Java 21**
- **Spring Boot 3.5.0**
- **Spring Security** avec JWT
- **Spring Data JPA**
- **PostgreSQL**
- **Lombok**
- **Maven**

### Frontend
- **React 19.1.1**
- **Material-UI (MUI) 7.3.5**
- **React Router 7.9.4**
- **Axios**
- **Vite**
- **Playwright** (`@playwright/test`) — tests end-to-end

### Infrastructure
- **Docker & Docker Compose**
- **Nginx** (pour le frontend)
- **PgAdmin** (interface de gestion PostgreSQL)

## Fonctionnalités implémentées

Notre application **CiblOrgaSport (Prima Vision)** est une plateforme web pour organiser et suivre des compétitions de natation (événements, compétitions, épreuves, acteurs et public). Voici ce qu’elle propose aujourd’hui, par grand domaine.

### Authentification et comptes
- Inscription publique (profil **Spectateur** par défaut), connexion, activation de compte et e-mails (liens générés côté serveur).
- Réinitialisation de mot de passe (flux « mot de passe oublié »).
- Sessions sécurisées avec **JWT** et rôles (Admin, Commissaire, Athlète, Volontaire, Spectateur).

### Administrateur
- Gestion des **événements**, **compétitions**, **épreuves** (trials), **sites** et **rounds**.
- Création de **commissaires**, gestion des **utilisateurs**, import et gestion des **volontaires** par compétition.
- **Plannings** (création côté admin, affectation des tâches volontaires), **tableau de bord** et statistiques.
- **Carte** : visualisation admin, **fan-zones**, géolocalisation des athlètes côté exploitation.
- Suivi des **incidents** signalés sur la compétition.

### Commissaire
- Pilotage des compétitions et épreuves dont il a la charge : inscriptions athlètes, équipes, imports, validation ou refus de participations.
- Dépôt et suivi de **l’agrément** (accreditation) côté commissaire ; traitement côté admin.

### Athlète
- Consultation des **compétitions** auxquelles il participe, **profil**, **planning** par compétition.
- Actions sur les épreuves (ex. forfait) et consultation des **résultats** qui le concernent.

### Volontaire
- Accès à son **planning** de bénévolat sur les compétitions.

### Spectateur
- Découverte des **événements** et **compétitions**, **résultats** détaillés, **profil** et **notifications**.
- **Carte** (parcours, fan-zones, contexte compétition) pour le public connecté.
- Possibilité de **suivre** des compétitions (favoris / suivi).

### Public (sans compte obligatoire)
- Consultation de **résultats** et de **compétitions** exposés en lecture publique selon la configuration de l’API.

### Technique côté interface
- Application **React** responsive avec **Material UI**, navigation par rôle, éditeurs de texte riches où nécessaire (contenus, descriptions).

### Endpoints API disponibles (aperçu)

#### Authentification (`/api/auth`)
- `POST /api/auth/signup` - Inscription (crée un compte Spectateur)
- `POST /api/auth/signin` - Connexion
- `GET /api/auth/activate` - Activation de compte (lien e-mail)
- `POST /api/auth/forgot-password` - Demande de réinitialisation
- `POST /api/auth/forgot-password/complete` - Finalisation après réception du lien

#### Événements (`/api/events`)
- `GET /api/events` - Liste de tous les événements (public)
- `GET /api/events/{id}` - Détails d'un événement
- `POST /api/events` - Créer un événement (authentifié)
- `PUT /api/events/{id}` - Modifier un événement (authentifié)

#### Compétitions (`/api/admin/competitions`)
- `GET /api/admin/competitions/{id}` - Détails d'une compétition
- `GET /api/admin/competitions/by-event/{eventId}` - Compétitions d'un événement
- `POST /api/admin/competitions` - Créer une compétition (Admin uniquement)
- `PUT /api/admin/competitions/{id}` - Modifier une compétition (Admin uniquement)

#### Épreuves (`/api/trials`)
- `GET /api/trials` - Liste de toutes les épreuves
- `GET /api/trials?competitionId={id}` - Épreuves d'une compétition
- `GET /api/trials/{id}` - Détails d'une épreuve
- `POST /api/trials` - Créer une épreuve (authentifié)
- `PUT /api/trials/{id}` - Modifier une épreuve (authentifié)
- `DELETE /api/trials/{id}` - Annuler une épreuve (authentifié)

#### Sites (`/api/admin/sites`)
- `GET /api/admin/sites` - Liste de tous les sites (Admin uniquement)
- `GET /api/admin/sites/{id}` - Détails d'un site
- `POST /api/admin/sites` - Créer un site (Admin uniquement)
- `PUT /api/admin/sites/{id}` - Modifier un site (Admin uniquement)
- `DELETE /api/admin/sites/{id}` - Supprimer un site (Admin uniquement)

#### Rounds (`/api/rounds`)
- `GET /api/rounds` - Liste de tous les rounds
- `GET /api/rounds/{id}` - Détails d'un round
- `POST /api/rounds` - Créer un round (authentifié)
- `DELETE /api/rounds/{id}` - Supprimer un round (authentifié)

#### Autres familles d’API (non exhaustif)

D’autres modules exposent notamment : `/api/admin` (statistiques, volontaires, utilisateurs, plannings, cartes, fan-zones, etc.), `/api/commissioner` (fonctions côté commissaire), `/api/athlete/*`, `/api/spectator/*`, `/api/spectateur/competitions`, `/api/public`, `/api/notifications`, `/api/incidents`, `/api/schedule`, `/api/user`, `/api/countries`, etc. Voir les contrôleurs dans `cosBack` pour la liste complète et les rôles requis.

## Installation et lancement

### Prérequis
- Docker et Docker Compose installés
- Git (pour cloner le projet)

### Lancement avec Docker Compose (recommandé)

1. **Cloner le projet** (si ce n'est pas déjà fait)
```bash
git clone git@github.com:sepideh94/GLOP-Prima-Vision-Corp.git
cd GLOP-Prima-Vision-Corp
```
2. **Nettoyer les anciennes instances**
```
docker-compose down -v
```
3. **Lancer l'application**
```bash
docker compose up --build
```

* **Savoir quand l'appli est prête** :  
Attendez de voir le message encadré `APPLICATION CIBLORGASPORT PRÊTE !` dans la console.

* **Données initiales** :  
Au démarrage, les données d’initialisation sont automatiquement migrées et injectées dans la base.  
Le détail des données créées est présenté à la fin de ce README.

Cette commande va :
- Démarrer PostgreSQL sur le port 5433
- Démarrer le backend Spring Boot sur le port 8083
- Démarrer le frontend React sur le port 3000
- Démarrer PgAdmin sur le port 5050

4. **Accéder à l'application**
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8083
- **PgAdmin** : http://localhost:5050

### Lancement en développement local

#### Backend

1. **Prérequis** : Java 21, Maven 3.8+

2. **Configurer la base de données PostgreSQL**
   - Créer une base de données nommée `ciblorgasport`
   - Ou modifier `application.properties` avec vos paramètres

3. **Lancer le backend**
```bash
cd cosBack
mvn spring-boot:run
```

Le backend sera accessible sur http://localhost:8083

#### Frontend

1. **Prérequis** : Node.js 18+

2. **Installer les dépendances**
```bash
cd cosFront
npm install
```

3. **Lancer le frontend en mode développement**
```bash
npm run dev
```

Le frontend sera accessible sur http://localhost:5173 (port par défaut de Vite)

4. **Build de production**
```bash
npm run build
```

## Identifiants de connexion

### Compte Admin (créé automatiquement au démarrage)

Un compte administrateur est automatiquement créé lors du premier lancement de l'application :

- **Email** : `admincos@yopmail.com`
- **Mot de passe** : `Admin@123`

### Création de nouveaux comptes

#### Inscription publique (Spectateur)
- Utilisez la page d'inscription (`/signup`) pour créer un compte Spectateur
- Tous les utilisateurs inscrits via l'interface publique sont des Spectateurs par défaut

#### Création par un Admin
- Connectez-vous avec le compte Admin
- Utilisez l'endpoint `/api/admin/create-commissaire` pour créer des commissaires

#### Création par un Commissaire
- Un commissaire peut créer des athlètes via `POST /api/commissioner/create-athlete`
- La création / invitation de volontaires pour une compétition côté administration se fait via `POST /api/admin/competitions/{competitionId}/create-volonteer` (compte Admin)

### Identifiants PgAdmin

- **Email** : `admin@ciblorgasport.com`
- **Mot de passe** : `admin123`

### Connexion à PostgreSQL

- **Host** : `localhost` (ou `postgres` dans Docker)
- **Port** : `5433`
- **Database** : `ciblorgasport`
- **Username** : `postgres`
- **Password** : `postgres123`

## Tests

### Tests Backend

Les tests sont écrits avec JUnit 5, Mockito et TestContainers.

#### Lancer tous les tests
```bash
cd cosBack
mvn test
```

#### Lancer les tests avec rapport de couverture
```bash
mvn test jacoco:report
```

#### Lancer un test spécifique
```bash
mvn test -Dtest=NomDeLaClasseDeTest
```

### Tests Frontend (e2e)

Les scénarios end-to-end sont dans `cosFront/tests/e2e/` et s’exécutent avec **Playwright**.

```bash
cd cosFront
npm install
npx playwright install    # une fois : navigateurs pour Playwright
npm run test:e2e
```

Variantes utiles :

- `npm run test:e2e:ui` — interface Playwright
- `npm run test:e2e:headed` — navigateur visible
- `npm run test:e2e:debug` — mode debug

Les dossiers **`test-results/`** et **`playwright-report/`** sont générés à l’exécution ; ils sont ignorés par Git (voir `cosFront/.gitignore`). À la racine du dépôt, **`test-results/`** est également ignoré s’il est produit depuis un autre répertoire de travail.

### Tests disponibles

- **Tests unitaires** :
  - `CompetitionServiceImplTest`
  - `EventServiceTest`
  - `SiteServiceImplTest`
  - `TrialServiceImplTest`
  - `AuthenticationServiceTest`

- **Tests d'intégration** :
  - `CompetitionControllerTest`
  - `EventControllerTest`
  - `AuthenticationControllerTest`
  - `SecurityAccessIntegrationTest` (tests de sécurité et autorisations)

### Configuration des tests

Les tests utilisent une base de données H2 en mémoire (configuration dans `application-test.properties`), ce qui permet de les exécuter sans dépendance externe.

## Configuration

### Variables d'environnement

Vous pouvez personnaliser l'application via des variables d'environnement dans `docker-compose.yml` :

- `DB_NAME` : Nom de la base de données (défaut: `ciblorgasport`)
- `DB_USER` : Utilisateur PostgreSQL (défaut: `postgres`)
- `DB_PASSWORD` : Mot de passe PostgreSQL (défaut: `postgres123`)
- `CORS_ALLOWED_ORIGINS` : Origines autorisées pour CORS
- `VITE_API_BASE_URL` : URL de l'API backend pour le frontend
- `APP_BASE_URL` : URL **publique** du site (frontend), utilisée pour les liens et redirections générés par le backend (ex. après activation de compte)
- `API_BASE_URL` : URL **publique** de l’API (backend), utilisée notamment pour le **lien d’activation** dans les e-mails (`GET …/api/auth/activate?token=…`) — doit être joignable depuis le navigateur de l’utilisateur
- `APP_FRONTEND_HASH_ROUTER` : si `true`, le backend construit les liens vers le front au format `https://votredomaine/#/chemin` (HashRouter). À aligner avec le mode de routage du build front (voir ci-dessous)

### Liens des e-mails (activation, invitations)

Les e-mails (activation de compte, réinitialisation de mot de passe, invitations commissaire / athlète / volontaire, etc.) contiennent des URLs générées côté **backend**. Pour qu’un clic ouvre la **bonne page**, les variables suivantes doivent être cohérentes entre elles et avec le déploiement réel :

| Variable | Rôle |
|----------|------|
| **`API_BASE_URL`** | Base utilisée pour le lien d’**activation** : `{API_BASE_URL}/api/auth/activate?token=…`. Le navigateur appelle cette URL ; le backend active le compte puis **redirige** vers le front (`APP_BASE_URL` + chemin). Si cette URL est interne ou incorrecte, le lien dans le mail ne fonctionnera pas. |
| **`APP_BASE_URL`** | Base du **frontend** (sans slash final de préférence, selon config). Sert aux redirections après activation et aux liens directs vers des pages (connexion, pages avec `?next=…`, etc.). |
| **`APP_FRONTEND_HASH_ROUTER`** | Quand elle vaut `true`, les chemins vers le SPA incluent le hash : `…/#/login?…`. Quand elle vaut `false`, les URLs sont du type `…/login?…` (adapté à un **BrowserRouter** derrière un reverse-proxy qui renvoie `index.html` pour les routes). |

**Côté frontend**, en build de production, le routage utilise par défaut un **HashRouter** sauf si vous définissez explicitement `VITE_USE_HASH_ROUTER=false` au build (voir `cosFront` / `spaNavigation.js`). **`APP_FRONTEND_HASH_ROUTER` doit refléter le même choix** que ce build, sinon les liens des mails pointeront vers des URLs que l’application ne sait pas interpréter.

En production, renseignez au minimum `APP_BASE_URL` et `API_BASE_URL` avec les **URLs publiques** vues par les utilisateurs (HTTPS, bons hôtes/ports). Référence Docker : `docker-compose.yml` et `docker-compose.prod.yml` (ex. `APP_FRONTEND_HASH_ROUTER: "true"` en prod si le front est en hash routing).

### Ports par défaut

- **Frontend** : 3000
- **Backend** : 8083
- **PostgreSQL** : 5433
- **PgAdmin** : 5050

## Déploiement

L'application est déployée en production sur AWS EC2.

### Accès à l'application

L'application est accessible (lorsque l'instance de démonstration est active) à l'adresse suivante :

- **URL de l'application** : http://51.21.16.8:3000/

## Notes importantes

- La base de données est initialisée automatiquement avec :
  - 2 sites pré-configurés (Piscine Olympique Jean Bouin, Centre Aquatique Olympique de Saint-Denis)
  - 6 rounds pré-configurés (Qualification, Huitièmes, Quarts, Demi-finale, Finale, Phase supplémentaire)
  - 1 compte Admin par défaut

- Les mots de passe sont hashés avec BCrypt avant stockage

- Les tokens JWT expirent après 24 heures (86400000 ms)

- Le frontend utilise Material-UI pour l'interface utilisateur

## Données initialisées automatiquement

Au démarrage, l’application charge un jeu de données de démonstration pour faciliter les tests et la prise en main. 

- **1 événement** : **Championnats d’Europe de natation 2026** (du 1 mars 2026 au 30 avril 2026)
- **2 compétitions** :
  - **Natation individuelle** (du 5 mars 2026 au 20 mars 2026)
  - **Natation par équipes** (du 10 avril 2026 au 20 avril 2026)
- **6 épreuves** réparties entre qualifications, finales et relais mixtes
- **2 commissaires**, **3 volontaires**, **14 athlètes** et **3 spectateurs**
- **4 sites** et **4 équipes**
- des participations, résultats, incidents, notifications et documents associés.

### Comptes de test
- **Admin** : user : admincos@yopmail.com, mot de passe **Admin@123**
- **Tous les autres utilisateurs seedés** : mot de passe **12345678**. 

### Exemples de connexions
- Commissaire : `amina.badji@yopmail.com`
- Volontaire : `lea.bernard@yopmail.com`
- Athlète : `emma.fournier@yopmail.com`
- Spectateur : `sophie.martin@yopmail.com`
