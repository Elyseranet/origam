import { computed } from 'vue'

import type { ITypographyProps } from '../../interfaces'

/**
 * useTypography — cross-cutting typography surface, the font counterpart of
 * `useMargin` / `useBorder` / `useColor`. Reads the five `ITypographyProps`
 * and, for every prop the consumer set, emits an inline custom property that
 * re-points the component's own font variable at the matching primitive
 * token. Unset props emit nothing, so the theme value stays in control.
 *
 * Inline-styles ONLY (no utility classes). There is no `.origam--font-*`
 * family in `assets/css/tokens/origam-utilities.css`, so — per the
 * classes-first contract — we do not invent classes here. When/if Style
 * Dictionary starts emitting font utilities, add a `typographyClasses`
 * computed mirroring `useBorder`; until then a single `typographyStyles`
 * return is the honest shape.
 *
 * `typographyStyles` is a single flat `{ '--var': 'value' }` object (or `null`
 * when nothing is set), NOT an array of objects. Both consumption paths need
 * this: Vue's inline `:style` deep-flattens either form, but components that
 * route their styles through `useStyle()` (Btn) feed the value into a string
 * serialiser that only stringifies objects at the top level of the styles
 * array — a nested array would leak as `[object Object]`. A flat object drops
 * straight into both.
 *
 * @param props      the component props (must satisfy `ITypographyProps`).
 * @param varPrefix  the var namespace owned by the component, passed AS-IS.
 *                   For a block root that is the block name (`'btn'`,
 *                   `'title'`); for a BEM child surface it is the full child
 *                   namespace (`'card__text'`, `'picker__title'`) so the
 *                   emitted var matches the SCSS the component already reads.
 *
 * @example
 * const { typographyStyles } = useTypography(props, 'btn')
 * // fontSize="xl" → { '--origam-btn---font-size': 'var(--origam-font__size---xl)' }
 *
 * ------------------------------------------------------------------------
 * ROLLOUT RECIPE (batch-1) — `component → varPrefix → props with real effect`
 * ------------------------------------------------------------------------
 * A prop only has a VISIBLE effect when the component's SCSS already reads
 * the matching `--origam-{prefix}---{property}` var. Props outside that set
 * still type-check and emit their var, but paint nothing until the SCSS
 * consumes it — do NOT add SCSS rules to force an effect without flagging it.
 *
 *   Component   | varPrefix    | props with a real visual effect
 *   ------------|--------------|-----------------------------------------------
 *   Title (ref) | title        | fontFamily fontSize fontWeight lineHeight letterSpacing
 *   Btn   (ref) | btn          | fontSize fontWeight letterSpacing lineHeight
 *                              |   (fontFamily emits but Btn SCSS has no
 *                              |    font-family rule → no effect; document it)
 *   Label       | label        | fontSize fontWeight letterSpacing lineHeight
 *   Chip        | chip         | fontSize fontWeight
 *   Blockquote  | blockquote   | fontFamily fontSize fontWeight lineHeight
 *   Code        | code         | fontFamily fontSize lineHeight
 *   Kbd         | kbd          | fontFamily fontSize fontWeight
 *   Tooltip     | tooltip      | fontSize fontWeight lineHeight
 *                              |   (BEM child — bind on the `__content`
 *                              |    surface, NOT the teleport root)
 *   Avatar      | avatar       | fontSize fontWeight letterSpacing lineHeight
 *
 * Rollout steps per component (mirror the Title / Btn retrofit):
 *   1. `extends ITypographyProps` on the component interface.
 *   2. `const { typographyStyles } = useTypography(props, '<prefix>')`.
 *   3. Spread `typographyStyles.value` into the root (or BEM-surface)
 *      `:style` array — for floating/teleport components put it on the
 *      element that owns the visible surface, never the overlay root.
 *   4. Story: add a `<StoryGroup title="Typography">` with the shared
 *      `FONT_*_OPTIONS` selects (only the props that have a real effect).
 *   5. Doc: add the Props rows. Spec: ≥1 unit test per effective prop
 *      asserting the inline var, façon `OrigamTitle.spec.ts`.
 *
 * ------------------------------------------------------------------------
 * CONVENTION — generic var is the override channel (fontSize vs size/density)
 * ------------------------------------------------------------------------
 * `--origam-{prefix}---font-size` (no suffix) IS the channel through which the
 * `fontSize` prop overrides a component's own size/density variant. Therefore:
 *
 *   • NEVER pre-define the generic `--origam-{prefix}---font-size` as a token
 *     when per-size tokens (`--origam-{prefix}---font-size-{xs|sm|…}`) exist.
 *     If it is emitted, it always resolves and collapses every size variant to
 *     that one value (the Chip/Kbd bug). Keep per-size tokens; drop the generic.
 *   • Each `&--size-*` / `&--density-*` rule must read GENERIC-FIRST:
 *       font-size: var(--origam-{prefix}---font-size,
 *                      var(--origam-{prefix}---font-size-{size}, <literal default>));
 *     so `useTypography` (which sets the generic inline only when `fontSize` is
 *     passed) wins, and the per-size token drives when `fontSize` is unset.
 *   • If a component has per-size tokens but NO generic token (suffixed-only,
 *     e.g. Icon), there is nothing to delete — just add the generic-first read.
 *
 * Components touched by this convention so far: Chip, Kbd (fixed), Title (via
 * its density rules). EmptyState is the remaining suffixed-size case (BEM-child
 * prefixes). Icon is excluded from the typography surface (its `size` IS its
 * font-size).
 *
 * ------------------------------------------------------------------------
 * VAGUE-2 ROLLOUT TARGETS — `component → varPrefix → carrier surface`
 * ------------------------------------------------------------------------
 * Bind `typographyStyles` on the carrier surface; props with real effect are
 * those whose var the SCSS actually reads. (✓ = done.)
 *
 *   ROOT prefix (style on the component root):
 *     CardText           card-text          | Input        input
 *     ListSubheader ✓    list-subheader     | SystemBar    system-bar
 *     PickerTitle ✓      picker-title       | TextMask     text-mask (full surface)
 *     Messages ✓         messages
 *
 *   BEM-CHILD prefix (style on the named child element, NOT the root):
 *     Field        field__label            | Toolbar  toolbar__title
 *     ExpansionPanelHeader expansion-panel__header | Alert  alert__title
 *     Clipboard    clipboard__feedback     | Form     form__details
 *     Tab          tabs__item              | Bracket  bracket-double-label
 *     BracketRound bracket-round-title
 *     Pagination ✓ pagination--info  (carrier = .origam-pagination__info)
 *     Badge        badge__badge      (⚠ floating: the pill, not the overlay)
 *
 *   TELEPORT (style on the visible item, never the teleport root):
 *     SnackbarItem snackbar-item (+ __title/__message for fontWeight)
 *
 *   MULTI-SURFACE — pending a design decision (one prop → which surface?):
 *     CardHeader (__title/__subtitle), ListItem (__title/__subtitle),
 *     DataList (__title/__text), Table (root/__caption/__header-cell).
 *
 *   SUFFIXED-SIZE — needs the generic-first fix above, on its child prefixes:
 *     EmptyState (empty-state__title / empty-state__description).
 *
 *   OUT OF SCOPE: Icon (size IS font-size); BottomNav (inherits btn vars);
 *     Breadcrumb / Counter / Stepper / Timeline and pure containers (no own
 *     font var); Charts (SVG <text>, separate track).
 */
const TYPOGRAPHY_TOKEN_MAP = [
    ['fontFamily', 'font-family', 'font__family'],
    ['fontSize', 'font-size', 'font__size'],
    ['fontWeight', 'font-weight', 'font__weight'],
    ['lineHeight', 'line-height', 'font__lineHeight'],
    ['letterSpacing', 'letter-spacing', 'font__letterSpacing']
] as const satisfies ReadonlyArray<readonly [keyof ITypographyProps, string, string]>

/*********************************************************
 * useTypography
 ********************************************************/
export function useTypography (props: ITypographyProps, varPrefix: string) {

    const typographyStyles = computed(() => {
        const styles: Record<string, string> = {}

        for (const [propKey, cssProp, tokenGroup] of TYPOGRAPHY_TOKEN_MAP) {
            const value = props[propKey]

            if (value) {
                styles[`--origam-${varPrefix}---${cssProp}`] = `var(--origam-${tokenGroup}---${value})`
            }
        }

        return Object.keys(styles).length ? styles : null
    })

    return { typographyStyles }
}
