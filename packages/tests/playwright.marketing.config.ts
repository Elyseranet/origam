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

    // #953 — le catalogue ne peut plus se vider en silence.
    //
    // Ce spec existait depuis longtemps et n'etait execute par AUCUN job :
    // `/components` — 218 composants, la vitrine du DS — pouvait donc rendre
    // une page VIDE sans une seule ligne rouge, parce que
    // `useReferenceCatalog` declare `default: () => []` et que « 0 famille
    // sur 0 categorie » passe pour un succes.
    //
    // Il entre dans la barriere maintenant, et pas avant, parce que les
    // QUATRE defauts qui l'empechaient sont traites :
    //   - la CI n'avait pas de base           -> service postgres + seed (#953)
    //   - contraste 4,24:1, WCAG AA           -> corrige, 0 echec sur 16
    //   - le fallback 404 ne s'affichait pas  -> #855, les 8 familles a 200
    //   - la table de tokens rendait 0 ligne  -> l'assertion cherchait des
    //     `tbody tr` dans un `<dl>` : defaut du TEST, pas du produit
    //
    // Mesure d'admission : 29 passed, REAL_EXIT=0, contre un build de
    // production pointe sur une base fraichement semee (2733 entrees).
    'components.spec.ts',
    'marketing-nav-ssr.spec.ts',

    // #1103 — plus de flash clair -> sombre a la premiere visite : les deux modes
    // sont inlines cote serveur, le mode epingle l'emporte sur le @media.
    'marketing-ssr-both-modes.spec.ts',

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

    // Refonte de /roadmap sur wireframe valide. Admise ici parce qu'elle tient
    // le contrat de la liste, mesure et non suppose :
    //   - controle positif (A/B) : la MEME spec contre la page d'AVANT la
    //     refonte donne **12 rouges / 11 verts**, et les 11 verts sont
    //     exactement les temoins de non-regression (h1, titres de section,
    //     erreurs console, 6 tuiles de chiffres et la valeur 96, 15 cartes
    //     vague 4 et leurs avatars, CTA, badge hero, les deux audits axe).
    //     Les 12 rouges sont les 12 assertions neuves.
    //   - stabilite : **115 passed** en `--repeat-each=5 --retries=0`, 3,4 min,
    //     charge machine 4,17, serveur de dev isole sur un port a nous.
    //
    // Ce qu'elle retient et que rien d'autre ne retenait : les 4 phases sont
    // des `<details>` NATIFS avec « short term » seul ouvert, une phase FERMEE
    // garde ses 16 items titre + description complets (rien n'est coupe par le
    // repli), le `<summary>` fait >= 44 px et repond a Entree, la grille de
    // chiffres ne laisse aucune tuile orpheline, les deux liens d'ancrage du
    // hero amenent leur cible SOUS l'app bar fixe, et la vague 4 nomme
    // `OrigamAudio` — jamais `OrigamSound`, qui n'a jamais ete un export.
    'roadmap.spec.ts',

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
    'marketing-primary-nav.spec.ts',

    // #1032 — la palette ⌘K couvre les 8 familles et se filtre par famille ;
    // le rail de navigation n'existe plus.
    //
    // Ce qu'elle retient : aucune famille demandee avant la premiere ouverture
    // (interception reseau), les 8 demandees a l'ouverture, une interface / une
    // util / une const / un enum trouves, le filtre restreint reellement les
    // resultats (puce ET Tab / Maj+Tab, la palette pieges Tab), le plafond de
    // 50 lignes, axe propre, zero trace du rail et aucun defilement horizontal
    // a 390 px. Controle positif : 13 des 17 cas sont ROUGES contre le parent
    // (develop avec le rail), les 4 verts etant les temoins de non-regression
    // du defilement horizontal.
    'marketing-command-palette.spec.ts',

    // #1092 — le HTML servi est deja style : le fond et le rayon du bouton
    // primaire sont les memes JS coupe (rien d'autre que le serveur ne peut
    // peindre) et apres hydratation, les ids rendus par le serveur sont ceux de
    // la page hydratee, et le <style> du serveur est reutilise, pas double.
    // Mesure d'admission : 5/5 en `--repeat-each=5 --retries=0` contre un build
    // de production ET contre le serveur de dev (ports isoles).
    'marketing-ssr-first-paint.spec.ts',

    // #1032 — navigation des fiches de detail (encart, prev/next, menu de famille).
    // Mesure d'admission : voir la PR.
    'marketing-catalog-detail-nav.spec.ts',

    // #1169 — les tables de reference (RowList) gardent type, defaut et
    // `required` quand une page personnalise la copie ou le libelle.
    // Mesure d'admission : A/B contre le parent = 3 rouges / 2 verts (les 2
    // verts sont les temoins : copie des props et table des args de
    // directive, intactes avant le correctif) ; stabilite 25 passed en
    // `--repeat-each=5 --retries=0` ; vert aussi sur une base `db:migrate`
    // + `docs:seed` SEULS, la provision exacte du job CI.
    'marketing-reference-row-list.spec.ts'
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
