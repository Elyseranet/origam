/**
 * Auto-test de `ts-token-refs.mjs` — le detecteur de references `var()`
 * assemblees en TypeScript (#823).
 *
 * Quatre choses sont pinnees, comme le veut la convention du depot
 * (`class-fallthrough.selftest.mjs`, `id-forwarding.selftest.mjs`) :
 *
 *   1. RAPPEL — chaque fixture `MUST_FLAG` emet bel et bien un nom de token
 *      qu'aucune feuille ne declare, ou une reference dont le nom n'est pas
 *      calculable ET sans repli.
 *   2. PRECISION — chaque fixture `MUST_NOT_FLAG` est une forme correcte.
 *      Les deux qui comptent le plus sont les TEMOINS DE CORRELATION : un
 *      detecteur compositionnel les rate, en fabriquant des combinaisons qui
 *      n'arrivent jamais a l'execution. Un garde qui accuse du code correct
 *      est desarme le lendemain.
 *   3. MUTATION — la forme PRE-CORRECTIF de #813 (`var(${PREFIX}${rung})`,
 *      nue) doit rougir. Un garde qui ne rattrape pas le defaut pour lequel
 *      il a ete ecrit ne rattrape rien.
 *   4. GRAPHE DE MODULES — un nom dont AUCUN morceau n'est ecrit dans le
 *      fichier (prefixe importe + echelon importe) doit quand meme etre
 *      reconstruit. C'est la difference entre ce detecteur et un `grep`.
 *
 * Run: node packages/ds/scripts/guards/lib/ts-token-refs.selftest.mjs
 */

import { fileURLToPath } from 'node:url'

import { createInterpreter, maskInterpolations, scanMaskedVarReferences, scanVarReferences } from './ts-token-refs.mjs'

/** Feuilles fictives : ce que « declare » veut dire dans ces fixtures. */
const DECLARED = new Set([
    '--origam-shadow---md',
    '--origam-shadow---xl',
    '--origam-radius---sm',
    '--origam-radius---md',
    '--origam-color__action--primary---bg',
    '--origam-color__action--secondary---bg'
])

/**
 * Monte un interprete sur un systeme de fichiers virtuel.
 * @param files  Record<'/a.ts', source>
 */
function interpreterFor (files) {
    return createInterpreter({
        readSource: (abs) => (abs in files ? files[abs] : null),
        resolveSpecifier: (from, spec) => {
            if (!spec.startsWith('.')) return null
            const base = '/' + spec.replace(/^\.\//, '').replace(/^\.\.\//, '')
            for (const candidate of [ base, `${base}.ts`, `${base}/index.ts` ]) {
                if (candidate in files) return candidate
            }
            return null
        }
    })
}

/** Verdict compact d'une fixture mono-fichier. */
function verdict (source, extra = {}) {
    const files = { '/main.ts': source, ...extra }
    const refs = interpreterFor(files).analyseFile('/main.ts')

    return {
        names: refs.filter((r) => r.resolved).map((r) => r.name),
        undeclared: refs.filter((r) => r.resolved && !DECLARED.has(r.name)).map((r) => r.name),
        // ⛔ La sous-classe qui EFFACE : nom absent des feuilles ET aucun repli.
        bareUndeclared: refs.filter((r) => r.resolved && !DECLARED.has(r.name) && !r.hasFallback).map((r) => r.name),
        openHoles: refs.filter((r) => !r.resolved && !r.hasFallback).length,
        holes: refs.filter((r) => !r.resolved).length
    }
}

// ─────────────────────────────────────────────────────────────────────────
// MUST FLAG
// ─────────────────────────────────────────────────────────────────────────
const MUST_FLAG = [
    [ 'nom litteral non declare', `export const x = 'var(--origam-shadow---3xl)'`, (v) => v.undeclared.length === 1 ],

    [ 'echelon interpole hors des feuilles', `
        const RUNGS = [ 'md', '2xl' ]
        export function f () {
            return RUNGS.map((rung) => \`var(--origam-shadow---\${rung})\`)
        }`, (v) => v.undeclared.includes('--origam-shadow---2xl') ],

    [ 'union de type ouverte sur un token absent', `
        type TRung = 'sm' | 'lg'
        export function radius (rung: TRung): string {
            return \`var(--origam-radius---\${rung})\`
        }`, (v) => v.undeclared.includes('--origam-radius---lg') ],

    [ 'gabarit de type sur enum — l\'idiome du depot', `
        enum INTENT { PRIMARY = 'primary', DANGER = 'danger' }
        type TIntent = \`\${INTENT}\`
        export function bg (intent: TIntent): string {
            return \`var(--origam-color__action--\${intent}---bg)\`
        }`, (v) => v.undeclared.includes('--origam-color__action--danger---bg') ],

    [ 'nom incalculable ET sans repli', `
        export function f (name: string): string {
            return \`var(--origam-\${name})\`
        }`, (v) => v.openHoles === 1 ],

    [ 'le `var(` lui-meme assemble, sans repli — la forme #813', `
        const PREFIX = '--origam-shadow---'
        export function f (rung: string): string {
            return \`var(\${PREFIX}\${rung})\`
        }`, (v) => v.openHoles === 1 ]
]

// ─────────────────────────────────────────────────────────────────────────
// MUST NOT FLAG
// ─────────────────────────────────────────────────────────────────────────
const MUST_NOT_FLAG = [
    [ 'nom litteral declare', `export const x = 'var(--origam-shadow---md)'`,
        (v) => v.undeclared.length === 0 && v.holes === 0 ],

    [ 'nom incalculable MAIS avec repli', `
        export function f (name: string): string {
            return \`var(--origam-\${name}, 8px)\`
        }`, (v) => v.openHoles === 0 ],

    [ 'seul le NOM DE PROPRIETE est interpole — le token, lui, est ecrit', `
        export function f (axis: string): string {
            return \`border-\${axis}-width: var(--origam-radius---md)\`
        }`, (v) => v.names.includes('--origam-radius---md') && v.holes === 0 ],

    [ 'garde `includes` : le jeu de valeurs est ferme par le SI, pas par le type', `
        const RUNGS = [ 'sm', 'md' ]
        export function f (value: unknown): string | null {
            if (typeof value === 'string' && RUNGS.includes(value)) return \`var(--origam-radius---\${value})\`
            return null
        }`, (v) => v.undeclared.length === 0 && v.holes === 0 ],

    /*
     * ⛔ TEMOIN DE CORRELATION n°1 — la table de repli.
     * Un detecteur compositionnel combine « rung ∈ {md, 3xl} » avec « la
     * branche vide du ternaire » et fabrique un `var(--origam-shadow---3xl)`
     * NU que ce code n'emet jamais : `3xl` a une entree dans la table, donc
     * la branche vide ne peut pas etre prise pour lui. C'est la forme exacte
     * du correctif de #813 — un faux rouge ici desarmerait le garde.
     */
    [ 'TEMOIN correlation : repli indexe par la meme cle que le nom', `
        const FALLBACK: Record<string, string> = { '3xl': '0 25px 50px rgba(0,0,0,.25)' }
        const RUNGS = [ 'md', '3xl' ]
        export function f () {
            return RUNGS.map((rung) => {
                const fallback = FALLBACK[rung]
                return \`var(--origam-shadow---\${rung}\${fallback ? \`, \${fallback}\` : ''})\`
            })
        }`, (v) => v.bareUndeclared.length === 0 && v.holes === 0
              && v.names.includes('--origam-shadow---md') && v.names.includes('--origam-shadow---3xl') ],

    /*
     * ⛔ TEMOIN DE CORRELATION n°2 — le retour anticipe.
     * Les intentions traitees par un `return` precedent n'atteignent JAMAIS
     * le gabarit final. Sans lecture des freres precedents, le detecteur
     * « trouve » un `--origam-color__action--danger---bg` que ce code
     * n'emet pas.
     */
    [ 'TEMOIN correlation : le retour anticipe rend la suite inatteignable', `
        enum INTENT { PRIMARY = 'primary', DANGER = 'danger' }
        type TIntent = \`\${INTENT}\`
        export function bg (intent: TIntent): string {
            if (intent === 'danger') return 'var(--origam-shadow---md)'
            return \`var(--origam-color__action--\${intent}---bg)\`
        }`, (v) => v.undeclared.length === 0 ]
]

// ─────────────────────────────────────────────────────────────────────────
// GRAPHE DE MODULES — rien du nom n'est ecrit dans le fichier analyse
// ─────────────────────────────────────────────────────────────────────────
const CROSS_MODULE = {
    '/tokens.ts': `export const SHADOW_TOKEN_PREFIX = '--origam-shadow---'\nexport const RUNGS: ReadonlySet<string> = new Set([ 'md', '4xl' ])`,
    '/barrel.ts': `export * from './tokens'`
}
const CROSS_MODULE_MAIN = `
    import { RUNGS, SHADOW_TOKEN_PREFIX } from './barrel'
    export function f () {
        const out: Array<string> = []
        for (const rung of RUNGS) out.push(\`var(\${SHADOW_TOKEN_PREFIX}\${rung})\`)
        return out
    }`

export function runFixtures ({ silent = false } = {}) {
    const log = silent ? () => {} : (m) => console.log(m)
    let failures = 0
    const fail = (msg) => {
        failures++
        console.log(`  FAIL  ${msg}`)
    }

    log('MUST FLAG :')
    for (const [ label, source, check ] of MUST_FLAG) {
        const v = verdict(source)
        if (!check(v)) fail(`${label} — attendu une violation, obtenu ${JSON.stringify(v)}`)
        else log(`  ok    ${label}`)
    }

    log('\nMUST NOT FLAG :')
    for (const [ label, source, check ] of MUST_NOT_FLAG) {
        const v = verdict(source)
        if (!check(v)) fail(`${label} — faussement signale : ${JSON.stringify(v)}`)
        else log(`  ok    ${label}`)
    }

    log('\nGRAPHE DE MODULES (prefixe ET echelon importes, via un barrel) :')
    {
        const v = verdict(CROSS_MODULE_MAIN, CROSS_MODULE)
        if (!v.names.includes('--origam-shadow---md')) fail('le nom reconstruit n\'a pas ete trouve')
        else if (!v.undeclared.includes('--origam-shadow---4xl')) fail('l\'echelon non declare n\'a pas ete signale')
        else log('  ok    nom reconstruit a travers deux modules et un barrel')
    }

    log('\nSCANNERS (parentheses imbriquees, marques) :')
    {
        const nested = scanVarReferences('var(--origam-a, color-mix(in srgb, var(--origam-b), black 20%))')
        if (nested.length !== 2) fail(`var() imbrique dans un repli : attendu 2 references, obtenu ${nested.length}`)
        else if (!nested[0].hasFallback || nested[1].hasFallback) fail('repli mal attribue entre la reference externe et l\'interne')
        else log('  ok    var() imbrique dans un repli')

        const masked = scanMaskedVarReferences(maskInterpolations('`var(${PREFIX}${rung})`'))
        if (masked.length !== 1 || masked[0].resolved) fail('un `var(` entierement assemble doit rester visible ET non resolu')
        else log('  ok    `var(${…})` reste visible malgre l\'absence de `--` litteral')

        const partial = scanMaskedVarReferences(maskInterpolations('`x-${a}: var(--origam-radius---md)`'))
        if (partial.length !== 1 || !partial[0].resolved) fail('un nom litteral doit rester resolu malgre une interpolation voisine')
        else log('  ok    interpolation voisine sans effet sur un nom litteral')
    }

    const total = MUST_FLAG.length + MUST_NOT_FLAG.length + 1 + 3
    return { failures, total }
}

/* CLI — ignoree lorsque le module est importe par le garde */
const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (invokedDirectly) {
    const { failures, total } = runFixtures()
    console.log('')
    if (failures) {
        console.log(`FAIL — ${failures}/${total} cas d'auto-test en echec.`)
        process.exit(1)
    }
    console.log(`PASS — ${total} cas : rappel, precision, les deux temoins de correlation, la forme pre-#813, et le graphe de modules.`)
}
