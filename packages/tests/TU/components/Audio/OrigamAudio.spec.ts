// Unit tests for <OrigamAudio> — verifies the shell wiring between
// `useAudioPlayer` and `<OrigamMediaController>`. The controller is
// stubbed so the spec stays hermetic; its own behaviour lives in
// OrigamMediaController.spec.ts.

import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'

import OrigamAudio from '@origam/components/Audio/OrigamAudio.vue'

import { ORIGAM_LOCALE_KEY } from '@origam/consts'

import type { IAudioSource } from '@origam/interfaces'

const stubLocale = (): any => ({
    t: (key: string, ...args: Array<unknown>) => {
        if (args.length === 0) return key
        return `${ key }|${ args.join(',') }`
    },
    n: (n: number) => String(n),
    current: { value: 'en' },
    fallback: { value: 'en' },
    messages: { value: {} },
    provide: () => stubLocale(),
    rtl: { value: false },
    isRtl: { value: false }
})

const localeInstance = stubLocale()

interface IMountOpts {
    props?: Record<string, unknown>
    slots?: Record<string, unknown>
    emits?: Record<string, unknown>
}

// OrigamMediaController stub: passes through the three slots Audio
// populates (header, waveform, footer) and exposes helper buttons so
// tests can trigger the events Audio listens to (@previous, @next,
// @download).
const OrigamMediaControllerStub = {
    name: 'OrigamMediaController',
    props: [
        'state', 'methods', 'playbackRates', 'allowRemotePlayback',
        'downloadable', 'downloadUrl', 'downloadFilename',
        'showPrevious', 'showNext', 'showLoop', 'showShuffle',
        'loopMode', 'shuffle'
    ],
    emits: ['previous', 'next', 'download', 'update:loopMode', 'update:shuffle'],
    template: `
        <div data-cy="origam-audio-controls">
            <slot name="header"/>
            <slot name="waveform"/>
            <slot name="footer"/>
            <button type="button" data-cy="origam-audio-controls-prev" @click="$emit('previous')"/>
            <button type="button" data-cy="origam-audio-controls-next" @click="$emit('next')"/>
            <button type="button" data-cy="origam-audio-controls-download" @click="$emit('download')"/>
        </div>
    `
}

const mountAudio = (opts: IMountOpts = {}): VueWrapper => {
    return mount(OrigamAudio, {
        attachTo: document.body,
        global: {
            provide: {
                [ORIGAM_LOCALE_KEY as unknown as symbol]: localeInstance
            },
            stubs: {
                OrigamIcon: { template: '<i aria-hidden="true" />' },
                OrigamImg: {
                    props: ['src', 'alt'],
                    template: '<img :src="src" :alt="alt" />'
                },
                OrigamMediaController: OrigamMediaControllerStub,
                OrigamSliderField: {
                    props: ['modelValue', 'max', 'step', 'buffered', 'peaks', 'variant', 'showThumbOnHoverOnly', 'showHoverTooltip', 'formatHoverTooltip', 'ariaLabel'],
                    emits: ['update:modelValue'],
                    template: '<div :data-variant="variant" data-cy="origam-audio-waveform-slider" />'
                },
                OrigamList: {
                    template: '<ul data-cy="origam-audio-playlist"><slot /></ul>'
                },
                OrigamListItem: {
                    props: ['active', 'title', 'subtitle', 'prependAvatar'],
                    template: '<li v-bind="$attrs"><slot /><slot name="append"/></li>'
                }
            }
        },
        props: {
            src: 'https://example.com/track.mp3',
            ...opts.props
        },
        slots: opts.slots,
        attrs: opts.emits ?? {}
    })
}

describe('OrigamAudio — element wiring', () => {
    it('mounts an <audio> element with the resolved native attributes', () => {
        const wrapper = mountAudio({
            props: {
                src: 'https://example.com/track.mp3',
                autoplay: true,
                muted: true,
                loop: true,
                preload: 'auto'
            }
        })
        const audio = wrapper.find('audio')
        expect(audio.exists()).toBe(true)
        expect(audio.attributes('src')).toBe('https://example.com/track.mp3')
        const el = audio.element as HTMLAudioElement
        expect(el.muted).toBe(true)
        expect(el.loop).toBe(true)
        expect(el.preload).toBe('auto')
    })

    it('renders one <source> per entry when src is an array', () => {
        const sources: Array<IAudioSource> = [
            { src: 'a.mp3', type: 'audio/mpeg' },
            { src: 'a.ogg', type: 'audio/ogg' }
        ]
        const wrapper = mountAudio({ props: { src: sources } })
        const renderedSources = wrapper.findAll('source')
        expect(renderedSources).toHaveLength(2)
        expect(renderedSources[0].attributes('src')).toBe('a.mp3')
        expect(renderedSources[0].attributes('type')).toBe('audio/mpeg')
        expect(renderedSources[1].attributes('src')).toBe('a.ogg')
    })

    it('uses the semantic <article> root and mounts the controller + cover figure + metadata header', () => {
        const wrapper = mountAudio({
            props: {
                title: 'Episode 42',
                artist: 'Origam DS Cast',
                cover: 'https://example.com/cover.jpg'
            }
        })
        const root = wrapper.find('[data-cy="origam-audio"]')
        expect(root.exists()).toBe(true)
        expect(root.element.tagName).toBe('ARTICLE')

        // Controller is mounted (stubbed as <div>)
        const transport = wrapper.find('[data-cy="origam-audio-controls"]')
        expect(transport.exists()).toBe(true)

        // Cover figure is rendered inside the #header slot
        const cover = wrapper.find('[data-cy="origam-audio-cover-figure"]')
        expect(cover.exists()).toBe(true)
        expect(cover.element.tagName).toBe('FIGURE')

        // Metadata header is rendered inside the #header slot
        const meta = wrapper.find('[data-cy="origam-audio-metadata"]')
        expect(meta.exists()).toBe(true)
        expect(meta.element.tagName).toBe('HEADER')
    })
})

describe('OrigamAudio — metadata strip', () => {
    it('renders title, artist, and cover when provided', () => {
        const wrapper = mountAudio({
            props: {
                title: 'Episode 42',
                artist: 'Origam DS Cast',
                cover: 'https://example.com/cover.jpg'
            }
        })
        const meta = wrapper.find('[data-cy="origam-audio-metadata"]')
        expect(meta.exists()).toBe(true)

        const title = wrapper.find('[data-cy="origam-audio-title"]')
        expect(title.text()).toBe('Episode 42')

        const artist = wrapper.find('[data-cy="origam-audio-artist"]')
        expect(artist.text()).toBe('Origam DS Cast')

        const cover = wrapper.find('[data-cy="origam-audio-cover"]')
        expect(cover.exists()).toBe(true)
        expect(cover.attributes('src')).toBe('https://example.com/cover.jpg')
    })

    it('omits the metadata strip entirely when title, artist, and cover are all absent', () => {
        const wrapper = mountAudio()
        expect(wrapper.find('[data-cy="origam-audio-metadata"]').exists()).toBe(false)
    })
})

describe('OrigamAudio — controls strategy', () => {
    it('does NOT mount the controller and sets the native controls attribute when controls="native"', () => {
        const wrapper = mountAudio({ props: { controls: 'native' } })
        const audio = wrapper.find('audio')
        const el = audio.element as HTMLAudioElement
        expect(el.controls).toBe(true)
        expect(wrapper.find('[data-cy="origam-audio-controls"]').exists()).toBe(false)
    })

    it('mounts the controller and leaves the native controls off when controls="custom"', () => {
        const wrapper = mountAudio({ props: { controls: 'custom' } })
        const audio = wrapper.find('audio')
        const el = audio.element as HTMLAudioElement
        expect(el.controls).toBe(false)
        expect(wrapper.find('[data-cy="origam-audio-controls"]').exists()).toBe(true)
    })

    it('emits "download" with the source URL when the controller emits download', async () => {
        const wrapper = mountAudio({ props: { downloadable: true } })
        // Trigger the download event on the stubbed controller
        await wrapper.find('[data-cy="origam-audio-controls-download"]').trigger('click')
        const events = wrapper.emitted('download')
        expect(events).toBeTruthy()
        expect(events?.[0]?.[0]).toBe('https://example.com/track.mp3')
    })
})

describe('OrigamAudio — transport navigation', () => {
    it('emits "previous" when the controller emits previous', async () => {
        const wrapper = mountAudio()
        await wrapper.find('[data-cy="origam-audio-controls-prev"]').trigger('click')
        expect(wrapper.emitted('previous')).toBeTruthy()
    })

    it('emits "next" when the controller emits next', async () => {
        const wrapper = mountAudio()
        await wrapper.find('[data-cy="origam-audio-controls-next"]').trigger('click')
        expect(wrapper.emitted('next')).toBeTruthy()
    })
})

describe('OrigamAudio — loop / shuffle binding', () => {
    it('maps legacy loop=true to loopMode="one" on the MediaController', () => {
        const wrapper = mountAudio({ props: { loop: true } })
        const controller = wrapper.findComponent({ name: 'OrigamMediaController' })
        expect(controller.props('loopMode')).toBe('one')
    })

    it('keeps loopMode at "none" when loop is false and loopMode unset', () => {
        const wrapper = mountAudio({ props: { loop: false } })
        const controller = wrapper.findComponent({ name: 'OrigamMediaController' })
        expect(controller.props('loopMode')).toBe('none')
    })

    it('forwards an explicit loopMode prop to the MediaController', () => {
        const wrapper = mountAudio({ props: { loopMode: 'all' } })
        const controller = wrapper.findComponent({ name: 'OrigamMediaController' })
        expect(controller.props('loopMode')).toBe('all')
    })

    it('updates internal loopMode when legacy loop flag flips at runtime', async () => {
        const wrapper = mountAudio({ props: { loop: false } })
        const controller = wrapper.findComponent({ name: 'OrigamMediaController' })
        expect(controller.props('loopMode')).toBe('none')
        await wrapper.setProps({ loop: true })
        expect(controller.props('loopMode')).toBe('one')
    })

    it('forwards shuffle prop to the MediaController', () => {
        const wrapper = mountAudio({ props: { shuffle: true } })
        const controller = wrapper.findComponent({ name: 'OrigamMediaController' })
        expect(controller.props('shuffle')).toBe(true)
    })
})

describe('OrigamAudio — variant routing', () => {
    it('applies the expanded variant class by default and renders the waveform slider', () => {
        const wrapper = mountAudio({ props: { title: 'Track' } })
        const root = wrapper.find('[data-cy="origam-audio"]')
        expect(root.classes()).toContain('origam-audio--expanded')
        const waveform = wrapper.find('[data-cy="origam-audio-waveform-slider"]')
        expect(waveform.exists()).toBe(true)
    })

    it('applies the compact variant class and removes the has-waveform marker', () => {
        // In compact mode the waveform slot content is CSS-hidden (display:none via
        // .origam-audio--compact rule) — the element stays in the DOM but the
        // `origam-audio--has-waveform` modifier class is absent so consumers and
        // CSS rules can key off it.
        const wrapper = mountAudio({ props: { variant: 'compact' } })
        const root = wrapper.find('[data-cy="origam-audio"]')
        expect(root.classes()).toContain('origam-audio--compact')
        expect(root.classes()).not.toContain('origam-audio--has-waveform')
    })

    it('honours the legacy "minimal" alias as the compact variant', () => {
        const wrapper = mountAudio({ props: { variant: 'minimal' } })
        const root = wrapper.find('[data-cy="origam-audio"]')
        expect(root.classes()).toContain('origam-audio--compact')
    })

    it('flips the cover-position class to right when coverPosition="right"', () => {
        const wrapper = mountAudio({ props: { coverPosition: 'right' } })
        const root = wrapper.find('[data-cy="origam-audio"]')
        expect(root.classes()).toContain('origam-audio--cover-right')
    })
})

describe('OrigamAudio — slot overrides', () => {
    it('replaces the default metadata strip when the #metadata slot is provided', () => {
        const wrapper = mountAudio({
            props: { title: 'Original title' },
            slots: {
                metadata: () => h('div', { 'data-cy': 'custom-meta', class: 'custom-meta' }, 'Custom metadata')
            }
        })
        const meta = wrapper.find('[data-cy="origam-audio-metadata"]')
        expect(meta.exists()).toBe(true)
        expect(wrapper.find('[data-cy="custom-meta"]').exists()).toBe(true)
        expect(meta.text()).toContain('Custom metadata')
        expect(wrapper.find('[data-cy="origam-audio-title"]').exists()).toBe(false)
    })
})

describe('OrigamAudio — dimension props', () => {
    it('width / height are applied to the root surface (via useDimension)', () => {
        const wrapper = mountAudio({ props: { width: 320, height: '200px' } })
        const root = wrapper.find('[data-cy="origam-audio"]')
        const style = root.attributes('style') ?? ''

        expect(style).toMatch(/width:\s*320px/)
        expect(style).toMatch(/height:\s*200px/)
    })

    it('maxWidth is honoured on the root surface', () => {
        const wrapper = mountAudio({ props: { maxWidth: '480px' } })
        const style = wrapper.find('[data-cy="origam-audio"]').attributes('style') ?? ''

        expect(style).toMatch(/max-width:\s*480px/)
    })
})

describe('OrigamAudio — reactive autoplay', () => {
    it('toggling autoplay on after mount actually starts playback (calls play)', async () => {
        // The global afterEach(restoreAllMocks) wipes the setup's matchMedia
        // mock after the first test, so prefersReducedMotion() (read by
        // resolvedAutoplay) would throw. Reinstate a plain stub.
        ;(window as any).matchMedia = (query: string) => ({
            matches: false, media: query, addEventListener () {}, removeEventListener () {}
        })

        // jsdom does not implement media playback — stub play().
        const play = vi.fn().mockResolvedValue(undefined)
        const original = (window.HTMLMediaElement.prototype as any).play
        ;(window.HTMLMediaElement.prototype as any).play = play

        try {
            const wrapper = mountAudio({ props: { autoplay: false } })
            play.mockClear()

            await wrapper.setProps({ autoplay: true })
            await wrapper.vm.$nextTick()
            await Promise.resolve()

            expect(play).toHaveBeenCalled()
            wrapper.unmount()
        } finally {
            ;(window.HTMLMediaElement.prototype as any).play = original
        }
    })
})

// ─── Typography — surfaces wired by useTypography (Typo 2b) ──────────────────
//
// Four surfaces receive typographyStyles (one useTypography call per surface):
//
//   audio__title   → .origam-audio__title  — SCSS reads font-size, font-weight,
//                    line-height. Rendered when `title` prop is set.
//   audio__meta    → .origam-audio__meta   — SCSS reads font-size only.
//                    Rendered when `artist` (or album / duration) is set.
//   audio__loading → .origam-audio__loading — SCSS reads font-size only.
//                    STATE-CONDITIONAL: rendered when state.loading.value === true
//                    AND state.error.value === null. state is internal to
//                    useAudioPlayer and driven by native HTMLAudioElement events
//                    (loadstart / canplay). jsdom does not dispatch those events
//                    (no real media decoder), so this element is never rendered
//                    in a headless mount. NOT TESTABLE HEADLESSLY — the CSS var
//                    IS emitted (the :style binding is on the element in the
//                    template); the rendered effect is proven at the e2e layer.
//   audio--error   → .origam-audio__error  — SCSS reads font-size only.
//                    STATE-CONDITIONAL: rendered when state.error.value !== null.
//                    Same jsdom constraint as __loading. NOT TESTABLE HEADLESSLY.

describe('OrigamAudio — typography: audio__title surface', () => {
    const titleStyle = (extraProps: Record<string, unknown> = {}): string =>
        mountAudio({ props: { title: 'Daydream', ...extraProps } })
            .find('.origam-audio__title')
            .attributes('style') || ''

    it('renders the __title element when title prop is set', () => {
        const wrapper = mountAudio({ props: { title: 'Daydream' } })
        expect(wrapper.find('.origam-audio__title').exists()).toBe(true)
    })

    it('emits no typography override when no typo prop is set', () => {
        expect(titleStyle()).not.toContain('--origam-audio__title---')
    })

    it('fontSize="xl" sets the font-size var on __title', () => {
        expect(titleStyle({ fontSize: 'xl' }))
            .toContain('--origam-audio__title---font-size: var(--origam-font__size---xl)')
    })

    it('fontWeight="bold" sets the font-weight var on __title', () => {
        expect(titleStyle({ fontWeight: 'bold' }))
            .toContain('--origam-audio__title---font-weight: var(--origam-font__weight---bold)')
    })

    it('lineHeight="tight" sets the line-height var on __title', () => {
        expect(titleStyle({ lineHeight: 'tight' }))
            .toContain('--origam-audio__title---line-height: var(--origam-font__lineHeight---tight)')
    })
})

describe('OrigamAudio — typography: audio__meta surface', () => {
    const metaStyle = (extraProps: Record<string, unknown> = {}): string =>
        mountAudio({ props: { artist: 'Origam DS Cast', ...extraProps } })
            .find('.origam-audio__meta')
            .attributes('style') || ''

    it('renders the __meta element when artist prop is set', () => {
        const wrapper = mountAudio({ props: { artist: 'Origam DS Cast' } })
        expect(wrapper.find('.origam-audio__meta').exists()).toBe(true)
    })

    it('emits no typography override on __meta when no typo prop is set', () => {
        expect(metaStyle()).not.toContain('--origam-audio__meta---')
    })

    it('fontSize="sm" sets the font-size var on __meta', () => {
        expect(metaStyle({ fontSize: 'sm' }))
            .toContain('--origam-audio__meta---font-size: var(--origam-font__size---sm)')
    })
})
