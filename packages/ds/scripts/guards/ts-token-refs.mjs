#!/usr/bin/env node
/**
 * Guard — toute reference `var(--origam-…)` ASSEMBLEE EN TYPESCRIPT doit
 * nommer un token qu'une feuille declare, ou porter un repli.
 *
 * ⛔ L'ANGLE MORT QUE CE GARDE FERME (#823)
 * ------------------------------------------
 * `token-var-channels` (garde 13) lit les blocs `<style>` des SFC ; il
 * n'evalue aucun TypeScript. `unitless-zero-in-calc` (garde 27) le dit
 * lui-meme dans sa sortie : « NON balaye : […] toute CSS produite a
 * l'execution par `useStyle()` ». Une reference concatenee a l'execution
 * n'apparait dans AUCUNE feuille — et personne ne la regardait :
 *
 *     function shadowVar (rung: string): string {
 *         return `var(${SHADOW_TOKEN_PREFIX}${rung})`   // <- #813
 *     }
 *
 * Meme le NOM du token est absent du texte : il vient d'un import. Aucun
 * `grep var(--origam-` ne trouve cette ligne. `useElevation` emettait ainsi
 * `var(--origam-shadow---2xl)` pour un token qu'aucune feuille ne declare,
 * pendant que les 27 gardes restaient verts.
 *
 * ⛔ POURQUOI C'EST GRAVE — LA REFERENCE IRRESOLVABLE EFFACE
 * -----------------------------------------------------------
 * | echec au PARSE (sans `var()`) | declaration ecartee, la regle
 * |                               | precedente s'applique
 * | echec au COMPUTED-VALUE TIME  | la declaration a DEJA gagne la cascade :
 * | (avec `var()`)                | elle devient `unset` et ECRASE
 *
 * Mesure Chromium reportee dans #823, sur trois canaux :
 *
 *     box-shadow        regle seule rgba(0,0,0,.9) 0 1px 2px -> none
 *     background-color  regle seule rgb(200,200,200)         -> rgba(0,0,0,0)
 *     color             regle seule rgb(20,20,20)            -> rgb(0,0,0)
 *
 * La prop ne « ne fait rien » pas : elle DETRUIT ce qui marchait.
 *
 * DEUX DIRECTIONS, DEUX BASELINES
 * --------------------------------
 * 1. CANAL MORT (`ts-token-refs.json`) — le nom est calculable et aucune
 *    feuille ne le declare. Sous-classe imprimee dans le detail :
 *    « sans repli » = rendu casse, « avec repli » = rend correctement
 *    aujourd'hui mais le canal thematique est mort. Meme classification que
 *    `token-var-channels`, meme espace d'identifiants, pour que la baseline
 *    ne puisse que retrecir.
 * 2. NOM NON CALCULABLE (`ts-token-refs-unresolvable.json`) — le nom depend
 *    d'une valeur qu'aucune analyse statique ne borne. On ne peut rien dire
 *    du nom ; on peut exiger un REPLI, qui transforme mecaniquement un
 *    effacement en valeur par defaut. C'est ce que `useRounded` fait depuis
 *    toujours (`var(--origam-radius---md, 8px)`) — et la raison pour
 *    laquelle le canal `rounded` n'a jamais eu ce defaut. Ce point seul
 *    aurait rendu #813 impossible.
 *
 * ⛔ L'AUTO-TEST TOURNE AVANT LE BALAYAGE, ET UN BALAYAGE VIDE EST BLOQUANT
 * --------------------------------------------------------------------------
 * Meme disposition que `class-fallthrough` (#620) et `id-forwarding` (#633).
 * Un detecteur devenu aveugle annonce « 0 violation » avec exactement le
 * meme aplomb qu'un catalogue sain. Deux verrous :
 *   • les fixtures du detecteur passent AVANT le balayage, sinon rien n'est
 *     balaye et le garde sort en erreur ;
 *   • si le balayage lit zero fichier, ou ne trouve zero reference `var()`,
 *     le garde ECHOUE. Un garde a deja ete livre dans ce depot dont la
 *     premiere version annoncait `PASS` apres avoir lu zero fichier.
 *
 * Run: `node packages/ds/scripts/guards/ts-token-refs.mjs`
 *      `node packages/ds/scripts/guards/ts-token-refs.mjs --why`
 *      `node packages/ds/scripts/guards/ts-token-refs.mjs --update-baseline`
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { createInterpreter } from './lib/ts-token-refs.mjs'
import { runFixtures } from './lib/ts-token-refs.selftest.mjs'
import { findVarDeclarations } from './lib/css-var-scan.mjs'
import { report, writeBaseline } from './lib/baseline.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const SRC_DIR = path.join(DS_ROOT, 'src')
const TOKENS_CSS_DIR = path.join(SRC_DIR, 'assets/css/tokens')

const DEAD_BASELINE_PATH = path.join(__dirname, 'baseline/ts-token-refs.json')
const OPAQUE_BASELINE_PATH = path.join(__dirname, 'baseline/ts-token-refs-unresolvable.json')

function walkFiles (dir, predicate, out = []) {
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry)
        if (statSync(full).isDirectory()) walkFiles(full, predicate, out)
        else if (predicate(full)) out.push(full)
    }
    return out
}

/*********************************************************
 * readSource — un `.vue` est du script, pour ce garde
 *
 * @description
 * Le `<script setup>` d'un SFC est du TypeScript comme un autre : c'est la
 * qu'`OrigamDataTableHeaderCell` construit son `top: calc(var(…) * y)`.
 * Ne lire que les `.ts` autonomes aurait reproduit le demi-correctif de
 * #552, qui avait laisse les blocs `<script>` invisibles.
 ********************************************************/
function readSource (abs) {
    if (!existsSync(abs) || !statSync(abs).isFile()) return null
    const raw = readFileSync(abs, 'utf8')
    if (!abs.endsWith('.vue')) return raw

    return [ ...raw.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g) ].map((m) => m[1]).join('\n')
}

function resolveSpecifier (from, specifier) {
    if (!specifier.startsWith('.')) return null
    const base = path.resolve(path.dirname(from), specifier)
    for (const candidate of [ base, `${base}.ts`, `${base}.mts`, path.join(base, 'index.ts') ]) {
        if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
    }
    return null
}

function run () {
    /*
     * ⛔ AUTO-TEST D'ABORD — cf. l'en-tete. Les fixtures sont sur le chemin
     * bloquant, pas decoratives.
     */
    const self = runFixtures({ silent: true })
    if (self.failures) {
        console.log('─'.repeat(70))
        console.log('Guard: ts-token-refs — AUTO-TEST EN ECHEC, balayage non effectue')
        console.log('─'.repeat(70))
        console.log(`⛔ ${self.failures}/${self.total} fixture(s) du detecteur echouent.`)
        console.log('   Son verdict sur le catalogue ne vaut rien tant que ces temoins')
        console.log('   ne repassent pas.')
        console.log('   Detail : node packages/ds/scripts/guards/lib/ts-token-refs.selftest.mjs')
        console.log('─'.repeat(70))
        return 1
    }

    // ---- ce que les feuilles declarent ----
    const emitted = new Set()
    for (const file of readdirSync(TOKENS_CSS_DIR).filter((f) => f.endsWith('.css'))) {
        for (const decl of findVarDeclarations(readFileSync(path.join(TOKENS_CSS_DIR, file), 'utf8'))) {
            emitted.add(decl.name)
        }
    }

    // ---- ce que le TypeScript emet ----
    const files = walkFiles(SRC_DIR, (f) => (
        ((f.endsWith('.ts') || f.endsWith('.mts')) && !f.endsWith('.d.ts') && !f.endsWith('.spec.ts')
            && !f.includes(`${path.sep}assets${path.sep}`)
            && !f.endsWith(path.join('types', 'tokens.type.ts')))
        || (f.endsWith('.vue') && !f.endsWith('.story.vue'))
    ))

    const interpreter = createInterpreter({ readSource, resolveSpecifier })

    const deadChannels = new Map()
    const opaqueRefs = new Map()
    let scannedFiles = 0
    let totalRefs = 0

    for (const file of files) {
        const rel = path.relative(REPO_ROOT, file)
        let refs
        try {
            refs = interpreter.analyseFile(file)
        } catch (err) {
            console.error(`⛔ ts-token-refs — analyse impossible de ${rel} : ${err.message}`)
            return 1
        }
        scannedFiles++
        totalRefs += refs.length

        for (const ref of refs) {
            if (ref.resolved) {
                if (emitted.has(ref.name)) continue
                const label = ref.hasFallback
                    ? 'avec repli — rendu correct aujourd\'hui via le repli, mais canal thème mort (jamais alimenté par une feuille)'
                    : 'SANS REPLI — la déclaration gagne la cascade puis devient `unset` au computed-value time : elle EFFACE'
                deadChannels.set(`${rel}::${ref.name}`, `${rel} assemble \`${ref.name}\` en TypeScript, jamais déclaré par une feuille (${label}). Gabarit : ${ref.snippet}`)
                continue
            }
            if (ref.hasFallback) continue
            opaqueRefs.set(`${rel}::${ref.snippet}`, `${rel}:${ref.line} émet un \`var()\` dont le nom n'est pas calculable statiquement ET sans repli : rien ne garantit que le token existe, et s'il n'existe pas la déclaration EFFACE. Gabarit : ${ref.snippet}`)
        }
    }

    /*
     * ⛔ UN BALAYAGE VIDE EST BLOQUANT. Sans ce verrou, un chemin casse, un
     * filtre trop strict ou un `readSource` qui rend `null` produisent un
     * `PASS` parfaitement credible sur zero fichier lu.
     */
    if (!scannedFiles || !totalRefs) {
        console.log('─'.repeat(70))
        console.log('Guard: ts-token-refs — BALAYAGE VIDE')
        console.log('─'.repeat(70))
        console.log(`⛔ ${scannedFiles} fichier(s) lu(s), ${totalRefs} référence(s) var() trouvée(s).`)
        console.log('   Un « 0 violation » sur un balayage vide est indiscernable d\'un')
        console.log('   catalogue sain. Vérifier la racine auditée et les filtres.')
        console.log(`   Racine : ${SRC_DIR}`)
        console.log('─'.repeat(70))
        return 1
    }

    if (process.argv.includes('--update-baseline')) {
        writeBaseline(DEAD_BASELINE_PATH, new Set(deadChannels.keys()))
        writeBaseline(OPAQUE_BASELINE_PATH, new Set(opaqueRefs.keys()))
        console.log(`Baseline written: ${deadChannels.size} canal/canaux mort(s), ${opaqueRefs.size} référence(s) non calculable(s) sans repli.`)
        return 0
    }

    const deadExit = report({
        guardName: 'ts-token-refs (canal mort) — un `var(--origam-…)` assemblé en TypeScript doit nommer un token déclaré par une feuille',
        baselinePath: DEAD_BASELINE_PATH,
        currentIds: new Set(deadChannels.keys()),
        detailsById: deadChannels,
        fixHint: 'Soit déclarer le token dans la feuille qui convient (packages/ds/src/assets/css/tokens/light.css / dark.css / primitive.css — source tenue à la main, et son jumeau _*.scss dans le même commit), soit donner un repli réel au `var()` comme `useRounded` le fait (`var(--origam-radius---md, 8px)`). ⛔ Un repli `none` ne corrige rien : la déclaration devient valide mais calcule `none`, visuellement identique au défaut (#813).'
    })

    const opaqueExit = report({
        guardName: 'ts-token-refs (nom non calculable) — un `var()` émis depuis du TypeScript dont le nom n\'est pas borné doit porter un repli',
        baselinePath: OPAQUE_BASELINE_PATH,
        currentIds: new Set(opaqueRefs.keys()),
        detailsById: opaqueRefs,
        fixHint: 'Ajouter un repli au `var()` (second argument), ou fermer le jeu de valeurs (type union de littéraux, `ReadonlySet` littéral, garde `X.includes(v)` / `X.has(v)`) pour que le nom redevienne calculable. Un repli est la réponse mécanique : il borne le dégât sans rien savoir des feuilles.'
    })

    if (process.argv.includes('--why')) {
        let bare = 0
        let withFallback = 0
        for (const detail of deadChannels.values()) {
            if (detail.includes('SANS REPLI')) bare++
            else withFallback++
        }
        console.log('\n--why')
        console.log(`  fichiers balayés                          : ${scannedFiles}`)
        console.log(`  références var() assemblées en TS         : ${totalRefs}`)
        console.log(`  canaux morts sans repli (rendu effacé)    : ${bare}`)
        console.log(`  canaux morts avec repli (rendu OK, mort)  : ${withFallback}`)
        console.log(`  noms non calculables sans repli           : ${opaqueRefs.size}`)
    }

    return deadExit || opaqueExit ? 1 : 0
}

const exitCode = run()
process.exit(exitCode)
