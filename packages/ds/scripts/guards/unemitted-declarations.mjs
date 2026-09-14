/*
 * Guard: unemitted-declarations — tout emit DÉCLARÉ dans `IXxxEmits` (chaîne
 * d'`extends` comprise) doit être réellement ÉMIS quelque part.
 *
 * POURQUOI CE GARDE EXISTE
 * ------------------------
 * `emits-completeness.mjs` répond « tout ce qui est ATTEIGNABLE est-il
 * DÉCLARÉ ? ». Ce garde-ci répond l'AUTRE sens : « tout ce qui est DÉCLARÉ
 * est-il réellement ÉMIS ? ». Les deux existaient déjà comme QUESTIONS
 * distinctes dans ce dépôt — `emits-completeness.mjs` bloquait déjà la
 * première depuis longtemps ; la seconde n'était mesurée que par
 * `analysis/inspection-harness.mjs` (critère C5), un harnais qui NE BLOQUE
 * RIEN par construction (voir son header : « ne fait JAMAIS process.exit(1),
 * n'a PAS de baseline »). Ce fichier est la version BLOQUANTE de C5.
 *
 * Ce n'est pas cosmétique. Vue retire INCONDITIONNELLEMENT du `$attrs` tout
 * listener correspondant à un emit déclaré (dès que le composant a une
 * option `emits` — `emitsOptions !== null`). Déclarer un emit qu'on
 * n'émet jamais CASSE le chemin de fallthrough qui fonctionnait avant :
 * `@update:active` posé par un consommateur est retiré des attributs,
 * jamais ré-émis par le composant, et ne part donc jamais — sans erreur, ni
 * avertissement.
 *
 * Six tickets fermés sur SIX composants différents pour exactement ce
 * défaut :
 *   #373, #430  OrigamMenu           — `contextmenu` (déclaré, documenté,
 *                                       démontré par une story, jamais émis)
 *   #376        4 composants         — `update:hover`
 *   #416        —                    — `click:outside` (le ticket qui a
 *                                       établi la règle pour ce dépôt)
 *   #446        OrigamOverlay        — `afterEnter`, `keydown`
 *   —           OrigamCheckboxBtn    — `update:focused` (retiré ; le
 *                                       composant n'a aucune gestion de
 *                                       focus)
 * Six fermetures pour un même motif = un défaut SYSTÉMIQUE, qui revient
 * précisément parce qu'aucun garde ne le retenait jusqu'ici.
 *
 * CE QUI EST DÉTECTÉ — délégué entièrement à `lib/dead-emits.mjs`
 * ------------------------------------------------------------------
 * Ce fichier ne réimplémente AUCUNE logique de détection. `analyseDeadEmits`
 * (partagé avec `analysis/inspection-harness.mjs`, critère C5) résout
 * `IXxxEmits` et TOUTE sa chaîne d'`extends` — c'est la difficulté réelle de
 * ce garde : un balayage qui ne lirait que l'interface NOMMÉE dans
 * `defineEmits<…>()` raterait la quasi-totalité des cas, exactement comme le
 * cas `IBottomNavEmits extends ICommonsComponentEmits, IActiveEmits,
 * IHoverEmits` qui a motivé ce garde (`update:hover` et `update:active`
 * déclarés deux niveaux plus haut que l'interface nommée, jamais émis).
 * Côté « émis », `analyseDeadEmits` compte : les `emit('x', …)` littéraux
 * (script ET template), les relais `update:*` partagés avec
 * `emits-completeness.mjs` (`useVModel`/`useActive`/`useFocus`/
 * `useValidation`/`useForm`), et sept relais supplémentaires propres à cette
 * analyse (`useAdjacent`, `useAdjacentInner`, `useGroupItem`, `useGroup`,
 * `useNested`, `useOptions`, `usePaginatedItems`) — voir le header de
 * `lib/dead-emits.mjs` pour le détail et les limites assumées.
 *
 * ⛔ FAUX POSITIFS = GARDE MORT. Un appel `emit(uneVariable, …)` (premier
 * argument dynamique, pas littéral) PEUT couvrir n'importe quel événement
 * déclaré — on ne devine pas lequel. `analyseDeadEmits` fait basculer tout
 * événement non prouvé de `neverEmitted` vers `indeterminate` dans ce cas,
 * et ce garde ne signale QUE `neverEmitted` : un événement `indeterminate`
 * n'est jamais un défaut FAUX, seulement un défaut qu'on ne peut pas
 * prouver statiquement — donc on ne le signale pas. `Pagination` (relais
 * `useNested`) est le seul cas indéterminé mesuré au moment de l'écriture ;
 * il n'apparaît PAS dans la baseline.
 *
 * ⚠️ NE PAS « faire émettre au hasard » pour faire taire ce garde. Émettre
 * un événement qui ne correspond à rien de réel dans le composant (un
 * `emit('foo')` mort de code, jamais câblé à une vraie condition) fait
 * disparaître la ligne sans corriger le défaut sous-jacent — souvent
 * l'absence réelle de la fonctionnalité que l'emit prétend porter
 * (`OrigamMenu` n'avait tout simplement PAS de menu contextuel avant #373).
 * Le vrai correctif dépend du cas : implémenter le comportement manquant,
 * ou retirer l'emit de l'interface si le composant ne le portera jamais.
 *
 * Run: `node packages/ds/scripts/guards/unemitted-declarations.mjs`
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRealComponents } from './lib/components.mjs'
import { report, writeBaseline } from './lib/baseline.mjs'
import { buildInterfaceIndex } from './lib/emits.mjs'
import { analyseDeadEmits } from './lib/dead-emits.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const BASELINE_PATH = path.join(__dirname, 'baseline/unemitted-declarations.json')

function run () {
    const index = buildInterfaceIndex()
    const violations = new Map()

    for (const { pascalName, file } of getRealComponents()) {
        const raw = readFileSync(file, 'utf8')
        const { neverEmitted } = analyseDeadEmits(raw, index)

        // Un ID par (composant, événement) — PAS un ID par composant qui
        // rassemble tous ses événements morts (`join(',')`) : quand un
        // composant a PLUSIEURS événements morts et qu'un seul se corrige,
        // l'ID joint change ENTIER, donc l'ancien devient stale ET un
        // nouvel ID apparaît pour ce qui reste — un garde vert bruite alors
        // un fix partiel en (1 stale + 1 new) au lieu du diff réel (0 stale,
        // 0 new pour l'événement corrigé). Constaté en pratique sur
        // OrigamBottomNav en ajoutant le relais `useStateFlag` : `hover`
        // s'est corrigé, `active` restait mort, et l'ID joint a fait
        // disparaître ET réapparaître la ligne au lieu de ne rien bouger
        // côté `hover`.
        for (const event of neverEmitted) {
            const id = `${pascalName}:${event}`
            violations.set(
                id,
                `Origam${pascalName} (${path.relative(REPO_ROOT, file)}) déclare \`${event}\` sans jamais l'émettre — Vue retire son handler de $attrs, le consommateur ne recevra jamais l'événement`
            )
        }
    }

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, violations.keys())
        console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
        process.exit(0)
    }

    const exitCode = report({
        guardName: 'unemitted-declarations (tout emit déclaré doit être émis)',
        baselinePath: BASELINE_PATH,
        currentIds: violations.keys(),
        detailsById: violations,
        fixHint: 'Soit implémenter le comportement manquant (câbler un relais existant, ou émettre littéralement au bon endroit), soit retirer l\'événement de l\'interface d\'emits si le composant ne le portera jamais. NE PAS ajouter un emit(...) mort juste pour faire taire ce garde — ce n\'est pas le défaut qu\'il signale.'
    })
    process.exit(exitCode)
}

run()
