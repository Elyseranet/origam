import { CUSTOM_BORDER_RADIUS_REGEX, PREDEFINED_ROUNDED } from '../../consts/Commons/rounded.const'
import { NAMED_RADIUS_TOKEN, SPACING_SCALE_STEPS, UTILITY_RADIUS_FALLBACK } from '../../consts/Commons/spacing.const'

import type { TRounded } from '../../types/Commons/rounded.type'

import { convertToUnit } from './commons.util'

/**
 * Bare integer written as a string (`"4"`) — the opt-in form for the
 * design-system spacing ladder. Anchored, digits only: `"4px"` is NOT a
 * scale step (it is already a CSS length and passes through verbatim).
 */
const SCALE_STEP_REGEX = /^[0-9]+$/

/**
 * Resolve ONE directional spacing value (`paddingTop`, `marginInline`, …)
 * into a single CSS value, or `null` when nothing should be emitted.
 *
 * The accepted vocabulary is deliberately the SAME one the `padding` /
 * `margin` shorthands already accept, so a consumer never has to learn a
 * second grammar to address one side:
 *
 * | input              | output                          | why |
 * |--------------------|---------------------------------|-----|
 * | `8` (number)       | `"8px"`                         | legacy raw-pixel contract, via `convertToUnit` |
 * | `"4"` (string)     | `"var(--origam-space---4)"`     | design-token rung — mirrors `padding="4"` → `.origam--p-4` |
 * | `"8px"` / `"1.5rem"` / `"50%"` | verbatim            | plain CSS length |
 * | `"var(…)"` / `"calc(…)"` | verbatim                  | escape hatch, mirrors `useDimension` |
 * | `"auto"`           | verbatim                        | valid on `margin-*` |
 * | `true` / `false` / `""` / nullish | `null`           | see the boolean note below |
 *
 * ⚠️ **A bare integer OUTSIDE the ladder emits nothing.** `"7"` resolves
 * to no declaration rather than a bogus `var(--origam-space---7)` that the
 * browser would drop anyway. This matches what `padding="7"` already does
 * (no utility class exists, and `PADDING_REGEX` rejects a unit-less value),
 * so the shorthand and the directionals stay consistent.
 *
 * ⚠️ **`true` is a no-op on a directional prop.** The `boolean` member of
 * the prop type exists because the directionals copied the shorthand's
 * signature, where `true` emits the legacy `${name}--padded` / `--marged`
 * class. There is no per-side equivalent of that class, and — verified
 * across `packages/ds/src/components` — NO component defines a rule for
 * `--padded` / `--marged` in the first place, so there is no grounded
 * default width to borrow. Emitting an arbitrary rung here would be an
 * invention; the value forms above are the supported surface.
 */
export function resolveSpacingValue (value: boolean | number | string | null | undefined): string | null {
    if (value == null || typeof value === 'boolean') return null

    if (typeof value === 'number') return convertToUnit(value) ?? null

    const trimmed = value.trim()

    if (trimmed === '') return null

    if (SCALE_STEP_REGEX.test(trimmed)) {
        return SPACING_SCALE_STEPS.includes(trimmed) ? `var(--origam-space---${trimmed})` : null
    }

    return trimmed
}

/**
 * Resolve ONE per-corner radius value (`roundedTopLeft`, …) into a single
 * CSS value, or `null` when nothing should be emitted.
 *
 * Accepts the exact same vocabulary as the `rounded` shorthand, resolved
 * through the same shared tables, so `roundedTopLeft="large"` and
 * `rounded="large"` can never drift apart:
 *
 * | input                      | output                                   |
 * |----------------------------|------------------------------------------|
 * | `8` (number)               | `"8px"`                                  |
 * | `"md"` (utility rung)      | `"var(--origam-radius---md, 8px)"`       |
 * | `"large"` (named variant)  | `"var(--origam-radius---xl, 16px)"`      |
 * | `"8px"` / `"var(…)"` / `"calc(…)"` | verbatim                         |
 * | `"shaped"` / `"shaped-invert"` | `null` — corner-asymmetric, owned by component SCSS |
 * | `true` / `false` / `""` / nullish | `null`                            |
 *
 * `true` is a no-op for the same reason as {@link resolveSpacingValue}:
 * on the shorthand it selects the legacy `${name}--rounded` class, which
 * has no per-corner counterpart.
 */
export function resolveRoundedCornerValue (value: boolean | number | string | null | undefined): string | null {
    if (value == null || typeof value === 'boolean') return null

    if (typeof value === 'number') return convertToUnit(value) ?? null

    const trimmed = value.trim()

    if (trimmed === '') return null

    if (UTILITY_RADIUS_FALLBACK[trimmed]) {
        return `var(--origam-radius---${trimmed}, ${UTILITY_RADIUS_FALLBACK[trimmed]})`
    }

    // `none` maps to the literal `0` fallback above only when the token is
    // absent; the lookup returns '0' which is falsy-safe here because it is
    // a non-empty string. Named variants come next.
    if (PREDEFINED_ROUNDED.includes(trimmed as TRounded)) {
        return NAMED_RADIUS_TOKEN[trimmed] ?? null
    }

    if (CUSTOM_BORDER_RADIUS_REGEX.test(trimmed)) return trimmed

    return null
}
