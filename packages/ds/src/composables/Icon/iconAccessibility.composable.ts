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
 * ⛔ issue #653 — a typed `clickable` prop + a `vue-tsc`-enforced
 * discriminated union used to live here (`IAccessibleClickableProps`).
 * It was REMOVED, not shipped: zero components across the whole repo
 * (DS, stories, docs, marketing) ever passed `clickable`, and the DS's
 * own rule is that an interactive control is a `<button>` or `<a href>`
 * — "ARIA is a complement, never a replacement". Reaching for
 * `role="button"` on a plain glyph is exactly the pattern that rule
 * forbids, and `OrigamBtn`'s icon-only mode (`icon` prop, `tag: 'button'`
 * default → a REAL native button, full keyboard support for free) is the
 * correct replacement — not a constraint on an API nobody used. See the
 * #653 ticket report for the measurements that led here (a `vue-tsc`
 * limitation on union-typed props, and the zero-usage count), and #660
 * for `OrigamSvgIcon`'s separate, still-open gap (never calls this hook
 * at all).
 *
 * @description
 * The `$attrs.onClick`-driven path below still exists and is
 * DELIBERATELY UNCHANGED by that removal: `<origam-icon @click="…">`
 * remains possible (nothing stops a consumer attaching a plain DOM
 * listener), so `role="button"` / `aria-hidden="false"` still apply
 * when it is. This hook does not fabricate a label (a guessed "icon
 * button" string would itself be bad ARIA, see #622 — the auto-label
 * that overwrote a visible `<label for>`); it surfaces the gap as a
 * dev-time warning that now points at the real fix, `origam-btn`,
 * instead of just asking for `aria-label` / `aria-labelledby` on an
 * element that has neither native keyboard support nor a native role.
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
                console.warn('[Origam] A clickable icon is a button. Use <origam-btn icon="…" aria-label="…"/> instead of attaching @click directly to an icon — see OrigamBtn.md.')
            }
        })
    }

    return { isClickable, ariaHidden, role, hasAccessibleName }
}
