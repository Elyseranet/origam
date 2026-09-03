/*
 * Shared analysis: what does a component's DECLARED emits interface say
 * (`IXxxEmits` + its `extends` chain), and what is ACTUALLY reachable /
 * emitted?
 *
 * WHY THIS IS A SEPARATE FILE (not duplicated per caller)
 * ---------------------------------------------------------------------
 * Extracted out of `emits-completeness.mjs` (the guard that flags a
 * reachable `update:*` MISSING from the declaration) so that
 * `inspection-harness.mjs` (which flags the INVERSE — a DECLARED emit that
 * is never actually fired, C5) can reuse the exact same interface-index /
 * relay-reachability logic instead of re-implementing it with its own,
 * inevitably-drifting, regexes. Project rule: search for the existing
 * helper before writing a new one.
 *
 * `emits-completeness.mjs` re-exports its previous local names from this
 * file — its own behaviour is unchanged, verified by running the guard
 * before and after the extraction and diffing stdout byte for byte.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { stripComments } from './scss-scan.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../../..')
export const INTERFACES_DIR = path.join(DS_ROOT, 'src/interfaces')

function walk (dir, predicate) {
    const out = []
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry)
        const st = statSync(full)
        if (st.isDirectory()) out.push(...walk(full, predicate))
        else if (predicate(full)) out.push(full)
    }
    return out
}

/*
 * Chaque relais est décrit par l'événement qu'il produit ET par ce qui rend
 * son écriture atteignable. `reachable` reçoit le source du `.vue` et la
 * ligne d'appel ; il renvoie false quand le chemin d'écriture n'existe pas.
 */
export const RELAYS = [
    {
        // useActive(props) -> update:active ; useActive(props, 'Y') -> update:Y.
        // N'écrit QUE dans onActive() -> le composant doit le déstructurer.
        re: /useActive\(\s*props\s*(?:,\s*'([^']+)')?/g,
        event: (m) => `update:${m[1] || 'active'}`,
        reachable: (src) => /\bonActive\b/.test(src)
    },
    {
        re: /useFocus\(\s*props/g,
        event: () => 'update:focused',
        reachable: () => true
    },
    {
        re: /useValidation\(\s*props/g,
        event: () => 'update:modelValue',
        reachable: () => true
    },
    {
        re: /useForm\(\s*props/g,
        event: () => 'update:modelValue',
        reachable: () => true
    }
]

/** `const x = useVModel(props, 'prop')` -> émet update:prop si `x` est
 *  écrit (`x.value =`) ou lié en v-model dans le template. */
export function directVModelEvents (src) {
    const found = new Set()
    const re = /const\s+([A-Za-z0-9_$]+)\s*=\s*useVModel\(\s*props\s*,\s*'([^']+)'/g
    let m
    while ((m = re.exec(src))) {
        const [, ref, prop] = m
        const written = new RegExp(`\\b${ref}\\.value\\s*=[^=]`).test(src)
        const vModelled = new RegExp(`v-model(?::[a-zA-Z-]+)?="${ref}"`).test(src)
        // Une ref exposée via un computed writable relaie aussi l'écriture.
        const proxied = new RegExp(`set\\s*[:(][^}]*${ref}\\.value\\s*=`, 's').test(src)
        if (written || vModelled || proxied) found.add(`update:${prop}`)
    }
    return found
}

/** Ensemble ATTEIGNABLE (direct v-model relays + les RELAYS déclaratifs
 *  ci-dessus) pour un `.vue` déjà passé par `stripComments`. */
export function computeEmittable (strippedSrc) {
    const emittable = directVModelEvents(strippedSrc)
    for (const relay of RELAYS) {
        relay.re.lastIndex = 0
        let m
        while ((m = relay.re.exec(strippedSrc))) {
            if (relay.reachable(strippedSrc)) emittable.add(relay.event(m))
        }
    }
    return emittable
}

/** Résout `IXxxEmits` et toute sa chaîne d'`extends` en un ensemble
 *  d'événements littéraux `(e: 'nom', …)`.
 *
 * ⚠️ Le corps se délimite par COMPTAGE D'ACCOLADES, pas par une regex
 * paresseuse jusqu'à `\n}`. Une interface au corps vide sur une seule ligne
 * — `export interface IColorPickerEmits extends IColorModeEmits {}`, la
 * forme la plus courante ici — n'a aucun `\n}` : la regex filait jusqu'au
 * `}` d'une interface SUIVANTE, avalait sa déclaration et la retirait de
 * l'index. Tout composant dont l'interface avait été avalée ressortait avec
 * un ensemble déclaré VIDE, donc en faux positif. */
export function extractBody (src, openIdx) {
    let depth = 0
    for (let i = openIdx; i < src.length; i++) {
        if (src[i] === '{') depth++
        else if (src[i] === '}') {
            depth--
            if (depth === 0) return src.slice(openIdx + 1, i)
        }
    }
    return ''
}

/**
 * Découpe le CORPS d'une interface en membres de NIVEAU SUPÉRIEUR — séparés
 * par `;` ou un saut de ligne, en ignorant tout séparateur imbriqué dans
 * `()`, `[]` ou `{}` (un élément de tuple, la liste de paramètres d'un type
 * fonction, un type objet…).
 *
 * ⚠️ Les chevrons `<`/`>` ne sont VOLONTAIREMENT PAS suivis. Un type
 * fonction `(el: HTMLElement, e: Event) => void` contient un `>` nu (la
 * flèche `=>`) qui n'est PAS une fermeture de générique — le compter comme
 * tel désynchronise le compteur de profondeur pour tout le reste du corps.
 * Aucun générique n'apparaît dans les corps `*Emits` de ce dépôt ; ne pas
 * les suivre est le choix le plus sûr, pas une simplification hasardeuse.
 */
function splitTopLevelMembers (body) {
    const members = []
    let depth = 0
    let current = ''
    for (const ch of body) {
        if (ch === '(' || ch === '[' || ch === '{') depth++
        else if (ch === ')' || ch === ']' || ch === '}') depth--
        if (depth === 0 && (ch === ';' || ch === '\n')) {
            if (current.trim()) members.push(current.trim())
            current = ''
        } else {
            current += ch
        }
    }
    if (current.trim()) members.push(current.trim())
    return members
}

// Forme 1 — signature d'appel, LA convention de ce dépôt (196/196
// interfaces `*Emits` au moment de l'écriture) : `(e: 'nom', ...): void`.
const CALL_SIGNATURE_EVENT_RE = /^\(\s*e\s*:\s*'([^']+)'/

// Forme 2 — membre de type objet (déclaration "type-based", Vue >= 3.3),
// jamais utilisée dans ce dépôt aujourd'hui mais valide pour
// `defineEmits<T>()` et donc pas quelque chose qu'on peut refuser de
// reconnaître : `'nom': [arg: T]` ou `nom: (arg: T) => void`. La clé peut
// être une chaîne entre quotes (le seul cas réaliste ici — tous les noms
// d'événement de ce DS contiennent `:` ou `-`, illégal dans un identifiant
// nu) ou un identifiant nu.
const PROPERTY_EVENT_RE = /^(?:'([^']+)'|"([^"]+)"|([A-Za-z_$][\w$]*))\s*\??\s*:/

/**
 * Extrait tous les noms d'événement déclarés comme membres PROPRES (pas
 * hérités) d'un corps d'interface `*Emits` — quelle que soit la forme
 * utilisée (voir les deux regex ci-dessus).
 *
 * POURQUOI CETTE FONCTION EXISTE — bug #reporté par mutation, 2026-09-03
 * ---------------------------------------------------------------------
 * L'ancienne extraction ne cherchait QUE la forme 1, sur le corps ENTIER
 * (pas membre par membre) : `body.matchAll(/\(\s*e:\s*'([^']+)'/g)`. Un
 * corps écrit dans la forme 2 ne produit AUCUN match — pas une erreur,
 * juste un ensemble d'événements PROPRES vide pour cette interface. Prouvé
 * par mutation : réécrire `IHoverEmits` (`(e: 'update:hover', …): void`) en
 * forme 2 (`'update:hover': [value: boolean]`) fait disparaître
 * `update:hover` de TOUTE la chaîne d'héritage qui l'étend — et
 * `unemitted-declarations.mjs` a signalé les 5 violations déjà connues
 * (Alert, Avatar, AvatarGroup, BottomNav, Card) comme *STALE* (« déjà
 * corrigées ! ») alors que rien n'avait changé dans le composant lui-même.
 * Un faux « corrigé » est pire qu'un faux positif : personne ne revérifie
 * une ligne que le garde dit résolue.
 *
 * Aucune interface de ce dépôt n'utilise la forme 2 aujourd'hui (mesuré :
 * 0/196 — voir `emits.selftest.mjs`), donc ce correctif ne change PAS le
 * chiffre de baseline actuel. Il ferme un angle mort qu'une future
 * interface pourrait heurter sans qu'aucun garde ne le remarque — Vue
 * accepte la forme 2 nativement, rien dans ce dépôt ne l'interdit.
 */
export function extractEmitNames (body) {
    const names = []
    for (const member of splitTopLevelMembers(body)) {
        const callMatch = member.match(CALL_SIGNATURE_EVENT_RE)
        if (callMatch) {
            names.push(callMatch[1])
            continue
        }
        const propMatch = member.match(PROPERTY_EVENT_RE)
        if (propMatch) {
            names.push(propMatch[1] ?? propMatch[2] ?? propMatch[3])
        }
    }
    return names
}

export function buildInterfaceIndex () {
    const files = walk(INTERFACES_DIR, f => f.endsWith('.interface.ts'))
    const index = new Map()
    for (const file of files) {
        const src = stripComments(readFileSync(file, 'utf8'))
        const re = /export\s+interface\s+(I[A-Za-z0-9]*Emits)([^{]*)\{/g
        let m
        while ((m = re.exec(src))) {
            const [, name, heritage] = m
            const body = extractBody(src, re.lastIndex - 1)
            const parents = [...heritage.matchAll(/(I[A-Za-z0-9]*Emits)/g)].map(x => x[1])
            const events = extractEmitNames(body)
            index.set(name, { parents, events })
        }
    }
    return index
}

export function resolveDeclared (name, index, seen = new Set()) {
    if (!name || seen.has(name) || !index.has(name)) return new Set()
    seen.add(name)
    const { parents, events } = index.get(name)
    const out = new Set(events)
    for (const p of parents) {
        for (const e of resolveDeclared(p, index, seen)) out.add(e)
    }
    return out
}
