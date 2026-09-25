/*********************************************************
 * probe-fixtures.const — why-origam-contrast
 *
 * @description
 * Fixed strings for the 6 components the /why-origam theming demo will show
 * (mission: matrice de contraste 6 composants × thèmes × modes). Shapes are
 * the plain default usage a landing-page demo would render — no invented
 * markup, only the props each component already documents.
 ********************************************************/

export const PROBE_LOREM = 'Aa Origam'

export const PROBE_INITIALS = 'AO'

/*********************************************************
 * PROBE_FOCUS_BACKDROPS — #924
 *
 * @description
 * The semantic surfaces a focusable component actually sits on. The focus
 * ring is painted OUTSIDE the component's border box with a POSITIVE
 * `outline-offset` (`OrigamBtn.vue`, `OrigamSelectionControl.vue`), so the
 * colour adjacent to the ring is the CONTAINER's background — "the page"
 * only when the component sits directly on the page.
 *
 * `page` carries no override on purpose: it measures whatever `<origam-app>`
 * paints for the active identity, which is what a real page shows.
 ********************************************************/
export const PROBE_FOCUS_BACKDROPS = [
    { name: 'page', style: undefined },
    { name: 'raised', style: { backgroundColor: 'var(--origam-color__surface---raised)' } },
    { name: 'overlay', style: { backgroundColor: 'var(--origam-color__surface---overlay)' } },
    { name: 'sunken', style: { backgroundColor: 'var(--origam-color__surface---sunken)' } },
    { name: 'primary-aplat', style: { backgroundColor: 'var(--origam-color__action--primary---bg)' } },
    { name: 'danger-subtle', style: { backgroundColor: 'var(--origam-color__feedback--danger---bgSubtle)' } }
] as const
