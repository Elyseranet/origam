import { test } from '@playwright/test'

/**
 * Fail loud, at the very first test, when a DB-dependent marketing spec runs
 * against a server that has no API-Reference database — #835.
 *
 * ## Pourquoi ce helper existe
 *
 * Un rejeu isolé de la suite marketing (`playwright.marketing.config.ts`,
 * hors `MARKETING_GREEN_ONLY`) a mesuré 97 échecs sur 213 tests. 69 d'entre
 * eux n'étaient PAS 13 specs cassées : c'était une seule dépendance absente
 * (`00.db-bootstrap.ts` journalise `DB non configurée — skip` et rend les
 * pages API-Reference vides) qui faisait échouer, un par un et par timeout,
 * chaque assertion d'un catalogue vide. Rejoué avec une base seedée, 69 de
 * ces échecs disparaissent — mesuré, pas supposé.
 *
 * ⛔ **Une garde côté serveur (middleware/plugin) a été essayée et retirée** :
 * elle ciblait `process.env.CI`, qui est vrai dans TOUS les jobs GitHub
 * Actions — y compris `test-a11y-marketing`, qui audite des pages qui se
 * rendent très bien sans base. Elle a cassé ce job en CI (#856). **Aucun job
 * de `ci.yml` ne provisionne de base aujourd'hui** (`grep -c NUXT_DB
 * .github/workflows/ci.yml` → 0) — la bonne portée n'est pas « la CI », c'est
 * « cette suite de specs précise », et seul le fichier de spec sait laquelle
 * il est.
 *
 * `requireMarketingDb()` interroge `/api/health` (déjà conçu pour ça — voir
 * son en-tête : « gate on db.ok there, not on the HTTP status ») dans un
 * `test.beforeAll`, et fait échouer la suite à l'instant zéro, avec un
 * message qui nomme les variables attendues, plutôt que de laisser chaque
 * test grincer contre un catalogue vide jusqu'à son propre timeout.
 *
 * ## Où l'appeler
 *
 * Seuls les fichiers dont j'ai mesuré une différence réelle sans-DB / avec-DB
 * l'utilisent : `marketing-theme-builder`, `marketing-theming-controls`,
 * `marketing-theming-isolation`, `marketing-theming-theme-bg-and-triggers`,
 * `marketing-theming-toggle-vs-split-parity`, `marketing-theming-viewport-height`,
 * `theming-feedback-tokens`, `types`. Les fichiers dont le compte d'échecs
 * n'a PAS bougé entre les deux mesures (`roadmap`, `why-origam`, `wireframe`,
 * `marketing-theme-live-switch`, `marketing-theming`) ne l'importent pas —
 * ils ne dépendent pas de la base, l'ajouter serait un faux signal.
 *
 * Aucun de ces 8 fichiers n'est dans `MARKETING_GREEN_SPECS` aujourd'hui :
 * ce garde ne change donc rien à ce que la CI exécute maintenant — il protège
 * le jour où l'un d'eux y entrera sans qu'une base soit provisionnée à côté.
 */
export function requireMarketingDb (): void {
    test.beforeAll(async ({ request }) => {
        const res = await request.get('/api/health')
        const body = await res.json() as { db: { configured: boolean, ok: boolean } }

        if (!body.db.ok) {
            throw new Error(
                '[#835] Cette suite a besoin de la base API-Reference pour produire un résultat ' +
                `lisible — /api/health répond db.configured=${body.db.configured}, db.ok=${body.db.ok}. ` +
                'Renseigne DATABASE_URL ou NUXT_DB_HOST/NUXT_DB_PORT/NUXT_DB_USER/NUXT_DB_PASSWORD/' +
                'NUXT_DB_NAME avant de lancer ce fichier — sans ça, chaque test suivant échouerait ' +
                'un par un contre un catalogue vide, ce qui ressemble à des specs cassées et n\'en est pas.'
            )
        }
    })
}
