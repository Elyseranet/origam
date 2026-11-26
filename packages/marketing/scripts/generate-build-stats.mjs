#!/usr/bin/env node
/**
 * generate-build-stats.mjs — mesure les chiffres du produit dans le dépôt et
 * écrit src/consts/build-stats.const.ts (#1545). Fichier NON commité (gitignore) :
 * les compteurs bougent à chaque PR, il est donc régénéré avant dev, build et
 * typecheck (scripts du package). Une mesure qui échoue fait échouer le build.
 *
 * Échec bruyant : une mesure à 0, non entière, ou deux sources qui divergent
 * font sortir le script en code 1. Aucune valeur de repli.
 *
 * USAGE  node scripts/generate-build-stats.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const OUT_REL = 'packages/marketing/src/consts/build-stats.const.ts'

const read = (root, rel) => fs.readFileSync(path.join(root, rel), 'utf8')

/** Fichiers dont le nom finit par `suffix`, récursivement. */
function countFiles (dir, suffix) {
    let n = 0
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) n += countFiles(p, suffix)
        else if (e.name.endsWith(suffix)) n++
    }
    return n
}

/** Texte entre le premier `open` suivant `marker` et le premier `close` qui suit. */
function block (src, marker, open, close, what) {
    const start = src.indexOf(marker)
    if (start < 0) throw new Error(`${what} : « ${marker} » introuvable`)
    const from = src.indexOf(open, start)
    const to = src.indexOf(close, from)
    if (from < 0 || to < 0) throw new Error(`${what} : bloc non délimité`)
    return src.slice(from + 1, to)
}

/** `now` est injectable pour que le test fige la date de mesure. */
export function measure (root = defaultRoot, now = new Date()) {
    const ds = 'packages/ds'
    // famille = dossier de premier niveau de components/
    const families = fs.readdirSync(path.join(root, ds, 'src/components'), { withFileTypes: true })
        .filter(e => e.isDirectory()).length
    const exported = (read(root, `${ds}/src/components/index.ts`).match(/^\s*export \*/gm) ?? []).length
    if (families !== exported) {
        throw new Error(`familles : ${families} dossiers mais ${exported} « export * » dans components/index.ts`)
    }

    // type de graphique = membre de l'enum CHART_TYPE
    const chartBody = block(read(root, `${ds}/src/enums/Chart/chart.enum.ts`), 'enum CHART_TYPE', '{', '}', 'CHART_TYPE')
    const chartTypes = (chartBody.match(/^\s*[A-Z_]+\s*=/gm) ?? []).length

    // story balayée = chaîne littérale du tableau SWEPT_STORIES (après le « = », pas le type `string[]`)
    const swept = read(root, 'packages/tests/a11y/components.spec.ts')
    const sweptStart = swept.indexOf('const SWEPT_STORIES')
    if (sweptStart < 0) throw new Error('SWEPT_STORIES introuvable')
    const sweptBody = block(swept.slice(sweptStart), '=', '[', ']', 'SWEPT_STORIES')
    const a11ySweptStories = (sweptBody.match(/'[^']+\.story\.vue'/g) ?? []).length

    // garde exécuté = entrée du tableau GUARDS de run-all.mjs
    const guardsBody = block(read(root, `${ds}/scripts/guards/run-all.mjs`), 'const GUARDS', '[', ']', 'GUARDS')
    const architectureGuards = (guardsBody.match(/'[^']+\.mjs'/g) ?? []).length

    const pkg = JSON.parse(read(root, `${ds}/package.json`))
    const stats = {
        componentFamilies: families,
        chartTypes,
        a11ySweptStories,
        unitTestFiles: countFiles(path.join(root, 'packages/tests/TU'), '.spec.ts'),
        e2eTestFiles: countFiles(path.join(root, 'packages/tests/e2e'), '.spec.ts'),
        composables: countFiles(path.join(root, ds, 'src/composables'), '.composable.ts'),
        directives: countFiles(path.join(root, ds, 'src/directives'), '.directive.ts'),
        architectureGuards,
        license: pkg.license,
        version: pkg.version,
        measuredOn: now.toISOString().slice(0, 10)
    }
    for (const [k, v] of Object.entries(stats)) {
        const ok = typeof v === 'number' ? Number.isInteger(v) && v > 0 : typeof v === 'string' && v.length > 0
        if (!ok) throw new Error(`mesure incohérente : ${k} = ${JSON.stringify(v)}`)
    }
    return stats
}

export function render (stats) {
    return `import type { IBuildStats } from '~/interfaces/build-stats.interface'

/**
 * BUILD_STATS — chiffres du produit mesurés dans le dépôt.
 *
 * GÉNÉRÉ par packages/marketing/scripts/generate-build-stats.mjs. NE PAS ÉDITER À LA MAIN.
 * Non commité : régénéré par les scripts dev / build / typecheck du package marketing.
 */
export const BUILD_STATS: IBuildStats = ${JSON.stringify(stats, null, 4)}
`
}

function main () {
    fs.writeFileSync(path.join(defaultRoot, OUT_REL), render(measure()))
    console.log(`écrit ${OUT_REL}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try { main() } catch (e) { console.error(`generate-build-stats : ${e.message}`); process.exit(1) }
}
