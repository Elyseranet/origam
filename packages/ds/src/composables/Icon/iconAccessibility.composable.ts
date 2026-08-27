import { computed, useAttrs, watchEffect } from 'vue'

/*********************************************************
 * useIconAccessibility
 *
 * @description
 * ⛔ issue #427 — shared `aria-hidden` / `role` contract for every icon
 * leaf (`OrigamIcon`, `OrigamClassIcon`, `OrigamComponentIcon`,
 * `OrigamLigatureIcon`). A glyph is decorative by default
 * (`aria-hidden="true"`, no `role`) — the moment a consumer attaches a
 * click handler it becomes an interactive control
 * (`aria-hidden="false"`, `role="button"`), matching the semantics an
 * icon-only button needs.
 *
 * @description
 * "No ARIA is better than bad ARIA" — a `role="button"` with no
 * accessible name is worse than no role at all: it promises a control
 * a screen reader user cannot identify. This hook does not fabricate a
 * label (a guessed "icon button" string would itself be bad ARIA); it
 * surfaces the gap as a dev-time warning when the consumer attached a
 * click handler but supplied neither `aria-label` nor
 * `aria-labelledby`, mirroring the same defect already found on
 * `OrigamFileFieldListItem` (#418).
 *
 * @description
 * Reads `$attrs` only (`onClick`, `aria-label`, `aria-labelledby`) —
 * never a themable prop — so this carries no ADR-005 lazy-read
 * obligation. `useAttrs()` is safe to call from within a composable:
 * it resolves against whichever component is currently mid-`setup()`,
 * regardless of how many function calls deep it's invoked from.
 ********************************************************/
export function useIconAccessibility () {
    const attrs = useAttrs()

    const isClickable = computed(() => !!attrs.onClick)
    const ariaHidden = computed(() => !isClickable.value)
    const role = computed(() => isClickable.value ? 'button' : undefined)
    const hasAccessibleName = computed(() => !!(attrs['aria-label'] || attrs['aria-labelledby']))

    if (import.meta.env?.DEV) {
        watchEffect(() => {
            if (isClickable.value && !hasAccessibleName.value) {
                console.warn('[Origam] Icon rendered as a clickable control (role="button") with no accessible name — pass aria-label or aria-labelledby.')
            }
        })
    }

    return { isClickable, ariaHidden, role, hasAccessibleName }
}
