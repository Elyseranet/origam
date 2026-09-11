import { computed, useAttrs, watchEffect } from 'vue'

/*********************************************************
 * useIconAccessibility
 *
 * @description
 * ⛔ issue #427 / #653 — shared accessibility contract for every icon leaf
 * (`OrigamIcon`, `OrigamClassIcon`, `OrigamComponentIcon`,
 * `OrigamLigatureIcon`). A glyph is decorative by default
 * (`aria-hidden="true"`).
 *
 * @description
 * ⛔ issue #653 — this hook used to also set `role="button"` the moment a
 * `@click` listener was attached, and briefly grew a typed `clickable`
 * prop + a `vue-tsc`-enforced discriminated union
 * (`IAccessibleClickableProps`) to force an accessible name alongside it.
 * BOTH were removed:
 * - Zero components across the whole repo (DS, stories, docs, marketing)
 *   ever passed `clickable` — constraining an API nobody used just delays
 *   the real fix.
 * - `role="button"` was measured (not assumed) to be actively harmful:
 *   the icon family sets NO `tabindex` and NO keydown handler anywhere,
 *   so the element was announced as an interactive control a keyboard or
 *   switch-device user could never reach (`Tab` never lands on it) or
 *   activate (`Enter` / `Space` do nothing) — a WCAG 2.1.1 (Keyboard)
 *   violation, not a defensible ARIA fallback.
 * - Compared against `OrigamCard` (#392), the DS's own precedent for
 *   `role="button"` on a non-native element: Card pairs the role with
 *   `tabindex="0"` AND a keydown handler, and does so ONLY because its
 *   content model makes a native `<button>` illegal (Card renders flow
 *   content a `<button>` cannot legally contain). `OrigamIcon` has no
 *   such constraint — `OrigamBtn`'s icon-only mode (a REAL `<button>`,
 *   full keyboard support for free) is always available, so reproducing
 *   Card's tabindex+keydown machinery here would just duplicate `OrigamBtn`
 *   instead of removing the anti-pattern.
 *
 * @description
 * The DS's own rule already covered this: an interactive control is a
 * `<button>` or `<a href>` — "ARIA is a complement, never a replacement".
 * `<origam-icon @click="…">` remains POSSIBLE (nothing stops a consumer
 * attaching a plain DOM listener) but no longer announces itself as a
 * control it cannot behave as. This hook does not fabricate a label (a
 * guessed "icon button" string would itself be bad ARIA, see #622 — the
 * auto-label that overwrote a visible `<label for>`); it surfaces the
 * anti-pattern as a dev-time warning pointing at the real fix,
 * `origam-btn`, instead of asking for `aria-label` / `aria-labelledby`
 * on an element that was never going to be operable either way. See the
 * #653 ticket report for the full measurements, and #660 for
 * `OrigamSvgIcon`'s separate, still-open gap (never calls this hook at
 * all).
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
    const hasAccessibleName = computed(() => !!(attrs['aria-label'] || attrs['aria-labelledby']))

    if (import.meta.env?.DEV) {
        watchEffect(() => {
            if (isClickable.value && !hasAccessibleName.value) {
                console.warn('[Origam] A clickable icon is a button. Use <origam-btn icon="…" aria-label="…"/> instead of attaching @click directly to an icon — see OrigamBtn.md.')
            }
        })
    }

    return { isClickable, ariaHidden, hasAccessibleName }
}
