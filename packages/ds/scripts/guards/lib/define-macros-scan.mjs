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
 *
 * @description
 * ⛔ TROISIEME PORTE — un type mappe en base d'emits casse SANS
 * QUE NI LE TYPE-CHECK NI LE LINT NE LE VOIENT. Mesure faite sur
 * dix formes candidates : `defineEmits<T>()` ou `T` etend un type
 * mappe (`Record<never, never>`, `Record<string, …>`, `object`, …)
 * laisse passer `vue-tsc --noEmit` ET `eslint`, puis casse a la
 * COMPILATION DU SFC — `defineEmits` extrait les noms d'evenements
 * du type et `@vue/compiler-sfc` leve :
 *
 *     Failed to resolve extends base type
 *
 * Seules deux formes passent les trois portes : une INTERFACE de
 * base, ou un alias vers un TYPE LITTERAL. Le cote `defineSlots`
 * est purement type et accepte tout — l'asymetrie est apparente,
 * pas reelle.
 *
 * @description
 * Ce que ce mode raconte au-dela de son cas : nos deux barrieres
 * habituelles (type-check, lint) ne couvrent pas la compilation
 * des SFC. Un vert sur les deux ne prouve pas que le composant
 * se compile.
 ********************************************************/

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const COMPONENTS_DIR = join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../src/components'
)

const MACROS = ['defineProps', 'defineEmits', 'defineSlots']

/*********************************************************
 * stripNonCode — retire commentaires ET chaines
 *
 * @description
 * ⛔ UNE SEULE ALTERNATION, PAS QUATRE PASSES SUCCESSIVES.
 * La version a quatre passes de ce fichier a produit un FAUX
 * « absent » sur OrigamSvgIcon, et le mecanisme merite d'etre
 * retenu : le template porte
 * `xmlns="http://www.w3.org/2000/svg"`. La passe « commentaire
 * de ligne » y voyait un `//` et mangeait la fin de la ligne,
 * **guillemet fermant compris**. La passe « chaines » heritait
 * donc d'un guillemet orphelin, l'appariait avec un guillemet
 * bien plus bas, et emportait au passage la ligne 64 —
 * justement celle qui portait `defineProps<…>`.
 *
 * @description
 * Une alternation unique regle ca par construction : ce qui
 * s'ouvre en premier gagne. Un `//` a l'interieur d'une chaine
 * est consomme AVEC la chaine, jamais comme un commentaire.
 *
 * @description
 * La lecon generale, elle, depasse ce fichier : des passes de
 * nettoyage enchainees se transmettent leurs degats, et chacune
 * est correcte isolement. C'est le meme motif qui avait deja
 * mange des centaines de lignes sur ce depot.
 ********************************************************/
const STRING_OR_COMMENT =
    /(['"`])(?:\\.|(?!\1)[^\\])*\1|\/\*[\s\S]*?\*\/|\/\/[^\n]*|<!--[\s\S]*?-->/g

const stripNonCode = (source) => source.replace(STRING_OR_COMMENT, ' ')

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
