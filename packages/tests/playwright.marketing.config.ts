import { defineConfig, devices } from '@playwright/test'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MARKETING_SPEC_PATTERNS } from './e2e/_support/marketing-specs.const'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..')

const MARKETING_BASE_URL = process.env.MARKETING_BASE_URL ?? 'http://localhost:3000'

/**
 * Specs verified green AND stable (5+ consecutive local runs, no flake) on
 * this config. CI runs ONLY these (`MARKETING_GREEN_ONLY=1`) — same pattern
 * as `GREEN_SPECS` in `playwright.config.ts`, kept separate because this
 * config targets the Nuxt dev server (:3000), not Histoire (:6006). Grows
 * wave by wave as the rest of `MARKETING_SPEC_PATTERNS` is stabilised. A
 * local run with no env var still executes the whole marketing suite.
 */
const MARKETING_GREEN_SPECS = [
    'nav-link-availability.spec.ts',
    'marketing-nav-ssr.spec.ts',

    // #835 — garde le theming du site entier : le thème que le serveur rend
    // doit encore être là après hydratation. Le défaut qu'elle a trouvé
    // (`data-theme: 'geek'` en dur dans `app.head.htmlAttrs`, réécrit par
    // unhead ~1,36 s après la navigation) cassait les DEUX axes, sur toutes
    // les pages, pour tous les visiteurs, depuis le 2026-06-12 — et rien ne
    // le disait, parce qu'aucun job de CI n'exécutait les specs marketing.
    //
    // Admise ici parce qu'elle tient le contrat de la liste, mesuré :
    //   - contrôle positif : 4/4 ROUGE contre le produit non corrigé,
    //     4/4 VERT après ;
    //   - stabilité : 20 passed en `--repeat-each=5 --retries=0`, 1,2 min,
    //     machine au repos, serveur de dev isolé sur un port à nous.
    'marketing-theme-honored.spec.ts',

    // #761 — relève les requêtes réellement émises et échoue en nommant l'hôte
    // fautif dès qu'une page recontacte un tiers (un `<link>` vers un CDN, une
    // police, un script d'analyse). C'est le filet qui garde honnête la page
    // `/privacy`, laquelle affirme qu'aucun hôte externe n'est contacté : la
    // promesse est publiée, elle doit donc être vérifiée à chaque exécution.
    //
    // Admise ici parce qu'elle tient le contrat de la liste, mesuré et non
    // supposé : 5 exécutions consécutives sous `MARKETING_GREEN_ONLY=1`,
    // **7/7 à chaque fois**, zéro instabilité ; 19,4 s pour le fichier seul.
    //
    // ⛔ Ce n'était PAS vrai au premier jet, et le dire importe : avec
    // `waitUntil: 'networkidle'`, la même mesure donnait **3 expirations sur
    // 5 exécutions**. Le serveur Nuxt de dev garde la liaison HMR de Vite
    // ouverte et compile à la demande — le réseau n'est jamais au repos, donc
    // l'attente expirait sur les routes lourdes sans qu'aucune assertion soit
    // évaluée. Corrigé par la bonne attente (`load` + `document.fonts.ready`),
    // pas par un délai plus long : voir l'en-tête du spec.
    //
    // Elle ne dépend d'aucun accès sortant du runner : son contrôle positif
    // vise un hôte en `.invalid` (RFC 2606), qui ne résout jamais et échoue
    // immédiatement — la suite ne contacte donc elle-même aucun tiers.
    'marketing-no-third-party.spec.ts',

    // #944 — la forme du menu déroulant sous les 8 identités. Le fichier
    // existait depuis longtemps SANS être gardé : il était inscrit dans
    // `e2e/_support/baseline/spec-coverage.json` comme non exécuté, donc la
    // garde `spec-coverage` restait verte et rien ne le signalait.
    //
    // Admis ici parce qu'il tient le contrat de la liste, mesuré et non
    // supposé :
    //   - contrôle positif : les 6 cas de `menu shape` sont **6/6 ROUGES**
    //     contre un serveur servant `develop`, et ils échouent sur la VALEUR
    //     reçue (`28px` / `22px` / `30px` / `20px`), pas sur une expiration —
    //     une spec qui expire ne prouve rien ;
    //   - stabilité : **110/110** en `--repeat-each=5 --retries=0` sur le
    //     FICHIER ENTIER (22 cas × 5), 2,3 min, machine au repos (load 3,3),
    //     serveur de dev isolé sur un port à nous. Les 16 cas préexistants
    //     sont donc verts et stables eux aussi — c'est la condition pour
    //     brancher un fichier plutôt que des cas.
    //
    // ⛔ Le premier clic sur l'activateur tombe dans le vide tant que Nuxt
    // n'a pas hydraté : le bouton est peint et « actionable » pour Playwright,
    // mais Vue n'a pas encore attaché son écouteur. Mesuré : 6/6 expirations.
    // Le site n'expose aucun marqueur d'hydratation (`[data-v-app]` absent),
    // d'où la boucle de re-clic dans le spec. Ne pas la remplacer par un
    // `waitForTimeout` : c'est ce qui rendrait le fichier instable en CI, où
    // la machine est plus lente que la nôtre.
    'marketing-primary-nav.spec.ts'
]

/*
 * ⚠️ `nav-link-availability.spec.ts`, déjà dans la liste, a produit 3 échecs
 * sur 2 des 5 exécutions ci-dessus (expirations à 30 s, et un libellé « Docs »
 * absent des menus). Constaté en mesurant l'entrée voisine, hors périmètre de
 * #761 — non diagnostiqué, signalé pour que ce ne soit pas perdu.
 */
/**
 * Playwright configuration for marketing-site e2e specs.
 *
 * Separate from the default `playwright.config.ts` because that one
 * targets Histoire at :6006, whereas marketing tests target the Nuxt
 * dev server at :3000. A single config file cannot target two different
 * webServers, so we keep them apart.
 *
 * Run: `pnpm -F @origam/tests playwright test --config=playwright.marketing.config.ts`
 */
export default defineConfig({
    testDir: './e2e',
    testMatch: process.env.MARKETING_GREEN_ONLY === '1' ? MARKETING_GREEN_SPECS : MARKETING_SPEC_PATTERNS,
    outputDir: './e2e/.results-marketing',

    fullyParallel: false,

    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,

    reporter: [
        ['html', { outputFolder: 'e2e/.report-marketing', open: 'never' }],
        ['list']
    ],

    use: {
        baseURL: MARKETING_BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ],

    webServer: {
        command: 'NUXT_IGNORE_LOCK=1 pnpm -F @origam/marketing dev',
        cwd: REPO_ROOT,
        // ⛔ Must follow `baseURL`, never a hardcoded :3000. With
        // `reuseExistingServer: true`, a probe on :3000 that finds ANOTHER
        // worktree's dev server (there are ~55 of them) returns "reuse" while
        // the specs hit `MARKETING_BASE_URL` — or worse, the specs hit :3000
        // and measure a neighbour's build. Same trap as the :6006 Histoire
        // one documented in CLAUDE.md. #836.
        url: MARKETING_BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000
    }
})
