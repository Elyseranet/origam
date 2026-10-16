// Playground lot E1 (#1164) — the Chart* snippets and the preview's
// selection-by-click logic, pinned where each lives.
//
//   - `createDefaultSnippets`: every Chart* member of the host catalogue
//     (but `OrigamChartAxis`, which paints only inside a chart's `<svg>`) has
//     a default snippet, and each plotting snippet hands the DATUM SHAPE its
//     family's interface declares — not the generic `number[]` that renders
//     "No data to display" on 13 of them. That every prop is real is already
//     pinned by `scene-tree.spec.ts`, over every snippet.
//   - `instanceIdFromTarget`: the innermost instance wins, the stage itself
//     and anything outside it resolve to nothing.
//   - `en.json`: every snippet key exists — a `t()` fallback hides a
//     missing key on screen, so only a test sees it.
//   - `PlaygroundPreview` mounted in jsdom: mode OFF, the click reaches the
//     component; mode ON, every captured pointer event is stopped and the
//     click emits `select-instance` with the instance id. The toggle and
//     Escape are pinned in a real browser (`e2e-playground/playground-select.spec.ts`).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { h, nextTick, ref } from 'vue'

import { createDefaultSnippets } from '../../../playground/src/consts/Commons/snippets.const'
import { INSTANCE_ID_ATTRIBUTE, SELECT_MODE_CAPTURED_EVENTS } from '../../../playground/src/consts/Commons/scene.const'
import { HOST_CATALOG_SEED } from '../../../playground/src/host/catalogSeed.const'
import { instanceIdFromTarget } from '../../../playground/src/utils/Commons/scene-instance.util'
import PlaygroundPreview from '../../../playground/src/components/Playground/PlaygroundPreview.vue'
import type { IComponentRegistry } from '../../../playground/src/interfaces/Registry/component-registry.interface'
import type { IPlaygroundScene } from '../../../playground/src/interfaces/Scene/playground-scene.interface'

const fallback = (_key: string, value?: string) => value ?? ''

describe('Chart* snippets (#1164)', () => {
    const snippets = createDefaultSnippets(fallback)
    const chartMembers = HOST_CATALOG_SEED.map(definition => definition.name).filter(name => name.startsWith('OrigamChart'))
    const firstProps = (name: string) => snippets[name]?.[0]?.instances[0]?.props ?? {}
    const firstDatum = (name: string) => {
        const series = firstProps(name).series as Array<{ data: unknown[] }>

        return series[0]?.data[0] as Record<string, unknown>
    }

    it('the host catalogue carries the whole Chart family (26 members)', () => {
        expect(chartMembers).toHaveLength(26)
    })

    it('every member but OrigamChartAxis has a default snippet', () => {
        const missing = chartMembers.filter(name => !snippets[name]?.length)

        expect(missing).toEqual(['OrigamChartAxis'])
    })

    it('every snippet roots ONE instance of its own component', () => {
        for (const name of chartMembers.filter(member => member !== 'OrigamChartAxis')) {
            const instances = snippets[name]?.[0]?.instances ?? []

            expect(instances.map(instance => instance.componentName), name).toEqual([name])
        }
    })

    it('every plotting snippet passes a non-empty series with a name', () => {
        const plotting = chartMembers.filter(name => !['OrigamChartAxis', 'OrigamChartLegend', 'OrigamChartRangeSelector', 'OrigamChartTooltip'].includes(name))

        for (const name of plotting) {
            const series = firstProps(name).series as Array<{ name: string, data: unknown[] }>

            expect(series?.length, name).toBeGreaterThan(0)
            expect(series.every(entry => typeof entry.name === 'string' && entry.name.length > 0 && entry.data.length > 0), name).toBe(true)
        }
    })

    it('each family gets the datum shape its interface declares', () => {
        expect(Object.keys(firstDatum('OrigamChartBoxPlot')).sort()).toEqual(['category', 'max', 'median', 'min', 'outliers', 'q1', 'q3'])
        expect(Object.keys(firstDatum('OrigamChartBullet')).sort()).toEqual(['ranges', 'target', 'value'])
        expect(Object.keys(firstDatum('OrigamChartCandlestick')).sort()).toEqual(['close', 'date', 'high', 'low', 'open'])
        expect(Object.keys(firstDatum('OrigamChartHeatmap')).sort()).toEqual(['value', 'x', 'y'])
        expect(Object.keys(firstDatum('OrigamChartHoneycomb')).sort()).toEqual(['name', 'value', 'x', 'y'])
        expect(Object.keys(firstDatum('OrigamChartMap')).sort()).toEqual(['code', 'value'])
        expect(Object.keys(firstDatum('OrigamChartPareto')).sort()).toEqual(['category', 'value'])
        expect(Object.keys(firstDatum('OrigamChartSankey')).sort()).toEqual(['from', 'to', 'value'])
        expect(Object.keys(firstDatum('OrigamChartSunburst')).sort()).toEqual(['children', 'name'])
        expect(Object.keys(firstDatum('OrigamChartTreemap')).sort()).toEqual(['name', 'value'])
        expect(Object.keys(firstDatum('OrigamChartVariwide')).sort()).toEqual(['category', 'value', 'width'])
        expect(Object.keys(firstDatum('OrigamChartWordCloud')).sort()).toEqual(['text', 'value'])
        expect(typeof firstDatum('OrigamChartGauge')).toBe('number')
    })

    it('each Bullet series carries ONE datum — the component reads `ser.data[0]` only', () => {
        const series = firstProps('OrigamChartBullet').series as Array<{ data: unknown[] }>

        expect(series.every(entry => entry.data.length === 1)).toBe(true)
    })

    it('the heatmap covers every (x, y) cell of its declared categories', () => {
        const props = firstProps('OrigamChartHeatmap')
        const cells = (props.series as Array<{ data: Array<{ x: string, y: string }> }>)[0]?.data ?? []
        const keys = new Set(cells.map(cell => `${cell.x}|${cell.y}`))

        expect(keys.size).toBe((props.xCategories as string[]).length * (props.yCategories as string[]).length)
    })

    it('a resolved colour is a DS token through var(), never a raw hex', () => {
        const json = JSON.stringify([snippets.OrigamChartLegend, snippets.OrigamChartTooltip])

        expect(json).not.toMatch(/#[0-9a-f]{3,8}\b/i)
        expect(json).toContain('var(--origam-color__')
    })

    it('every key a snippet asks for exists in en.json, with the same text', () => {
        const locale = JSON.parse(readFileSync(resolve(__dirname, '../../../playground/src/assets/locales/en.json'), 'utf8')) as Record<string, string>
        const asked: Array<[string, string | undefined]> = []

        createDefaultSnippets((key, value) => {
            asked.push([key, value])

            return value ?? key
        })

        expect(asked.filter(([key, value]) => locale[key] !== value)).toEqual([])
    })
})

describe('instanceIdFromTarget (#1164)', () => {
    const build = () => {
        document.body.innerHTML = `
            <div id="outside" ${INSTANCE_ID_ATTRIBUTE}="ghost"><span id="ghost-child"></span></div>
            <div id="stage">
                <div ${INSTANCE_ID_ATTRIBUTE}="table">
                    <span id="cell">cell</span>
                    <button ${INSTANCE_ID_ATTRIBUTE}="btn"><span id="label">Edit</span></button>
                </div>
                <p id="padding">x</p>
            </div>`

        return document.getElementById('stage') as HTMLElement
    }

    it('resolves the innermost instance — a Btn inside a table cell wins', () => {
        const stage = build()

        expect(instanceIdFromTarget(document.getElementById('label'), stage)).toBe('btn')
        expect(instanceIdFromTarget(document.getElementById('cell'), stage)).toBe('table')
    })

    it('returns null for the stage padding, for a node outside the stage, and for a non-element', () => {
        const stage = build()

        expect(instanceIdFromTarget(document.getElementById('padding'), stage)).toBeNull()
        expect(instanceIdFromTarget(document.getElementById('ghost-child'), stage)).toBeNull()
        expect(instanceIdFromTarget(null, stage)).toBeNull()
        expect(instanceIdFromTarget(document.createTextNode('x'), stage)).toBeNull()
    })
})

describe('PlaygroundPreview — selection mode (#1164)', () => {
    const scene: IPlaygroundScene = { version: 1, selectedInstanceId: null, roots: [{ id: 'root-btn', componentName: 'Probe', props: {} }] }

    const clicks = ref(0)
    const Probe = { name: 'Probe', inheritAttrs: true, setup: () => () => h('button', { type: 'button', onClick: () => { clicks.value += 1 } }, 'probe') }

    const registry: IComponentRegistry = {
        getComponents: () => [],
        getComponentMetadata: () => undefined,
        getComponent: async () => Probe
    } as unknown as IComponentRegistry

    const mountPreview = async (selectMode: boolean) => {
        clicks.value = 0
        const wrapper = mount(PlaygroundPreview, { props: { scene, selectedInstance: undefined, registry, selectMode }, attachTo: document.body })

        for (let i = 0; i < 5; i += 1) await nextTick()
        await new Promise(done => setTimeout(done, 0))

        return wrapper
    }

    it('mode OFF: the click reaches the component and nothing is selected', async () => {
        const wrapper = await mountPreview(false)

        await wrapper.find('button').trigger('click')

        expect(clicks.value).toBe(1)
        expect(wrapper.emitted('select-instance')).toBeUndefined()
        wrapper.unmount()
    })

    it('mode ON: the click selects the instance and never reaches the component', async () => {
        const wrapper = await mountPreview(true)

        for (const name of SELECT_MODE_CAPTURED_EVENTS) await wrapper.find('button').trigger(name)

        expect(clicks.value).toBe(0)
        expect(wrapper.emitted('select-instance')).toEqual([['root-btn']])
        expect(wrapper.find('.pg-preview__stage--select-mode').exists()).toBe(true)
        wrapper.unmount()
    })
})
