/**
 * C5 — un emit DÉCLARÉ dans `IXxxEmits` que le composant n'émet JAMAIS.
 *
 * C'EST L'INVERSE DU GARDE `emits-completeness.mjs`
 * ---------------------------------------------------------------------
 * Ce garde existant répond « tout ce qui est ATTEIGNABLE est-il DÉCLARÉ ? ».
 * Cette question-ci est l'autre sens : « tout ce qui est DÉCLARÉ est-il
 * réellement ÉMIS quelque part ? ». Les deux partagent la même mécanique de
 * résolution d'interface — `buildInterfaceIndex` / `resolveDeclared` /
 * `computeEmittable`, importés depuis `./emits.mjs` plutôt que réécrits
 * (règle du dépôt : chercher l'existant avant d'écrire).
 *
 * DEUX CONSOMMATEURS, D'OÙ L'EMPLACEMENT DANS `guards/lib/`
 * ---------------------------------------------------------------------
 * Ce fichier vivait sous `analysis/lib/dead-emits.mjs` (mesure seule, pas de
 * baseline) tant que rien ne bloquait dessus. Le garde CI
 * `guards/unemitted-declarations.mjs` en fait maintenant un SECOND
 * consommateur, au même titre qu'`analysis/inspection-harness.mjs` — même
 * raison que celle qui a fait déménager `emits.mjs` lui-même dans
 * `guards/lib/` en premier lieu (voir son propre header). Un fichier utilisé
 * par un garde CI et par un harnais de mesure vit dans `guards/lib/`, pas
 * dans `analysis/lib/`.
 *
 * CINQ FAÇONS DONT UN ÉVÉNEMENT DÉCLARÉ PEUT ÊTRE ÉMIS
 * ---------------------------------------------------------------------
 *   1. Littéralement, `emitVar('nom', …)` — dans le `<script setup>` OU
 *      dans le `<template>` (Vue autorise `@click="emit('foo')"` en
 *      expression inline ; `OrigamAudio.vue` l'utilise pour `play`/`pause`).
 *      D'où un scan sur le FICHIER ENTIER, pas seulement le bloc script.
 *      IMPOSSIBLE si `defineEmits<IXxxEmits>()` est un appel nu (pas de
 *      `const x = …`) — Avatar/AvatarGroup/Badge/Btn font exactement ça :
 *      aucune variable n'existe pour appeler l'émetteur à la main.
 *   2. Par un des QUATRE relais `update:*` d'`emits-completeness.mjs`
 *      (`useVModel`/`useActive`/`useFocus`/`useValidation`/`useForm` —
 *      `useActive` n'y matche plus RIEN dans ce dépôt aujourd'hui, voir la
 *      section `useStateFlag` plus bas, mais reste dans la liste PARTAGÉE
 *      avec `emits-completeness.mjs`, hors du périmètre de ce fichier) —
 *      `computeEmittable()`.
 *   3. Par un des relais SUPPLÉMENTAIRES ci-dessous (`EXTRA_RELAYS`),
 *      propres à cette analyse — voir la section dédiée.
 *   4. Par `useStateFlag(props, { state, source })` — relais-d'un-relais
 *      dynamique (l'événement dépend de `source`, pas d'un nom fixe),
 *      couvert séparément par `computeStateFlagEmitted()` — voir la section
 *      dédiée plus bas.
 *   5. Dynamiquement — `emitVar(someVariable, …)` où le premier argument
 *      n'est pas un littéral. Un tel appel PEUT couvrir n'importe quel
 *      événement déclaré ; on ne devine pas lequel. Un composant qui en
 *      contient au moins un fait basculer tout événement non prouvé de
 *      `neverEmitted` vers `indeterminate` — jamais l'inverse.
 *
 * POURQUOI `EXTRA_RELAYS` N'EST PAS FUSIONNÉ DANS `guards/lib/emits.mjs`
 * ---------------------------------------------------------------------
 * `guards/lib/emits.mjs` est aussi importé par le garde CI
 * `emits-completeness.mjs`, dont le contrat et le baseline sont scopés à
 * `update:*` par construction (son propre header le dit : « tout `update:*`
 * ATTEIGNABLE »). Un premier passage de repérage (`grep -rl '\.emit(' src/
 * composables/`) a trouvé SEPT fichiers émetteurs : `vModel` (déjà couvert
 * par `computeEmittable`) et SIX composables relais couverts ici, dont deux
 * hors `update:*` (`useAdjacent` → `click:append`/`click:prepend`,
 * `useGroupItem` → `group:selected`). Un SEPTIÈME relais, `useGroup`, a été
 * trouvé ENSUITE, à la lecture du premier jet de résultats : il n'appelle
 * jamais `.emit(` lui-même (invisible au grep), mais appelle EN INTERNE
 * `useVModel(props, 'modelValue', …)` — un relais d'un relais, une couche
 * plus bas que ce que `grep -rl '\.emit('` peut voir. Neuf composants en
 * dépendaient (BtnToggle, ChipGroup, ExpansionPanels, ItemGroup, SlideGroup,
 * TabPanels, Tabs, Window, BottomNav) ; sans cette entrée ils ressortaient
 * tous à tort en `update:modelValue` mort.
 * Aucun de ces relais ne rejoint la liste PARTAGÉE de `guards/lib/emits.mjs`
 * : ça changerait, en silence, le comportement d'un garde déjà shippé avec
 * son propre baseline — hors du périmètre d'un harnais de MESURE. Ils
 * vivent donc ici, séparément.
 *
 * CE QUE `useHover`/`useActive` PROUVAIENT (historique — composables
 * SUPPRIMÉS depuis, voir `useStateFlag` juste en dessous)
 * ---------------------------------------------------------------------
 * `useHover(props)` ne prenait JAMAIS d'`emit` et n'appelait jamais
 * `getCurrentInstance().emit` directement. Pourtant `IHoverEmits` déclare
 * `update:hover`, et `IHoverEmits` est étendu par `IAlertEmits`,
 * `IAvatarEmits`, `IAvatarGroupEmits`, `ICardEmits`, `IBottomNavEmits`, entre
 * autres — vérifié composant par composant, PAS un cas inventé. Note :
 * `IBadgeEmits` n'étend PAS `IHoverEmits` (seul `IBadgeProps` étend
 * `IHoverProps`) — Badge n'a donc PAS de `update:hover` mort par cette
 * chaîne, malgré ce qu'un premier repérage manuel avait supposé.
 *
 * `useHover(props)`/`useActive(props)` N'EXISTENT PLUS DANS LE DÉPÔT —
 * remplacés par `useStateFlag`, un angle mort trouvé par mutation
 * ---------------------------------------------------------------------
 * Signalé par un agent en LOT parallèle (composants Alert/Avatar/
 * AvatarGroup/BottomNav/Card/Sheet/Bracket*), confirmé ici par grep avant
 * tout correctif : `useActive(`/`useHover(` — **0** occurrence dans
 * `src/components/` ; `useStateFlag(` — **24**. La migration est TOTALE,
 * pas partielle (`stateFlag.composable.ts` : « useHover and useActive were
 * the same algorithm written twice… This is the merge »).
 *
 * `useStateFlag(props, { state, source = state })` est un relais-d'un-relais
 * de la MÊME famille que `useGroup` ci-dessus : il appelle EN INTERNE
 * `useVModel(props, source)` (jamais `.emit(` directement, donc invisible à
 * `grep -rl '\.emit('`), et son `set()`/`unset()`/`toggle()` retourné écrit
 * `vmodel.value = …` — dont l'événement réel est `update:${source}`, PAS
 * `update:${state}` quand `source` est explicite (`OrigamAlert`/
 * `OrigamBottomNav`/`OrigamBadge`/`OrigamChip` passent `source: 'modelValue'`
 * pour l'axe `active`). `computeStateFlagEmitted()` ci-dessous couvre ce
 * relais, séparément d'`EXTRA_RELAYS` car sa cible dépend du contenu de
 * l'appel (state/source), pas d'un nom fixe.
 *
 * Vérifié composant par composant sur `OrigamAvatar` avant d'écrire le
 * détecteur (pas une supposition) : `useStateFlag(props, {state: 'hover'})`
 * déstructure `unset: handleMouseleave, set: handleMouseenter`, tous deux
 * câblés dans le template (`@mouseenter="handleMouseenter"`,
 * `@mouseleave="handleMouseleave"`) ; `useStateFlag(props, {state: 'active'})`
 * déstructure `toggle: handleClick`, câblé (`@click="handleClick()"`). Les
 * deux émissions sont donc RÉELLES au runtime — avant ce correctif, le garde
 * les classait `neverEmitted` à tort. Contre-exemple RÉEL, pas un blind
 * spot : `OrigamBottomNav` appelle `useStateFlag(props, {state: 'active',
 * source: 'modelValue'})` sans déstructurer NI `set` NI `unset` NI `toggle`
 * — cette instance-là n'écrit jamais rien, `update:modelValue` (ou
 * `update:active`, selon l'interface) reste un mort AUTHENTIQUE pour cet
 * axe précis.
 *
 * LIMITES ASSUMÉES
 * ---------------------------------------------------------------------
 *   - `useNested`, `useOptions`, `usePaginatedItems` (List, DataTable — 1
 *     composant chacun) émettent depuis des MÉTHODES d'un objet retourné
 *     (`nested.root.open()`, etc.), potentiellement appelées par un ENFANT
 *     via inject plutôt que dans le même fichier. Traités ici comme
 *     "atteignable dès l'appel du composable" — le même principe que
 *     useFocus/useValidation/useForm dans `emits.mjs` (`reachable: () =>
 *     true`), pas une invention propre à ce fichier. Si un jour l'un de ces
 *     événements sort en `neverEmitted`, vérifier À LA MAIN avant de
 *     conclure — la reachability inter-fichiers n'est PAS prouvée par ce
 *     script.
 *   - Un `emit` transmis à un composable NON listé ici (ni dans `RELAYS`)
 *     reste invisible. Les deux listes sont fermées, à jour au moment de
 *     l'écriture (repérage exhaustif par `grep -rl '\.emit(' src/composables/`
 *     — 7 fichiers, tous couverts).
 *   - `context.emit` (API par options, non `<script setup>`) n'est pas
 *     recherché : le DS n'a aucun composant écrit hors `<script setup>`
 *     (vérifié par `getRealComponents()` — tous les fichiers analysés le
 *     sont).
 */

import { stripComments } from './scss-scan.mjs'
import { computeEmittable, resolveDeclared } from './emits.mjs'

function escapeRegExp (s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Compte les occurrences ENTIÈRES (`\b…\b`) d'un identifiant dans le texte. */
function countOccurrences (src, identifier) {
    const re = new RegExp(`\\b${escapeRegExp(identifier)}\\b`, 'g')
    return (src.match(re) || []).length
}

/**
 * Un handler retourné par un composable relais (ex. `onClickPrepend`) n'est
 * atteignable que si le composant le CÂBLE quelque part (un `@click="…"`,
 * un appel direct). La destructuration seule ne suffit pas : c'est
 * exactement le filtre qu'`emits-completeness.mjs` applique à `onActive`
 * (voir son commentaire ATTEIGNABILITÉ) — même principe, appliqué ici au nom
 * réel LOCAL après une éventuelle destructuration renommée
 * (`onClickPrepend: handleClickPrepend`).
 */
function isHandlerWired (src, exportedName) {
    const renamed = src.match(new RegExp(`\\b${escapeRegExp(exportedName)}\\s*:\\s*([A-Za-z0-9_$]+)`))
    const boundBare = new RegExp(`[{,]\\s*${escapeRegExp(exportedName)}\\s*[,}]`).test(src)
    if (!renamed && !boundBare) return false // le composant ne destructure même pas ce handler
    const localName = renamed ? renamed[1] : exportedName
    // > 1 : une occurrence est la destructuration elle-même, il en faut au
    // moins une seconde (le câblage réel : @click="…", appel direct, etc.).
    return countOccurrences(src, localName) > 1
}

/**
 * Relais additionnels — repérés par `grep -rl '\.emit(' src/composables/`
 * puis vérifiés un par un (voir header). Chaque entrée déclare SES
 * événements et SA condition d'atteignabilité.
 */
const EXTRA_RELAYS = [
    {
        composable: 'useAdjacent',
        callPattern: /\buseAdjacent\(\s*props\b/,
        events: [
            { name: 'click:prepend', handler: 'onClickPrepend' },
            { name: 'click:append', handler: 'onClickAppend' }
        ]
    },
    {
        composable: 'useAdjacentInner',
        callPattern: /\buseAdjacentInner\(\s*props\b/,
        events: [
            { name: 'click:prependInner', handler: 'onClickPrependInner' },
            { name: 'click:appendInner', handler: 'onClickAppendInner' },
            { name: 'click:clear', handler: 'clickClear' }
        ]
    },
    {
        // Émis depuis un `watch()` interne, sans handler à câbler — voir
        // `groupItem.composable.ts`. Atteignable dès l'appel.
        composable: 'useGroupItem',
        callPattern: /\buseGroupItem\(\s*props\b/,
        events: [{ name: 'group:selected', handler: null }]
    },
    {
        // `useGroup` appelle `useVModel(props, 'modelValue', …)` EN INTERNE
        // (`group.composable.ts`) et écrit `selected.value =` sans
        // condition dans `select()` — vérifié par lecture directe du
        // fichier. Neuf composants du catalogue (BtnToggle, ChipGroup,
        // ExpansionPanels, ItemGroup, SlideGroup, TabPanels, Tabs, Window,
        // BottomNav) appellent `useGroup(props, KEY)` sans jamais écrire
        // `useVModel(props, 'modelValue')` eux-mêmes : sans cette entrée,
        // les neuf ressortaient à tort en `update:modelValue` mort — la
        // même classe de piège que `useVModel`/`useActive`, une couche plus
        // bas.
        composable: 'useGroup',
        callPattern: /\buseGroup\(\s*props\b/,
        events: [{ name: 'update:modelValue', handler: null }]
    },
    {
        // Limite assumée — voir header : reachability inter-fichiers non
        // prouvée, traité comme useFocus/useValidation/useForm.
        composable: 'useNested',
        callPattern: /\buseNested\(/,
        events: [
            { name: 'click:open', handler: null },
            { name: 'update:opened', handler: null },
            { name: 'click:select', handler: null },
            { name: 'update:selected', handler: null }
        ]
    },
    {
        composable: 'useOptions',
        callPattern: /\buseOptions\(/,
        events: [{ name: 'update:options', handler: null }]
    },
    {
        composable: 'usePaginatedItems',
        callPattern: /\busePaginatedItems\(/,
        events: [{ name: 'update:currentItems', handler: null }]
    },
    {
        // `provideSort` (`DataTable/sort.composable.ts`) écrit
        // `sortBy.value = newSortBy` sans condition dans `toggleSort()` —
        // `sortBy` est le `useVModel(props, 'sortBy', [])` construit UNE
        // COUCHE PLUS HAUT par `createSort(props)`. `OrigamDataTable.vue`
        // n'appelle jamais `useVModel` littéralement lui-même — seulement
        // `createSort(props)` puis `provideSort({sortBy, …})` — donc le
        // scan `directVModelEvents` (qui exige `const x = useVModel(props,
        // 'prop')` dans le MÊME fichier) ne peut pas le voir. Même famille
        // de piège que `useGroup` ci-dessus, une fonction plus loin.
        // Seul consommateur du repo (`grep -rln 'provideSort('
        // src/components/` → OrigamDataTable.vue uniquement), donc aucun
        // risque de faux-négatif ailleurs. Vérifié au RUNTIME (pas
        // seulement à la lecture) : `wrapper.emitted('update:sortBy')`
        // après `toggleSort(header)` — voir
        // `packages/tests/TU/components/DataTable/OrigamDataTable.spec.ts`.
        composable: 'provideSort',
        callPattern: /\bprovideSort\(/,
        events: [{ name: 'update:sortBy', handler: null }]
    },
    {
        // `providePagination` (`DataTable/pagination.composable.ts`) écrit
        // `page.value =` / `itemsPerPage.value =` sans condition dans
        // `setPage`/`nextPage`/`prevPage`/`setItemsPerPage` — les deux refs
        // sont le `useVModel(props, 'page'|'itemsPerPage')` construit une
        // couche plus haut par `createPagination(props)`. Même famille que
        // `provideSort` ci-dessus. Seul consommateur du repo :
        // OrigamDataTable.vue. Vérifié au runtime — voir
        // `OrigamDataTable.spec.ts` (`update:page` via le v-model
        // `<origam-pagination>` de `OrigamDataTableFooter`, `update:itemsPerPage`
        // via `setItemsPerPage`).
        composable: 'providePagination',
        callPattern: /\bprovidePagination\(/,
        events: [
            { name: 'update:page', handler: null },
            { name: 'update:itemsPerPage', handler: null }
        ]
    },
    {
        // `provideSelection` (`DataTable/select.composable.ts`) écrit
        // `selected.value = newSelected` sans condition dans
        // `select()`/`selectAll()` — `selected` est le
        // `useVModel(props, 'modelValue', …)` construit DANS la même
        // fonction (pas une couche plus haut cette fois, mais toujours
        // invisible à `directVModelEvents` qui exige `const x =
        // useVModel(...)` dans le fichier du COMPOSANT, pas dans un
        // composable qu'il appelle). Seul consommateur du repo :
        // OrigamDataTable.vue. Vérifié au runtime — voir
        // `OrigamDataTable.spec.ts` (`update:modelValue` via `toggleSelect`).
        composable: 'provideSelection',
        callPattern: /\bprovideSelection\(/,
        events: [{ name: 'update:modelValue', handler: null }]
    },
    {
        // `provideExpanded` (`DataTable/expand.composable.ts`) écrit
        // `expanded.value = newExpanded` sans condition dans `expand()` —
        // `expanded` est le `useVModel(props, 'expanded', …)` construit DANS
        // la même fonction. Seul consommateur du repo : OrigamDataTable.vue.
        // Vérifié au runtime — voir `OrigamDataTable.spec.ts`
        // (`update:expanded` via `toggleExpand`).
        composable: 'provideExpanded',
        callPattern: /\bprovideExpanded\(/,
        events: [{ name: 'update:expanded', handler: null }]
    }
    // ⛔ `provideGroupBy` (même fichier que `provideSort`) N'EST PAS listé
    // ici volontairement : `toggleGroup()` n'écrit QUE dans `opened` (état
    // ouverture/fermeture d'un groupe), jamais dans `groupBy.value`. Vérifié
    // par `grep -rn "groupBy\.value\s*=" packages/ds/src/` — zéro résultat
    // dans tout le DS. `update:groupBy` est un emit réellement mort — voir
    // sa suppression de `IDataTableEmits` dans `data-table.interface.ts`.
]

function computeExtraRelayEmitted (src) {
    const found = new Set()
    for (const relay of EXTRA_RELAYS) {
        if (!relay.callPattern.test(src)) continue
        for (const { name, handler } of relay.events) {
            if (!handler || isHandlerWired(src, handler)) found.add(name)
        }
    }
    return found
}

/**
 * `useStateFlag(props, { state, source })` — voir le header ("useHover/
 * useActive N'EXISTENT PLUS") pour le contexte complet. Chaque appel est sa
 * PROPRE unité d'analyse : la paire `(state, source)` fixe QUEL canal
 * `update:*` est concerné, et le bloc de déstructuration associé
 * (capturé dans le MÊME match, jamais re-cherché globalement dans le
 * fichier) dit si `set`/`unset`/`toggle` — les trois seules méthodes qui
 * écrivent le v-model interne — sont exposées ET câblées quelque part.
 *
 * ⚠️ Le bloc de déstructuration est capturé PAR APPEL, pas recherché
 * globalement comme le fait `isHandlerWired` pour les autres relais : un
 * fichier appelle typiquement `useStateFlag` deux fois (`hover` et
 * `active`), avec des clés `set`/`unset`/`toggle` qui peuvent apparaître
 * dans les DEUX blocs sous des noms locaux différents. Une recherche
 * globale associerait la mauvaise instance à la mauvaise déstructuration.
 */
const STATE_FLAG_CALL_RE = /const\s*\{([^}]*)\}\s*=\s*useStateFlag\(\s*props\s*,\s*\{([^}]*)\}\s*\)/g

function computeStateFlagEmitted (src) {
    const found = new Set()
    let m
    STATE_FLAG_CALL_RE.lastIndex = 0
    while ((m = STATE_FLAG_CALL_RE.exec(src))) {
        const [, destructure, options] = m

        const stateMatch = options.match(/\bstate\s*:\s*'([^']+)'/)
        if (!stateMatch) continue // pas un appel reconnu — pas de `state` littéral
        const sourceMatch = options.match(/\bsource\s*:\s*'([^']+)'/)
        const channel = sourceMatch ? sourceMatch[1] : stateMatch[1]
        const event = `update:${channel}`

        // set() / unset() / toggle() sont les SEULES méthodes que
        // `useStateFlag` retourne qui écrivent le v-model interne (voir
        // `stateFlag.composable.ts`) — n'importe laquelle des trois,
        // déstructurée ET câblée, prouve que ce canal PEUT émettre.
        for (const key of ['set', 'unset', 'toggle']) {
            const renamed = destructure.match(new RegExp(`\\b${key}\\s*:\\s*([A-Za-z0-9_$]+)`))
            const boundBare = new RegExp(`[{,]\\s*${key}\\s*[,}]`).test(`{${destructure}}`)
            if (!renamed && !boundBare) continue
            const localName = renamed ? renamed[1] : key
            // > 1 : une occurrence est la déstructuration elle-même, il en
            // faut au moins une seconde — le câblage réel (@click="…", un
            // appel direct, …). Compté sur `localName`, PAS sur `key` : une
            // recherche par `key` re-matcherait n'importe quel autre appel
            // `useStateFlag` du même fichier (voir le commentaire au-dessus
            // de cette fonction).
            if (countOccurrences(src, localName) > 1) {
                found.add(event)
                break
            }
        }
    }
    return found
}

// `emitVar` (group 1) is OPTIONAL: `defineEmits<IXxxEmits>()` used as a bare
// statement (no `const x =`) is a legitimate, common shape in this codebase
// — Avatar/AvatarGroup/Badge/Btn all register the emits option this way and
// rely ENTIRELY on a relay composable to fire anything. With no captured
// variable, there is no way to call the emitter literally at all: every
// declared event either comes from a relay or is dead, with no ambiguity
// (no `emitVar(...)` scan is even possible, so `hasDynamicEmit` is moot).
const DEFINE_EMITS_RE = /(?:const\s+([A-Za-z0-9_$]+)\s*=\s*)?defineEmits<\s*(I[A-Za-z0-9]*Emits)\s*>/

/**
 * @param {string} rawSource - le contenu ENTIER du `.vue` (template + script).
 * @param {Map} interfaceIndex - sortie de `buildInterfaceIndex()`, partagée
 *   entre tous les composants pour ne construire l'index qu'une fois.
 * @returns {{
 *   emitVar: string|null, interfaceName: string|null,
 *   declared: string[], neverEmitted: string[], indeterminate: string[],
 *   hasDynamicEmit: boolean
 * }}
 */
export function analyseDeadEmits (rawSource, interfaceIndex) {
    const empty = { emitVar: null, interfaceName: null, declared: [], neverEmitted: [], indeterminate: [], hasDynamicEmit: false }

    const declMatch = rawSource.match(DEFINE_EMITS_RE)
    if (!declMatch) return empty

    const [, emitVar, interfaceName] = declMatch
    const declared = resolveDeclared(interfaceName, interfaceIndex)
    if (declared.size === 0) return { ...empty, emitVar, interfaceName }

    const stripped = stripComments(rawSource)

    // 1. Appels littéraux — script OU template. Impossible sans variable captée.
    const literalEmitted = new Set()
    let hasDynamicEmit = false
    if (emitVar) {
        const escaped = escapeRegExp(emitVar)
        const literalRe = new RegExp(`\\b${escaped}\\(\\s*(['"])([^'"]+)\\1`, 'g')
        let m
        while ((m = literalRe.exec(stripped))) literalEmitted.add(m[2])

        // 4. Appels dynamiques — premier caractère non-blanc après `(` qui
        //    n'est ni un guillemet (littéral, cas 1) ni une parenthèse
        //    fermante (appel à zéro argument, invalide pour un emit Vue).
        const dynamicRe = new RegExp(`\\b${escaped}\\(\\s*(?!['"]|\\))`, 'g')
        hasDynamicEmit = dynamicRe.test(stripped)
    }

    // 2. Relais `update:*` partagés avec emits-completeness.mjs.
    const relayEmitted = computeEmittable(stripped)

    // 3. Relais additionnels, propres à cette analyse (voir header).
    const extraRelayEmitted = computeExtraRelayEmitted(stripped)

    // 4. useStateFlag(props, { state, source }) — relais dynamique, voir
    //    header ("useHover/useActive N'EXISTENT PLUS") et la fonction elle-même.
    const stateFlagEmitted = computeStateFlagEmitted(stripped)

    const emitted = new Set([...literalEmitted, ...relayEmitted, ...extraRelayEmitted, ...stateFlagEmitted])
    const dead = [...declared].filter(e => !emitted.has(e)).sort()

    return {
        emitVar,
        interfaceName,
        declared: [...declared].sort(),
        neverEmitted: hasDynamicEmit ? [] : dead,
        indeterminate: hasDynamicEmit ? dead : [],
        hasDynamicEmit
    }
}
