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
 * QUATRE FAÇONS DONT UN ÉVÉNEMENT DÉCLARÉ PEUT ÊTRE ÉMIS
 * ---------------------------------------------------------------------
 *   1. Littéralement, `emitVar('nom', …)` — dans le `<script setup>` OU
 *      dans le `<template>` (Vue autorise `@click="emit('foo')"` en
 *      expression inline ; `OrigamAudio.vue` l'utilise pour `play`/`pause`).
 *      D'où un scan sur le FICHIER ENTIER, pas seulement le bloc script.
 *      IMPOSSIBLE si `defineEmits<IXxxEmits>()` est un appel nu (pas de
 *      `const x = …`) — Avatar/AvatarGroup/Badge/Btn font exactement ça :
 *      aucune variable n'existe pour appeler l'émetteur à la main.
 *   2. Par un des QUATRE relais `update:*` d'`emits-completeness.mjs`
 *      (`useVModel`/`useActive`/`useFocus`/`useValidation`/`useForm`) —
 *      `computeEmittable()`.
 *   3. Par un des relais SUPPLÉMENTAIRES ci-dessous (`EXTRA_RELAYS`),
 *      propres à cette analyse — voir la section dédiée.
 *   4. Dynamiquement — `emitVar(someVariable, …)` où le premier argument
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
 * CE QUE `useHover` PROUVE (validation empirique, pas supposition)
 * ---------------------------------------------------------------------
 * `useHover(props)` ne prend JAMAIS d'`emit` et n'appelle jamais
 * `getCurrentInstance().emit` — lu dans
 * `packages/ds/src/composables/Commons/hover.composable.ts`. Pourtant
 * `IHoverEmits` déclare `update:hover`, et `IHoverEmits` est étendu par
 * `IAlertEmits`, `IAvatarEmits`, `IAvatarGroupEmits`, `ICardEmits`,
 * `IBottomNavEmits`, entre autres — vérifié composant par composant, PAS un
 * cas inventé. Note : `IBadgeEmits` n'étend PAS `IHoverEmits` (seul
 * `IBadgeProps` étend `IHoverProps`) — Badge n'a donc PAS de `update:hover`
 * mort, malgré ce qu'un premier repérage manuel avait supposé.
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
        // `useDatePickerCalendar` calls `useVModel(props, 'date', …)`
        // INTERNALLY (`date-picker-calendar.composable.ts`) and returns
        // `model` — a relay of a relay, one layer below what
        // `directVModelEvents` can see (it only recognises a LITERAL
        // `const x = useVModel(props, 'prop')` inside the component's own
        // source). Same blind spot as `useGroup` above.
        // `OrigamDatePickerMonth.vue` is the sole caller (verified —
        // `grep -rl useDatePickerCalendar src/components/`) and writes
        // `model.value = …` unconditionally in every branch of its
        // `handleClick` (single / multiple / range selection) — proven at
        // runtime by `packages/tests/TU/components/DatePicker/
        // OrigamDatePickerMonth.spec.ts` (click a day, assert
        // `wrapper.emitted('update:date')`), including a mutation test
        // (deleting the write turns the spec red).
        composable: 'useDatePickerCalendar',
        callPattern: /\buseDatePickerCalendar\(\s*props\b/,
        events: [{ name: 'update:date', handler: null }]
    },
    {
        // `useProgress` calls `useVModel(props, 'modelValue')` INTERNALLY
        // (`progress.composable.ts`) and returns `progress` — same
        // relay-of-relay blind spot as `useGroup` / `useDatePickerCalendar`
        // above. Three callers (`grep -rl useProgress\\( src/components/`):
        // `OrigamProgressLinear.vue` writes `progress.value = …` in
        // `handleClick` when `clickable` is set — proven at runtime by
        // `packages/tests/TU/components/Progress/OrigamProgressLinear.spec.ts`
        // (issue #434 regression test; a mutation test deleting that write
        // turns it red). `OrigamProgressCircular.vue` and `OrigamProgress.vue`
        // never write `progress.value` and their OWN emits interfaces
        // (`IProgressCircularEmits` / `IProgressEmits`) are both `{}` — they
        // don't declare `update:modelValue` at all, so this relay cannot
        // mask a dead emit for them today. If either interface ever grows
        // `update:modelValue` without also writing `progress.value`, this
        // entry would need a real `written` check (not just `callPattern`)
        // — none exists yet, so `handler: null` (unconditional on call) is
        // the same verified-by-reading shape as the `useGroup` entry above.
        composable: 'useProgress',
        callPattern: /\buseProgress\(\s*props\b/,
        events: [{ name: 'update:modelValue', handler: null }]
    },
    {
        composable: 'usePaginatedItems',
        callPattern: /\busePaginatedItems\(/,
        events: [{ name: 'update:currentItems', handler: null }]
    }
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

    const emitted = new Set([...literalEmitted, ...relayEmitted, ...extraRelayEmitted])
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
