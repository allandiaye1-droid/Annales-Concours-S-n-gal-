# Backend AnnalesConcours

API Node.js sans dependance externe.

Le fichier `schema.sql` contient la structure PostgreSQL/Supabase complete : profils, annales, commandes, paiements et droits de telechargement.

## Connexion Supabase

1. Dans Supabase, ouvrir **SQL Editor**, coller `schema.sql`, puis cliquer sur **Run**. Cette etape cree les tables et insere les 23 annales.
2. Copier `.env.example` vers `.env`.
3. Remplacer `SUPABASE_URL` par l'URL du projet dans **Project Settings > API**.
4. Creer une nouvelle cle serveur privee dans Supabase. Ne jamais la mettre dans `index.html`, `app.js` ou Git.
5. Demarrer le serveur avec `node server.js`.
6. Tester `http://localhost:3000/api/db-test`. La reponse attendue est `{"connected":true,...}`.

La cle privee envoyee dans le chat doit etre revoquee et regeneree avant toute utilisation.

## Lancer

Depuis ce dossier :

```bash
node server.js
```

Puis ouvrir `http://localhost:3000`.

## Routes

- `GET /api/health`
- `GET /api/products`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/orders`

Les donnees sont conservees en memoire pour cette premiere version. Pour la production, remplacer les Maps par PostgreSQL ou Supabase et connecter le paiement Wave / Orange Money.

## Base de donnees

Dans Supabase, ouvrir **SQL Editor**, coller le contenu de `schema.sql`, puis executer le script. Le script cree aussi le catalogue des 23 annales et les regles RLS de base.
