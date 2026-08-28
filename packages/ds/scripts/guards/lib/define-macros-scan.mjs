/*********************************************************
 * define-macros-scan — presence des macros defineProps /
 * defineEmits / defineSlots sur chaque composant .vue
 *
 * @description
 * ⛔ LIMITE D'INSTRUMENT CONNUE, ET C'EST LA RAISON D'ETRE
 * DE CE FICHIER. Un `grep 'defineSlots'` compte les
 * MENTIONS, pas les APPELS. OrigamContextualMenu porte un
 * commentaire de 12 lignes qui explique pourquoi il n'appelle
 * PAS `defineSlots<IContextualMenuSlots>()` — et le nom de la
 * macro y figure litteralement. Un grep naif le classe donc
 * "possede defineSlots" alors qu'il n'en a aucun.
 *
 * @description
 * Ce scanner retire donc les commentaires de bloc, les
 * commentaires de ligne et les chaines AVANT de chercher.
 * Il ne fait PAS de passes de reecriture successives : une
 * seule passe, sur une copie en memoire, jamais sur le
 * fichier. (Des reecritures enchainees avaient deja mange
 * des centaines de lignes sur ce depot.)
 *
 * @description
 * Sortie TSV sur stdout : nom, props, emits, slots, ou chaque
 * colonne vaut `typed` (macro appelee avec generique),
 * `untyped` (appelee sans generique) ou `absent`.
 ********************************************************/

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const COMPONENTS_DIR = join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../src/components'
)

const MACROS = ['defineProps', 'defineEmits', 'defineSlots']

/**
 * Retire commentaires de bloc, commentaires de ligne et
 * chaines. Une seule passe, sur une copie.
 */
const stripNonCode = (source) => source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/(['"`])(?:\\.|(?!\1)[^\\])*\1/g, "''")

const walk = (dir) => readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
})

const files = walk(COMPONENTS_DIR)
    .filter((f) => basename(f).startsWith('Origam') && f.endsWith('.vue'))
    .sort()

const rows = files.map((file) => {
    const code = stripNonCode(readFileSync(file, 'utf8'))
    const verdicts = MACROS.map((macro) => {
        if (new RegExp(`\\b${macro}\\s*<`).test(code)) return 'typed'
        if (new RegExp(`\\b${macro}\\s*\\(`).test(code)) return 'untyped'
        return 'absent'
    })
    return [basename(file, '.vue'), ...verdicts]
})

console.log(['composant', ...MACROS].join('\t'))
rows.forEach((row) => console.log(row.join('\t')))

const tally = (index) => rows.reduce((acc, row) => {
    acc[row[index]] = (acc[row[index]] ?? 0) + 1
    return acc
}, {})

console.error(`\n=== ${rows.length} composants ===`)
MACROS.forEach((macro, i) => {
    console.error(`${macro.padEnd(13)} ${JSON.stringify(tally(i + 1))}`)
})
