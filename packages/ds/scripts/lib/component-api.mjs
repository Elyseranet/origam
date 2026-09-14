/*********************************************************
 * component-api.mjs — quelles interfaces un SFC passe-t-il a ses macros ?
 *
 * @description
 * Extrait de `analysis/c7-story-doc-sync.mjs`, ou ces quinze lignes vivaient
 * en copie unique. Un SECOND consommateur est arrive — le pipeline de
 * synchronisation du site marketing, qui doit lire la meme API vivante pour
 * alimenter son catalogue. Plutot qu'une seconde copie qui derivera, les deux
 * lisent desormais ce fichier.
 *
 * @description
 * ⛔ CE MODULE NE RESOUT RIEN. Il rend les NOMS d'interface passes a
 * `defineProps` / `defineEmits` / `defineSlots`, pas leur surface. La
 * resolution est laissee a l'appelant, et les deux appelants n'en veulent pas
 * la meme chose :
 *
 *   - `c7-story-doc-sync.mjs` veut des NOMS de membres, et passe par
 *     `declaredPropsFor` (`audit-unconsumed-props.mjs`) pour lire exactement
 *     la meme surface que le garde bloquant `unconsumed-props` ;
 *   - le pipeline marketing veut des noms ET des TYPES, et passe par le
 *     compilateur TypeScript (`packages/marketing/scripts/lib/extract-vue.mjs`).
 *
 * Les deux resolutions ont ete confrontees sur les 218 composants du
 * catalogue : 217 verdicts identiques, un ecart — `IRatingFieldProps`
 * (cf. la note dans `extract-vue.mjs`).
 *
 * @description
 * `stripComments` est la variante de c7, et pas celle de `guards/lib/scss-scan.mjs` :
 * elle protege le `//` precede de `:` (une URL dans un commentaire de bloc,
 * un `https://` dans une chaine) que l'autre effacerait. Les deux ne sont pas
 * interchangeables ; c'est la raison pour laquelle c7 en portait une a elle.
 ********************************************************/

import { readFileSync } from 'node:fs'

/*********************************************************
 * stripComments
 *
 * @description
 * Une seule passe, sur une copie en memoire. Meme precaution que
 * `define-macros-scan.mjs` : un `grep` compte les MENTIONS, pas les appels,
 * et un commentaire qui cite `defineSlots` suffit a fausser le verdict.
 ********************************************************/
export function stripComments (src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

const MACRO = (name) => new RegExp(`define${name}\\s*<\\s*([A-Za-z0-9_]+)\\s*>`)

/*********************************************************
 * macroInterfaces
 *
 * @description
 * Rend `{ props, emits, slots }` — le nom de l'interface passee a chaque
 * macro, ou `null` quand la macro est absente. Prend le SOURCE d'un `.vue`
 * (deja lu), pour que l'appelant garde la main sur les I/O.
 ********************************************************/
export function macroInterfaces (source) {
    const clean = stripComments(source)

    return {
        props: MACRO('Props').exec(clean)?.[1] ?? null,
        emits: MACRO('Emits').exec(clean)?.[1] ?? null,
        slots: MACRO('Slots').exec(clean)?.[1] ?? null
    }
}

/** Meme chose, a partir d'un chemin de fichier. */
export function macroInterfacesOf (file) {
    return macroInterfaces(readFileSync(file, 'utf8'))
}
