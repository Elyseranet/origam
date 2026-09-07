// Preuve d'equivalence de l'axe COULEUR — `useColorEffect` vs `useStateEffect`.
//
// POURQUOI CE SPEC EXISTE
// -----------------------
// `stateEffect.composable.ts` portait une copie de l'axe couleur de
// `colorEffect.composable.ts` — le fichier l'avouait lui-meme
// («Color axis (preserved verbatim from useColorEffect)»). La factorisation
// touche la couleur de 33 composants ; la seule livraison recevable est celle
// qui prouve que la sortie n'a pas bouge d'un octet.
//
// Ce spec enregistre, pour une matrice complete (18 valeurs de `color` x
// 18 valeurs de `bgColor` x 5 etats, plus les surcharges `hoverState` /
// `activeState` / `status` propres a `useStateEffect`), les DEUX canaux de
// sortie des deux composables : `colorClasses` et `colorStyles`. Le resultat
// est compare a `color-axis-baseline.json`, capture AVANT la factorisation.
//
// ⛔ Le fichier de baseline ne doit JAMAIS etre regenere pour «faire passer»
// le spec. Il est la reference d'avant refactor. Il ne se regenere
// (`UPDATE_COLOR_AXIS_BASELINE=1`) que si une evolution VOULUE de l'axe
// couleur est actee et documentee dans le commit qui la porte.
//
// ⛔ On assert sur les CHAINES RETOURNEES par les composables, jamais sur
// `getComputedStyle` : sous jsdom, `getComputedStyle` ne resout pas les
// `var()` et rend un defaut fabrique (`16px`) qui ressemble a une mesure
// (cf. CLAUDE.md, #398). Ce DS lit ses tokens presque exclusivement via
// `var(--origam-…)` — le style calcule y est structurellement aveugle.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { computed, defineComponent, h, reactive, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest'

import { useColorEffect } from '@origam/composables/Commons/colorEffect.composable'
import { useStateEffect } from '@origam/composables/Commons/stateEffect.composable'

import type { IActiveState, IHoverState } from '@origam/interfaces/Commons/state-effect.interface'
import type { TColor } from '@origam/types/Commons/color.type'

const BASELINE_PATH = resolve(
    dirname(fileURLToPath(import.meta.url)),
    'color-axis-baseline.json',
)

// ---------------------------------------------------------------------------
// Matrice de valeurs — couvre chaque branche des deux resolveurs
// ---------------------------------------------------------------------------
// - les 8 intentions de l'enum INTENT (dont `ghost`, exclu des classes
//   utilitaires, et `neutral` / `secondary`, sans rung `fgSubtle`) ;
// - `transparent` (chemin de derivation math) ;
// - couleurs brutes heritees : hex opaque, rgba translucide, `var(--…)`
//   (non parsable), `color-mix(…)` (reconnu mais non parsable), nom CSS ;
// - degrades : fonction CSS et preset `gradient-*` — c'est la SEULE
//   divergence connue entre les deux composables, et la baseline la fige ;
// - une chaine qui n'est ni une intention ni une couleur (chemin mort).
const COLOR_VALUES: Array<TColor | undefined> = [
    undefined,
    'neutral',
    'primary',
    'secondary',
    'ghost',
    'success',
    'warning',
    'danger',
    'info',
    'transparent',
    '#ff0080',
    'rgba(0, 0, 0, 0.5)',
    'var(--custom-token)',
    'color-mix(in srgb, red, blue)',
    'rebeccapurple',
    'linear-gradient(to right, red, blue)',
    'gradient-sunset',
    'pas-une-couleur',
] as Array<TColor | undefined>

interface IStateCase {
    label: string
    hover: boolean
    active: boolean
    disabled: boolean
}

const STATE_CASES: IStateCase[] = [
    { label: 'rest', hover: false, active: false, disabled: false },
    { label: 'hover', hover: true, active: false, disabled: false },
    { label: 'active', hover: false, active: true, disabled: false },
    { label: 'hover+active', hover: true, active: true, disabled: false },
    { label: 'disabled', hover: false, active: false, disabled: true },
]

// Surcharges propres a `useStateEffect` : `hoverState` / `activeState`
// portent une valeur par axe, et la regle du «meme intent» ramene le role
// au rung hover/active canonique au lieu de traiter la valeur comme un
// override choisi par le consommateur.
const OVERRIDE_CASES: Array<{
    label: string
    hoverState?: IHoverState
    activeState?: IActiveState
    status?: string
}> = [
    { label: 'no-override' },
    { label: 'hover-own-bg', hoverState: { bgColor: 'danger' } as IHoverState },
    { label: 'hover-same-bg', hoverState: { bgColor: 'primary' } as IHoverState },
    { label: 'hover-own-fg', hoverState: { color: 'success' } as IHoverState },
    { label: 'active-own-bg', activeState: { bgColor: 'warning' } as IActiveState },
    { label: 'active-same-bg', activeState: { bgColor: 'primary' } as IActiveState },
    { label: 'both-own-bg', hoverState: { bgColor: 'info' } as IHoverState, activeState: { bgColor: 'danger' } as IActiveState },
    { label: 'hover-raw-bg', hoverState: { bgColor: '#00ff00' } as IHoverState },
    { label: 'status-success', status: 'success' },
    { label: 'status-error', status: 'error' },
    { label: 'status-warning', status: 'warning' },
    { label: 'status-info', status: 'info' },
]

// Les surcharges ne se jouent qu'en hover / active : au repos et en disabled
// il n'y a aucun slot a arbitrer. Sous-ensemble de valeurs de bg couvrant
// une intention, une intention identique a l'override, `transparent`, une
// couleur brute opaque, une translucide, un `var()`, un degrade, et le vide.
const OVERRIDE_BG_VALUES: Array<TColor | undefined> = [
    undefined,
    'primary',
    'danger',
    'transparent',
    '#ff0080',
    'rgba(0, 0, 0, 0.5)',
    'var(--custom-token)',
    'linear-gradient(to right, red, blue)',
] as Array<TColor | undefined>

const OVERRIDE_FG_VALUES: Array<TColor | undefined> = [
    undefined, 'primary', 'danger', '#123456',
] as Array<TColor | undefined>

const OVERRIDE_STATES = STATE_CASES.filter(s => s.hover || s.active)

// ---------------------------------------------------------------------------
// Harnais — un seul montage, props reactives, on lit les computeds
// ---------------------------------------------------------------------------
// Monter 1 620 composants prendrait des minutes pour rien : les deux
// composables exposent des `computed` branches sur un objet `reactive`, donc
// muter cet objet suffit a reevaluer la sortie. C'est aussi ce qui rend le
// spec sensible a une regression de REACTIVITE (un `props.x` lu eagerly dans
// le corps du composable figerait la valeur et la matrice s'effondrerait sur
// une seule ligne repetee).

type TProbe = {
    setColor: (v: TColor | undefined) => void
    setBgColor: (v: TColor | undefined) => void
    setStatus: (v: string | undefined) => void
    setState: (s: IStateCase) => void
    setOverrides: (h?: IHoverState, a?: IActiveState) => void
    readColorEffect: () => { classes: string[], styles: string[] }
    readStateEffect: () => { classes: string[], styles: string[] }
}

function buildProbe (): TProbe {
    const props = reactive<{ color?: TColor, bgColor?: TColor, status?: string }>({
        color: undefined,
        bgColor: undefined,
        status: undefined,
    })

    const isHover = ref(false)
    const isActive = ref(false)
    const isDisabled = ref(false)
    const hoverStateRef = ref<IHoverState | undefined>(undefined)
    const activeStateRef = ref<IActiveState | undefined>(undefined)

    let probe!: TProbe

    const Harness = defineComponent({
        setup () {
            const ce = useColorEffect(props as never, isHover, isActive, isDisabled)
            const se = useStateEffect(
                props as never,
                isHover,
                isActive,
                computed(() => hoverStateRef.value),
                computed(() => activeStateRef.value),
                isDisabled,
            )

            probe = {
                setColor: (v) => { props.color = v },
                setBgColor: (v) => { props.bgColor = v },
                setStatus: (v) => { props.status = v },
                setState: (s) => {
                    isHover.value = s.hover
                    isActive.value = s.active
                    isDisabled.value = s.disabled
                },
                setOverrides: (h, a) => {
                    hoverStateRef.value = h
                    activeStateRef.value = a
                },
                readColorEffect: () => ({
                    classes: [...ce.colorClasses.value],
                    styles: [...ce.colorStyles.value],
                }),
                readStateEffect: () => ({
                    classes: [...se.colorClasses.value],
                    styles: [...se.colorStyles.value],
                }),
            }

            return () => h('div')
        },
    })

    mount(Harness)
    return probe
}

const key = (v: TColor | undefined) => (v === undefined ? '∅' : String(v))

// Encodage compact d'une cellule : `classes ~ declarations`. Un objet JSON
// par cellule triplerait le poids du fichier de reference sans rien ajouter
// a sa lisibilite — cette forme se lit et se diffe a l'oeil.
const enc = (c: { classes: string[], styles: string[] }) =>
    `${c.classes.join(' ')} ~ ${c.styles.join('; ')}`

function buildMatrix () {
    const probe = buildProbe()

    // ── Matrice principale : les DEUX composables, memes entrees ─────────
    const base: Record<string, { colorEffect: string, stateEffect: string }> = {}

    probe.setOverrides(undefined, undefined)
    probe.setStatus(undefined)

    for (const state of STATE_CASES) {
        probe.setState(state)
        for (const fg of COLOR_VALUES) {
            probe.setColor(fg)
            for (const bg of COLOR_VALUES) {
                probe.setBgColor(bg)
                base[`${state.label}|color=${key(fg)}|bgColor=${key(bg)}`] = {
                    colorEffect: enc(probe.readColorEffect()),
                    stateEffect: enc(probe.readStateEffect()),
                }
            }
        }
    }

    // ── Matrice des surcharges : `useStateEffect` seul ───────────────────
    // `useColorEffect` n'a ni `hoverState` / `activeState` ni `status` : il
    // n'y a rien a comparer, seulement une sortie a figer.
    const overrides: Record<string, string> = {}

    for (const ov of OVERRIDE_CASES) {
        for (const state of OVERRIDE_STATES) {
            probe.setState(state)
            probe.setOverrides(ov.hoverState, ov.activeState)
            probe.setStatus(ov.status)
            for (const bg of OVERRIDE_BG_VALUES) {
                probe.setBgColor(bg)
                for (const fg of OVERRIDE_FG_VALUES) {
                    probe.setColor(fg)
                    overrides[`${ov.label}|${state.label}|color=${key(fg)}|bgColor=${key(bg)}`] =
                        enc(probe.readStateEffect())
                }
            }
        }
    }

    return { base, overrides }
}

// Une entree par ligne : le JSON reste diffable a l'oeil (une regression se
// lit comme un ensemble de lignes modifiees, pas comme un blob reindente) et
// le fichier pese trois fois moins qu'avec un objet indente par cellule.
function serialise (matrix: ReturnType<typeof buildMatrix>): string {
    const section = (rows: Record<string, unknown>) =>
        Object.entries(rows)
            .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
            .join(',\n')
    return `{\n"base": {\n${section(matrix.base)}\n},\n"overrides": {\n${section(matrix.overrides)}\n}\n}\n`
}

// ---------------------------------------------------------------------------

describe('axe couleur — parite useColorEffect / useStateEffect', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>

    beforeAll(() => {
        // `warnLegacyColor` crie une fois par (prop, valeur) sur le chemin
        // couleur brute. Le bruit n'a aucune incidence sur la sortie mesuree.
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterAll(() => {
        warnSpy.mockRestore()
    })

    it('produit exactement la sortie de reference capturee avant factorisation', () => {
        const matrix = buildMatrix()

        if (process.env.UPDATE_COLOR_AXIS_BASELINE === '1') {
            writeFileSync(BASELINE_PATH, serialise(matrix), 'utf8')
        }

        const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))

        expect(Object.keys(matrix.base)).toEqual(Object.keys(baseline.base))
        expect(Object.keys(matrix.overrides)).toEqual(Object.keys(baseline.overrides))
        expect(matrix).toEqual(baseline)
    })

    it('couvre bien toute la matrice annoncee (garde-fou anti-spec-vide)', () => {
        const matrix = buildMatrix()
        // 18 x 18 x 5 = 1620
        expect(Object.keys(matrix.base)).toHaveLength(
            COLOR_VALUES.length * COLOR_VALUES.length * STATE_CASES.length,
        )
        // 12 x 3 x 8 x 4 = 1152
        expect(Object.keys(matrix.overrides)).toHaveLength(
            OVERRIDE_CASES.length * OVERRIDE_STATES.length * OVERRIDE_BG_VALUES.length * OVERRIDE_FG_VALUES.length,
        )
        // Un composable qui figerait ses lectures rendrait la meme sortie
        // partout — la matrice doit contenir de la variete.
        const distinct = new Set(Object.values(matrix.base).map(v => `${v.colorEffect}#${v.stateEffect}`))
        expect(distinct.size).toBeGreaterThan(100)
    })

    it('fige la SEULE divergence connue : les degrades', () => {
        // `useColorEffect` gere `isGradient` sur les deux canaux ;
        // `useStateEffect` ne l'a jamais fait. La factorisation doit
        // PRESERVER cet ecart (30 composants passent par useStateEffect —
        // leur donner le support degrade est un changement de comportement,
        // pas un nettoyage). Ce test echoue si l'ecart disparait par
        // inadvertance dans un sens comme dans l'autre.
        const matrix = buildMatrix()
        const cell = matrix.base['rest|color=∅|bgColor=linear-gradient(to right, red, blue)']
        expect(cell.colorEffect).toBe(' ~ background-image: linear-gradient(to right, red, blue)')
        expect(cell.stateEffect).toBe(' ~ ')

        // Et l'ecart n'existe QUE la : hors degrade, les deux composables
        // rendent exactement la meme chose sur les 1 280 autres combinaisons.
        const divergentKeys = Object.entries(matrix.base)
            .filter(([, v]) => v.colorEffect !== v.stateEffect)
            .map(([k]) => k)
        expect(divergentKeys).toHaveLength(340)
        expect(divergentKeys.filter(k => !k.includes('gradient'))).toEqual([])
    })
})
