// Unit tests for <OrigamField> — typography prop on the BEM child surface
// (ITypographyProps, narrowed to Pick<'fontSize'|'fontWeight'|'lineHeight'|
// 'letterSpacing'> — issue #501 removed `fontFamily`, the only one confirmed
// dead on every path).
//
// ⚠️ BEM-CHILD: typographyStyles is NOT spread into the field root styles.
// It is merged into `labelProps.style` and `floatingLabelProps.style` so
// `--origam-field__label---font-size` lands on the `.origam-field__label`
// element (both static and floating labels carry it).
//
// The SCSS reads `--origam-field__label---font-size` on the
// `&__label--floating` modifier (font-size of the animated floating label)
// AND the JS animation scale reads it via `getPropertyValue(...)`.
//
// ⛔ fontWeight / lineHeight / letterSpacing are NOT read via the
// `field__label` prefix, but they are NOT inert (issue #501 correction —
// this file previously asserted the opposite, which is why the ticket's
// static var-read scanner alone is not sufficient ground truth). `<OrigamField>`
// forwards its full prop set to the nested `<OrigamLabel>` via
// `origamLabelRef.value.filterProps(props, …)`; `OrigamLabel` has its OWN
// `useTypography(props, 'label')` call that DOES read those three
// (`--origam-label---font-weight` / `---line-height` / `---letter-spacing`).
// The forward only lands on the SECOND render (`useProps`'s own doc:
// the template ref is `undefined` on the first) — assertions below await
// `nextTick()` to observe the state a real paint would see.
//
// OrigamLabel uses `:style="labelStyles"` inline binding on its root element,
// so in jsdom the var appears in the `style=""` attribute — assertion via
// wrapper.find('.origam-field__label').attributes('style').

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamField from '@origam/components/Field/OrigamField.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

function mountField (props: Record<string, unknown> = {}) {
    return mount(OrigamField, {
        props: { label: 'Test label', ...props } as never,
        slots: {
            default: '<input class="origam-field__input"/>'
        },
        global: { plugins: [createOrigam()] }
    })
}

function labelStyleOf (props: Record<string, unknown> = {}): string {
    return mountField(props).find('.origam-field__label').attributes('style') || ''
}

// ---------------------------------------------------------------------------
// fontSize — BEM child __label
// ---------------------------------------------------------------------------

describe('OrigamField — fontSize prop (BEM child __label)', () => {
    it('emits no font-size override on the label when fontSize is unset', () => {
        expect(labelStyleOf()).not.toContain('--origam-field__label---font-size')
    })

    it('fontSize="xl" sets the font-size var to the xl token on the label', () => {
        expect(labelStyleOf({ fontSize: 'xl' })).toContain('--origam-field__label---font-size: var(--origam-font__size---xl)')
    })

    it('fontSize="xs" sets the font-size var to the xs token on the label', () => {
        expect(labelStyleOf({ fontSize: 'xs' })).toContain('--origam-field__label---font-size: var(--origam-font__size---xs)')
    })
})

// ---------------------------------------------------------------------------
// fontWeight / lineHeight / letterSpacing — forwarded to the nested
// <OrigamLabel>, which paints them via its OWN `--origam-label---*` prefix
// (issue #501 correction — see the file header comment).
// ---------------------------------------------------------------------------

async function labelStyleAfterForward (props: Record<string, unknown>): Promise<string> {
    const wrapper = mountField(props)
    await nextTick()
    await nextTick()
    return wrapper.find('.origam-field__label').attributes('style') || ''
}

describe('OrigamField — fontWeight / lineHeight / letterSpacing forward to OrigamLabel', () => {
    it('fontWeight="bold" reaches the label via --origam-label---font-weight', async () => {
        const style = await labelStyleAfterForward({ fontWeight: 'bold' })
        expect(style).toContain('--origam-label---font-weight: var(--origam-font__weight---bold)')
    })

    it('lineHeight="loose" reaches the label via --origam-label---line-height', async () => {
        const style = await labelStyleAfterForward({ lineHeight: 'loose' })
        expect(style).toContain('--origam-label---line-height: var(--origam-font__lineHeight---loose)')
    })

    it('letterSpacing="widest" reaches the label via --origam-label---letter-spacing', async () => {
        const style = await labelStyleAfterForward({ letterSpacing: 'widest' })
        expect(style).toContain('--origam-label---letter-spacing: var(--origam-font__letterSpacing---widest)')
    })
})

// ---------------------------------------------------------------------------
// rounded — mirrors the resolved radius into --origam-field---border-radius
// (the inner outline chrome reads the component var; before this the prop
// only rounded the outer box and themes had to force the var via !important)
// ---------------------------------------------------------------------------

function injectedCssFor (props: Record<string, unknown> = {}): string {
    document.head.querySelectorAll('style').forEach(tag => tag.remove())
    mountField(props)
    return Array.from(document.head.querySelectorAll('style'))
        .map(tag => tag.textContent || '')
        .join('\n')
}

describe('OrigamField — rounded prop drives --origam-field---border-radius', () => {
    it('emits no component var when rounded is unset', () => {
        expect(injectedCssFor()).not.toContain('--origam-field---border-radius:')
    })

    it('rounded="lg" mirrors the lg radius token into the component var', () => {
        const css = injectedCssFor({ rounded: 'lg' })
        expect(css).toContain('--origam-field---border-radius: var(--origam-radius---lg')
    })

    it('rounded="none" mirrors the zero radius into the component var', () => {
        const css = injectedCssFor({ rounded: 'none' })
        expect(css).toContain('--origam-field---border-radius: var(--origam-radius---none, 0)')
    })
})
