/**
 * Presentation config for the /changelog page.
 *
 * The release DATA itself is no longer here: it is generated from the
 * repository's CHANGELOG.md into `changelog-versions.const.ts` and simply
 * re-exported below, so the page keeps its single import. Maintaining it by
 * hand is what let the page stop at 2.6.0 while the DS shipped 2.17.1 (#740).
 *
 * The colour / icon maps below stay hand-maintained: they are design choices,
 * not changelog content.
 */
export { CHANGELOG_VERSIONS } from '~/consts/changelog-versions.const'

export const CHANGELOG_TYPE_COLOR = {
    unreleased: 'neutral',
    major: 'warning',
    minor: 'primary',
    patch: 'neutral'
} as const

export const CHANGELOG_HIGHLIGHT_COLOR = {
    added: 'success',
    changed: 'warning',
    fixed: 'secondary',
    deprecated: 'danger'
} as const

export const CHANGELOG_HIGHLIGHT_ICON = {
    added: 'mdi-plus-circle-outline',
    changed: 'mdi-pencil-circle-outline',
    fixed: 'mdi-wrench-outline',
    deprecated: 'mdi-alert-circle-outline'
} as const
