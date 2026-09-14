// Regression coverage for issue #648 (OPEN) — `<OrigamAudio>`'s
// `loopMode` / `shuffle` theme defaults were lost at mount, same family as
// #429 (OrigamMediaController):
//
//     const initialLoopMode = props.loopMode && props.loopMode !== 'none'
//         ? props.loopMode
//         : (props.loop ? 'one' : 'none')
//     const internalLoopMode = ref<TAudioLoopMode>(initialLoopMode)   // eager
//     const internalShuffle  = ref<boolean>(props.shuffle ?? false)  // eager
//
// Both are EAGER reads in the body of `setup()`. Vue runs `setup()` BEFORE
// the `beforeCreate` hook where the ADR-005 theme-props resolver patches
// `instance.props` (root CLAUDE.md), so a theme setting a default for
// `loopMode` or `shuffle` on `origam-audio` is captured too late.
//
// Mirrors packages/tests/TU/components/Media/media-controller-theme-defaults.spec.ts.

import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { OrigamAudio } from '@origam/components'
import { createOrigam } from '@origam/origam'

import type { IOrigamTheme } from '@origam/interfaces'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach((el) => el.remove())
})

const THEME: IOrigamTheme = {
    name: 'audio-defaults-theme',
    mode: 'light',
    components: {
        'origam-audio': { loopMode: 'all', shuffle: true }
    },
    vars: {}
}

function mountThemedAudio () {
    const origam = createOrigam({ themes: [THEME] })
    origam._defaultsRef.value = origam._activeDefaultsFor('audio-defaults-theme', 'light')

    return mount(OrigamAudio, {
        attachTo: document.body,
        global: { plugins: [origam] },
        props: {
            playlist: [
                { src: 'a.mp3', title: 'A' },
                { src: 'b.mp3', title: 'B' }
            ]
        } as never
    })
}

describe('OrigamAudio — theme.components["origam-audio"] loopMode/shuffle defaults (#648)', () => {
    it('a theme default for loopMode is NOT lost at mount', () => {
        const wrapper = mountThemedAudio()
        const loopBtn = wrapper.find('[data-cy="origam-media-controller-loop"]')

        expect(loopBtn.exists()).toBe(true)
        expect(loopBtn.attributes('aria-pressed')).toBe('true')
    })

    it('a theme default for shuffle is NOT lost at mount', () => {
        const wrapper = mountThemedAudio()
        const shuffleBtn = wrapper.find('[data-cy="origam-media-controller-shuffle"]')

        expect(shuffleBtn.exists()).toBe(true)
        expect(shuffleBtn.attributes('aria-pressed')).toBe('true')
    })
})
