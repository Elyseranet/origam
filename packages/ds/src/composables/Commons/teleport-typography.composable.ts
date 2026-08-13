import { nextTick, ref, watch } from 'vue'

import type { Ref } from 'vue'

/**
 * useTeleportTypography — bridges the field's REAL typography across a
 * teleported surface (menu, picker, …).
 *
 * @description
 * Floating surfaces (`OrigamMenu` and everything built on it — Select's
 * option list, ColorPickerField's channel editor, DatePickerField's
 * calendar) are teleported out of the field's DOM subtree, to escape
 * `overflow` and stacking contexts. A CSS rule the consuming application
 * writes against the field — `.my-field * { font-size: 13px }`, a compact
 * form theme, a scaled container — therefore never reaches the popup: the
 * selector simply does not match nodes outside the field's subtree.
 *
 * Re-inheriting `font-size` on the teleported root is NOT enough on its
 * own, either. Descendant text that sizes itself with a `rem`-based token
 * (`var(--origam-list-item__title---font-size, 1rem)`,
 * `var(--origam-picker-title---font-size, .75rem)`, …) resolves `rem`
 * against the DOCUMENT ROOT, not the inherited value — it would keep the
 * root size whatever the teleported ancestor inherits.
 *
 * So this composable measures the typography that ACTUALLY WON on the
 * field when the surface opens (`getComputedStyle`, not the props — the
 * props can't see a consumer's own stylesheet) and hands back a plain
 * style object the caller republishes on the teleported content root as
 * both generic CSS (`font-family` / `font-size` / `letter-spacing`, for
 * whatever inherits normally) AND the specific component tokens the
 * surface's own `rem`-sized text reads (via `extraVars`), so the two
 * layers of the bug are closed together. Originates from `OrigamSelect`
 * (commit `8354407c`) — extracted here so `OrigamColorPickerField` /
 * `OrigamDatePickerField` don't reimplement the same measurement.
 *
 * Measured on `.origam-field` (NOT the raw `<input>`), which is the one
 * element every `<origam-text-field>`-based field renders with a plain,
 * unconditional `font-size: 16px` (no prop/token influences it — see
 * `OrigamField`'s own SCSS). The raw `<input>` is NOT a safe measurement
 * point: on `OrigamColorPickerField` / `OrigamDatePickerField` it is
 * deliberately taken out of flow and carries none of `OrigamInput`'s
 * classes, so it renders at the BROWSER's own default control font
 * (13.3333px in Chrome) rather than the design system's — a value with
 * nothing to do with the field's real typography.
 *
 * That same "16px, unconditionally" fact is also what keeps this bridge a
 * true no-op absent a consumer override: `neutralFontSize` (default
 * `'16px'`) is the value `.origam-field` would show with zero consuming-app
 * CSS involved. When the measured size still equals it, nothing diverges —
 * `typographyStyles` stays empty and every surface keeps its OWN historical
 * default (`.75rem` list-item text, `.85rem` calendar cells, …), instead of
 * being forced to 16px on every open. Only an ACTUAL divergence (a
 * consumer's stylesheet, a different field wrapper with its own baseline)
 * republishes the tokens.
 *
 * @param fieldRef  ref to the field sub-component (e.g. the wrapped
 *                  `<origam-text-field>`). Its `$el` is the DOM root the
 *                  typography is measured FROM.
 * @param isOpen    ref toggled when the teleported surface opens; the
 *                  measurement re-runs on every open (the consumer's CSS
 *                  can change between opens — a live theme switch, a
 *                  responsive breakpoint, …).
 * @param extraVars given the resolved `font-size`, returns the extra
 *                  `{ '--origam-…---font-size': value }` entries for the
 *                  specific tokens the surface's own `rem`-sized text
 *                  reads. Read the surface's SCSS before adding one —
 *                  republishing a var nothing consumes is a no-op.
 * @param measureSelector  selector for the element the typography is read
 *                  from, resolved within `fieldRef`'s root (defaults to
 *                  `'.origam-field'`). Falls back to the root itself when
 *                  no match is found.
 * @param neutralFontSize  the `measureSelector` element's OWN unstyled
 *                  `font-size` (defaults to `'16px'`, `.origam-field`'s
 *                  literal default). When the measured value still equals
 *                  this, the bridge is a no-op for this open — see above.
 *
 * @example
 * const { typographyStyles } = useTeleportTypography(origamTextFieldRef, menu, (fontSize) => ({
 *     '--origam-list-item__title---font-size': fontSize,
 *     '--origam-list-item__subtitle---font-size': `calc(${ fontSize } * 0.875)`
 * }))
 * // …
 * contentProps: { style: [typographyStyles.value, consumerContentProps.style] }
 */
export function useTeleportTypography (
    fieldRef: Ref<{ $el?: HTMLElement } | undefined>,
    isOpen: Ref<boolean>,
    extraVars: (fontSize: string) => Record<string, string>,
    measureSelector = '.origam-field',
    neutralFontSize = '16px'
) {
    const typographyStyles = ref<Record<string, string>>({})

    const fieldElement = () => {
        const root = fieldRef.value?.$el

        if (!root || typeof root.querySelector !== 'function') return undefined

        return (root.querySelector(measureSelector) ?? root) as HTMLElement
    }

    const sync = () => {
        const el = fieldElement()

        if (!el || typeof window === 'undefined') return

        const styles = window.getComputedStyle(el)
        const fontSize = styles.fontSize

        if (!fontSize) return

        // Nothing diverges from the design system's own unstyled baseline —
        // leave every surface at its OWN historical default rather than
        // forcing it to the neutral size on every open.
        if (fontSize === neutralFontSize) {
            typographyStyles.value = {}

            return
        }

        typographyStyles.value = {
            'font-family': styles.fontFamily,
            'font-size': fontSize,
            'letter-spacing': styles.letterSpacing,
            ...extraVars(fontSize)
        }
    }

    watch(isOpen, (open) => {
        if (open) nextTick(sync)
    })

    return { typographyStyles }
}
