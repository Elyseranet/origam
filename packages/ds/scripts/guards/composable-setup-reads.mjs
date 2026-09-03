#!/usr/bin/env node
/*********************************************************
 * Guard 17 — composable-setup-reads (#504)
 *
 * @description
 * Un composable ne doit pas lire son parametre `props` de facon EAGER
 * (en dehors d'un `computed`/`watch`/`watchEffect`/gestionnaire) a la
 * profondeur de fonction 0 de son propre corps. `setup-reads.mjs`
 * detecte deja cette forme — le resolveur ADR-005 patche
 * `instance.props` depuis `beforeCreate`, que Vue execute APRES
 * `setup()`, donc une lecture eager pendant `setup()` fige une valeur
 * d'avant le theme, sans erreur ni avertissement — mais seulement dans
 * les `.vue` : `components.mjs`/`getRealComponents()` filtre sur
 * l'extension `.vue` ET le prefixe `Origam`, si bien qu'aucun fichier
 * de `src/composables/` n'a jamais ete un candidat.
 *
 * @description
 * POURQUOI CA COMPTE PLUS ICI QUE DANS UN COMPOSANT. Un composable est
 * partage : `useLink` figeait `tag` dans une chaine et `useVModel`
 * amorcait sa ref au setup, ce qui a casse les props thematisees de 16
 * composants a elles deux (CLAUDE.md). Une seule ligne eager dans
 * `src/composables/` coute donc plus qu'une ligne dans un `.vue` isole.
 *
 * @description
 * ⛔ CE GARDE REUTILISE LE DETECTEUR EXISTANT, IL N'EN CREE PAS UN
 * SECOND. `analyseComposables()` (dans `lib/setup-reads.mjs`) a ete
 * mesure contre le catalogue reel : sur 65 fonctions exportees prenant
 * un parametre nomme litteralement `props`/`properties`, il produit
 * EXACTEMENT le meme ensemble de lectures eager qu'un second detecteur
 * bati en parallele (correspondance par nom OU par type se terminant en
 * `Props`, destructuration dans la signature) — 0 ecart sur le code
 * reel a ce jour. La seule difference mesuree va dans l'AUTRE sens :
 * `analyseComposables()` ne filtre PAS par prefixe `use*`/`provide*`, et
 * capte de ce fait 4 fonctions `create*` (`createGroupBy`,
 * `createHeaders`, `createPagination`, `createSort` — DataTable) qu'un
 * filtre par prefixe manquerait structurellement. Un futur composable
 * nomme autrement qu'en `props`/`properties` litteral, ou destructurant
 * son parametre dans la signature, echapperait a la detection — mais
 * aucun cas de ce genre n'existe dans le catalogue a ce jour (verifie,
 * pas suppose).
 *
 * Run: `node packages/ds/scripts/guards/composable-setup-reads.mjs`
 *      `node packages/ds/scripts/guards/composable-setup-reads.mjs --update-baseline`
 ********************************************************/

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { report, writeBaseline } from './lib/baseline.mjs'
import { analyseComposables } from './lib/setup-reads.mjs'
import { DS_ROOT } from './lib/components.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASELINE_PATH = path.join(__dirname, 'baseline/composable-setup-reads.json')

/*********************************************************
 * Les deux entrees baselinees ne sont pas de la dette anonyme (#504)
 *
 * @description
 * `useLink.to` — `const link = props.to ? RouterLink.useLink(props) :
 * undefined`. MESURE, pas suppose : appeler `RouterLink.useLink(props)`
 * inconditionnellement (le correctif tente) ne resout PAS le cas du
 * theme — `RouterLink.useLink()` lit lui-meme son `route` interne de
 * facon synchrone pendant son propre appel (bloc devtools,
 * `isBrowser && (dev || prod devtools)`, vrai sous jsdom/Vitest ET en
 * navigateur en dev), donc AVANT que `beforeCreate` installe
 * l'accesseur ADR-005 — la valeur reste figee sur `router.resolve
 * (undefined)`, jamais sur la cible du theme. Second effet mesure,
 * independant : ce meme appel emet deux `console.warn` de vue-router a
 * CHAQUE montage d'un composant qui n'agit pas comme un lien — la
 * grande majorite des usages de Btn/Card/Chip/ListItem/BreadcrumbItem.
 * Les deux mesures sont pinnees dans
 * `packages/tests/TU/composables/Commons/link-to-theme-race.spec.ts`.
 * Rejete, pas neglige.
 *
 * @description
 * `useNested.opened` — `const opened = ref(new Set(props.opened))`.
 * #486 (ticket distinct) a ajoute un `watch(() => props.opened, …)`
 * JUSTE APRES cette ligne pour suivre un changement EXTERNE survenant
 * apres le montage, mais n'avait pas differe l'amorce initiale elle-meme
 * — celle-ci reste structurellement eager, donc reste dans cette
 * baseline (meme situation que `useVirtual.estimateLast`, jamais retire
 * non plus : la premiere valeur DOIT etre calculee de facon synchrone,
 * seule une correction ulterieure est possible).
 *
 * @description
 * ⛔ #530 (lot B) A MESURE LE CAS LAISSE OUVERT ICI ET CORRIGE : sous un
 * theme configurant `opened` (jamais passe par le consommateur),
 * `root.opened` restait vide au montage — reproduit dans
 * `nested-opened-theme-race.spec.ts` AVANT correctif. Le correctif ajoute
 * un `onMounted()` qui re-applique le meme seed (`new Set(props.opened)`)
 * une fois que `beforeCreate` a eu la possibilite d'ecrire — mecanisme
 * identique a `useVirtual.estimateLast`, garde par un flag
 * `openedTouchedBeforeMount` pour ne pas ecraser un `open()`/
 * `openOnSelect()` legitime survenu avant le montage du parent. Verifie,
 * cas du theme compris, dans `nested-opened-theme-race.spec.ts`. La ligne
 * reste baselinee ici parce que le DETECTEUR AST voit toujours la meme
 * lecture eager brute a la ligne d'origine — c'est la correction en aval
 * (`onMounted`), pas la disparition de la lecture, qui referme le defaut.
 *
 * @description
 * Deux autres candidats de la meme famille (`props.x` passe en 3e
 * argument de `useVModel`, un self-reference sans effet puisque
 * `useVModel` amorce deja avec
 * `props[prop] !== undefined ? props[prop] : defaultValue`) ont ete
 * REPARES plutot que baselines : `provideExpanded.expanded`,
 * `provideSelection.modelValue` (deja sur `develop`) et
 * `useNested.selected` (aligne ici sur les deux premiers). Prouve,
 * cas du theme compris, dans
 * `packages/tests/TU/composables/Commons/vmodel-default-value.spec.ts`.
 ********************************************************/

const rows = analyseComposables().filter((r) => r.param && r.eager.length)

const currentIds = new Set()
const detailsById = new Map()

for (const row of rows) {
    for (const e of row.eager) {
        const id = `${row.relative}:${row.fn}:${e.prop}`
        currentIds.add(id)
        detailsById.set(id, `${row.relative}:${e.line} — ${e.text}`)
    }
}

if (process.argv.includes('--update-baseline')) {
    const written = writeBaseline(BASELINE_PATH, currentIds)
    console.log(`Wrote ${written.length} entries to ${BASELINE_PATH}`)
    process.exit(0)
}

process.exit(report({
    guardName: 'composable-setup-reads (un composable ne doit pas lire son parametre props pendant le setup)',
    baselinePath: BASELINE_PATH,
    currentIds,
    detailsById,
    fixHint:
        'Une NOUVELLE entree signifie qu un composable lit `props.x` a profondeur 0 de son corps.\n'
        + 'Il est appele depuis setup(), donc cette lecture precede le resolveur ADR-005 et fige\n'
        + 'une valeur d avant le theme — sans erreur ni avertissement.\n'
        + '  1. Differer la lecture : `computed(() => props.x)`, `watch(() => props.x, …)`,\n'
        + '     `toRef(props, \'x\')`, ou la deplacer dans le gestionnaire qui en a besoin.\n'
        + '  2. Si la valeur sert d amorce a une ref, la re-appliquer dans `onMounted()`\n'
        + '     (voir `useVirtual.estimateLast`) plutot que de la figer au setup.\n'
        + '  3. Si un argument passe la prop a un autre composable, verifier qu il sert :\n'
        + '     `useVModel(props, \'x\', props.x, …)` est un no-op, `props.x` n est lu par\n'
        + '     `useVModel` QUE quand il vaut deja `undefined`.\n'
        + '  4. AVANT de "corriger" en appelant un composable tiers sans condition,\n'
        + '     mesurer si CE composable tiers lit lui-meme sa dependance de facon eager\n'
        + '     (cf. `useLink.to`, baseline pour cette raison precise) — sinon le correctif\n'
        + '     peut ne rien resoudre et ajouter du bruit console en prime.\n'
        + 'Verifier au montage, sous un theme qui configure la prop — c est le seul cas qui\n'
        + 'peut refuter : `vmodel-default-value.spec.ts` en donne le patron.'
}))
