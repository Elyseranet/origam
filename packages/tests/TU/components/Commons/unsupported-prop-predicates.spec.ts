/*
 * #1476 — audit des predicats `useUnsupportedProp` (meme defaut que #1157).
 *
 * Pour chaque composant appelant `useUnsupportedProp` : monte SANS aucune prop
 * morte => aucun « has no effect » ; passe une valeur reellement non supportee
 * => l'avertissement part (controle positif).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})
vi.setConfig({ testTimeout: 60000 })

const SERIES = [ { name: 'S', data: [ { x: 'a', y: 10 }, { x: 'b', y: 5 } ] } ]
const chart = (n: string): [ string, string, Record<string, unknown> ] => [ `Chart${n}`, `Chart/OrigamChart${n}.vue`, { series: SERIES } ]

// [nom, fichier, props de base, [prop morte, valeur reellement passee]]
const CASES: Array<[ string, string, Record<string, unknown>, Array<[ string, unknown ]> ]> = [
    [ 'Video', 'Video/OrigamVideo.vue', { src: 'a.mp4' }, [ [ 'showCenterControls', false ] ] ],
    [ 'Messages', 'Messages/OrigamMessages.vue', { messages: [ 'x' ] }, [ [ 'active', true ] ] ],
    [ 'Toolbar', 'Toolbar/OrigamToolbar.vue', {}, [ [ 'modelValue', false ] ] ],
    [ 'DatePickerControls', 'DatePicker/OrigamDatePickerControls.vue', {}, [ [ 'active', true ] ] ],
    [ 'Audio', 'Audio/OrigamAudio.vue', { src: 'a.mp3' }, [ [ 'waveformColor', 'red' ] ] ],
    [ 'ListChildren', 'List/OrigamListChildren.vue', { items: [] }, [ [ 'returnObject', true ] ] ],
    [ ...chart('Sankey'), [ [ 'categories', [ 'a' ] ] ] ],
    [ ...chart('Map'), [ [ 'categories', [ 'a' ] ], [ 'legendPosition', 'top' ] ] ],
    [ ...chart('Bullet'), [ [ 'colorScheme', [ 'red' ] ] ] ],
    [ ...chart('Candlestick'), [ [ 'colorScheme', [ 'red' ] ] ] ],
    [ ...chart('Sparkline'), [ [ 'categories', [ 'a' ] ], [ 'animated', true ], [ 'animationDuration', 100 ], [ 'aspectRatio', 2 ], [ 'fontSize', 10 ], [ 'fontWeight', 700 ], [ 'subtitle', 's' ] ] ],
    [ ...chart('Honeycomb'), [ [ 'categories', [ 'a' ] ], [ 'xAxisFormat', 'x' ] ] ],
    [ ...chart('PolarBar'), [ [ 'xAxisFormat', 'x' ] ] ],
    [ ...chart('Heatmap'), [ [ 'categories', [ 'a' ] ], [ 'colorScheme', [ 'red' ] ] ] ],
    [ ...chart('Gauge'), [ [ 'categories', [ 'a' ] ], [ 'showLegend', true ], [ 'legendPosition', 'top' ], [ 'showTooltip', true ] ] ],
    [ ...chart('Treemap'), [ [ 'categories', [ 'a' ] ] ] ],
    [ ...chart('WordCloud'), [ [ 'categories', [ 'a' ] ] ] ],
    [ ...chart('Radar'), [ [ 'showTooltip', true ] ] ]
]

const load = async (file: string) => {
    vi.resetModules() // warnUnsupportedProp dedupes in a module-level Set
    const { createOrigam } = await import('@origam/origam')
    const comp = (await import(/* @vite-ignore */ `@origam/components/${file}`)).default
    return { comp, plugins: [ createOrigam() ] }
}

describe('#1476 useUnsupportedProp predicates', () => {
    let warn: ReturnType<typeof vi.spyOn>
    beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
    afterEach(() => warn.mockRestore())
    const noEffect = () => warn.mock.calls.map(c => String(c[0])).filter(s => s.includes('has no effect'))

    for (const [ name, file, base, passed ] of CASES) {
        it(`${name}: no dead prop passed => no warning`, async () => {
            const { comp, plugins } = await load(file)
            mount(comp, { props: base, global: { plugins } })
            expect(noEffect()).toEqual([])
        })
        for (const [ prop, value ] of passed) {
            it(`${name}: dead "${prop}" really passed => warned`, async () => {
                const { comp, plugins } = await load(file)
                mount(comp, { props: { ...base, [prop]: value }, global: { plugins } })
                expect(noEffect().some(s => s.includes(`prop "${prop}"`))).toBe(true)
            })
        }
    }
})
