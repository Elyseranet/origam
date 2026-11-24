/*********************************************************
 * INNER_ZONE_LABELS
 *
 * @description
 * #1156 — the preview listens to every declared emit (the event log). A
 * listener on `click:appendInner` / `click:prependInner` makes the Field zone a
 * command that needs a name; without one the DS warns and refuses the role.
 * Each entry gives the prop that names the zone and its i18n key. Applied to
 * the PREVIEW only — never written to the scene or the generated code.
 ********************************************************/
export const INNER_ZONE_LABELS = [
    { event: 'click:appendInner', prop: 'appendInnerAriaLabel', key: 'playground.preview.append_inner_label', fallback: 'End icon' },
    { event: 'click:prependInner', prop: 'prependInnerAriaLabel', key: 'playground.preview.prepend_inner_label', fallback: 'Start icon' }
] as const
