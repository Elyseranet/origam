import { defineConfig, devices } from '@playwright/test'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MARKETING_SPEC_PATTERNS } from './e2e/_support/marketing-specs.const'
import { scratchDirPatterns } from './scratch-dirs.const'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..', '..')

/**
 * Specs already migrated to the unified-story format and verified green.
 * CI runs ONLY these (set `E2E_GREEN_ONLY=1`) so the e2e job stays green while
 * the remaining specs are repaired wave by wave — add each spec here as it
 * goes green. A local run with no env var still executes the whole suite.
 */
const GREEN_SPECS = [
    'btn.spec.ts',
    'chip.spec.ts',
    // #957 — verifiee verte et stable avant inscription : 6/6 puis 30/30 sous
    // `--repeat-each=5`, E2E_STATIC=1, chromium, port isole.
    'chip-affix-gutter.spec.ts',
    // #924 — promu plutot que baseline : 18 tests, verts, et rouge sans le
    // correctif (1 echec cible, pas un rouge en bloc). Il tourne SANS serveur
    // ni port (fichiers `file://`, attributs ecrits avant le parse), donc il
    // echappe aux trois pieges de mesure de ce depot : le port :6006 partage
    // entre ~150 worktrees, l'iframe `__sandbox` qui ne recalcule pas, et jsdom
    // qui ne resout pas `var()`. Cout en CI proche de zero.
    'theme-focus-ring-contrast.spec.ts',
    // #950 — promu plutot que baseline : 34 tests, verts et stables, et rouges
    // a HEAD~1 (A/B fait). Le critere de `spec-coverage` est « cette spec
    // est-elle verte aujourd'hui ? » — une spec verte et NON gardee est un
    // filet perdu, pas une dette a enregistrer.
    'utility-cascade-padding-margin-950.spec.ts',
    'card.spec.ts',
    'avatar.spec.ts',
    'alert.spec.ts',
    'badge.spec.ts',
    'checkbox.spec.ts',
    'switch.spec.ts',
    'tooltip.spec.ts',
    // wave 2
    'divider.spec.ts',
    'kbd.spec.ts',
    'title.spec.ts',
    'breadcrumb.spec.ts',
    'text-field.spec.ts',
    'radio.spec.ts',
    'slider-field.spec.ts',
    'tabs.spec.ts',
    'label.spec.ts',
    // wave 3
    'select.spec.ts',
    'number-field.spec.ts',
    'password-field.spec.ts',
    'rating-field.spec.ts',
    'otp-input-field.spec.ts',
    'textarea-field.spec.ts',
    'list.spec.ts',
    'menu.spec.ts',
    'expansion-panel.spec.ts',
    // wave 4
    'dialog.spec.ts',
    'drawer.spec.ts',
    'snackbar.spec.ts',
    'stepper.spec.ts',
    'timeline.spec.ts',
    'treeview.spec.ts',
    'clipboard.spec.ts',
    'code.spec.ts',
    'empty-state.spec.ts',
    // wave 5
    'blockquote.spec.ts',
    'skeleton.spec.ts',
    'qr-code.spec.ts',
    'watermark.spec.ts',
    'masonry.spec.ts',
    'grid.spec.ts',
    'progress.spec.ts',
    'carousel.spec.ts',
    'counter.spec.ts',
    // wave 6 — specs réconciliées (drift variant-title résolu, commit 8bbe9ca4).
    // Flakiness cold-start mitigée en CI (workers=1, retries=1) ; durcissement +
    // ajout des specs -debug et des 12 specs complexes suivis dans le ticket DS #9.
    'app.spec.ts',
    'toolbar.spec.ts',
    'pagination.spec.ts',
    'parallax.spec.ts',
    'table.spec.ts',
    'timeline-debug.spec.ts',
    'color-picker.spec.ts',
    'color-picker-field.spec.ts',
    // #859 — direct-typing wiring, verified stable (--repeat-each=5, 30/30)
    'color-picker-field-typing.spec.ts',
    'date-picker-field-typing.spec.ts',
    'theme-provider.spec.ts',
    'textarea-richtext.spec.ts',
    'defaults-provider.spec.ts',
    'field-height.spec.ts',
    // wave 7 — contrôles de story pour les 16 props directionnelles câblées
    // en 249ac7d1. Vérifiée verte sur chromium + firefox + webkit.
    'directional-story-controls.spec.ts',
    // wave 8 — #614. Sans cette entree, la spec ne tourne PAS en CI
    // (`E2E_GREEN_ONLY=1`) et le defaut clavier qu'elle epingle repasserait
    // sans bruit, exactement comme il avait survecu a 35/35 verts sur
    // `tabs.spec.ts`. Verifiee 6/6 sur chromium, `E2E_STATIC=1`.
    'inline-edit-keyboard-actions.spec.ts',
    // wave 9 — #814, et la meme raison qu'en wave 8 : sans ces entrees les
    // specs ne tournent PAS en CI (`E2E_GREEN_ONLY=1`), donc le filet de
    // regression ne retient rien.
    //
    // ⛔ `rating-field-a11y.spec.ts` (#810) etait dans ce cas depuis son
    // ajout : verte en local, jamais executee par la CI. Elle est ajoutee ici
    // avec celle de #814 — les deux epinglent le meme patron de nommage de
    // groupe, et la porte a11y ne les couvre ni l'une ni l'autre
    // (`RatingField`, `CheckboxGroup` et `RadioGroup` sont tous les trois dans
    // `UNSWEPT_STORIES`, soit 36 stories balayees sur 218).
    //
    // Verifiees dans ce lot, `E2E_STATIC=1`, chromium, port isole :
    // `checkbox-radio-group-a11y` 8/8, `rating-field-a11y` 4/4.
    'checkbox-radio-group-a11y.spec.ts',
    'rating-field-a11y.spec.ts',
    // wave 10 — #813. Meme raison qu'aux vagues 8 et 9 : hors de cette liste,
    // `E2E_GREEN_ONLY=1` (ci.yml) exclut la spec et la CI ne l'execute jamais.
    // Celle-ci ne depend PAS de Histoire — aucune variante de story n'atteint
    // les echelons `2xl`/`3xl` (`ELEVATION_OPTIONS` est numerique et s'arrete a
    // `XL (24)`), ce qui est une des raisons pour lesquelles le defaut a
    // survecu. Verifiee 2/2, chromium, port isole.
    'elevation-rungs.spec.ts',
    // wave 10 — #824. Trouvee par le recensement du garde `spec-coverage` :
    // hors liste blanche, donc jamais executee, donc ROUGE depuis deux jours
    // sans que rien ne le dise. `#730` / PR #791 (`fd9c5cbca`) a corrige le
    // libelle de l'echelon `thick` (3px -> 2px, la valeur reellement rendue) ;
    // cette spec cliquait l'ancien libelle et ses 4 tests tombaient en
    // `locator.click: Test timeout of 60000ms exceeded`. Libelle recale, la
    // spec repasse 4/4 en 4,5 s (contre 4 minutes de timeouts).
    //
    // ⛔ C'est le second cas apres `rating-field-a11y` (#810) : un filet de
    // regression mergé, jamais lance, et qui avait CESSE de retenir quoi que
    // ce soit. Vérifiée 20/20, `--repeat-each=5`, `E2E_STATIC=1`, chromium,
    // port isole.
    'field-border-notch.spec.ts',
    // wave 11 — #812. Same reason as waves 8, 9 and 10, and the same component:
    // `rating-field-a11y.spec.ts` (#810) spent its whole life green in local
    // runs and never once executed in CI, because it was missing from this
    // list. The keyboard defect it documented as out of scope is the one this
    // spec pins; leaving the spec out would let it come back in silence.
    //
    // ⛔ Was authored as "wave 10" and collided with #813's entry on rebase.
    // Both stay: dropping either would make that one invisible to CI, which is
    // exactly the defect #824 describes.
    //
    // Verified in this lot, `E2E_STATIC=1`, chromium, isolated port:
    // `rating-field-keyboard` 18/18.
    'rating-field-keyboard.spec.ts',
    // wave 12 — #800. Meme raison qu'aux vagues 8 a 11 : hors de cette liste,
    // `E2E_GREEN_ONLY=1` (ci.yml) exclut la spec et la CI ne l'execute jamais.
    //
    // ⛔ Celle-ci retient un defaut particulierement silencieux : le rendu
    // VOULU (zero padding sur une cellule OTP) etait obtenu par une
    // declaration CSS JETEE — un `0` sans unite dans un `max()`. Un assert sur
    // la VALEUR du padding passerait des deux cotes du correctif ; la spec
    // interroge donc la VALIDITE de la declaration via un temoin injecte par
    // `addInitScript`. Verifiee 2/2 apres, 1/2 avant (A/B contre le parent),
    // `E2E_STATIC=1`, chromium, port isole.
    'field-corner-clearance.spec.ts',
    // wave 13 — #840. `var(--origam-table-header-height)` n'etait declare par
    // aucune feuille et sans repli ; la reference EFFACAIT `top` au lieu de
    // laisser la cascade continuer (`unset` -> `auto` -> le header sticky
    // defile avec le corps). A/B contre le composant pre-fix : 3/4 rouges
    // avant, 4/4 verts apres. Verifiee stable 20/20, `--repeat-each=5`,
    // `E2E_STATIC=1`, chromium, port isole.
    'data-table-sticky.spec.ts',
    // wave 14 — #827. Un parent CONTROLE qui refuse la valeur (v-bind="state"
    // sans `state.modelValue = $event`, la forme du playground "Default")
    // laissait le DOM de la radio avancer indefiniment : le navigateur coche
    // lui-meme la radio cliquee/naviguee, Vue ne re-patch `:checked` que si sa
    // valeur CALCULEE differe du rendu precedent, et un parent qui refuse
    // reproduit exactement la meme booleenne — donc jamais. Le radio siblant
    // que le navigateur decoche nativement (meme `name`) desynchronise aussi,
    // sans le moindre evenement pour le signaler. Fixe par `resyncRadios`
    // dans `OrigamRatingField.vue` : sur `nextTick` apres tout `click`/
    // `change` qui atteint le groupe, force `.checked` de CHAQUE radio a
    // correspondre au modele, que la valeur ait bouge ou non. A/B contre
    // `develop` @ `b13647589` (avant ce correctif) : les 3 tests "REFUSING
    // parent" rougissent, les 2 temoins "ACCEPTING parent" restent verts des
    // deux cotes. Verifiee stable 25/25, `--repeat-each=5`, `E2E_STATIC=1`,
    // chromium, port isole.
    'rating-field-controlled.spec.ts',
    // wave 14 — #871. Même raison qu'aux vagues 8 à 13 : hors de cette liste,
    // `E2E_GREEN_ONLY=1` (ci.yml) exclut la spec et la CI ne l'exécute jamais,
    // donc le filet ne retient rien. Celle-ci ne dépend PAS de Histoire — elle
    // écrit ses pages sur disque et les ouvre en `file://`, comme
    // `tokens-prefers-color-scheme.spec.ts`. A/B contre `origin/develop` @
    // `060c4356` (avant ce correctif) : 6 rouges / 2 verts, les 2 verts étant
    // exactement les deux CONTRÔLES NÉGATIFS, qui doivent passer des deux
    // côtés. Vérifiée 8/8, chromium, port isolé.
    'derived-tokens-subtree.spec.ts',
    // #869 — regression net contre `v-contrast` silencieusement inerte sur
    // fond opaque (les deux ruptures partagees toRgb()/channelsOf()).
    // Verifiee stable 25/25, `--repeat-each=5`, `E2E_STATIC=1`, chromium,
    // port isole. A/B contre le commit parent (avant le correctif) : 4/5
    // tests rougissent (seul le controle negatif noir-sur-blanc reste vert
    // des deux cotes, comme attendu).
    'contrast-directive.spec.ts',
    // #411 — `OrigamChartMap.borderColor` etait applique au `stroke` du
    // pays sans passer par `resolveColor()` : un theme nommant l'intent
    // (`components['origam-chart-map'].borderColor`) atteignait deja la
    // prop (ADR-005), mais la valeur atterrissait telle quelle dans
    // `stroke:`, ce qui est un mot-cle CSS invalide pour cette propriete —
    // le navigateur JETAIT la declaration et le contour disparaissait
    // (pas seulement « toujours gris »). A/B contre `develop` avant ce
    // correctif : le test « repaints under a themed intent » rougit
    // (le stroke reste fige sur l'ancien litteral), le test des valeurs
    // CSS explicites reste vert des deux cotes, comme attendu. Verifiee
    // stable 10/10, `--repeat-each=5`, `E2E_STATIC=1`, chromium, port isole.
    'chart-map-border-color-theme.spec.ts',
    // #411 (suite) — meme defaut, une ligne au-dessus dans le meme fichier :
    // `defaultCountryFill` allait dans `fill` sans `resolveColor()` non plus.
    // Repere par le project-manager APRES la PR initiale (le harnais et le
    // fichier etaient deja ouverts) plutot qu'ouvert en ticket separe. A/B
    // contre le commit d'avant ce second correctif : le test « repaints
    // under a themed intent » rougit (fill fige sur le litteral, le pays
    // sans donnee disparaitrait sous un theme nommant un intent), le test
    // CSS explicite reste vert des deux cotes. Le defaut PAR DEFAUT reste le
    // litteral `rgba(0,0,0,0.08)` — deliberement NON retype vers un intent,
    // aucun ne reproduit le scrim semi-transparent compositee sur le
    // `bgColor` du graphique (cf. JSDoc de l'interface). Verifiee stable
    // 10/10, `--repeat-each=5`, `E2E_STATIC=1`, chromium, port isole.
    'chart-map-default-country-fill-theme.spec.ts',
    // wave 15 — #933. Même raison qu'aux vagues 8 à 14, et la garde
    // `spec-coverage` l'a attrapé AVANT le merge cette fois : hors de cette
    // liste, `E2E_GREEN_ONLY=1` (ci.yml) exclut la spec et aucun job ne
    // l'exécute jamais.
    //
    // ⛔ Ce qu'elle épingle est invisible autrement : `.origam-btn` ne
    // déclarait AUCUN `display`, donc le root retombait sur le défaut UA du
    // tag rendu — `inline` pour le `<a>` que `useLink` produit dès qu'on
    // passe `href`. Une boîte inline ignore `height`, `min-width` et le
    // padding vertical : mesuré 984 × 15 px au lieu de 199 × 28 sur le CTA de
    // `/why-origam`. Le défaut est resté invisible parce que 178 des 181
    // instances du marketing ont un parent flex/grid, qui BLOCKIFIE l'enfant.
    //
    // ⛔ Sa première version était VERTE contre le commit parent, donc sans
    // valeur : elle visait le Variant Design, qui rend un `<button>`, dont le
    // défaut UA de Chromium est déjà `inline-block` — elle mesurait le
    // navigateur, pas la règle. Réécrite pour passer par `href`. A/B contre
    // `origin/develop` : le test « parent BLOCK » rougit (`inline`), le test
    // « parent FLEX » reste vert des deux côtés — c'est le témoin de
    // non-régression, il doit passer avant comme après.
    //
    // Vérifiée stable 10/10, `--repeat-each=5`, `E2E_STATIC=1`, chromium,
    // port isolé.
    'btn-display.spec.ts',
    // wave 15 — #934. Même raison. `.origam-list--nav` et
    // `.origam-list-item--nav` déclaraient `--origam-*---padding-inline`, un
    // nom que RIEN ne lit : les règles de base consomment les longhands
    // `-start` / `-end`, et une custom property n'est pas un raccourci. La
    // gouttière intérieure que `nav` promet n'a donc jamais existé — mesuré
    // `0px/0px` sous les 8 identités du marketing, d'où des lignes à ras bord
    // dont la pastille de survol était rognée par le rayon du menu.
    //
    // ⛔ La garde `token-var-channels` ne voit PAS ce cas : elle compare les
    // `var()` lus aux tokens déclarés dans les FEUILLES, et ces deux
    // déclarations vivent dans le SCSS d'un composant. Sans cette spec, rien
    // ne retient le défaut.
    //
    // Attentes en valeurs ABSOLUES (0px/8px pour la liste, 16px/8px pour la
    // ligne), jamais un simple écart entre deux valeurs. A/B contre
    // `origin/develop` : les deux tests rougissent (`0px` et `16px`).
    // Vérifiée stable 10/10, `--repeat-each=5`, `E2E_STATIC=1`, chromium,
    // port isolé.
    'list-nav-padding.spec.ts'
]

/**
 * Playwright configuration for origam.
 *
 * The unit tests stay in Vitest (`pnpm -F @origam/tests test:unit`); Playwright
 * owns the end-to-end + visual-regression layer.
 *
 * Histoire is started as a webServer so e2e specs can mount any component
 * by navigating to its story URL. This avoids spinning up a parallel
 * Vite dev server for each component under test.
 */
/**
 * Port the Histoire server is expected on. Read once here so the `webServer`
 * command, the `webServer.url` probe, `use.baseURL` and the manifest guard
 * all agree — the preview command used to hardcode `-p 6006` while every
 * other knob honoured the env var.
 */
const HISTOIRE_PORT = process.env.E2E_HISTOIRE_PORT ?? '6006'

export default defineConfig({
    testDir: './e2e',
    outputDir: './e2e/.results',

    // Aborts the whole run when the process answering HISTOIRE_PORT serves a
    // story catalogue that isn't this worktree's — the failure mode
    // `reuseExistingServer` opens up. Removing it centrally covers all 175
    // specs without touching a single `page.goto(variantUrl(…))` call site.
    // See e2e-global-setup.ts for the full rationale.
    globalSetup: './e2e-global-setup.ts',

    // CI gates on the migrated subset; locally the full suite still runs.
    testMatch: process.env.E2E_GREEN_ONLY === '1' ? GREEN_SPECS : undefined,

    // Marketing-only specs target the Nuxt dev server (:3000) via
    // playwright.marketing.config.ts and its own `MARKETING_BASE_URL`. They
    // live in the same `./e2e` directory, so a full local run of THIS config
    // (no `E2E_GREEN_ONLY`) would otherwise pick them up too and point them
    // at Histoire's baseURL, where their DOM never exists — every test in
    // the file then times out identically on chromium/firefox/webkit,
    // masquerading as a cross-engine product defect. See
    // e2e/_support/marketing-specs.const.ts for the full rationale.
    testIgnore: [...MARKETING_SPEC_PATTERNS, ...scratchDirPatterns('./e2e')],

    // One spec per file; specs inside a file run sequentially (consistent
    // visual-regression baselines), but separate files parallelise.
    fullyParallel: true,

    // Forbid `test.only` in CI so a focused spec doesn't silently mask the
    // rest of the suite.
    forbidOnly: !!process.env.CI,

    // Retry once in CI to absorb flakes from animations / network blips —
    // never retry locally so the dev sees the failure as it happened.
    retries: process.env.CI ? 1 : 0,

    // CI serves the prebuilt static Histoire (E2E_STATIC), so there is no
    // per-story Vite cold-compile contention — run parallel to fit the time
    // budget. Single worker only when CI hits the live dev server.
    workers: process.env.CI ? (process.env.E2E_STATIC === '1' ? '100%' : 1) : undefined,

    reporter: [
        ['html', { outputFolder: 'e2e/.report', open: 'never' }],
        ['list']
    ],

    use: {
        // Histoire serves under /stories/ (vite.base = '/stories/' in histoire.config.js).
        // Story URLs must include the full prefix: page.goto('/stories/story/STORY_ID...')
        // Note: Playwright resolves absolute paths (starting with /) against the baseURL
        // host only, NOT the full baseURL path. Keep baseURL at origin level.
        baseURL: `http://localhost:${HISTOIRE_PORT}`,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] }
        }
    ],

    webServer: {
        // E2E_STATIC=1 (CI): serve the PREBUILT static Histoire via
        // `histoire preview` (the job runs `build:stories` first). No per-story
        // Vite cold-compile → fast + deterministic, which is what lets the job
        // fit its timeout and run parallel workers. Same /stories/story/... URLs.
        // Default (local): the live `histoire dev` server, reused if running.
        command: process.env.E2E_STATIC === '1'
            ? `pnpm -F @origam/stories exec histoire preview -p ${HISTOIRE_PORT}`
            // No `--` separator: pnpm forwards it literally to the script
            // (`histoire dev "--" "--port" "6106"`), sade ignores the unknown
            // positional, and the server silently binds the default 6006
            // instead — verified.
            : `pnpm -F @origam/stories dev --port ${HISTOIRE_PORT}`,
        cwd: REPO_ROOT,
        url: `http://localhost:${HISTOIRE_PORT}/stories/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
})
