# AnnalesConcours Sénégal — version corrigée

## Corrections principales
- Catalogue local de 23 annales conservé et synchronisation API rendue tolérante aux erreurs.
- Panier nettoyé contre les anciennes données invalides.
- Le site ne confirme plus un achat lorsque l'API échoue.
- Le serveur recalcule le prix côté serveur et valide les produits.
- Les PDF ne sont plus servis directement par le backend public.
- Authentification locale du backend améliorée avec `scrypt` + sessions.
- Comptes et commandes conservés dans `backend/data.json` pour le mode serveur local.
- Sections À propos et Support ajoutées.
- Mention « plateforme officielle » remplacée par une formulation neutre.

## Important avant mise en production
Le paiement Wave / Orange Money n'est pas activé dans cette version, car aucune clé/API de paiement n'a été fournie. Le site crée donc une commande `pending_payment` et ne délivre aucun PDF avant confirmation.

Pour une vraie mise en production, il faut connecter un prestataire de paiement et stocker les utilisateurs/commandes dans Supabase ou une autre base persistante adaptée au déploiement.

## Tester en local
```bash
cd backend
npm start
```
Puis ouvrir `http://localhost:3000`.

## Vérification
- `GET /api/health`
- `GET /api/products`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/orders`
- `/pdf/...` et `/private-pdf/...` doivent répondre 404 côté serveur.

## Configuration SasPay

Le paiement utilise SasPay côté serveur. La clé secrète ne doit jamais être placée dans `app.js`, `index.html` ou dans le dépôt Git.

Variables Vercel à configurer :

- `SASPAY_API_KEY` : clé secrète SasPay avec scope PAYIN/BOTH
- `SITE_URL` : URL publique du site, par exemple `https://annales-concours-s-n-gal.vercel.app`
- `SUPABASE_URL` et `SUPABASE_ANON_KEY` si le catalogue Supabase est utilisé
- `SUPABASE_SERVICE_ROLE_KEY` uniquement côté serveur si nécessaire

Après modification des variables, redéployer le projet. Le site crée une session SasPay pour chaque commande, vérifie son statut côté serveur et ne délivre les PDF qu'après un statut `PAID` + transaction `SUCCESS`.
