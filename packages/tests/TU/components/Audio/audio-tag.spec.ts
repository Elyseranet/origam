// #550 (critere C1) — `OrigamAudio.tag` etait declaree et jamais lue.
//
// `IAudioProps extends ITagProps`, `withDefaults` fixait `tag: 'article'`,
// et le template ouvrait un `<article>` EN DUR. La prop n'avait donc aucun
// effet : `<origam-audio tag="section">` rendait un `<article>`.
//
// Mesure avant correctif (sonde runtime, meme montage que ci-dessous) :
//   Audio racine tagName: ARTICLE   ← avec tag="section"
// Mesure apres :
//   Audio racine tagName: SECTION
//
// ⛔ On assert sur `element.tagName`, pas sur `getComputedStyle` : sous
// jsdom ce dernier ne resout jamais un `var()` et fabrique des valeurs par
// defaut qui ressemblent a des mesures (cf. CLAUDE.md #398).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamAudio from '@origam/components/Audio/OrigamAudio.vue'
import { createOrigam } from '@origam/origam'

function mountAudio (props: Record<string, unknown> = {}) {
    return mount(OrigamAudio as never, {
        props: {src: 'track.mp3', ...props} as never,
        global: {plugins: [createOrigam()]}
    })
}

describe('OrigamAudio — la prop `tag` atteint la racine (#550)', () => {
    it('rend `<article>` par defaut', () => {
        expect((mountAudio().element as HTMLElement).tagName).toBe('ARTICLE')
    })

    it('rend la balise demandee quand `tag` est fournie', () => {
        expect((mountAudio({tag: 'section'}).element as HTMLElement).tagName).toBe('SECTION')
    })

    it('deux valeurs distinctes produisent deux balises distinctes', () => {
        // Le test de mutation vit ici : avec le `<article>` en dur d'avant
        // le correctif, les deux cotes valent 'ARTICLE' et l'assertion tombe.
        const a = (mountAudio({tag: 'section'}).element as HTMLElement).tagName
        const b = (mountAudio({tag: 'aside'}).element as HTMLElement).tagName

        expect(a).not.toBe(b)
        expect(a).toBe('SECTION')
        expect(b).toBe('ASIDE')
    })

    it('la balise substituee garde la classe racine et les crochets de test', () => {
        const wrapper = mountAudio({tag: 'div'})

        expect(wrapper.classes()).toContain('origam-audio')
        expect(wrapper.attributes('data-cy')).toBe('origam-audio')
    })
})
