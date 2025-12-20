# Prima-Vision-Corp - CiblOrgaSport

## Table des matières

- [Périmètre du MVP](#périmètre-du-mvp)
- [Architecture](#architecture)
- [Technologies utilisées](#technologies-utilisées)
- [Fonctionnalités](#fonctionnalités)
- [Installation et lancement](#installation-et-lancement)
- [Identifiants de connexion](#identifiants-de-connexion)
- [Tests](#tests)
- [Structure du projet](#structure-du-projet)

## Périmètre du MVP

Le MVP (Minimum Viable Product) comprend les fonctionnalités suivantes :

### Gestion des événements
- Création, consultation, modification d'événements

### Gestion des compétitions
- Création et modification de compétitions liées à un événement
- Consultation des compétitions par événement

### Gestion des épreuves (Trials)
- Création, consultation et modification d'épreuves
- Filtrage des épreuves par compétition

## Architecture

L'application suit une architecture en couches :

- **Backend** : API REST Spring Boot (Java 21)
- **Frontend** : Application React avec Material-UI
- **Base de données** : PostgreSQL
- **Déploiement** : Docker Compose, AWS EC2

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

### Infrastructure
- **Docker & Docker Compose**
- **Nginx** (pour le frontend)
- **PgAdmin** (interface de gestion PostgreSQL)

## Fonctionnalités

#### Admin
- Gestion complète des compétitions
- Consultation et modification des événements
- Consultation des compétitions par événement

### Endpoints API disponibles

#### Authentification (`/api/auth`)
- `POST /api/auth/signup` - Inscription (crée un compte Spectateur)
- `POST /api/auth/signin` - Connexion

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

#### Utilisateurs
- `POST /api/admin/create-commissaire` - Créer un commissaire (Admin uniquement)
- `POST /api/commissaire/create-athlete` - Créer un athlète (Commissaire uniquement)
- `POST /api/commissaire/create-volonteer` - Créer un volontaire (Commissaire uniquement)
- `POST /api/user/change-password` - Changer son mot de passe (authentifié)

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

2. **Lancer l'application**
```bash
docker compose up
```

Cette commande va :
- Démarrer PostgreSQL sur le port 5432
- Démarrer le backend Spring Boot sur le port 8080
- Démarrer le frontend React sur le port 3000
- Démarrer PgAdmin sur le port 5050

3. **Accéder à l'application**
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8080
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

Le backend sera accessible sur http://localhost:8080

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

- **Email** : `admin@cos.com`
- **Mot de passe** : `Admin@123`

### Création de nouveaux comptes

#### Inscription publique (Spectateur)
- Utilisez la page d'inscription (`/signup`) pour créer un compte Spectateur
- Tous les utilisateurs inscrits via l'interface publique sont des Spectateurs par défaut

#### Création par un Admin
- Connectez-vous avec le compte Admin
- Utilisez l'endpoint `/api/admin/create-commissaire` pour créer des commissaires

#### Création par un Commissaire
- Un commissaire peut créer des athlètes via `/api/commissaire/create-athlete`
- Un commissaire peut créer des volontaires via `/api/commissaire/create-volonteer`

### Identifiants PgAdmin

- **Email** : `admin@ciblorgasport.com`
- **Mot de passe** : `admin123`

### Connexion à PostgreSQL

- **Host** : `localhost` (ou `postgres` dans Docker)
- **Port** : `5432`
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

## Structure du projet

```
GLOP-Prima-Vision-Corp/
├── cosBack/                    # Backend Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/ciblorgasport/
│   │   │   │   ├── admin/          # Module Admin
│   │   │   │   ├── athlete/         # Module Athlète
│   │   │   │   ├── commissionner/   # Module Commissaire
│   │   │   │   ├── competition/     # Module Compétition
│   │   │   │   ├── event/           # Module Événement
│   │   │   │   ├── round/           # Module Round
│   │   │   │   ├── security/        # Authentification JWT
│   │   │   │   ├── site/            # Module Site
│   │   │   │   ├── trial/           # Module Épreuve
│   │   │   │   ├── user/            # Module Utilisateur
│   │   │   │   └── config/          # Configuration
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                    # Tests
│   └── pom.xml
│
├── cosFront/                   # Frontend React
│   ├── src/
│   │   ├── app/                # Routes principales
│   │   ├── common/             # Composants et utilitaires communs
│   │   │   ├── api/            # Services API
│   │   │   ├── components/     # Composants réutilisables
│   │   │   └── contexts/       # Contextes React (Auth)
│   │   └── features/           # Fonctionnalités par domaine
│   │       ├── competition/
│   │       ├── events/
│   │       ├── trial/
│   │       └── user/
│   └── package.json
│
├── docker-compose.yml          # Configuration Docker Compose
└── README.md                   # Ce fichier
```

## Configuration

### Variables d'environnement

Vous pouvez personnaliser l'application via des variables d'environnement dans `docker-compose.yml` :

- `DB_NAME` : Nom de la base de données (défaut: `ciblorgasport`)
- `DB_USER` : Utilisateur PostgreSQL (défaut: `postgres`)
- `DB_PASSWORD` : Mot de passe PostgreSQL (défaut: `postgres123`)
- `CORS_ALLOWED_ORIGINS` : Origines autorisées pour CORS
- `VITE_API_BASE_URL` : URL de l'API backend pour le frontend

### Ports par défaut

- **Frontend** : 3000
- **Backend** : 8080
- **PostgreSQL** : 5432
- **PgAdmin** : 5050

## Notes importantes

- La base de données est initialisée automatiquement avec :
  - 2 sites pré-configurés (Piscine Olympique Jean Bouin, Centre Aquatique Olympique de Saint-Denis)
  - 6 rounds pré-configurés (Qualification, Huitièmes, Quarts, Demi-finale, Finale, Phase supplémentaire)
  - 1 compte Admin par défaut

- Les mots de passe sont hashés avec BCrypt avant stockage

- Les tokens JWT expirent après 24 heures (86400000 ms)

- Le frontend utilise Material-UI pour l'interface utilisateur

---

