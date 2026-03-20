# CiblOrgaSport - Documentation API

**Base URL** : `http://localhost:8080`
**Authentification** : JWT Bearer Token (header `Authorization: Bearer <token>`)

---

## Table des matières

1. [Authentification](#1-authentification)
2. [Utilisateurs](#2-utilisateurs)
3. [Administration](#3-administration)
4. [Événements](#4-événements)
5. [Compétitions](#5-compétitions)
6. [Épreuves (Trials)](#6-épreuves-trials)
7. [Rounds](#7-rounds)
8. [Sites](#8-sites)
9. [Participants aux épreuves (Trial Participants)](#9-participants-aux-épreuves-trial-participants)
10. [Profil Athlète](#10-profil-athlète)
11. [Participations Athlète](#11-participations-athlète)
12. [Commissaire](#12-commissaire)
13. [Pays](#13-pays)
14. [Carte interactive](#14-carte-interactive)
15. [Fan Zones](#15-fan-zones)
16. [Géolocalisation Athlète](#16-géolocalisation-athlète)
17. [Enums de référence](#17-enums-de-référence)
18. [Erreurs](#18-erreurs)

---

## 1. Authentification

### POST /api/auth/signup
Inscription d'un nouveau spectateur. Le compte est créé inactif ; un email d'activation est envoyé.

**Accès** : Public

**Request body** :
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string"
}
```

**Response** `200` :
```json
{
  "token": "jwt-token",
  "role": "SPECTATOR"
}
```

---

### POST /api/auth/signin
Connexion d'un utilisateur existant.

**Accès** : Public

**Request body** :
```json
{
  "email": "string",
  "password": "string"
}
```

**Response** `200` :
```json
{
  "token": "jwt-token",
  "role": "ADMIN | COMMISSIONNER | ATHLETE | VOLONTEER | SPECTATOR"
}
```

---

### GET /api/auth/activate?token={token}
Active un compte via le lien envoyé par email. Redirige vers le frontend.

**Accès** : Public

**Query param** : `token` (string)

**Response** : Redirection HTTP 302 vers `{APP_BASE_URL}/login?activated=true`

---

### POST /api/auth/forgot-password
Demande de réinitialisation de mot de passe. Si le compte est inactif, renvoie un email d'activation.

**Accès** : Public

**Request body** :
```json
{
  "email": "string"
}
```

**Response** `200` :
```
"Si un compte existe pour cet email, un lien de réinitialisation a été envoyé."
```

---

### POST /api/auth/forgot-password/complete
Finalise la réinitialisation du mot de passe. Accepte aussi les tokens d'invitation (commissaire, athlète) pour activer le compte.

**Accès** : Public

**Request body** :
```json
{
  "token": "string",
  "newPassword": "string (min 8 caractères)",
  "confirmNewPassword": "string"
}
```

**Response** `200` :
```
"Mot de passe réinitialisé avec succès."
```

---

## 2. Utilisateurs

### POST /api/user/change-password
Change le mot de passe de l'utilisateur connecté.

**Accès** : Authentifié

**Request body** :
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Response** `200` :
```
"Mot de passe changé avec succès."
```

---

## 3. Administration

### POST /api/admin/create-commissaire
Crée un compte commissaire. Un email d'invitation avec un token est envoyé.

**Accès** : ADMIN

**Request body** :
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string"
}
```

**Response** `201` :
```json
{
  "id": 1,
  "email": "commissaire@example.com",
  "role": "COMMISSIONNER"
}
```

---

### GET /api/admin/users
Liste tous les utilisateurs du système.

**Accès** : ADMIN

**Response** `200` :
```json
[
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string",
    "isAccountActive": true
  }
]
```

---

## 4. Événements

### POST /api/events
Crée un événement.

**Accès** : ADMIN

**Request body** :
```json
{
  "name": "string (required)",
  "description": "string",
  "startDate": "2026-07-26T09:00:00",
  "endDate": "2026-08-11T20:00:00"
}
```

**Response** `201` : Objet `Event` complet (id, name, description, startDate, endDate, competitions)

---

### GET /api/events
Liste tous les événements.

**Accès** : Public

**Response** `200` :
```json
[
  {
    "id": 1,
    "name": "string",
    "description": "string",
    "startDate": "2026-07-26T09:00:00",
    "endDate": "2026-08-11T20:00:00"
  }
]
```

---

### GET /api/events/{id}
Détail d'un événement avec ses compétitions.

**Accès** : Public

**Response** `200` : Objet `Event` complet avec la liste `competitions`

---

### PUT /api/events/{id}
Met à jour un événement.

**Accès** : ADMIN

**Request body** :
```json
{
  "name": "string (required)",
  "description": "string",
  "startDate": "2026-07-26T09:00:00",
  "endDate": "2026-08-11T20:00:00"
}
```

**Response** `200` : Objet `Event` mis à jour

---

## 5. Compétitions

### POST /api/admin/competitions
Crée une compétition rattachée à un événement. Les dates doivent être dans les bornes de l'événement parent.

**Accès** : ADMIN

**Request body** :
```json
{
  "name": "string",
  "description": "string",
  "startDate": "2026-07-27T08:00:00",
  "endDate": "2026-07-27T18:00:00",
  "parentEventId": 1
}
```

**Response** `201` :
```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "startDate": "2026-07-27T08:00:00",
  "endDate": "2026-07-27T18:00:00",
  "parentEventId": 1,
  "status": "UPCOMING",
  "statusLabel": "À venir"
}
```

---

### PUT /api/admin/competitions/{id}
Met à jour une compétition.

**Accès** : ADMIN

**Request body** :
```json
{
  "name": "string (required)",
  "description": "string",
  "startDate": "2026-07-27T08:00:00 (required)",
  "endDate": "2026-07-27T18:00:00 (required)"
}
```

**Response** `200` : Objet `CompetitionResponse`

---

### GET /api/admin/competitions/{id}
Détail d'une compétition.

**Accès** : ADMIN

**Response** `200` : Objet `CompetitionResponse`

---

### GET /api/admin/competitions/by-event/{eventId}
Liste les compétitions d'un événement.

**Accès** : ADMIN

**Response** `200` : Liste de `CompetitionResponse`

---

## 6. Épreuves (Trials)

### POST /api/trials
Crée une épreuve rattachée à une compétition. Les dates doivent être dans les bornes de la compétition.

**Accès** : Authentifié

**Comportement par round** :
- **`roundId` omis ou null** : round par défaut = `QUALIFICATION_HEAT`, `roundNumber` auto-généré (MAX existant + 1)
- **`roundId` = QUALIFICATION_HEAT** : `roundNumber` auto-généré (MAX existant + 1)
- **`roundId` = DEMI_FINALE** : validation que la date de début est postérieure à la fin de **toutes** les qualifications du même `trialName` + `categoryGender`
- **`roundId` = FINALE** : validation que la date de début est postérieure à la fin de **toutes** les demi-finales du même `trialName` + `categoryGender`

**Request body** :
```json
{
  "trialName": "FIFTY_M_FREESTYLE (required, voir enums)",
  "description": "string",
  "rules": "string",
  "startDate": "2026-07-27",
  "startHour": "09:00",
  "endDate": "2026-07-27",
  "endHour": "10:00",
  "mode": "INDIVIDUAL (required)",
  "categoryGender": "MALE (required)",
  "siteId": 1,
  "competitionId": 1,
  "roundId": null
}
```

> `roundId` est **optionnel**. Si absent ou `null`, le round `QUALIFICATION_HEAT` est utilisé automatiquement.

**Response** `201` :
```json
{
  "id": 1,
  "name": "50m nage libre - Qualification/Heat 1",
  "trialName": "FIFTY_M_FREESTYLE",
  "roundNumber": 1,
  "description": "string",
  "rules": "string",
  "startDate": "2026-07-27",
  "startHour": "09:00",
  "endDate": "2026-07-27",
  "endHour": "10:00",
  "mode": "INDIVIDUAL",
  "categoryGender": "MALE",
  "siteId": 1,
  "siteLatitude": 48.8566,
  "siteLongitude": 2.3522,
  "competitionId": 1,
  "roundId": 1,
  "roundDisplayName": "Qualification/Heat",
  "status": "UPCOMING",
  "statusLabel": "À venir",
  "cancelled": false,
  "cancelledAt": null,
  "hasStarted": false,
  "hasEnded": false
}
```

---

### GET /api/trials
Liste toutes les épreuves. Filtrage optionnel par compétition.

**Accès** : Authentifié

**Query params** : `competitionId` (optionnel)

**Response** `200` : Liste de `TrialResponse`

---

### GET /api/trials/{id}
Détail d'une épreuve.

**Accès** : Authentifié

**Response** `200` : Objet `TrialResponse`

---

### PUT /api/trials/{id}
Met à jour une épreuve.

**Accès** : Authentifié

**Request body** : Identique à `TrialCreateRequest`

**Response** `200` : Objet `TrialResponse`

---

### PATCH /api/admin/trials/{id}/cancel
Annule une épreuve. Irréversible. Seules les épreuves UPCOMING ou IN_PROGRESS peuvent être annulées.

**Accès** : ADMIN

**Response** `200` : Objet `TrialResponse` avec `cancelled: true`

---

## 7. Rounds

### POST /api/rounds
Crée un round.

**Accès** : Authentifié

**Request body** :
```json
{
  "name": "QUALIFICATION_HEAT (required, voir enums)"
}
```

**Response** `201` :
```json
{
  "id": 1,
  "name": "QUALIFICATION_HEAT",
  "orderNumber": 1,
  "displayName": "Qualification/Heat"
}
```

---

### GET /api/rounds
Liste tous les rounds.

**Accès** : Authentifié

**Response** `200` : Liste de `RoundResponse`

---

### GET /api/rounds/{id}
Détail d'un round.

**Accès** : Authentifié

**Response** `200` : Objet `RoundResponse`

---

### DELETE /api/rounds/{id}
Supprime un round.

**Accès** : Authentifié

**Response** `204`

---

## 8. Sites

### POST /api/admin/sites
Crée un site (lieu de compétition).

**Accès** : ADMIN

**Request body** :
```json
{
  "adress": "string (required)",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

**Response** `201` :
```json
{
  "id": 1,
  "adress": "string",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

---

### PUT /api/admin/sites/{id}
Met à jour un site.

**Accès** : ADMIN

**Request body** : Identique à `SiteCreateRequest`

**Response** `200` : Objet `SiteResponse`

---

### GET /api/admin/sites/{id}
Détail d'un site.

**Accès** : ADMIN

**Response** `200` : Objet `SiteResponse`

---

### GET /api/admin/sites
Liste tous les sites.

**Accès** : ADMIN

**Response** `200` : Liste de `SiteResponse`

---

### DELETE /api/admin/sites/{id}
Supprime un site.

**Accès** : ADMIN

**Response** `204`

---

## 9. Participants aux épreuves (Trial Participants)

### POST /api/admin/trials/{id}/athletes
Assigne des athlètes à une épreuve. Uniquement pour les séries de qualification (QUALIFICATION_HEAT).

**Accès** : ADMIN

**Contraintes** :
- Maximum 8 athlètes par série
- Seuls les athlètes avec une participation CONFIRMED à la compétition sont éligibles
- Un athlète ne peut pas être dans 2 séries de qualification du même trialName + categoryGender
- Bloqué si le trial est annulé ou déjà commencé
- Bloqué pour les rounds DEMI_FINALE et FINALE (assignation automatique future)

**Request body** :
```json
{
  "athleteIds": [1, 2, 3, 4, 5]
}
```

**Response** `201` :
```json
[
  {
    "id": 1,
    "trialId": 42,
    "athleteId": 1,
    "athleteFirstName": "Michael",
    "athleteLastName": "Phelps",
    "athleteEmail": "michael@swim.com",
    "createdAt": "2026-07-27T10:30:00"
  }
]
```

**Erreurs possibles** :
| Code | Message |
|------|---------|
| 400 | "Le nombre maximum d'athlètes par série est de 8. Actuellement X athlète(s) assigné(s), impossible d'en ajouter Y." |
| 400 | "L'athlète {nom} n'a pas de participation confirmée pour cette compétition." |
| 400 | "L'athlète {nom} est déjà assigné(e) à cette série." |
| 400 | "L'athlète {nom} est déjà assigné(e) à une autre série de qualification pour cette épreuve." |
| 400 | "Les participants seront automatiquement déterminés après les résultats des qualifications." |
| 400 | "Les participants seront automatiquement déterminés après les résultats des demi-finales." |
| 400 | "Impossible d'assigner des athlètes à une épreuve annulée." |
| 400 | "Impossible d'assigner des athlètes à une série déjà commencée." |

---

### GET /api/admin/trials/{id}/athletes
Liste les athlètes assignés à une épreuve.

**Accès** : ADMIN

**Response** `200` : Liste de `TrialParticipantResponse`

---

### DELETE /api/admin/trials/{id}/athletes/{athleteId}
Retire un athlète d'une épreuve. Impossible si l'épreuve a déjà commencé.

**Accès** : ADMIN

**Response** `204`

**Erreurs possibles** :
| Code | Message |
|------|---------|
| 400 | "Impossible de retirer un athlète d'une série déjà commencée." |

---

## 10. Profil Athlète

### GET /api/athlete/profile
Récupère le profil de l'athlète connecté.

**Accès** : ATHLETE

**Response** `200` :
```json
{
  "id": 1,
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "createdAt": "2026-01-15T10:00:00",
  "nationality": "string",
  "birthDate": "2000-01-15",
  "sexe": "string",
  "passportNumber": "string",
  "hasPassport": true,
  "hasAcceptedCharte": true,
  "hasMedicalCertificate": true
}
```

---

### PUT /api/athlete/profile
Met à jour le profil de l'athlète connecté. Tous les champs sont optionnels (mise à jour partielle).

**Accès** : ATHLETE

**Request body** :
```json
{
  "nationality": "string",
  "birthDate": "2000-01-15",
  "sexe": "string",
  "passportNumber": "string",
  "hasAcceptedCharte": true
}
```

**Response** `200` : Objet `AthleteResponse`

---

### POST /api/athlete/profile/medical-certificate
Upload du certificat médical (multipart/form-data).

**Accès** : ATHLETE

**Form param** : `file` (MultipartFile)

**Response** `200`

---

### GET /api/athlete/profile/medical-certificate
Télécharge le certificat médical.

**Accès** : ATHLETE

**Response** `200` : fichier binaire avec `Content-Type` et `Content-Disposition`

---

### DELETE /api/athlete/profile/medical-certificate
Supprime le certificat médical.

**Accès** : ATHLETE

**Response** `204`

---

### POST /api/athlete/profile/passport
Upload du scan de passeport (multipart/form-data).

**Accès** : ATHLETE

**Form param** : `file` (MultipartFile)

**Response** `200`

---

### GET /api/athlete/profile/passport
Télécharge le scan de passeport.

**Accès** : ATHLETE

**Response** `200` : fichier binaire

---

### DELETE /api/athlete/profile/passport
Supprime le scan de passeport.

**Accès** : ATHLETE

**Response** `204`

---

## 11. Participations Athlète

### GET /api/athlete/competitions
Récupère les cartes du dashboard de l'athlète connecté (ses compétitions).

**Accès** : ATHLETE

**Response** `200` :
```json
[
  {
    "participationId": 1,
    "competitionName": "string",
    "eventName": "string",
    "startDate": "2026-07-27T08:00:00",
    "endDate": "2026-07-27T18:00:00",
    "status": "INVITED"
  }
]
```

---

### POST /api/athlete/competitions/{participationId}/confirm
Confirme la participation et accepte la charte.

**Accès** : ATHLETE

**Response** `200`

---

## 12. Commissaire

### POST /api/commissioner/create-athlete
Crée un athlète manuellement.

**Accès** : COMMISSIONNER

**Request body** :
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string"
}
```

**Response** `201` :
```json
{
  "id": 1,
  "email": "athlete@example.com",
  "role": "ATHLETE"
}
```

---

### POST /api/commissioner/create-volonteer
Crée un volontaire manuellement.

**Accès** : COMMISSIONNER

**Request body** : Identique à `CreateUserRequest`

**Response** `201` : `{ "id", "email", "role": "VOLONTEER" }`

---

### POST /api/commissioner/competitions/{competitionId}/import-athletes
Importe des athlètes depuis un CSV et les invite à la compétition. Crée les comptes si nécessaire.

**Accès** : COMMISSIONNER

**Form param** : `file` (CSV, max 5Mo, colonnes : `email`, `firstName`, `lastName`)

**Response** `200` :
```json
{
  "message": "Import athlètes terminé",
  "processed": 10,
  "invited": 8,
  "skipped": 2
}
```

---

### POST /api/commissioner/import-athletes
*Deprecated* - Import d'athlètes sans contexte de compétition.

**Accès** : COMMISSIONNER

---

### POST /api/commissioner/import-volonteers
Importe des volontaires depuis un CSV.

**Accès** : COMMISSIONNER

**Form param** : `file` (CSV)

**Response** `200` : `"Import volontaires terminé"`

---

### GET /api/commissioner/events/{eventId}/competitions
Liste les compétitions d'un événement.

**Accès** : COMMISSIONNER

**Response** `200` : Liste de `CompetitionResponse`

---

### GET /api/commissioner/competitions/{competitionId}
Détail d'une compétition.

**Accès** : COMMISSIONNER

**Response** `200` : Objet `CompetitionResponse`

---

### GET /api/commissioner/competitions/{competitionId}/trials
Liste les épreuves d'une compétition.

**Accès** : COMMISSIONNER

**Response** `200` : Liste de `TrialResponse`

---

### PUT /api/commissioner/trials/{id}
Met à jour une épreuve.

**Accès** : COMMISSIONNER

**Request body** : Identique à `TrialCreateRequest`

**Response** `200` : Objet `TrialResponse`

---

### PATCH /api/commissioner/trials/{id}/cancel
Annule une épreuve.

**Accès** : COMMISSIONNER

**Response** `200` : Objet `TrialResponse`

---

### GET /api/commissioner/athletes
Liste tous les athlètes.

**Accès** : COMMISSIONNER

**Response** `200` : Liste de `AthleteResponse`

---

### GET /api/commissioner/competitions/{competitionId}/athletes
Liste les athlètes participant à une compétition.

**Accès** : COMMISSIONNER

**Response** `200` : Liste de `AthleteResponse`

---

### GET /api/commissioner/athletes/{athleteId}/participations
Liste les participations d'un athlète.

**Accès** : COMMISSIONNER

**Response** `200` : Liste de `ParticipantResponse`
```json
[
  {
    "participationId": 1,
    "competitorId": 5,
    "competitorType": "ATHLETE",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "status": "CONFIRMED",
    "competitionId": 1,
    "competitionName": "string"
  }
]
```

---

### GET /api/commissioner/athletes/{athleteId}/profile
Détail du profil d'un athlète.

**Accès** : COMMISSIONNER

**Response** `200` : Objet `AthleteResponse`

---

## 13. Pays

### GET /api/countries
Liste tous les pays disponibles.

**Accès** : Public

**Response** `200` :
```json
[
  {
    "code": "FR",
    "name": "France"
  }
]
```

---

---

## 14. Carte interactive

### GET /map/data
Retourne toutes les données nécessaires pour alimenter la carte interactive : sites, fan zones, épreuves et (optionnellement) positions des athlètes.

**Accès** : Public

**Query params** :
| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `includeAthletes` | boolean | `false` | Inclure les positions GPS des athlètes |

**Response** `200` :
```json
{
  "sites": [
    {
      "id": 1,
      "type": "SITE",
      "name": "Piscine Olympique — 1 avenue des Jeux",
      "latitude": 48.8566,
      "longitude": 2.3522,
      "metadata": null
    }
  ],
  "fanZones": [
    {
      "id": 1,
      "type": "FAN_ZONE",
      "name": "Bar Olympique",
      "latitude": 48.8600,
      "longitude": 2.3600,
      "metadata": "BAR"
    }
  ],
  "events": [
    {
      "trialId": 1,
      "trialName": "50m nage libre - Qualification/Heat 1",
      "startDate": "2026-07-27",
      "startHour": "09:00",
      "siteId": 1,
      "latitude": 48.8566,
      "longitude": 2.3522
    }
  ],
  "athleteLocations": null
}
```

> `athleteLocations` est `null` si `includeAthletes=false`, sinon liste d'`AthleteLocationResponse`.

---

## 15. Fan Zones

### GET /api/fan-zones/nearby
Recherche les fan zones à proximité d'une position GPS. Combine les fan zones enregistrées en base et les suggestions Google Maps (bars, espaces publics).

**Accès** : Public

**Query params** :
| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `latitude` | double | requis | Latitude de l'utilisateur |
| `longitude` | double | requis | Longitude de l'utilisateur |
| `radiusKm` | double | `5.0` | Rayon de recherche en kilomètres |

**Response** `200` :
```json
{
  "savedFanZones": [
    {
      "id": 1,
      "name": "Bar Olympique",
      "address": "3 rue des Champions",
      "latitude": 48.8600,
      "longitude": 2.3600,
      "capacity": 200,
      "type": "BAR",
      "description": "Bar officiel partenaire",
      "googlePlaceId": null
    }
  ],
  "googleSuggestions": [
    {
      "googlePlaceId": "ChIJD7fiBh9u5kcR...",
      "name": "Le Café du Stade",
      "address": "5 avenue des Sports, Paris",
      "latitude": 48.8590,
      "longitude": 2.3580,
      "suggestedType": "BAR",
      "rating": 4.2
    }
  ]
}
```

---

### GET /api/trials/nearby
Recherche les épreuves dont le site est dans un rayon donné, triées par distance croissante.

**Accès** : Public

**Query params** :
| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `latitude` | double | requis | Latitude de l'utilisateur |
| `longitude` | double | requis | Longitude de l'utilisateur |
| `radiusKm` | double | `10.0` | Rayon de recherche en kilomètres |

**Response** `200` :
```json
[
  {
    "trialId": 1,
    "trialName": "50m nage libre - Qualification/Heat 1",
    "startDate": "2026-07-27",
    "startHour": "09:00",
    "endDate": "2026-07-27",
    "endHour": "10:00",
    "siteId": 1,
    "siteAddress": "Piscine Olympique, 1 avenue des Jeux",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "distanceKm": 0.87
  }
]
```

---

### POST /api/directions
Calcule un itinéraire entre la position de l'utilisateur et une destination (site, fan zone ou coordonnées libres).

**Accès** : Public

**Request body** :
```json
{
  "fromLatitude": 48.8500,
  "fromLongitude": 2.3400,
  "siteId": 1,
  "fanZoneId": null,
  "toLatitude": null,
  "toLongitude": null,
  "travelMode": "WALKING"
}
```

> Exactement **une** des trois destinations doit être fournie : `siteId`, `fanZoneId` ou `toLatitude`+`toLongitude`.

**Response** `200` :
```json
{
  "summary": "Via Avenue de la Paix",
  "distanceKm": 1.2,
  "durationMinutes": 15,
  "polyline": [],
  "htmlInstructions": "Prenez la direction nord sur Rue Gambetta",
  "destinationLatitude": 48.8566,
  "destinationLongitude": 2.3522
}
```

**Erreurs possibles** :
| Code | Message |
|------|---------|
| 400 | "Site introuvable: {id}" |
| 400 | "Fan zone introuvable: {id}" |
| 400 | "Destination non spécifiée. Fournir siteId, fanZoneId ou coordonnées GPS." |

---

### POST /api/admin/fan-zones
Crée une fan zone manuellement.

**Accès** : ADMIN

**Request body** :
```json
{
  "name": "Bar Olympique",
  "address": "3 rue des Champions, Paris",
  "latitude": 48.8600,
  "longitude": 2.3600,
  "capacity": 200,
  "type": "BAR",
  "description": "Bar officiel partenaire de l'événement"
}
```

**Response** `200` :
```json
{
  "id": 1,
  "name": "Bar Olympique",
  "address": "3 rue des Champions, Paris",
  "latitude": 48.8600,
  "longitude": 2.3600,
  "capacity": 200,
  "type": "BAR",
  "description": "Bar officiel partenaire de l'événement",
  "googlePlaceId": null
}
```

---

### POST /api/admin/fan-zones/import
Importe une fan zone depuis Google Maps via un Place ID.

**Accès** : ADMIN

**Request body** :
```json
{
  "placeId": "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
  "overrideType": "BAR",
  "description": "Partenaire officiel"
}
```

> `overrideType` est optionnel. Si absent, le type est déduit des catégories Google (`bar` → `BAR`, `stadium` → `EVENT_SPACE`, sinon `PUBLIC_VIEWING`).

**Response** `200` : Objet `FanZoneResponse` (identique à la création manuelle, avec `googlePlaceId` renseigné)

---

## 16. Géolocalisation Athlète

### PUT /api/athletes/{athleteId}/location
Met à jour la position GPS de l'athlète en temps réel. Crée l'entrée si elle n'existe pas encore, sinon la met à jour (upsert).

**Accès** : ATHLETE, ADMIN

**Path param** : `athleteId` (Long)

**Request body** :
```json
{
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

**Response** `200` :
```json
{
  "id": 1,
  "athleteId": 42,
  "latitude": 48.8566,
  "longitude": 2.3522,
  "timestamp": "2026-07-27T09:45:00"
}
```

---

### GET /api/athletes/{athleteId}/meeting-info
Retourne les épreuves à venir de l'athlète avec les coordonnées GPS du site, triées par date croissante.

**Accès** : ATHLETE, ADMIN

**Path param** : `athleteId` (Long)

**Response** `200` :
```json
[
  {
    "trialId": 1,
    "trialName": "50m nage libre - Qualification/Heat 1",
    "startDate": "2026-07-27",
    "startHour": "09:00",
    "siteId": 1,
    "siteAddress": "Piscine Olympique, 1 avenue des Jeux",
    "latitude": 48.8566,
    "longitude": 2.3522
  }
]
```

> Retourne une liste vide `[]` si l'athlète n'a pas d'épreuves à venir.

---

## 17. Enums de référence

### TrialName (type d'épreuve de natation)
| Valeur | Libellé |
|--------|---------|
| `FIFTY_M_FREESTYLE` | 50m nage libre |
| `HUNDRED_M_FREESTYLE` | 100m nage libre |
| `TWO_HUNDRED_M_FREESTYLE` | 200m nage libre |
| `FOUR_HUNDRED_M_FREESTYLE` | 400m nage libre |
| `FIVE_HUNDRED_M_FREESTYLE` | 500m nage libre |
| `EIGHT_HUNDRED_M_FREESTYLE` | 800m nage libre |
| `FIFTEEN_HUNDRED_M_FREESTYLE` | 1500m nage libre |
| `HUNDRED_M_BACKSTROKE` | 100m dos |
| `TWO_HUNDRED_M_BACKSTROKE` | 200m dos |
| `HUNDRED_M_BREASTSTROKE` | 100m brasse |
| `TWO_HUNDRED_M_BREASTSTROKE` | 200m brasse |
| `HUNDRED_M_BUTTERFLY` | 100m papillon |
| `TWO_HUNDRED_M_BUTTERFLY` | 200m papillon |
| `TWO_HUNDRED_M_INDIVIDUAL_MEDLEY` | 200m 4 nages |
| `FOUR_HUNDRED_M_INDIVIDUAL_MEDLEY` | 400m 4 nages |
| `RELAY_4X100M_FREESTYLE` | Relais 4*100m nage libre |
| `RELAY_4X200M_FREESTYLE` | Relais 4*200m nage libre |
| `RELAY_4X100M_MEDLEY` | Relais 4*100m 4 nages |

### RoundName (phase de compétition)
| Valeur | Libellé | Ordre |
|--------|---------|-------|
| `QUALIFICATION_HEAT` | Qualification/Heat | 1 |
| `HUITIEMES_DE_FINALE` | Huitièmes de finale | 2 |
| `QUART_DE_FINALE` | Quart de finale | 3 |
| `DEMI_FINALE` | Demi-finale | 4 |
| `FINALE` | Finale | 5 |
| `PHASE_SUPPLEMENTAIRE` | Phase supplémentaire | 6 |

### TrialMode
| Valeur |
|--------|
| `INDIVIDUAL` |
| `TEAM` |

### CategoryGender
| Valeur |
|--------|
| `MALE` |
| `FEMALE` |
| `MIXTE` |

### Status (calculé dynamiquement)
| Valeur | Libellé |
|--------|---------|
| `UPCOMING` | À venir |
| `IN_PROGRESS` | En cours |
| `COMPLETED` | Terminée |
| `CANCELED` | Annulée |

### ParticipationStatus
| Valeur |
|--------|
| `PENDING` |
| `INVITED` |
| `CONFIRMED` |
| `CANCELLED` |

### CompetitorType
| Valeur |
|--------|
| `ATHLETE` |
| `TEAM` |

### FanZoneType
| Valeur | Description |
|--------|-------------|
| `PUBLIC_VIEWING` | Espace de visionnage public |
| `BAR` | Bar ou établissement de restauration |
| `EVENT_SPACE` | Espace événementiel ou stade |

### TravelMode (mode de transport pour les itinéraires)
| Valeur | Description |
|--------|-------------|
| `DRIVING` | En voiture |
| `WALKING` | À pied |
| `TRANSIT` | Transports en commun |
| `BICYCLING` | À vélo |

---

## 18. Erreurs

Toutes les erreurs retournent un objet `ApiError` :

```json
{
  "timestamp": "2026-07-27T10:30:00",
  "status": 400,
  "error": "Requête invalide",
  "message": "Message d'erreur explicite en français",
  "path": "/api/admin/trials/42/athletes",
  "validationErrors": {
    "fieldName": "message de validation"
  }
}
```

Le champ `validationErrors` n'est présent que pour les erreurs de validation de champs (`@Valid`).

### Codes HTTP utilisés

| Code | Cas d'usage |
|------|-------------|
| `200` | Succès (lecture, mise à jour) |
| `201` | Création réussie |
| `204` | Suppression réussie (pas de contenu) |
| `400` | Requête invalide (validation, règles métier) |
| `401` | Identifiants incorrects |
| `403` | Compte non activé |
| `404` | Ressource introuvable |
| `413` | Fichier trop volumineux (max 10 Mo) |
| `500` | Erreur interne |
