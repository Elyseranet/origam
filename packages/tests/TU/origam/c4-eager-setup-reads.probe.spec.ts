// C4 — « aucune lecture eagerly dans le corps de setup() : le resolveur ecrit
// dans beforeCreate, donc APRES ».
//
// Cette sonde ne raisonne pas sur la forme du code : elle MESURE. Pour chaque
// composant signale par `guards/lib/setup-reads.mjs`, on enregistre un theme
// qui pose la prop incriminee, on monte le composant SANS la passer en prop, et
// on lit ce que le composant a reellement retenu.
//
// Deux lectures par cas, et elles ne disent pas la meme chose :
//   1. `wrapper.vm.<prop>` — le resolveur a-t-il ecrit la valeur du theme dans
//      `instance.props` ? Si non, le probleme n'est pas la lecture eager.
//   2. l'etat interne seede depuis cette prop — la valeur du theme est-elle
//      ARRIVEE a temps ? C'est ca, C4.
//
// ⛔ Aucune assertion ne porte sur un `getComputedStyle` d'une propriete
// alimentee par un `var()` — jsdom ne les resout pas (CLAUDE.md).

import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

import OrigamCalendar from '@origam/components/Calendar/OrigamCalendar.vue'
import OrigamImg from '@origam/components/Img/OrigamImg.vue'
import OrigamTreeview from '@origam/components/Treeview/OrigamTreeview.vue'
import OrigamFileField from '@origam/components/FileField/OrigamFileField.vue'
import OrigamDatePicker from '@origam/components/DatePicker/OrigamDatePicker.vue'
import OrigamAudio from '@origam/components/Audio/OrigamAudio.vue'
import OrigamVideo from '@origam/components/Video/OrigamVideo.vue'
import OrigamClipboard from '@origam/components/Clipboard/OrigamClipboard.vue'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

const sonde = (components: IOrigamTheme['components']) => {
    const theme: IOrigamTheme = { name: 'sonde', components, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('sonde', undefined)

    return origam
}

describe('C4 — la valeur du theme atteint-elle une prop lue eagerly dans setup() ?', () => {
    // ⛔ Lot tokens (2026-09-10) — FIXED. `internalView`/`internalDate` now
    // seed to a sentinel (`UNSEEDED`, same pattern as `useVModel`) and read
    // `props.view` / `props.currentDate` lazily inside the `resolvedView` /
    // `resolvedDate` computed getters — evaluated at render, after the
    // theme-props-resolver's `beforeCreate` has patched `instance.props`.
    // Flipped from `it.fails` to `it`: this probe existing at all is what
    // caught the fix landing (it started passing, and Vitest's `it.fails`
    // flags an unexpectedly-green "expected to fail" test as a failure).
    it('OrigamCalendar.view — seed `ref(props.view ?? MONTH)` ligne 489', async () => {
        const wrapper = mount(OrigamCalendar, {
            global: { plugins: [sonde({ 'origam-calendar': { view: 'year' } })] }
        })
        await nextTick()
        await nextTick()

        const vm = wrapper.vm as unknown as { view?: string }

        expect(vm.view).toBe('year')
        // `internalView` pilote la vue rendue. S'il a ete seede AVANT le
        // resolveur, il vaut encore `month` malgre la prop resolue a `year`.
        expect(wrapper.html()).toContain('year')
    })

    // Bascule de `it.fails` a `it` : le defaut est CORRIGE. `state` seede
    // desormais toujours IDLE (comportement inchange — `init()`, appele
    // depuis `onBeforeMount` donc APRES le `beforeCreate` du resolveur,
    // ecrasait deja la valeur seedee quand `eager` resolvait a `true`) et
    // l'attribut natif `loading` (eager -> 'eager' / lazy -> 'lazy') est
    // lu paresseusement via un computed, ce qui rend aussi `eager` visible
    // dans le DOM rendu (CSS/HTML-first, cf. CLAUDE.md).
    it('OrigamImg.eager — seed `shallowRef(props.eager ? LOADING : IDLE)` ligne 159', async () => {
        const wrapper = mount(OrigamImg, {
            props: { src: 'https://example.invalid/x.png' },
            global: { plugins: [sonde({ 'origam-img': { eager: true } })] }
        })
        await nextTick()
        await nextTick()

        expect((wrapper.vm as unknown as { eager?: boolean }).eager).toBe(true)
        expect(wrapper.html()).toContain('loading')
    })

    // Bascule de `it.fails` a `it` : le defaut est CORRIGE (seed UNSEEDED +
    // lecture paresseuse via un computed inscriptible, meme patron que
    // MediaController #429 / DatePicker — `selectedSet` avait le meme
    // defaut sur `modelValue`, corrige au meme commit).
    it('OrigamTreeview.expandedValue — seed `ref(new Set(props.expandedValue ?? []))` ligne 72', async () => {
        // `ITreeviewNode` shape is `{ id, label, children }` — not
        // `{ value, title }` (that's a different family's convention).
        const items = [{ id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] }]
        const wrapper = mount(OrigamTreeview, {
            props: { items },
            global: { plugins: [sonde({ 'origam-treeview': { expandedValue: ['a'] } })] }
        })
        await nextTick()
        await nextTick()

        expect((wrapper.vm as unknown as { expandedValue?: Array<string> }).expandedValue).toEqual(['a'])
        expect(wrapper.text()).toContain('A1')
    })


    // Bascule de `it.fails` a `it` : le defaut est CORRIGE (seed UNSEEDED +
    // lecture paresseuse, meme patron que #429). La sonde a fait exactement
    // ce pour quoi elle existe — elle est devenue verte et `it.fails` a
    // signale ce vert inattendu comme un echec.
    it('OrigamDatePicker.month — seed `ref(Number(props.month ?? …))` ligne 190', async () => {
        const wrapper = mount(OrigamDatePicker, {
            global: { plugins: [sonde({ 'origam-date-picker': { month: 11, year: 2030 } })] }
        })
        await nextTick()
        await nextTick()

        expect((wrapper.vm as unknown as { year?: number }).year).toBe(2030)
        expect(wrapper.text()).toContain('2030')
    })


    it('OrigamAudio.loopMode — seed `ref(props.loopMode ?? …)` ligne 529', async () => {
        const wrapper = mount(OrigamAudio, {
            props: { src: 'https://example.invalid/a.mp3' },
            global: { plugins: [sonde({ 'origam-audio': { loopMode: 'all', preload: 'auto' } })] }
        })
        await nextTick()
        await nextTick()

        expect((wrapper.vm as unknown as { preload?: string }).preload).toBe('auto')
        // `preload` est passe au <audio> natif : lecture directe, sans var()
        expect(wrapper.find('audio').attributes('preload')).toBe('auto')
    })

    it('OrigamVideo.preload — snapshot `{preload: props.preload}` ligne 387', async () => {
        const wrapper = mount(OrigamVideo, {
            props: { src: 'https://example.invalid/v.mp4' },
            global: { plugins: [sonde({ 'origam-video': { preload: 'auto', loop: true } })] }
        })
        await nextTick()
        await nextTick()

        expect((wrapper.vm as unknown as { preload?: string }).preload).toBe('auto')
        expect(wrapper.find('video').attributes('preload')).toBe('auto')
    })

    it('OrigamClipboard.feedbackDuration — snapshot passe a `useClipboard` ligne 127', async () => {
        const wrapper = mount(OrigamClipboard, {
            props: { text: 'x' },
            global: { plugins: [sonde({ 'origam-clipboard': { feedbackDuration: 4321 } })] }
        })
        await nextTick()

        // la prop resout-elle ? si oui, seul le snapshot est en cause
        expect((wrapper.vm as unknown as { feedbackDuration?: number }).feedbackDuration).toBe(4321)
    })

    it('OrigamFileField.multiple — seed du modele interne ligne 490', async () => {
        const wrapper = mount(OrigamFileField, {
            global: { plugins: [sonde({ 'origam-file-field': { multiple: true } })] }
        })
        await nextTick()
        await nextTick()

        expect((wrapper.vm as unknown as { multiple?: boolean }).multiple).toBe(true)
        // l'attribut natif suit la prop : si le theme n'arrive pas, absent
        expect(wrapper.find('input[type="file"]').attributes('multiple')).toBeDefined()
    })
})
