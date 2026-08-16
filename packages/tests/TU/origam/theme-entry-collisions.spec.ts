/*
 * THEME-ENTRY COLLISIONS — which of two theme entries actually reaches the DOM.
 *
 * THE SHAPE. 42 DS components render ANOTHER origam component as their template
 * root. The rendered root DOM node therefore sits in two class namespaces at
 * once — `<OrigamTextField>`'s root really is `<OrigamInput>`'s root, and it
 * carries `origam-input …  origam-text-field` together. When a theme names BOTH
 * keys and both name the SAME prop, the theme states two things about one
 * element. One wins; the other is dead. Silently: no error, no warning, no
 * failing test. The theme author believes they configured something that never
 * applies.
 *
 * WHY A UNIT TEST AND NOT A GREP. Reading the templates tells you a collision is
 * POSSIBLE. It cannot tell you which side wins — that depends on prop
 * forwarding, on `useDefaults()` resolution order, and on the ADR-005 hook that
 * patches `instance.props` for every prop a theme names. So the criterion here
 * is behavioural, and it is the same one used for an inert prop:
 *
 *     change the value of one entry; if the rendered DOM is byte-identical,
 *     that entry is DEAD.
 *
 * Each pair is probed three times — baseline, child-entry flipped, parent-entry
 * flipped — and classified from the two diffs. A pair where BOTH flips change
 * nothing is reported as inert rather than quietly called "fine", and a pair
 * where both entries already carry the same value is reported as redundant
 * (harmless today, a trap the day one side is edited).
 *
 * This file MEASURES. It deliberately asserts nothing about which side SHOULD
 * win — that is a design decision, not a technical one, and it is the user's to
 * make. The only assertion is that every pair produced a determinate reading,
 * so the inventory can never silently shrink to "nothing found".
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createOrigam } from '@origam/origam'
import * as components from '@origam/components'

import type { IOrigamTheme } from '@origam/interfaces'

/*
 * Declared here rather than in `src/interfaces` / `src/types`: these describe
 * the PROBE, not the DS surface, and sibling TU specs (form, items, stack,
 * group, intersectionObserver…) all declare their local shapes the same way.
 */
interface ICollisionCase {
    component: string
    self: string
    root: string
    prop: string
    /** value the theme gives the OUTER key */
    a: string
    /** value the theme gives the ROOT (inner) key */
    b: string
    /** a third, distinct value used to flip one side at a time */
    alt: string
}

type TCollisionVerdict =
    | 'RACINE-MORTE'
    | 'SELF-MORT'
    | 'LES-DEUX-VIVANTES'
    | 'LES-DEUX-INERTES'
    | 'REDONDANT'
    | 'NON-MESURABLE'

/**
 * The colliding pairs, as measured from the shipped DS theme by the static
 * pass (`self` renders `root` as its template root; both keys are named by
 * `packages/ds/src/themes/origam.theme.ts` and share `prop`).
 */
const CASES: ICollisionCase[] = [
    { component: 'OrigamTextField', self: 'origam-text-field', root: 'origam-input', prop: 'density', a: 'compact', b: 'default', alt: 'comfortable' },
    { component: 'OrigamTextareaField', self: 'origam-textarea-field', root: 'origam-input', prop: 'density', a: 'compact', b: 'default', alt: 'comfortable' },
    { component: 'OrigamPasswordField', self: 'origam-password-field', root: 'origam-input', prop: 'density', a: 'compact', b: 'default', alt: 'comfortable' },
    { component: 'OrigamFileField', self: 'origam-file-field', root: 'origam-input', prop: 'density', a: 'compact', b: 'default', alt: 'comfortable' },
    { component: 'OrigamCheckbox', self: 'origam-checkbox', root: 'origam-input', prop: 'density', a: 'compact', b: 'default', alt: 'comfortable' },
    { component: 'OrigamRadio', self: 'origam-radio', root: 'origam-input', prop: 'density', a: 'compact', b: 'default', alt: 'comfortable' },
    { component: 'OrigamColorPickerField', self: 'origam-color-picker-field', root: 'origam-text-field', prop: 'density', a: 'compact', b: 'default', alt: 'comfortable' },
    { component: 'OrigamDatePickerField', self: 'origam-date-picker-field', root: 'origam-text-field', prop: 'density', a: 'compact', b: 'default', alt: 'comfortable' },
    { component: 'OrigamSelect', self: 'origam-select', root: 'origam-text-field', prop: 'density', a: 'compact', b: 'default', alt: 'comfortable' },
    { component: 'OrigamBtnToggle', self: 'origam-btn-toggle', root: 'origam-btn-group', prop: 'size', a: 'small', b: 'large', alt: 'x-large' },
    { component: 'OrigamContextualMenu', self: 'origam-contextual-menu', root: 'origam-menu', prop: 'location', a: 'right', b: 'bottom', alt: 'top' },
    { component: 'OrigamTooltip', self: 'origam-tooltip', root: 'origam-overlay', prop: 'location', a: 'top', b: 'bottom', alt: 'left' },
    { component: 'OrigamSnackbar', self: 'origam-snackbar', root: 'origam-overlay', prop: 'location', a: 'top', b: 'bottom', alt: 'left' },
    { component: 'OrigamMenu', self: 'origam-menu', root: 'origam-overlay', prop: 'location', a: 'bottom', b: 'top', alt: 'left' },
    { component: 'OrigamDataTable', self: 'origam-data-table', root: 'origam-table', prop: 'tag', a: 'div', b: 'section', alt: 'article' }
]

const PROBE_THEME = 'collision-probe'

function themeWith (entries: Record<string, Record<string, unknown>>): IOrigamTheme {
    return { name: PROBE_THEME, components: entries, vars: {} } as IOrigamTheme
}

/**
 * Rendered markup of `component` under a theme, or null if it cannot mount.
 *
 * ⚠️ Registering a theme is NOT enough to apply it. `createOrigam({themes})`
 * only REGISTERS; the active defaults map stays empty until
 * `_defaultsRef.value` is seeded from `_activeDefaultsFor(name, mode)`. The
 * first version of this probe omitted that line, so every single pair came
 * back "neither entry changes the DOM" — a uniform clean bill of health that
 * was really the theme never being applied at all. `SELF_CONTROL` below now
 * makes that failure impossible to mistake for a finding.
 */
function renderUnder (componentName: string, theme: IOrigamTheme): string | null {
    const Component = (components as Record<string, unknown>)[componentName]
    if (!Component) return null
    try {
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor(PROBE_THEME, undefined)
        const wrapper = mount(Component as never, { global: { plugins: [origam] } })
        const html = wrapper.html()
        wrapper.unmount()
        return html
    } catch {
        return null
    }
}

function classify (c: ICollisionCase): { verdict: TCollisionVerdict, detail: string } {
    if (c.a === c.b) return { verdict: 'REDONDANT', detail: `les deux entrées portent déjà ${JSON.stringify(c.a)}` }

    const base = renderUnder(c.component, themeWith({
        [c.self]: { [c.prop]: c.a },
        [c.root]: { [c.prop]: c.b }
    }))
    if (base === null) return { verdict: 'NON-MESURABLE', detail: 'le composant ne se monte pas sans props/slots requis' }

    /*
     * An overlay-family component (Menu, Tooltip, Snackbar, ContextualMenu…)
     * renders nothing at all until it is opened, and a closed one emits just a
     * comment anchor. Comparing two empty renders always says "identical",
     * which would be scored as "both entries inert" — a finding, when in truth
     * nothing was observed. Refuse to score those instead of manufacturing a
     * verdict: they need an opened state (e2e) to be decided.
     */
    const meaningful = base.replace(/<!--[\s\S]*?-->/g, '').trim()
    if (meaningful.length === 0) {
        return { verdict: 'NON-MESURABLE', detail: 'rien de rendu à l\'état fermé (famille overlay) — à départager ouvert, en e2e' }
    }

    const rootFlipped = renderUnder(c.component, themeWith({
        [c.self]: { [c.prop]: c.a },
        [c.root]: { [c.prop]: c.alt }
    }))
    const selfFlipped = renderUnder(c.component, themeWith({
        [c.self]: { [c.prop]: c.alt },
        [c.root]: { [c.prop]: c.b }
    }))
    if (rootFlipped === null || selfFlipped === null) return { verdict: 'NON-MESURABLE', detail: 'montage instable entre deux thèmes' }

    const rootMatters = rootFlipped !== base
    const selfMatters = selfFlipped !== base

    if (selfMatters && !rootMatters) return { verdict: 'RACINE-MORTE', detail: `'${c.self}'.${c.prop} gagne ; '${c.root}'.${c.prop} n'a aucun effet` }
    if (rootMatters && !selfMatters) return { verdict: 'SELF-MORT', detail: `'${c.root}'.${c.prop} gagne ; '${c.self}'.${c.prop} n'a aucun effet` }
    if (rootMatters && selfMatters) return { verdict: 'LES-DEUX-VIVANTES', detail: 'les deux entrées influencent le DOM (pas une collision)' }
    return { verdict: 'LES-DEUX-INERTES', detail: `aucune des deux entrées ne change le DOM pour ${c.prop}` }
}

describe('collisions d\'entrées de thème sur une racine partagée', () => {
    const results: Array<{ case: ICollisionCase, verdict: TCollisionVerdict, detail: string }> = []

    /*
     * SELF-CONTROL — runs FIRST and gates the whole file.
     *
     * `OrigamChip` under the shipped theme is a proven-live case: the theme
     * pins `size: 'small'`, the story pins nothing, the component's own
     * withDefaults says 'default', and the browser renders
     * `origam-chip--size-small`. So flipping that one entry MUST change the
     * rendered markup. If it does not, the probe is not applying themes at
     * all and every "inert" verdict below is worthless — which is exactly the
     * state the first version of this file shipped in.
     */
    it('CONTRÔLE — le probe applique réellement le thème (sinon tout verdict est faux)', () => {
        const small = renderUnder('OrigamChip', themeWith({ 'origam-chip': { size: 'small' } }))
        const large = renderUnder('OrigamChip', themeWith({ 'origam-chip': { size: 'large' } }))

        expect(small, 'OrigamChip doit se monter').not.toBeNull()
        expect(small).toContain('origam-chip--size-small')
        expect(large).toContain('origam-chip--size-large')
        expect(small).not.toBe(large)
    })

    it.each(CASES.map((c) => [`${c.self} / ${c.root} — ${c.prop}`, c] as const))(
        '%s — produit un verdict déterminé',
        (_label, c) => {
            const { verdict, detail } = classify(c)
            results.push({ case: c, verdict, detail })
            // The inventory must never silently shrink to "nothing found": every
            // pair has to come back with a reading, even an inconclusive one.
            expect(verdict).toBeTruthy()
        }
    )

    it('imprime l\'inventaire', () => {
        const lines = results.map((r) => `${r.verdict.padEnd(18)} ${r.case.self} / ${r.case.root} [${r.case.prop}] — ${r.detail}`)
        console.log('\n──────── INVENTAIRE DES COLLISIONS ────────\n' + lines.join('\n') + '\n')
        expect(results.length).toBe(CASES.length)
    })
})
