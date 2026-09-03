// Unit tests for `useTeleportTypography`.
//
// Scope of this file (C8 — zero hardcoded string / magic number): the two
// default parameters the composable used to inline as literals
// (`'.origam-field'` and `'16px'`) now come from
// `consts/Commons/teleport-typography.const.ts`. These tests pin the
// OBSERVABLE consequence of each — the element the typography is measured
// from, and the no-op threshold — so a silent drift between the const and
// the behaviour fails here rather than in a browser.
//
// jsdom notes:
// - `getComputedStyle(el).fontSize` resolves an INLINE declaration
//   (`el.style.fontSize = '13px'`) correctly. It would NOT resolve a
//   `var()` reference coming from a stylesheet — see the CLAUDE.md section
//   on that trap. Every measurement below is therefore set inline.
// - `sync()` runs inside `nextTick` on the `isOpen` watcher, so each open
//   needs two flushes: one for the watcher, one for the queued `nextTick`.

import { nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'

import { useTeleportTypography } from '@origam/composables/Commons/teleport-typography.composable'
import {
    TELEPORT_TYPOGRAPHY_MEASURE_SELECTOR,
    TELEPORT_TYPOGRAPHY_NEUTRAL_FONT_SIZE
} from '@origam/consts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EXTRA_VAR = '--origam-list-item__title---font-size'

/**
 * Builds a field root holding a `.origam-field` descendant, mirroring what
 * `<origam-text-field>` renders. `rootFontSize` / `fieldFontSize` are set
 * INLINE so jsdom actually resolves them.
 *
 * The class and the sizes below are written as LITERALS on purpose:
 * deriving them from the consts under test would make this file
 * self-consistent and blind to the very values it is meant to pin.
 */
function buildField (rootFontSize: string, fieldFontSize: string) {
    const root = document.createElement('div')
    root.style.fontSize = rootFontSize

    const field = document.createElement('div')
    field.className = 'origam-field'
    field.style.fontSize = fieldFontSize

    root.appendChild(field)
    document.body.appendChild(root)

    return {root, field}
}

async function open (isOpen: ReturnType<typeof ref<boolean>>) {
    isOpen.value = true
    await nextTick()
    await nextTick()
}

beforeEach(() => {
    document.body.innerHTML = ''
})

// ---------------------------------------------------------------------------

describe('useTeleportTypography — the extracted defaults hold their contract', () => {
    // These two values are not free parameters: `.origam-field` is the
    // element `OrigamField` renders, and 16px is the `font-size` its own
    // SCSS gives it unconditionally. Changing either const without
    // changing that SCSS silently turns the bridge into a no-op (or into
    // a permanent override). Pinned as literals for that reason.
    it('measures `.origam-field`', () => {
        expect(TELEPORT_TYPOGRAPHY_MEASURE_SELECTOR).toBe('.origam-field')
    })

    it('treats 16px as the neutral baseline', () => {
        expect(TELEPORT_TYPOGRAPHY_NEUTRAL_FONT_SIZE).toBe('16px')
    })
})

describe('useTeleportTypography — default measure selector', () => {
    it('measures the `.origam-field` descendant, not the field root', async () => {
        const {root} = buildField('30px', '13px')
        const fieldRef = ref<{ $el?: HTMLElement }>({$el: root})
        const isOpen = ref(false)

        const {typographyStyles} = useTeleportTypography(
            fieldRef,
            isOpen,
            (fontSize) => ({[EXTRA_VAR]: fontSize})
        )

        await open(isOpen)

        // 13px is the DESCENDANT's size; 30px is the root's. Reading the
        // root would publish the wrong one.
        expect(typographyStyles.value['font-size']).toBe('13px')
        expect(typographyStyles.value[EXTRA_VAR]).toBe('13px')
    })

    it('falls back to the root when no element matches the selector', async () => {
        const root = document.createElement('div')
        root.style.fontSize = '13px'
        document.body.appendChild(root)

        const fieldRef = ref<{ $el?: HTMLElement }>({$el: root})
        const isOpen = ref(false)

        const {typographyStyles} = useTeleportTypography(
            fieldRef,
            isOpen,
            (fontSize) => ({[EXTRA_VAR]: fontSize})
        )

        await open(isOpen)

        expect(typographyStyles.value['font-size']).toBe('13px')
    })

    it('honours an explicit selector passed by the caller', async () => {
        const root = document.createElement('div')
        root.style.fontSize = '30px'

        const custom = document.createElement('span')
        custom.className = 'my-measure-point'
        custom.style.fontSize = '11px'
        root.appendChild(custom)
        document.body.appendChild(root)

        const fieldRef = ref<{ $el?: HTMLElement }>({$el: root})
        const isOpen = ref(false)

        const {typographyStyles} = useTeleportTypography(
            fieldRef,
            isOpen,
            (fontSize) => ({[EXTRA_VAR]: fontSize}),
            '.my-measure-point'
        )

        await open(isOpen)

        expect(typographyStyles.value['font-size']).toBe('11px')
    })
})

describe('useTeleportTypography — neutral font size is a no-op threshold', () => {
    it('publishes nothing when the measured size equals the neutral default', async () => {
        const {root} = buildField('16px', '16px')
        const fieldRef = ref<{ $el?: HTMLElement }>({$el: root})
        const isOpen = ref(false)

        const {typographyStyles} = useTeleportTypography(
            fieldRef,
            isOpen,
            (fontSize) => ({[EXTRA_VAR]: fontSize})
        )

        await open(isOpen)

        expect(typographyStyles.value).toEqual({})
    })

    it('publishes when the measured size diverges from the neutral default', async () => {
        const {root} = buildField('16px', '13px')
        const fieldRef = ref<{ $el?: HTMLElement }>({$el: root})
        const isOpen = ref(false)

        const {typographyStyles} = useTeleportTypography(
            fieldRef,
            isOpen,
            (fontSize) => ({[EXTRA_VAR]: fontSize})
        )

        await open(isOpen)

        expect(Object.keys(typographyStyles.value)).toEqual(
            expect.arrayContaining(['font-family', 'font-size', 'letter-spacing', EXTRA_VAR])
        )
    })

    it('honours an explicit neutral size passed by the caller', async () => {
        const {root} = buildField('16px', '13px')
        const fieldRef = ref<{ $el?: HTMLElement }>({$el: root})
        const isOpen = ref(false)

        const {typographyStyles} = useTeleportTypography(
            fieldRef,
            isOpen,
            (fontSize) => ({[EXTRA_VAR]: fontSize}),
            '.origam-field',
            '13px'
        )

        await open(isOpen)

        // 13px is now the caller's own baseline — nothing diverges.
        expect(typographyStyles.value).toEqual({})
    })
})

describe('useTeleportTypography — guards', () => {
    it('stays empty while the field ref is unset', async () => {
        const fieldRef = ref<{ $el?: HTMLElement } | undefined>(undefined)
        const isOpen = ref(false)

        const {typographyStyles} = useTeleportTypography(
            fieldRef,
            isOpen,
            (fontSize) => ({[EXTRA_VAR]: fontSize})
        )

        await open(isOpen)

        expect(typographyStyles.value).toEqual({})
    })

    it('does not measure on close', async () => {
        const {root} = buildField('16px', '13px')
        const fieldRef = ref<{ $el?: HTMLElement }>({$el: root})
        const isOpen = ref(true)

        const {typographyStyles} = useTeleportTypography(
            fieldRef,
            isOpen,
            (fontSize) => ({[EXTRA_VAR]: fontSize})
        )

        isOpen.value = false
        await nextTick()
        await nextTick()

        expect(typographyStyles.value).toEqual({})
    })
})
