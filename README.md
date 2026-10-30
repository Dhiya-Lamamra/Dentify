# Dentify

Plateforme qui met en relation des **cliniques dentaires** et des **professionnels dentaires** (hygiénistes, assistantes, dentistes) : les cliniques publient des offres de remplacement, les professionnels postulent et échangent avec la clinique.

Projet réalisé en équipe à l'ÉTS.

## Architecture

| Dossier | Rôle | Technologies |
|---|---|---|
| `backend/` | API REST (authentification JWT, offres, candidatures, messagerie) | Node.js, Express, Sequelize |
| `baseDeDonnees/` | Schéma SQL initial | MySQL 8 |
| `frontendWeb/` | Site web | React, Vite |
| `frontendMobile/` | Application mobile | React Native, Expo, TypeScript |

## Lancer le projet (Docker)

Prérequis : [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
docker compose up -d --build
```

- Site web : http://localhost:5173
- API : http://localhost:4000 (test : http://localhost:4000/test)
- MySQL : localhost:3306 (root / rootpassword)

Arrêter : `docker compose down` — repartir d'une base vide : `docker compose down -v`.

## Lancer sans Docker

1. MySQL 8 démarré, puis importer `baseDeDonnees/DB_DENTIFY.sql`.
2. Backend :
   ```bash
   cd backend
   cp .env.example .env   # puis adapter les valeurs
   npm install
   npm run dev
   ```
3. Site web :
   ```bash
   cd frontendWeb
   npm install
   npm run dev
   ```
4. Application mobile :
   ```bash
   cd frontendMobile
   npm install
   npx expo start        # appuyer sur w pour la version web, ou scanner le QR code avec Expo Go
   ```

## API principale

| Méthode | Route | Accès |
|---|---|---|
| POST | `/api/users/register` | public (renvoie un token) |
| POST | `/api/users/login` | public (renvoie un token + type d'utilisateur) |
| GET/PUT | `/api/users/profile` | connecté |
| GET | `/api/offres` | public (offres actives) |
| GET | `/api/offres/:id` | public |
| GET | `/api/offres/mes-offres` | clinique |
| POST | `/api/offres/creer` | clinique |
| PUT | `/api/offres/:id` · PATCH `/api/offres/:id/archive` | clinique propriétaire |
| POST | `/api/candidatures` | professionnel |
| GET | `/api/candidatures/mes-candidatures` | professionnel |
| GET | `/api/candidatures/offre/:id` | clinique propriétaire |
| PUT | `/api/offres/accepter/:idCandidature` | clinique propriétaire |
| GET | `/api/messages/conversations` · GET `/api/messages/:idUtilisateur` · POST `/api/messages` | connecté |
