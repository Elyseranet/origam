import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'
import { useLocale } from './locale.composable'
import { warnMissingAccessibleName } from '../../utils/Commons/a11y.util'

/*********************************************************
 * useAccessibleCommand
 *
 * @description
 * ⛔ issues #747 / #653 / #660 — the ONE place the design system decides
 * whether a non-native element may claim `role="button"`.
 *
 * The three tickets are three readings of the same defect: the DS puts an
 * ARIA claim on an element it has no name for. `useAdjacent` /
 * `useAdjacentInner` promote the prepend/append zone to `role="button"` +
 * `tabindex="0"` the moment a consumer attaches `click:prepend` /
 * `click:append` (#443) — but neither hook, nor any of the 13 templates
 * that bind them, ever had a channel through which a name could arrive.
 * Measured against axe-core in Chromium, that produced **54
 * `aria-command-name` nodes (impact `serious`, WCAG 2.1 4.1.2 level A)
 * across 17 components** on untouched `develop`, every one of them
 * announced to a screen reader as "button" and nothing else.
 *
 * @description
 * **The rule this hook encodes: the DS never emits an ARIA role it cannot
 * name, and it never invents the name.**
 *
 * - A name IS available → `role="button"` + `tabindex="0"` + `aria-label`.
 *   The zone is a real, reachable, announceable control.
 * - No name → the returned object is EMPTY: no role, no tab stop. The
 *   `@click` listener the template binds is untouched and still fires on
 *   mouse, exactly as it did before #443 added the role; what disappears is
 *   the false claim, not a working feature. A dev-only warning names the
 *   prop to add.
 *
 * @description
 * ⛔ The rejected third option was to keep the role and fabricate a
 * default label ("Prepend action", or an i18n key resolving to it). It
 * would silence axe while telling a screen-reader user strictly nothing
 * about what the control does — the failure mode #622 already shipped
 * once (an auto-label that overwrote a visible `<label for>`), and the
 * reason #653 chose a warning over a fabricated string on the icon family.
 * "No ARIA is better than bad ARIA" is the same principle
 * `useIconAccessibility` applies when it refuses to announce a glyph as a
 * control it cannot operate.
 *
 * @description
 * ⛔ A NATIVE control cannot use this escape hatch — a `<button>` is a
 * button whether or not anyone named it. `OrigamBtn`'s icon-only mode
 * therefore keeps rendering its `<button>` and only warns; see
 * `warnMissingAccessibleName` and `OrigamBtn.vue`.
 *
 * @description
 * `label` is resolved through `useLocale().t`, matching the existing
 * `closeLabel` contract on Alert / Chip / Dialog: an i18n key resolves,
 * and any other string is returned verbatim by the builtin adapter — so
 * a consumer may pass either. `useLocale(false)` (non-strict) is used on
 * purpose: this hook runs inside 13 components, several of which are
 * mounted in unit tests without `createOrigam()` installed, and a strict
 * `useLocale()` would throw there.
 *
 * @description
 * ADR-005: the label is read INSIDE the returned `computed`, never in the
 * `setup()` body, so a value coming from a theme's `components` block is
 * seen at render time rather than snapshotted too early.
 *
 * @description
 * OPTIONS. `component` and `zone` name the offender in the dev warning
 * (`OrigamCardHeader` / `prepend`); `prop` names the prop that fixes it
 * (`prependAriaLabel`). `active` is true when the zone is meant to behave as
 * a command — raw clickability for most consumers, clickability AND
 * not-a-link for the three `useLink` ones, whose `<a>` root forbids a
 * descendant tab stop. `label` is a GETTER, not a value, precisely so the
 * read stays inside the computed.
 ********************************************************/
export function useAccessibleCommand (options: {
    component: string
    zone: string
    prop: string
    active: Ref<boolean> | ComputedRef<boolean>
    label: () => string | undefined
}): ComputedRef<Record<string, unknown>> {
    const locale = useLocale(false)

    return computed(() => {
        if (!options.active.value) return {}

        const raw = options.label()
        const name = raw ? (locale ? locale.t(raw) : raw) : ''

        if (!name) {
            warnMissingAccessibleName(options.component, options.zone, options.prop)

            return {}
        }

        return {
            role: 'button',
            tabindex: 0,
            'aria-label': name
        }
    })
}
