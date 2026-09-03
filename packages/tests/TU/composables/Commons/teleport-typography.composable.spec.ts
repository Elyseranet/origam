// useTeleportTypography (packages/ds/src/composables/Commons/teleport-typography.composable.ts)
// bridges a field's REAL typography (whatever a consumer's own stylesheet
// made it) across to a teleported surface (Select's option list,
// ColorPickerField's editor, DatePickerField's calendar, …) — see the long
// header comment on the composable itself for the two-layer bug this
// closes (rem tokens resolve against the DOCUMENT root once teleported, and
// a consumer's selector never reaches the teleported subtree at all).
//
// C5 audit (#classeur composables): flagged `defaut` — zero TU coverage.
//
// Two traps this spec is deliberately built to avoid:
//   1. jsdom `getComputedStyle` never resolves `var(...)` — see CLAUDE.md
//      "getComputedStyle under jsdom NEVER resolves var()". We sidestep it
//      entirely: every fixture sets `el.style.fontSize = '13px'` etc.
//      directly (an INLINE declaration, no custom-property indirection),
//      which the same section documents as resolving correctly under jsdom.
//   2. The composable calls bare `watch()` / `nextTick()` with NO
//      `getCurrentInstance()` anywhere in it — it does not need a mounted
//      Vue component to run, so these specs call it directly without
//      `@vue/test-utils`. `nextTick()` must still be awaited twice: once
//      for the (default `flush: 'pre'`) watcher callback to run, and once
//      more for the `nextTick(sync)` it schedules internally.

import { nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { useTeleportTypography } from '@origam/composables/Commons/teleport-typography.composable'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a `.origam-field`-bearing DOM subtree with literal (non-var)
 * inline typography, wired as the `fieldRef.$el` the composable measures
 * FROM (via `measureSelector`, `.origam-field` by default — NOT the root).
 */
function makeField (opts: {
    fontSize?: string
    fontFamily?: string
    letterSpacing?: string
    selectorClass?: string
} = {}) {
    const root = document.createElement('div')
    const field = document.createElement('div')
    field.className = opts.selectorClass ?? 'origam-field'
    field.style.fontSize = opts.fontSize ?? '16px'
    field.style.fontFamily = opts.fontFamily ?? 'Arial'
    field.style.letterSpacing = opts.letterSpacing ?? 'normal'
    root.appendChild(field)
    document.body.appendChild(root)

    return { root, field }
}

async function flush () {
    // Two ticks: one for the `watch` callback (flush: 'pre'), one more for
    // the `nextTick(sync)` scheduled from inside it.
    await nextTick()
    await nextTick()
}

// ---------------------------------------------------------------------------
// No-op when the measured size matches the neutral default (16px)
// ---------------------------------------------------------------------------

describe('useTeleportTypography — neutral baseline (no consumer override)', () => {
    it('stays empty when the measured font-size equals the default neutralFontSize (16px)', async () => {
        const { root } = makeField({ fontSize: '16px' })
        const fieldRef = ref({ $el: root })
        const isOpen = ref(false)
        const extraVars = vi.fn(() => ({}))

        const { typographyStyles } = useTeleportTypography(fieldRef, isOpen, extraVars)

        isOpen.value = true
        await flush()

        expect(typographyStyles.value).toEqual({})
        expect(extraVars).not.toHaveBeenCalled()
    })

    it('respects a custom neutralFontSize argument (no-op when it matches, not the 16px literal)', async () => {
        const { root } = makeField({ fontSize: '13px' })
        const fieldRef = ref({ $el: root })
        const isOpen = ref(false)
        const extraVars = vi.fn(() => ({}))

        const { typographyStyles } = useTeleportTypography(
            fieldRef, isOpen, extraVars, '.origam-field', '13px'
        )

        isOpen.value = true
        await flush()

        expect(typographyStyles.value).toEqual({})
    })
})

// ---------------------------------------------------------------------------
// A real divergence republishes font-family / font-size / letter-spacing
// ---------------------------------------------------------------------------

describe('useTeleportTypography — consumer override republished', () => {
    it('a font-size that diverges from 16px republishes generic CSS + extraVars', async () => {
        const { root } = makeField({ fontSize: '13px', fontFamily: 'Georgia', letterSpacing: '0.5px' })
        const fieldRef = ref({ $el: root })
        const isOpen = ref(false)
        const extraVars = vi.fn((fontSize: string) => ({
            '--origam-list-item__title---font-size': fontSize
        }))

        const { typographyStyles } = useTeleportTypography(fieldRef, isOpen, extraVars)

        isOpen.value = true
        await flush()

        expect(typographyStyles.value).toEqual({
            'font-family': 'Georgia',
            'font-size': '13px',
            'letter-spacing': '0.5px',
            '--origam-list-item__title---font-size': '13px'
        })
        expect(extraVars).toHaveBeenCalledWith('13px')
    })

    it('measures the .origam-field descendant, not the root element', async () => {
        // Root itself carries a DIFFERENT (browser-default-like) font-size —
        // proves the selector, not the root, drives the measurement.
        const root = document.createElement('div')
        root.style.fontSize = '20px'
        const field = document.createElement('div')
        field.className = 'origam-field'
        field.style.fontSize = '13px'
        root.appendChild(field)
        document.body.appendChild(root)

        const fieldRef = ref({ $el: root })
        const isOpen = ref(false)

        const { typographyStyles } = useTeleportTypography(fieldRef, isOpen, () => ({}))

        isOpen.value = true
        await flush()

        expect(typographyStyles.value['font-size']).toBe('13px')
    })

    it('falls back to the root element when measureSelector matches nothing', async () => {
        const root = document.createElement('div')
        root.style.fontSize = '13px'
        document.body.appendChild(root)
        // No `.origam-field` descendant at all.

        const fieldRef = ref({ $el: root })
        const isOpen = ref(false)

        const { typographyStyles } = useTeleportTypography(fieldRef, isOpen, () => ({}))

        isOpen.value = true
        await flush()

        expect(typographyStyles.value['font-size']).toBe('13px')
    })

    it('a custom measureSelector is honoured', async () => {
        const { root, field } = makeField({ fontSize: '16px', selectorClass: 'my-custom-target' })
        field.style.fontSize = '11px'
        const fieldRef = ref({ $el: root })
        const isOpen = ref(false)

        const { typographyStyles } = useTeleportTypography(
            fieldRef, isOpen, () => ({}), '.my-custom-target'
        )

        isOpen.value = true
        await flush()

        expect(typographyStyles.value['font-size']).toBe('11px')
    })
})

// ---------------------------------------------------------------------------
// Re-measures on every open — a live theme/breakpoint switch must be seen
// ---------------------------------------------------------------------------

describe('useTeleportTypography — re-measures on every open', () => {
    it('does NOT re-measure while isOpen stays false, then measures on the rising edge', async () => {
        const { root, field } = makeField({ fontSize: '16px' })
        const fieldRef = ref({ $el: root })
        const isOpen = ref(false)

        const { typographyStyles } = useTeleportTypography(fieldRef, isOpen, () => ({}))

        // Mutate the field's font-size BEFORE ever opening — must not be
        // picked up until isOpen actually flips to true.
        field.style.fontSize = '13px'
        await flush()
        expect(typographyStyles.value).toEqual({})

        isOpen.value = true
        await flush()
        expect(typographyStyles.value['font-size']).toBe('13px')
    })

    it('a second open picks up a NEW divergence (consumer CSS / theme changed between opens)', async () => {
        const { root, field } = makeField({ fontSize: '13px' })
        const fieldRef = ref({ $el: root })
        const isOpen = ref(false)

        const { typographyStyles } = useTeleportTypography(fieldRef, isOpen, () => ({}))

        isOpen.value = true
        await flush()
        expect(typographyStyles.value['font-size']).toBe('13px')

        isOpen.value = false
        await flush()

        field.style.fontSize = '18px'
        isOpen.value = true
        await flush()
        expect(typographyStyles.value['font-size']).toBe('18px')
    })

    it('closing the surface does NOT clear a previously measured divergence', async () => {
        const { root } = makeField({ fontSize: '13px' })
        const fieldRef = ref({ $el: root })
        const isOpen = ref(false)

        const { typographyStyles } = useTeleportTypography(fieldRef, isOpen, () => ({}))

        isOpen.value = true
        await flush()
        expect(typographyStyles.value['font-size']).toBe('13px')

        isOpen.value = false
        await flush()
        expect(typographyStyles.value['font-size']).toBe('13px')
    })
})

// ---------------------------------------------------------------------------
// Defensive branches — missing field / non-DOM stub
// ---------------------------------------------------------------------------

describe('useTeleportTypography — defensive branches', () => {
    it('no-ops when fieldRef.value is undefined (nothing thrown, styles stay empty)', async () => {
        const fieldRef = ref<{ $el?: HTMLElement } | undefined>(undefined)
        const isOpen = ref(false)

        const { typographyStyles } = useTeleportTypography(fieldRef, isOpen, () => ({}))

        isOpen.value = true
        await flush()

        expect(typographyStyles.value).toEqual({})
    })

    it('no-ops when $el has no querySelector (e.g. a stub with no DOM behind it)', async () => {
        const fieldRef = ref<{ $el?: HTMLElement } | undefined>({ $el: {} as HTMLElement })
        const isOpen = ref(false)

        const { typographyStyles } = useTeleportTypography(fieldRef, isOpen, () => ({}))

        isOpen.value = true
        await flush()

        expect(typographyStyles.value).toEqual({})
    })
})
