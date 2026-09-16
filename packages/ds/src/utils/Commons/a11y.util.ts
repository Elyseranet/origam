/*********************************************************
 * a11y.util — dev-time accessibility warnings
 *
 * @description
 * ⛔ issues #747 / #653 / #660. Same once-per-key, `import.meta.env.DEV`-gated
 * shape as `warnUnsupportedProp` / `warnDeprecatedEmit` (`color.util.ts`), but
 * filed here rather than grown as a fifth warning inside a colour utility —
 * these two say nothing about colour.
 *
 * Both warnings are SILENT in production builds. They exist to tell the
 * developer what to add, at the moment they can still add it; shipping the
 * string to an end user's console would help nobody.
 ********************************************************/

const _warnedCommandNameKeys = new Set<string>()

/*********************************************************
 * warnMissingAccessibleName
 *
 * @description
 * A zone the DS would have promoted to `role="button"` has no accessible
 * name, so `useAccessibleCommand` emitted no role and no tab stop. Names
 * the exact prop that restores it.
 ********************************************************/
export function warnMissingAccessibleName (
    component: string,
    zone: string,
    prop: string
): void {
    if (typeof console === 'undefined') return
    if (!import.meta.env?.DEV) return

    const key = `${component}::${zone}`
    if (_warnedCommandNameKeys.has(key)) return
    _warnedCommandNameKeys.add(key)

    console.warn(
        `[origam] <${component}> the "${zone}" zone has a click listener but no accessible name, ` +
        `so it is NOT exposed as a button and NOT reachable by keyboard — a screen reader would ` +
        `announce "button" and nothing else (WCAG 2.1 4.1.2). Set "${prop}" to an i18n key or a ` +
        'literal label to make it a real control.'
    )
}

const _warnedNativeCommandKeys = new Set<string>()

/*********************************************************
 * warnMissingNativeControlName
 *
 * @description
 * A NATIVE control (`<button>`, `<a href>`) renders with no text and no
 * `aria-label` / `aria-labelledby`. Unlike a `role="button"` the DS added
 * itself, this one cannot be withdrawn — the element IS a control. All the
 * DS can do is say so, loudly, in development.
 *
 * @description
 * No label is fabricated: a guessed string would silence axe while telling
 * the user nothing (#622 shipped exactly that once, an auto-label that
 * overwrote a visible `<label for>`).
 ********************************************************/
export function warnMissingNativeControlName (
    component: string,
    hint: string
): void {
    if (typeof console === 'undefined') return
    if (!import.meta.env?.DEV) return

    const key = `${component}::${hint}`
    if (_warnedNativeCommandKeys.has(key)) return
    _warnedNativeCommandKeys.add(key)

    console.warn(
        `[origam] <${component}> renders a control with no accessible name: ${hint}. ` +
        'Add aria-label (or aria-labelledby) — an unnamed button announces as "button" ' +
        'and nothing else (WCAG 2.1 4.1.2).'
    )
}
