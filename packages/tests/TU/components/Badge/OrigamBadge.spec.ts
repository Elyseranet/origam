// Unit tests for <OrigamBadge>
//
// Strategy: mount with createOrigam() plugin. Badge has two visual layers:
// - root wrapper (.origam-badge) — carries --dot / --floating / --inline modifiers
// - pill (.origam-badge__badge) — carries color + rounded + elevation classes
//
// jsdom does not compute SCSS vars so tests rely on class assertions.
// Transition (OrigamFade) is stubbed to keep the mount synchronous.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

import OrigamBadge from '@origam/components/Badge/OrigamBadge.vue'
import { createOrigam } from '@origam/origam'

// `OrigamAvatar` renders `OrigamImg` > `OrigamResponsive`, which mounts the
// `v-intersect` directive (IntersectionObserver-backed lazy load). jsdom's
// mocked IntersectionObserver isn't reliable across every mount lifecycle in
// this suite, so — same pattern as
// `TU/components/ExpansionPanel/OrigamExpansionPanelHeader.spec.ts` — avatar
// presence is asserted through a thin stub that reflects the `image` prop.
const OrigamAvatarStub = defineComponent({
    name: 'OrigamAvatar',
    props: ['image'],
    template: `<span data-stub="avatar" :data-image="image"/>`
})

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

function mountBadge(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
    return mount(OrigamBadge, {
        props: { modelValue: true, ...props } as never,
        slots,
        global: {
            plugins: [createOrigam()],
            // Stub OrigamTransition so v-show is evaluated immediately without
            // the transition wrapper obscuring the pill visibility.
            stubs: {
                OrigamTransition: { template: '<slot />' },
                OrigamFade: { template: '<slot />' }
            }
        }
    })
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('OrigamBadge — rendering', () => {
    it('renders with class origam-badge on the root', () => {
        const wrapper = mountBadge()
        expect(wrapper.find('.origam-badge').exists()).toBe(true)
    })

    it('renders the pill element (.origam-badge__badge) when modelValue=true', () => {
        const wrapper = mountBadge({ modelValue: true })
        expect(wrapper.find('.origam-badge__badge').exists()).toBe(true)
    })

    it('uses <div> as default root tag', () => {
        const wrapper = mountBadge()
        expect(wrapper.element.tagName).toBe('DIV')
    })

    it('renders the default slot content inside the wrapper', () => {
        const wrapper = mountBadge({}, { default: '<span data-cy="child">Icon</span>' })
        expect(wrapper.find('[data-cy="child"]').exists()).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

describe('OrigamBadge — content display', () => {
    it('renders numeric content as text', () => {
        const wrapper = mountBadge({ content: 5 })
        expect(wrapper.find('.origam-badge__content').text()).toBe('5')
    })

    it('renders string content as text', () => {
        const wrapper = mountBadge({ content: 'NEW' })
        expect(wrapper.find('.origam-badge__content').text()).toBe('NEW')
    })

    it('does not render .origam-badge__content when content is undefined', () => {
        const wrapper = mountBadge()
        expect(wrapper.find('.origam-badge__content').exists()).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// max prop (content capping)
// ---------------------------------------------------------------------------

describe('OrigamBadge — max capping', () => {
    it('displays the raw value when content <= max', () => {
        const wrapper = mountBadge({ content: 5, max: 10 })
        expect(wrapper.find('.origam-badge__content').text()).toBe('5')
    })

    it('displays "max+" when content > max', () => {
        const wrapper = mountBadge({ content: 150, max: 99 })
        expect(wrapper.find('.origam-badge__content').text()).toBe('99+')
    })

    it('renders string content as-is even when max is set (non-numeric string)', () => {
        const wrapper = mountBadge({ content: 'beta', max: 10 })
        expect(wrapper.find('.origam-badge__content').text()).toBe('beta')
    })
})

// ---------------------------------------------------------------------------
// Dot mode
// ---------------------------------------------------------------------------

describe('OrigamBadge — dot mode', () => {
    it('adds origam-badge--dot class when dot=true', () => {
        const wrapper = mountBadge({ dot: true })
        expect(wrapper.find('.origam-badge').classes()).toContain('origam-badge--dot')
    })

    it('does not render .origam-badge__content in dot mode', () => {
        // Dot hides content element entirely (template v-if="!dot")
        const wrapper = mountBadge({ dot: true, content: 5 })
        expect(wrapper.find('.origam-badge__content').exists()).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// Floating / Inline modifiers
// ---------------------------------------------------------------------------

describe('OrigamBadge — floating and inline modifiers', () => {
    it('adds origam-badge--floating when floating=true', () => {
        const wrapper = mountBadge({ floating: true })
        expect(wrapper.find('.origam-badge').classes()).toContain('origam-badge--floating')
    })

    it('adds origam-badge--inline when inline=true', () => {
        const wrapper = mountBadge({ inline: true })
        expect(wrapper.find('.origam-badge').classes()).toContain('origam-badge--inline')
    })
})

// ---------------------------------------------------------------------------
// Status modifier classes
// ---------------------------------------------------------------------------

describe('OrigamBadge — status modifier classes', () => {
    for (const status of ['warning', 'error', 'success', 'info'] as const) {
        it(`applies origam-badge--${status} on the root when status="${status}"`, () => {
            const wrapper = mountBadge({ status })
            expect(wrapper.find('.origam-badge').classes()).toContain(`origam-badge--${status}`)
        })
    }
})

// ---------------------------------------------------------------------------
// Typography props (ITypographyProps surface)
// ---------------------------------------------------------------------------
// Effective props on Badge: fontSize → --origam-badge__badge---font-size
//                           fontWeight → --origam-badge__badge---font-weight
// Both are read by the __badge SCSS block.
// Assertion targets the inline style attribute on .origam-badge__badge —
// useActive drives the visible state, not a utility class, so getComputedStyle
// is unreliable in jsdom; the inline style attribute is the reliable signal.

describe('OrigamBadge — fontSize prop', () => {
    it('emits no font-size override when fontSize is unset', () => {
        const wrapper = mountBadge()
        const style = wrapper.find('.origam-badge__badge').attributes('style') || ''
        expect(style).not.toContain('--origam-badge__badge---font-size')
    })

    it('fontSize="xl" sets --origam-badge__badge---font-size to the xl token', () => {
        const wrapper = mountBadge({ fontSize: 'xl' })
        const style = wrapper.find('.origam-badge__badge').attributes('style') || ''
        expect(style).toContain('--origam-badge__badge---font-size: var(--origam-font__size---xl)')
    })

    it('fontSize="sm" sets --origam-badge__badge---font-size to the sm token', () => {
        const wrapper = mountBadge({ fontSize: 'sm' })
        const style = wrapper.find('.origam-badge__badge').attributes('style') || ''
        expect(style).toContain('--origam-badge__badge---font-size: var(--origam-font__size---sm)')
    })
})

describe('OrigamBadge — fontWeight prop', () => {
    it('emits no font-weight override when fontWeight is unset', () => {
        const wrapper = mountBadge()
        const style = wrapper.find('.origam-badge__badge').attributes('style') || ''
        expect(style).not.toContain('--origam-badge__badge---font-weight')
    })

    it('fontWeight="bold" sets --origam-badge__badge---font-weight to the bold token', () => {
        const wrapper = mountBadge({ fontWeight: 'bold' })
        const style = wrapper.find('.origam-badge__badge').attributes('style') || ''
        expect(style).toContain('--origam-badge__badge---font-weight: var(--origam-font__weight---bold)')
    })

    it('fontWeight="semibold" sets --origam-badge__badge---font-weight to the semibold token', () => {
        const wrapper = mountBadge({ fontWeight: 'semibold' })
        const style = wrapper.find('.origam-badge__badge').attributes('style') || ''
        expect(style).toContain('--origam-badge__badge---font-weight: var(--origam-font__weight---semibold)')
    })
})

// ---------------------------------------------------------------------------
// ARIA attributes on the pill
// ---------------------------------------------------------------------------

describe('OrigamBadge — a11y', () => {
    it('pill has role="status"', () => {
        const wrapper = mountBadge()
        expect(wrapper.find('.origam-badge__badge').attributes('role')).toBe('status')
    })

    it('pill has aria-live="polite"', () => {
        const wrapper = mountBadge()
        expect(wrapper.find('.origam-badge__badge').attributes('aria-live')).toBe('polite')
    })

    it('pill has aria-atomic="true"', () => {
        const wrapper = mountBadge()
        expect(wrapper.find('.origam-badge__badge').attributes('aria-atomic')).toBe('true')
    })
})

// ---------------------------------------------------------------------------
// Prepend / append (IAdjacentProps, wired through useAdjacent)
//
// Regression guard: before this fix `IBadgeProps` did not extend
// `IAdjacentProps` — a consumer's `prepend-icon` / `append-icon` /
// `prepend-avatar` / `append-avatar` attribute fell through to the DOM as
// an inert attribute instead of reaching the component. The component
// itself also computed `hasPrepend` / `hasAppend` by hand instead of
// consuming `useAdjacent` — which meant a `#prepend` / `#append` SLOT
// with no icon/avatar prop never rendered (useAdjacent also checks slot
// presence). These specs mount the REAL `OrigamIcon` / `OrigamAvatar` so
// a silently-ignored prop shows up as a missing element, not just a
// passing type.
// ---------------------------------------------------------------------------

describe('OrigamBadge — prepend/append (IAdjacentProps)', () => {
    it('renders neither prepend nor append by default', () => {
        const wrapper = mountBadge()
        expect(wrapper.find('.origam-badge__prepend').exists()).toBe(false)
        expect(wrapper.find('.origam-badge__append').exists()).toBe(false)
    })

    it('renders ONLY the prepend icon when only prependIcon is passed', () => {
        const wrapper = mountBadge({ prependIcon: 'mdi-chevron-left' })
        expect(wrapper.find('.origam-badge__prepend .origam-icon').exists()).toBe(true)
        expect(wrapper.find('.origam-badge__append').exists()).toBe(false)
    })

    it('renders ONLY the append icon when only appendIcon is passed', () => {
        const wrapper = mountBadge({ appendIcon: 'mdi-chevron-right' })
        expect(wrapper.find('.origam-badge__prepend').exists()).toBe(false)
        expect(wrapper.find('.origam-badge__append .origam-icon').exists()).toBe(true)
    })

    it('renders BOTH prepend and append icons at once', () => {
        const wrapper = mountBadge({ prependIcon: 'mdi-chevron-left', appendIcon: 'mdi-chevron-right' })
        expect(wrapper.find('.origam-badge__prepend .origam-icon').exists()).toBe(true)
        expect(wrapper.find('.origam-badge__append .origam-icon').exists()).toBe(true)
    })

    it('renders prependAvatar and appendAvatar together', () => {
        const wrapper = mount(OrigamBadge, {
            props: { modelValue: true, prependAvatar: '/left.png', appendAvatar: '/right.png' } as never,
            global: {
                plugins: [createOrigam()],
                stubs: {
                    OrigamTransition: { template: '<slot />' },
                    OrigamFade: { template: '<slot />' },
                    OrigamAvatar: OrigamAvatarStub
                }
            }
        })
        expect(wrapper.find('.origam-badge__prepend [data-stub="avatar"]').attributes('data-image')).toBe('/left.png')
        expect(wrapper.find('.origam-badge__append [data-stub="avatar"]').attributes('data-image')).toBe('/right.png')
    })

    it('renders the #prepend / #append slots even without a matching icon/avatar prop', () => {
        const wrapper = mountBadge({}, {
            prepend: '<span data-cy="custom-prepend">P</span>',
            append: '<span data-cy="custom-append">A</span>'
        })
        expect(wrapper.find('[data-cy="custom-prepend"]').exists()).toBe(true)
        expect(wrapper.find('[data-cy="custom-append"]').exists()).toBe(true)
    })

    it('emits click:prepend when the prepend slot is clicked', async () => {
        const wrapper = mountBadge({ prependIcon: 'mdi-chevron-left' })
        await wrapper.find('.origam-badge__prepend').trigger('click')
        expect(wrapper.emitted('click:prepend')).toHaveLength(1)
    })

    it('emits click:append when the append slot is clicked', async () => {
        const wrapper = mountBadge({ appendIcon: 'mdi-chevron-right' })
        await wrapper.find('.origam-badge__append').trigger('click')
        expect(wrapper.emitted('click:append')).toHaveLength(1)
    })
})
