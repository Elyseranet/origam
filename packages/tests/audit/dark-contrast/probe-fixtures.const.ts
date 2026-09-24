/*********************************************************
 * probe-fixtures.const
 *
 * @description
 * Fixtures for the 30 components that wire `v-contrast`. Shapes copied from
 * the matching stories so the harness renders what the DS really renders, not
 * an invented markup (CLAUDE.md: "a probe element you build yourself is not
 * the element Vue rendered").
 ********************************************************/

export const PROBE_LOREM = 'Aa Origam'

export const PROBE_KBD_KEY = 'Ctrl'

export const PROBE_BADGE_CONTENT = '7'

export const PROBE_NAV_ITEMS = [
    { text: 'Home', value: 'home' },
    { text: 'Search', value: 'search' },
    { text: 'Profile', value: 'profile' }
]

export const PROBE_CRUMB_ITEMS = [
    { title: 'Home', href: '/' },
    { title: 'Section', href: '/section' },
    { title: 'Current' }
]

export const PROBE_DATA_ITEMS = [
    { title: { text: 'Status' }, text: [{ text: 'Active' }] },
    { title: { text: 'Owner' }, text: [{ text: 'Alice Dupont' }] }
]

export const PROBE_LIST_ITEMS = [
    { type: 'subheader', title: 'Fruits' },
    { type: 'item', title: 'Apple' },
    { type: 'item', title: 'Banana' }
]

export const PROBE_STEP_ITEMS = [
    { title: 'Account', subtitle: 'Email & password' },
    { title: 'Profile', subtitle: 'Personal info' }
]

export const PROBE_PANEL_ITEMS = [
    { title: 'Item A', content: 'Content for item A' },
    { title: 'Item B', content: 'Content for item B' }
]

export const PROBE_TAB_VALUES = [0, 1, 2]
