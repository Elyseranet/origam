// #1173 — the playground EMBEDDED in a host page (`IPlaygroundProps.embedded`):
//
//   1. `isSingleComponentScene` — the pure rule, on the scene's SHAPE only:
//      embedded + one root without child; never without `embedded`.
//   2. Mounted `Playground`, the three cases the owner named:
//        standalone + 1 root  → Catalog and Scene visible, title shown;
//        embedded   + 1 root  → Catalog and Scene hidden, title removed;
//        embedded   + children → Scene visible again.
//      plus "Select in preview" only with more than one instance.
//
// What these read is the rendered markup (`data-cy`), not the computed flags.

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'

import { createOrigam } from '@origam/origam'

import Playground from '../../../playground/src/components/Playground/Playground.vue'
import { useComponentRegistry } from '../../../playground/src/composables/Registry/registry.composable'
import { SCENE_VERSION } from '../../../playground/src/consts/Commons/scene.const'
import { HOST_CATALOG_SEED } from '../../../playground/src/host/catalogSeed.const'
import type { IPlaygroundInstance } from '../../../playground/src/interfaces/Scene/playground-instance.interface'
import type { IPlaygroundScene } from '../../../playground/src/interfaces/Scene/playground-scene.interface'
import { isSingleComponentScene } from '../../../playground/src/utils/Commons/scene-instance.util'

const btn = (id: string): IPlaygroundInstance => ({ id, componentName: 'OrigamBtn', props: { text: id } })
const card = (id: string, children: IPlaygroundInstance[]): IPlaygroundInstance => ({ id, componentName: 'OrigamCard', props: {}, children: { default: children } })
const sceneOf = (roots: IPlaygroundInstance[]): IPlaygroundScene => ({ version: SCENE_VERSION, roots, selectedInstanceId: roots[0]?.id ?? null })

/* Metadata only — nothing is loaded, so every node stays unresolved; the chrome is what is tested. */
const registry = useComponentRegistry({ definitions: HOST_CATALOG_SEED, loaders: {} })

const mountPlayground = (scene: IPlaygroundScene, embedded?: boolean) => mount({
    render: () => h(Playground, { scene, registry, embedded })
}, { global: { plugins: [createOrigam()] }, attachTo: document.body })

const has = (wrapper: ReturnType<typeof mountPlayground>, cy: string) => wrapper.find(`[data-cy="${cy}"]`).exists()

describe('isSingleComponentScene (#1173)', () => {
    it('is true only when embedded, with one root and no child', () => {
        expect(isSingleComponentScene([btn('a')], true)).toBe(true)
        expect(isSingleComponentScene([btn('a')], false)).toBe(false)
        expect(isSingleComponentScene([], true)).toBe(false)
        expect(isSingleComponentScene([btn('a'), btn('b')], true)).toBe(false)
        expect(isSingleComponentScene([card('c', [btn('a')])], true)).toBe(false)
    })

    it('treats an empty child list as no child', () => {
        expect(isSingleComponentScene([{ ...btn('a'), children: { default: [] } }], true)).toBe(true)
    })
})

/*
 * One mount = a whole Playground, whose inspector renders every prop control of
 * the selected component. Measured: 0.3-0.7 s locally, 2.6-3.6 s per mount on the
 * CI runner (full suite in parallel, Node 24) — the former two-mount test took
 * 5.1 s there against vitest's 5 s default. One mount per test, and an explicit
 * budget sized on the measured CI worst case rather than a blind increase.
 */
const MOUNT_TEST_TIMEOUT_MS = 15_000

describe('Playground — embedded chrome (#1173)', { timeout: MOUNT_TEST_TIMEOUT_MS }, () => {
    it('standalone + 1 root: title, Catalog and Scene stay', () => {
        const wrapper = mountPlayground(sceneOf([btn('a')]))

        expect(has(wrapper, 'playground-title')).toBe(true)
        expect(has(wrapper, 'playground-catalog-open')).toBe(true)
        expect(wrapper.find('.pg-scene-tree').exists()).toBe(true)
        wrapper.unmount()
    })

    it('embedded + 1 root: no title, no Catalog, no Scene', () => {
        const wrapper = mountPlayground(sceneOf([btn('a')]), true)

        expect(has(wrapper, 'playground-title')).toBe(false)
        expect(has(wrapper, 'playground-catalog-open')).toBe(false)
        expect(wrapper.find('.pg-scene-tree').exists()).toBe(false)
        expect(has(wrapper, 'playground-inspector-toggle')).toBe(true)
        wrapper.unmount()
    })

    it('embedded + children: Scene and Catalog are back, the title stays removed', () => {
        const wrapper = mountPlayground(sceneOf([card('c', [btn('a')])]), true)

        expect(wrapper.find('.pg-scene-tree').exists()).toBe(true)
        expect(has(wrapper, 'playground-catalog-open')).toBe(true)
        expect(has(wrapper, 'playground-title')).toBe(false)
        wrapper.unmount()
    })

    it('"Select in preview" is absent with a single instance', () => {
        const single = mountPlayground(sceneOf([btn('a')]))
        expect(has(single, 'playground-select-mode-toggle')).toBe(false)
        single.unmount()
    })

    it('"Select in preview" is present with more than one instance', () => {
        const several = mountPlayground(sceneOf([card('c', [btn('a')])]))
        expect(has(several, 'playground-select-mode-toggle')).toBe(true)
        several.unmount()
    })

    it('the inspector carries no counter', () => {
        const wrapper = mountPlayground(sceneOf([btn('a')]))

        expect(has(wrapper, 'playground-prop-tally')).toBe(false)
        expect(wrapper.find('.pg-inspector__group-count').exists()).toBe(false)
        expect(wrapper.findAll('.pg-inspector__chip').filter(chip => /^\d+ (props|emits)$/.test(chip.text().trim()))).toHaveLength(0)
        expect(wrapper.findAll('.pg-inspector__group > summary').filter(summary => /\d/.test(summary.text()))).toHaveLength(0)
        wrapper.unmount()
    })
})
