# Déploiement marketing (Coolify) — variables d'env + base de données

Depuis la migration API-Reference, le site marketing lit sa doc d'API depuis
**PostgreSQL** (les pages `/components`, `/composables`, … appellent l'API Nitro
`/api/reference/**`). Le backoffice `/admin` édite cette même base. Il faut donc,
en plus du déploiement de l'image, **provisionner + migrer + seeder une base
Postgres** et configurer les variables d'env ci-dessous.

> Le healthcheck `/api/health` est en **liveness pur** (200 tant que le serveur
> répond). Une base injoignable **ne fait plus échouer le déploiement** ; elle
> apparaît juste comme `db.ok=false` dans la réponse. Mais les pages API-Reference
> resteront **vides** tant que la base n'est pas montée + seedée.

## 1. Variables d'environnement à configurer dans Coolify (service marketing)

### Base de données (obligatoire pour l'API-Reference)
Convention Nuxt `runtimeConfig` — variables préfixées `NUXT_` (même principe que
les autres projets) :

```
NUXT_DB_HOST=<host>
NUXT_DB_PORT=5432
NUXT_DB_NAME=<db>
NUXT_DB_USER=<user>
NUXT_DB_PASSWORD=<password>
```

Ajouter si la base managée présente un certificat auto-signé :

```
NUXT_DB_SSL=true
```

> Override optionnel : `DATABASE_URL=postgres://user:pass@host:5432/db` est aussi
> accepté (pratique en local / docker) et prend le pas sur le set `NUXT_DB_*`.

### Backoffice /admin (obligatoire seulement si tu utilises l'admin)
```
NUXT_ADMIN_PASSWORD_HASH=<hash scrypt>   # voir génération ci-dessous
NUXT_SESSION_PASSWORD=<32+ caractères aléatoires>
```

Génération du hash admin (mot de passe → hash scrypt) :
```bash
node -e "const {scryptSync,randomBytes}=require('crypto');const s=randomBytes(16).toString('hex');console.log(s+':'+scryptSync('TON_MOT_DE_PASSE',s,64).toString('hex'))"
```
Génération du secret de session :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Divers (déjà en place)
```
NUXT_PUBLIC_GITHUB_REPO=arnaudprioul/origam
NITRO_PORT=3000
NITRO_HOST=0.0.0.0
```

## 2. Provisionner PostgreSQL

- Dans Coolify : créer un service **PostgreSQL 16** (ou une base managée) sur le
  même projet/réseau que le service marketing, une base par environnement
  (dev/stage/prod). Récupérer host/port/user/password/db → renseigner les vars
  ci-dessus.

## 3. Migrer + seeder la base (une fois par environnement)

L'image runtime ne contient que `.output` (pas les scripts). La migration + le
seed se lancent depuis une machine ayant le repo, **pointée sur la base Coolify** :

```bash
# depuis packages/marketing, avec DATABASE_URL de l'env cible :
DATABASE_URL=postgres://user:pass@HOST:5432/db pnpm -F @origam/marketing db:migrate     # crée les 14 tables
DATABASE_URL=postgres://user:pass@HOST:5432/db pnpm -F @origam/marketing docs:seed       # remplit depuis server/db/seed/*.json (1734 entrées)
DATABASE_URL=postgres://user:pass@HOST:5432/db pnpm -F @origam/marketing docs:sync        # applique l'extension [SRC] depuis la source DS
```

Alternative reproductible : le **docker-compose** fourni (`docker-compose.yml`)
avec ses services `db` + `migrate` + `app` fait migration + seed automatiquement
(`docker compose -f packages/marketing/docker-compose.yml up`). Utile en local /
self-host ; en Coolify, préférer les commandes ci-dessus contre la base managée.

## 4. Re-sync à chaque update du DS

Après un update du design system, relancer `docs:sync` contre la base de l'env
pour régénérer les champs auto-dérivés (`[SRC]`) sans écraser la prose curated
(`[ÉDIT]`). Un drift gate est disponible : `docs:sync:check` (exit 1 si la base
diffère de la source).

## 5. Vérification

```bash
curl -s https://<domaine>/api/health        # {"status":"ok","db":{"configured":true,"ok":true}}
curl -s https://<domaine>/api/reference/component | head   # tableau non vide (194 composants)
```
