/*********************************************************
 * a11y.util — dev-time accessibility warnings
 *
 * @description
 * ⛔ issues #747 / #653 / #660. Same once-per-key, `import.meta.env.DEV`-gated
 * shape as `warnUnsupportedProp` (`color.util.ts`), but filed here rather
 * than grown as a fifth warning inside a colour utility — these two say
 * nothing about colour.
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

const _warnedLandmarkKeys = new Set<string>()

/*********************************************************
 * warnMissingLandmarkName
 *
 * @description
 * ⛔ issue #781 — same rule as `warnMissingAccessibleName`, one rung up: a
 * LANDMARK the DS would have declared has no accessible name, so the DS
 * declared nothing.
 *
 * @description
 * `region` is one of the few roles whose ARIA definition marks the
 * accessible name as REQUIRED (WAI-ARIA 1.2, role `region`: "Name Required:
 * True"), and HTML-AAM says the same thing from the other side — a
 * `<section>` maps to `region` only when it is named, and to `generic`
 * otherwise. An unnamed `role="region"` is therefore not a landmark a user
 * can usefully navigate to; it is an authoring error that puts a nameless
 * entry in the landmark list. `aria-roledescription` riding along makes it
 * worse, not better: it replaces the role name a screen reader would have
 * announced with a description attached to nothing.
 *
 * @description
 * No name is fabricated. "Carousel" as a default label would name every
 * carousel on a page identically — exactly the defect `OrigamCode`'s
 * scroller was corrected for (five homonymous regions in one landmark
 * list). The consumer holds the only string that distinguishes them.
 ********************************************************/
export function warnMissingLandmarkName (
    component: string,
    role: string,
    roleDescription: string
): void {
    if (typeof console === 'undefined') return
    if (!import.meta.env?.DEV) return

    const key = `${component}::${role}`
    if (_warnedLandmarkKeys.has(key)) return
    _warnedLandmarkKeys.add(key)

    console.warn(
        `[origam] <${component}> has no accessible name, so it does NOT declare ` +
        `role="${role}" / aria-roledescription="${roleDescription}". An unnamed "${role}" is ` +
        'not a navigable landmark (WAI-ARIA 1.2 — name required), and a roledescription with ' +
        `no name describes nothing. Pass aria-label (or aria-labelledby) to <${component}> — ` +
        'it falls through to the root element.'
    )
}
