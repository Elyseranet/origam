# @origam/mcp

Serveur MCP (stdio, prive, jamais publie) pour piloter l'API du site marketing origam et tester les composants via le playground. Ticket #1441.

## Prerequis

- Node 24 (`.nvmrc`), `pnpm install` a la racine.
- Chromium de Playwright : `pnpm -F @origam/tests exec playwright install chromium`.
- Playground : `pnpm -F @origam/playground dev` (hote vite, `http://localhost:5183`).
- Marketing local : `pnpm -F @origam/marketing dev --port 3000` (la base doit etre configuree pour les routes `reference/*` ; `health` repond sans base).

## Installation dans Claude Code

```sh
claude mcp add origam -- pnpm -F @origam/mcp start
```

ou `.mcp.json` a la racine du depot :

```json
{
  "mcpServers": {
    "origam": {
      "command": "pnpm",
      "args": ["-F", "@origam/mcp", "start"],
      "env": { "ORIGAM_MCP_LOCAL_URL": "http://localhost:3000" }
    }
  }
}
```

## Variables

| Variable | Defaut | Role |
|---|---|---|
| `ORIGAM_MCP_LOCAL_URL` | `http://localhost:3000` | URL de l'env `local` |
| `ORIGAM_MCP_PLAYGROUND_URL` | `http://localhost:5183` | Hote du playground |
| `ORIGAM_MCP_ALLOW_PROD_WRITE` | absent | `1` autorise les ecritures admin en `prod` (sinon refus) |
| `ORIGAM_MCP_STYLE_PROPS` | couleurs, fond, bordure, rayon, ombre, dimensions, padding | Longhands CSS releves, separes par des virgules |
| `ORIGAM_ADMIN_PASSWORD_<LOCAL\|DEV\|PROD>` | - | Repli si le trousseau n'a pas l'entree |

Environnements : `local` (defaut), `dev` = `https://origam.dev.elysera.net`, `prod` = `https://origam.elysera.net`. Chaque outil API accepte `env`.

## Mot de passe admin (trousseau macOS)

Lu au moment de la connexion, jamais ecrit ni journalise :

```sh
security add-generic-password -a "$USER" -s ORIGAM_ADMIN_PASSWORD_DEV -w   # saisie masquee
```

Une entree par env (`_LOCAL`, `_DEV`, `_PROD`). Si absente, l'erreur de l'outil dit laquelle creer.

## Outils

API publique : `origam_health`, `origam_npm_version`, `origam_npm_downloads`, `origam_github_stars`, `origam_reference_list`, `origam_reference_get`, `origam_reference_categories`, `origam_reference_neighbours`.

API admin : `origam_admin_login`, `origam_admin_logout`, `origam_admin_patch_entry`, `origam_admin_add_example`, `origam_admin_patch_example`, `origam_admin_delete_example`, `origam_admin_add_relation`, `origam_admin_patch_relation`, `origam_admin_delete_relation`, `origam_admin_patch_item`, `origam_admin_sync`, `origam_admin_sync_runs`. La connexion est automatique (une reconnexion sur 401).

Playground : `playground_render` (PNG + styles calcules + classes + console, ou `data-playground-error`), `playground_diff` (`identical: true` = prop probablement morte), `playground_sweep` (valeurs sans effet listees dans `valuesWithoutVisibleEffect`). Une seule instance Chromium headless, fermee a l'arret.

## Tests

```sh
pnpm -F @origam/mcp test
```

Les tests d'integration (stdio) sont conditionnels : `health` / `reference` si un marketing repond sur `ORIGAM_MCP_LOCAL_URL` ; rendu playground si l'hote repond sur `ORIGAM_MCP_PLAYGROUND_URL` **et** `ORIGAM_MCP_TEST_PLAYGROUND=1` (necessite la partie A de #1441).

## Limites

- Les reponses API sont renvoyees en JSON brut : les interfaces `*Doc` du marketing ne sont pas exportees par un paquet importable.
- `DOC_KINDS`, `REL_TYPES` et les collections d'items sont des copies des constantes du marketing (`src/consts/mcp.const.ts`).
