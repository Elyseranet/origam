#!/usr/bin/env node
/*
 * Guard 29 — theme-channel-confiscation : un composant qui redeclare, sur une
 * regle TOUJOURS ACTIVE, un token que les feuilles declarent deja rend ce
 * canal INATTEIGNABLE pour tout `IOrigamTheme` de marque.
 *
 * BACKGROUND (#607, #569) — le mecanisme complet est en tete de
 * `lib/theme-channel-confiscation.mjs`. Forme courte : une custom property est
 * substituee sur l'element QUI LA DECLARE, et l'heritage depuis
 * `[data-theme="brand-x"]` perd contre n'importe quelle declaration directe.
 *
 * ⛔ POURQUOI UN GARDE, ET POURQUOI IL VAUT PLUS QUE LES CORRECTIFS. C'est le
 * defaut le plus silencieux de la campagne : TOUS les indicateurs disent que
 * ca marche. Le nom existe dans la feuille, le composant le lit,
 * `token-var-channels` est vert DANS LES DEUX SENS, le type-check passe,
 * aucun test ne rougit. Seul un vrai navigateur, avec un thème de marque
 * charge avant le document, voit que le reglage ne bouge rien. 43 composants
 * ne s'y sont pas mis par hasard : sans garde le motif revient.
 *
 * Mesure en navigateur (Chromium, Histoire statique, meme story, meme thème,
 * A/B contre le commit parent) sur `--origam-btn---density`, que
 * `.origam-btn--density-default` — classe posee sur CHAQUE bouton du
 * catalogue — epinglait a `0px` :
 *
 *   avant  token = 0px    hauteur calculee 28px
 *   apres  token = 24px   hauteur calculee 52px
 *
 * ⛔ CE QUE LE GARDE NE SIGNALE PAS, VOLONTAIREMENT. Une redeclaration portee
 * par un modificateur que le consommateur doit demander (`&--density-compact`,
 * `&--rounded-large`) est la logique PROPS-FIRST du DS, pas un defaut — le
 * CLAUDE.md l'autorise nommement. Et une redeclaration toujours active dont la
 * valeur DIFFERE de la feuille est bien un canal mort, mais la retirer change
 * le rendu : c'est un arbitrage a porter a l'utilisateur, pas une correction a
 * passer en force. Le garde tient la frontiere exactement la.
 *
 * ⛔ PORTEE — statique. Le garde DEDUIT qu'une classe est toujours emise en
 * lisant `withDefaults`; il ne sait pas ce qu'un `createOrigam()` injecte a
 * l'execution, ni ce que `useStyle()` produit. Masque n'est pas corrige, et le
 * verdict de rendu ne s'obtient que dans un vrai navigateur.
 *
 * Run: `node packages/ds/scripts/guards/theme-channel-confiscation.mjs`
 *      `node packages/ds/scripts/guards/theme-channel-confiscation.mjs --update-baseline`
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { report, writeBaseline } from './lib/baseline.mjs'
import { analyseSources } from './lib/theme-channel-confiscation.mjs'
import { runFixtures } from './lib/theme-channel-confiscation.selftest.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/* __dirname = packages/ds/scripts/guards -> DS_ROOT = packages/ds */
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const BASELINE_PATH = path.join(__dirname, 'baseline/theme-channel-confiscation.json')

const COMPONENTS_DIR = path.join(DS_ROOT, 'src/components')
const ENUMS_DIR = path.join(DS_ROOT, 'src/enums')

/*
 * `primitive` d'abord, `light` par dessus : c'est l'ordre de resolution d'une
 * page par defaut, donc celui contre lequel « meme valeur » doit se juger.
 * `dark.css` n'entre pas dans la table — une valeur identique en clair et
 * differente en sombre reste un doublon a retirer, et l'inclure ferait
 * dependre le verdict de l'ordre de lecture des deux feuilles.
 */
const SHEET_FILES = [
    path.join(DS_ROOT, 'src/assets/css/tokens/primitive.css'),
    path.join(DS_ROOT, 'src/assets/css/tokens/light.css')
]

function walk (dir, exts, out = []) {
    let entries
    try {
        entries = readdirSync(dir)
    } catch {
        return out
    }
    for (const e of entries) {
        const full = path.join(dir, e)
        if (statSync(full).isDirectory()) walk(full, exts, out)
        else if (exts.has(path.extname(full))) out.push(full)
    }
    return out
}

const read = (full) => ({ path: path.relative(REPO_ROOT, full), source: readFileSync(full, 'utf8') })

/*
 * ⛔ AUTO-TEST D'ABORD. Un detecteur devenu aveugle rend « 0 nouvelle »
 * exactement comme un catalogue sain, ET fait passer les entrees de baseline
 * pour perimees — ce qui invite a les effacer et a perdre le chantier. La
 * moitie NEGATIVE des temoins est la plus exposee ici : le motif fautif et la
 * regle legitime ne different que par deux discriminants.
 */
function run () {
    const self = runFixtures({ silent: true })
    if (self.failures) {
        console.log('─'.repeat(70))
        console.log('Guard: theme-channel-confiscation — AUTO-TEST EN ECHEC, balayage non effectue')
        console.log('─'.repeat(70))
        console.log(`⛔ ${ self.failures }/${ self.total } temoin(s) du detecteur echouent.`)
        console.log('   Son verdict sur le catalogue ne vaut rien tant qu\'ils ne repassent pas.')
        console.log('   Detail : node packages/ds/scripts/guards/lib/theme-channel-confiscation.selftest.mjs')
        console.log('─'.repeat(70))
        process.exit(1)
    }

    const components = walk(COMPONENTS_DIR, new Set(['.vue'])).map(read)
    const enums = walk(ENUMS_DIR, new Set(['.ts'])).map(read)
    const sheets = SHEET_FILES.map(read)

    /*
     * ⛔ UN BALAYAGE VIDE N'EST PAS UN CATALOGUE SAIN — c'est le faux negatif
     * le plus cher du genre, puisqu'il ressemble trait pour trait a un
     * resultat propre. Un `..` de trop dans la derivation de DS_ROOT a deja
     * produit un « PASS — 0 violation » sur ZERO fichier lu (cf. guard 26).
     */
    if (components.length === 0 || sheets.some(s => !s.source.includes('--origam-'))) {
        console.log('─'.repeat(70))
        console.log('Guard: theme-channel-confiscation — BALAYAGE VIDE, verdict sans valeur')
        console.log('─'.repeat(70))
        console.log(`⛔ ${ components.length } composant(s) lu(s), feuilles attendues :`)
        for (const f of SHEET_FILES) console.log(`   ${ f }`)
        console.log('─'.repeat(70))
        process.exit(1)
    }

    const violations = analyseSources({ sheets, components, enums })
    const currentIds = new Set(violations.map(v => v.id))

    const detailsById = new Map()
    for (const v of violations) {
        detailsById.set(v.id, v.kind === 'root-block'
            ? 'bloc `<style>:root{}` non scope — injecte APRES les feuilles, gagne sur\n'
                + '      tout bloc `[data-theme="brand-x"]` par l\'ordre source (#569)'
            : `${ v.token } repose la valeur de la feuille (${ v.resolved }) sur une regle\n`
                + `      toujours active — \`${ v.selector }\``)
    }

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, currentIds)
        console.log(`Baseline ecrite : ${ written.length } entree(s) -> ${ BASELINE_PATH }`)
        return 0
    }

    return report({
        guardName: 'theme-channel-confiscation (un bloc du composant rend un token inatteignable par un thème)',
        baselinePath: BASELINE_PATH,
        currentIds,
        detailsById,
        fixHint: 'Retirer la declaration : la feuille porte DEJA la meme valeur, donc le\n'
            + 'rendu par defaut ne bouge pas et le canal redevient atteignable.\n'
            + '⛔ Si la regle derive d\'un etat d\'instance (calc() sur une prop), elle a\n'
            + 'sa place dans le bloc scope — mais PAS sous le nom du token public :\n'
            + 'le correctif est alors un RENOMMAGE, pas une suppression.\n'
            + 'Pour un bloc `:root{}` : deplacer vers light.css / dark.css + les jumeaux\n'
            + 'SCSS + tokens.type.ts (CLAUDE.md, « Design tokens », etape 4).',
        coverageNote: `Couverture : ${ components.length } composant(s) .vue, `
            + `${ enums.length } enum(s), 2 feuilles de tokens (primitive + light). `
            + 'NON couvert : ce que createOrigam() injecte a l\'execution, la CSS '
            + 'produite par useStyle(), et les autres packages. Le garde DEDUIT '
            + 'qu\'une classe est toujours emise en lisant withDefaults — une classe '
            + 'posee par une autre voie lui echappe.'
    })
}

process.exit(run())
